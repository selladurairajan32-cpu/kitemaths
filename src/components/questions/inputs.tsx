"use client";

import type { ReactNode } from "react";

/* Building blocks shared by every topic's question inputs. */

export type Mark = "correct" | "wrong" | "missed" | null;

export function optionClass(selected: boolean, mark: Mark, locked: boolean) {
  const base =
    "relative flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3 transition-[border-color,background-color,box-shadow,transform] duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-den/25";
  if (mark === "correct") return `${base} border-ok bg-ok-soft`;
  if (mark === "wrong") return `${base} border-num bg-num-soft`;
  if (mark === "missed") return `${base} border-dashed border-ok`;
  if (selected) return `${base} border-ink bg-sunk shadow-[0_0_0_1px_var(--color-ink)]`;
  return `${base} border-line ${locked ? "cursor-default" : "hover:border-line-strong hover:bg-paper active:scale-[0.99]"}`;
}

export function MarkIcon({ mark }: { mark: Mark }) {
  if (!mark || mark === "missed") return null;
  return (
    <span
      className={`absolute -right-2 -top-2 grid size-6 place-items-center rounded-full text-xs font-bold text-white ${mark === "correct" ? "bg-ok" : "bg-num"}`}
      aria-hidden
    >
      {mark === "correct" ? "✓" : "✗"}
    </span>
  );
}

export function RadioOption({
  name,
  value,
  checked,
  onSelect,
  locked,
  mark,
  label,
  children,
  className = "",
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: () => void;
  locked: boolean;
  mark: Mark;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`${optionClass(checked, mark, locked)} ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        className="sr-only"
        checked={checked}
        disabled={locked}
        onChange={onSelect}
        aria-label={label + (mark === "correct" ? " (correct answer)" : mark === "wrong" ? " (your answer, incorrect)" : "")}
      />
      {children}
      <MarkIcon mark={mark} />
    </label>
  );
}

export function Figure({ children }: { children: ReactNode }) {
  return <div className="flex w-full justify-center rounded-2xl bg-paper px-4 py-6 sm:py-8">{children}</div>;
}

export function NumberInput({
  value,
  onValue,
  locked,
  label,
  unit,
  size = "lg",
  tone = "ink",
}: {
  value: number | null;
  onValue: (v: number | null) => void;
  locked: boolean;
  label: string;
  unit?: string;
  size?: "md" | "lg";
  tone?: "ink" | "num" | "den";
}) {
  const ring = { ink: "border-line-strong focus:border-ink", num: "border-num/60 focus:border-num", den: "border-den/60 focus:border-den" }[tone];
  const text = { ink: "text-ink", num: "text-num-strong", den: "text-den" }[tone];
  const input = (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      aria-label={label}
      disabled={locked}
      value={value === null || Number.isNaN(value) ? "" : String(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
        onValue(digits === "" ? null : Number(digits));
      }}
      className={`rounded-xl border-2 bg-surface text-center font-semibold tabular-nums outline-none transition-colors disabled:bg-sunk ${ring} ${text} ${
        size === "lg" ? "h-16 w-28 text-3xl" : "h-12 w-16 text-2xl"
      }`}
    />
  );
  if (!unit) return input;
  return (
    <span className="inline-flex items-center gap-2 text-xl font-medium text-ink-2">
      {unit === "£" && <span aria-hidden>£</span>}
      {input}
      {unit !== "£" && <span>{unit}</span>}
    </span>
  );
}
