"use client";

import { useState } from "react";
import { Figure, MarkIcon, RadioOption, type Mark } from "@/components/questions/inputs";
import { RichText } from "@/components/math/RichText";
import { seededShuffle } from "@/engine/random";
import type { QuestionInputProps } from "@/topics/types";
import { MathVisual } from "./visuals";
import type { KitQuestion, KitResponse } from "./types";

/** A number box for the kit: up to 8 digits, an optional minus sign, a unit beside it. */
function KitNumberBox({
  value,
  onValue,
  locked,
  label,
  unit,
  negative,
  mark,
}: {
  value: number | null;
  onValue: (v: number | null) => void;
  locked: boolean;
  label: string;
  unit?: string;
  negative?: boolean;
  mark: Mark;
}) {
  // The box keeps what was typed (so a lone minus sign stays while the digits come).
  const [text, setText] = useState(value === null ? "" : String(value).replace("-", "−"));
  const ring = mark === "correct" ? "border-ok-bright bg-ok-soft" : mark === "wrong" ? "border-num bg-num-soft" : "border-line-strong bg-surface focus:border-brand";
  return (
    <span className="relative inline-flex items-center gap-2 text-2xl font-bold text-ink-2">
      {unit === "£" && <span aria-hidden>£</span>}
      <input
        type="text"
        inputMode={negative ? "text" : "numeric"}
        autoComplete="off"
        aria-label={label}
        disabled={locked}
        value={text}
        onChange={(e) => {
          const raw = e.target.value.replace(/[−–]/g, "-");
          const minus = !!negative && raw.trim().startsWith("-");
          const digits = raw.replace(/[^0-9]/g, "").slice(0, 8);
          setText(`${minus ? "−" : ""}${digits}`);
          onValue(digits === "" ? null : (minus ? -1 : 1) * Number(digits));
        }}
        className={`h-16 w-40 rounded-[18px] border-2 text-center text-[2rem] font-extrabold tabular-nums text-ink outline-none transition-colors disabled:opacity-100 ${ring}`}
      />
      {unit && unit !== "£" && <span>{unit}</span>}
      <MarkIcon mark={mark} />
    </span>
  );
}

export function KitQuestionInput({ question, response, onChange, locked, reveal, orderKey }: QuestionInputProps<KitQuestion, KitResponse>) {
  const q = question;
  const visual = q.visual ? (
    <Figure>
      <MathVisual spec={q.visual} />
    </Figure>
  ) : null;

  if (q.kind === "choose") {
    const indexes = q.options.map((_, i) => i);
    const order = q.fixedOrder || !orderKey ? indexes : seededShuffle(indexes, `${orderKey}:${q.id}:choose`);
    const chosen = response?.kind === "choose" ? response.choice : -1;
    const short = q.options.every((o) => o.text.replace(/[{}*]/g, "").length <= 12);
    return (
      <div className="space-y-5">
        {visual}
        <fieldset className={short ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "grid gap-3"}>
          <legend className="sr-only">Choose one answer</legend>
          {order.map((i) => {
            const o = q.options[i];
            const checked = chosen === i;
            const mark: Mark = locked && checked ? (i === q.answer ? "correct" : "wrong") : reveal && i === q.answer ? "missed" : null;
            return (
              <RadioOption
                key={i}
                name={q.id}
                value={String(i)}
                checked={checked}
                onSelect={() => onChange({ kind: "choose", choice: i })}
                locked={locked}
                mark={mark}
                label={o.text.replace(/[{}*]/g, "")}
                className={short ? "min-h-16 text-[1.5rem] font-extrabold" : "min-h-14 justify-start text-left text-lg font-semibold"}
              >
                {!short && (
                  <span aria-hidden className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-ink" : "border-line-strong"}`}>
                    {checked && <span className="size-2.5 rounded-full bg-ink" />}
                  </span>
                )}
                <RichText text={o.text} className="leading-snug" />
              </RadioOption>
            );
          })}
        </fieldset>
      </div>
    );
  }

  const value = response?.kind === "number" ? response.value : null;
  const mark: Mark = locked && value !== null ? (value === q.answer ? "correct" : "wrong") : null;
  return (
    <div className="space-y-5">
      {visual}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <KitNumberBox
          key={q.id}
          value={value}
          onValue={(v) => onChange({ kind: "number", value: v })}
          locked={locked}
          label="Your answer"
          unit={q.unit}
          negative={q.negative}
          mark={mark}
        />
      </div>
      {reveal && (
        <p className="text-center text-lg font-semibold text-ok">
          The answer is <RichText text={`**${q.unit === "£" ? "£" : ""}${q.answer.toLocaleString("en-GB")}${q.unit && q.unit !== "£" ? ` ${q.unit}` : ""}**`} />
        </p>
      )}
    </div>
  );
}
