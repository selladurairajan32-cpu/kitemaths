"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Confetti, StarPop } from "@/components/kid/Celebrate";
import { Kip } from "@/components/kid/Kip";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, BulbIcon, CheckIcon, SearchIcon } from "@/components/ui/Icons";
import { initialRecovery, isFinished, recoveryReducer, recoverySummary, type RecoveryState } from "@/engine/recovery";
import type { ItemResult, ResultContext } from "@/engine/types";
import { speak } from "@/lib/speech";
import { playSound } from "@/lib/sound";
import { getLearner } from "@/lib/store";
import { useTopic } from "@/topics/context";
import type { AnswerResponse, Question } from "@/topics/types";

export type ResultDraft = Omit<ItemResult, "at">;

const ENCOURAGE = ["Brilliant — that's right!", "Spot on!", "Yes! Super thinking.", "Exactly right!", "Great work!", "You nailed it!", "Fantastic!"];

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
  kip,
}: {
  tone: "ok" | "warn" | "violet" | "neutral";
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  focus?: boolean;
  kip?: "happy" | "cheer" | "think" | "oops";
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
      className={`rounded-3xl border-2 p-4 sm:p-5 ${styles}`}
    >
      <div className="flex gap-3">
        {kip ? (
          <span className="-mt-1 shrink-0" aria-hidden>
            <Kip mood={kip} size={52} />
          </span>
        ) : (
          <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-white ${iconStyles}`} aria-hidden>
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1 space-y-3">
          {focus ? <FocusHeading>{title}</FocusHeading> : <p className="font-semibold text-ink">{title}</p>}
          {children}
        </div>
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
      <h3 ref={ref} tabIndex={-1} className="min-w-0 flex-1 text-xl font-semibold leading-relaxed text-ink outline-none sm:text-2xl">
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
  question: Question;
  context: ResultContext;
  usedFollowUps?: string[];
  onComplete: (result: ResultDraft) => void;
  onFollowUpResult?: (result: ResultDraft) => void;
  continueLabel?: string;
  index?: number;
  orderKey?: string;
  autoFocus?: boolean;
}) {
  const topic = useTopic();
  const { Input: QuestionInput, evaluate, inputProblem, isComplete: isResponseComplete, answerText } = topic.questions;
  const { followUpFor, questionById, misconceptionById } = topic;
  const Remedy = topic.ui.Remedy;
  const [response, setResponse] = useState<AnswerResponse | null>(null);
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
  const [scope, animateEl] = useAnimate<HTMLFormElement>();
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
    onComplete({ id: episodeId, questionId: q.id, skill: q.skill, context, difficulty: q.difficulty, ...s });
  };

  const followUp = state.followUpId ? questionById(state.followUpId) : null;
  const suspected = state.suspected.map((id) => misconceptionById(id)).filter((m) => !!m);
  const finished = isFinished(state);
  const earned = state.stage === "correct" ? (state.attempts === 1 && state.hintsUsed === 0 ? 3 : 2) : state.stage === "revealed" ? 1 : 0;
  const showsStars = context === "practice" || context === "lesson";

  return (
    <div className="relative space-y-5">
      {state.stage === "correct" && <Confetti burstKey={episodeId} pieces={state.attempts === 1 && state.hintsUsed === 0 ? 40 : 24} />}
      <form ref={scope} onSubmit={submit} className="space-y-5">
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
          <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t-2 border-line bg-surface/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            {q.hint && !state.hintVisible ? (
              <Button variant="soft" size="lg" onClick={() => dispatch({ type: "request-hint" })} className="shrink-0">
                <BulbIcon size={18} /> Hint
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" variant="go" size="xl" disabled={!complete} className="min-w-0 flex-1 sm:flex-none">
              {state.attempts > 0 ? "Check again" : "Check"}
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
              kip="cheer"
              title={
                <span className="flex flex-wrap items-center gap-2">
                  {state.attempts > 1 || state.hintsUsed ? "That's it — you worked it out!" : praise}
                  {showsStars && <StarPop amount={earned} show />}
                </span>
              }
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
            <FeedbackCard key="diagnose" tone="violet" icon={<SearchIcon size={17} />} kip="think" title="Not quite. Let's look closer together.">
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
              {Remedy && <Remedy misconception={suspected[0]!.id} />}
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
            <FeedbackCard key="revealed" tone="neutral" icon={<BulbIcon size={18} />} kip="happy" title="Let's look at the answer together">
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
              <p className="text-sm text-muted">Mistakes help your brain grow! We&apos;ll come back to this idea so you can try it again.</p>
            </FeedbackCard>
          )}
        </AnimatePresence>

        {finished && (
          <div className="flex justify-end">
            <Button size="xl" onClick={finish} disabled={completed} autoFocus={state.stage === "correct"} className="w-full sm:w-auto">
              {continueLabel} <ArrowRightIcon size={20} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
