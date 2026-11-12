"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { MultiplyScene, MultiplyStage } from "./multiplyScript";

/**
 * D-050 Step through for ½ × ⅓: a chocolate bar, half of it left (one column of two), cut into thirds the other way,
 * Mo's piece (one of six), the rule (multiply the tops, multiply the bottoms) and a number line showing ⅙ is smaller
 * than ½ and ⅓. The caption beside it says everything shown, so the picture is hidden from screen readers. Reduced
 * motion (or a still) makes every change instant.
 */

const ORDER: MultiplyStage[] = ["hook", "half", "third", "count", "rule", "smaller"];
const at = (s: MultiplyStage, from: MultiplyStage) => ORDER.indexOf(s) >= ORDER.indexOf(from);
const INK = "var(--color-ink)";
const CHOC = "var(--color-num-strong)";
const GREEN = "var(--color-ok)";
const BX = 200;
const BY = 70;
const BW = 320;
const BH = 210;

export function MultiplyStageView({ scene, still = false }: { scene: MultiplyScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const instant = still || !!reduce;
  const t = motionOr(instant, MOVE);
  const s = scene.stage;
  const bar = s !== "rule" && s !== "smaller";
  const cells = [0, 1].flatMap((c) => [0, 1, 2].map((r) => ({ c, r })));
  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      <motion.g initial={false} animate={{ opacity: bar ? 1 : 0 }} transition={t}>
        {cells.map(({ c, r }, i) => {
          const left = c === 0;
          const mo = left && r === 0 && at(s, "third");
          const fill = s === "hook" ? CHOC : left ? (mo ? GREEN : CHOC) : "var(--color-surface)";
          return (
            <g key={i}>
              <motion.rect x={BX + (c * BW) / 2} y={BY + (r * BH) / 3} width={BW / 2} height={BH / 3} initial={false} animate={{ fill }} transition={t} stroke="var(--color-num-soft)" strokeWidth={at(s, "third") ? 4 : 0} strokeDasharray={!left && at(s, "half") ? "8 6" : undefined} />
              <motion.text x={BX + (c * BW) / 2 + BW / 4} y={BY + (r * BH) / 3 + BH / 6 + 10} textAnchor="middle" fontSize={28} fontWeight={900} fill={left ? "var(--color-surface)" : INK} initial={false} animate={{ opacity: s === "count" ? 1 : 0 }} transition={{ ...t, delay: s === "count" && !instant ? i * 0.15 : 0 }}>
                {i + 1}
              </motion.text>
            </g>
          );
        })}
        {/* Before any cut, one whole bar: no seams between the pieces. */}
        <motion.rect x={BX} y={BY} width={BW} height={BH} fill={CHOC} initial={false} animate={{ opacity: s === "hook" ? 1 : 0 }} transition={t} />
        <rect x={BX} y={BY} width={BW} height={BH} fill="none" stroke={INK} strokeWidth={4} rx={6} />
        <motion.line x1={BX + BW / 2} x2={BX + BW / 2} y1={BY} y2={BY + BH} stroke={INK} strokeWidth={4} initial={false} animate={{ opacity: at(s, "half") ? 1 : 0 }} transition={t} />
        {[1, 2].map((k) => (
          <motion.line key={k} x1={BX} y1={BY + (k * BH) / 3} y2={BY + (k * BH) / 3} initial={false} animate={{ x2: at(s, "third") ? BX + BW : BX, opacity: at(s, "third") ? 1 : 0 }} transition={t} stroke={INK} strokeWidth={4} />
        ))}
        <motion.text x={360} y={340} textAnchor="middle" fontSize={34} fontWeight={900} fill={INK} initial={false} animate={{ opacity: s === "hook" ? 1 : 0 }} transition={t}>1/3 of 1/2 = ?</motion.text>
        <motion.text x={360} y={340} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK} initial={false} animate={{ opacity: s === "half" ? 1 : 0 }} transition={t}>1/2 is left</motion.text>
        <motion.text x={360} y={340} textAnchor="middle" fontSize={30} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: s === "third" ? 1 : 0 }} transition={t}>Mo eats 1/3 of the half</motion.text>
        <motion.text x={360} y={340} textAnchor="middle" fontSize={34} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: s === "count" ? 1 : 0 }} transition={t}>1 piece of 6 = 1/6</motion.text>
      </motion.g>

      <motion.g initial={false} animate={{ opacity: s === "rule" ? 1 : 0 }} transition={t} fontWeight={900} textAnchor="middle">
        <text x={360} y={130} fontSize={44} fill={INK}>1/2 × 1/3</text>
        <text x={360} y={200} fontSize={30} fill="var(--color-ink-2)">tops: 1 × 1 = 1</text>
        <text x={360} y={245} fontSize={30} fill="var(--color-ink-2)">bottoms: 2 × 3 = 6</text>
        <text x={360} y={320} fontSize={48} fill={GREEN}>= 1/6</text>
      </motion.g>

      <motion.g initial={false} animate={{ opacity: s === "smaller" ? 1 : 0 }} transition={t} fontWeight={900}>
        <line x1={80} x2={640} y1={220} y2={220} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        {[
          { v: 0, l: "0" },
          { v: 1 / 6, l: "1/6", c: GREEN },
          { v: 1 / 3, l: "1/3" },
          { v: 1 / 2, l: "1/2" },
          { v: 1, l: "1" },
        ].map((m) => (
          <g key={m.l}>
            <line x1={80 + m.v * 560} x2={80 + m.v * 560} y1={200} y2={240} stroke={m.c ?? INK} strokeWidth={4} />
            <text x={80 + m.v * 560} y={285} textAnchor="middle" fontSize={28} fill={m.c ?? INK}>{m.l}</text>
          </g>
        ))}
        <text x={360} y={130} textAnchor="middle" fontSize={30} fill={GREEN}>1/6 is smaller than 1/2 and 1/3</text>
      </motion.g>
    </svg>
  );
}
