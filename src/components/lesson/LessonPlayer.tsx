"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Confetti, StarGlyph } from "@/components/kid/Celebrate";
import { PAPER, PaperIcon } from "@/components/paper/PaperIcon";
import { Kip, KipSays } from "@/components/kid/Kip";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { completeLabChallenge, completeLesson, goToStep, recordResult } from "@/engine/progress";
import { playSound } from "@/lib/sound";
import { updateTopic } from "@/lib/store";
import { STARS } from "@/engine/rewards";
import type { Lesson, LessonStep } from "@/lessons/types";
import { useTopicState } from "@/topics/context";
import { WorkedExample } from "./WorkedExample";

const plain = (t: string) => t.replace(/\{(\d+)\/(\d+)\}/g, "$1/$2").replace(/\*\*/g, "");

function StepHeading({ title, focus }: { title: string; focus: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <h1 id="step-title" ref={ref} tabIndex={-1} className="display text-[1.75rem] outline-none sm:text-[2rem]">
      <RichText text={title} />
    </h1>
  );
}

/** One bow on the kite tail: green once done, red for where you are, paper white ahead. */
function Bow({ state }: { state: "done" | "here" | "ahead" }) {
  const fill = state === "done" ? PAPER.leaf : state === "here" ? PAPER.red : PAPER.white;
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" className="shrink-0" aria-hidden>
      <path d="M13 9 L3 2 V16 Z M13 9 L23 2 V16 Z" fill={fill} stroke={PAPER.ink} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** Lesson progress as a kite tail: one bow per step. Done bows are green, the current one is red. */
function StepTail({ total, current, currentDone, className = "" }: { total: number; current: number; currentDone: boolean; className?: string }) {
  return (
    <ol className={`flex items-center ${className}`} aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const done = i < current || (i === current && currentDone);
        return (
          <li key={i} className="flex flex-1 items-center">
            <span className="h-0.5 flex-1 bg-ink/40" aria-hidden />
            <Bow state={done ? "done" : i === current ? "here" : "ahead"} />
          </li>
        );
      })}
    </ol>
  );
}

