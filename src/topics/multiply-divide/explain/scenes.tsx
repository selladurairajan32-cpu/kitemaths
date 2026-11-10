"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import type { LongMultiplication } from "@/maths/long-multiplication";
import { APPEAR, MOVE, STAGGER, motionOr } from "@/components/explain/motionTokens";
import { columnSteps } from "./captions";
import { toneFor } from "./tones";

const n = (x: number) => x.toLocaleString("en-GB");

/* ───────────── Method 1 · In real life: rows of chairs in a hall ───────────── */

/** Chairs in a hall: b rows of a. The rows split into the parts of b; each block is counted as a × part. */
export function HallScene({ m, step }: { m: LongMultiplication; step: number }) {
  const reduce = useReducedMotion();
  const chair = `chair${useId().replace(/:/g, "")}`;
  const cell = 14;
  const left = 10;
  const gap = 20;
  const parts = m.bParts;
  const split = step >= 1;
  const lastStep = parts.length + 2;
  const width = left * 2 + m.a * cell;
  const mid = left + (m.a * cell) / 2;
  const label = (p: number, shown: boolean) => (shown ? `${p} rows of ${m.a} = ${n(m.a * p)}` : `${p} rows`);
  /** Pill width for a label: about 10 units a character at this size, plus padding. */
  const pill = (t: string) => t.length * 10 + 28;
  const height = m.b * cell + gap * (parts.length - 1) + 54;
  const starts = parts.map((_, k) => parts.slice(0, k).reduce((s, p) => s + p, 0));

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[440px]" role="img" aria-label={`${m.b} rows of ${m.a} chairs, split into ${parts.map((p) => `${p} rows`).join(" and ")}`}>
        <defs>
          {/* One chair: a back, a seat and two legs, drawn in a 10 × 10 box. */}
          <symbol id={chair} viewBox="0 0 10 10" width={cell - 3} height={cell - 3}>
            <rect x="1.5" y="0" width="7" height="4.6" rx="1.4" />
            <rect x="0.5" y="4.9" width="9" height="2.4" rx="1" />
            <rect x="1.2" y="7" width="1.6" height="3" rx="0.6" />
            <rect x="7.2" y="7" width="1.6" height="3" rx="0.6" />
          </symbol>
        </defs>
        {parts.map((p, k) => {
          const y0 = starts[k]! * cell;
          const tone = toneFor(p);
          const lit = step === k + 2 || step === lastStep;
          const shown = step >= k + 2;
          const blockH = p * cell;
          return (
            <motion.g key={p} initial={false} animate={{ y: split ? k * gap : 0 }} transition={motionOr(reduce, MOVE)}>
              <rect x={left - 6} y={y0 - 4} width={m.a * cell + 8} height={blockH + 6} rx={8} className={`transition-[fill,stroke] duration-300 ${split ? `${tone.soft} ${lit ? tone.edge : "stroke-transparent"}` : "fill-transparent stroke-transparent"}`} strokeWidth={2.5} />
              <g className={`transition-[fill] duration-300 ${shown ? tone.ink : "fill-ink-2"}`}>
                {Array.from({ length: p }, (_, r) =>
                  Array.from({ length: m.a }, (_, c) => <use key={`${r}-${c}`} href={`#${chair}`} x={left + c * cell} y={y0 + r * cell} />),
                )}
              </g>
              {split && (
                <motion.g key={shown ? "count" : "rows"} initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={motionOr(reduce, APPEAR)} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                  {/* A label over the block, so it stays readable on a phone. */}
                  <rect x={mid - pill(label(p, shown)) / 2} y={y0 + blockH / 2 - 16} width={pill(label(p, shown))} height={32} rx={16} className={`fill-surface ${tone.edge}`} strokeWidth={2} />
                  <text x={mid} y={y0 + blockH / 2 + 6} textAnchor="middle" fontSize={18} className={`${tone.ink} font-extrabold`}>
                    {label(p, shown)}
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
        {step === lastStep && (
          <motion.text initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, APPEAR)} x={mid} y={height - 12} textAnchor="middle" fontSize={20} className="fill-ink font-extrabold">
            {parts.map((p) => n(m.a * p)).join(" + ")} = {n(m.total)} chairs
          </motion.text>
        )}
      </svg>
    </figure>
  );
}

/* ───────────── Method 2 · Picture it: the area model ───────────── */

/** Widths of the parts on screen: in proportion, but never so thin that the number inside can't be read. */
function shares(parts: number[], total: number, min = 0.26): number[] {
  const raw = parts.map((p) => Math.max(p / total, min));
  const sum = raw.reduce((s, x) => s + x, 0);
  return raw.map((x) => x / sum);
}

export function AreaScene({ m, step }: { m: LongMultiplication; step: number }) {
  const reduce = useReducedMotion();
  const left = 56;
  const top = 40;
  const w = 264;
  const h = 190;
  const right = 110;
  const width = left + w + right;
  const height = top + h + 50;
  const xs = shares(m.aParts, m.a);
  const ys = shares(m.bParts, m.b);
  const xAt = (i: number) => left + xs.slice(0, i).reduce((s, x) => s + x * w, 0);
  const yAt = (i: number) => top + ys.slice(0, i).reduce((s, x) => s + x * h, 0);
  const split = step >= 1;

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[520px]" role="img" aria-label={`A rectangle ${m.a} by ${m.b}${split ? `, split into pieces ${m.cells.map((c) => `${c.aPart} by ${c.bPart}`).join(", ")}` : ""}`}>
        {m.cells.map((c, i) => {
          const tone = toneFor(c.bPart);
          const filled = step >= 2;
          return (
            <g key={`${c.row}-${c.col}`}>
              <motion.rect
                x={xAt(c.col)}
                y={yAt(c.row)}
                width={xs[c.col]! * w}
                height={ys[c.row]! * h}
                initial={false}
                animate={{ opacity: filled ? 1 : 0 }}
                transition={motionOr(reduce, { ...APPEAR, delay: filled && step === 2 ? i * STAGGER : 0 })}
                className={tone.soft}
              />
              {filled && (
                <motion.text
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={motionOr(reduce, { ...MOVE, delay: step === 2 ? i * STAGGER + 0.1 : 0 })}
                  x={xAt(c.col) + (xs[c.col]! * w) / 2}
                  y={yAt(c.row) + (ys[c.row]! * h) / 2 + 7}
                  textAnchor="middle"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  fontSize={20} className={`${tone.ink} font-extrabold`}
                >
                  {n(c.product)}
                </motion.text>
              )}
            </g>
          );
        })}
        <rect x={left} y={top} width={w} height={h} className="fill-none stroke-ink" strokeWidth={2.5} rx={3} />
        {split &&
          m.aParts.slice(1).map((_, i) => (
            <motion.line key={`v${i}`} x1={xAt(i + 1)} x2={xAt(i + 1)} y1={top} y2={top + h} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={motionOr(reduce, { duration: 0.6, ease: "easeInOut" })} className="stroke-ink" strokeWidth={2} strokeDasharray="6 5" />
          ))}
        {split &&
          m.bParts.slice(1).map((_, i) => (
            <motion.line key={`h${i}`} x1={left} x2={left + w} y1={yAt(i + 1)} y2={yAt(i + 1)} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={motionOr(reduce, { duration: 0.6, ease: "easeInOut", delay: 0.3 })} className="stroke-ink" strokeWidth={2} strokeDasharray="6 5" />
          ))}
        {/* Side labels: the whole numbers first, then their parts. */}
        {split ? (
          <>
            {m.aParts.map((p, i) => (
              <motion.text key={`a${p}`} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, APPEAR)} x={xAt(i) + (xs[i]! * w) / 2} y={top - 12} textAnchor="middle" fontSize={18} className="fill-ink font-extrabold">
                {p}
              </motion.text>
            ))}
            {m.bParts.map((p, i) => (
              <motion.text key={`b${p}`} initial={reduce ? false : { opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={motionOr(reduce, APPEAR)} x={left - 12} y={yAt(i) + (ys[i]! * h) / 2 + 6} textAnchor="end" fontSize={18} className={`${toneFor(p).ink} font-extrabold`}>
                {p}
              </motion.text>
            ))}
          </>
        ) : (
          <>
            <text x={left + w / 2} y={top - 12} textAnchor="middle" fontSize={18} className="fill-ink font-extrabold">
              {m.a}
            </text>
            <text x={left - 12} y={top + h / 2 + 6} textAnchor="end" fontSize={18} className="fill-ink font-extrabold">
              {m.b}
            </text>
          </>
        )}
        {step >= 3 &&
          m.bParts.map((p, i) => (
            <motion.text
              key={`sum${p}`}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={motionOr(reduce, { ...APPEAR, delay: step === 3 ? i * STAGGER * 2 : 0 })}
              x={left + w + 14}
              y={yAt(i) + (ys[i]! * h) / 2 + 6}
              fontSize={18} className={`${toneFor(p).ink} font-extrabold`}
            >
              = {n(m.a * p)}
            </motion.text>
          ))}
        {step >= 4 && (
          <motion.text initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, APPEAR)} x={left + w / 2} y={height - 10} textAnchor="middle" fontSize={20} className="fill-ink font-extrabold">
            {m.bParts.map((p) => n(m.a * p)).join(" + ")} = {n(m.total)}
          </motion.text>
        )}
      </svg>
      {split && <figcaption className="text-label font-semibold text-ink-2">Pieces are drawn big enough to read, not to scale.</figcaption>}
    </figure>
  );
}

