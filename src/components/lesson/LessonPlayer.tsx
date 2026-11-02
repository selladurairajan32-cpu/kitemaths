"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { VisualRenderer } from "@/components/math/Visuals";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, BeakerIcon, BulbIcon, CheckIcon, FlagIcon, StarIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import { completeLabChallenge, completeLesson, goToStep, recordResult } from "@/engine/progress";
import { routes } from "@/lib/routes";
import { updateLearner, useLearner } from "@/lib/store";
import { LESSONS, type Lesson, type LessonStep } from "@/topics/fractions/lessons";
import { questionById } from "@/topics/fractions/questions";
import { FractionLab } from "./FractionLab";
import { WorkedExample } from "./WorkedExample";

const STEP_KIND: Record<LessonStep["type"], { label: string; icon: React.ReactNode }> = {
  explain: { label: "Learn", icon: <BulbIcon size={15} /> },
  worked: { label: "Example", icon: <StarIcon size={15} /> },
  lab: { label: "Explore", icon: <BeakerIcon size={15} /> },
  check: { label: "Your turn", icon: <FlagIcon size={15} /> },
};

const plain = (t: string) => t.replace(/\{(\d+)\/(\d+)\}/g, "$1/$2").replace(/\*\*/g, "");

function StepHeading({ title, focus }: { title: string; focus: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);
  return (
    <h2 id="step-title" ref={ref} tabIndex={-1} className="display text-2xl font-semibold leading-tight outline-none sm:text-[1.75rem]">
      <RichText text={title} />
    </h2>
  );
}

