"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { RichText } from "@/components/math/RichText";
import { NumberInput } from "@/components/questions/inputs";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, BulbIcon, CheckIcon } from "@/components/ui/Icons";
import type { LessonStep, WorkedBlank } from "@/lessons/types";
import { useTopic } from "@/topics/context";

type Worked = Extract<LessonStep, { type: "worked" }>;

function BlankStep({
  blank,
  onSolved,
  onStruggle,
}: {
  blank: WorkedBlank;
  onSolved: () => void;
  onStruggle: () => void;
}) {
  const [value, setValue] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [lastWrong, setLastWrong] = useState<number | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value === null || solved) return;
    if (value === blank.answer) {
      setSolved(true);
      onSolved();
    } else {
      setTries((t) => t + 1);
      setLastWrong(value);
      onStruggle();
    }
  };

  if (solved) {
    return (
      <p className="flex items-center gap-2 font-medium text-ok">
        <CheckIcon size={18} /> {blank.prompt.includes("?") ? blank.prompt.replace("?", String(blank.answer)) : `${blank.prompt} ${blank.answer}`}
      </p>
    );
  }

  const trap = blank.traps?.find((t) => t.value === lastWrong);

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-ink-2">{blank.prompt}</span>
        <NumberInput value={value} onValue={setValue} locked={false} label={blank.prompt} size="md" />
        <Button type="submit" variant="secondary" disabled={value === null}>
          Check
        </Button>
      </div>
      <div aria-live="polite">
        {tries > 0 && (
          <div className="space-y-2 rounded-[16px] border border-warn/30 bg-warn-soft px-4 py-3 text-[0.9375rem] text-ink-2">
            <p className="flex gap-2">
              <BulbIcon size={16} className="mt-0.5 shrink-0 text-warn" />
              <span>
                <RichText text={trap?.feedback ?? "Not quite."} /> <RichText text={blank.hint} />
              </span>
            </p>
            {tries >= 2 && (
              <p className="border-t border-warn/20 pt-2">
                <strong className="text-ink">Let&apos;s work it out together: </strong>
                <RichText text={blank.worked} /> Type {blank.answer} to carry on.
              </p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}

export function WorkedExample({ step, onComplete }: { step: Worked; onComplete: () => void }) {
  const { Visual } = useTopic().ui;
  const [revealed, setRevealed] = useState(1);
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [supportFor, setSupportFor] = useState<number | null>(null);
  const current = step.steps[revealed - 1];
  const blocking = !!current?.blank && !solved.has(revealed - 1);
  const allShown = revealed === step.steps.length;
  const done = allShown && !blocking;

  const supportVisual = supportFor !== null && !solved.has(supportFor) ? step.steps[supportFor].blank?.support : undefined;
  const visual = supportVisual ?? [...step.steps.slice(0, revealed)].reverse().find((s) => s.visual)?.visual ?? step.visual;

  const markSolved = (i: number) => {
    setSolved((s) => new Set(s).add(i));
    if (i === step.steps.length - 1) onComplete();
  };

  const next = () => {
    const nextCount = revealed + 1;
    setRevealed(nextCount);
    const last = step.steps[nextCount - 1];
    if (nextCount === step.steps.length && !last.blank) onComplete();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-[0.9375rem] font-semibold ${
            step.support === "full" ? "bg-den-soft text-den-strong" : "bg-example-soft text-example-ink"
          }`}
        >
          {step.support === "full" ? "Watch me" : "Let's do it together"}
        </span>
        <span className="text-[0.9375rem] text-muted">
          Step {revealed} of {step.steps.length}
        </span>
      </div>

      <p className="text-lg font-medium sm:text-xl">
        <RichText text={step.problem} />
      </p>

      {visual !== undefined && (
        <div className="flex justify-center rounded-[20px] bg-paper px-4 py-6">
          <Visual key={JSON.stringify(visual)} spec={visual} />
        </div>
      )}

      <ol className="space-y-3">
        <AnimatePresence initial={false}>
          {step.steps.slice(0, revealed).map((s, i) => (
            <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 rounded-[16px] border border-line bg-surface p-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[0.9375rem] font-semibold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <p className="text-ink-2">
                  <RichText text={s.text} />
                </p>
                {s.blank && <BlankStep blank={s.blank} onSolved={() => markSolved(i)} onStruggle={() => setSupportFor(i)} />}
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {!allShown && (
        <Button variant="secondary" onClick={next} disabled={blocking}>
          Next step <ArrowRightIcon size={17} />
        </Button>
      )}

      {done && (
        <motion.p
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[16px] bg-ok-soft px-4 py-3 text-lg font-medium text-ink"
          aria-live="polite"
        >
          <RichText text={step.conclusion} />
        </motion.p>
      )}
    </div>
  );
}
