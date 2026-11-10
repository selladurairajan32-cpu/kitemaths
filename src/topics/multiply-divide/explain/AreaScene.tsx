"use client";

import { motion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Chip } from "@/components/explain/BaseTen";
import { CountUp } from "@/components/explain/CountUp";
import { APPEAR, MOVE, motionOr } from "@/components/explain/motionTokens";
import type { SceneProps } from "@/components/explain/Stage";
import { useInstant, usePhases } from "@/components/explain/timeline";
import { Button } from "@/components/ui/Button";
import type { LongMultiplication } from "@/maths/long-multiplication";
import { toneFor, TOTAL } from "./tones";

/**
 * Chapter 2 · Picture (area model). The blocks from Chapter 1 become an a × b rectangle of squares (same size, so the
 * child sees it is the same thing). Steps: 0 the rectangle · 1 the child cuts off 10 rows (then 20 | 3 is cut for them)
 * · 2 the pieces drift apart and are counted · 3 each row's pieces join and their numbers add.
 */

const U = 12;
const n = (x: number) => x.toLocaleString("en-GB");

function useLayout(m: LongMultiplication) {
  const widths = m.aParts.map((p) => p * U);
  const heights = m.bParts.map((p) => p * U);
  const x = (col: number, gap: number) => widths.slice(0, col).reduce((s, w) => s + w, 0) + col * gap;
  const y = (row: number, gap: number) => heights.slice(0, row).reduce((s, h) => s + h, 0) + row * gap;
  return { widths, heights, x, y, W: m.a * U, H: m.b * U };
}

/** Square-grid fill, drawn once per scene. */
function Grid({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width={U} height={U} patternUnits="userSpaceOnUse">
        <path d={`M${U} 0V${U}H0`} fill="none" className="stroke-line-strong" strokeWidth={1} />
      </pattern>
    </defs>
  );
}

function SideLabels({ m, split, w, h, gx = 0, gy = 0 }: { m: LongMultiplication; split: boolean; w: number; h: number; gx?: number; gy?: number }) {
  const L = useLayout(m);
  if (!split)
    return (
      <>
        <text x={w / 2} y={-12} textAnchor="middle" fontSize={20} className="fill-ink font-extrabold">
          {m.a}
        </text>
        <text x={-12} y={h / 2 + 7} textAnchor="end" fontSize={20} className="fill-ink font-extrabold">
          {m.b}
        </text>
      </>
    );
  return (
    <>
      {m.aParts.map((p, i) => (
        <text key={`a${p}`} x={L.x(i, gx) + L.widths[i]! / 2} y={-12} textAnchor="middle" fontSize={20} className="fill-ink font-extrabold">
          {p}
        </text>
      ))}
      {m.bParts.map((p, i) => (
        <text key={`b${p}`} x={-12} y={L.y(i, gy) + L.heights[i]! / 2 + 7} textAnchor="end" fontSize={20} className={`${toneFor(p).ink} font-extrabold`}>
          {p}
        </text>
      ))}
    </>
  );
}

const viewBox = (w: number, h: number, right = 20) => `-44 -36 ${w + 52 + right} ${h + 52}`;

/* Step 0: the rectangle fills row by row. */
function Rectangle({ m }: { m: LongMultiplication }) {
  const L = useLayout(m);
  const id = useId().replace(/:/g, "");
  const instant = useInstant();
  return (
    <svg viewBox={viewBox(L.W, L.H)} className="h-auto w-full max-w-[420px]" role="img" aria-label={`A rectangle ${m.a} squares long and ${m.b} squares high`}>
      <Grid id={id} />
      <clipPath id={`${id}c`}>
        <motion.rect x={0} y={0} width={L.W} initial={instant ? false : { height: U }} animate={{ height: L.H }} transition={motionOr(instant, { duration: 0.8, ease: "easeInOut", delay: 0.2 })} />
      </clipPath>
      <g clipPath={`url(#${id}c)`}>
        <rect width={L.W} height={L.H} className="fill-sunk" />
        <rect width={L.W} height={L.H} fill={`url(#${id})`} />
      </g>
      <rect width={L.W} height={L.H} rx={2} className="fill-none stroke-ink" strokeWidth={2.5} />
      <SideLabels m={m} split={false} w={L.W} h={L.H} />
    </svg>
  );
}

