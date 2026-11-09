"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Confetti, StarPop } from "@/components/kid/Celebrate";
import { Kip } from "@/components/kid/Kip";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { ArrowRightIcon, BulbIcon } from "@/components/ui/Icons";
import { initialRecovery, recoveryReducer, recoverySummary, type RecoveryState } from "@/engine/recovery";
import type { ItemResult, ResultContext } from "@/engine/types";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { getLearner } from "@/lib/store";
import { useTopic } from "@/topics/context";
import type { AnswerResponse, Question } from "@/topics/types";
import { Pic } from "@/components/paper/Pic";

export type ResultDraft = Omit<ItemResult, "at">;

const ENCOURAGE = ["That's right!", "Spot on!", "Exactly right.", "Great thinking.", "You've got it!", "Yes, that's it."];

function newEpisodeId(questionId: string) {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${questionId}:${rand}`;
}

function FocusHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: false });
  }, []);
  return (
    <p ref={ref} tabIndex={-1} className={`font-semibold text-ink outline-none ${className}`}>
      {children}
    </p>
  );
}

/** A flat paper panel for feedback that needs room: the diagnosis, the follow-up review. */
function FeedbackPanel({
  tone,
  title,
  children,
  focus = true,
  kip,
}: {
  tone: "ok" | "warn" | "paper";
  title: ReactNode;
  children?: ReactNode;
  focus?: boolean;
  kip: "happy" | "cheer" | "think" | "oops";
}) {
  const bg = { ok: "bg-ok-soft", warn: "bg-warn-soft", paper: "bg-surface" }[tone];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={`rounded-[24px] p-5 sm:p-6 ${bg}`}
    >
      <div className="flex gap-4">
        <span className="-mt-1 shrink-0" aria-hidden>
          <Kip mood={kip} size={52} float={false} />
        </span>
        <div className="min-w-0 flex-1 space-y-3 text-ink-2">
          {focus ? <FocusHeading className="text-[1.375rem] font-extrabold">{title}</FocusHeading> : <p className="text-[1.375rem] font-extrabold text-ink">{title}</p>}
          {children}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * The sheet that opens from the bottom when a question is finished: green when
 * it's right, plain paper when we show the answer. It sticks to the bottom of
 * the screen so Continue is always under the thumb.
 */
function FinishSheet({
  tone,
  kip,
  title,
  children,
  action,
}: {
  tone: "ok" | "paper";
  kip: "cheer" | "happy";
  title: ReactNode;
  children?: ReactNode;
  action: ReactNode;
}) {
  return (
    <motion.div
      role="status"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`sticky bottom-0 z-20 -mx-4 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-5 shadow-[0_-14px_40px_rgba(27,37,89,0.1)] sm:mx-0 sm:rounded-[28px] sm:border sm:p-7 ${
        tone === "ok" ? "border-[#c6ecd7] bg-ok-soft" : "border-line bg-surface"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="shrink-0" aria-hidden>
            {tone === "ok" ? <Pic name="party" size={72} /> : <Kip mood={kip} size={64} float={false} />}
          </span>
          <div className="min-w-0 space-y-1.5 text-ink-2">
            <p className={`text-[1.5rem] font-extrabold leading-tight sm:text-[1.75rem] ${tone === "ok" ? "text-ok" : "text-ink"}`}>{title}</p>
            {children}
          </div>
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </motion.div>
  );
}

function QuestionPrompt({ q, focusOnMount = false, autoRead = false }: { q: Question; focusOnMount?: boolean; autoRead?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);
  useEffect(() => {
    if (autoRead && getLearner().settings.autoRead) speak(q.prompt, `auto:${q.id}`);
  }, [autoRead, q.id, q.prompt]);
  return (
    <div className="flex items-start gap-3">
      <h3 ref={ref} tabIndex={-1} className="min-w-0 flex-1 text-prompt-sm font-extrabold text-ink outline-none sm:text-prompt">
        <RichText text={q.prompt} />
      </h3>
      <ReadAloud text={q.prompt} label="Read the question aloud" />
    </div>
  );
}

function FollowUp({
  question,
  orderKey,
  onSubmit,
}: {
  question: Question;
  orderKey?: string;
  onSubmit: (correct: boolean) => void;
}) {
  const { questions: kit } = useTopic();
  const { Input: QuestionInput, evaluate, inputProblem, isComplete: isResponseComplete } = kit;
  const [response, setResponse] = useState<AnswerResponse | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (submitted || !response || !isResponseComplete(question, response)) return;
    const issue = inputProblem(question, response);
    if (issue) return setProblem(issue);
    setSubmitted(true);
    onSubmit(evaluate(question, response).correct);
  };
  return (
    <form onSubmit={submit} className="space-y-5 rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
      <FocusHeading className="text-base text-muted">A quick question to check the idea</FocusHeading>
      <QuestionPrompt q={question} />
      <QuestionInput
        question={question}
        response={response}
        onChange={(r) => {
          setResponse(r);
          setProblem(null);
        }}
        locked={submitted}
        orderKey={orderKey}
      />
      {problem && <p className="rounded-[16px] bg-warn-soft px-4 py-3 text-base font-semibold text-warn">{problem}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={submitted || !isResponseComplete(question, response)}>
          Check
        </Button>
      </div>
    </form>
  );
}

