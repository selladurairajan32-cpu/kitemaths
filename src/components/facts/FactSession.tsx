"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Kip } from "@/components/kid/Kip";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { classifyAnswer, factAnswer, factPrompt, MTC } from "@/engine/facts";
import type { FactRef, ItemResult } from "@/engine/types";
import { factResult, type FactMode } from "@/topics/times-tables/facts";

/** A strategy hint for one fact, built from facts the child is likely to know (TT-002 relationships). */
export function factHint(f: FactRef): string {
  const p = f.a * f.b;
  switch (f.form) {
    case "mul":
      return f.b > 2 ? `Use a fact you know: ${f.a} × ${f.b - 1} = ${f.a * (f.b - 1)}, then add one more ${f.a}.` : `Double ${f.a}.`;
    case "missing-factor":
      return `Count in ${f.a}s until you reach ${p}.`;
    case "div-quotient":
      return `What times ${f.a} makes ${p}?`;
    case "div-divisor":
      return `${p} ÷ ? = ${f.b} means ? × ${f.b} = ${p}.`;
    case "div-dividend":
      return `? ÷ ${f.a} = ${f.b} means ${f.a} × ${f.b} = ?`;
  }
}

/** The fact family, which every explanation ends with (TT-003). */
export const factFamily = (f: FactRef) => `${f.a} × ${f.b} = ${f.a * f.b}, so ${f.a * f.b} ÷ ${f.a} = ${f.b} and ${f.a * f.b} ÷ ${f.b} = ${f.a}.`;

/** The wall clock, read only in event handlers and timers (never during render). */
const clock = () => Date.now();

type Feedback = { kind: "right" | "slip" | "retry" | "reveal"; text: string } | null;

export interface SessionAnswer {
  fact: FactRef;
  given: number | null;
  correct: boolean;
  /** Diagnostic slips that were asked again are listed once, with their second answer. */
  slip: boolean;
}

/**
 * Plays a list of facts in one of four modes (R2):
 * - practice (TT-006, TT-008): feedback after each answer, one retry with a hint, then the answer and its family;
 * - untimed (TT-010): no clock, a hint button, unlimited retries, "Show me" after two misses;
 * - diagnostic (TT-005): no feedback or hints; a typing slip is asked again at the end instead of being judged;
 * - timed (TT-009): unscored warm-ups, then a 6-second window per question and a 3-second pause, no feedback until the end.
 * Each finished question is stored through `onResult`; warm-ups are not.
 */
