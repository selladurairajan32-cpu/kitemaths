"use client";

import { motion } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Diagram } from "../types";
import { diagramParts, diagramSizes } from "../types";
import { NumberLine } from "@/components/math/NumberLine";

import type { ShapeSize } from "@/components/math/NumberLine";
export type { ShapeSize };

const MAX_W: Record<ShapeSize, string> = {
  xs: "max-w-[132px]",
  sm: "max-w-[220px]",
  md: "max-w-[420px]",
  lg: "max-w-[560px]",
};
const CIRCLE_W: Record<ShapeSize, string> = {
  xs: "max-w-[88px]",
  sm: "max-w-[150px]",
  md: "max-w-[240px]",
  lg: "max-w-[300px]",
};

const FILL_SHADED = "var(--color-num)";
const FILL_EMPTY = "#ffffff";
const FILL_HOVER = "var(--color-num-soft)";
const STROKE = "var(--color-ink)";

interface Part {
  index: number;
  d: string;
  cx: number;
  cy: number;
}

function barParts(sizes: number[], w: number, h: number): Part[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  let x = 0;
  return sizes.map((s, index) => {
    const pw = (s / total) * w;
    const part = { index, d: `M${x},0 h${pw} v${h} h${-pw} Z`, cx: x + pw / 2, cy: h / 2 };
    x += pw;
    return part;
  });
}

function circleParts(sizes: number[], r: number, c: number): Part[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  if (sizes.length === 1) {
    return [{ index: 0, d: `M${c - r},${c} a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0`, cx: c, cy: c }];
  }
  let angle = -Math.PI / 2;
  return sizes.map((s, index) => {
    const sweep = (s / total) * Math.PI * 2;
    const a2 = angle + sweep;
    const x1 = c + r * Math.cos(angle);
    const y1 = c + r * Math.sin(angle);
    const x2 = c + r * Math.cos(a2);
    const y2 = c + r * Math.sin(a2);
    const large = sweep > Math.PI ? 1 : 0;
    const mid = angle + sweep / 2;
    const labelR = sizes.length > 8 ? r * 0.72 : r * 0.6;
    const part = {
      index,
      d: `M${c},${c} L${x1.toFixed(3)},${y1.toFixed(3)} A${r},${r} 0 ${large},1 ${x2.toFixed(3)},${y2.toFixed(3)} Z`,
      cx: c + labelR * Math.cos(mid),
      cy: c + labelR * Math.sin(mid),
    };
    angle = a2;
    return part;
  });
}

function gridParts(rows: number, cols: number, cell: number): Part[] {
  const parts: Part[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      parts.push({
        index: r * cols + c,
        d: `M${c * cell},${r * cell} h${cell} v${cell} h${-cell} Z`,
        cx: c * cell + cell / 2,
        cy: r * cell + cell / 2,
      });
    }
  }
  return parts;
}