/** The four pieces, at a gap, filled and labelled as asked. */
function Pieces({ m, gx, gy, sweep, labels, animateGap, rowSums }: { m: LongMultiplication; gx: number; gy: number; sweep: boolean; labels: boolean; animateGap?: { gx: number; gy: number }; rowSums?: number }) {
  const L = useLayout(m);
  const id = useId().replace(/:/g, "");
  const instant = useInstant();
  const end = animateGap ?? { gx, gy };
  return (
    <svg viewBox={viewBox(L.W + end.gx, L.H + end.gy, rowSums !== undefined ? 150 : 20)} className="h-auto w-full max-w-[460px]" role="img" aria-label={`Pieces ${m.cells.map((c) => `${c.aPart} by ${c.bPart} is ${c.product}`).join(", ")}`}>
      <Grid id={id} />
      {m.cells.map((c, i) => {
        const tone = toneFor(c.bPart);
        const w = L.widths[c.col]!;
        const h = L.heights[c.row]!;
        const from = { x: L.x(c.col, gx), y: L.y(c.row, gy) };
        const to = { x: L.x(c.col, end.gx), y: L.y(c.row, end.gy) };
        return (
          <motion.g key={`${c.row}-${c.col}`} initial={{ x: from.x, y: from.y }} animate={{ x: to.x, y: to.y }} transition={motionOr(instant, { ...MOVE, delay: 0.15 })}>
            <rect width={w} height={h} className="fill-surface" />
            {sweep ? (
              <motion.rect height={h} className={tone.soft} initial={instant ? false : { width: 0 }} animate={{ width: w }} transition={motionOr(instant, { duration: 0.6, ease: "easeInOut", delay: 0.4 + i * 0.35 })} />
            ) : (
              <rect width={w} height={h} className={tone.soft} />
            )}
            <rect width={w} height={h} fill={`url(#${id})`} />
            <rect width={w} height={h} rx={2} className={`fill-none ${tone.edge}`} strokeWidth={2.5} />
            {labels && (
              <text x={w / 2} y={h / 2 + 8} textAnchor="middle" fontSize={c.product >= 100 ? 26 : 20} className={`${tone.ink} font-extrabold`}>
                {sweep ? <CountUp svg value={c.product} seconds={0.6} /> : n(c.product)}
              </text>
            )}
          </motion.g>
        );
      })}
      <SideLabels m={m} split w={L.W} h={L.H} gx={end.gx} gy={end.gy} />
      {rowSums !== undefined &&
        m.bParts.map((p, row) => {
          const cells = m.cells.filter((c) => c.row === row);
          const y = L.y(row, end.gy) + L.heights[row]! / 2 + 8;
          return (
            <motion.text key={p} x={L.W + end.gx + 14} y={y} fontSize={rowSums >= 2 ? 26 : 20} className={`${toneFor(p).ink} font-extrabold`} initial={instant ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={motionOr(instant, { ...APPEAR, delay: 0.5 + row * 0.3 })}>
              {rowSums >= 2 ? (
                <>
                  = <CountUp svg from={cells[0]!.product} value={m.a * p} seconds={0.6} />
                </>
              ) : (
                cells.map((c) => n(c.product)).join(" + ")
              )}
            </motion.text>
          );
        })}
    </svg>
  );
}

/* Step 1: the child drags the scissors to cut off 10 rows. */
function Cut({ m, done, onTaskDone }: { m: LongMultiplication; done: boolean; onTaskDone: () => void }) {
  const L = useLayout(m);
  const id = useId().replace(/:/g, "");
  const svg = useRef<SVGSVGElement>(null);
  const [cut, setCut] = useState(3);
  const [dragging, setDragging] = useState(false);
  const [nudge, setNudge] = useState(false);
  const target = m.bParts[0]!;
  if (done) return <AfterCut m={m} />;

  const rowAt = (clientY: number) => {
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return cut;
    const y = (clientY - ctm.f) / ctm.d;
    return Math.max(1, Math.min(m.b - 1, Math.round(y / U)));
  };
  const attempt = (row: number) => {
    if (row === target) onTaskDone();
    else setNudge(true);
  };
  const onDown = (e: PointerEvent<SVGGElement>) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onMove = (e: PointerEvent<SVGGElement>) => {
    if (dragging) setCut(rowAt(e.clientY));
  };
  const onUp = (e: PointerEvent<SVGGElement>) => {
    if (!dragging) return;
    setDragging(false);
    const row = rowAt(e.clientY);
    setCut(row);
    attempt(row);
  };
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setCut((c) => Math.min(m.b - 1, c + 1));
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setCut((c) => Math.max(1, c - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      attempt(cut);
    }
  };
  const good = cut === target;
  const y = cut * U;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <svg ref={svg} viewBox={viewBox(L.W, L.H, 110)} className="h-auto w-full max-w-[460px] touch-none select-none" aria-label={`A ${m.a} by ${m.b} rectangle with scissors`}>
        <Grid id={id} />
        <rect width={L.W} height={L.H} className="fill-sunk" />
        <rect width={L.W} height={L.H} fill={`url(#${id})`} />
        <rect width={L.W} height={L.H} rx={2} className="fill-none stroke-ink" strokeWidth={2.5} />
        <SideLabels m={m} split={false} w={L.W} h={L.H} />
        <line x1={0} x2={L.W} y1={y} y2={y} className={good ? "stroke-ok" : "stroke-ink"} strokeWidth={3} strokeDasharray="8 6" />
        <text x={L.W + 12} y={y - 10} fontSize={17} className="fill-ink font-extrabold">
          {cut} rows
        </text>
        <text x={L.W + 12} y={y + 24} fontSize={17} className="fill-ink font-extrabold">
          {m.b - cut} rows
        </text>
        <g
          role="slider"
          tabIndex={0}
          aria-label="Scissors: rows above the cut"
          aria-valuemin={1}
          aria-valuemax={m.b - 1}
          aria-valuenow={cut}
          aria-valuetext={`${cut} rows above, ${m.b - cut} rows below`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onKeyDown={onKey}
          className="cursor-grab outline-none focus-visible:[&>circle]:stroke-focus"
        >
          <circle cx={-26} cy={y} r={17} className={good ? "fill-ok-soft stroke-ok" : "fill-warn-soft stroke-warn-bright"} strokeWidth={3} />
          {/* Scissors: two handles and two crossing blades. */}
          <g aria-hidden className="fill-none stroke-ink" strokeWidth={2} strokeLinecap="round">
            <circle cx={-31} cy={y - 5} r={3.5} />
            <circle cx={-31} cy={y + 5} r={3.5} />
            <path d={`M-28 ${y - 3}L-17 ${y + 4}M-28 ${y + 3}L-17 ${y - 4}`} />
          </g>
          <rect x={-46} y={y - 22} width={L.W + 46} height={44} fill="transparent" />
        </g>
      </svg>
      <p aria-live="polite" className={`min-h-7 text-lg font-bold ${nudge ? "text-warn" : "text-ink-2"}`}>
        {nudge ? "Try 10 rows: tens are easy to multiply." : "Drag the scissors down."}
      </p>
      {nudge && (
        <Button variant="secondary" onClick={() => attempt(target)}>
          Cut at {target} rows for me
        </Button>
      )}
    </div>
  );
}

/** After the cut: the bottom rows slide off, then 23 is cut into 20 | 3 for the child. */
function AfterCut({ m }: { m: LongMultiplication }) {
  const phase = usePhases([300, 900]);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Pieces m={m} gx={0} gy={0} animateGap={{ gx: phase >= 2 ? 10 : 0, gy: phase >= 1 ? 10 : 0 }} sweep={false} labels={false} />
      <div className="flex min-h-10 flex-wrap justify-center gap-2">
        {phase >= 1 && <Chip tone={toneFor(m.bParts[0]!)}>{m.bParts.join(" + ")} rows</Chip>}
        {phase >= 2 && <Chip tone={TOTAL}>{m.aParts.join(" + ")} long</Chip>}
      </div>
    </div>
  );
}

export function AreaScene({ m, step, done, onTaskDone }: SceneProps & { m: LongMultiplication }) {
  switch (step) {
    case 0:
      return <Rectangle m={m} />;
    case 1:
      return <Cut m={m} done={done} onTaskDone={onTaskDone} />;
    case 2:
      return (
        <div className="flex w-full flex-col items-center gap-3">
          <Pieces m={m} gx={10} gy={10} animateGap={{ gx: 26, gy: 26 }} sweep labels />
        </div>
      );
    default:
      return <Joined m={m} />;
  }
}

/* Step 3: each row's pieces slide back together and their numbers add. */
function Joined({ m }: { m: LongMultiplication }) {
  const phase = usePhases([700, 1100, 600]);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Pieces m={m} gx={26} gy={26} animateGap={{ gx: 0, gy: 26 }} sweep={false} labels rowSums={phase >= 2 ? 2 : 1} />
      <div className="flex min-h-10 flex-wrap justify-center gap-2">
        {phase >= 3 && (
          <Chip tone={TOTAL}>
            {m.bParts.map((p) => n(m.a * p)).join(" + ")} = <CountUp value={m.total} seconds={0.8} />
          </Chip>
        )}
      </div>
    </div>
  );
}