export function QuestionPlayer({
  question: q,
  context,
  usedFollowUps = [],
  onComplete,
  onFollowUpResult,
  continueLabel = "Continue",
  index,
  orderKey,
  autoFocus = false,
  autoHint = true,
}: {
  question: Question;
  context: ResultContext;
  usedFollowUps?: string[];
  onComplete: (result: ResultDraft) => void;
  onFollowUpResult?: (result: ResultDraft) => void;
  continueLabel?: string;
  index?: number;
  orderKey?: string;
  autoFocus?: boolean;
  /** FR-010: false once the skill is secure, so a hint is offered rather than shown. */
  autoHint?: boolean;
}) {
  const topic = useTopic();
  const { Input: QuestionInput, evaluate, inputProblem, isComplete: isResponseComplete, answerText } = topic.questions;
  const { followUpFor, questionById, misconceptionById } = topic;
  const Remedy = topic.ui.Remedy;
  const [response, setResponse] = useState<AnswerResponse | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [state, dispatch] = useReducer(
    (s: RecoveryState, e: Parameters<typeof recoveryReducer>[1]) =>
      recoveryReducer(s, e, { followUpFor: (suspected) => followUpFor(suspected, usedFollowUps), autoHint }),
    initialRecovery,
  );
  const [episodeId] = useState(() => newEpisodeId(q.id));
  const [praise] = useState(() => ENCOURAGE[(q.id.length + (index ?? 0)) % ENCOURAGE.length]);
  const [completed, setCompleted] = useState(false);
  const [returned, setReturned] = useState(0);
  const [scope, animateEl] = useAnimate<HTMLFormElement>();
  // ARCH-005: what was answered last, and how long the question took.
  const lastResponse = useRef<AnswerResponse | null>(null);
  const shownAt = useRef<number | null>(null);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  const reduceMotion = useReducedMotion();

  const answering = state.stage === "answering";
  const complete = isResponseComplete(q, response);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!answering || !response || !complete) return;
    const issue = inputProblem(q, response);
    if (issue) {
      setProblem(issue);
      return;
    }
    const evaluation = evaluate(q, response);
    lastResponse.current = response;
    playSound(evaluation.correct ? "correct" : "tryAgain");
    if (!evaluation.correct && !reduceMotion && scope.current) void animateEl(scope.current, { x: [0, -8, 8, -6, 6, 0] }, { duration: 0.4 });
    dispatch({ type: "submit", evaluation });
  };

  const backToQuestion = () => {
    setReturned((n) => n + 1);
    dispatch({ type: "continue" });
  };

  const finish = () => {
    if (completed) return;
    setCompleted(true);
    const s = recoverySummary(state);
    const durationMs = shownAt.current === null ? undefined : Math.max(0, Date.now() - shownAt.current);
    onComplete({
      id: episodeId,
      questionId: q.id,
      skill: q.skill,
      context,
      difficulty: q.difficulty,
      ...s,
      ...(lastResponse.current ? { response: JSON.parse(JSON.stringify(lastResponse.current)) as unknown } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
    });
  };

  const followUp = state.followUpId ? questionById(state.followUpId) : null;
  const suspected = state.suspected.map((id) => misconceptionById(id)).filter((m) => !!m);
  const earned = state.stage === "correct" ? (state.attempts === 1 && state.hintsUsed === 0 ? 3 : 2) : state.stage === "revealed" ? 1 : 0;
  const showsStars = context === "practice" || context === "lesson";

  return (
    <div className="relative space-y-6">
      {state.stage === "correct" && <Confetti burstKey={episodeId} pieces={state.attempts === 1 && state.hintsUsed === 0 ? 28 : 18} />}
      <form ref={scope} onSubmit={submit} className="space-y-6 rounded-[28px] border border-line bg-surface px-5 pb-5 pt-6 shadow-[var(--shadow-card)] sm:p-8">
        <QuestionPrompt key={returned} q={q} focusOnMount={autoFocus || returned > 0} autoRead={returned === 0} />
        <QuestionInput
          question={q}
          response={response}
          onChange={(r) => {
            setResponse(r);
            setProblem(null);
          }}
          locked={!answering}
          reveal={state.stage === "revealed"}
          orderKey={orderKey}
        />

        {answering && (state.hintVisible || problem) && (
          <div aria-live="polite" className="space-y-3">
            {problem && <p className="rounded-[16px] bg-warn-soft px-4 py-3 text-base font-semibold text-warn">{problem}</p>}
            {state.hintVisible && q.hint && (
              <div className="flex gap-3 rounded-[20px] bg-warn-soft px-4 py-4">
                <PaperIcon name="bulb" size={32} className="shrink-0" />
                <div className="space-y-1 text-ink-2">
                  {state.retrying && <p className="font-semibold text-ink">Not quite. Have another look.</p>}
                  {state.retrying && state.lastFeedback && (
                    <p>
                      <RichText text={state.lastFeedback} />
                    </p>
                  )}
                  <p>
                    <RichText text={q.hint} />
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {answering && (
          <div className="sticky bottom-0 z-10 -mx-5 flex flex-wrap items-center justify-between gap-3 rounded-b-[28px] border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:static sm:mx-0 sm:rounded-none sm:border-0 sm:p-0">
            {q.hint && !state.hintVisible ? (
              <Button variant="quiet" size="lg" onClick={() => dispatch({ type: "request-hint" })} className="shrink-0">
                <BulbIcon size={20} /> Hint
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="xl" disabled={!complete} className="min-w-0 flex-1 sm:min-w-48 sm:flex-none">
              {state.attempts > 0 ? "Check again" : "Check"}
            </Button>
          </div>
        )}
      </form>

      <AnimatePresence mode="wait">
        {state.stage === "diagnose" && (
          <FeedbackPanel key="diagnose" tone="paper" kip="think" title="Not quite. Let's look closer.">
            {state.lastFeedback && (
              <p>
                <RichText text={state.lastFeedback} />
              </p>
            )}
            {suspected.length === 1 ? (
              <p>{suspected[0]!.possibleCause}</p>
            ) : (
              <div>
                <p>It could be one of these:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {suspected.map((m) => (
                    <li key={m!.id}>{m!.possibleCause}</li>
                  ))}
                </ul>
              </div>
            )}
            <ul className="space-y-2">
              {suspected[0]!.explanation.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span className="mt-2.5 size-2 shrink-0 rounded-full bg-ink" aria-hidden />
                  <RichText text={line} />
                </li>
              ))}
            </ul>
            {Remedy && <Remedy misconception={suspected[0]!.id} />}
            <p className="text-base text-muted">One answer can&apos;t tell us for sure what you were thinking, so here&apos;s a quick question to check.</p>
            <Button size="lg" onClick={() => (followUp ? dispatch({ type: "continue" }) : backToQuestion())}>
              {followUp ? "Try a quick question" : "Try the question again"} <ArrowRightIcon size={18} />
            </Button>
          </FeedbackPanel>
        )}

        {state.stage === "followup" && followUp && (
          <motion.div key="followup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <FollowUp
              question={followUp}
              orderKey={orderKey ? `${orderKey}:fu` : undefined}
              onSubmit={(correct) => {
                onFollowUpResult?.({
                  id: `${episodeId}:fu:${followUp.id}`,
                  questionId: followUp.id,
                  skill: followUp.skill,
                  context: "followup",
                  difficulty: followUp.difficulty,
                  correct,
                  firstTry: correct,
                  attempts: 1,
                  hintsUsed: 0,
                  misconceptions: correct ? [] : state.suspected.slice(0, 1),
                  targets: state.suspected[0],
                });
                dispatch({ type: "followup-submit", evaluation: { correct, misconceptions: [] } });
              }}
            />
          </motion.div>
        )}

        {state.stage === "followup-review" && followUp && (
          <FeedbackPanel
            key="followup-review"
            tone={state.followUpCorrect ? "ok" : "warn"}
            kip={state.followUpCorrect ? "cheer" : "happy"}
            title={state.followUpCorrect ? "Yes, you've got the idea." : "Let's look at that one together."}
          >
            <p>
              <RichText text={followUp.explanation} />
            </p>
            <p>Now use that idea on the first question. Your answer is still there to change.</p>
            <Button size="lg" onClick={backToQuestion}>
              Back to the question <ArrowRightIcon size={18} />
            </Button>
          </FeedbackPanel>
        )}
      </AnimatePresence>

      {state.stage === "correct" && (
        <FinishSheet
          tone="ok"
          kip="cheer"
          title={
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {state.attempts > 1 || state.hintsUsed ? "That's it. You worked it out." : praise}
              {showsStars && <StarPop amount={earned} show />}
            </span>
          }
          action={
            <Button size="xl" onClick={finish} disabled={completed} autoFocus className="w-full sm:w-auto">
              {continueLabel} <ArrowRightIcon size={20} />
            </Button>
          }
        >
          {state.lastFeedback && (
            <p>
              <RichText text={state.lastFeedback} />
            </p>
          )}
          <p>
            <RichText text={q.explanation} />
          </p>
        </FinishSheet>
      )}

      {state.stage === "revealed" && (
        <FinishSheet
          tone="paper"
          kip="happy"
          title={
            <>
              The answer is <RichText text={answerText(q)} />
            </>
          }
          action={
            <Button size="xl" onClick={finish} disabled={completed} className="w-full sm:w-auto">
              {continueLabel} <ArrowRightIcon size={20} />
            </Button>
          }
        >
          <p>
            <RichText text={q.explanation} />
          </p>
          <p className="text-base text-muted">We&apos;ll come back to this idea so you can try it again.</p>
        </FinishSheet>
      )}
    </div>
  );
}
