"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { timedCues, type FilmScript } from "@/engine/explainScript";

/**
 * D-041 *Watch*: the concept's narrated film. Captions are on by default and built from the same script the film was
 * voiced from; the transcript below follows the film and jumps to a line when pressed; chapter buttons jump to a part.
 * Nothing plays until the child presses play.
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

  useEffect(() => {
    const v = video.current;
    if (!v || typeof v.addTextTrack !== "function" || typeof VTTCue === "undefined") return;
    const track = v.addTextTrack("captions", "English", "en");
    for (const c of cues) track.addCue(new VTTCue(c.start, c.end, plainCaption(c.text)));
    track.mode = "showing";
    return () => {
      track.mode = "disabled";
    };
  }, [cues]);

  const jump = (t: number) => {
    const v = video.current;
    if (!v) return;
    v.currentTime = t + 0.05;
    setNow(t + 0.05);
    void v.play()?.catch?.(() => {});
  };
  const current = cues.find((c) => now >= c.start && now < c.end)?.id;
  const length = cues.at(-1)?.end ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title font-extrabold text-ink">Watch: {title}</h2>
        <p className="text-label font-bold text-ink-2">{clock(length)} · turn the sound on</p>
      </div>
      <video
        ref={video}
        controls
        playsInline
        preload="metadata"
        poster={posterSrc(concept)}
        src={filmSrc(concept)}
        onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}
        className="aspect-video w-full rounded-[20px] bg-sunk"
        aria-label={`Film: ${title}. Captions are on; the transcript is below.`}
      />
      <div role="group" aria-label="Jump to a part" className="flex flex-wrap gap-2">
        {film.chapters.map((ch) => {
          const at = cues.find((c) => c.id === ch.cue)!.start;
          return (
            <button key={ch.cue} type="button" onClick={() => jump(at)} className="min-h-11 rounded-full bg-sunk px-4 text-label font-bold text-ink hover:bg-brand-soft">
              {ch.title}
            </button>
          );
        })}
      </div>
      <details className="rounded-[20px] border border-line bg-surface p-3">
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
