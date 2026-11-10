"use client";

import { RichText } from "@/components/math/RichText";
import { motion } from "motion/react";
import { useState } from "react";
import { compareSymbol, toWords, type Fraction } from "../math";
import type { VisualSpec } from "../types";
import { FractionNotation } from "@/components/math/FractionNotation";
import { FractionShape } from "./FractionShape";
import { NumberLine } from "@/components/math/NumberLine";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ── Bars that share one whole so lengths can be compared honestly ── */

export function StackedBars({
  rows,
  guide,
}: {
  rows: { f: Fraction; label?: React.ReactNode }[];
  guide?: boolean;
}) {
  const W = 520;
  const rowH = 46;
  const gap = 16;
  const H = rows.length * rowH + (rows.length - 1) * gap;
  const guideX = guide && rows.length ? (rows[0].f.n / rows[0].f.d) * W : null;
  return (
    <div className="flex w-full max-w-[640px] items-stretch gap-3 sm:gap-4">
      <div className="flex flex-col justify-around" style={{ gap }}>
        {rows.map((r, i) => (
          <div key={i} className="grid h-[46px] min-w-12 place-items-center">
            {r.label ?? <FractionNotation n={r.f.n} d={r.f.d} size="sm" />}
          </div>
        ))}
      </div>
      <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} className="h-auto w-full" role="img" aria-label={rows.map((r) => toWords(r.f)).join(", ")}>
        {rows.map((r, ri) => {
          const y = ri * (rowH + gap);
          const pw = W / r.f.d;
          return (
            <g key={ri}>
              {range(r.f.d).map((i) => (
                <motion.rect
                  key={i}
                  x={i * pw}
                  y={y}
                  width={pw}
                  height={rowH}
                  fill={i < r.f.n ? "var(--color-num)" : "#fff"}
                  stroke="var(--color-ink)"
                  strokeWidth={2.5}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: ri * 0.12 + i * 0.03 }}
                />
              ))}
              <rect x={0} y={y} width={W} height={rowH} fill="none" stroke="var(--color-ink)" strokeWidth={3} rx={4} />
            </g>
          );
        })}
        {guideX !== null && (
          <motion.line
            x1={guideX}
            x2={guideX}
            y1={-2}
            y2={H + 2}
            stroke="var(--color-den)"
            strokeWidth={3}
            strokeDasharray="7 6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          />
        )}
      </svg>
    </div>
  );
}

export function CompareBars({ a, b }: { a: Fraction; b: Fraction }) {
  const sym = compareSymbol(a, b);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <StackedBars rows={[{ f: a }, { f: b }]} />
      <p className="flex items-center gap-3 text-lg font-semibold" aria-label={`${toWords(a)} ${sym === "<" ? "is less than" : sym === ">" ? "is greater than" : "equals"} ${toWords(b)}`}>
        <FractionNotation n={a.n} d={a.d} size="sm" />
        <span className="grid size-9 place-items-center rounded-full bg-ink text-white" aria-hidden>
          {sym}
        </span>
        <FractionNotation n={b.n} d={b.d} size="sm" />
      </p>
    </div>
  );
}

export function EquivalentBars({ fractions }: { fractions: Fraction[] }) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <StackedBars rows={fractions.map((f) => ({ f }))} guide />
      <p className="text-label text-muted">The dashed line shows the shaded amount is identical on every bar.</p>
    </div>
  );
}

export function FractionWall({ denominators, highlight = [] }: { denominators: number[]; highlight?: number[] }) {
  const W = 560;
  const rowH = 38;
  const H = denominators.length * rowH;
  return (
    <svg viewBox={`-2 -2 ${W + 4} ${H + 4}`} className="h-auto w-full max-w-[640px]" role="img" aria-label={`Fraction wall showing ${denominators.map((d) => (d === 1 ? "one whole" : partNamePlural(d))).join(", ")}`}>
      {denominators.map((d, ri) => {
        const pw = W / d;
        const y = ri * rowH;
        const hl = highlight.includes(d);
        return (
          <motion.g key={d} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ri * 0.08 }}>
            {range(d).map((i) => (
              <g key={i}>
                <rect
                  x={i * pw}
                  y={y}
                  width={pw}
                  height={rowH}
                  fill={hl && i === 0 ? "var(--color-num)" : ri % 2 ? "var(--color-raised)" : "#ffffff"}
                  stroke="var(--color-ink)"
                  strokeWidth={2.2}
                />
                <text
                  x={i * pw + pw / 2}
                  y={y + rowH / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={d >= 8 ? 13 : 15}
                  fontWeight={600}
                  fill={hl && i === 0 ? "#fff" : "var(--color-ink-2)"}
                >
                  {d === 1 ? "1 whole" : `1/${d}`}
                </text>
              </g>
            ))}
          </motion.g>
        );
      })}
    </svg>
  );
}

function partNamePlural(d: number) {
  return toWords({ n: 2, d }).replace("two ", "");
}

