"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { useReportWrong } from "@/components/journey/wrong";

/**
 * D-050 *Try it* for multiplying fractions: a × b as "a of b" on a chocolate bar. The bar already shows b (columns);
 * the child cuts it the other way into rows with one slider and takes some rows with another. The overlap (a of b)
 * glows, and once the rows match a, the answer is shown as tops × tops over bottoms × bottoms. A slider that goes past
 * the fraction tells the Learn stage, so Kip can offer another way. Each slider is a real control, and the result is
 * announced.
 */

const ROUNDS = [
  { a: { n: 1, d: 3 }, b: { n: 1, d: 2 } },
  { a: { n: 3, d: 4 }, b: { n: 2, d: 3 } },
  { a: { n: 1, d: 2 }, b: { n: 3, d: 4 } },
];
const f = (n: number, d: number) => `{${n}/${d}}`;

export function MultiplyTry() {
  const reduce = !!useReducedMotion();
  const reportWrong = useReportWrong();
  const [round, setRound] = useState(0);
  const [rows, setRows] = useState(1);
  const [taken, setTaken] = useState(0);
  const done = round >= ROUNDS.length;
  const { a, b } = ROUNDS[Math.min(round, ROUNDS.length - 1)]!;
  const right = rows === a.d && taken === a.n;
  const cols = b.d;

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="display text-heading-2">All three made!</p>
        <p className="text-body font-bold text-ok">A fraction times a fraction is a fraction of it: multiply the tops, multiply the bottoms.</p>
        <Button variant="secondary" onClick={() => { setRound(0); setRows(1); setTaken(0); }}>Do it again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">
          Make <RichText text={`${f(a.n, a.d)} of ${f(b.n, b.d)}`} />
        </h2>
        <p className="text-label font-bold text-ink-2">Round {round + 1} of {ROUNDS.length}</p>
      </div>
      <p className="text-body text-ink-2">
        The bar shows <RichText text={f(b.n, b.d)} /> in brown. Cut it the other way into rows, then take <RichText text={f(a.n, a.d)} /> of the rows.
      </p>
      <div className="mx-auto grid aspect-[3/2] w-full max-w-md overflow-hidden rounded-[10px] border-4 border-ink" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }} role="img" aria-label={`${cols} columns and ${rows} rows: ${b.n * taken} of ${cols * rows} pieces glow`}>
        {Array.from({ length: rows * cols }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const inB = c < b.n;
          const glow = inB && r < taken;
          return (
            <motion.span key={`${rows}-${i}`} className={`border border-num-soft ${glow ? "bg-ok-bright" : inB ? "bg-num-strong" : "bg-surface"}`} initial={reduce ? false : { opacity: 0.4 }} animate={{ opacity: 1 }} transition={motionOr(reduce, MOVE)} />
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-body font-bold text-ink">
          Cut into {rows} {rows === 1 ? "row" : "rows"}
          <input type="range" min={1} max={6} value={rows} onChange={(e) => { const v = Number(e.target.value); setRows(v); setTaken((t) => Math.min(t, v)); if (v > a.d) reportWrong(); }} className="h-11 accent-[var(--color-ink)]" aria-valuetext={`${rows} rows`} />
        </label>
        <label className="flex flex-col gap-1 text-body font-bold text-ink">
          Take {taken} {taken === 1 ? "row" : "rows"}
          <input type="range" min={0} max={rows} value={taken} onChange={(e) => setTaken(Number(e.target.value))} className="h-11 accent-[var(--color-ink)]" aria-valuetext={`${taken} of ${rows} rows`} />
        </label>
      </div>
      <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${right ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
        {right ? (
          <RichText text={`Yes! ${f(a.n, a.d)} × ${f(b.n, b.d)} = ${f(a.n * b.n, a.d * b.d)}: ${a.n} × ${b.n} on top, ${a.d} × ${b.d} underneath.`} />
        ) : rows !== a.d ? (
          <RichText text={`Cut into as many rows as the bottom number of ${f(a.n, a.d)} says.`} />
        ) : (
          <RichText text={`Now take as many rows as the top number of ${f(a.n, a.d)} says.`} />
        )}
      </p>
      {right && (
        <Button variant="cta" onClick={() => { setRound((r) => r + 1); setRows(1); setTaken(0); }} className="self-start">
          {round + 1 < ROUNDS.length ? "Next one" : "Finish"}
        </Button>
      )}
    </div>
  );
}
