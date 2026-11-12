"use client";

import { useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { KipSays } from "@/components/kid/Kip";
import { Pic, type PicName } from "@/components/paper/Pic";
import { EXPLAIN_MODES, isExplainMode, type ExplainMode } from "@/engine/explainScript";
import { setSettings } from "@/engine/progress";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { WrongContext } from "./wrong";

/**
 * D-043 stage 1, Learn: the three ways to learn (D-041) side by side with the player, as in the concept images. On a
 * wide screen the player is on the left and "Choose how you want to learn" on the right; on a phone the choice comes
 * first, in one row. The choice is remembered (and can be linked with #watch, #step or #try). After two wrong answers
 * in one way, Kip offers the others. D-046: the three ways are big cards across the top with 3D pictures, the lesson
 * sits on glass below, and the concept's Key idea is beside it.
 */

export const MODE_INFO: Record<ExplainMode, { label: string; blurb: string; pic: PicName }> = {
  watch: { label: "Watch", blurb: "A short film with a voice", pic: "clapper" },
  step: { label: "Step through", blurb: "One step at a time", pic: "ladder" },
  try: { label: "Try it", blurb: "Build it with your hands", pic: "puzzle" },
};

export const ModeIcon = ({ mode, size = 30 }: { mode: ExplainMode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {mode === "watch" && (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" /></>)}
    {mode === "step" && (<><path d="M4 18h5v-4h5v-4h6" /><path d="M17 7l3 3-3 3" /></>)}
    {mode === "try" && (<><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" /><path d="M11 11.5V4.5a1.5 1.5 0 0 1 3 0v7" /><path d="M14 11.5v-5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4 14.4a1.5 1.5 0 0 1 2.4-1.8L8 14" /></>)}
  </svg>
);

const readHash = (): ExplainMode | null => {
  const h = window.location.hash.slice(1);
  return isExplainMode(h) ? h : null;
};
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export interface LearnStageProps {
  /** The content of each way to learn this concept has. */
  modes: Partial<Record<ExplainMode, ReactNode>>;
  /** Rough time for each way, shown on its card. */
  minutes?: Partial<Record<ExplainMode, string>>;
  /** D-046: the concept's Key idea, beside the lesson. */
  keyIdea?: ReactNode;
}

export function LearnStage({ modes, minutes = {}, keyIdea }: LearnStageProps) {
  const available = EXPLAIN_MODES.filter((m) => modes[m] !== undefined);
  const hydrated = useHydrated();
  const learner = useLearner();
  const fromHash = useSyncExternalStore(subscribeHash, readHash, () => null);
  const [chosen, setChosen] = useState<ExplainMode | null>(null);
  const [wrong, setWrong] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const saved = hydrated && isExplainMode(learner.settings.explainMode) ? learner.settings.explainMode : null;
  const pickable = (m: ExplainMode | null) => (m && available.includes(m) ? m : null);
  const mode = pickable(chosen) ?? pickable(fromHash) ?? pickable(saved) ?? available[0]!;

  const choose = (m: ExplainMode) => {
    setChosen(m);
    setWrong(0);
    setDismissed(false);
    updateLearner((s) => setSettings(s, { explainMode: m }));
    history.replaceState(null, "", `#${m}`);
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: available.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const m = available[(next + available.length) % available.length]!;
    choose(m);
    document.getElementById(`mode-${m}`)?.focus();
  };
  const others = available.filter((m) => m !== mode);

  return (
    <WrongContext.Provider value={() => setWrong((n) => n + 1)}>
      <div className="flex flex-col gap-4">
        <h2 id="mode-question" className="sr-only">Choose how you want to learn</h2>
        <div role="tablist" aria-labelledby="mode-question" aria-orientation="horizontal" className="grid grid-cols-3 gap-2 sm:gap-4">
          {available.map((m, i) => {
            const on = mode === m;
            return (
              <button
                key={m}
                id={`mode-${m}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls="mode-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => choose(m)}
                onKeyDown={(e) => onKey(e, i)}
                className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-[24px] p-2 text-center transition sm:flex-row sm:justify-start sm:gap-4 sm:p-4 sm:text-left ${on ? "glass-selected text-on-brand" : "glass text-ink hover:-translate-y-0.5"}`}
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-full sm:size-16 ${on ? "bg-surface" : "bg-brand-soft"}`}>
                  <Pic name={MODE_INFO[m].pic} size={40} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-extrabold sm:text-title">{MODE_INFO[m].label}</span>
                  <span className={`hidden text-label font-semibold sm:block ${on ? "text-on-brand" : "text-ink-2"}`}>{MODE_INFO[m].blurb}</span>
                  {minutes[m] && <span className={`hidden text-label font-bold sm:block ${on ? "text-on-brand" : "text-brand-strong"}`}>{minutes[m]}</span>}
                </span>
                {on && <span className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 bg-brand-strong" aria-hidden />}
              </button>
            );
          })}
        </div>
        {wrong >= 2 && !dismissed && others.length > 0 && (
          <KipSays mood="think" tone="sun" size={52}>
            <div className="flex flex-col gap-2">
              <p className="text-body font-bold">That one is tricky. Want to see it another way?</p>
              <div className="flex flex-wrap gap-2">
                {others.map((m) => (
                  <button key={m} type="button" onClick={() => choose(m)} className="min-h-11 rounded-full bg-surface px-4 text-label font-bold text-brand-strong shadow-[var(--shadow-card)] hover:bg-brand-soft">
                    {MODE_INFO[m].label}
                  </button>
                ))}
                <button type="button" onClick={() => setDismissed(true)} className="min-h-11 rounded-full px-4 text-label font-bold text-ink-2 underline underline-offset-4">
                  No thanks
                </button>
              </div>
            </div>
          </KipSays>
        )}
        <div className={`grid gap-4 ${keyIdea ? "xl:grid-cols-[minmax(0,1fr)_17rem]" : ""}`}>
          <div role="tabpanel" id="mode-panel" aria-labelledby={`mode-${mode}`} className="glass min-w-0 rounded-[28px] p-3 sm:p-5">
            {modes[mode]}
          </div>
          {keyIdea}
        </div>
      </div>
    </WrongContext.Provider>
  );
}
