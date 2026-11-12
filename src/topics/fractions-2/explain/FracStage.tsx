"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { FracScene, FracStage as Stage } from "./addDifferentScript";

/**
 * D-041 Step through for ⅓ + ¼: two slabs on a table, drawn in a 2.5D (oblique) view. The third is shaded down one
 * column and the quarter along one row; the cutting lines draw themselves to make twelfths, the shaded pieces are
 * counted, then fly into one whole to make 7/12. The caption beside the stage says everything shown, so the picture is
 * hidden from screen readers. With reduced motion (or as a still) every change is instant.
 */

const CW = 54;
const RH = 26;
const SKEW = 0.55;
const DEPTH = 14;
const W = 3 * CW;
const D = 4 * RH;
const P = (ox: number, oy: number, u: number, v: number): [number, number] => [ox + u + v * SKEW, oy - v];
const poly = (pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");

const ORDER: Stage[] = ["question", "mistake", "pictures", "cut", "count", "combine", "summary"];
const at = (stage: Stage, from: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(from);

const BLUE = "var(--color-brand)";
const ORANGE = "var(--color-num)";
const INK = "var(--color-ink)";

interface Cell { c: number; r: number; centre: [number, number]; pts: string }
function cells(ox: number, oy: number): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++) {
      const v0 = (3 - r) * RH;
      const u0 = c * CW;
      out.push({ c, r, centre: P(ox, oy, u0 + CW / 2, v0 + RH / 2), pts: poly([P(ox, oy, u0, v0), P(ox, oy, u0 + CW, v0), P(ox, oy, u0 + CW, v0 + RH), P(ox, oy, u0, v0 + RH)]) });
    }
  return out;
}

const A = { ox: 70, oy: 250 };
const B = { ox: 430, oy: 250 };
const C = { ox: 250, oy: 280 };
const cellsA = cells(A.ox, A.oy);
const cellsB = cells(B.ox, B.oy);
const cellsC = cells(C.ox, C.oy);
/** The third: the left column. The quarter: the back row. They fill the whole in that order, row by row. */
const shadedA = cellsA.filter((x) => x.c === 0);
const shadedB = cellsB.filter((x) => x.r === 0);

function Slab({ ox, oy, show, faded, t }: { ox: number; oy: number; show: boolean; faded: boolean; t: Transition }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? (faded ? 0.25 : 1) : 0 }} transition={t}>
      <polygon points={poly([P(ox, oy, 0, 0), P(ox, oy, W, 0), P(ox, oy + DEPTH, W, 0), P(ox, oy + DEPTH, 0, 0)])} fill="var(--color-sunk)" />
      <polygon points={poly([P(ox, oy, W, 0), P(ox, oy, W, D), P(ox, oy + DEPTH, W, D), P(ox, oy + DEPTH, W, 0)])} fill="var(--color-line)" />
      <polygon points={poly([P(ox, oy, 0, 0), P(ox, oy, W, 0), P(ox, oy, W, D), P(ox, oy, 0, D)])} fill="var(--color-surface)" />
    </motion.g>
  );
}

/** Grid lines of a slab: `cols` and `rows` say which sets are drawn. The outline is always drawn with the slab. */
function Lines({ ox, oy, cols, rows, show, faded, t }: { ox: number; oy: number; cols: boolean; rows: boolean; show: boolean; faded: boolean; t: Transition }) {
  const line = (a: [number, number], b: [number, number], on: boolean, key: string) => (
    <motion.line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={INK} strokeWidth={3} strokeLinecap="round" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ ...t, duration: (t as { duration?: number }).duration === 0 ? 0 : 0.9 }} />
  );
  return (
    <motion.g initial={false} animate={{ opacity: show ? (faded ? 0.25 : 1) : 0 }} transition={t}>
      {[1, 2].map((c) => line(P(ox, oy, c * CW, 0), P(ox, oy, c * CW, D), cols, `c${c}`))}
      {[1, 2, 3].map((r) => line(P(ox, oy, 0, r * RH), P(ox, oy, W, r * RH), rows, `r${r}`))}
      <polygon points={poly([P(ox, oy, 0, 0), P(ox, oy, W, 0), P(ox, oy, W, D), P(ox, oy, 0, D)])} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    </motion.g>
  );
}

