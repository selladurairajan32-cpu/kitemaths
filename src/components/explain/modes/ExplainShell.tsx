"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { KipSays } from "@/components/kid/Kip";
import { EXPLAIN_MODES, isExplainMode, type ExplainMode } from "@/engine/explainScript";
import { setSettings } from "@/engine/progress";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";

/**
 * D-041: one explanation page, three ways in, and the child chooses. *Watch* a narrated film, *Step through* an
 * animated picture with a voice, or *Try it* with their hands. The choice is remembered for next time (and can be
 * linked to with #watch, #step or #try). Every mode ends with the same quick check below, so the learning counts the
 * same whichever way they choose. After two wrong answers in one mode, Kip offers another way in.
 */

export const MODE_INFO: Record<ExplainMode, { label: string; blurb: string }> = {
  watch: { label: "Watch", blurb: "A short film with a voice" },
  step: { label: "Step through", blurb: "One step at a time" },
  try: { label: "Try it", blurb: "Do it with your hands" },
};

const ModeIcon = ({ mode }: { mode: ExplainMode }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {mode === "watch" && (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" /></>)}
    {mode === "step" && (<><path d="M4 18h5v-4h5v-4h6" /><path d="M17 7l3 3-3 3" /></>)}
    {mode === "try" && (<><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12" /><path d="M11 11.5V4.5a1.5 1.5 0 0 1 3 0v7" /><path d="M14 11.5v-5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.5a5.5 5.5 0 0 1-4.6-2.5L4 14.4a1.5 1.5 0 0 1 2.4-1.8L8 14" /></>)}
  </svg>
);

/** Lets anything on the page (checkpoints, the final check) tell the shell about a wrong answer. */
const WrongContext = createContext<() => void>(() => {});
export const useReportWrong = () => useContext(WrongContext);

const readHash = (): ExplainMode | null => {
  const h = window.location.hash.slice(1);
  return isExplainMode(h) ? h : null;
};
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

export interface ExplainShellProps {
  title: string;
  /** The small picture beside the title, such as "a : b". */
  tile: ReactNode;
  back: { href: string; label: string };
  /** The content of each mode this concept has, in the order watch, step, try. */
  modes: Partial<Record<ExplainMode, ReactNode>>;
  /** Help beside the mode panel on wide screens, under it on narrow ones. */
  rail?: ReactNode;
  /** The shared ending: key notes, takeaway and the final check. */
  children?: ReactNode;
}

export function ExplainShell({ title, tile, back, modes, rail, children }: ExplainShellProps) {
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
  const reportWrong = useCallback(() => setWrong((n) => n + 1), []);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? available.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = available[(n + available.length) % available.length]!;
    choose(next);
    document.getElementById(`mode-${next}`)?.focus();
  };
  const others = available.filter((m) => m !== mode);

  return (
    <WrongContext.Provider value={reportWrong}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex items-center gap-4 rounded-[28px] bg-linear-to-r from-brand-soft to-sky-soft p-4 sm:p-6">
          <Link href={back.href} className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-ink shadow-[var(--shadow-card)] hover:bg-sunk" aria-label={back.label}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
          </Link>
          <span className="hidden size-16 shrink-0 place-items-center rounded-[20px] bg-surface text-title font-extrabold text-brand-strong shadow-[var(--shadow-card)] sm:grid" aria-hidden>
            {tile}
          </span>
          <div className="min-w-0">
            <p className="text-label font-bold text-ink-2">Topic explanation</p>
            <h1 className="display text-heading-2 sm:text-heading-1">{title}</h1>
          </div>
        </header>

        <div className="flex flex-col gap-2">
          <p id="mode-question" className="text-body font-bold text-ink-2">How would you like to learn it?</p>
          <div role="tablist" aria-labelledby="mode-question" className="grid grid-cols-3 gap-2 sm:gap-3">
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
                className={`flex min-h-24 flex-col items-center justify-center gap-1 rounded-[22px] border-2 p-2 text-center transition sm:flex-row sm:justify-start sm:gap-3 sm:p-4 sm:text-left ${mode === m ? "border-brand bg-brand text-on-brand shadow-[var(--shadow-lift)]" : "border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft"}`}
              >
                <span className={`grid size-12 shrink-0 place-items-center rounded-full ${mode === m ? "bg-surface/20" : "bg-brand-soft text-brand-strong"}`}>
                  <ModeIcon mode={m} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-extrabold">{MODE_INFO[m].label}</span>
                  <span className={`hidden text-label font-semibold sm:block ${mode === m ? "text-on-brand" : "text-ink-2"}`}>{MODE_INFO[m].blurb}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {wrong >= 2 && !dismissed && others.length > 0 && (
          <KipSays mood="think" tone="sun">
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

        <div className={rail ? "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : ""}>
          <div role="tabpanel" id="mode-panel" aria-labelledby={`mode-${mode}`} className="min-w-0 rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
            {modes[mode]}
          </div>
          {rail}
        </div>

        {children}
      </div>
    </WrongContext.Provider>
  );
}
