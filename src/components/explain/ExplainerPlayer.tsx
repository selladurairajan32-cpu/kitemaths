"use client";

import { useEffect, useReducer, type KeyboardEvent, type ReactNode } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon, RefreshIcon } from "@/components/ui/Icons";
import { STEP_MS } from "./motionTokens";
import { initStepper, isLast, stepper, type StepperAction, type StepperState } from "./stepper";

/** Step state plus Play's timer. Play moves on one step every STEP_MS and stops on the last step. */
export function useStepper(count: number) {
  const [state, dispatch] = useReducer(stepper, count, initStepper);
  useEffect(() => {
    if (state.count !== count) dispatch({ type: "reset", count });
  }, [count, state.count]);
  useEffect(() => {
    if (!state.playing) return;
    const t = window.setTimeout(() => dispatch({ type: "tick" }), STEP_MS);
    return () => window.clearTimeout(t);
  }, [state.playing, state.step]);
  return [state, dispatch] as const;
}

/**
 * Watch & Learn controls (ANIM-001 §2): the scene, a caption for each step, and Back, Play or Pause, Next step and
 * Watch again. Arrow keys move between steps. The caption is announced, so the explanation works without the picture.
 */
export function ExplainerPlayer({
  state,
  dispatch,
  captions,
  label,
  children,
}: {
  state: StepperState;
  dispatch: (a: StepperAction) => void;
  captions: string[];
  label: string;
  children: ReactNode;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      dispatch({ type: "next" });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      dispatch({ type: "back" });
    } else if (e.key === " " && e.target === e.currentTarget) {
      e.preventDefault();
      dispatch({ type: state.playing ? "pause" : "play" });
    }
  };
  const last = isLast(state);

  return (
    <div role="group" aria-label={label} tabIndex={-1} onKeyDown={onKeyDown} className="space-y-4 outline-none">
      <div className="overflow-hidden rounded-[22px] border border-line-strong bg-raised px-2 py-4 sm:px-5 sm:py-6">{children}</div>

      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-full bg-ink px-3 py-1 text-label font-bold text-white" aria-hidden>
          {state.step + 1}/{state.count}
        </span>
        <p aria-live="polite" className="min-h-[3.5rem] text-lg font-semibold leading-relaxed text-ink">
          <span className="sr-only">
            Step {state.step + 1} of {state.count}.{" "}
          </span>
          <RichText text={captions[state.step] ?? ""} />
        </p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-label="Steps">
        {captions.map((c, i) => (
          <button
            key={c}
            type="button"
            onClick={() => dispatch({ type: "goto", step: i })}
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === state.step ? "step" : undefined}
            className="grid size-11 place-items-center rounded-full"
          >
            <span className={`block rounded-full transition-all ${i === state.step ? "h-3 w-8 bg-brand" : i < state.step ? "size-3 bg-ink-2" : "size-3 bg-line-strong"}`} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Button variant="secondary" onClick={() => dispatch({ type: "back" })} disabled={state.step === 0}>
          <ArrowLeftIcon size={18} /> Back
        </Button>
        {state.playing ? (
          <Button variant="secondary" onClick={() => dispatch({ type: "pause" })}>
            <PauseIcon size={18} /> Pause
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => dispatch({ type: last ? "replay" : "play" })}>
            {last ? <RefreshIcon size={18} /> : <PlayIcon size={18} />} {last ? "Watch again" : "Play"}
          </Button>
        )}
        <Button onClick={() => dispatch({ type: "next" })} disabled={last}>
          Next step <ArrowRightIcon size={18} />
        </Button>
      </div>
    </div>
  );
}
