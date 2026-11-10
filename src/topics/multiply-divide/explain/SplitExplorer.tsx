"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";

const n = (x: number) => x.toLocaleString("en-GB");

/**
 * Try it yourself, hands on: split the rows of a × b anywhere. However you split, the two parts always add up to the
 * same total, which is why splitting into tens and ones works. The slider is a native range input, so it works with
 * touch, mouse and keyboard; the − and + buttons give an exact nudge.
 */
export function SplitExplorer({ a, b }: { a: number; b: number }) {
  const reduce = useReducedMotion();
  const id = useId();
  const [k, setK] = useState(Math.min(10, b - 1));
  const rest = b - k;
  const w = 200;
  const h = 150;
  const topH = (k / b) * h;
  const set = (v: number) => setK(Math.max(1, Math.min(b - 1, v)));

  return (
    <div className="space-y-3 rounded-[20px] bg-raised p-4">
      <label htmlFor={id} className="block text-lg font-bold text-ink">
        Split the {b} rows your way
      </label>
      <svg viewBox={`0 0 ${w + 240} ${h + 8}`} className="h-auto w-full max-w-[520px]" role="img" aria-label={`${a} by ${b} split into ${k} rows and ${rest} rows`}>
        <motion.rect x={4} y={4} width={w} initial={false} animate={{ height: topH }} transition={motionOr(reduce, MOVE)} className="fill-den-soft stroke-den" strokeWidth={2} rx={4} />
        <motion.rect x={4} width={w} initial={false} animate={{ y: 4 + topH, height: h - topH }} transition={motionOr(reduce, MOVE)} className="fill-num-soft stroke-num" strokeWidth={2} rx={4} />
        <motion.text x={w + 16} initial={false} animate={{ y: 4 + topH / 2 + 9 }} transition={motionOr(reduce, MOVE)} fontSize={26} className="fill-den-strong font-extrabold">
          {a} × {k} = {n(a * k)}
        </motion.text>
        <motion.text x={w + 16} initial={false} animate={{ y: 4 + topH + (h - topH) / 2 + 9 }} transition={motionOr(reduce, MOVE)} fontSize={26} className="fill-num-strong font-extrabold">
          {a} × {rest} = {n(a * rest)}
        </motion.text>
      </svg>
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => set(k - 1)} disabled={k <= 1} aria-label="Fewer rows on top">
          −
        </Button>
        <input id={id} type="range" min={1} max={b - 1} value={k} onChange={(e) => set(Number(e.target.value))} aria-valuetext={`${k} rows and ${rest} rows`} className="h-11 min-w-0 flex-1 accent-[var(--color-brand)]" />
        <Button variant="secondary" onClick={() => set(k + 1)} disabled={k >= b - 1} aria-label="More rows on top">
          +
        </Button>
      </div>
      <p aria-live="polite" className="text-lg font-semibold text-ink">
        {n(a * k)} + {n(a * rest)} = <strong>{n(a * b)}</strong>.{" "}
        {k === 10 ? "Splitting into tens and ones gives the easiest sums." : "Any split gives the same total. Tens and ones are the easiest to multiply."}
      </p>
    </div>
  );
}
