"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { useReportWrong } from "@/components/journey/wrong";
import { fromHundredths, twoPlaces } from "../journey";

/**
 * D-050 *Try it* for comparing decimals. Three pairs; the shorter decimal can be given a zero (0.5 → 0.50) with a
 * button, then the child taps the bigger one. A right choice shows both on hundred squares; a wrong one says to look at
 * the tenths and tells the Learn stage, so Kip can offer another way. Every control is a real button, and each result
 * is announced.
 */

const ROUNDS: [number, number][] = [
  [50, 45],
  [62, 70],
  [30, 29],
];

/** A small hundred square with `n` squares shaded. */
function Mini({ n, color, label }: { n: number; color: string; label: string }) {
  return (
    <figure className="m-0 flex flex-col items-center gap-1">
      <svg viewBox="0 0 100 100" className="size-28" role="img" aria-label={label}>
        {Array.from({ length: 100 }, (_, i) => (
          <rect key={i} x={Math.floor(i / 10) * 10} y={(i % 10) * 10} width={10} height={10} fill={i < n ? color : "var(--color-surface)"} stroke="var(--color-line-strong)" strokeWidth={0.6} />
        ))}
        <rect x={0} y={0} width={100} height={100} fill="none" stroke="var(--color-ink)" strokeWidth={2} />
      </svg>
      <figcaption className="text-label font-bold text-ink">{label}</figcaption>
    </figure>
  );
}

export function CompareTry() {
  const reduce = !!useReducedMotion();
  const reportWrong = useReportWrong();
  const [round, setRound] = useState(0);
  const [padded, setPadded] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const done = round >= ROUNDS.length;
  const pair = ROUNDS[Math.min(round, ROUNDS.length - 1)]!;
  const bigger = Math.max(pair[0], pair[1]);
  const shows = (h: number) => (padded ? twoPlaces(h) : fromHundredths(h));
  const right = picked === bigger;

  const choose = (h: number) => {
    setPicked(h);
    if (h === bigger) setNote(`Yes! ${twoPlaces(bigger)} is ${bigger} hundredths, more than ${Math.min(...pair)}.`);
    else {
      setNote("Not quite. Look at the tenths first: which has more tenths?");
      reportWrong();
    }
  };
  const next = () => {
    setRound((r) => r + 1);
    setPadded(false);
    setPicked(null);
    setNote("");
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="display text-heading-2">All three done!</p>
        <p className="text-body font-bold text-ok">You compared from the left, the tenths first. That&apos;s how to beat the &quot;longer is bigger&quot; trap.</p>
        <Button variant="secondary" onClick={() => { next(); setRound(0); }}>Do it again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">Which is bigger?</h2>
        <p className="text-label font-bold text-ink-2">Pair {round + 1} of {ROUNDS.length}</p>
      </div>
      <p className="text-body text-ink-2">Give them the same number of places, then tap the bigger number.</p>
      <div className="grid grid-cols-2 gap-4">
        {pair.map((h, i) => (
          <motion.button
            key={`${round}-${i}`}
            type="button"
            disabled={picked !== null && right}
            onClick={() => choose(h)}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className={`flex min-h-32 flex-col items-center justify-center gap-1 rounded-[24px] border-2 p-4 shadow-[var(--shadow-card)] transition ${picked === h ? (h === bigger ? "border-ok bg-ok-soft" : "border-num bg-num-soft") : "border-line bg-surface hover:border-brand"}`}
            aria-label={`${shows(h)}${picked === h ? (h === bigger ? ", bigger" : ", not bigger") : ""}`}
          >
            <motion.span key={shows(h)} initial={reduce ? false : { scale: 1.25 }} animate={{ scale: 1 }} transition={motionOr(reduce, MOVE)} className="display text-display-2 tabular-nums text-ink">
              {shows(h)}
            </motion.span>
            {picked === h && h === bigger && <CheckIcon size={24} strokeWidth={3} className="text-ok" />}
          </motion.button>
        ))}
      </div>
      {!padded && fromHundredths(pair[0]).length !== fromHundredths(pair[1]).length && (
        <Button variant="secondary" onClick={() => { setPadded(true); setNote("Now both have two places. Compare the tenths, then the hundredths."); }}>
          Add a zero to fill the gap
        </Button>
      )}
      <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${right ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
        {note || "Tip: a longer number isn't always bigger."}
      </p>
      <AnimatePresence initial={false}>
        {right && (
          <motion.div key="squares" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, MOVE)} className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-6">
              <Mini n={pair[0]} color="var(--color-brand)" label={`${twoPlaces(pair[0])}: ${pair[0]} squares`} />
              <Mini n={pair[1]} color="var(--color-num)" label={`${twoPlaces(pair[1])}: ${pair[1]} squares`} />
            </div>
            <Button variant="cta" onClick={next}>{round + 1 < ROUNDS.length ? "Next pair" : "Finish"}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
