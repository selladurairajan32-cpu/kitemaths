"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { SoundIcon } from "@/components/ui/Icons";
import { CheckpointCard } from "@/components/explain/story/CheckpointCard";
import { StoryControls } from "@/components/explain/story/StoryControls";
import { useStory } from "@/components/explain/story/useStory";
import { setSettings } from "@/engine/progress";
import type { Chapter, StoryState } from "@/engine/story";
import { updateLearner, useLearner } from "@/lib/store";
import { useReportWrong } from "./ExplainShell";

/**
 * D-041 *Step through*: an animated picture for each beat of the story, its caption, a recorded voice reading it, and
 * the story controls and chapter checkpoints (D-040). A Step view shows every beat of the chapter at once as numbered
 * stills. The voice only plays while the story plays, at the story's speed, and can be switched off.
 */

/** Where the recorded voice for each beat lives: `<base>/<beat id>.mp3`. */
export const voiceSrc = (base: string, beatId: string) => `${base}/${beatId}.mp3`;

/** Plays the current beat's recording while the story plays. */
function useBeatVoice<S>(chapters: Chapter<S>[], state: StoryState, base: string | undefined, on: boolean) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const beatId = chapters[state.chapter]?.beats[state.beat]?.id;
  useEffect(() => {
    if (!base || typeof Audio === "undefined") return;
    const a = (audio.current ??= new Audio());
    if (!on || !state.playing || !beatId) {
      if (a.dataset.beat) safely(() => a.pause());
      return;
    }
    const src = voiceSrc(base, beatId);
    if (a.dataset.beat !== beatId) {
      a.dataset.beat = beatId;
      a.src = src;
    }
    a.playbackRate = state.speed;
    safely(() => a.play());
  }, [base, beatId, on, state.playing, state.speed]);
  useEffect(() => () => { if (audio.current?.dataset.beat) safely(() => audio.current?.pause()); }, []);
}

/** Media calls can throw (no file yet, autoplay refused, or not available at all): the caption still says it. */
function safely(fn: () => unknown) {
  try {
    const p = fn();
    if (p instanceof Promise) p.catch(() => {});
  } catch {
    // Nothing to do: the caption carries the words.
  }
}

export interface StepThroughProps<S> {
  story: Chapter<S>[];
  /** Draws a beat's scene. `still` is true in the Step view, where nothing should move. */
  stage: (scene: S, caption: string, still: boolean) => ReactNode;
  /** The folder of recorded voices, one per beat; none means captions only. */
  voiceBase?: string;
  label: string;
}

export function StepThrough<S>({ story, stage, voiceBase, label }: StepThroughProps<S>) {
  const [state, dispatch] = useStory(story);
  const [view, setView] = useState<"animated" | "steps">("animated");
  const learner = useLearner();
  const voiceOn = learner.settings.explainVoice !== false;
  const reportWrong = useReportWrong();
  const seenWrong = useRef(0);
  useEffect(() => {
    if (state.wrong > seenWrong.current) reportWrong();
    seenWrong.current = state.wrong;
  }, [state.wrong, reportWrong]);
  useBeatVoice(story, state, voiceBase, voiceOn && view === "animated");

  const ch = story[state.chapter]!;
  const beat = ch.beats[state.beat]!;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title font-extrabold text-ink">
          Chapter {state.chapter + 1} of {story.length}: {ch.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {voiceBase && (
            <button
              type="button"
              aria-pressed={voiceOn}
              onClick={() => updateLearner((s) => setSettings(s, { explainVoice: !voiceOn }))}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-label font-bold text-ink hover:bg-sunk"
            >
              <SoundIcon size={18} muted={!voiceOn} />
              Voice {voiceOn ? "on" : "off"}
            </button>
          )}
          <div role="group" aria-label="View" className="flex rounded-full bg-sunk p-1">
            {(["animated", "steps"] as const).map((m) => (
              <button key={m} type="button" aria-pressed={view === m} onClick={() => setView(m)} className={`min-h-11 rounded-full px-4 text-label font-bold ${view === m ? "bg-surface text-brand-strong shadow-[var(--shadow-card)]" : "text-ink-2"}`}>
                {m === "animated" ? "Animated" : "Step view"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {view === "animated" ? (
        <>
          <div className="relative overflow-hidden rounded-[24px] bg-linear-to-b from-sky-soft to-brand-soft p-2 sm:p-4">{stage(beat.scene, beat.caption, false)}</div>
          <p aria-live="polite" className="min-h-14 rounded-[18px] bg-surface px-4 py-3 text-lg font-bold text-ink shadow-[var(--shadow-card)]">
            <RichText text={beat.caption} />
          </p>
          <StoryControls chapters={story} state={state} dispatch={dispatch} label={label} />
        </>
      ) : (
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {ch.beats.map((b, i) => (
            <li key={b.id} className="flex flex-col gap-2 rounded-[20px] border border-line bg-surface p-3">
              <span className="text-label font-bold text-brand-strong">Step {i + 1}</span>
              <div className="rounded-[14px] bg-linear-to-b from-sky-soft to-brand-soft p-2">{stage(b.scene, b.caption, true)}</div>
              <p className="text-body font-semibold text-ink"><RichText text={b.caption} /></p>
            </li>
          ))}
          <li className="sm:col-span-2">
            <Button onClick={() => { setView("animated"); for (let i = 0; i <= ch.beats.length; i++) dispatch({ type: "skip" }); }}>
              I&apos;ve read it: go to the quick check
            </Button>
          </li>
        </ol>
      )}
      <CheckpointCard chapters={story} state={state} dispatch={dispatch} />
    </div>
  );
}