/* ───────────── Method 3 · Step by step: the column method ───────────── */

export function ColumnScene({ m, step }: { m: LongMultiplication; step: number }) {
  const reduce = useReducedMotion();
  const steps = columnSteps(m);
  const at = (row: number, kind: "zero" | "row") => steps.findIndex((s) => s.row === row && s.kind === kind);
  const sumAt = steps.findIndex((s) => s.kind === "sum");
  const cols = Math.max(String(m.total).length, String(m.a).length, String(m.b).length + 1) + 1;
  const cell = 42;
  const left = 10;
  const tagX = left + cols * cell + 16;
  const width = tagX + 120;
  const rowY = (r: number) => 44 + r * 60;
  const firstProduct = 2;
  const sumRow = firstProduct + m.rows.length;
  const height = rowY(m.rows.length > 1 ? sumRow : sumRow - 1) + 26;
  const xOf = (fromRight: number) => left + (cols - 1 - fromRight) * cell + cell / 2;
  const digits = (x: number) => String(x).split("").reverse().map(Number);
  const current = steps[step];

  const Digit = ({ value, fromRight, y, delay = 0, className = "fill-ink", drop = false }: { value: number | string; fromRight: number; y: number; delay?: number; className?: string; drop?: boolean }) => (
    <motion.text
      initial={reduce ? false : { opacity: 0, y: drop ? y - 26 : y + 8 }}
      animate={{ opacity: 1, y }}
      transition={motionOr(reduce, { ...(drop ? MOVE : APPEAR), delay })}
      x={xOf(fromRight)}
      textAnchor="middle"
      fontSize={28} className={`${className} font-extrabold`}
    >
      {value}
    </motion.text>
  );

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full max-w-[460px]" role="img" aria-label={`${m.a} times ${m.b} written in columns`}>
        {/* Highlight the row being worked on. */}
        {current && current.row >= 0 && (
          <motion.rect initial={false} animate={{ y: rowY(firstProduct + current.row) - 38 }} transition={motionOr(reduce, MOVE)} x={left - 4} width={cols * cell + 8} height={50} rx={10} className={toneFor(m.rows[current.row]!.multiplier).soft} />
        )}
        {current?.kind === "sum" && <rect x={left - 4} y={rowY(sumRow) - 38} width={cols * cell + 8} height={50} rx={10} className="fill-ok-soft" />}

        {digits(m.a).map((d, j) => (
          <text key={`a${j}`} x={xOf(j)} y={rowY(0)} textAnchor="middle" fontSize={28} className="fill-ink font-extrabold">
            {d}
          </text>
        ))}
        <text x={xOf(String(m.b).length)} y={rowY(1)} textAnchor="middle" fontSize={28} className="fill-ink-2 font-extrabold">
          ×
        </text>
        {digits(m.b).map((d, j) => (
          <text key={`b${j}`} x={xOf(j)} y={rowY(1)} textAnchor="middle" fontSize={28} className={`${d ? toneFor(d * 10 ** j).ink : "fill-ink"} font-extrabold`}>
            {d}
          </text>
        ))}
        <line x1={left} x2={left + cols * cell} y1={rowY(1) + 14} y2={rowY(1) + 14} className="stroke-ink" strokeWidth={2.5} />

        {m.rows.map((r, k) => {
          const y = rowY(firstProduct + k);
          const tone = toneFor(r.multiplier);
          const zeroShown = r.zeros > 0 && step >= at(k, "zero");
          const rowShown = step >= at(k, "row");
          const animating = step === at(k, "row");
          return (
            <g key={r.multiplier}>
              {zeroShown && Array.from({ length: r.zeros }, (_, z) => <Digit key={`z${z}`} value={0} fromRight={z} y={y} drop className={tone.ink} />)}
              {rowShown &&
                r.columns.map((c, j) => (
                  <g key={`d${j}`}>
                    {c.carryIn > 0 && (
                      <motion.text initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(reduce, { ...APPEAR, delay: animating ? (j - 0.5) * STAGGER * 2 : 0 })} x={xOf(j + r.zeros)} y={y - 27} textAnchor="middle" fontSize={15} className={`${tone.ink} font-extrabold`}>
                        {c.carryIn}
                      </motion.text>
                    )}
                    <Digit value={c.written} fromRight={j + r.zeros} y={y} delay={animating ? j * STAGGER * 2 : 0} />
                  </g>
                ))}
              {rowShown && (
                <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(reduce, APPEAR)}>
                  <rect x={tagX} y={y - 24} width={104} height={32} rx={16} className={`${tone.soft} ${tone.edge}`} strokeWidth={1.5} />
                  <text x={tagX + 52} y={y - 2} textAnchor="middle" fontSize={16} className={`${tone.ink} font-extrabold`}>
                    {m.a} × {n(r.multiplier)}
                  </text>
                </motion.g>
              )}
            </g>
          );
        })}

        {m.rows.length > 1 && (
          <>
            <line x1={left} x2={left + cols * cell} y1={rowY(sumRow - 1) + 14} y2={rowY(sumRow - 1) + 14} className="stroke-ink" strokeWidth={2.5} />
            {step >= sumAt &&
              m.sum.map((s, j) => (
                <g key={`s${j}`}>
                  {s.carryIn > 0 && (
                    <motion.text initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(reduce, { ...APPEAR, delay: step === sumAt ? (j - 0.5) * STAGGER * 2 : 0 })} x={xOf(j)} y={rowY(sumRow) - 27} textAnchor="middle" fontSize={15} className="fill-ok font-extrabold">
                      {s.carryIn}
                    </motion.text>
                  )}
                  <Digit value={s.written} fromRight={j} y={rowY(sumRow)} delay={step === sumAt ? j * STAGGER * 2 : 0} className="fill-ok" />
                </g>
              ))}
          </>
        )}
      </svg>
    </figure>
  );
}
