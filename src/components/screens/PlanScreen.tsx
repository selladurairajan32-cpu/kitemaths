"use client";

import Link from "next/link";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { DEFAULT_PLAN, setSettings } from "@/engine/progress";
import { updateLearner, useHydrated, useLearner, useNow } from "@/lib/store";
import { ESTIMATED_MINUTES, PLAN_KIND_LABEL, weeklyPlan, type PlanKind } from "@/topics/plan";

/**
 * PARENT-003: the weekly learning plan. A manageable mix from the evidence, with the reason for each item, and a
 * workload the grown-up sets (days a week, minutes a day).
 */
export function PlanScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;
  const days = learner.settings.planDays ?? DEFAULT_PLAN.days;
  const minutes = learner.settings.planMinutes ?? DEFAULT_PLAN.minutes;
  const plan = weeklyPlan(learner, now, days, minutes);
  const totals = new Map<PlanKind, number>();
  for (const it of plan.flatMap((d) => d.items)) totals.set(it.kind, (totals.get(it.kind) ?? 0) + it.minutes);
  const name = learner.profile.name.trim();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted">Weekly plan</p>
        <h1 className="display text-heading-2 sm:text-heading-1">{name ? `${name}'s week` : "This week's plan"}</h1>
        <p className="mt-1 max-w-3xl text-ink-2">
          Built from what your child has done so far. Review comes first when a check has flagged a skill; then new learning, times tables, mental maths and
          problem solving take turns. Change the workload and the plan follows.
        </p>
      </header>

      <section className="card p-5 sm:p-7" aria-labelledby="load-title">
        <h2 id="load-title" className="text-title font-extrabold">
          Workload
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block text-label">
            <span className="font-medium">Days a week</span>
            <select value={days} onChange={(e) => updateLearner((s) => setSettings(s, { planDays: Number(e.target.value) }))} className="mt-1 h-11 w-full rounded-[16px] border-2 border-line-strong bg-surface px-3">
              {[3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </label>
          <label className="block text-label">
            <span className="font-medium">Minutes a day</span>
            <select value={minutes} onChange={(e) => updateLearner((s) => setSettings(s, { planMinutes: Number(e.target.value) }))} className="mt-1 h-11 w-full rounded-[16px] border-2 border-line-strong bg-surface px-3">
              {[10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-label text-muted">
          This week: {[...totals.entries()].map(([k, v]) => `${PLAN_KIND_LABEL[k]} ${v} min`).join(" · ")}. Lesson times come from the lessons; practice
          sessions are estimates ({ESTIMATED_MINUTES.practice} minutes for a practice, {ESTIMATED_MINUTES.facts} for times-table facts), not measured.
        </p>
      </section>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plan.map((d) => (
          <li key={d.label} className="card p-5">
            <h2 className="text-title font-extrabold">
              {d.label} <span className="text-label font-semibold text-muted">· {d.minutes} min</span>
            </h2>
            {d.items.length === 0 ? (
              <p className="mt-2 text-body text-ink-2">A rest day.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {d.items.map((it) => (
                  <li key={it.title}>
                    <p className="text-label font-bold text-muted">{PLAN_KIND_LABEL[it.kind]} · {it.minutes} min</p>
                    <Link href={it.href} className="font-semibold text-den underline underline-offset-2">
                      {it.title}
                    </Link>
                    <p className="text-label text-ink-2">{it.why}</p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
