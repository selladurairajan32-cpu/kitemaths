"use client";

import Link from "next/link";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, FlagIcon } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/ui/Progress";
import { skillMastery } from "@/engine/mastery";
import { answerRecheck, cancelRecheck, finishRecheck, setRecheckIndex, startRecheck, type LearnerState } from "@/engine/progress";
import { routes } from "@/lib/routes";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { ASSESSMENT_FORMS, type AssessmentForm } from "@/topics/fractions/questions";
import { skillById } from "@/topics/fractions/skills";
import { independentResults } from "./AssessmentScreen";
import { ScreenSkeleton } from "./DashboardScreen";

export function recheckPlan(skill: string, state: LearnerState): { form: AssessmentForm; order: string[] } {
  const seen = state.rechecks[skill]?.form ?? state.assessment.last?.form ?? "B";
  const form: AssessmentForm = seen === "A" ? "B" : "A";
  return { form, order: ASSESSMENT_FORMS[form].filter((q) => q.skill === skill).map((q) => q.id) };
}

export function RecheckScreen({ skill }: { skill: string }) {
  const hydrated = useHydrated();
  const learner = useLearner();
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
          updateLearner((s) => (s.recheck ? finishRecheck(s, independentResults(s.recheck.order, s.recheck.evaluations, "recheck", at, `recheck:${s.recheck.seed}`), at) : s));
        }}
      />
    );
  }

  const last = learner.rechecks[skill];
  const justFinished = last?.completedAt && m.assessed?.context === "recheck" && m.assessed.at === last.completedAt;

  return (
    <section className="card mx-auto max-w-2xl p-6 sm:p-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
        <FlagIcon size={22} />
      </span>
      <p className="eyebrow mt-5">Independent recheck</p>
      <h1 className="display mt-1 text-3xl font-semibold">{info.title}</h1>

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
            <p className="mt-3 rounded-xl bg-violet-soft px-4 py-3 text-sm text-ink-2">
              To reach “Mastered”, this skill also needs secure practice (at least 3 recent answers, mostly right first time).
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => {
                const seed = Date.now();
                updateLearner((s) => {
                  const plan = recheckPlan(skill, s);
                  return startRecheck(s, skill, plan.order, plan.form, seed, seed);
                });
              }}
            >
              {justFinished ? "Recheck again" : "Start the recheck"} <ArrowRightIcon size={18} />
            </Button>
            <Link href={routes.practice(skill)} className={buttonClass("secondary", "lg")}>
              Practise first
            </Link>
            <Link href={routes.results()} className={buttonClass("ghost", "lg")}>
              Results
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
