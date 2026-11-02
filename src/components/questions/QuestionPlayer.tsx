"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, BulbIcon, CheckIcon, SearchIcon } from "@/components/ui/Icons";
import { initialRecovery, isFinished, recoveryReducer, recoverySummary, type RecoveryState } from "@/engine/recovery";
import type { ItemResult, ResultContext } from "@/engine/types";
import { followUpFor } from "@/topics/fractions";
import { answerText, evaluate, inputProblem, isResponseComplete } from "@/topics/fractions/evaluate";
import { misconceptionById } from "@/topics/fractions/misconceptions";
import { questionById } from "@/topics/fractions/questions";
import type { FractionQuestion, Response } from "@/topics/fractions/types";
import { QuestionInput } from "./QuestionInput";
import { RemedyVisual } from "./RemedyVisual";

export type ResultDraft = Omit<ItemResult, "at">;

const ENCOURAGE = ["Brilliant — that's right!", "Spot on!", "Yes! Well reasoned.", "Exactly right.", "Great work!"];

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

function FeedbackCard({
  tone,
  icon,
  title,
  children,
  focus = true,
}: {
  tone: "ok" | "warn" | "violet" | "neutral";
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  focus?: boolean;
}) {
  const styles = {
    ok: "border-ok/30 bg-ok-soft",
    warn: "border-warn/30 bg-warn-soft",
    violet: "border-violet/25 bg-violet-soft",
    neutral: "border-line bg-sunk",
  }[tone];
  const iconStyles = { ok: "bg-ok", warn: "bg-warn", violet: "bg-violet", neutral: "bg-ink" }[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={`rounded-2xl border p-4 sm:p-5 ${styles}`}
    >
      <div className="flex gap-3">
        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-white ${iconStyles}`} aria-hidden>
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          {focus ? <FocusHeading>{title}</FocusHeading> : <p className="font-semibold text-ink">{title}</p>}
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function QuestionPrompt({ q, focusOnMount = false }: { q: FractionQuestion; focusOnMount?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);
  return (
    <h3 ref={ref} tabIndex={-1} className="text-lg font-medium leading-relaxed text-ink outline-none sm:text-xl">
      <RichText text={q.prompt} />
    </h3>
  );
}

function FollowUp({
  question,
  orderKey,
  onSubmit,
}: {
  question: FractionQuestion;
  orderKey?: string;
  onSubmit: (correct: boolean) => void;
}) {
  const [response, setResponse] = useState<Response | null>(null);
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
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <FocusHeading className="eyebrow">Quick check</FocusHeading>
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
      {problem && <p className="text-sm text-warn">{problem}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={submitted || !isResponseComplete(question, response)}>
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
}: {
  question: FractionQuestion;
  context: ResultContext;
  usedFollowUps?: string[];
  onComplete: (result: ResultDraft) => void;
  onFollowUpResult?: (result: ResultDraft) => void;
  continueLabel?: string;
  index?: number;
  orderKey?: string;
  autoFocus?: boolean;
}) {
  const [response, setResponse] = useState<Response | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [state, dispatch] = useReducer(
    (s: RecoveryState, e: Parameters<typeof recoveryReducer>[1]) =>
      recoveryReducer(s, e, { followUpFor: (suspected) => followUpFor(suspected, usedFollowUps) }),
    initialRecovery,
  );
  const [episodeId] = useState(() => newEpisodeId(q.id));
  const [praise] = useState(() => ENCOURAGE[(q.id.length + (index ?? 0)) % ENCOURAGE.length]);
  const [completed, setCompleted] = useState(false);
  const [returned, setReturned] = useState(0);

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
    dispatch({ type: "submit", evaluation: evaluate(q, response) });
  };

  const backToQuestion = () => {
    setReturned((n) => n + 1);
    dispatch({ type: "continue" });
  };

  const finish = () => {
    if (completed) return;
    setCompleted(true);
    const s = recoverySummary(state);
    onComplete({ id: episodeId, questionId: q.id, skill: q.skill, context, difficulty: q.difficulty, ...s });
  };

  const followUp = state.followUpId ? questionById(state.followUpId) : null;
  const suspected = state.suspected.map((id) => misconceptionById(id)).filter((m) => !!m);
  const finished = isFinished(state);

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-5">
        <QuestionPrompt key={returned} q={q} focusOnMount={autoFocus || returned > 0} />
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
          <div aria-live="polite" className="space-y-2">
            {problem && <p className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-ink-2">{problem}</p>}
            {state.hintVisible && q.hint && (
              <div className="flex gap-3 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3">
                <BulbIcon size={18} className="mt-0.5 shrink-0 text-warn" />
                <div className="space-y-1 text-ink-2">
                  {state.retrying && <p className="font-semibold text-ink">Not quite — have another look.</p>}
                  {state.retrying && state.lastFeedback && (
                    <p>
                      <RichText text={state.lastFeedback} />
                    </p>
                  )}
                  <p>
                    <strong className="text-ink">Hint: </strong>
                    <RichText text={q.hint} />
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {answering && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {q.hint && !state.hintVisible ? (
              <Button variant="ghost" onClick={() => dispatch({ type: "request-hint" })}>
                <BulbIcon size={18} /> I need a hint
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" size="lg" disabled={!complete}>
              {state.attempts > 0 ? "Check again" : "Check answer"}
            </Button>
          </div>
        )}
      </form>

      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {state.stage === "correct" && (
            <FeedbackCard
              key="correct"
              tone="ok"
              icon={<CheckIcon size={18} />}
              title={state.attempts > 1 || state.hintsUsed ? "That's it — you worked it out!" : praise}
              focus={false}
            >
              {state.lastFeedback && (
                <p className="text-ink-2">
                  <RichText text={state.lastFeedback} />
                </p>
              )}
              <p className="text-ink-2">
                <RichText text={q.explanation} />
              </p>
            </FeedbackCard>
          )}

          {state.stage === "diagnose" && (
            <FeedbackCard key="diagnose" tone="violet" icon={<SearchIcon size={17} />} title="Not quite. Let's look closer.">
              {state.lastFeedback && (
                <p className="text-ink-2">
                  <RichText text={state.lastFeedback} />
                </p>
              )}
              {suspected.length === 1 ? (
                <p className="text-ink-2">{suspected[0]!.possibleCause}</p>
              ) : (
                <div className="text-ink-2">
                  <p>There could be a couple of reasons:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    {suspected.map((m) => (
                      <li key={m!.id}>{m!.possibleCause}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="space-y-1.5 text-ink-2">
                {suspected[0]!.explanation.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-violet" aria-hidden />
                    <RichText text={line} />
                  </li>
                ))}
              </ul>
              <RemedyVisual misconception={suspected[0]!.id} />
              <p className="text-sm text-muted">One answer can&apos;t tell us for sure what you were thinking — a quick check will help.</p>
              <Button onClick={() => (followUp ? dispatch({ type: "continue" }) : backToQuestion())}>
                {followUp ? "Try a quick check" : "Try the question again"} <ArrowRightIcon size={17} />
              </Button>
            </FeedbackCard>
          )}

          {state.stage === "followup" && followUp && (
            <motion.div key="followup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
            <FeedbackCard
              key="followup-review"
              tone={state.followUpCorrect ? "ok" : "warn"}
              icon={state.followUpCorrect ? <CheckIcon size={18} /> : <BulbIcon size={18} />}
              title={state.followUpCorrect ? "Yes! You've got the idea." : "Let's look at the quick check together."}
            >
              <p className="text-ink-2">
                <RichText text={followUp.explanation} />
              </p>
              <p className="text-ink-2">Now use that idea to try the original question again — your answer is still there to change.</p>
              <Button onClick={backToQuestion}>
                Back to the question <ArrowRightIcon size={17} />
              </Button>
            </FeedbackCard>
          )}

          {state.stage === "revealed" && (
            <FeedbackCard key="revealed" tone="neutral" icon={<BulbIcon size={18} />} title="Let's look at the answer together">
              <p className="text-ink-2">
                The answer is{" "}
                <strong className="text-ink">
                  <RichText text={answerText(q)} />
                </strong>
                .
              </p>
              <p className="text-ink-2">
                <RichText text={q.explanation} />
              </p>
              <p className="text-sm text-muted">We&apos;ll come back to this idea in practice so you can try it again.</p>
            </FeedbackCard>
          )}
        </AnimatePresence>

        {finished && (
          <div className="flex justify-end">
            <Button size="lg" onClick={finish} disabled={completed} autoFocus={state.stage === "correct"}>
              {continueLabel} <ArrowRightIcon size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
