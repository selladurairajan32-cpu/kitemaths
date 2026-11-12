"use client";

import type { Dispatch } from "react";
import { positionAt, timeline, unlockedChapter, type Chapter, type StoryEvent, type StoryState } from "@/engine/story";
import { LockIcon } from "@/components/ui/Icons";

/**
 * Playback controls for a story (D-040): play or pause, restart the chapter, skip a beat, a scrubber with chapter
 * markers, chapter buttons (locked until the checkpoint before them is passed) and a speed choice. All are buttons or a
 * native range input, so they work by keyboard and with screen readers.
 */
export function StoryControls<S>({ chapters, state, dispatch, label }: { chapters: Chapter<S>[]; state: StoryState; dispatch: Dispatch<StoryEvent>; label: string }) {
  const { at, total, chapterStarts } = timeline(chapters, state);
  const unlocked = unlockedChapter(chapters, state);
  const ch = chapters[state.chapter]!;
  const canPlay = !state.atEnd || state.passed.includes(state.chapter);
  const seconds = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
  const btn = "grid size-12 place-items-center rounded-full border border-line bg-surface text-ink hover:bg-sunk disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={`${label} controls`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => dispatch({ type: state.playing ? "pause" : "play" })}
          disabled={!state.playing && !canPlay}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-on-brand shadow-[var(--shadow-card)] hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-line-strong"
          aria-label={state.playing ? "Pause" : "Play"}
        >
          {state.playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          )}
        </button>
        <button type="button" onClick={() => dispatch({ type: "restart" })} className={btn} aria-label="Replay this chapter">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 1 0 2.3-5.7" /><path d="M4 4v4h4" /></svg>
        </button>
        <button type="button" onClick={() => dispatch({ type: "skip" })} disabled={state.atEnd} className={btn} aria-label="Skip to the next part">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M6 5v14l9-7z" fill="currentColor" /><rect x="16" y="5" width="3" height="14" rx="1" fill="currentColor" /></svg>
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={total}
            step={100}
            value={at}
            onChange={(e) => {
              const pos = positionAt(chapters, state, Number(e.target.value));
              if (pos) dispatch({ type: "seek", ...pos });
            }}
            className="h-11 w-full cursor-pointer accent-[var(--color-brand)]"
            aria-label="Position in the explanation"
            aria-valuetext={`${ch.title}, part ${state.beat + 1} of ${ch.beats.length}`}
          />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0" aria-hidden>
            {chapterStarts.slice(1).map((s) => (
              <span key={s} className="absolute -top-2 h-4 w-0.5 rounded bg-ink-2" style={{ left: `${(s / total) * 100}%` }} />
            ))}
          </div>
        </div>
        <span className="hidden shrink-0 text-label font-bold tabular-nums text-ink-2 sm:block">
          {seconds(at)} / {seconds(total)}
        </span>
        <button type="button" onClick={() => dispatch({ type: "speed", speed: state.speed === 1 ? 0.75 : 1 })} className="min-h-12 shrink-0 rounded-full border border-line bg-surface px-3 text-label font-bold text-ink hover:bg-sunk" aria-label={`Speed ${state.speed === 1 ? "normal" : "slower"}. Change speed`}>
          {state.speed === 1 ? "1×" : "0.75×"}
        </button>
      </div>
      <nav aria-label="Chapters" className="flex flex-wrap gap-2">
        {chapters.map((c, i) => {
          const locked = i > unlocked;
          const done = state.passed.includes(i);
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => dispatch({ type: "seek", chapter: i, beat: 0 })}
              aria-current={i === state.chapter ? "step" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label font-bold ${i === state.chapter ? "bg-brand text-on-brand" : done ? "bg-ok-soft text-ok" : "bg-sunk text-ink-2"} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {locked && <LockIcon size={14} />}
              {i + 1}. {c.title}
              {locked && <span className="sr-only"> (answer the question before it first)</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
