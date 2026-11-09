"use client";

import type { ReactNode } from "react";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";

/* Building blocks shared by every topic's question inputs. */

export type Mark = "correct" | "wrong" | "missed" | null;

/**
 * Answer tiles: square paper with a quiet edge and a darker bottom edge that
 * sinks when pressed (kid exception 3). Selected tiles get a 2px ink outline.
 */
export function optionClass(selected: boolean, mark: Mark, locked: boolean) {
  const base =
    "relative flex cursor-pointer items-center justify-center gap-3 rounded-[18px] border-2 border-b-4 bg-surface px-4 py-3 transition-[border-color,background-color,transform] duration-100 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink";
  if (mark === "correct") return `${base} border-ok-bright bg-ok-soft`;
  if (mark === "wrong") return `${base} border-num bg-num-soft`;
  if (mark === "missed") return `${base} border-dashed border-ok-bright`;
  if (selected) return `${base} border-ink`;
  return `${base} border-line border-b-line-strong ${locked ? "cursor-default" : "hover:bg-raised active:translate-y-[2px] active:border-b-2"}`;
}

export function MarkIcon({ mark }: { mark: Mark }) {
  if (!mark || mark === "missed") return null;
  return (
    <span
      className={`absolute -right-2 -top-2 grid size-7 place-items-center rounded-full text-[0.9375rem] font-bold text-white ${mark === "correct" ? "bg-ok" : "bg-num-strong"}`}
      aria-hidden
    >
      {mark === "correct" ? <CheckIcon size={15} strokeWidth={3} /> : <CloseIcon size={15} strokeWidth={3} />}
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
  return <div className="flex w-full justify-center rounded-[22px] bg-raised px-4 py-6 sm:py-8">{children}</div>;
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
  const ring = { ink: "border-line-strong focus:border-ink", num: "border-num focus:border-num-strong", den: "border-den focus:border-den-strong" }[tone];
  const text = { ink: "text-ink", num: "text-num-strong", den: "text-den-strong" }[tone];
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
      className={`rounded-[16px] border-2 bg-surface text-center font-bold tabular-nums outline-none transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:bg-sunk ${ring} ${text} ${
        size === "lg" ? "h-16 w-28 text-[2rem]" : "h-12 w-16 text-2xl"
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