export function LessonPlayer({ lesson, urlStep }: { lesson: Lesson; urlStep?: number }) {
  const learner = useLearner();
  const progress = learner.lessons[lesson.id];
  const furthest = progress?.furthestStep ?? 0;
  const savedStep = Math.min(progress?.step ?? 0, lesson.steps.length - 1);
  const reachable = (i: number) => i <= furthest || !!progress?.completed;
  const [doneNow, setDoneNow] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [retryStep, setRetryStep] = useState<number | null>(null);
  const [focusStep, setFocusStep] = useState(false);

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
    const target = finished ? routes.lesson(lesson.id) : routes.lesson(lesson.id, stepIndex);
    if (window.location.pathname !== target) window.history.replaceState(window.history.state, "", target);
  }, [lesson.id, stepIndex, finished]);

  const labDone = (s: LessonStep) => s.type === "lab" && s.challenges.every((c) => learner.labChallenges.includes(c.id));

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
      setFinished(true);
    }
  };

  const onCheckComplete = (r: ResultDraft) => {
    updateLearner((s) => recordResult(s, { ...r, at: Date.now() }));
    markDone(stepIndex);
    advance();
  };

  const onLabChallenge = useCallback((id: string) => updateLearner((s) => completeLabChallenge(s, id)), []);

  const lessonIndex = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS[lessonIndex + 1];

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mx-auto max-w-2xl p-6 text-center sm:p-10">
        <motion.div
          initial={{ scale: 0.6, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-ok text-white"
        >
          <CheckIcon size={30} />
        </motion.div>
        <p className="eyebrow">Lesson complete</p>
        <h2 className="display mt-1 text-3xl font-semibold" tabIndex={-1} ref={(el) => el?.focus()}>
          {lesson.title}
        </h2>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {lesson.objectives.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-ink-2">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-ok-soft text-ok">
                <CheckIcon size={13} />
              </span>
              {o}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {nextLesson ? (
            <Link href={routes.lesson(nextLesson.id)} className={buttonClass("primary", "lg")}>
              Next: {nextLesson.title} <ArrowRightIcon size={18} />
            </Link>
          ) : (
            <Link href={routes.practice()} className={buttonClass("primary", "lg")}>
              Go to the Practice Centre <ArrowRightIcon size={18} />
            </Link>
          )}
          <Link href={routes.journey()} className={buttonClass("secondary", "lg")}>
            See my journey
          </Link>
        </div>
      </motion.div>
    );
  }

  const canContinue = isStepDone(stepIndex);
  const checkAlreadyDone = step.type === "check" && isStepDone(stepIndex) && !doneNow.has(stepIndex) && retryStep !== stepIndex;
  const isLast = stepIndex === lesson.steps.length - 1;
  const urlStepLocked = urlStep !== undefined && urlStep < lesson.steps.length && !reachable(urlStep) && stepIndex < urlStep;

  const stepList = (onPick?: () => void) => (
    <ol className="space-y-1">
      {lesson.steps.map((s, i) => {
        const canOpen = i <= Math.max(furthest, stepIndex) || !!progress?.completed;
        const active = i === stepIndex;
        const done = !active && isStepDone(i) && canOpen && i < Math.max(furthest, stepIndex) + 1;
        return (
          <li key={i}>
            <button
              type="button"
              disabled={!canOpen}
              onClick={() => {
                go(i);
                onPick?.();
              }}
              aria-current={active ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${plain(s.title)}${done ? " (completed)" : active ? " (current)" : !canOpen ? " (not reached yet)" : ""}`}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                active ? "bg-surface font-medium shadow-[var(--shadow-card)] ring-1 ring-line" : canOpen ? "hover:bg-sunk" : "text-muted/70"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full ${done ? "bg-ok text-white" : active ? "bg-ink text-white" : "bg-sunk text-muted"}`}
                aria-hidden
              >
                {done ? <CheckIcon size={14} /> : STEP_KIND[s.type].icon}
              </span>
              <span className="min-w-0" aria-hidden>
                <span className="block text-[0.7rem] uppercase tracking-wide text-muted">{STEP_KIND[s.type].label}</span>
                <span className="block leading-snug">
                  <RichText text={s.title} />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3">
          <p className="eyebrow">
            Lesson {lessonIndex + 1} of {LESSONS.length} · {lesson.phase}
          </p>
          <p className="font-semibold">{lesson.title}</p>
        </div>
        <details className="group rounded-2xl border border-line bg-surface lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 text-sm">
            <span>
              Step {stepIndex + 1} of {lesson.steps.length}: <span className="font-medium">{plain(step.title)}</span>
            </span>
            <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>
              ›
            </span>
          </summary>
          <nav aria-label="Lesson steps" className="border-t border-line p-2">
            {stepList(() => {
              const d = document.activeElement?.closest("details");
              if (d) d.open = false;
            })}
          </nav>
        </details>
        <ProgressBar value={(stepIndex + (canContinue ? 1 : 0)) / lesson.steps.length} label="Lesson progress" className="mt-3 lg:hidden" />
        <nav aria-label="Lesson steps" className="hidden lg:block">
          {stepList()}
        </nav>
      </aside>

      <section className="card min-w-0 p-5 sm:p-8" aria-labelledby="step-title">
        {urlStepLocked && (
          <p role="status" className="mb-5 rounded-xl border border-den/25 bg-den-soft px-4 py-3 text-sm text-ink-2">
            Step {urlStep! + 1} opens once you&apos;ve worked through the steps before it, so you&apos;re carrying on from step {stepIndex + 1}.
          </p>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${lesson.id}-${stepIndex}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-6"
          >
            <header className="space-y-1.5">
              <p className="flex items-center gap-2 text-sm font-medium text-muted">
                {STEP_KIND[step.type].icon} {STEP_KIND[step.type].label}
                <span className="text-line-strong">·</span> Step {stepIndex + 1} of {lesson.steps.length}
              </p>
              <StepHeading title={step.title} focus={focusStep} />
            </header>

            {step.type === "explain" && (
              <>
                <div className="max-w-2xl space-y-3 text-[1.05rem] leading-relaxed text-ink-2">
                  {step.body.map((p) => (
                    <p key={p}>
                      <RichText text={p} />
                    </p>
                  ))}
                </div>
                {step.visual && (
                  <div className="flex justify-center rounded-2xl bg-paper px-3 py-5 sm:px-6 sm:py-8">
                    <VisualRenderer spec={step.visual} />
                  </div>
                )}
                {step.tip && (
                  <p className="flex gap-2.5 rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-sm text-ink-2">
                    <BulbIcon size={18} className="mt-0.5 shrink-0 text-warn" />
                    <span>
                      <strong className="text-ink">Tip: </strong>
                      <RichText text={step.tip} />
                    </span>
                  </p>
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
                <FractionLab modes={[step.mode]} challenges={step.challenges} completed={learner.labChallenges} onChallengeComplete={onLabChallenge} />
              </>
            )}

            {step.type === "check" &&
              (checkAlreadyDone ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl bg-ok-soft p-5">
                  <p className="flex items-center gap-2 font-medium text-ok">
                    <CheckIcon size={18} /> You&apos;ve already completed this check.
                  </p>
                  <Button variant="secondary" onClick={() => setRetryStep(stepIndex)}>
                    Try it again
                  </Button>
                </div>
              ) : (
                <>
                  {step.intro && <p className="text-ink-2">{step.intro}</p>}
                  <QuestionPlayer
                    key={`${step.questionId}-${retryStep === stepIndex ? "retry" : "first"}`}
                    question={questionById(step.questionId)}
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

        <footer className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 -mx-5 mt-8 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-5 lg:backdrop-blur-none">
          <Button variant="ghost" onClick={() => go(stepIndex - 1)} disabled={stepIndex === 0}>
            <ArrowLeftIcon size={17} /> Back
          </Button>
          {(step.type !== "check" || checkAlreadyDone) && (
            <Button size="lg" onClick={advance} disabled={!canContinue}>
              {isLast ? "Finish lesson" : "Continue"} <ArrowRightIcon size={18} />
            </Button>
          )}
          {step.type === "check" && !checkAlreadyDone && <span className="text-sm text-muted">Answer to continue</span>}
        </footer>
        {!canContinue && step.type === "lab" && <p className="mt-2 text-right text-sm text-muted">Check each challenge to continue.</p>}
        {!canContinue && step.type === "worked" && <p className="mt-2 text-right text-sm text-muted">Work through every step to continue.</p>}
      </section>
    </div>
  );
}