function Frac({ x, y, n, d, color, size = 30, show, t }: { x: number; y: number; n: number; d: number; color: string; size?: number; show: boolean; t: Transition }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={t} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
      <text x={x} y={y}>{n}</text>
      <line x1={x - size * 0.55} x2={x + size * 0.55} y1={y + 9} y2={y + 9} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={x} y={y + 9 + size}>{d}</text>
    </motion.g>
  );
}

export function FracStageView({ scene, still = false }: { scene: FracScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const instant = still || !!reduce;
  const t = motionOr(instant, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
  const move = motionOr(instant, MOVE);
  const s = scene.stage;
  const slabs = at(s, "pictures") && s !== "summary";
  const together = s === "combine";
  const cut = at(s, "cut");
  const counting = s === "count";
  const eqY = s === "question" ? 0 : s === "mistake" ? -60 : -150;
  const shaded = [...shadedA.map((x) => ({ ...x, color: BLUE })), ...shadedB.map((x) => ({ ...x, color: ORANGE }))];

  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      <motion.g initial={false} animate={{ y: eqY, opacity: s === "combine" || s === "summary" ? 0 : 1 }} transition={move} fontSize={56} fontWeight={900} textAnchor="middle">
        <text x={360} y={205} fill={INK}>
          <tspan fill={BLUE}>1/3</tspan> + <tspan fill={ORANGE}>1/4</tspan> = ?
        </text>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: s === "mistake" ? 1 : 0 }} transition={t} textAnchor="middle" fontWeight={900}>
        <text x={360} y={290} fontSize={40} fill="var(--color-warn)">Not 2/7!</text>
        <line x1={290} y1={276} x2={430} y2={276} stroke="var(--color-warn)" strokeWidth={5} strokeLinecap="round" />
        <text x={360} y={332} fontSize={20} fill="var(--color-ink)">2/7 is even smaller than 1/3 on its own</text>
      </motion.g>

      {/* The middle slab is drawn first so the pieces that fly onto it stay on top. */}
      <Slab {...C} show={together} faded={false} t={t} />
      <Slab {...A} show={slabs} faded={together} t={t} />
      <Slab {...B} show={slabs} faded={together} t={t} />
      {shaded.map((x, i) => {
        const target = cellsC[i]!.centre;
        const dx = together ? target[0] - x.centre[0] : 0;
        const dy = together ? target[1] - x.centre[1] : 0;
        return (
          <motion.g key={i} initial={false} animate={{ x: dx, y: dy, opacity: slabs ? 1 : 0 }} transition={{ ...move, delay: together && !instant ? i * 0.08 : 0 }}>
            <polygon points={x.pts} fill={x.color} />
            <motion.text x={x.centre[0]} y={x.centre[1] + 5} textAnchor="middle" fontSize={15} fontWeight={900} fill="var(--color-on-brand)" initial={false} animate={{ opacity: counting ? 1 : 0 }} transition={{ ...t, delay: counting && !instant ? 0.2 + (i < 4 ? i : 4 + (i - 4)) * 0.25 : 0 }}>
              {i < 4 ? i + 1 : i - 3}
            </motion.text>
          </motion.g>
        );
      })}
      <Lines {...C} cols rows show={together} faded={false} t={t} />
      <Lines {...A} cols rows={cut} show={slabs} faded={together} t={t} />
      <Lines {...B} cols={cut} rows show={slabs} faded={together} t={t} />

      <Frac x={160} y={310} n={counting ? 4 : 1} d={counting ? 12 : 3} color={BLUE} show={slabs && !together} t={t} />
      <Frac x={520} y={310} n={counting ? 3 : 1} d={counting ? 12 : 4} color={ORANGE} show={slabs && !together} t={t} />
      <Frac x={340} y={335} n={7} d={12} color="var(--color-ok)" size={34} show={together} t={t} />

      <motion.g initial={false} animate={{ opacity: s === "summary" ? 1 : 0 }} transition={t} fontSize={28} fontWeight={900}>
        <text x={90} y={150} fill={INK}>1. Cut both into the same pieces: 3 × 4 = 12</text>
        <text x={90} y={206} fill={INK}>2. 1/3 = 4/12 and 1/4 = 3/12</text>
        <text x={90} y={262} fill="var(--color-ok)">3. Add the tops: 4/12 + 3/12 = 7/12</text>
      </motion.g>
    </svg>
  );
}
