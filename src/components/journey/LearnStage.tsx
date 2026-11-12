"use client";

import { useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { KipSays } from "@/components/kid/Kip";
import { EXPLAIN_MODES, isExplainMode, type ExplainMode } from "@/engine/explainScript";
import { setSettings } from "@/engine/progress";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { WrongContext } from "./wrong";

/**
 * D-043 stage 1, Learn: the three ways to learn (D-041) side by side with the player, as in the concept images. On a
 * wide screen the player is on the left and "Choose how you want to learn" on the right; on a phone the choice comes
 * first, in one row. The choice is remembered (and can be linked with #watch, #step or #try). After two wrong answers
 * in one way, Kip offers the others.
 */

export const MODE_INFO: Record<ExplainMode, { label: string; blurb: string }> = {
  watch: { label: "Watch", blurb: "A short film with a voice" },
  step: { label: "Step through", blurb: "One step at a time" },
  try: { label: "Try it", blurb: "Build it with your hands" },
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
}

export function LearnStage({ modes, minutes = {} }: LearnStageProps) {
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        <aside className="flex flex-col gap-3 lg:order-last" aria-label="Ways to learn">
          <h2 id="mode-question" className="text-title font-extrabold text-ink">Choose how you want to learn</h2>
          <div role="tablist" aria-labelledby="mode-question" aria-orientation="vertical" className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
            {available.map((m, i) => (
              <button
                key={m}
                id={`mode-${m}`}
                role="tab"
                type="button"
                aria-selected={mode === m}
                aria-controls="mode-panel"
                tabIndex={mode === m ? 0 : -1}
                onClick={() => choose(m)}
                onKeyDown={(e) => onKey(e, i)}
                className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-[22px] border-2 p-2 text-center transition lg:flex-row lg:justify-start lg:gap-3 lg:p-4 lg:text-left ${mode === m ? "border-brand bg-brand-soft text-ink shadow-[var(--shadow-lift)]" : "border-line bg-surface text-ink hover:border-brand"}`}
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-[16px] ${mode === m ? "bg-brand text-on-brand" : "bg-sunk text-brand-strong"}`}>
                  <ModeIcon mode={m} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-extrabold">{MODE_INFO[m].label}</span>
                  <span className="hidden text-label font-semibold text-ink-2 lg:block">{MODE_INFO[m].blurb}</span>
                  {minutes[m] && <span className="hidden text-label font-bold text-brand-strong lg:block">{minutes[m]}</span>}
                </span>
              </button>
            ))}
          </div>
          {wrong >= 2 && !dismissed && others.length > 0 ? (
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
          ) : (
            <KipSays mood="happy" tone="sky" size={52} className="hidden lg:flex">
              <p className="text-body font-semibold">Pick the way you like best. You can switch at any time.</p>
            </KipSays>
          )}
        </aside>
        <div role="tabpanel" id="mode-panel" aria-labelledby={`mode-${mode}`} className="min-w-0 rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
          {modes[mode]}
        </div>
      </div>
    </WrongContext.Provider>
  );
}