export function FactSession({
  mode,
  facts,
  warmup = [],
  session,
  onResult,
  onDone,
}: {
  mode: FactMode;
  facts: FactRef[];
  warmup?: FactRef[];
  session: string;
  onResult: (r: ItemResult) => void;
  onDone: (answers: SessionAnswer[]) => void;
}) {
  const [queue, setQueue] = useState<{ fact: FactRef; warm: boolean; requeued?: boolean }[]>(() => [
    ...warmup.map((fact) => ({ fact, warm: true })),
    ...facts.map((fact) => ({ fact, warm: false })),
  ]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pausing, setPausing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const answers = useRef<SessionAnswer[]>([]);
  const shownAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timed = mode === "timed";
  const item = queue[index];
  const scoredCount = queue.filter((q) => !q.warm).length;
  const scoredIndex = queue.slice(0, index).filter((q) => !q.warm).length;

  // A new question: start its clock and put the cursor in the answer box.
  useEffect(() => {
    if (!item || pausing) return;
    shownAt.current = clock();
    inputRef.current?.focus();
  }, [index, pausing, item]);

  const finishQuestion = (given: number | null, opts: { correct: boolean; slip?: boolean; attemptsUsed: number; inTime?: boolean }) => {
    const durationMs = Math.min(clock() - shownAt.current, timed ? MTC.answerMs : Number.MAX_SAFE_INTEGER);
    if (!item.warm) {
      onResult(factResult({ mode, session, index, fact: item.fact, given, attempts: opts.attemptsUsed, hintsUsed: hints, durationMs, at: clock(), inTime: opts.inTime }));
      if (!(mode === "diagnostic" && opts.slip && !item.requeued)) answers.current.push({ fact: item.fact, given, correct: opts.correct, slip: !!opts.slip });
    }
    const advance = () => {
      setElapsed(0);
      setInput("");
      setAttempts(0);
      setHints(0);
      setShowHint(false);
      setFeedback(null);
      if (index + 1 >= queue.length && !(mode === "diagnostic" && opts.slip && !item.requeued && !item.warm)) onDone(answers.current);
      else setIndex((i) => i + 1);
    };
    // Diagnostic: a typing slip comes back once at the end rather than counting as a gap in recall (TT-005 AC2).
    if (mode === "diagnostic" && opts.slip && !item.requeued && !item.warm) {
      setQueue((q) => [...q, { fact: item.fact, warm: false, requeued: true }]);
      setElapsed(0);
      setInput("");
      setIndex((i) => i + 1);
      return;
    }
    if (timed) {
      setPausing(true);
      setTimeout(() => {
        setPausing(false);
        advance();
      }, MTC.pauseMs);
      return;
    }
    if (mode === "diagnostic") advance();
    else return advance;
  };

  // Timed: the clock runs for 6 seconds; when it ends, whatever is typed is taken as the answer (MTC framework §5.1).
  useEffect(() => {
    if (!timed || !item || pausing) return;
    const id = setInterval(() => {
      const t = clock() - shownAt.current;
      setElapsed(t);
      if (t >= MTC.answerMs) {
        clearInterval(id);
        const given = input.trim() === "" ? null : Number(input);
        finishQuestion(given, { correct: given === factAnswer(item.fact), attemptsUsed: 1, inTime: true });
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the clock restarts per question; `input` is read at expiry
  }, [timed, index, pausing, input]);

  const [continueFn, setContinueFn] = useState<(() => void) | null>(null);

  if (!item) return null;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (feedback && (feedback.kind === "right" || feedback.kind === "reveal")) {
      continueFn?.();
      setContinueFn(null);
      return;
    }
    if (input.trim() === "") return;
    const given = Number(input);
    const kind = classifyAnswer(item.fact, given);
    const used = attempts + (kind === "slip" ? 0 : 1);
    if (timed) {
      finishQuestion(given, { correct: kind === "right", attemptsUsed: 1, inTime: clock() - shownAt.current <= MTC.answerMs });
      return;
    }
    if (mode === "diagnostic") {
      finishQuestion(given, { correct: kind === "right", slip: kind === "slip", attemptsUsed: 1 });
      return;
    }
    if (kind === "right") {
      setFeedback({ kind: "right", text: factFamily(item.fact) });
      const next = finishQuestion(given, { correct: true, attemptsUsed: Math.max(1, used) });
      setContinueFn(() => next ?? null);
      return;
    }
    setAttempts(used);
    setInput("");
    if (kind === "slip") {
      setFeedback({ kind: "slip", text: "That looks like a typing slip: the right digits, mixed up. Have another go." });
      return;
    }
    const revealAt = mode === "practice" ? 2 : Infinity;
    if (used >= revealAt) {
      setFeedback({ kind: "reveal", text: `${factPrompt(item.fact).replace("?", String(factAnswer(item.fact)))}. ${factFamily(item.fact)}` });
      const next = finishQuestion(given, { correct: false, attemptsUsed: used });
      setContinueFn(() => next ?? null);
      return;
    }
    setShowHint(mode === "practice" || showHint);
    setFeedback({ kind: "retry", text: mode === "practice" ? factHint(item.fact) : "Not quite. Try again, or ask for a hint." });
  };

  const reveal = () => {
    setFeedback({ kind: "reveal", text: `${factPrompt(item.fact).replace("?", String(factAnswer(item.fact)))}. ${factFamily(item.fact)}` });
    const next = finishQuestion(null, { correct: false, attemptsUsed: Math.max(1, attempts) });
    setContinueFn(() => next ?? null);
  };

  const press = (k: string) => {
    if (k === "del") setInput((v) => v.slice(0, -1));
    else if (k === "enter") submit();
    else setInput((v) => (v.length < 3 ? v + k : v));
    inputRef.current?.focus();
  };

  const settled = feedback?.kind === "right" || feedback?.kind === "reveal";
  const [lead, rest] = factPrompt(item.fact).split("?");

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between gap-3 text-label font-semibold text-muted">
        <span aria-live="polite">{item.warm ? "Warm-up: not scored" : `Question ${scoredIndex + 1} of ${scoredCount}${item.requeued ? " (asked again)" : ""}`}</span>
        {timed && <span>{Math.max(0, Math.ceil((MTC.answerMs - elapsed) / 1000))} s</span>}
      </div>
      {timed && (
        <div className="h-2.5 overflow-hidden rounded-full bg-sunk" role="timer" aria-label="Time left for this question">
          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(0, 100 - (elapsed / MTC.answerMs) * 100)}%` }} />
        </div>
      )}

      <section className="card p-6 sm:p-8" aria-label="Question">
        {pausing ? (
          <p className="py-10 text-center text-title font-extrabold text-ink-2" aria-live="polite">
            Next question coming…
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <h1 className="text-center text-heading-1 font-extrabold tabular-nums text-ink">
              <span className="sr-only">What is the missing number? </span>
              {lead}
              <span className="mx-1 inline-block min-w-16 rounded-[14px] border-2 border-dashed border-line-strong px-2 text-brand-strong">{settled ? factAnswer(item.fact) : "?"}</span>
              {rest}
            </h1>
            <label className="sr-only" htmlFor="fact-answer">
              Your answer
            </label>
            <input
              id="fact-answer"
              ref={inputRef}
              inputMode="numeric"
              autoComplete="off"
              value={input}
              disabled={settled}
              onChange={(e) => setInput(e.target.value.replace(/\D/g, "").slice(0, 3))}
              className="mx-auto block h-14 w-40 rounded-[16px] border-2 border-line-strong bg-surface text-center text-heading-2 font-extrabold tabular-nums"
            />
            {/* On-screen number pad, as in the check, for touch screens. */}
            <div className="mx-auto grid max-w-xs grid-cols-3 gap-2" aria-label="Number pad">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "enter"].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => press(k)}
                  disabled={settled && k !== "enter"}
                  className={`min-h-12 rounded-[14px] text-title font-extrabold ${k === "enter" ? "bg-brand text-on-brand" : "bg-sunk text-ink hover:bg-line"}`}
                  aria-label={k === "del" ? "Delete" : k === "enter" ? (settled ? "Next" : "Enter") : k}
                >
                  {k === "del" ? "⌫" : k === "enter" ? "↵" : k}
                </button>
              ))}
            </div>
            {!timed && mode !== "diagnostic" && !settled && (
              <div className="flex flex-wrap justify-center gap-2">
                {mode === "untimed" && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowHint(true);
                      setHints((h) => h + 1);
                    }}
                  >
                    Show a hint
                  </Button>
                )}
                {mode === "untimed" && attempts >= 2 && (
                  <Button type="button" variant="ghost" onClick={reveal}>
                    Show me
                  </Button>
                )}
              </div>
            )}
          </form>
        )}
      </section>

      <div aria-live="polite">
        {showHint && !settled && (
          <p className="rounded-[18px] bg-hint-soft px-4 py-3 text-body text-hint-ink">
            <strong>Hint:</strong> {factHint(item.fact)}
          </p>
        )}
        {feedback && (
          <div
            className={`mt-3 flex items-start gap-3 rounded-[20px] border-2 px-4 py-3 ${
              feedback.kind === "right" ? "border-success-edge bg-success-soft text-success-ink" : feedback.kind === "slip" ? "border-notice-edge bg-notice-soft text-notice-ink" : "border-retry-edge bg-retry-soft text-retry-ink"
            }`}
          >
            <Kip mood={feedback.kind === "right" ? "cheer" : "think"} size={44} float={false} />
            <div className="min-w-0 space-y-1">
              <p className="text-title font-extrabold">{feedback.kind === "right" ? "Correct!" : feedback.kind === "slip" ? "Typing slip?" : feedback.kind === "reveal" ? "Here's how it goes" : "Not yet"}</p>
              <p className="text-body">{feedback.text}</p>
              {settled && (
                <Button type="button" onClick={() => submit()} className="mt-2">
                  Next <ArrowRightIcon size={18} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
