"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import type { FracScene, FracStage as Stage } from "./addDifferentScript";
import { sliceMid, slicePath } from "./pizza";

/**
 * D-043 Step through for ⅓ + ¼, with pizzas. Sam's third and Zara's quarter; the wrong answer 2/7 crossed out; the
 * slices compared; both pizzas recut into twelfths; the slices counted; then the 4 + 3 slices glide onto one pizza to
 * make 7/12, with a bar of twelfths underneath; and the rule. The caption beside the stage says everything shown, so the
 * picture is hidden from screen readers. With reduced motion (or as a still) every change is instant.
 */

const ORDER: Stage[] = ["hook", "mistake", "slices", "cut", "count", "combine", "rule"];
const at = (stage: Stage, from: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(from);

const BLUE = "var(--color-brand)";
const ORANGE = "var(--color-num)";
const INK = "var(--color-ink)";
const R = 92;
const SAM = { cx: 150, cy: 150 };
const ZARA = { cx: 570, cy: 150 };
const WHOLE = { cx: 360, cy: 150 };

function Frac({ x, y, n, d, color, size = 30, show, t }: { x: number; y: number; n: number; d: number; color: string; size?: number; show: boolean; t: Transition }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={t} fontWeight={900} fontSize={size} fill={color} textAnchor="middle">
      <text x={x} y={y}>{n}</text>
      <line x1={x - size * 0.55} x2={x + size * 0.55} y1={y + 9} y2={y + 9} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={x} y={y + 9 + size}>{d}</text>
    </motion.g>
  );
}

/** An empty pizza base cut into n slices, with its rim. */
function Base({ cx, cy, n, show, faded, t }: { cx: number; cy: number; n: number; show: boolean; faded?: boolean; t: Transition }) {
  return (
    <motion.g initial={false} animate={{ opacity: show ? (faded ? 0.3 : 1) : 0 }} transition={t}>
      {Array.from({ length: n }, (_, k) => (
        <path key={`${n}-${k}`} d={slicePath(cx, cy, R, n, k)} fill="var(--color-surface)" stroke="var(--color-line-strong)" strokeWidth={1.5} />
      ))}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={4} />
    </motion.g>
  );
}

