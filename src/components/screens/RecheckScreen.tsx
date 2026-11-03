"use client";

import Link from "next/link";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/ui/Progress";
import { skillMastery } from "@/engine/mastery";
import { answerRecheck, cancelRecheck, finishRecheck, setRecheckIndex, startRecheck, type TopicLearner } from "@/engine/progress";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import type { TopicModule } from "@/topics/types";
import { independentResults } from "./AssessmentScreen";
import { ScreenSkeleton } from "@/components/ui/Screen";

/** Two fresh questions for one skill, from the form the learner saw least recently. */
export function recheckPlan(topic: TopicModule, skill: string, state: TopicLearner): { form: string; order: string[] } {
  const forms = Object.keys(topic.assessment.forms);
  const seen = state.rechecks[skill]?.form ?? state.assessment.last?.form ?? forms[forms.length - 1];
  const form = forms.find((f) => f !== seen) ?? forms[0];
  return { form, order: topic.assessment.forms[form].filter((q) => q.skill === skill).map((q) => q.id) };
}

export function RecheckScreen({ skill }: { skill: string }) {
  const hydrated = useHydrated();
  const { topic, learner, update: updateLearner, links: routes } = useTopicState();
  const skillById = topic.skillById;
  if (!hydrated) return <ScreenSkeleton />;

  const info = skillById(skill);
  const r = learner.recheck;
  const m = skillMastery(skill, learner.results);

  if (r && r.skill === skill) {
    return (
      <AttemptRunner
        title={`Recheck: ${info.title}`}
        order={r.order}
        index={r.index}
        responses={r.responses}
        orderKey={`recheck:${r.seed}`}
        onSave={(id, resp, e) => updateLearner((s) => answerRecheck(s, id, resp, e))}
        onIndex={(i) => updateLearner((s) => setRecheckIndex(s, i))}
        onFinish={() => {
          const at = Date.now();
          updateLearner((s) => (s.recheck ? finishRecheck(s, independentResults(topic, s.recheck.order, s.recheck.evaluations, "recheck", at, `recheck:${s.recheck.seed}`), at) : s));
        }}
      />
    );
  }

  const last = learner.rechecks[skill];
  const justFinished = last?.completedAt && m.assessed?.context === "recheck" && m.assessed.at === last.completedAt;

  return (
    <section className="card mx-auto max-w-2xl p-6 sm:p-10">
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-mint to-sky text-4xl shadow-[0_4px_0_#1597a0]" aria-hidden>
          <PaperIcon name="recheck" size={40} />
        </span>
        <div>
          <p className="eyebrow">Quick recheck</p>
          <h1 className="display text-3xl">{info.title}</h1>
        </div>
      </div>

      {r && r.skill !== skill ? (
        <>
          <p className="mt-3 text-ink-2">You have an unfinished recheck for {skillById(r.skill).title.toLowerCase()}.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={routes.recheck(r.skill)} className={buttonClass("primary", "lg")}>
              Resume that recheck
            </Link>
            <Button variant="secondary" size="lg" onClick={() => updateLearner(cancelRecheck)}>
              Discard it
            </Button>
          </div>
        </>
      ) : (
        <>
          {justFinished && m.assessed && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper p-4" aria-live="polite">
              <p className="text-ink-2">
                Recheck result:{" "}
                <strong className="text-ink">
                  {m.assessed.correct} / {m.assessed.total}
                </strong>
              </p>
              <StatusBadge status={m.status} />
            </div>
          )}
          <p className="mt-3 text-ink-2">
            {skillById(skill).description} This short recheck has 2 new questions, no hints and no feedback until the end. It replaces this skill&apos;s
            mastery-check evidence with the newer result.
          </p>
          {m.status === "passed-check" && !m.learningSecure && (
            <p className="mt-3 rounded-xl bg-violet-soft px-4 py-3 text-[0.9375rem] text-ink-2">
              To reach “Mastered”, this skill also needs secure practice (at least 3 recent answers, mostly right first time).
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="go"
              size="xl"
              onClick={() => {
                const seed = Date.now();
                updateLearner((s) => {
                  const plan = recheckPlan(topic, skill, s);
                  return startRecheck(s, skill, plan.order, plan.form, seed, seed);
                });
              }}
            >
              {justFinished ? "Recheck again" : "Start the recheck"} <ArrowRightIcon size={18} />
            </Button>
            <Link href={routes.practice(skill)} className={buttonClass("secondary", "xl")}>
              Practise first
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
