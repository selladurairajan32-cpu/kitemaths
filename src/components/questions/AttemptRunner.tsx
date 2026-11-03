"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import type { Evaluation } from "@/engine/types";
import { useTopic } from "@/topics/context";
import type { AnswerResponse as Response } from "@/topics/types";

function AttemptQuestion({
  id,
  index,
  total,
  saved,
  orderKey,
  focusOnMount,
  onSave,
  onNavigate,
  onReview,
}: {
  id: string;
  index: number;
  total: number;
  saved: Response | null;
  orderKey: string;
  focusOnMount: boolean;
  onSave: (r: Response | null, e: Evaluation | null) => void;
  onNavigate: (i: number) => void;
  onReview: () => void;
}) {
  const topic = useTopic();
  const { Input: QuestionInput, evaluate, inputProblem, isComplete: isResponseComplete } = topic.questions;
  const q = topic.questionById(id);
  const [response, setResponse] = useState<Response | null>(saved);
  const [problem, setProblem] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const complete = isResponseComplete(q, response);
  const isLast = index === total - 1;

  useEffect(() => {
    if (focusOnMount) heading.current?.focus();
  }, [focusOnMount]);

  const change = (r: Response | null) => {
    setResponse(r);
    const issue = r && isResponseComplete(q, r) ? inputProblem(q, r) : null;
    setProblem(issue);
    if (r && isResponseComplete(q, r) && !issue) onSave(r, evaluate(q, r));
    else onSave(null, null);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isLast) onReview();
        else onNavigate(index + 1);
      }}
      className="space-y-6"
    >
      <div className="flex items-start gap-3">
        <h2 ref={heading} tabIndex={-1} className="min-w-0 flex-1 text-xl font-semibold leading-relaxed outline-none sm:text-2xl">
          <span className="sr-only">Question {index + 1} of {total}. </span>
          <RichText text={q.prompt} />
        </h2>
        <ReadAloud text={q.prompt} label="Read the question aloud" />
      </div>
      <QuestionInput question={q} response={response} onChange={change} locked={false} orderKey={orderKey} />
      {problem && <p className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-[0.9375rem] text-ink-2">{problem} This answer isn&apos;t saved yet.</p>}
      <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t-2 border-line bg-surface/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-5 sm:backdrop-blur-none">
        <Button variant="ghost" onClick={() => onNavigate(index - 1)} disabled={index === 0}>
          <ArrowLeftIcon size={17} /> Back
        </Button>
        <Button type="submit" variant={complete && !problem ? "go" : "secondary"} size="xl">
          {isLast ? "Review & finish" : complete && !problem ? "Next" : "Skip for now"} <ArrowRightIcon size={20} />
        </Button>
      </div>
    </form>
  );
}

export function AttemptRunner({
  title,
  order,
  index,
  responses,
  orderKey,
  onSave,
  onIndex,
  onFinish,
}: {
  title: string;
  order: string[];
  index: number;
  responses: Record<string, unknown>;
  orderKey: string;
  onSave: (id: string, r: Response | null, e: Evaluation | null) => void;
  onIndex: (i: number) => void;
  onFinish: () => void;
}) {
  const [reviewing, setReviewing] = useState(false);
  const [moved, setMoved] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const answered = order.filter((id) => responses[id]).length;
  const current = Math.min(index, order.length - 1);
  const go = (i: number) => {
    setMoved(true);
    setReviewing(false);
    onIndex(Math.max(0, Math.min(order.length - 1, i)));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-2xl font-semibold">{title}</h1>
          <p className="text-[0.9375rem] text-muted" aria-live="polite">
            {reviewing ? "Review your answers" : `Question ${current + 1} of ${order.length}`} · {answered} answered · no hints
          </p>
        </div>
      </div>
      <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
        {order.map((id, i) => {
          const done = !!responses[id];
          const isCurrent = !reviewing && i === current;
          return (
            <button
              key={id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Question ${i + 1}${done ? ", answered" : ", not answered"}`}
              aria-current={isCurrent ? "step" : undefined}
              className={`grid size-11 place-items-center rounded-xl text-[0.9375rem] font-semibold transition-colors ${
                isCurrent ? "bg-brand text-white shadow-[0_3px_0_var(--color-brand-strong)]" : done ? "bg-ok-soft text-ok" : "bg-sunk text-muted hover:bg-line"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>
      <ProgressBar value={answered / order.length} label="Questions answered" tone="ok" />

      <section className="card p-5 sm:p-8">
        <AnimatePresence mode="wait">
          {reviewing ? (
            <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <h2 className="display text-2xl font-semibold outline-none" tabIndex={-1} ref={(el) => el?.focus()}>
                Ready to finish?
              </h2>
              <p className="text-ink-2">
                You&apos;ve answered <strong>{answered}</strong> of {order.length} questions.
                {answered < order.length && " Unanswered questions will count as not yet correct. Use the numbers above to go back to any question."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="go"
                  size="xl"
                  disabled={finishing}
                  onClick={() => {
                    setFinishing(true);
                    onFinish();
                  }}
                >
                  Finish! <ArrowRightIcon size={20} />
                </Button>
                <Button variant="secondary" size="lg" onClick={() => go(current)}>
                  Keep working
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={order[current]} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <AttemptQuestion
                id={order[current]}
                index={current}
                total={order.length}
                saved={(responses[order[current]] as Response | undefined) ?? null}
                orderKey={orderKey}
                focusOnMount={moved}
                onSave={(r, e) => onSave(order[current], r, e)}
                onNavigate={go}
                onReview={() => setReviewing(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
