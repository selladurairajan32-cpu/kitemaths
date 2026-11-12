"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { useReportWrong } from "@/components/journey/wrong";

/**
 * D-050 *Try it* for percentages of amounts: build the percentage on the bar. The whole amount is ten 10% parts; the
 * child adds 10% parts and a 5% half part with buttons until the bar shows the percentage asked for, and the money
 * adds up as they go. Going past it says so and tells the Learn stage, so Kip can offer another way. Each change is
 * announced.
 */

const ROUNDS = [
  { p: 35, amount: 80 },
  { p: 15, amount: 60 },
  { p: 45, amount: 40 },
];

export function PercentTry() {
  const reduce = !!useReducedMotion();
  const reportWrong = useReportWrong();
  const [round, setRound] = useState(0);
  const [tens, setTens] = useState(0);
  const [half, setHalf] = useState(false);
  const done = round >= ROUNDS.length;
  const { p, amount } = ROUNDS[Math.min(round, ROUNDS.length - 1)]!;
  const part = amount / 10;
  const percent = tens * 10 + (half ? 5 : 0);
  const money = tens * part + (half ? part / 2 : 0);
  const right = percent === p;
  const over = percent > p;

  const add = (kind: "ten" | "five") => {
    if (right) return;
    const next = kind === "ten" ? (tens + 1) * 10 + (half ? 5 : 0) : tens * 10 + 5;
    if (kind === "ten") setTens((n) => Math.min(10, n + 1));
    else setHalf(true);
    if (next > p) reportWrong();
  };
  const reset = () => {
    setTens(0);
    setHalf(false);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="display text-heading-2">All three built!</p>
        <p className="text-body font-bold text-ok">Find 10% by dividing by 10, then build the rest. You did it with your own hands!</p>
        <Button variant="secondary" onClick={() => { setRound(0); reset(); }}>Do it again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">Build {p}% of £{amount}</h2>
        <p className="text-label font-bold text-ink-2">Round {round + 1} of {ROUNDS.length}</p>
      </div>
      <p className="text-body text-ink-2">The bar is £{amount}: ten parts of 10%, so each part is £{amount} ÷ 10 = £{part}. Add parts until the bar shows {p}%.</p>
      <div className="flex h-20 overflow-hidden rounded-[14px] border-[3px] border-ink" role="img" aria-label={`The bar: ${percent}% shaded, £${money}`}>
        {Array.from({ length: 10 }, (_, i) => {
          const full = i < tens;
          const halfHere = i === tens && half;
          return (
            <span key={i} className={`relative flex flex-1 items-center justify-center text-label font-extrabold ${i > 0 ? "border-l-2 border-ink" : ""} ${full ? "text-on-brand" : "text-ink"}`}>
              <motion.span className={`absolute inset-y-0 left-0 ${full ? "bg-brand" : "bg-num"}`} initial={false} animate={{ width: full ? "100%" : halfHere ? "50%" : "0%" }} transition={motionOr(reduce, MOVE)} />
              <span className="relative">£{part}</span>
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => add("ten")} disabled={right || tens >= 10}>+ 10% (£{part})</Button>
        <Button variant="secondary" onClick={() => add("five")} disabled={right || half}>+ 5% (£{part / 2})</Button>
        <Button variant="quiet" onClick={reset}>Start again</Button>
      </div>
      <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${right ? "bg-ok-soft text-ink" : over ? "bg-num-soft text-ink" : "bg-sunk text-ink-2"}`}>
        {right ? `Yes! ${p}% of £${amount} = £${money}.` : over ? `That's ${percent}%: too much. Start again and stop at ${p}%.` : `So far: ${percent}% = £${money}.`}
      </p>
      {right && (
        <Button variant="cta" onClick={() => { setRound((r) => r + 1); reset(); }} className="self-start">
          {round + 1 < ROUNDS.length ? "Next one" : "Finish"}
        </Button>
      )}
    </div>
  );
}
