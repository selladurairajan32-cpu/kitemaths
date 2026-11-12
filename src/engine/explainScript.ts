import type { Chapter } from "./story";

/**
 * D-041: one script per concept drives all three ways to learn it, so the wording never disagrees between them.
 * - *Watch*: a narrated film. Its cues are spoken one after another, each for `s` seconds, and the film is rendered to
 *   the same timings (`tools/films/`), so the voice, the captions and the picture line up.
 * - *Step through*: the story's chapters of beats, each spoken by a recorded voice and shown with its caption.
 * - *Try it*: written by hand per concept; the script only names it.
 * Pure data and checks: no browser, no packages.
 */

export type ExplainMode = "watch" | "step" | "try";
export const EXPLAIN_MODES: readonly ExplainMode[] = ["watch", "step", "try"];
export const isExplainMode = (x: unknown): x is ExplainMode => typeof x === "string" && (EXPLAIN_MODES as readonly string[]).includes(x);

export interface FilmCue {
  id: string;
  /** The caption, in lesson markup (`{1/3}` for fractions, `**bold**`). */
  text: string;
  /** What the voice says, when it should differ from the caption. */
  say?: string;
  /** How long the cue lasts in the film, in seconds. */
  s: number;
}

export interface FilmScript {
  cues: FilmCue[];
  /** Jump points: a title and the cue it starts at. */
  chapters: { title: string; cue: string }[];
}

export interface ExplainScript<S> {
  topicId: string;
  concept: string;
  title: string;
  story: Chapter<S>[];
  film: FilmScript;
}

export interface TimedCue extends FilmCue {
  start: number;
  end: number;
}

/** Each cue with its start and end time in the film, in seconds. */
export function timedCues(film: FilmScript): TimedCue[] {
  let t = 0;
  return film.cues.map((c) => {
    const start = t;
    t = Math.round((t + c.s) * 1000) / 1000;
    return { ...c, start, end: t };
  });
}

export const filmLength = (film: FilmScript) => timedCues(film).at(-1)?.end ?? 0;

/**
 * Words as they are spoken: a fraction in markup is two words ("one third"), a sign is a word ("plus", "equals"; "÷" is
 * two, "divided by"), a ratio colon is a word ("to"), and markup itself is silent.
 */
export function spokenWords(text: string): number {
  return text
    .replace(/\{\d+\/\d+\}/g, " w w ")
    .replace(/÷/g, " w w ")
    .replace(/[+=×−]|(?<=\d\s*):(?=\s*\d)/g, " w ")
    .replace(/\*\*/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
}

/**
 * The least time a line needs to be spoken: 380 ms a word plus 400 ms to breathe. Measured on the chosen voices at
 * their set speed, which manage about 2.9 words a second; the film pipeline also checks the real recordings.
 */
export const neededMs = (text: string) => spokenWords(text) * 380 + 400;

/** Everything wrong with a script, in words; empty when it is fit to use. */
export function scriptProblems<S>(script: ExplainScript<S>): string[] {
  const out: string[] = [];
  const ids = new Set<string>();
  for (const ch of script.story) {
    if (ch.beats.length === 0) out.push(`${ch.id}: no beats`);
    if (ch.checkpoint.replayBeat < 0 || ch.checkpoint.replayBeat >= ch.beats.length) out.push(`${ch.id}: replay beat out of range`);
    for (const b of ch.beats) {
      if (ids.has(b.id)) out.push(`${b.id}: beat id used twice`);
      ids.add(b.id);
      if (!b.caption.trim()) out.push(`${b.id}: no caption`);
      const need = neededMs(b.say ?? b.caption);
      if (b.ms < need) out.push(`${b.id}: ${b.ms} ms is too short to say it (needs ${need})`);
    }
  }
  const cueIds = new Set<string>();
  for (const c of script.film.cues) {
    if (cueIds.has(c.id)) out.push(`${c.id}: cue id used twice`);
    cueIds.add(c.id);
    if (!c.text.trim()) out.push(`${c.id}: no caption`);
    const need = neededMs(c.say ?? c.text) / 1000;
    if (c.s < need) out.push(`${c.id}: ${c.s} s is too short to say it (needs ${need})`);
  }
  if (script.film.cues.length === 0) out.push("film: no cues");
  for (const ch of script.film.chapters) if (!cueIds.has(ch.cue)) out.push(`film chapter "${ch.title}": no cue ${ch.cue}`);
  if (script.film.chapters[0]?.cue !== script.film.cues[0]?.id) out.push("film: the first chapter must start at the first cue");
  return out;
}
