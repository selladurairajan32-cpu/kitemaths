"use client";

import Link from "next/link";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { useState } from "react";
import { Confetti } from "@/components/kid/Celebrate";
import { Kip, KipSays } from "@/components/kid/Kip";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { skillMastery } from "@/engine/mastery";
import { STARS } from "@/engine/rewards";
import { playSound } from "@/lib/sound";
import {
  answerAssessment,
  clearAssessmentAnswer,
  finishAssessment,
  setAssessmentIndex,
  startAssessment,
  type TopicLearner,
} from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { routes } from "@/lib/routes";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import type { TopicModule } from "@/topics/types";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { Pic } from "@/components/paper/Pic";

export function independentResults(
  topic: TopicModule,
  order: string[],
  evaluations: TopicLearner["assessment"]["evaluations"],
  context: ItemResult["context"],
  at: number,
  idPrefix: string,
  responses: Record<string, unknown> = {},
): ItemResult[] {
  return order.map((id) => {
    const q = topic.questionById(id);
    const ev = evaluations[id];
    const response = responses[id];
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
      ...(response !== undefined ? { response } : {}),
      at,
    };
  });
}

/** Every item for this skill in the latest independent evidence was right. */
function latestOK(skill: string, results: ItemResult[]): boolean {
  const m = skillMastery(skill, results);
  return !!m.assessed && m.assessed.correct === m.assessed.total;
}

export function AssessmentScreen() {
  const hydrated = useHydrated();
  const { topic, learner, update: updateLearner } = useTopicState();
  const { areas: ASSESSMENT_AREAS, forms: ASSESSMENT_FORMS, formForAttempt } = topic.assessment;
  const [justFinished, setJustFinished] = useState(false);
  if (!hydrated) return <ScreenSkeleton />;

  const a = learner.assessment;

  if (a.status === "in-progress") {
    return (
      <AttemptRunner
        title="The big challenge"
        order={a.order}
        index={a.index}
        responses={a.responses}
        orderKey={`assess:${a.seed}`}
        onSave={(id, r, e) => updateLearner((s) => (r && e ? answerAssessment(s, id, r, e) : clearAssessmentAnswer(s, id)))}
        onIndex={(i) => updateLearner((s) => setAssessmentIndex(s, i))}
        onFinish={() => {
          const at = Date.now();
          updateLearner((s) =>
            finishAssessment(s, independentResults(topic, s.assessment.order, s.assessment.evaluations, "assessment", at, `assess:${s.assessment.seed}`, s.assessment.responses), at),
          );
          playSound("complete");
          setJustFinished(true);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  const last = a.last;
  const nextForm = formForAttempt(a.timesCompleted, last?.form);
  const items = ASSESSMENT_FORMS[nextForm];
  const lastScore = last ? Object.values(last.evaluations).filter((e) => e.correct).length : 0;

  const strongNow = last ? topic.skills.filter((sk) => latestOK(sk.id, learner.results)) : [];
  const revisit = last ? topic.skills.filter((sk) => !latestOK(sk.id, learner.results)) : [];

  const IntroTitle = justFinished && last ? "h2" : "h1";

  return (
    <section className="card relative mx-auto max-w-3xl p-6 sm:p-10">
      {justFinished && last && (
        <div className="relative -mx-2 mb-8 rounded-[28px] bg-ok-soft p-5 text-center sm:p-8">
          <Confetti burstKey={`check-${last.completedAt}`} pieces={70} />
          <div className="flex justify-center">
            <Kip mood="cheer" size={96} />
          </div>
          <h1 className="display mt-2 text-heading-2 sm:text-heading-1" tabIndex={-1} ref={(el) => el?.focus()}>
            Challenge complete!
          </h1>
          <p className="mt-1 text-lg text-ink-2">
            You got <strong className="text-ink">{lastScore}</strong> out of {last.order.length} — all by yourself.
          </p>
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-lg font-extrabold shadow-[var(--shadow-card)]">
            +{STARS.check} <Pic name="star" size={28} /> bonus stars
          </p>
          {strongNow.length > 0 && (
            <p className="mt-4 text-ink-2">
              <strong className="text-ok">Super strong:</strong> {strongNow.map((sk) => sk.title).join(", ")}.
            </p>
          )}
          {revisit.length > 0 && (
            <p className="mt-2 text-ink-2">
              <strong className="text-num-strong">Let&apos;s revisit:</strong> {revisit.map((sk) => sk.title).join(", ")} — Kip will help you practise these.
            </p>
          )}
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={routes.dashboard()} className={buttonClass("go", "xl")}>
              What&apos;s next? <ArrowRightIcon size={20} />
            </Link>
            <Link href={routes.badges()} className={buttonClass("secondary", "xl")}>
              My badges
            </Link>
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        <span className="grid size-20 shrink-0 place-items-center rounded-[24px] bg-tile-yellow" aria-hidden>
          <PaperIcon name="trophy" size={56} />
        </span>
        <div>
          {/* One h1 per screen: after a finish, the celebration above holds it. */}
          <IntroTitle className="display text-heading-2 sm:text-heading-1">The big challenge</IntroTitle>
        </div>
      </div>
      <KipSays mood="happy" tone="sky" className="mt-5" speak={`There are ${items.length} questions, two for every skill, and no hints. Take your time and do your best thinking. You'll earn ${STARS.check} bonus stars for finishing.`}>
        {items.length} questions — two for every skill — and <strong>no hints</strong>. Take your time and do your best thinking! Finishing earns{" "}
        <strong>{STARS.check} bonus stars</strong>.
      </KipSays>

      {last && (
        <div className="mt-6 flex flex-col gap-3 rounded-[20px] border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label text-ink-2">
            Last check:{" "}
            <strong className="text-ink">
              {lastScore} / {last.order.length}
            </strong>
            {last.completedAt && ` on ${new Date(last.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`}
          </p>
          <Link href={routes.review()} className={buttonClass("secondary", "md")}>
            Answer review (grown-ups)
          </Link>
        </div>
      )}

      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {ASSESSMENT_AREAS.map((area) => (
          <li key={area} className="flex items-center justify-between rounded-[16px] bg-paper px-4 py-3 text-label">
            {area}
            <span className="text-muted">{items.filter((q) => q.area === area).length} questions</span>
          </li>
        ))}
      </ul>
      <ul className="mt-6 space-y-1.5 text-label text-ink-2">
        <li>• Take your time — there&apos;s no timer.</li>
        <li>• You can skip a question and come back to it, and change any answer before you finish.</li>
        <li>• Your answers are saved on this device as you go.</li>
        {last && <li>• A retake uses different numbers and pictures from your last check.</li>}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="go"
          size="xl"
          onClick={() => {
            setJustFinished(false);
            const seed = Date.now();
            updateLearner((s) => startAssessment(s, ASSESSMENT_FORMS[nextForm].map((q) => q.id), nextForm, seed, seed));
          }}
        >
          {last ? "Try the challenge again" : "I'm ready!"} <ArrowRightIcon size={20} />
        </Button>
      </div>
    </section>
  );
}
