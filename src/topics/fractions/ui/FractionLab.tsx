"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useReducer, useState } from "react";
import { NumberLine } from "@/components/math/NumberLine";
import { FractionNotation } from "@/components/math/FractionNotation";
import { FractionShape } from "./FractionShape";
import { RichText } from "@/components/math/RichText";
import { StackedBars } from "./Visuals";
import { BulbIcon, CheckIcon } from "@/components/ui/Icons";
import { challengeFeedback, checkChallenge, LAB_LIMITS, type LabChallenge, type LabMode, type LabSnapshot } from "../lab";
import { EQUIVALENT_MAX_PARTS, INITIAL_LAB, labReducer, labSnapshot, LINE_MAX_INTERVALS, type ModelId } from "../labState";
import { compareSymbol, equivalent, simplify, toWords, type Fraction } from "../math";

export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  tone = "den",
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  tone?: "den" | "num" | "ink";
  disabled?: boolean;
}) {
  const color = { den: "text-den", num: "text-num-strong", ink: "text-ink" }[tone];
  const labelId = useId();
  return (
    <div className="flex items-center gap-3">
      <span className="text-[0.9375rem] font-medium text-ink-2" id={labelId}>
        {label}
      </span>
      <div className="flex items-center rounded-full border border-line-strong bg-surface" role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-l-xl text-xl font-medium hover:bg-sunk disabled:text-line-strong"
          onClick={() => onChange(value - 1)}
          disabled={disabled || value <= min}
          aria-label={`Fewer: ${label}`}
        >
          −
        </button>
        <output className={`w-10 text-center text-lg font-semibold tabular-nums ${color}`} aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-r-xl text-xl font-medium hover:bg-sunk disabled:text-line-strong"
          onClick={() => onChange(value + 1)}
          disabled={disabled || value >= max}
          aria-label={`More: ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const layoutId = useId();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-sunk p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`relative h-11 rounded-full px-4 text-[0.9375rem] font-medium transition-colors ${value === o.value ? "text-ink" : "text-muted hover:text-ink"}`}
        >
          {value === o.value && (
            <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-surface" transition={{ duration: 0.18, ease: "easeOut" }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Readout({ f, words = true }: { f: Fraction; words?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <FractionNotation n={f.n} d={f.d} size="xl" animate />
      {words && (
        <div className="text-[0.9375rem] leading-relaxed text-ink-2" aria-live="polite">
          <p>
            <strong className="text-num-strong">{f.n}</strong> out of <strong className="text-den">{f.d}</strong> equal part{f.d === 1 ? "" : "s"} shaded
          </p>
          <p className="text-muted">{f.d <= 12 ? toWords(f) : ""}</p>
        </div>
      )}
    </div>
  );
}

export function FractionLab({
  modes,
  challenges = [],
  completed = [],
  onChallengeComplete,
}: {
  modes: LabMode[];
  challenges?: LabChallenge[];
  completed?: string[];
  onChallengeComplete?: (id: string) => void;
}) {
  const [mode, setMode] = useState<LabMode>(modes[0]);
  // LAB-001: one state for the whole lab; everything shown below is derived from it.
  const [lab, dispatch] = useReducer(labReducer, INITIAL_LAB);
  const snapshot: LabSnapshot = useMemo(() => labSnapshot(lab), [lab]);
  const { build, shape, base: eqBase, split } = lab;
  const setParts = (model: ModelId, parts: number) => dispatch({ type: "set-parts", model, parts });
  const toggle = (model: ModelId, index: number) => dispatch({ type: "toggle", model, index });

  const visibleChallenges = challenges.filter((c) => c.mode === mode);

  return (
    <div className="space-y-5">
      {modes.length > 1 && (
        <Segmented
          label="Lab mode"
          value={mode}
          onChange={setMode}
          options={modes.map((m) => ({ value: m, label: { build: "Build", compare: "Compare", equivalent: "Equivalent", line: "Number line" }[m] }))}
        />
      )}

      <div className="rounded-[16px] border border-line bg-raised p-4 sm:p-6">
        {mode === "build" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Segmented
                label="Shape"
                value={shape}
                onChange={(v) => dispatch({ type: "set-shape", shape: v })}
                options={[
                  { value: "bar", label: "Bar" },
                  { value: "circle", label: "Circle" },
                ]}
              />
              <Stepper label="Equal parts" value={build.parts} min={LAB_LIMITS.minParts} max={LAB_LIMITS.maxParts} onChange={(p) => setParts("build", p)} />
            </div>
            <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
              <div className="flex w-full justify-center md:flex-1">
                <FractionShape
                  diagram={{ shape, parts: build.parts }}
                  shaded={[...build.shaded]}
                  onToggle={(i) => toggle("build", i)}
                  size="lg"
                />
              </div>
              <div className="flex flex-col items-center gap-3 md:w-64 md:items-start">
                <Readout f={snapshot.build} />
                <div className="flex gap-2">
                  <button type="button" className="h-11 rounded-full px-3 text-[0.9375rem] font-medium text-ink-2 hover:bg-sunk" onClick={() => dispatch({ type: "shade-all", model: "build" })}>
                    Shade all
                  </button>
                  <button type="button" className="h-11 rounded-full px-3 text-[0.9375rem] font-medium text-ink-2 hover:bg-sunk" onClick={() => dispatch({ type: "clear", model: "build" })}>
                    Clear
                  </button>
                </div>
                {snapshot.build.n > 0 && snapshot.build.n === snapshot.build.d && (
                  <p className="rounded-[16px] bg-ok-soft px-3 py-1.5 text-[0.9375rem] text-ok">All parts shaded = one whole!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === "compare" && (
          <div className="space-y-5">
            {([
              ["Top bar", "compareTop"],
              ["Bottom bar", "compareBottom"],
            ] as const).map(([label, model]) => {
              const s = lab[model];
              return (
              <div key={label} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                <div className="flex items-center justify-between gap-4 sm:w-56 sm:shrink-0 sm:flex-col sm:items-start">
                  <Stepper label={`${label} parts`} value={s.parts} min={1} max={LAB_LIMITS.maxParts} onChange={(p) => setParts(model, p)} />
                  <FractionNotation n={s.shaded.length} d={s.parts} size="md" animate />
                </div>
                <FractionShape diagram={{ shape: "bar", parts: s.parts }} shaded={[...s.shaded]} onToggle={(i) => toggle(model, i)} size="lg" label={`${label}: ${s.parts} equal parts, ${s.shaded.length} shaded`} />
              </div>
              );
            })}
            <CompareResult a={snapshot.compareTop} b={snapshot.compareBottom} />
          </div>
        )}

        {mode === "equivalent" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Stepper label="Parts" value={eqBase.d} min={1} max={EQUIVALENT_MAX_PARTS} onChange={(d) => dispatch({ type: "set-base", base: { d, n: eqBase.n } })} />
              <Stepper label="Shaded" value={eqBase.n} min={0} max={eqBase.d} onChange={(n) => dispatch({ type: "set-base", base: { ...eqBase, n } })} tone="num" />
              <Stepper label="Split each part into" value={split} min={1} max={LAB_LIMITS.maxSplit} onChange={(v) => dispatch({ type: "set-split", split: v })} tone="ink" />
            </div>
            <StackedBars rows={[{ f: eqBase }, { f: snapshot.equivalentResult }]} guide />
            <div className="flex flex-wrap items-center justify-center gap-4" aria-live="polite">
              <FractionNotation n={eqBase.n} d={eqBase.d} size="lg" animate />
              <div className="flex flex-col items-center text-[0.9375rem] font-semibold text-muted">
                <span>× {split}</span>
                <span className="text-3xl leading-none text-ink">=</span>
                <span>× {split}</span>
              </div>
              <FractionNotation n={snapshot.equivalentResult.n} d={snapshot.equivalentResult.d} size="lg" animate />
            </div>
            <p className="text-center text-[0.9375rem] text-ink-2">
              {split === 1
                ? "Split each part to see a new name for the same amount."
                : `Every part was split into ${split}, so there are ${split}× as many parts — and ${split}× as many shaded. The amount stays the same.`}
            </p>
          </div>
        )}

        {mode === "line" && (
          <div className="space-y-5">
            <Stepper label="Equal gaps from 0 to 1" value={lab.line.intervals} min={1} max={LINE_MAX_INTERVALS} onChange={(k) => dispatch({ type: "set-intervals", intervals: k })} />
            <div className="flex justify-center">
              <NumberLine intervals={lab.line.intervals} selected={lab.line.marker} onSelect={(i) => dispatch({ type: "move-marker", to: i })} fractionLabels size="lg" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4" aria-live="polite">
              <FractionNotation n={lab.line.marker} d={lab.line.intervals} size="lg" animate />
              <p className="text-[0.9375rem] text-ink-2">
                The marker is {lab.line.marker} of {lab.line.intervals} equal gaps from 0
                {lab.line.marker === lab.line.intervals ? ": that is 1 whole." : "."}
              </p>
            </div>
          </div>
        )}
      </div>

      {visibleChallenges.length > 0 && (
        <div>
          <h3 className="mb-2 text-lg font-semibold">Challenges</h3>
          <ul className="space-y-2">
            {visibleChallenges.map((c) => (
              <ChallengeItem
                key={c.id}
                challenge={c}
                done={completed.includes(c.id)}
                snapshot={snapshot}
                onComplete={() => onChallengeComplete?.(c.id)}
              />
            ))
            }
          </ul>
        </div>
      )}
    </div>
  );
}

function ChallengeItem({
  challenge: c,
  done,
  snapshot,
  onComplete,
}: {
  challenge: LabChallenge;
  done: boolean;
  snapshot: LabSnapshot;
  onComplete: () => void;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "not-yet" | "observe">("idle");
  const [message, setMessage] = useState("");
  const [observeWrong, setObserveWrong] = useState(false);

  const check = () => {
    if (checkChallenge(c.check, snapshot)) {
      if (c.observe) setStatus("observe");
      else onComplete();
    } else {
      setMessage(challengeFeedback(c.check, snapshot));
      setStatus("not-yet");
    }
  };

  return (
    <li className={`rounded-[16px] border px-3.5 py-3 transition-colors ${done ? "border-ok/40 bg-ok-soft" : "border-line bg-surface"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid size-7 shrink-0 place-items-center rounded-full ${done ? "bg-ok text-white" : "border-2 border-line-strong"}`}>
          <AnimatePresence>
            {done && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckIcon size={16} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="min-w-0 flex-1">
          <RichText text={c.text} />
          <span className="sr-only">{done ? " — completed" : ""}</span>
        </span>
        {!done && (
          <span className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHintOpen((o) => !o)}
              aria-expanded={hintOpen}
              className="inline-flex h-11 items-center gap-1 rounded-full px-2.5 text-[0.9375rem] text-muted hover:bg-sunk hover:text-ink"
            >
              <BulbIcon size={16} /> Hint
            </button>
            {status !== "observe" && (
              <button
                type="button"
                onClick={check}
                aria-label={`Check: ${c.text.replace(/[{}*]/g, "")}`}
                className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-[0.9375rem] font-medium text-white hover:bg-ink-2"
              >
                Check
              </button>
            )}
          </span>
        )}
      </div>
      <div aria-live="polite">
        {hintOpen && !done && <p className="mt-2 pl-10 text-[0.9375rem] text-ink-2">{c.hint}</p>}
        {status === "not-yet" && !done && <p className="mt-2 pl-10 text-[0.9375rem] text-warn">Not yet. {message}</p>}
        {done && <p className="mt-2 pl-10 text-[0.9375rem] text-ok"><RichText text={c.success} /></p>}
      </div>
      {status === "observe" && !done && c.observe && (
        <fieldset className="mt-3 space-y-2 pl-10">
          <legend className="mb-2 text-[0.9375rem] font-medium text-ink">
            Your construction is right. <RichText text={c.observe.prompt} />
          </legend>
          <div className="flex flex-wrap gap-2">
            {c.observe.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  if (o.id === c.observe!.answer) onComplete();
                  else setObserveWrong(true);
                }}
                className="min-h-11 rounded-[16px] border-2 border-line-strong bg-surface px-3 py-2 text-left text-[0.9375rem] font-medium hover:bg-sunk"
              >
                <RichText text={o.label} />
              </button>
            ))}
          </div>
          {observeWrong && <p className="text-[0.9375rem] text-warn">{c.observe.retry}</p>}
        </fieldset>
      )}
    </li>
  );
}

function CompareResult({ a, b }: { a: Fraction; b: Fraction }) {
  const sym = compareSymbol(a, b);
  const words = sym === "<" ? "is less than" : sym === ">" ? "is greater than" : "is equal to";
  const same = equivalent(a, b);
  return (
    <div className="flex flex-col items-center gap-2 rounded-[16px] bg-surface px-4 py-3 text-center sm:flex-row sm:justify-center sm:gap-4" aria-live="polite">
      <span className="flex items-center gap-3 text-lg">
        <FractionNotation n={a.n} d={a.d} size="sm" />
        <span className="grid size-9 place-items-center rounded-full bg-ink font-semibold text-white">{sym}</span>
        <FractionNotation n={b.n} d={b.d} size="sm" />
      </span>
      <span className="text-[0.9375rem] text-ink-2">
        {toWords(a)} {words} {toWords(b)}
        {same && a.n > 0 && !(a.n === b.n && a.d === b.d) && (
          <> — they&apos;re equivalent (both {toWords(simplify(a))})</>
        )}
      </span>
    </div>
  );
}
