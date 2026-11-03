"use client";

import { useId } from "react";
import { FractionNotation } from "@/components/math/FractionNotation";
import { FractionShape } from "./FractionShape";
import { NumberLine } from "@/components/math/NumberLine";
import { RichText } from "@/components/math/RichText";
import { Figure, MarkIcon, NumberInput, optionClass, RadioOption, type Mark } from "@/components/questions/inputs";
import { Counters, StackedBars } from "./Visuals";
import { Stepper } from "./FractionLab";
import { seededShuffle } from "@/engine/random";
import { compare, compareSymbol, sameFraction, toWords, type CompareSymbol, type Fraction } from "../math";
import type { FractionQuestion, Response } from "../types";
import { diagramParts } from "../types";

export interface QuestionInputProps {
  question: FractionQuestion;
  response: Response | null;
  onChange: (r: Response | null) => void;
  locked: boolean;
  reveal?: boolean;
  orderKey?: string;
}

function FractionOptions({
  options,
  answer,
  response,
  onPick,
  locked,
  reveal,
}: {
  options: Fraction[];
  answer: Fraction;
  response: Fraction | null;
  onPick: (f: Fraction) => void;
  locked: boolean;
  reveal?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <legend className="sr-only">Choose a fraction</legend>
      {options.map((o) => {
        const checked = !!response && sameFraction(response, o);
        const isAnswer = sameFraction(o, answer);
        const mark: Mark = reveal ? (isAnswer ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
        return (
          <RadioOption
            key={`${o.n}/${o.d}`}
            name={name}
            value={`${o.n}/${o.d}`}
            checked={checked}
            onSelect={() => onPick({ n: o.n, d: o.d })}
            locked={locked}
            mark={mark}
            label={`${o.n} over ${o.d}`}
            className="min-h-24"
          >
            <FractionNotation n={o.n} d={o.d} size="md" />
          </RadioOption>
        );
      })}
    </fieldset>
  );
}

const SYMBOL_LABEL: Record<CompareSymbol, string> = { "<": "is less than", "=": "is equal to", ">": "is greater than" };

export function FractionsQuestionInput({ question: q, response, onChange, locked, reveal, orderKey }: QuestionInputProps) {
  const name = useId();
  const order = <T,>(items: T[], salt: string): T[] => (orderKey ? seededShuffle(items, `${orderKey}:${q.id}:${salt}`) : items);

  switch (q.kind) {
    case "choose-fraction": {
      const r = response?.kind === "choose-fraction" ? response.choice : null;
      return (
        <div className="flex flex-col gap-5">
          <Figure>
            <FractionShape diagram={q.diagram} size="md" />
          </Figure>
          <FractionOptions options={order(q.options, "options")} answer={q.answer} response={r} onPick={(choice) => onChange({ kind: "choose-fraction", choice })} locked={locked} reveal={reveal} />
        </div>
      );
    }

    case "write-fraction": {
      const v = response?.kind === "write-fraction" ? response.value : { n: NaN, d: NaN };
      const set = (patch: Partial<Fraction>) => onChange({ kind: "write-fraction", value: { ...v, ...patch } });
      return (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-10">
          <Figure>
            <FractionShape diagram={q.diagram} size="md" />
          </Figure>
          <div className="flex flex-col items-center gap-2" role="group" aria-label="Write your fraction">
            <NumberInput value={Number.isNaN(v.n) ? null : v.n} onValue={(n) => set({ n: n ?? NaN })} locked={locked} label="Numerator (top number)" size="md" tone="num" />
            <span className="h-1 w-20 rounded-full bg-ink" aria-hidden />
            <NumberInput value={Number.isNaN(v.d) ? null : v.d} onValue={(d) => set({ d: d ?? NaN })} locked={locked} label="Denominator (bottom number)" size="md" tone="den" />
            {reveal && (
              <p className="mt-1 text-sm text-ok">
                Answer: <FractionNotation n={q.answer.n} d={q.answer.d} size="inline" />
              </p>
            )}
          </div>
        </div>
      );
    }

    case "choose": {
      const choice = response?.kind === "choose" ? response.choice : null;
      const hasDiagrams = q.options.some((o) => o.diagram);
      return (
        <div className="flex flex-col gap-5">
          {q.diagram && (
            <Figure>
              <FractionShape diagram={q.diagram} size="md" />
            </Figure>
          )}
          <fieldset className={hasDiagrams ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "flex flex-col gap-2.5"}>
            <legend className="sr-only">Choose an answer</legend>
            {order(q.options, "options").map((o, i) => {
              const checked = choice === o.id;
              const isAnswer = o.id === q.answer;
              const mark: Mark = reveal ? (isAnswer ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
              return (
                <RadioOption
                  key={o.id}
                  name={name}
                  value={o.id}
                  checked={checked}
                  onSelect={() => onChange({ kind: "choose", choice: o.id })}
                  locked={locked}
                  mark={mark}
                  label={hasDiagrams ? `Picture ${String.fromCharCode(65 + i)}` : o.label.replace(/[{}*]/g, "")}
                  className={hasDiagrams ? "flex-col py-4" : "justify-start text-left"}
                >
                  {o.diagram && (
                    <span className="flex w-full flex-1 items-center justify-center">
                      <FractionShape diagram={o.diagram} size="xs" />
                    </span>
                  )}
                  {!hasDiagrams && (
                    <span
                      aria-hidden
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-ink" : "border-line-strong"}`}
                    >
                      {checked && <span className="size-2.5 rounded-full bg-ink" />}
                    </span>
                  )}
                  {hasDiagrams ? (
                    <span className="font-semibold">{String.fromCharCode(65 + i)}</span>
                  ) : (
                    <RichText text={o.label} className="leading-relaxed" />
                  )}
                </RadioOption>
              );
            })}
          </fieldset>
        </div>
      );
    }

    case "shade": {
      const shaded = response?.kind === "shade" ? response.shaded : [];
      const parts = diagramParts(q.diagram);
      const toggle = (i: number) => {
        if (locked) return;
        const next = shaded.includes(i) ? shaded.filter((x) => x !== i) : [...shaded, i];
        onChange(next.length ? { kind: "shade", shaded: next } : null);
      };
      return (
        <Figure>
          <div className="flex w-full flex-col items-center gap-4">
            <FractionShape diagram={q.diagram} shaded={shaded} onToggle={locked ? undefined : toggle} size="lg" />
            <div className="flex items-center gap-3">
              <p className="text-sm text-ink-2" aria-live="polite">
                <strong className="text-num-strong">{shaded.length}</strong> of {parts} parts shaded
              </p>
              {!locked && shaded.length > 0 && (
                <button type="button" onClick={() => onChange(null)} className="h-11 rounded-lg px-3 text-sm text-muted underline-offset-2 hover:text-ink hover:underline">
                  Clear
                </button>
              )}
            </div>
          </div>
        </Figure>
      );
    }

    case "equal-parts": {
      const selected = response?.kind === "equal-parts" ? response.selected : [];
      const toggle = (id: string) => {
        const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
        onChange(next.length ? { kind: "equal-parts", selected: next } : null);
      };
      return (
        <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <legend className="sr-only">Select all shapes with equal parts</legend>
          {order(q.items, "items").map((it, i) => {
            const checked = selected.includes(it.id);
            const isAnswer = q.answer.includes(it.id);
            const mark: Mark = reveal ? (isAnswer ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
            return (
              <label key={it.id} className={`${optionClass(checked, mark, locked)} min-h-36 flex-col`}>
                <input type="checkbox" className="sr-only" value={it.id} checked={checked} disabled={locked} onChange={() => toggle(it.id)} aria-label={`Shape ${String.fromCharCode(65 + i)}`} />
                <span className="flex w-full flex-1 items-center justify-center">
                  <FractionShape diagram={it.diagram} size="sm" />
                </span>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden className={`grid size-5 place-items-center rounded-md border-2 text-[0.7rem] ${checked ? "border-ink bg-ink text-white" : "border-line-strong"}`}>
                    {checked && "✓"}
                  </span>
                  {String.fromCharCode(65 + i)}
                </span>
                <MarkIcon mark={mark} />
              </label>
            );
          })}
        </fieldset>
      );
    }

    case "match": {
      const pairs = response?.kind === "match" ? response.pairs : {};
      return (
        <div className="flex flex-col gap-3">
          {q.rows.map((row, i) => {
            const letter = String.fromCharCode(65 + i);
            const given = pairs[row.id];
            return (
              <fieldset key={row.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-3 sm:flex-row sm:items-center sm:gap-5 sm:p-4">
                <legend className="sr-only">Picture {letter}: choose its fraction</legend>
                <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-white" aria-hidden>
                    {letter}
                  </span>
                  <FractionShape diagram={row.diagram} size="sm" />
                </div>
                <div className="grid flex-1 grid-cols-3 gap-2">
                  {order(q.choices, "choices").map((c) => {
                    const checked = !!given && sameFraction(given, c);
                    const isAnswer = sameFraction(c, row.answer);
                    const mark: Mark = reveal ? (isAnswer ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
                    return (
                      <RadioOption
                        key={`${c.n}/${c.d}`}
                        name={`${name}-${row.id}`}
                        value={`${row.id}=${c.n}/${c.d}`}
                        checked={checked}
                        onSelect={() => onChange({ kind: "match", pairs: { ...pairs, [row.id]: { n: c.n, d: c.d } } })}
                        locked={locked}
                        mark={mark}
                        label={`Picture ${letter} is ${c.n} over ${c.d}`}
                        className="min-h-20 py-2"
                      >
                        <FractionNotation n={c.n} d={c.d} size="sm" />
                      </RadioOption>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      );
    }

    case "compare": {
      const symbol = response?.kind === "compare" ? response.symbol : null;
      const correct = compareSymbol(q.left, q.right);
      return (
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 sm:gap-6" aria-hidden>
            <FractionNotation n={q.left.n} d={q.left.d} size="lg" />
            <span className={`grid size-16 place-items-center rounded-2xl border-2 border-dashed text-3xl font-semibold ${symbol ? "border-ink bg-sunk" : "border-line-strong text-muted"}`}>
              {symbol ?? "?"}
            </span>
            <FractionNotation n={q.right.n} d={q.right.d} size="lg" />
          </div>
          {q.showVisual && (
            <div className="flex w-full justify-center rounded-2xl bg-paper px-4 py-5">
              <StackedBars rows={[{ f: q.left }, { f: q.right }]} />
            </div>
          )}
          <fieldset className="grid w-full max-w-md grid-cols-3 gap-3">
            <legend className="sr-only">
              Choose: {q.left.n} over {q.left.d} … {q.right.n} over {q.right.d}
            </legend>
            {(["<", "=", ">"] as CompareSymbol[]).map((s) => {
              const checked = symbol === s;
              const mark: Mark = reveal ? (s === correct ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
              return (
                <RadioOption key={s} name={name} value={s} checked={checked} onSelect={() => onChange({ kind: "compare", symbol: s })} locked={locked} mark={mark} label={SYMBOL_LABEL[s]} className="flex-col gap-0.5 py-3">
                  <span className="text-3xl font-semibold leading-none">{s}</span>
                  <span className="text-xs text-muted">{SYMBOL_LABEL[s]}</span>
                </RadioOption>
              );
            })}
          </fieldset>
        </div>
      );
    }

    case "number-line-place": {
      const index = response?.kind === "number-line-place" ? response.index : null;
      const correctIndex = (q.target.n * q.intervals) / q.target.d;
      return (
        <Figure>
          <div className="flex w-full flex-col items-center gap-3">
            <NumberLine
              intervals={q.intervals}
              selected={index}
              onSelect={locked ? undefined : (i) => onChange({ kind: "number-line-place", index: i })}
              point={locked ? index ?? undefined : undefined}
              correctIndex={reveal ? correctIndex : undefined}
              size="lg"
            />
            <p className="text-sm text-ink-2" aria-live="polite">
              {index ? (
                <>
                  Marked <strong>{index}</strong> jump{index === 1 ? "" : "s"} from 0
                </>
              ) : (
                "Tap a mark on the line"
              )}
            </p>
          </div>
        </Figure>
      );
    }

    case "fraction-of":
    case "number":
    case "missing-number": {
      const value = response && "value" in response && typeof response.value === "number" ? response.value : null;
      const set = (v: number | null) => onChange(v === null ? null : ({ kind: q.kind, value: v } as Response));
      if (q.kind === "missing-number") {
        const missingTop = q.right.n === undefined;
        const blank = <NumberInput value={value} onValue={set} locked={locked} label={missingTop ? "Missing numerator" : "Missing denominator"} size="md" tone={missingTop ? "num" : "den"} />;
        return (
          <div className="flex items-center justify-center gap-5 py-4 sm:gap-8">
            <FractionNotation n={q.left.n} d={q.left.d} size="lg" />
            <span className="text-4xl text-muted" aria-hidden>
              =
            </span>
            <span className="inline-flex flex-col items-center gap-2">
              {missingTop ? blank : <span className="text-4xl font-semibold text-num-strong">{q.right.n}</span>}
              <span className="h-1 w-20 rounded-full bg-ink" aria-hidden />
              {missingTop ? <span className="text-4xl font-semibold text-den">{q.right.d}</span> : blank}
            </span>
          </div>
        );
      }
      const showCounters = q.kind === "fraction-of" && q.showCounters;
      const diagram = q.kind === "number" ? q.diagram : undefined;
      return (
        <div className="flex flex-col items-center gap-5">
          {showCounters && q.kind === "fraction-of" && (
            <Figure>
              <Counters amount={q.amount} groups={q.fraction.d} highlight={0} />
            </Figure>
          )}
          {diagram && (
            <Figure>
              <FractionShape diagram={diagram} size="md" />
            </Figure>
          )}
          <NumberInput value={value} onValue={set} locked={locked} label="Your answer" unit={q.kind === "fraction-of" || q.kind === "number" ? q.unit : undefined} />
        </div>
      );
    }

    case "explain-frame": {
      const slots = response?.kind === "explain-frame" ? response.slots : {};
      return (
        <div className="flex flex-col gap-5">
          {q.diagram && (
            <Figure>
              <FractionShape diagram={q.diagram} size="md" />
            </Figure>
          )}
          <div className="rounded-2xl border border-line bg-paper p-4 text-lg leading-[3.1rem] sm:p-5">
            {q.frame.map((part, pi) => {
              if (typeof part === "string") return <RichText key={pi} text={part} />;
              const gap = q.frame.slice(0, pi + 1).filter((p) => typeof p !== "string").length;
              const chosen = slots[part.slot];
              return (
                <fieldset key={pi} className="mx-1 inline-flex flex-wrap items-center gap-1.5 align-middle">
                  <legend className="sr-only">Gap {gap}</legend>
                  {order(part.options, part.slot).map((o) => {
                    const checked = chosen === o.id;
                    const isAnswer = o.id === part.answer;
                    const mark: Mark = reveal ? (isAnswer ? (checked ? "correct" : "missed") : checked ? "wrong" : null) : null;
                    return (
                      <label
                        key={o.id}
                        className={`relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl border-2 px-3 text-base font-medium leading-tight transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-den/25 ${
                          mark === "correct"
                            ? "border-ok bg-ok-soft"
                            : mark === "wrong"
                              ? "border-num bg-num-soft"
                              : mark === "missed"
                                ? "border-dashed border-ok bg-surface"
                                : checked
                                  ? "border-ink bg-ink text-white"
                                  : "border-line-strong bg-surface hover:bg-sunk"
                        }`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={`${name}-${part.slot}`}
                          value={`${part.slot}=${o.id}`}
                          checked={checked}
                          disabled={locked}
                          onChange={() => onChange({ kind: "explain-frame", slots: { ...slots, [part.slot]: o.id } })}
                          aria-label={`Gap ${gap}: ${o.label.replace(/[{}*]/g, "")}`}
                        />
                        <RichText text={o.label} />
                      </label>
                    );
                  })}
                </fieldset>
              );
            })}
          </div>
        </div>
      );
    }

    case "counterexample": {
      const current = response?.kind === "counterexample" ? response : { kind: "counterexample" as const, a: { n: 1, d: 2 }, b: { n: 1, d: 4 } };
      const set = (which: "a" | "b", patch: Partial<Fraction>) => {
        const next = { ...current[which], ...patch };
        next.n = Math.min(Math.max(1, next.n), next.d);
        onChange({ ...current, [which]: next });
      };
      const sym = compareSymbol(current.a, current.b);
      const builder = (which: "a" | "b", title: string) => {
        const fr = current[which];
        return (
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4">
            <p className="text-sm font-semibold">{title}</p>
            <div className="flex items-center gap-4">
              <FractionNotation n={fr.n} d={fr.d} size="lg" animate />
              <div className="flex flex-col gap-2">
                <Stepper label={`${title} numerator`} value={fr.n} min={1} max={fr.d} onChange={(n) => set(which, { n })} tone="num" disabled={locked} />
                <Stepper label={`${title} denominator`} value={fr.d} min={1} max={q.maxDenominator} onChange={(d) => set(which, { d })} tone="den" disabled={locked} />
              </div>
            </div>
          </div>
        );
      };
      return (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {builder("a", "First fraction")}
            {builder("b", "Second fraction")}
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-paper px-4 py-5">
            <StackedBars rows={[{ f: current.a }, { f: current.b }]} />
            <p className="text-sm text-ink-2" aria-live="polite">
              {toWords(current.a)} {sym === "<" ? "is less than" : sym === ">" ? "is greater than" : "is equal to"} {toWords(current.b)}
              {compare(current.a, current.b) === 0 && current.a.d !== current.b.d ? " — they are equivalent" : ""}
            </p>
          </div>
          {!response && !locked && <p className="text-sm text-muted">Change the fractions to build your counterexample.</p>}
        </div>
      );
    }
  }
}
