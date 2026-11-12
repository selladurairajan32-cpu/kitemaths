"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { RemainderScene, RemainderStage } from "./remainderScript";

/**
 * D-050 Step through for 50 ÷ 12: minibuses with 12 seats fill up (4 full, 2 children left on the pavement), a fifth
 * minibus takes the 2 (round up); then packs of 12 pens (4 full packs, 2 loose pens: round down, and 2 left over), and
 * the rule. The caption beside it says everything shown, so the picture is hidden from screen readers. Reduced motion
 * (or a still) makes every change instant.
 */

const ORDER: RemainderStage[] = ["hook", "divide", "up", "down", "left", "rule"];
const INK = "var(--color-ink)";
const BLUE = "var(--color-brand)";
const ORANGE = "var(--color-num)";
const GREEN = "var(--color-ok)";
const idx = (s: RemainderStage) => ORDER.indexOf(s);

/** A minibus at (x, y) with `filled` of its 12 seats taken. */
function Bus({ x, y, filled, show, extra }: { x: number; y: number; filled: number; show: boolean; extra?: boolean }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : -20 }}>
      <rect x={x} y={y} width={124} height={64} rx={14} fill={extra ? "var(--color-ok-soft)" : "var(--color-sun-soft)"} stroke={extra ? GREEN : INK} strokeWidth={3} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={x + 14 + (i % 6) * 19} cy={y + 20 + Math.floor(i / 6) * 22} r={7} fill={i < filled ? BLUE : "var(--color-surface)"} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      ))}
      <circle cx={x + 26} cy={y + 68} r={9} fill={INK} />
      <circle cx={x + 98} cy={y + 68} r={9} fill={INK} />
    </motion.g>
  );
}

/** A pack of 12 pens, or a few loose pens. */
function Pens({ x, y, n, boxed, dim }: { x: number; y: number; n: number; boxed: boolean; dim?: boolean }) {
  return (
    <g opacity={dim ? 0.45 : 1}>
      {boxed && <rect x={x - 6} y={y - 6} width={n * 9 + 12} height={74} rx={8} fill="var(--color-surface)" stroke={INK} strokeWidth={3} />}
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x + i * 9} y={y} width={6} height={56} rx={2} fill={boxed ? BLUE : ORANGE} />
          <path d={`M ${x + i * 9} ${y + 56} L ${x + i * 9 + 3} ${y + 64} L ${x + i * 9 + 6} ${y + 56} Z`} fill={INK} />
        </g>
      ))}
    </g>
  );
}

export function RemainderStageView({ scene, still = false }: { scene: RemainderScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const t = motionOr(still || !!reduce, MOVE);
  const s = scene.stage;
  const buses = idx(s) <= idx("up");
  const pens = s === "down" || s === "left";
  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      <motion.g initial={false} animate={{ opacity: buses ? 1 : 0 }} transition={t}>
        <text x={360} y={50} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK}>50 children, 12 in each minibus</text>
        {[0, 1, 2, 3].map((b) => (
          <Bus key={b} x={30 + b * 136} y={110} filled={s === "hook" ? 0 : 12} show />
        ))}
        <Bus x={574} y={110} filled={2} show={s === "up"} extra />
        {/* The two children left over, on the pavement. */}
        <motion.g initial={false} animate={{ opacity: s === "divide" ? 1 : 0 }} transition={t}>
          <circle cx={610} cy={150} r={12} fill={ORANGE} />
          <circle cx={645} cy={150} r={12} fill={ORANGE} />
          <text x={628} y={200} textAnchor="middle" fontSize={20} fontWeight={900} fill={ORANGE}>2 left</text>
        </motion.g>
        <motion.text x={360} y={270} textAnchor="middle" fontSize={34} fontWeight={900} fill={INK} initial={false} animate={{ opacity: s === "divide" ? 1 : 0 }} transition={t}>50 ÷ 12 = 4 r 2</motion.text>
        <motion.text x={360} y={270} textAnchor="middle" fontSize={34} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: s === "up" ? 1 : 0 }} transition={t}>4 full + 1 more = 5 minibuses</motion.text>
        <motion.text x={360} y={320} textAnchor="middle" fontSize={24} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: s === "up" ? 1 : 0 }} transition={t}>Round up: everyone needs a seat</motion.text>
      </motion.g>

      <motion.g initial={false} animate={{ opacity: pens ? 1 : 0 }} transition={t}>
        <text x={360} y={50} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK}>50 pens, packs of 12</text>
        {[0, 1, 2, 3].map((p) => (
          <Pens key={p} x={40 + p * 140} y={110} n={12} boxed dim={s === "left"} />
        ))}
        <g>
          <Pens x={620} y={110} n={2} boxed={false} />
          <motion.circle cx={629} cy={140} r={42} fill="none" stroke={GREEN} strokeWidth={4} initial={false} animate={{ opacity: s === "left" ? 1 : 0 }} />
        </g>
        <motion.text x={360} y={270} textAnchor="middle" fontSize={32} fontWeight={900} fill={INK} initial={false} animate={{ opacity: s === "down" ? 1 : 0 }} transition={t}>4 full packs: round down</motion.text>
        <motion.text x={360} y={270} textAnchor="middle" fontSize={32} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: s === "left" ? 1 : 0 }} transition={t}>Left over: the remainder, 2</motion.text>
      </motion.g>

      <motion.g initial={false} animate={{ opacity: s === "rule" ? 1 : 0 }} transition={t} fontSize={28} fontWeight={900}>
        <text x={70} y={110} fill={INK}>Divide, then ask what the remainder means:</text>
        <text x={90} y={170} fill={BLUE}>Everyone needs a place? Round up</text>
        <text x={90} y={225} fill={ORANGE}>Only full ones count? Round down</text>
        <text x={90} y={280} fill={GREEN}>How many left over? The remainder</text>
      </motion.g>
    </svg>
  );
}
