"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { MOVE, motionOr, STAGGER } from "@/components/explain/motionTokens";
import { FractionNotation } from "@/components/math/FractionNotation";
import { partName, type Fraction } from "@/maths/fraction";

/**
 * D-060: fraction bars, the hands-on model of the lesson canvas. A bar is one whole. Cutting it makes more, smaller
 * pieces but never changes how much is shaded, which is the whole idea of equivalent fractions. Two bars can only be
 * counted together when their pieces are the same size, so the cut lines of matched bars line up down the page.
 *
 * Every movement shows maths: cut lines draw from top to bottom when a bar is cut, and pieces drop into the "together"
 * bar one at a time, the way you would count them.
 */

/** Something that appears because of what the child just did: it is brought into view, clear of the bar at the bottom. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    ref.current?.scrollIntoView?.({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);
  return (
    <div ref={ref} className={`scroll-mb-52 ${className}`}>
      {children}
    </div>
  );
}

export type BarTone = "a" | "b" | "guess";
const FILL: Record<BarTone, string> = { a: "fill-den", b: "fill-num", guess: "fill-sun" };
const EDGE: Record<BarTone, string> = { a: "border-den", b: "border-num", guess: "border-sun-strong" };
const W = 600;
const H = 60;
const SLIM = 44;
const PAD = 3;
const INNER = W - PAD * 2;
/** The most a child can cut each piece into: enough for every pair the questions use (sixths and fifths to thirtieths). */
export const MAX_CUT = 6;

const Frame = ({ clip, h = H }: { clip: string; h?: number }) => (
  <>
    <clipPath id={clip}>
      <rect x={PAD} y={PAD} width={INNER} height={h - PAD * 2} rx={12} />
    </clipPath>
    <rect x={PAD} y={PAD} width={INNER} height={h - PAD * 2} rx={12} className="fill-surface" />
  </>
);
const Outline = ({ h = H }: { h?: number }) => <rect x={PAD} y={PAD} width={INNER} height={h - PAD * 2} rx={12} fill="none" strokeWidth={3} className="stroke-ink" />;

/** One whole, with `f` shaded, each of its pieces cut into `cut`. */
export function FractionBar({ f, cut = 1, tone, label, slim = false }: { f: Fraction; cut?: number; tone: BarTone; label: string; slim?: boolean }) {
  const clip = useId();
  const H = slim ? SLIM : 60;
  const reduce = useReducedMotion();
  const total = f.d * cut;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block w-full">
      <Frame clip={clip} h={H} />
      <g clipPath={`url(#${clip})`}>
        <rect x={PAD} y={PAD} width={(INNER * f.n) / f.d} height={H - PAD * 2} className={FILL[tone]} />
        {Array.from({ length: total - 1 }, (_, k) => {
          const i = k + 1;
          const x = PAD + (INNER * i) / total;
          const first = i % cut === 0;
          return (
            <motion.line
              key={`${total}:${i}`}
              x1={x}
              x2={x}
              y1={PAD}
              y2={H - PAD}
              strokeWidth={first ? 3 : 1.5}
              className="stroke-ink"
              initial={first || reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: first ? 1 : 0.7 }}
              transition={motionOr(reduce, MOVE)}
            />
          );
        })}
      </g>
      <Outline h={H} />
    </svg>
  );
}

/**
 * The two amounts put end to end. Before the pieces match (`d` not given) they are just two lengths, which can be seen
 * but not named. Once both are in `d` equal pieces, each piece drops in, in turn, and can be counted.
 */
