"use client";

import { motion } from "motion/react";
import type { SkillStatus } from "@/engine/mastery";

export function ProgressBar({
  value,
  label,
  tone = "den",
  className = "",
}: {
  value: number;
  label: string;
  tone?: "den" | "ok" | "num" | "ink";
  className?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const fill = { den: "bg-den", ok: "bg-ok", num: "bg-num", ink: "bg-ink" }[tone];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full overflow-hidden rounded-full bg-sunk ${className}`}
    >
      <motion.div
        className={`h-full rounded-full ${fill}`}
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 24 }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 88,
  label,
  children,
}: {
  value: number;
  size?: number;
  label: string;
  children?: React.ReactNode;
}) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(pct * 100)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-sunk" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-ok"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 90, damping: 22 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

export const STATUS_META: Record<SkillStatus, { label: string; className: string; dot: string }> = {
  "not-started": { label: "Not started", className: "bg-sunk text-muted", dot: "bg-line-strong" },
  developing: { label: "Developing", className: "bg-warn-soft text-warn", dot: "bg-warn" },
  secure: { label: "Secure in practice", className: "bg-den-soft text-den-strong", dot: "bg-den" },
  "passed-check": { label: "Passed check", className: "bg-example-soft text-example-ink", dot: "bg-example-ink" },
  mastered: { label: "Mastered", className: "bg-ok-soft text-ok", dot: "bg-ok" },
  "needs-review": { label: "Needs review", className: "bg-num-soft text-num-strong", dot: "bg-num" },
};

export function EvidenceMeter({
  count,
  needed,
  score,
  label,
}: {
  count: number;
  needed: number;
  score: number;
  label: string;
}) {
  if (count < needed) {
    return (
      <div className="flex items-center gap-2" role="img" aria-label={`${label}: ${count} of ${needed} answers needed before a score is shown`}>
        <span className="flex gap-1" aria-hidden>
          {Array.from({ length: needed }, (_, i) => (
            <span key={i} className={`h-2 w-5 rounded-full ${i < count ? "bg-den/60" : "bg-sunk"}`} />
          ))}
        </span>
        <span className="text-[0.9375rem] text-muted">
          {count}/{needed} answers
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <ProgressBar value={score} label={`${label}: recent score ${Math.round(score * 100)}%`} tone={score >= 0.75 ? "ok" : "den"} className="w-24" />
      <span className="whitespace-nowrap text-[0.9375rem] text-muted">{Math.round(score * 100)}% recent</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: SkillStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.9375rem] font-medium ${m.className}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} aria-hidden />
      {m.label}
    </span>
  );
}