export function FracStageView({ scene, still = false }: { scene: FracScene; still?: boolean }) {
  const reduce = useReducedMotion();
  const instant = still || !!reduce;
  const t = motionOr(instant, { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
  const move = motionOr(instant, MOVE);
  const s = scene.stage;
  const twelfths = at(s, "cut");
  const together = s === "combine";
  const pizzas = s !== "rule";
  const counting = s === "count";

  // Sam's third: 1 of 3 slices, or 4 of 12. Zara's quarter: 1 of 4, or 3 of 12. In "combine" every slice glides to its
  // place on the whole pizza: Sam's into places 0 to 3, Zara's (rotated a third of a turn) into 4 to 6.
  const samSlices = twelfths ? [0, 1, 2, 3].map((k) => ({ key: `s${k}`, d: slicePath(SAM.cx, SAM.cy, R, 12, k), to: slicePath(WHOLE.cx, WHOLE.cy, R, 12, k), k })) : [{ key: "s0", d: slicePath(SAM.cx, SAM.cy, R, 3, 0), to: "", k: 0 }];
  const zaraSlices = twelfths ? [0, 1, 2].map((k) => ({ key: `z${k}`, d: slicePath(ZARA.cx, ZARA.cy, R, 12, k), to: slicePath(WHOLE.cx, WHOLE.cy, R, 12, k + 4), k })) : [{ key: "z0", d: slicePath(ZARA.cx, ZARA.cy, R, 4, 0), to: "", k: 0 }];
  const toppings = (cx: number, cy: number, n: number, k: number): [number, number][] => (n <= 4 ? [sliceMid(cx, cy, R, n, k, 0.62), sliceMid(cx, cy, R, n, k, 0.36)] : []);

  return (
    <svg viewBox="0 0 720 400" className="block h-auto w-full" aria-hidden fontFamily="inherit">
      {/* The question, between the pizzas. */}
      <motion.g initial={false} animate={{ opacity: s === "hook" || s === "mistake" ? 1 : 0 }} transition={t} fontSize={40} fontWeight={900} textAnchor="middle">
        <text x={360} y={164} fill={INK}>
          <tspan fill={BLUE}>1/3</tspan> + <tspan fill={ORANGE}>1/4</tspan> = <tspan fill={s === "mistake" ? "var(--color-warn)" : INK}>{s === "mistake" ? "2/7" : "?"}</tspan>
        </text>
        {s === "mistake" && <line x1={400} y1={170} x2={460} y2={130} stroke="var(--color-warn)" strokeWidth={6} strokeLinecap="round" />}
      </motion.g>
      <motion.text initial={false} animate={{ opacity: s === "mistake" ? 1 : 0 }} transition={t} x={360} y={372} textAnchor="middle" fontSize={24} fontWeight={900} fill="var(--color-warn)">
        2/7 is smaller than 1/3 on its own!
      </motion.text>

      {/* Two pizzas, recut into twelfths from "cut" on; they fade when their slices move onto the whole pizza. */}
      <Base cx={SAM.cx} cy={SAM.cy} n={twelfths ? 12 : 3} show={pizzas} faded={together} t={t} />
      <Base cx={ZARA.cx} cy={ZARA.cy} n={twelfths ? 12 : 4} show={pizzas} faded={together} t={t} />
      <Base cx={WHOLE.cx} cy={WHOLE.cy} n={12} show={together} t={t} />

      {pizzas && samSlices.map((x, i) => (
        <motion.g key={x.key} initial={false} animate={{ opacity: 1 }} transition={{ ...move, delay: together && !instant ? i * 0.12 : 0 }}>
          <motion.path initial={false} animate={{ d: together ? x.to : x.d }} transition={{ ...move, delay: together && !instant ? i * 0.12 : 0 }} fill="var(--color-sun)" stroke={BLUE} strokeWidth={3} strokeLinejoin="round" />
          {!twelfths && toppings(SAM.cx, SAM.cy, 3, 0).map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r={7} fill="var(--color-kite-red)" />)}
        </motion.g>
      ))}
      {pizzas && zaraSlices.map((x, i) => (
        <motion.g key={x.key} initial={false} animate={{ opacity: 1 }} transition={t}>
          <motion.path initial={false} animate={{ d: together ? x.to : x.d }} transition={{ ...move, delay: together && !instant ? 0.5 + i * 0.12 : 0 }} fill="var(--color-sun)" stroke={ORANGE} strokeWidth={3} strokeLinejoin="round" />
          {!twelfths && toppings(ZARA.cx, ZARA.cy, 4, 0).map(([cx, cy], j) => <circle key={j} cx={cx} cy={cy} r={7} fill="var(--color-kite-red)" />)}
        </motion.g>
      ))}

      {/* "big slice", "smaller slice". */}
      <motion.g initial={false} animate={{ opacity: s === "slices" ? 1 : 0 }} transition={t} fontSize={22} fontWeight={900} textAnchor="middle">
        <text x={SAM.cx} y={42} fill={BLUE}>big slice</text>
        <text x={ZARA.cx} y={42} fill={ORANGE}>smaller slice</text>
        <text x={360} y={164} fill={INK} fontSize={22}>different sizes</text>
      </motion.g>
      <motion.text initial={false} animate={{ opacity: s === "cut" ? 1 : 0 }} transition={t} x={360} y={160} textAnchor="middle" fontSize={34} fontWeight={900} fill={INK}>
        3 × 4 = 12
      </motion.text>

      {/* Counting: numbers just outside the shaded twelfths. */}
      {[...[0, 1, 2, 3].map((k) => ({ k, c: SAM, n: k + 1 })), ...[0, 1, 2].map((k) => ({ k, c: ZARA, n: k + 1 }))].map(({ k, c, n }, i) => {
        const [x, y] = sliceMid(c.cx, c.cy, R, 12, k, 1.2);
        return (
          <motion.text key={i} x={x} y={y + 7} textAnchor="middle" fontSize={20} fontWeight={900} fill={INK} initial={false} animate={{ opacity: counting ? 1 : 0 }} transition={{ ...t, delay: counting && !instant ? 0.3 + i * 0.35 : 0 }}>
            {n}
          </motion.text>
        );
      })}

      {/* Labels under the pizzas. */}
      <Frac x={SAM.cx} y={290} n={twelfths ? 4 : 1} d={twelfths ? 12 : 3} color={BLUE} show={pizzas && !together} t={t} />
      <Frac x={ZARA.cx} y={290} n={twelfths ? 3 : 1} d={twelfths ? 12 : 4} color={ORANGE} show={pizzas && !together} t={t} />
      <motion.g initial={false} animate={{ opacity: pizzas && !together ? 1 : 0 }} transition={t} fontSize={22} fontWeight={900} textAnchor="middle">
        <text x={SAM.cx} y={270} fill={BLUE}>Sam</text>
        <text x={ZARA.cx} y={270} fill={ORANGE}>Zara</text>
      </motion.g>

      {/* Together: 7/12, and the same as a bar of twelfths. */}
      <motion.g initial={false} animate={{ opacity: together ? 1 : 0 }} transition={{ ...t, delay: together && !instant ? 1.2 : 0 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={180 + i * 30} y={268} width={30} height={30} fill={i < 4 ? BLUE : i < 7 ? ORANGE : "var(--color-surface)"} stroke={INK} strokeWidth={2.5} />
        ))}
        <text x={360} y={345} textAnchor="middle" fontSize={34} fontWeight={900}>
          <tspan fill={BLUE}>4/12</tspan>
          <tspan fill={INK}> + </tspan>
          <tspan fill={ORANGE}>3/12</tspan>
          <tspan fill={INK}> = </tspan>
          <tspan fill="var(--color-ok)">7/12</tspan>
        </text>
      </motion.g>

      {/* The rule. */}
      <motion.g initial={false} animate={{ opacity: s === "rule" ? 1 : 0 }} transition={t} fontSize={28} fontWeight={900}>
        <text x={80} y={140} fill={INK}>1. Make the slices the same size</text>
        <text x={80} y={196} fill={INK}>2. Add the tops</text>
        <text x={80} y={252} fill="var(--color-ok)">3. The bottom number stays the same</text>
      </motion.g>
    </svg>
  );
}
