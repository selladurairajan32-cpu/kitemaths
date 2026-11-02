"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, FlagIcon } from "@/components/ui/Icons";
import {
  answerAssessment,
  clearAssessmentAnswer,
  finishAssessment,
  setAssessmentIndex,
  startAssessment,
  type LearnerState,
} from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { routes } from "@/lib/routes";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { ASSESSMENT_AREAS, ASSESSMENT_FORMS, formForAttempt, questionById, type AssessmentForm } from "@/topics/fractions/questions";
import { ScreenSkeleton } from "./DashboardScreen";

export function independentResults(
  order: string[],
  evaluations: LearnerState["assessment"]["evaluations"],
  context: ItemResult["context"],
  at: number,
  idPrefix: string,
): ItemResult[] {
  return order.map((id) => {
    const q = questionById(id);
    const ev = evaluations[id];
    return {
      id: `${idPrefix}:${id}`,
      questionId: id,
      skill: q.skill,
      context,
      difficulty: q.difficulty,
      correct: !!ev?.correct,
      firstTry: !!ev?.correct,
      attempts: ev ? 1 : 0,
      hintsUsed: 0,
      misconceptions: ev?.misconceptions ?? [],
      at,
    };
  });
}

export function AssessmentScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const router = useRouter();
  if (!hydrated) return <ScreenSkeleton />;

  const a = learner.assessment;

  if (a.status === "in-progress") {
    return (
      <AttemptRunner
        title="Fractions mastery check"
        order={a.order}
        index={a.index}
        responses={a.responses}
        orderKey={`assess:${a.seed}`}
        onSave={(id, r, e) => updateLearner((s) => (r && e ? answerAssessment(s, id, r, e) : clearAssessmentAnswer(s, id)))}
        onIndex={(i) => updateLearner((s) => setAssessmentIndex(s, i))}
        onFinish={() => {
          const at = Date.now();
          updateLearner((s) =>
            finishAssessment(s, independentResults(s.assessment.order, s.assessment.evaluations, "assessment", at, `assess:${s.assessment.seed}`), at),
          );
          router.push(routes.review());
        }}
      />
    );
  }

  const last = a.last;
  const nextForm: AssessmentForm = formForAttempt(a.timesCompleted, last?.form);
  const items = ASSESSMENT_FORMS[nextForm];
  const lastScore = last ? Object.values(last.evaluations).filter((e) => e.correct).length : 0;

  return (
    <section className="card mx-auto max-w-3xl p-6 sm:p-10">
      <span className="grid size-12 place-items-center rounded-2xl bg-ink text-white">
        <FlagIcon size={22} />
      </span>
      <p className="eyebrow mt-5">Master</p>
      <h1 className="display mt-1 text-3xl font-semibold sm:text-4xl">Fractions mastery check</h1>
      <p className="mt-3 max-w-xl text-ink-2">
        A chance to show what you know on your own. There are {items.length} questions — two for every skill — and <strong>no hints</strong>. You&apos;ll see how
        you did at the end, with every question explained.
      </p>

      {last && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-2">
            Last check:{" "}
            <strong className="text-ink">
              {lastScore} / {last.order.length}
            </strong>
            {last.completedAt && ` on ${new Date(last.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`}
          </p>
          <Link href={routes.review()} className={buttonClass("secondary", "md")}>
            Review last answers
          </Link>
        </div>
      )}

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {ASSESSMENT_AREAS.map((area) => (
          <li key={area} className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 text-sm">
            {area}
            <span className="text-muted">{items.filter((q) => q.area === area).length} questions</span>
          </li>
        ))}
      </ul>
      <ul className="mt-6 space-y-1.5 text-sm text-ink-2">
        <li>• Take your time — there&apos;s no timer.</li>
        <li>• You can skip a question and come back to it, and change any answer before you finish.</li>
        <li>• Your answers are saved on this device as you go.</li>
        {last && <li>• A retake uses different numbers and pictures from your last check.</li>}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          size="lg"
          onClick={() => {
            const seed = Date.now();
            updateLearner((s) => startAssessment(s, ASSESSMENT_FORMS[nextForm].map((q) => q.id), nextForm, seed, seed));
          }}
        >
          {last ? "Retake the mastery check" : "Start the mastery check"} <ArrowRightIcon size={18} />
        </Button>
        {last && (
          <Link href={routes.results()} className={buttonClass("secondary", "lg")}>
            See my results
          </Link>
        )}
      </div>
    </section>
  );
}
