"use client";

import { useReducer, useRef, useState, type ComponentType, type KeyboardEvent } from "react";
import { KipSays } from "@/components/kid/Kip";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, RefreshIcon } from "@/components/ui/Icons";
import { playSound } from "@/lib/sound";
import { initStepper, stepper } from "./stepper";

/** What a scene is told: which step to draw, whether the child's move on this step is done, and how to report it. */
export interface SceneProps {
  step: number;
  /** The child's move on this step has been made (always true outside the main stage, e.g. a replay). */
  done: boolean;
  onTaskDone: () => void;
}

export interface StageStep {
  /** What Kip says: about 12 words at most. */
  say: string;
  /** The step waits for the child's move before Next unlocks. */
  task?: boolean;
  /** What Kip says once the child's move is done (praise and what it showed). */
  doneSay?: string;
}

/** One way of seeing the idea, told as a chapter of steps: concrete, then picture, then numbers (ANIM-001 §1). */
export interface Chapter {
  id: string;
  label: string;
  steps: StageStep[];
  Scene: ComponentType<SceneProps>;
}

const flatten = (chapters: Chapter[]) => chapters.flatMap((c, ci) => c.steps.map((s, si) => ({ ci, si, ...s })));

/**
 * The stage for an animated explanation (ANIM-001 §2): one picture, one thing Kip says, and one big Next button.
 * A chapter strip shows where the child is and lets them see it another way. Steps with a task wait for the child.
 */
export function Stage({ chapters, onComplete, completed = false }: { chapters: Chapter[]; onComplete: () => void; completed?: boolean }) {
  const steps = flatten(chapters);
  const [nav, dispatch] = useReducer(stepper, steps.length, initStepper);
  const [play, setPlay] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [doneTasks, setDoneTasks] = useState<Set<number>>(() => new Set());
  const [finished, setFinished] = useState(completed);
  const at = steps[nav.step]!;
  const chapter = chapters[at.ci]!;
  const Scene = chapter.Scene;
  const taskDone = !at.task || doneTasks.has(nav.step);
  const last = nav.step === steps.length - 1;
  const say = at.task && taskDone && at.doneSay ? at.doneSay : at.say;

  const go = (step: number) => {
    dispatch({ type: "goto", step });
    setPlay((p) => p + 1);
  };
  const next = () => {
    if (!taskDone) return;
    if (last) {
      setFinished(true);
      playSound("complete");
      onComplete();
    } else go(nav.step + 1);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.tagName === "INPUT" || t.getAttribute("role") === "slider") return;
    if (e.key === "ArrowRight" && taskDone && !last) {
      e.preventDefault();
      go(nav.step + 1);
    } else if (e.key === "ArrowLeft" && nav.step > 0) {
      e.preventDefault();
      go(nav.step - 1);
    }
  };

  return (
    <div className="space-y-4" onKeyDown={onKeyDown}>
      <ol className="grid grid-cols-3 gap-2" aria-label="Three ways to see it">
        {chapters.map((c, ci) => {
          const first = steps.findIndex((s) => s.ci === ci);
          const here = ci === at.ci;
          const seen = ci < at.ci || finished;
          const share = here ? (at.si + 1) / c.steps.length : seen ? 1 : 0;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => go(first)}
                aria-current={here ? "step" : undefined}
                className={`flex min-h-12 w-full items-center gap-2 rounded-[16px] border-2 px-2.5 py-1.5 text-left transition-colors ${here ? "border-brand bg-brand-soft text-ink" : "border-line-strong bg-surface text-ink-2 hover:bg-raised"}`}
              >
                <span className={`hidden size-7 shrink-0 place-items-center rounded-full sm:grid text-label font-extrabold ${here ? "bg-brand text-on-brand" : seen ? "bg-ok text-white" : "bg-sunk text-ink-2"}`}>{seen && !here ? <CheckIcon size={15} /> : ci + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-extrabold leading-tight">{c.label}</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-sunk" aria-hidden>
                    <span className="block h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${share * 100}%` }} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="relative grid min-h-[17rem] place-items-center overflow-hidden rounded-[24px] border-2 border-line-strong bg-surface px-2 py-4 sm:min-h-[22rem] sm:px-6">
        <Scene key={`${at.ci}-${at.si}-${play}`} step={at.si} done={taskDone} onTaskDone={() => {
          if (doneTasks.has(nav.step)) return;
          playSound("correct");
          setDoneTasks((d) => new Set(d).add(nav.step));
          // The thing the child used may disappear (the 0 tile); keep keyboard focus on the way forward.
          window.requestAnimationFrame(() => nextRef.current?.focus());
        }} />
      </div>

      <KipSays mood={at.task && !taskDone ? "think" : at.task ? "cheer" : "happy"} speak={say} size={52} tone={at.task && !taskDone ? "sun" : "white"}>
        <span className="text-lg font-bold leading-snug text-ink">
          <RichText text={say} />
        </span>
      </KipSays>
      <p className="sr-only" aria-live="polite">
        {chapter.label}, step {at.si + 1} of {chapter.steps.length}.
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
        <Button variant="quiet" onClick={() => go(nav.step - 1)} disabled={nav.step === 0} aria-label="Back a step">
          <ArrowLeftIcon size={18} /> <span className="hidden sm:inline">Back</span>
        </Button>
        <Button variant="secondary" onClick={() => setPlay((p) => p + 1)}>
          <RefreshIcon size={18} /> Watch again
        </Button>
        <Button ref={nextRef} size="lg" onClick={next} disabled={!taskDone} className="order-first w-full whitespace-nowrap sm:order-none sm:w-auto sm:min-w-0 sm:flex-1">
          {!taskDone ? "Your turn first" : last ? (finished ? "Watched it all" : "I've got it!") : "Next"} {taskDone && !last && <ArrowRightIcon size={20} />}
        </Button>
      </div>
    </div>
  );
}

/** One step of a chapter on its own, with its move already made: "Show me again" after a slip (ANIM-001 §1). */
export function Replay({ chapter, step }: { chapter: Chapter; step: number }) {
  const [play, setPlay] = useState(0);
  const Scene = chapter.Scene;
  const say = chapter.steps[step]!.doneSay ?? chapter.steps[step]!.say;
  return (
    <div className="space-y-3 rounded-[22px] border-2 border-line-strong bg-raised p-3 sm:p-4">
      <div className="grid min-h-[15rem] place-items-center overflow-hidden rounded-[18px] bg-surface px-2 py-3">
        <Scene key={play} step={step} done onTaskDone={() => {}} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-ink">
          <RichText text={say} />
        </p>
        <Button variant="secondary" onClick={() => setPlay((p) => p + 1)}>
          <RefreshIcon size={18} /> Watch again
        </Button>
      </div>
    </div>
  );
}
