"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";
import { RichText } from "@/components/math/RichText";
import { NumberInput } from "@/components/questions/inputs";
import { Button } from "@/components/ui/Button";
import { BulbIcon, CheckIcon } from "@/components/ui/Icons";
import { APPEAR, motionOr } from "./motionTokens";

export interface TryItBlank {
  /** What to work out, e.g. "**34 × 2** =". */
  prompt: string;
  answer: number;
  /** A nudge in plain words, shown after a wrong answer. */
  hint: string;
  /** Answers that show a known slip, with what to say about them. */
  traps?: { value: number; feedback: string }[];
}

/**
 * Try it yourself (ANIM-001 §2): the learner works each part in turn. A wrong answer gets a kind, specific nudge and
 * the offer of another way to see it; a right one reveals the next part.
 */
export function TryIt({
  blanks,
  onComplete,
  onExplainDifferently,
  done = false,
}: {
  blanks: TryItBlank[];
  onComplete: () => void;
  onExplainDifferently?: () => void;
  done?: boolean;
}) {
  const reduce = useReducedMotion();
  const [solved, setSolved] = useState(done ? blanks.length : 0);
  const [value, setValue] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const current = blanks[solved];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!current || value === null) return;
    if (value === current.answer) {
      const next = solved + 1;
      setSolved(next);
      setValue(null);
      setWrong(null);
      if (next === blanks.length) onComplete();
    } else {
      setWrong(value);
    }
  };
  const trap = current?.traps?.find((t) => t.value === wrong);

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {blanks.slice(0, solved).map((b) => (
          <motion.li
            key={b.prompt}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionOr(reduce, APPEAR)}
            className="flex items-center gap-2 rounded-[16px] bg-ok-soft px-4 py-2.5 text-lg font-semibold text-ink"
          >
            <CheckIcon size={20} className="shrink-0 text-ok" />
            <span>
              <RichText text={b.prompt} /> <strong>{b.answer.toLocaleString("en-GB")}</strong>
            </span>
          </motion.li>
        ))}
      </ol>

      {current ? (
        <form onSubmit={submit} className="space-y-3 rounded-[20px] border-2 border-brand bg-surface p-4">
          <div className="flex flex-wrap items-center gap-3 text-xl font-bold text-ink">
            <RichText text={current.prompt} />
            <NumberInput value={value} onValue={setValue} locked={false} label={current.prompt.replace(/\*/g, "")} size="md" />
            <Button type="submit" disabled={value === null}>
              Check
            </Button>
          </div>
          <AnimatePresence>
            {wrong !== null && (
              <motion.div
                key={wrong}
                role="status"
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={motionOr(reduce, APPEAR)}
                className="space-y-2 rounded-[16px] bg-hint-soft p-3 text-lg text-hint-ink"
              >
                <p className="flex gap-2 font-semibold">
                  <BulbIcon size={20} className="mt-1 shrink-0" />
                  <span>
                    Not quite. <RichText text={trap?.feedback ?? current.hint} />
                  </span>
                </p>
                {onExplainDifferently && (
                  <Button variant="secondary" onClick={onExplainDifferently}>
                    Explain it differently
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      ) : (
        <p role="status" className="flex items-center gap-2 text-lg font-bold text-ok">
          <CheckIcon size={20} /> You did it! Every part is right.
        </p>
      )}
    </div>
  );
}
