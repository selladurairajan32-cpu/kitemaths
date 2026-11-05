"use client";

import { AnimatePresence, motion } from "motion/react";
import { toWords } from "@/maths/fraction";

type Size = "inline" | "sm" | "md" | "lg" | "xl";

const SIZE: Record<Size, { text: string; bar: string; gap: string; pad: string }> = {
  inline: { text: "text-[0.92em] leading-[1.05]", bar: "h-[1.5px]", gap: "gap-[1px]", pad: "px-[0.18em]" },
  sm: { text: "text-base leading-none", bar: "h-[2px]", gap: "gap-[3px]", pad: "px-1" },
  md: { text: "text-2xl leading-none", bar: "h-[2.5px]", gap: "gap-1", pad: "px-1.5" },
  lg: { text: "text-4xl leading-none", bar: "h-[3px]", gap: "gap-1.5", pad: "px-2" },
  xl: { text: "text-6xl leading-none", bar: "h-1", gap: "gap-2", pad: "px-3" },
};

function Digit({ value, className, animate }: { value: string; className: string; animate: boolean }) {
  if (!animate) return <span className={className}>{value}</span>;
  return (
    <span className="relative inline-grid overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className={className}
          initial={{ y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-60%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FractionNotation({
  n,
  d,
  size = "md",
  animate = false,
  muted = false,
  tint = false,
  className = "",
}: {
  n: number | string;
  d: number | string;
  size?: Size;
  animate?: boolean;
  muted?: boolean;
  /**
   * On a tinted content panel (UX-004), use the darker denominator blue so small digits keep at
   * least 4.5:1 contrast (DEF-022). Off by default, so existing screens are unchanged.
   */
  tint?: boolean;
  className?: string;
}) {
  const s = SIZE[size];
  const spoken =
    typeof n === "number" && typeof d === "number" && d > 0 && d <= 12 && n <= 12
      ? toWords({ n, d })
      : `${n} over ${d}`;
  const numColor = muted ? "text-ink-2" : "text-num-strong";
  const denColor = muted ? "text-ink-2" : tint ? "text-den-strong" : "text-den";
  return (
    <span
      className={`inline-flex flex-col items-center align-middle font-semibold tabular-nums ${s.gap} ${s.pad} ${className}`}
      style={size === "inline" ? { verticalAlign: "middle", margin: "0.1em 0" } : undefined}
    >
      <span className="sr-only">{spoken}</span>
      <span aria-hidden className={`${s.text} ${numColor}`}>
        <Digit value={String(n)} className="block text-center" animate={animate} />
      </span>
      <span aria-hidden className={`w-full min-w-[0.9em] rounded-full bg-ink ${s.bar}`} />
      <span aria-hidden className={`${s.text} ${denColor}`}>
        <Digit value={String(d)} className="block text-center" animate={animate} />
      </span>
    </span>
  );
}
