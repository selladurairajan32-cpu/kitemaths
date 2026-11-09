"use client";

import { motion } from "motion/react";
import { useRef, type KeyboardEvent, type PointerEvent } from "react";
/** Shared size scale for maths pictures. */
export type ShapeSize = "xs" | "sm" | "md" | "lg";

const MAX_W: Record<ShapeSize, string> = {
  xs: "max-w-[180px]",
  sm: "max-w-[300px]",
  md: "max-w-[560px]",
  lg: "max-w-[680px]",
};

export function NumberLine({
  intervals,
  point,
  selected,
  onSelect,
  countGaps = false,
  fractionLabels = false,
  correctIndex,
  size = "md",
  className = "",
}: {
  intervals: number;
  point?: number;
  selected?: number | null;
  onSelect?: (index: number) => void;
  countGaps?: boolean;
  fractionLabels?: boolean;
  correctIndex?: number;
  size?: ShapeSize;
  className?: string;
}) {
  const W = 600;
  const H = countGaps ? 150 : 124;
  const left = 36;
  const right = W - 36;
  const y = countGaps ? 92 : 66;
  const step = (right - left) / intervals;
  const xs = Array.from({ length: intervals + 1 }, (_, i) => left + i * step);
  const interactive = !!onSelect;
  const marker = interactive ? selected ?? null : point ?? null;

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  /** The nearest mark to a pointer position, snapped to a tick from 1 to `intervals` (LAB-006 AC2). */
  const markAt = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r || r.width === 0) return null;
    const x = ((clientX - r.left) / r.width) * W;
    return Math.max(1, Math.min(intervals, Math.round((x - left) / step)));
  };
  // Drag the marker along the line with a mouse, pen or finger (LAB-006 AC1, AC3). Tapping a mark still works.
  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const m = markAt(e.clientX);
    if (m !== null && m !== selected) onSelect?.(m);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const m = markAt(e.clientX);
    if (m !== null && m !== selected) onSelect?.(m);
  };
  const endDrag = () => {
    dragging.current = false;
  };

  const choose = (i: number, from: Element) => {
    const clamped = Math.max(1, Math.min(intervals, i));
    onSelect?.(clamped);
    const svg = from.closest("svg");
    requestAnimationFrame(() => (svg?.querySelector(`[data-mark="${clamped}"]`) as SVGGElement | null)?.focus());
  };

  const onKey = (e: KeyboardEvent<SVGGElement>, i: number) => {
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowUp: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i - 1,
      Home: 1,
      End: intervals,
    };
    if (e.key in map) {
      e.preventDefault();
      choose(map[e.key], e.currentTarget);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      choose(i, e.currentTarget);
    }
  };

  const label = interactive
    ? `Number line from 0 to 1 split into ${intervals} equal gaps. Drag the marker, tap a mark, or use the arrow keys.`
    : `Number line from 0 to 1 split into ${intervals} equal gaps${point !== undefined ? `, with a point ${point} gaps from 0` : ""}`;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-auto w-full ${MAX_W[size]} ${interactive ? "touch-none select-none" : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role={interactive ? "radiogroup" : "img"}
      aria-label={label}
    >
      <line x1={left - 14} y1={y} x2={right + 14} y2={y} stroke="var(--color-ink)" strokeWidth={3} strokeLinecap="round" />

      {countGaps &&
        xs.slice(0, -1).map((x, i) => (
          <motion.g
            key={`gap-${i}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.3 }}
          >
            <path
              d={`M${x + 4},${y - 12} Q${x + step / 2},${y - 12 - Math.min(46, step * 0.55)} ${x + step - 4},${y - 12}`}
              fill="none"
              stroke="var(--color-den)"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle cx={x + step / 2} cy={y - 14 - Math.min(40, step * 0.45)} r={13} fill="var(--color-den)" />
            <text
              x={x + step / 2}
              y={y - 14 - Math.min(40, step * 0.45)}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              fontSize={15}
              fontWeight={700}
            >
              {i + 1}
            </text>
          </motion.g>
        ))}

      {xs.map((x, i) => {
        const end = i === 0 || i === intervals;
        return (
          <g key={`tick-${i}`}>
            <line x1={x} y1={y - (end ? 16 : 11)} x2={x} y2={y + (end ? 16 : 11)} stroke="var(--color-ink)" strokeWidth={end ? 3 : 2.4} strokeLinecap="round" />
            {end && (
              <text x={x} y={y + 40} textAnchor="middle" fontSize={22} fontWeight={600} fill="var(--color-ink)">
                {i === 0 ? 0 : 1}
              </text>
            )}
            {fractionLabels && !end && (
              <text x={x} y={y + 38} textAnchor="middle" fontSize={15} fill="var(--color-muted)">
                {i}/{intervals}
              </text>
            )}
          </g>
        );
      })}

      {correctIndex !== undefined && correctIndex !== marker && (
        <g>
          <circle cx={xs[correctIndex]} cy={y} r={13} fill="none" stroke="var(--color-ok-bright)" strokeWidth={3} strokeDasharray="4 4" />
        </g>
      )}

      {marker !== null && marker !== undefined && (
        <motion.g
          key={`marker-${marker}`}
          initial={{ y: -18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          pointerEvents="none"
        >
          <path
            d={`M${xs[marker]},${y - 6} l-11,-18 a13,13 0 1,1 22,0 Z`}
            fill="var(--color-num)"
            stroke="var(--color-num-strong)"
            strokeWidth={1.5}
          />
          <circle cx={xs[marker]} cy={y - 31} r={4.5} fill="#fff" />
        </motion.g>
      )}

      {interactive &&
        xs.map((x, i) => {
          if (i === 0) return null;
          const checked = selected === i;
          const focusable = selected ? checked : i === 1;
          return (
            <g
              key={`hit-${i}`}
              data-mark={i}
              role="radio"
              aria-checked={checked}
              aria-label={`Mark ${i} of ${intervals}`}
              tabIndex={focusable ? 0 : -1}
              className="group cursor-pointer outline-none"
              onClick={(e) => choose(i, e.currentTarget)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <rect x={x - Math.min(step, 120) / 2} y={y - 56} width={Math.min(step, 120)} height={112} fill="transparent" />
              <circle
                cx={x}
                cy={y}
                r={9}
                className="fill-transparent stroke-transparent transition-colors group-hover:fill-num-soft group-hover:stroke-num group-focus-visible:fill-den-soft group-focus-visible:stroke-den"
                strokeWidth={2.5}
              />
            </g>
          );
        })}
    </svg>
  );
}