export function Counters({ amount, groups, highlight }: { amount: number; groups: number; highlight: number }) {
  const per = amount / groups;
  const cols = per <= 4 ? 2 : per <= 9 ? 3 : 4;
  return (
    <div className="w-full" role="img" aria-label={`${amount} counters shared into ${groups} equal groups of ${per}. ${highlight} group${highlight === 1 ? "" : "s"} highlighted, making ${highlight * per}.`}>
      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
        {range(groups).map((g) => {
          const on = g < highlight;
          return (
            <motion.div
              key={g}
              layout
              className={`flex flex-col items-center gap-1.5 rounded-[16px] border-2 p-2.5 transition-colors ${
                on ? "border-num bg-num-soft" : "border-dashed border-line-strong bg-surface"
              }`}
            >
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {range(per).map((i) => (
                  <motion.span
                    key={i}
                    className={`block size-5 rounded-full border-2 sm:size-6 ${on ? "border-num-strong bg-num" : "border-ink-2 bg-white"}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (g * per + i) * 0.02, duration: 0.2, ease: "easeOut" }}
                  />
                ))}
              </div>
              <span className={`text-label font-semibold ${on ? "text-num-strong" : "text-muted"}`}>{per}</span>
            </motion.div>
          );
        })}
      </div>
      {highlight > 0 && (
        <p className="mt-3 text-center text-label text-ink-2">
          {highlight} group{highlight === 1 ? "" : "s"} of {per} = <strong>{highlight * per}</strong>
        </p>
      )}
    </div>
  );
}

function Pizza() {
  return (
    <svg viewBox="0 0 100 100" className="size-12 sm:size-20" aria-hidden>
      <circle cx="50" cy="50" r="44" fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="36" fill="var(--color-num)" />
      {[[38, 36], [62, 40], [46, 62], [66, 62], [30, 56], [54, 28]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="var(--color-sun-soft)" />
      ))}
    </svg>
  );
}
function Chocolate() {
  return (
    <svg viewBox="0 0 120 70" className="h-9 w-16 sm:h-16 sm:w-28" aria-hidden>
      <rect x="4" y="6" width="112" height="58" rx="6" fill="#7a4a32" stroke="var(--color-ink)" strokeWidth="2.5" />
      {range(4).map((c) =>
        range(2).map((r) => <rect key={`${c}${r}`} x={10 + c * 26.5} y={12 + r * 25} width="22" height="21" rx="3" fill="#8f5a3e" stroke="#5f3826" strokeWidth="1.5" />),
      )}
    </svg>
  );
}
function Ribbon() {
  return (
    <svg viewBox="0 0 140 50" className="h-8 w-18 sm:h-14 sm:w-32" aria-hidden>
      <path d="M6 18 h128 v14 h-128 Z" fill="var(--color-sky)" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M6 18 l-4 7 4 7 M134 18 l4 7 -4 7" fill="none" stroke="var(--color-ink)" strokeWidth="2" />
    </svg>
  );
}
function Marbles() {
  return (
    <svg viewBox="0 0 110 70" className="h-9 w-16 sm:h-16 sm:w-28" aria-hidden>
      {[[22, 48], [46, 48], [70, 48], [34, 26], [58, 26], [90, 48]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="10" fill={["var(--color-den)", "var(--color-num)", "var(--color-ok-bright)", "var(--color-sun-strong)", "var(--color-sky)", "var(--color-den)"][i]} stroke="var(--color-ink)" strokeWidth="2" />
      ))}
    </svg>
  );
}

export function EverydayWholes() {
  const items = [
    { el: <Pizza />, label: "a whole pizza" },
    { el: <Chocolate />, label: "a whole chocolate bar" },
    { el: <Ribbon />, label: "a whole ribbon" },
    { el: <Marbles />, label: "a whole bag of 6 marbles" },
  ];
  return (
    <ul className="grid w-full grid-cols-1 gap-2 min-[400px]:grid-cols-2 sm:grid-cols-4 sm:gap-3">
      {items.map((it, i) => (
        <motion.li
          key={it.label}
          className="flex items-center gap-3 rounded-[16px] border border-line bg-surface px-3 py-2.5 sm:flex-col sm:gap-2 sm:py-4 sm:text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="grid w-16 shrink-0 place-items-center sm:h-20 sm:w-auto">{it.el}</div>
          <span className="text-label leading-snug text-ink-2">{it.label}</span>
        </motion.li>
      ))}
    </ul>
  );
}

export function SplitDemo() {
  const [people, setPeople] = useState(1);
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div role="radiogroup" aria-label="Share the chocolate bar between" className="flex flex-wrap justify-center gap-1.5">
        {[1, 2, 3, 4, 5, 6, 8].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={people === n}
            onClick={() => setPeople(n)}
            className={`h-11 min-w-11 rounded-[16px] px-3 text-label font-semibold transition-colors ${
              people === n ? "bg-ink text-white" : "border border-line-strong bg-surface hover:bg-sunk"
            }`}
          >
            {n === 1 ? "1 person" : n}
          </button>
        ))}
      </div>
      <motion.div key={people} className="w-full" initial={{ scaleX: 0.96, opacity: 0.4 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        <FractionShape diagram={{ shape: "bar", parts: people, shaded: [0] }} size="lg" className="mx-auto" />
      </motion.div>
      <p className="text-center text-ink-2" aria-live="polite">
        {people === 1 ? (
          <>One person keeps the <strong>whole</strong> bar.</>
        ) : (
          <>
            Shared between {people}: <strong>{people} equal parts</strong>. Each person gets{" "}
            <FractionNotation n={1} d={people} size="inline" /> ({toWords({ n: 1, d: people })}).
          </>
        )}
      </p>
    </div>
  );
}

export function FairUnfair() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:gap-6">
      <figure className="flex flex-col items-center gap-3 rounded-[16px] border-2 border-ok/40 bg-ok-soft/50 p-4">
        <FractionShape diagram={{ shape: "circle", parts: 4 }} size="sm" label="A pizza cut into 4 equal slices" />
        <figcaption className="text-center text-label">
          <span className="font-semibold text-ok">Fair ✓</span>
          <br />4 equal slices — these are quarters
        </figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-3 rounded-[16px] border-2 border-num/40 bg-num-soft/50 p-4">
        <FractionShape diagram={{ shape: "circle", parts: 4, sizes: [3, 1, 2, 2] }} size="sm" label="A pizza cut into 4 unequal slices" />
        <figcaption className="text-center text-label">
          <span className="font-semibold text-num-strong">Not fair ✗</span>
          <br />4 slices, but not equal — not quarters
        </figcaption>
      </figure>
    </div>
  );
}

export function Anatomy({ fraction }: { fraction: Fraction }) {
  const [focus, setFocus] = useState<"num" | "den" | null>(null);
  const shaded = range(fraction.n);
  return (
    <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
      <div className="flex items-center gap-3">
        <FractionNotation n={fraction.n} d={fraction.d} size="xl" />
        <div className="flex flex-col gap-6 text-label">
          <button
            type="button"
            onClick={() => setFocus(focus === "num" ? null : "num")}
            aria-pressed={focus === "num"}
            className={`rounded-[16px] border-2 px-3 py-2 text-left transition-colors ${focus === "num" ? "border-num bg-num-soft" : "border-transparent hover:bg-sunk"}`}
          >
            <span className="block font-semibold text-num-strong">Numerator</span>
            <span className="text-ink-2">parts we&apos;re talking about</span>
          </button>
          <button
            type="button"
            onClick={() => setFocus(focus === "den" ? null : "den")}
            aria-pressed={focus === "den"}
            className={`rounded-[16px] border-2 px-3 py-2 text-left transition-colors ${focus === "den" ? "border-den bg-den-soft" : "border-transparent hover:bg-sunk"}`}
          >
            <span className="block font-semibold text-den">Denominator</span>
            <span className="text-ink-2">equal parts in the whole</span>
          </button>
        </div>
      </div>
      <div className="flex w-full max-w-[360px] flex-col items-center gap-2">
        <FractionShape
          key={focus ?? "none"}
          diagram={{ shape: "bar", parts: fraction.d, shaded }}
          countParts={focus === "den" ? true : focus === "num" ? shaded : false}
          size="md"
        />
        <p className="text-label text-muted">{focus ? "Tap again to hide the counting." : "Tap a label to count the parts."}</p>
      </div>
    </div>
  );
}

export function VisualRenderer({ spec }: { spec: VisualSpec }) {
  switch (spec.type) {
    case "diagram":
      return (
        <figure className="flex w-full flex-col items-center gap-3">
          <FractionShape key={String(spec.countParts)} diagram={spec.diagram} countParts={spec.countParts} size="md" />
          {spec.caption && (
            <figcaption className="text-lg font-semibold text-ink-2">
              <RichText text={spec.caption} />
            </figcaption>
          )}
        </figure>
      );
    case "everyday":
      return <EverydayWholes />;
    case "split-demo":
      return <SplitDemo />;
    case "fair-unfair":
      return <FairUnfair />;
    case "anatomy":
      return <Anatomy fraction={spec.fraction} />;
    case "compare-bars":
      return <CompareBars a={spec.a} b={spec.b} />;
    case "wall":
      return <FractionWall denominators={spec.denominators} highlight={spec.highlight} />;
    case "equivalent-bars":
      return <EquivalentBars fractions={spec.fractions} />;
    case "number-line":
      return <NumberLine key={String(spec.countGaps)} intervals={spec.intervals} point={spec.point} countGaps={spec.countGaps} size="md" />;
    case "counters":
      return <Counters amount={spec.amount} groups={spec.groups} highlight={spec.highlight} />;
  }
}
