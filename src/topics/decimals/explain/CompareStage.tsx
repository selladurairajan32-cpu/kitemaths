"use client";

import { motion, useReducedMotion } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { CompareScene, CompareStage } from "./compareScript";

/**
 * D-050 Step through for 0.4 against 0.35: two bean plants, place-value columns, the tenths compared, a zero filling the
 * gap (0.40), two hundred squares (40 against 35), and the rule. The caption beside the picture says everything shown,
 * so the picture is hidden from screen readers. With reduced motion (or as a still) every change is instant.
 */

const ORDER: CompareStage[] = ["hook", "columns", "tenths", "zero", "grid", "rule"];
const at = (s: CompareStage, from: CompareStage) => ORDER.indexOf(s) >= ORDER.indexOf(from);
const BLUE = "var(--color-brand)";
const ORANGE = "var(--color-num)";
const INK = "var(--color-ink)";
const GREEN = "var(--color-ok)";

/** A plant in a pot, its stem `h` pixels tall. */
function Plant({ x, h, color, name, value, show }: { x: number; h: number; color: string; name: string; value: string; show: boolean }) {
  const base = 330;
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
      <path d={`M ${x - 40} ${base} L ${x + 40} ${base} L ${x + 30} ${base + 50} L ${x - 30} ${base + 50} Z`} fill="var(--color-num-strong)" />
      <motion.line x1={x} x2={x} y1={base} initial={false} animate={{ y2: base - h }} stroke="var(--color-ok-bright)" strokeWidth={8} strokeLinecap="round" />
      <ellipse cx={x - 16} cy={base - h * 0.55} rx={18} ry={9} fill="var(--color-ok-bright)" transform={`rotate(-30 ${x - 16} ${base - h * 0.55})`} />
      <ellipse cx={x + 16} cy={base - h * 0.8} rx={18} ry={9} fill="var(--color-ok-bright)" transform={`rotate(30 ${x + 16} ${base - h * 0.8})`} />
      <text x={x} y={base - h - 22} textAnchor="middle" fontSize={30} fontWeight={900} fill={color}>{value} m</text>
      <text x={x} y={base + 32} textAnchor="middle" fontSize={20} fontWeight={900} fill="var(--color-surface)">{name}</text>
    </motion.g>
  );
}

/** The place-value table: Amy's and Ben's numbers in ones, tenths and hundredths. */
function Table({ show, highlight, zero }: { show: boolean; highlight: boolean; zero: boolean }) {
  const cols = [{ x: 250, h: "Ones" }, { x: 330, h: "." }, { x: 410, h: "Tenths" }, { x: 530, h: "Hundredths" }];
  const rows = [{ y: 190, name: "Amy", color: BLUE, d: ["0", ".", "4", zero ? "0" : ""] }, { y: 270, name: "Ben", color: ORANGE, d: ["0", ".", "3", "5"] }];
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }}>
      <motion.rect x={360} y={98} width={100} height={210} rx={14} fill="var(--color-sun-soft)" stroke="var(--color-sun)" strokeWidth={3} initial={false} animate={{ opacity: highlight ? 1 : 0 }} />
      {cols.map((c) => (
        <text key={c.h} x={c.x} y={130} textAnchor="middle" fontSize={c.h === "." ? 30 : 20} fontWeight={900} fill="var(--color-ink-2)">{c.h}</text>
      ))}
      {rows.map((r) => (
        <g key={r.name}>
          <text x={120} y={r.y} textAnchor="middle" fontSize={26} fontWeight={900} fill={r.color}>{r.name}</text>
          {r.d.map((digit, i) => (
            <motion.text key={i} x={cols[i]!.x} y={r.y} textAnchor="middle" fontSize={46} fontWeight={900} fill={i === 3 && r.name === "Amy" ? GREEN : INK} initial={false} animate={{ opacity: digit ? 1 : 0, scale: digit ? 1 : 0.4 }} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              {digit || "0"}
            </motion.text>
          ))}
        </g>
      ))}
      <motion.text x={410} y={345} textAnchor="middle" fontSize={32} fontWeight={900} fill={GREEN} initial={false} animate={{ opacity: highlight ? 1 : 0 }}>4 tenths &gt; 3 tenths</motion.text>
      <motion.text x={360} y={345} textAnchor="middle" fontSize={30} fontWeight={900} fill={INK} initial={false} animate={{ opacity: zero ? 1 : 0 }}>
        <tspan fill={BLUE}>40 hundredths</tspan> &gt; <tspan fill={ORANGE}>35 hundredths</tspan>
      </motion.text>
    </motion.g>
  );
}

/** A hundred square with `n` squares shaded, filled a column (a tenth) at a time. */
function Hundred({ x, n, color, label }: { x: number; n: number; color: string; label: string }) {
  const s = 22;
  return (
    <g>
      {Array.from({ length: 100 }, (_, i) => {
        const col = Math.floor(i / 10);
        const row = i % 10;
        return <rect key={i} x={x + col * s} y={70 + row * s} width={s} height={s} fill={i < n ? color : "var(--color-surface)"} stroke="var(--color-line-strong)" strokeWidth={1} />;
      })}
      <rect x={x} y={70} width={s * 10} height={s * 10} fill="none" stroke={INK} strokeWidth={3} />
      <text x={x + s * 5} y={330} textAnchor="middle" fontSize={26} fontWeight={900} fill={color}>{label}</text>
    </g>
  );
}

export function CompareStageView({ scene, still = false }: { scene: CompareScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const t = motionOr(still || !!reduce, MOVE);
  const s = scene.stage;
  const table = at(s, "columns") && !at(s, "grid");
  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      <motion.g initial={false} animate={{ opacity: s === "hook" ? 1 : 0 }} transition={t}>
        <Plant x={230} h={200} color={BLUE} name="Amy" value="0.4" show />
        <Plant x={490} h={175} color={ORANGE} name="Ben" value="0.35" show />
        <g>
          <rect x={560} y={40} width={150} height={56} rx={18} fill="var(--color-surface)" stroke={ORANGE} strokeWidth={3} />
          <text x={635} y={77} textAnchor="middle" fontSize={24} fontWeight={900} fill={ORANGE}>35 &gt; 4 ?</text>
        </g>
      </motion.g>
      <Table show={table} highlight={s === "tenths"} zero={at(s, "zero")} />
      <motion.g initial={false} animate={{ opacity: s === "grid" ? 1 : 0 }} transition={t}>
        <Hundred x={100} n={40} color={BLUE} label="0.40 = 40 squares" />
        <Hundred x={400} n={35} color={ORANGE} label="0.35 = 35 squares" />
      </motion.g>
      <motion.g initial={false} animate={{ opacity: s === "rule" ? 1 : 0 }} transition={t} fontSize={28} fontWeight={900}>
        <text x={70} y={140} fill={INK}>1. Line up the decimal points</text>
        <text x={70} y={200} fill={INK}>2. Fill any gaps with zeros</text>
        <text x={70} y={260} fill={GREEN}>3. Compare from the left</text>
      </motion.g>
    </svg>
  );
}
