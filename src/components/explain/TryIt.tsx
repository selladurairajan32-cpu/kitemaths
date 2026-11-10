"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { KipSays } from "@/components/kid/Kip";
import { RichText } from "@/components/math/RichText";
import { NumberInput } from "@/components/questions/inputs";
import { Button } from "@/components/ui/Button";
import { CheckIcon, RefreshIcon } from "@/components/ui/Icons";
import { playSound } from "@/lib/sound";
import { APPEAR, motionOr } from "./motionTokens";
import { useInstant } from "./timeline";

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
 * Try it yourself (ANIM-001 §2): one part at a time, in big type. A wrong answer gets Kip's kind, specific nudge and a
 * "Show me again" button; a right one ticks the part off and shows the next.
 */
export function TryIt({ blanks, onComplete, onShowMe, done = false }: { blanks: TryItBlank[]; onComplete: () => void; onShowMe?: (blank: number) => void; done?: boolean }) {
  const instant = useInstant();
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
      playSound("correct");
      if (next === blanks.length) onComplete();
    } else {
      setWrong(value);
      playSound("tryAgain");
    }
  };
  const trap = current?.traps?.find((t) => t.value === wrong);

  return (
    <div className="space-y-3">
      <ol className="space-y-2" aria-label="Parts done">
        {blanks.slice(0, solved).map((b) => (
          <motion.li
            key={b.prompt}
            initial={instant ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionOr(instant, APPEAR)}
            className="flex items-center gap-2 rounded-[16px] bg-ok-soft px-4 py-2.5 text-xl font-bold text-ink"
          >
            <CheckIcon size={22} className="shrink-0 text-ok" />
            <span>
              <RichText text={b.prompt} /> <strong>{b.answer.toLocaleString("en-GB")}</strong>
            </span>
          </motion.li>
        ))}
      </ol>

      {current ? (
        <form onSubmit={submit} className="space-y-3 rounded-[22px] border-2 border-brand bg-surface p-4 sm:p-5">
          <p className="text-label font-bold text-ink-2">
            Part {solved + 1} of {blanks.length}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-2xl font-extrabold text-ink">
            <RichText text={current.prompt} />
            <NumberInput value={value} onValue={setValue} locked={false} label={current.prompt.replace(/\*/g, "")} size="lg" />
          </div>
          <Button type="submit" size="lg" disabled={value === null} className="w-full sm:w-auto">
            Check
          </Button>
          <AnimatePresence>
            {wrong !== null && (
              <motion.div key={wrong} role="status" initial={instant ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(instant, APPEAR)} className="space-y-3">
                <KipSays mood="think" tone="sun" size={48}>
                  <span className="text-lg font-bold text-ink">
                    Not quite. <RichText text={trap?.feedback ?? current.hint} />
                  </span>
                </KipSays>
                {onShowMe && (
                  <Button variant="secondary" onClick={() => onShowMe(solved)}>
                    <RefreshIcon size={18} /> Show me again
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      ) : (
        <KipSays mood="cheer" tone="sky" size={52}>
          <span role="status" className="text-lg font-bold text-ink">
            You did it! Every part is right.
          </span>
        </KipSays>
      )}
    </div>
  );
}
