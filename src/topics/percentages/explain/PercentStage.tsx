"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { PercentScene, PercentStage } from "./percentScript";

/**
 * D-050 Step through for 35% of £80: the sale tag, "80 ÷ 35" crossed out, the £80 as a bar of ten 10% parts of £8, and
 * 35% built from three parts and half a part (£24 + £4 = £28), then the rule. The caption beside the picture says
 * everything shown, so the picture is hidden from screen readers. Reduced motion (or a still) makes every change instant.
 */

const ORDER: PercentStage[] = ["hook", "mistake", "bar", "ten", "build", "rule"];
const at = (s: PercentStage, from: PercentStage) => ORDER.indexOf(s) >= ORDER.indexOf(from);
const INK = "var(--color-ink)";
const BLUE = "var(--color-brand)";
const ORANGE = "var(--color-num)";
const GREEN = "var(--color-ok)";
const X0 = 110;
const W = 50;

export function PercentStageView({ scene, still = false }: { scene: PercentScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const t = motionOr(still || !!reduce, MOVE);
  const s = scene.stage;
  const bar = at(s, "bar") && s !== "rule";
  const build = s === "build";
  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      {/* The sale. */}
      <motion.g initial={false} animate={{ opacity: s === "hook" || s === "mistake" ? 1 : 0 }} transition={t}>
        <rect x={200} y={60} width={260} height={140} rx={22} fill="var(--color-surface)" stroke={INK} strokeWidth={4} />
        <circle cx={230} cy={130} r={10} fill="var(--color-line-strong)" />
        <text x={350} y={120} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK}>Bike</text>
        <text x={350} y={172} textAnchor="middle" fontSize={44} fontWeight={900} fill={INK}>£80</text>
        <circle cx={500} cy={90} r={58} fill="var(--color-kite-red)" />
        <text x={500} y={86} textAnchor="middle" fontSize={30} fontWeight={900} fill="var(--color-surface)">35%</text>
        <text x={500} y={116} textAnchor="middle" fontSize={22} fontWeight={900} fill="var(--color-surface)">OFF</text>
      </motion.g>
      <motion.g initial={false} animate={{ opacity: s === "mistake" ? 1 : 0 }} transition={t}>
        <text x={360} y={290} textAnchor="middle" fontSize={40} fontWeight={900} fill="var(--color-warn)">80 ÷ 35 ≈ 2 ?</text>
        <line x1={250} y1={300} x2={470} y2={262} stroke="var(--color-warn)" strokeWidth={6} strokeLinecap="round" />
        <text x={360} y={350} textAnchor="middle" fontSize={24} fontWeight={900} fill="var(--color-warn)">Far too small: per cent means out of every 100</text>
      </motion.g>

      {/* The bar: £80 = 100%, ten parts of 10%. */}
      <motion.g initial={false} animate={{ opacity: bar ? 1 : 0 }} transition={t}>
        <text x={360} y={110} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK}>£80 = 100%</text>
        {Array.from({ length: 10 }, (_, i) => {
          const fill = build && i < 3 ? BLUE : "var(--color-surface)";
          return (
            <g key={i}>
              <motion.rect x={X0 + i * W} y={150} width={W} height={70} fill={fill} stroke={INK} strokeWidth={3} initial={false} animate={{ opacity: 1 }} />
              {/* 5% is half of a 10% part. */}
              {i === 3 && <motion.rect x={X0 + i * W + 1.5} y={151.5} width={W / 2 - 1.5} height={67} fill={ORANGE} initial={false} animate={{ opacity: build ? 1 : 0 }} />}
              <motion.text x={X0 + i * W + W / 2} y={194} textAnchor="middle" fontSize={20} fontWeight={900} fill={build && i < 3 ? "var(--color-surface)" : INK} initial={false} animate={{ opacity: at(s, "ten") ? 1 : 0 }} transition={{ ...t, delay: s === "ten" && !reduce && !still ? i * 0.08 : 0 }}>
                £8
              </motion.text>
            </g>
          );
        })}
        <motion.text x={X0 + W / 2} y={260} textAnchor="middle" fontSize={22} fontWeight={900} fill={INK} initial={false} animate={{ opacity: s === "ten" ? 1 : 0 }}>10% = 80 ÷ 10 = £8</motion.text>
        <motion.g initial={false} animate={{ opacity: build ? 1 : 0 }} fontSize={26} fontWeight={900}>
          <text x={X0 + 1.5 * W} y={262} textAnchor="middle" fill={BLUE}>30% = £24</text>
          <text x={X0 + 3.25 * W + 70} y={262} textAnchor="middle" fill={ORANGE}>5% = £4</text>
          <text x={360} y={330} textAnchor="middle" fontSize={34} fill={GREEN}>35% of £80 = £24 + £4 = £28</text>
        </motion.g>
      </motion.g>

      <motion.g initial={false} animate={{ opacity: s === "rule" ? 1 : 0 }} transition={t} fontSize={28} fontWeight={900}>
        <text x={70} y={140} fill={INK}>1. Per cent means out of every 100</text>
        <text x={70} y={200} fill={INK}>2. Find 10%: divide by 10</text>
        <text x={70} y={260} fill={GREEN}>3. Build the percentage you need</text>
      </motion.g>
    </svg>
  );
}
