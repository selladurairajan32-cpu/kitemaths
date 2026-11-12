"use client";

import { motion, useReducedMotion } from "motion/react";
import { RichText } from "@/components/math/RichText";
import type { Diagram as Spec, Tone } from "@/topics/kit/deep";

/**
 * D-055: the explainer's pictures, drawn in SVG and animated between steps: new cuts draw in, pieces fill with colour.
 * Colours come from the fraction tokens (numerator coral, denominator blue) so the picture matches the written maths;
 * every picture also has a readout and a text label, so nothing depends on colour alone.
 */

const FILL: Record<Tone, string> = { num: "var(--color-num)", den: "var(--color-den)", ok: "var(--color-ok-bright)", sun: "var(--color-sun)" };
const SOFT: Record<Tone, string> = { num: "var(--color-num-soft)", den: "var(--color-den-soft)", ok: "var(--color-ok-soft)", sun: "var(--color-sun-soft)" };
const INK = "var(--color-ink)";
const EASE = [0.22, 1, 0.36, 1] as const;

export function Diagram({ spec, label }: { spec: Spec; label: string }) {
  return (
    <figure role="img" aria-label={label} className="m-0 w-full">
      {spec.kind === "area" ? <Area spec={spec} /> : <Bars spec={spec} />}
    </figure>
  );
}

function Area({ spec }: { spec: Extract<Spec, { kind: "area" }> }) {
  const reduce = useReducedMotion();
  const t = (delay = 0) => (reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay });
  const W = 520;
  const H = 300;
  const x0 = 90;
  const y0 = 104;
  const cw = W / spec.cols;
  const rh = H / spec.rows;
  const rowShade = spec.rowShade ?? 0;
  const cells = [];
  for (let c = 0; c < spec.cols; c++) {
    for (let r = 0; r < spec.rows; r++) {
      const inCol = c < spec.colShade;
      const inRow = r < rowShade;
      const fill = inCol && inRow ? FILL.ok : inCol ? (rowShade ? SOFT.num : FILL.num) : inRow ? SOFT.den : "var(--color-surface)";
      cells.push(
        <motion.rect
          key={`${c}-${r}`}
          initial={false}
          animate={{ x: x0 + c * cw, y: y0 + r * rh, width: cw, height: rh, fill }}
          transition={t((c + r) * 0.02)}
        />,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${x0 + W + 24} ${y0 + H + 100}`} className="h-auto w-full" aria-hidden>
      {cells}
      {Array.from({ length: spec.cols - 1 }, (_, i) => (
        <motion.line key={`c${i}`} x1={x0 + (i + 1) * cw} x2={x0 + (i + 1) * cw} y1={y0} y2={y0 + H} stroke={INK} strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={t(0.1)} />
      ))}
      {Array.from({ length: spec.rows - 1 }, (_, i) => (
        <motion.line
          key={`r${spec.rows}-${i}`}
          x1={x0}
          x2={x0 + W}
          y1={y0 + (i + 1) * rh}
          y2={y0 + (i + 1) * rh}
          stroke={INK}
          strokeWidth={2}
          strokeDasharray="0"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={t(0.15 + i * 0.06)}
        />
      ))}
      <rect x={x0} y={y0} width={W} height={H} fill="none" stroke={INK} strokeWidth={4} rx={6} />
      {spec.colLabel && (
        <>
          <motion.path initial={false} animate={{ d: `M ${x0} ${y0 - 14} H ${x0 + spec.colShade * cw}` }} stroke="var(--color-num-strong)" strokeWidth={4} strokeLinecap="round" transition={t()} />
          <foreignObject x={x0} y={0} width={spec.colShade * cw} height={y0 - 18}>
            <div className="flex h-full items-center justify-center font-extrabold" style={{ fontSize: 34 }}>
              <RichText text={spec.colLabel} />
            </div>
          </foreignObject>
        </>
      )}
      {spec.rowLabel && rowShade > 0 && (
        <>
          <motion.path initial={false} animate={{ d: `M ${x0 - 14} ${y0} V ${y0 + rowShade * rh}` }} stroke="var(--color-den-strong)" strokeWidth={4} strokeLinecap="round" transition={t()} />
          <foreignObject x={0} y={y0} width={x0 - 22} height={rowShade * rh}>
            <div className="flex h-full items-center justify-center font-extrabold" style={{ fontSize: 34 }}>
              <RichText text={spec.rowLabel} />
            </div>
          </foreignObject>
        </>
      )}
      {spec.readout && (
        <foreignObject x={x0} y={y0 + H + 6} width={W} height={92}>
          <div className="flex h-full items-center justify-center font-extrabold text-ink" style={{ fontSize: 30 }}>
            <RichText text={spec.readout} />
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

function Bars({ spec }: { spec: Extract<Spec, { kind: "bars" }> }) {
  const reduce = useReducedMotion();
  const t = (delay = 0) => (reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, delay });
  const W = 500;
  const H = 84;
  const gap = 30;
    const x0 = 130;
  const total = spec.bars.length * H + (spec.bars.length - 1) * gap;
  return (
    <svg viewBox={`0 0 ${x0 + W + 16} ${total + 24}`} className="h-auto w-full" aria-hidden>
      {spec.bars.map((bar, b) => {
        const y = 12 + b * (H + gap);
        const pw = W / bar.parts;
        const tones: (Tone | null)[] = [];
        for (const f of bar.fill) for (let i = 0; i < f.count; i++) tones.push(f.tone);
        const coarseEvery = bar.coarse ? bar.parts / bar.coarse : 0;
        return (
          <g key={b}>
            <foreignObject x={0} y={y} width={x0 - 16} height={H}>
              <div className="flex h-full items-center justify-end font-extrabold" style={{ fontSize: 34 }}>
                <RichText text={bar.label} />
              </div>
            </foreignObject>
            {Array.from({ length: bar.parts }, (_, i) => (
              <motion.rect
                key={`${b}-${bar.parts}-${i}`}
                y={y}
                height={H}
                initial={reduce ? false : { x: x0 + i * pw, width: pw, fill: "var(--color-surface)" }}
                animate={{ x: x0 + i * pw, width: pw, fill: tones[i] ? FILL[tones[i]!] : "var(--color-surface)" }}
                transition={t(0.25 + i * 0.03)}
              />
            ))}
            {Array.from({ length: bar.parts - 1 }, (_, i) => {
              const thick = coarseEvery > 0 && (i + 1) % coarseEvery === 0;
              const x = x0 + (i + 1) * pw;
              return (
                <motion.line
                  key={`${b}-${bar.parts}-l${i}`}
                  x1={x}
                  x2={x}
                  y1={y}
                  y2={y + H}
                  stroke={INK}
                  strokeWidth={thick || !bar.coarse ? 3 : 1.5}
                  strokeOpacity={thick || !bar.coarse ? 1 : 0.55}
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={t(i * 0.015)}
                />
              );
            })}
            <rect x={x0} y={y} width={W} height={H} fill="none" stroke={INK} strokeWidth={4} rx={8} />
          </g>
        );
      })}
    </svg>
  );
}
