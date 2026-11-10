"use client";

import { motion } from "motion/react";
import { APPEAR, MOVE, motionOr } from "./motionTokens";
import { useInstant } from "./timeline";

/**
 * Base-ten blocks drawn in SVG (ANIM-001): a ones cube is u × u, a tens rod is ten cubes joined, a hundreds flat is ten
 * rods joined. `fused` blocks draw their inner lines faintly, so a new flat or rod reads as one piece; it arrives with
 * a ring that snaps in, which is the moment ten things become one.
 */
export interface Tone {
  soft: string;
  edge: string;
  ink: string;
  chip: string;
  solid: string;
}

export const NEUTRAL: Tone = { soft: "fill-sunk", edge: "stroke-ink-2", ink: "fill-ink", chip: "bg-sunk text-ink", solid: "fill-ink-2" };

function lines(x: number, y: number, n: number, step: number, length: number, vertical: boolean) {
  return Array.from({ length: n - 1 }, (_, i) => {
    const p = (i + 1) * step;
    return vertical ? `M${x + p} ${y}v${length}` : `M${x} ${y + p}h${length}`;
  }).join("");
}

/** A tens rod: horizontal by default (ten cubes in a row). */
export function Rod({ x, y, u, tone, vertical = false, fused = false }: { x: number; y: number; u: number; tone: Tone; vertical?: boolean; fused?: boolean }) {
  const w = vertical ? u : 10 * u;
  const h = vertical ? 10 * u : u;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2} className={`${fused ? tone.solid : tone.soft} ${tone.edge}`} strokeWidth={1.5} />
      <path d={vertical ? lines(x, y, 10, u, w, false) : lines(x, y, 10, u, h, true)} className={fused ? "stroke-surface" : tone.edge} strokeWidth={1} opacity={fused ? 0.45 : 0.7} />
    </g>
  );
}

export function Cube({ x, y, u, tone }: { x: number; y: number; u: number; tone: Tone }) {
  return <rect x={x} y={y} width={u} height={u} rx={2} className={`${tone.soft} ${tone.edge}`} strokeWidth={1.5} />;
}

/** A hundreds flat, w × h (ten rods side by side; a little taller when rows are drawn with gaps). */
export function Flat({ x, y, w, h, tone }: { x: number; y: number; w: number; h: number; tone: Tone }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={3} className={`${tone.solid} ${tone.edge}`} strokeWidth={1.5} />
      <path d={lines(x, y, 10, w / 10, h, true) + lines(x, y, 10, h / 10, w, false)} className="stroke-surface" strokeWidth={1} opacity={0.4} />
    </g>
  );
}

/** The ring that snaps in when ten pieces join into one: grows from the pieces and fades. */
export function JoinRing({ x, y, w, h, tone }: { x: number; y: number; w: number; h: number; tone: Tone }) {
  const instant = useInstant();
  if (instant) return null;
  return (
    <motion.rect
      x={x - 3}
      y={y - 3}
      width={w + 6}
      height={h + 6}
      rx={6}
      fill="none"
      className={tone.edge}
      strokeWidth={4}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 0, scale: 1.12 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

/** A piece that arrives: fades and settles into place. */
export function Arrive({ children, delay = 0, from = { y: -10 } }: { children: React.ReactNode; delay?: number; from?: { x?: number; y?: number } }) {
  const instant = useInstant();
  return (
    <motion.g initial={instant ? false : { opacity: 0, ...from }} animate={{ opacity: 1, x: 0, y: 0 }} transition={motionOr(instant, { ...MOVE, delay })}>
      {children}
    </motion.g>
  );
}

/** A number chip under a picture. */
export function Chip({ children, tone, delay = 0 }: { children: React.ReactNode; tone: Tone; delay?: number }) {
  const instant = useInstant();
  return (
    <motion.span
      initial={instant ? false : { opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={motionOr(instant, { ...APPEAR, delay })}
      className={`inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-[18px] px-3.5 py-1 text-center text-lg font-extrabold ${tone.chip}`}
    >
      {children}
    </motion.span>
  );
}