export function FractionShape({
  diagram,
  shaded: shadedProp,
  onToggle,
  countParts = false,
  size = "md",
  label,
  className = "",
}: {
  diagram: Diagram;
  shaded?: number[];
  onToggle?: (index: number) => void;
  countParts?: boolean | number[];
  size?: ShapeSize;
  label?: string;
  className?: string;
}) {
  const id = useId();
  const [focusIndex, setFocusIndex] = useState(0);
  const [focused, setFocused] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const refs = useRef<(SVGGElement | null)[]>([]);

  if (diagram.shape === "line") {
    return <NumberLine intervals={diagram.intervals} point={diagram.point} size={size} className={className} />;
  }

  const parts = diagramParts(diagram);
  const shaded = new Set(shadedProp ?? diagram.shaded ?? []);
  const interactive = !!onToggle;
  const strokeW = size === "xs" ? 3 : 2.5;

  let geometry: Part[];
  let vw: number;
  let vh: number;
  if (diagram.shape === "bar") {
    vw = 400;
    vh = size === "xs" ? 110 : 84;
    geometry = barParts(diagramSizes(diagram), vw, vh);
  } else if (diagram.shape === "circle") {
    vw = vh = 200;
    geometry = circleParts(diagramSizes(diagram), 96, 100);
  } else {
    const cell = 60;
    vw = diagram.cols * cell;
    vh = diagram.rows * cell;
    geometry = gridParts(diagram.rows, diagram.cols, cell);
  }

  const shapeName = diagram.shape === "circle" ? "circle" : diagram.shape === "grid" ? "rectangle" : "bar";
  const ariaLabel =
    label ??
    `A ${shapeName} split into ${parts} ${diagram.shape !== "grid" && diagram.sizes ? "unequal" : "equal"} parts, ${shaded.size} shaded`;

  const move = (to: number) => {
    const next = (to + parts) % parts;
    setFocusIndex(next);
    refs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onToggle?.(i);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(i + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(i - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(parts - 1);
    }
  };

  const widthClass = diagram.shape === "circle" ? CIRCLE_W[size] : MAX_W[size];
  const fontSize = diagram.shape === "circle" ? 22 : diagram.shape === "grid" ? 22 : 26;
  const pad = 3;
  const isBar = diagram.shape === "bar";

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${vw + pad * 2} ${vh + pad * 2}`}
      className={`block h-auto w-full ${widthClass} ${interactive ? "touch-manipulation" : ""} ${className}`}
      role={interactive ? "group" : "img"}
      aria-label={interactive ? `${ariaLabel}. Use arrow keys to move and Space to shade.` : ariaLabel}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          {isBar ? (
            <rect x={0} y={0} width={vw} height={vh} rx={10} />
          ) : (
            <rect x={-10} y={-10} width={vw + 20} height={vh + 20} />
          )}
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {geometry.map((p) => {
          const isShaded = shaded.has(p.index);
          const fill = isShaded ? FILL_SHADED : interactive && hover === p.index ? FILL_HOVER : FILL_EMPTY;
          const common = (
            <path
              d={p.d}
              fill={fill}
              stroke={STROKE}
              strokeWidth={strokeW}
              strokeLinejoin="round"
              style={{ transition: "fill 160ms ease" }}
            />
          );
          if (!interactive) return <g key={p.index}>{common}</g>;
          return (
            <g
              key={p.index}
              ref={(el) => {
                refs.current[p.index] = el;
              }}
              role="checkbox"
              aria-checked={isShaded}
              aria-label={`Part ${p.index + 1} of ${parts}`}
              tabIndex={p.index === focusIndex ? 0 : -1}
              className="cursor-pointer outline-none"
              onClick={() => {
                setFocusIndex(p.index);
                onToggle?.(p.index);
              }}
              onKeyDown={(e) => onKey(e, p.index)}
              onFocus={(e) => {
                setFocused(e.currentTarget.matches(":focus-visible") ? p.index : null);
                setFocusIndex(p.index);
              }}
              onBlur={() => setFocused(null)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHover(p.index)}
              onPointerLeave={() => setHover(null)}
            >
              {common}
            </g>
          );
        })}
      </g>
      {isBar && (
        <rect x={0} y={0} width={vw} height={vh} rx={4} fill="none" stroke={STROKE} strokeWidth={strokeW + 0.5} pointerEvents="none" />
      )}
      {focused !== null && (
        <path
          d={geometry[focused].d}
          fill="none"
          stroke="var(--color-den)"
          strokeWidth={5}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      )}
      {countParts &&
        geometry
          .filter((p) => countParts === true || countParts.includes(p.index))
          .map((p, i) => (
          <motion.g
            key={`count-${p.index}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.22, duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: `${p.cx}px ${p.cy}px`, transformBox: "view-box" }}
            pointerEvents="none"
          >
            <circle cx={p.cx} cy={p.cy} r={fontSize * 0.72} fill={countParts === true ? "var(--color-den)" : "var(--color-num-strong)"} />
            <text
              x={p.cx}
              y={p.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fff"
              fontSize={fontSize * 0.78}
              fontWeight={700}
              fontFamily="var(--font-sans)"
            >
              {i + 1}
            </text>
          </motion.g>
        ))}
    </svg>
  );
}
