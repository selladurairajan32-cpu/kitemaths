"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FIELDS } from "@/components/kid/fields";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { recordResult } from "@/engine/progress";
import type { DeepLesson, Level, Scene } from "@/topics/kit/deep";
import { useTopicState } from "@/topics/context";
import { Diagram } from "./Diagram";

/**
 * D-055: a sub-topic written to grammar-school and GCSE standard, as six pages: the big idea (an animated diagram,
 * one step at a time), the method and why it works, worked examples from core to GCSE, common mistakes, an exercise of
 * exam-standard questions, and what to remember.
 */

export const DEEP_PAGES = ["Big idea", "Method", "Examples", "Mistakes", "Exercise", "Remember"] as const;

const plain = (t: string) => t.replace(/\{(\d+)\/(\d+)\}/g, "$1 over $2").replace(/\*\*/g, "");

export function DeepPage({ deep, page, onDone }: { deep: DeepLesson; page: number; onDone: () => void }) {
  switch (page) {
    case 0:
      return <BigIdea deep={deep} />;
    case 1:
      return <Method deep={deep} />;
    case 2:
      return <Examples deep={deep} />;
    case 3:
      return <Mistakes deep={deep} />;
    case 4:
      return <Exercise deep={deep} onDone={onDone} />;
    default:
      return <Remember deep={deep} />;
  }
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] border border-line bg-surface ${className}`}>{children}</div>;
}

function Hook({ text }: { text: string }) {
  return (
    <aside aria-label="Think about this" className="overflow-hidden rounded-[24px] border-2 border-field-yellow">
      <p className={`px-5 py-2 text-label font-extrabold uppercase tracking-wide ${FIELDS.yellow.bg} ${FIELDS.yellow.text}`}>Think about this</p>
      <p className="px-5 py-4 text-body-lg font-semibold text-ink">
        <RichText text={text} />
      </p>
    </aside>
  );
}

/** The animated explainer: one diagram that changes step by step, with what each step means beside it. */
function Explainer({ scenes }: { scenes: Scene[] }) {
  const [i, setI] = useState(0);
  const scene = scenes[i];
  const last = i === scenes.length - 1;
  return (
    <Card className="overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-b border-line bg-raised px-4 py-6 sm:px-8 lg:border-b-0 lg:border-r">
          <Diagram spec={scene.diagram} label={plain(scene.caption)} />
        </div>
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-label font-extrabold uppercase tracking-wide text-ink-2">
              Step {i + 1} of {scenes.length}
            </p>
            <ol className="flex gap-1.5" aria-hidden>
              {scenes.map((_, k) => (
                <li key={k} className={`h-2 rounded-full transition-all ${k === i ? "w-7 bg-ink" : k < i ? "w-2 bg-ok-bright" : "w-2 bg-line"}`} />
              ))}
            </ol>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              aria-live="polite"
              className="text-xl font-semibold leading-relaxed text-ink"
            >
              <RichText text={scene.caption} />
            </motion.p>
          </AnimatePresence>
          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <Button variant="quiet" className="whitespace-nowrap" onClick={() => setI(i - 1)} disabled={i === 0}>
              <ArrowLeftIcon size={18} /> Back
            </Button>
            <Button variant="primary" size="lg" className="whitespace-nowrap" onClick={() => setI(last ? 0 : i + 1)}>
              {last ? "Start again" : "Next step"} <ArrowRightIcon size={18} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function BigIdea({ deep }: { deep: DeepLesson }) {
  return (
    <div className="space-y-6">
      <Hook text={deep.hook} />
      <Explainer scenes={deep.scenes} />
    </div>
  );
}

function Method({ deep }: { deep: DeepLesson }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-title font-extrabold text-ink">Why it works</h3>
          <ReadAloud text={deep.why.map(plain).join(" ")} label="Read this to me" />
        </div>
        <div className="mt-3 space-y-4 text-body-lg text-ink">
          {deep.why.map((p) => (
            <p key={p}>
              <RichText text={p} />
            </p>
          ))}
        </div>
      </Card>
      <Card className="p-5 sm:p-7">
        <h3 className="text-title font-extrabold text-ink">The method</h3>
        <ol className="mt-4 space-y-4">
          {deep.method.map((m, k) => (
            <li key={m} className="flex gap-4">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full font-extrabold ${FIELDS.blue.bg} ${FIELDS.blue.text}`}>{k + 1}</span>
              <span className="pt-1 text-body-lg text-ink">
                <RichText text={m} />
              </span>
            </li>
          ))}
        </ol>
      </Card>
      <aside aria-label="Key idea" className="overflow-hidden rounded-[24px] border-2 border-field-yellow lg:col-span-2">
        <p className={`px-5 py-2 text-label font-extrabold uppercase tracking-wide ${FIELDS.yellow.bg} ${FIELDS.yellow.text}`}>Key idea</p>
        <p className="px-5 py-4 text-xl font-bold text-ink">
          <RichText text={deep.keyIdea} />
        </p>
      </aside>
    </div>
  );
}

const LEVEL_FIELD: Record<Level, (typeof FIELDS)[keyof typeof FIELDS]> = { Core: FIELDS.blue, "11+": FIELDS.orange, GCSE: FIELDS.navy };
export function LevelChip({ level }: { level: Level }) {
  return <span className={`rounded-full px-3 py-0.5 text-label font-extrabold ${LEVEL_FIELD[level].bg} ${LEVEL_FIELD[level].text}`}>{level}</span>;
}