export function LessonPlayer({ lesson, urlStep }: { lesson: Lesson; urlStep?: number }) {
  const { topic, learner, update: updateLearner, links } = useTopicState();
  const LESSONS = topic.lessons;
  const { Visual, LabStep } = topic.ui;
  const lessonLook = topic.lessonLook;
  const progress = learner.lessons[lesson.id];
  const furthest = progress?.furthestStep ?? 0;
  const savedStep = Math.min(progress?.step ?? 0, lesson.steps.length - 1);
  const reachable = (i: number) => i <= furthest || !!progress?.completed;
  const [doneNow, setDoneNow] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [retryStep, setRetryStep] = useState<number | null>(null);
  const [focusStep, setFocusStep] = useState(false);
  const [wasCompleted] = useState(() => !!progress?.completed);

  const stepIndex = savedStep;
  const step = lesson.steps[stepIndex];
  const usedFollowUps = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);

  const appliedUrlStep = useRef(false);
  useEffect(() => {
    if (appliedUrlStep.current) return;
    appliedUrlStep.current = true;
    const requested = urlStep !== undefined && urlStep >= 0 && urlStep < lesson.steps.length && reachable(urlStep) ? urlStep : null;
    updateLearner((s) => goToStep(s, lesson.id, requested ?? Math.min(s.lessons[lesson.id]?.step ?? 0, lesson.steps.length - 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    const target = finished ? links.lesson(lesson.id) : links.lesson(lesson.id, stepIndex);
    if (window.location.pathname !== target) window.history.replaceState(window.history.state, "", target);
  }, [lesson.id, stepIndex, finished, links]);

  const labDone = (s: LessonStep) => s.type === "lab" && (topic.ui.isLabStepDone?.(s, learner.labChallenges) ?? true);

  const isStepDone = (i: number) => {
    const s = lesson.steps[i];
    if (s.type === "explain") return true;
    if (s.type === "lab") return labDone(s);
    return doneNow.has(i) || i < furthest || !!progress?.completed;
  };

  const markDone = useCallback((i: number) => setDoneNow((d) => new Set(d).add(i)), []);

  const go = (i: number) => {
    setFocusStep(true);
    updateLearner((s) => goToStep(s, lesson.id, i));
  };

  const advance = () => {
    if (stepIndex < lesson.steps.length - 1) {
      go(stepIndex + 1);
    } else {
      updateLearner((s) => completeLesson(s, lesson.id, Date.now()));
      playSound("complete");
      setFinished(true);
    }
  };

  const onCheckComplete = (r: ResultDraft) => {
    updateLearner((s) => recordResult(s, { ...r, at: Date.now() }));
    markDone(stepIndex);
    advance();
  };

  const onLabChallenge = useCallback((id: string) => updateTopic(topic.id, (s) => completeLabChallenge(s, id)), [topic.id]);

  const lessonIndex = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS[lessonIndex + 1];

  if (finished) {
    const firstTime = !wasCompleted;
    return (
      <div className="relative mx-auto max-w-2xl pt-4 sm:pt-10">
        <Confetti burstKey={`lesson-${lesson.id}`} pieces={36} />
        <div className="flex items-end gap-5">
          <Kip mood="cheer" size={96} />
          <div className="min-w-0 pb-3">
            <h1 className="display text-[2rem]" tabIndex={-1} ref={(el) => el?.focus()}>
              Lesson complete
            </h1>
            <p className="mt-1 text-ink-2">{lesson.title}</p>
          </div>
        </div>
        {firstTime && (
          <p className="mt-6 flex items-center gap-2 text-xl font-semibold text-ink">
            <StarGlyph size={26} /> +{STARS.lesson} bonus stars
          </p>
        )}
        <section className="mt-6 rounded-[16px] bg-surface p-5 sm:p-6" aria-labelledby="can-now">
          <h2 id="can-now" className="text-lg font-semibold">
            Now you can
          </h2>
          <ul className="mt-3 space-y-2.5">
            {lesson.objectives.map((o) => (
              <li key={o} className="flex items-start gap-3 text-ink-2">
                <CheckIcon size={20} strokeWidth={3} className="mt-1 shrink-0 text-ok" />
                {o}
              </li>
            ))}
          </ul>
        </section>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {nextLesson ? (
            <Link href={links.lesson(nextLesson.id)} className={buttonClass("primary", "xl")}>
              Next: {nextLesson.title} <ArrowRightIcon size={20} />
            </Link>
          ) : (
            <Link href={links.practice()} className={buttonClass("primary", "xl")}>
              Start practice <ArrowRightIcon size={20} />
            </Link>
          )}
          <Link href={links.island()} className={buttonClass("secondary", "xl")}>
            Back to the island
          </Link>
        </div>
      </div>
    );
  }

  const canContinue = isStepDone(stepIndex);
  const checkAlreadyDone = step.type === "check" && isStepDone(stepIndex) && !doneNow.has(stepIndex) && retryStep !== stepIndex;
  const isLast = stepIndex === lesson.steps.length - 1;
  const urlStepLocked = urlStep !== undefined && urlStep < lesson.steps.length && !reachable(urlStep) && stepIndex < urlStep;

  const stepList = (onPick?: () => void) => (
    <ol className="relative">
      <span className="absolute bottom-6 left-[1.5rem] top-6 w-0.5 bg-ink/40" aria-hidden />
      {lesson.steps.map((s, i) => {
        const canOpen = i <= Math.max(furthest, stepIndex) || !!progress?.completed;
        const active = i === stepIndex;
        const done = !active && isStepDone(i) && canOpen && i < Math.max(furthest, stepIndex) + 1;
        return (
          <li key={i} className="relative">
            <button
              type="button"
              disabled={!canOpen}
              onClick={() => {
                go(i);
                onPick?.();
              }}
              aria-current={active ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${plain(s.title)}${done ? " (completed)" : active ? " (current)" : !canOpen ? " (not reached yet)" : ""}`}
              className={`flex min-h-12 w-full items-center gap-3 rounded-[16px] px-3 py-2 text-left text-base transition-colors ${
                active ? "bg-surface font-semibold text-ink" : canOpen ? "text-ink-2 hover:bg-sunk" : "text-muted"
              }`}
            >
              <Bow state={done ? "done" : active ? "here" : "ahead"} />
              <span className="min-w-0 leading-snug" aria-hidden>
                <RichText text={s.title} compact />
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="mb-4 flex items-center gap-3">
          <PaperIcon name={lessonLook(lesson.id).icon} size={44} />
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight text-ink">{lesson.title}</p>
            <p className="text-label text-muted">
              Lesson {lessonIndex + 1} of {LESSONS.length} · step {stepIndex + 1} of {lesson.steps.length}
            </p>
          </div>
        </div>
        <StepTail total={lesson.steps.length} current={stepIndex} currentDone={canContinue} className="lg:hidden" />
        <nav aria-label="Lesson steps" className="hidden lg:block">
          {stepList()}
        </nav>
      </aside>

      <section className="min-w-0 max-w-[720px]" aria-labelledby="step-title">
        {urlStepLocked && (
          <p role="status" className="mb-5 rounded-[18px] bg-den-soft px-4 py-3 text-base text-ink-2">
            Step {urlStep! + 1} opens once you&apos;ve worked through the steps before it, so you&apos;re carrying on from step {stepIndex + 1}.
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lesson.id}-${stepIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={step.type === "check" ? "space-y-6" : "space-y-6 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8"}
          >
            <header>
              <div className="flex items-start justify-between gap-3">
                <StepHeading title={step.title} focus={focusStep} />
                {step.type === "explain" && <ReadAloud text={[step.title, ...step.body, step.tip ?? ""].join(". ")} size="lg" label="Read this to me" />}
              </div>
            </header>

            {step.type === "explain" && (
              <>
                <div className="max-w-2xl space-y-3 text-lg leading-relaxed text-ink-2">
                  {step.body.map((p) => (
                    <p key={p}>
                      <RichText text={p} />
                    </p>
                  ))}
                </div>
                {step.visual !== undefined && (
                  <div className="flex justify-center rounded-[22px] bg-raised px-3 py-6 sm:px-6 sm:py-8">
                    <Visual spec={step.visual} />
                  </div>
                )}
                {step.tip && (
                  <KipSays mood="happy" tone="sun" size={56}>
                    <RichText text={step.tip} />
                  </KipSays>
                )}
              </>
            )}

            {step.type === "worked" && <WorkedExample key={stepIndex} step={step} onComplete={() => markDone(stepIndex)} />}

            {step.type === "lab" && (
              <>
                <div className="max-w-2xl space-y-2 text-ink-2">
                  {step.body.map((p) => (
                    <p key={p}>
                      <RichText text={p} />
                    </p>
                  ))}
                </div>
                {LabStep && <LabStep step={step} completed={learner.labChallenges} onChallengeComplete={onLabChallenge} />}
              </>
            )}

            {step.type === "check" &&
              (checkAlreadyDone ? (
                <div className="flex flex-col items-start gap-3 rounded-[24px] bg-ok-soft p-5 sm:p-6">
                  <p className="flex items-center gap-2 font-semibold text-ok">
                    <CheckIcon size={18} /> You&apos;ve already completed this check.
                  </p>
                  <Button variant="secondary" onClick={() => setRetryStep(stepIndex)}>
                    Try it again
                  </Button>
                </div>
              ) : (
                <>
                  {step.intro && <p className="text-lg text-ink-2">{step.intro}</p>}
                  <QuestionPlayer
                    key={`${step.questionId}-${retryStep === stepIndex ? "retry" : "first"}`}
                    question={topic.questionById(step.questionId)}
                    context="lesson"
                    usedFollowUps={usedFollowUps}
                    orderKey={`lesson:${lesson.id}`}
                    onComplete={onCheckComplete}
                    onFollowUpResult={(r) => updateLearner((s) => recordResult(s, { ...r, at: Date.now() }))}
                    continueLabel={isLast ? "Finish lesson" : "Continue"}
                  />
                </>
              ))}
          </motion.div>
        </AnimatePresence>

        <footer className={`${step.type === "check" && !checkAlreadyDone ? "" : "sticky bottom-0"} z-10 -mx-4 mt-8 flex items-center justify-between gap-3 border-t border-line bg-paper px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:px-0 lg:pb-0 lg:pt-6`}>
          <Button variant="quiet" size="lg" onClick={() => go(stepIndex - 1)} disabled={stepIndex === 0}>
            <ArrowLeftIcon size={18} /> Back
          </Button>
          {(step.type !== "check" || checkAlreadyDone) && (
            <Button size="xl" onClick={advance} disabled={!canContinue} className="min-w-0 flex-1 sm:flex-none">
              {isLast ? "Finish lesson" : "Continue"} <ArrowRightIcon size={20} />
            </Button>
          )}
          {step.type === "check" && !checkAlreadyDone && <span className="text-base text-muted">Answer to carry on</span>}
        </footer>
        {!canContinue && step.type === "lab" && <p className="mt-2 text-right text-base text-muted">Check each challenge to carry on.</p>}
        {!canContinue && step.type === "worked" && <p className="mt-2 text-right text-base text-muted">Work through every step to carry on.</p>}
      </section>
    </div>
  );
}
