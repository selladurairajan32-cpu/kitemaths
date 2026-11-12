"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { timedCues, type FilmScript } from "@/engine/explainScript";

/**
 * D-041 *Watch*: the concept's narrated film. Captions are on by default and built from the same script the film was
 * voiced from; the transcript below follows the film and jumps to a line when pressed; chapter buttons jump to a part.
 * Nothing plays until the child presses play. D-046: chapters beside the video with their times (the one playing is
 * marked), and Captions and Transcript buttons above it.
 */

/** Where the films live: `public/films` now, a storage bucket later (FILMS_BASE_URL). */
export const FILMS_BASE = process.env.NEXT_PUBLIC_FILMS_BASE_URL ?? "/films";
export const filmSrc = (concept: string) => `${FILMS_BASE}/${concept}/film.mp4`;
export const posterSrc = (concept: string) => `${FILMS_BASE}/${concept}/poster.jpg`;

/** A caption as plain text for the player: {1/3} → 1/3, no bold marks. */
export const plainCaption = (text: string) => text.replace(/\{(\d+)\/(\d+)\}/g, "$1/$2").replace(/\*\*/g, "");

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function FilmPlayer({ concept, film, title }: { concept: string; film: FilmScript; title: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const cues = useMemo(() => timedCues(film), [film]);
  const [now, setNow] = useState(0);
  const [captions, setCaptions] = useState(true);
  const track = useRef<TextTrack | null>(null);

  useEffect(() => {
    const v = video.current;
    if (!v || typeof v.addTextTrack !== "function" || typeof VTTCue === "undefined") return;
    const t = v.addTextTrack("captions", "English", "en");
    for (const c of cues) t.addCue(new VTTCue(c.start, c.end, plainCaption(c.text)));
    t.mode = "showing";
    track.current = t;
    return () => {
      t.mode = "disabled";
      track.current = null;
    };
  }, [cues]);
  const toggleCaptions = () => {
    const on = !captions;
    setCaptions(on);
    if (track.current) track.current.mode = on ? "showing" : "hidden";
  };

  const jump = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t + 0.05;
    setNow(t + 0.05);
    void v.play()?.catch?.(() => {});
  };
  const current = cues.find((c) => now >= c.start && now < c.end)?.id;
  const length = cues.at(-1)?.end ?? 0;

  const chapters = film.chapters.map((ch) => ({ ...ch, at: cues.find((c) => c.id === ch.cue)!.start }));
  const playing = [...chapters].reverse().find((ch) => now >= ch.at)?.cue;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">Watch: {title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label font-bold text-ink-2">{clock(length)} · turn the sound on</span>
          <button type="button" aria-pressed={captions} onClick={toggleCaptions} className={`min-h-11 rounded-full px-4 text-label font-bold shadow-[var(--shadow-card)] ${captions ? "bg-ink text-white" : "bg-surface text-ink hover:bg-brand-soft"}`}>
            Captions
          </button>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <video
          ref={video}
          controls
          playsInline
          preload="metadata"
          poster={posterSrc(concept)}
          src={filmSrc(concept)}
          onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
          className="aspect-video w-full rounded-[22px] bg-ink shadow-[var(--shadow-lift)]"
          aria-label={`Film: ${title}. Captions are on; the transcript is below.`}
        />
        <section aria-labelledby={`chapters-${concept}`} className="flex flex-col gap-1 rounded-[22px] bg-surface p-3 shadow-[var(--shadow-card)]">
          <h3 id={`chapters-${concept}`} className="px-2 text-body font-extrabold text-ink">Chapters</h3>
          <div role="group" aria-label="Jump to a part" className="flex flex-col gap-1">
            {chapters.map((ch, i) => {
              const on = playing === ch.cue && now > 0;
              return (
                <button key={ch.cue} type="button" onClick={() => jump(ch.at)} aria-current={on ? "true" : undefined} className={`grid min-h-11 grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded-[14px] px-2 py-1.5 text-left text-label font-bold ${on ? "bg-brand-soft text-brand-strong" : "text-ink hover:bg-sunk"}`}>
                  <span aria-hidden className={`grid size-6 place-items-center rounded-full text-label ${on ? "bg-brand text-on-brand" : "bg-sunk text-ink-2"}`}>{i + 1}</span>
                  <span>{ch.title}</span>
                  <span aria-hidden className="tabular-nums text-ink-2">{clock(ch.at)}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
      <details className="rounded-[20px] bg-surface p-3 shadow-[var(--shadow-card)]">
        <summary className="min-h-11 cursor-pointer content-center px-1 text-body font-bold text-ink">Read the transcript</summary>
        <ol className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
          {cues.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => jump(c.start)} aria-current={current === c.id ? "true" : undefined} className={`grid w-full grid-cols-[3rem_1fr] gap-3 rounded-[14px] px-3 py-2 text-left text-body ${current === c.id ? "bg-brand-soft font-semibold text-ink" : "text-ink-2 hover:bg-sunk"}`}>
                <span className="font-semibold tabular-nums">{clock(c.start)}</span>
                <RichText text={c.text} />
              </button>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