export function TogetherBar({ a, b, d, label, slim = false }: { a: Fraction; b: Fraction; d?: number; label: string; slim?: boolean }) {
  const reduce = useReducedMotion();
  const H = slim ? SLIM : 60;
  const clip = useId();
  if (!d) {
    const wa = (INNER * a.n) / a.d;
    const wb = (INNER * b.n) / b.d;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block w-full">
        <Frame clip={clip} h={H} />
        <g clipPath={`url(#${clip})`}>
          <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(reduce, MOVE)}>
            <rect x={PAD} y={PAD} width={wa} height={H - PAD * 2} className={FILL.a} />
          </motion.g>
          <motion.g initial={reduce ? false : { x: -wa, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={motionOr(reduce, { ...MOVE, delay: STAGGER * 3 })}>
            <rect x={PAD + wa} y={PAD} width={wb} height={H - PAD * 2} className={FILL.b} />
          </motion.g>
          <line x1={PAD + wa} x2={PAD + wa} y1={PAD} y2={H - PAD} strokeWidth={3} className="stroke-ink" />
        </g>
        <Outline h={H} />
      </svg>
    );
  }
  const an = (a.n * d) / a.d;
  const bn = (b.n * d) / b.d;
  const wholes = Math.max(1, Math.ceil((an + bn) / d));
  const step = Math.min(STAGGER / 2, 1.2 / (an + bn));
  return (
    <div className="flex flex-col gap-2" role="img" aria-label={label}>
      {Array.from({ length: wholes }, (_, w) => (
        <svg key={w} viewBox={`0 0 ${W} ${H}`} aria-hidden className="block w-full">
          <Frame clip={`${clip}${w}`} h={H} />
          <g clipPath={`url(#${clip}${w})`}>
            {Array.from({ length: d }, (_, k) => {
              const i = w * d + k;
              if (i >= an + bn) return null;
              return (
                <motion.g key={i} initial={reduce ? false : { y: -H, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={motionOr(reduce, { ...MOVE, delay: i * step })}>
                  <rect x={PAD + (INNER * k) / d} y={PAD} width={INNER / d} height={H - PAD * 2} className={i < an ? FILL.a : FILL.b} />
                </motion.g>
              );
            })}
            {Array.from({ length: d - 1 }, (_, k) => (
              <line key={k} x1={PAD + (INNER * (k + 1)) / d} x2={PAD + (INNER * (k + 1)) / d} y1={PAD} y2={H - PAD} strokeWidth={1.5} className="stroke-ink" opacity={0.7} />
            ))}
          </g>
          <Outline h={H} />
        </svg>
      ))}
    </div>
  );
}

/** A bracket under the first piece of a bar: how big one piece is. Two brackets, one above the other, show a mismatch at a glance. */
function OnePiece({ total, tone, same }: { total: number; tone: BarTone; same: boolean }) {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <span className={`block h-2.5 shrink-0 rounded-b-md border-x-[3px] border-b-[3px] ${same ? "border-ok-bright" : EDGE[tone]}`} style={{ width: `${100 / total}%` }} />
      <span className={`whitespace-nowrap text-label font-bold ${same ? "text-ok" : "text-muted"}`}>{same ? "same size" : "one piece"}</span>
    </div>
  );
}

function CutStepper({ who, cut, onCut }: { who: string; cut: number; onCut: (cut: number) => void }) {
  const btn = "press grid size-12 shrink-0 place-items-center rounded-full text-heading-2 font-extrabold leading-none disabled:opacity-40";
  return (
    <div role="group" aria-label={`Cut ${who} bar`} className="flex shrink-0 items-center gap-1.5">
      <button type="button" className={`${btn} bg-sunk text-ink hover:bg-line`} onClick={() => onCut(cut - 1)} disabled={cut <= 1} aria-label={`Fewer cuts in ${who} bar`}>
        −
      </button>
      <output className="min-w-36 text-center text-label font-bold text-ink-2" aria-live="polite">
        {cut === 1 ? "not cut yet" : `each piece cut into ${cut}`}
      </output>
      <button type="button" className={`${btn} bg-ink text-white hover:bg-ink-2`} onClick={() => onCut(cut + 1)} disabled={cut >= MAX_CUT} aria-label={`Cut ${who} bar into smaller pieces`}>
        +
      </button>
    </div>
  );
}

export interface BarRow {
  f: Fraction;
  /** Whose bar it is, as a possessive for labels ("Sam's"), and the short name shown beside the fraction. */
  who: string;
  name: string;
}

/** Whether two cut bars have pieces of the same size. */
export const piecesMatch = (a: Fraction, cutA: number, b: Fraction, cutB: number) => a.d * cutA === b.d * cutB;

/**
 * Two bars, one above the other so their cut lines can be compared, each with its fraction, what it has been renamed
 * to, and (when `onCut` is given) a control to cut it. `together` adds the joined bar underneath.
 */
export function BarsBoard({
  rows,
  cuts,
  onCut,
  renamed = true,
  together = false,
  togetherLabel = true,
  ruler = true,
  slim = false,
}: {
  rows: [BarRow, BarRow];
  cuts: [number, number];
  onCut?: (row: 0 | 1, cut: number) => void;
  /** Show "= 4/12" beside a cut bar. Off when the child should work the new name out. */
  renamed?: boolean;
  together?: boolean;
  togetherLabel?: boolean;
  ruler?: boolean;
  /** Shorter bars, for the model beside a practice question. */
  slim?: boolean;
}) {
  const [a, b] = rows;
  const same = piecesMatch(a.f, cuts[0], b.f, cuts[1]);
  const d = a.f.d * cuts[0];
  return (
    <div className={`flex flex-col ${slim ? "gap-3" : "gap-4"}`}>
      {rows.map((row, i) => {
        const cut = cuts[i as 0 | 1];
        const tone: BarTone = i === 0 ? "a" : "b";
        const total = row.f.d * cut;
        return (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="flex items-center gap-2.5 text-title font-extrabold text-ink">
                <span className={`size-3.5 shrink-0 rounded-full ${i === 0 ? "bg-den" : "bg-num"}`} aria-hidden />
                {row.name}
                <FractionNotation n={row.f.n} d={row.f.d} size="md" />
                {renamed && cut > 1 && (
                  <>
                    <span aria-hidden>=</span>
                    <FractionNotation n={row.f.n * cut} d={total} size="md" animate />
                  </>
                )}
              </p>
              {onCut && <CutStepper who={row.who} cut={cut} onCut={(c) => onCut(i as 0 | 1, c)} />}
            </div>
            <FractionBar f={row.f} cut={cut} tone={tone} slim={slim} label={`${row.who} bar: ${row.f.n * cut} of ${total} ${partName(total)} shaded`} />
            {ruler && <OnePiece total={total} tone={tone} same={same} />}
          </div>
        );
      })}
      {together && same && (
        <Reveal className="flex flex-col gap-2 border-t-2 border-dashed border-line-strong pt-3">
          <p className="flex min-h-10 items-center gap-2.5 text-title font-extrabold text-ink">
            Together
            {togetherLabel && (
              <>
                <FractionNotation n={a.f.n * cuts[0]} d={d} size="md" />
                <span aria-hidden>+</span>
                <FractionNotation n={b.f.n * cuts[1]} d={d} size="md" />
                <span aria-hidden>=</span>
                <FractionNotation n={a.f.n * cuts[0] + b.f.n * cuts[1]} d={d} size="md" />
              </>
            )}
          </p>
          <TogetherBar a={a.f} b={b.f} d={d} slim={slim} label={`Together: ${a.f.n * cuts[0] + b.f.n * cuts[1]} ${partName(d)}`} />
        </Reveal>
      )}
    </div>
  );
}