function Examples({ deep }: { deep: DeepLesson }) {
  return (
    <ol className="grid gap-5 md:grid-cols-2">
      {deep.examples.map((e, k) => (
        <li key={k}>
          <Example n={k + 1} e={e} />
        </li>
      ))}
    </ol>
  );
}

function Example({ n, e }: { n: number; e: DeepLesson["examples"][number] }) {
  const [shown, setShown] = useState(0);
  const all = shown >= e.steps.length;
  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="text-label font-extrabold text-ink-2">Example {n}</span>
        <LevelChip level={e.level} />
      </div>
      <p className="mt-3 text-xl font-bold leading-relaxed text-ink">
        <RichText text={e.problem} />
      </p>
      <ol className="mt-4 space-y-2">
        {e.steps.slice(0, shown).map((s, k) => (
          <motion.li key={k} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 rounded-[14px] bg-raised px-4 py-2.5 text-body text-ink">
            <span className="font-extrabold text-ink-2">{k + 1}</span>
            <span>
              <RichText text={s} />
            </span>
          </motion.li>
        ))}
      </ol>
      {all ? (
        <p className="mt-3 flex items-center gap-2 rounded-[14px] bg-correct-soft px-4 py-3 text-body-lg font-bold text-correct">
          <CheckIcon size={18} strokeWidth={3} /> <RichText text={e.answer} />
        </p>
      ) : (
        <div className="mt-auto pt-4">
          <Button variant="secondary" onClick={() => setShown(shown + 1)}>
            {shown === 0 ? "Show the working" : "Next line"} <ArrowRightIcon size={18} />
          </Button>
        </div>
      )}
    </Card>
  );
}

function Mistakes({ deep }: { deep: DeepLesson }) {
  return (
    <ul className="space-y-5">
      {deep.mistakes.map((m) => (
        <li key={m.wrong}>
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="border-b border-line p-5 md:border-b-0 md:border-r">
                <p className="text-label font-extrabold uppercase tracking-wide text-incorrect">✗ The mistake</p>
                <p className="mt-2 text-body-lg font-semibold text-ink">
                  <RichText text={m.wrong} />
                </p>
              </div>
              <div className="bg-correct-soft p-5">
                <p className="text-label font-extrabold uppercase tracking-wide text-correct">✓ Instead</p>
                <p className="mt-2 text-body-lg font-semibold text-ink">
                  <RichText text={m.right} />
                </p>
              </div>
            </div>
            <p className="border-t border-line px-5 py-3 text-body text-ink-2">
              <span className="font-bold text-ink">Why: </span>
              <RichText text={m.why} />
            </p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function Exercise({ deep, onDone }: { deep: DeepLesson; onDone: () => void }) {
  const { topic, learner, update } = useTopicState();
  const [k, setK] = useState(0);
  const [right, setRight] = useState(0);
  const used = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  const done = k >= deep.exercise.length;
  const heading = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (k > 0) heading.current?.focus();
  }, [k]);
  const onComplete = (r: ResultDraft) => {
    update((s) => recordResult(s, { ...r, at: Date.now() }));
    if (r.correct) setRight((n) => n + 1);
    setK(k + 1);
  };
  if (done) {
    return (
      <Card className="flex flex-col items-start gap-4 p-6 sm:p-8">
        <p className="text-heading-2 font-extrabold text-ink">
          {right} of {deep.exercise.length} right first time
        </p>
        <p className="text-body-lg text-ink-2">
          {right === deep.exercise.length ? "Exam standard: well done." : "Look again at the examples and the mistakes, then try the exercise once more."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => (setK(0), setRight(0))}>
            Try again
          </Button>
          <Button variant="cta" onClick={onDone}>
            Next page <ArrowRightIcon size={18} />
          </Button>
        </div>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p ref={heading} tabIndex={-1} className="text-title font-extrabold text-ink outline-none">
          Question {k + 1} of {deep.exercise.length}
        </p>
        <span className={`rounded-full px-3 py-0.5 text-label font-extrabold ${FIELDS.navy.bg} ${FIELDS.navy.text}`}>Exam standard</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-sunk" aria-hidden>
        <span className="block h-full rounded-full bg-ok-bright transition-all" style={{ width: `${(k / deep.exercise.length) * 100}%` }} />
      </div>
      <QuestionPlayer
        key={deep.exercise[k]}
        question={topic.questionById(deep.exercise[k])}
        context="lesson"
        usedFollowUps={used}
        orderKey={`deep:${deep.lessonId}`}
        onComplete={onComplete}
        onFollowUpResult={(r) => update((s) => recordResult(s, { ...r, at: Date.now() }))}
        continueLabel={k === deep.exercise.length - 1 ? "Finish" : "Next question"}
      />
    </div>
  );
}

function Remember({ deep }: { deep: DeepLesson }) {
  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-7">
        <h3 className="text-title font-extrabold text-ink">Remember</h3>
        <ul className="mt-4 space-y-3">
          {deep.remember.map((o) => (
            <li key={o} className="flex items-start gap-3 text-xl text-ink">
              <CheckIcon size={22} strokeWidth={3} className="mt-1 shrink-0 text-ok" />
              <RichText text={o} />
            </li>
          ))}
        </ul>
      </Card>
      <aside aria-label="The answer to the question" className="rounded-[24px] border-l-[6px] border-field-yellow bg-raised px-5 py-4">
        <p className="text-label font-extrabold uppercase tracking-wide text-ink-2">Back to the question</p>
        <p className="mt-1 text-body-lg text-ink">
          <RichText text={deep.hook} />
        </p>
        <p className="mt-2 text-body-lg font-bold text-ink">
          <RichText text={deep.hookAnswer} />
        </p>
      </aside>
    </div>
  );
}
