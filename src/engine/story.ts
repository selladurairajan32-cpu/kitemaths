/**
 * An animated explanation as a pure state machine (D-040). A story is chapters of timed beats; each chapter ends with
 * a micro-checkpoint that must be answered (or "Show me") before the next chapter unlocks. A wrong answer replays the
 * chapter's key beat, then asks again with a hint. The 3D stage and its 2D fallback only draw the current beat, so
 * play, pause, scrub, speed and replay all come from here.
 */

export interface Beat<S> {
  id: string;
  /** What the beat shows, in words: the caption is the text equivalent of the picture. */
  caption: string;
  /** How long the beat plays at normal speed, in milliseconds. */
  ms: number;
  scene: S;
}

export interface Checkpoint {
  prompt: string;
  answer: number;
  unit?: string;
  hint: string;
  /** The beat (index in its chapter) replayed after a wrong answer. */
  replayBeat: number;
  /** The worked answer shown after "Show me" or a right answer. */
  worked: string;
}

export interface Chapter<S> {
  id: string;
  title: string;
  beats: Beat<S>[];
  checkpoint: Checkpoint;
}

export type Speed = 0.75 | 1;

export interface StoryState {
  chapter: number;
  beat: number;
  /** Milliseconds into the current beat, at normal speed. */
  elapsed: number;
  playing: boolean;
  speed: Speed;
  /** Chapters whose checkpoint is answered or shown; each unlocks the next chapter. */
  passed: number[];
  /** At the end of the chapter, waiting on its checkpoint (or past it). */
  atEnd: boolean;
  /** Wrong answers on the current chapter's checkpoint. */
  wrong: number;
  /** Replaying the key beat after a wrong answer. */
  replaying: boolean;
  /** The current checkpoint was revealed with "Show me", not answered. */
  shown: boolean;
}

export type StoryEvent =
  | { type: "play" }
  | { type: "pause" }
  | { type: "tick"; ms: number }
  | { type: "restart" }
  | { type: "seek"; chapter: number; beat: number }
  | { type: "next" }
  | { type: "answer"; value: number }
  | { type: "showMe" }
  | { type: "speed"; speed: Speed };

export function initialStory(): StoryState {
  return { chapter: 0, beat: 0, elapsed: 0, playing: false, speed: 1, passed: [], atEnd: false, wrong: 0, replaying: false, shown: false };
}

/** The furthest chapter the child may open: one past the last chapter passed in order. */
export function unlockedChapter<S>(chapters: Chapter<S>[], state: StoryState): number {
  let n = 0;
  while (n < chapters.length - 1 && state.passed.includes(n)) n++;
  return n;
}

export type CheckpointStatus = "hidden" | "asking" | "wrong" | "passed";

/** What the current chapter's checkpoint should show. */
export function checkpointStatus(state: StoryState): CheckpointStatus {
  if (state.passed.includes(state.chapter)) return state.atEnd ? "passed" : "hidden";
  if (!state.atEnd || state.replaying) return "hidden";
  return state.wrong > 0 ? "wrong" : "asking";
}

const startChapter = (state: StoryState, chapter: number, playing: boolean): StoryState => ({ ...state, chapter, beat: 0, elapsed: 0, playing, atEnd: false, wrong: 0, replaying: false, shown: false });

export function storyReducer<S>(chapters: Chapter<S>[], state: StoryState, event: StoryEvent): StoryState {
  const ch = chapters[state.chapter]!;
  switch (event.type) {
    case "play": {
      if (state.playing) return state;
      if (state.atEnd) {
        // Past a passed checkpoint, Play goes on to the next chapter; before it, the checkpoint must be answered.
        if (!state.passed.includes(state.chapter)) return state;
        if (state.chapter < chapters.length - 1) return startChapter(state, state.chapter + 1, true);
        return { ...startChapter(state, state.chapter, true) };
      }
      return { ...state, playing: true };
    }
    case "pause":
      return state.playing ? { ...state, playing: false } : state;
    case "speed":
      return { ...state, speed: event.speed };
    case "restart":
      return startChapter(state, state.chapter, true);
    case "seek": {
      if (event.chapter < 0 || event.chapter > unlockedChapter(chapters, state)) return state;
      const target = chapters[event.chapter]!;
      const beat = Math.max(0, Math.min(event.beat, target.beats.length - 1));
      return { ...state, chapter: event.chapter, beat, elapsed: 0, atEnd: false, replaying: false, wrong: event.chapter === state.chapter ? state.wrong : 0, shown: false };
    }
    case "next": {
      if (state.chapter >= chapters.length - 1 || !state.passed.includes(state.chapter)) return state;
      return startChapter(state, state.chapter + 1, true);
    }
    case "answer": {
      const status = checkpointStatus(state);
      if (status !== "asking" && status !== "wrong") return state;
      if (event.value === ch.checkpoint.answer) return { ...state, passed: [...state.passed, state.chapter], shown: false };
      return { ...state, wrong: state.wrong + 1, replaying: true, beat: ch.checkpoint.replayBeat, elapsed: 0, playing: true, atEnd: false };
    }
    case "showMe": {
      const status = checkpointStatus(state);
      if (status !== "asking" && status !== "wrong") return state;
      return { ...state, passed: [...state.passed, state.chapter], shown: true };
    }
    case "tick": {
      if (!state.playing || event.ms <= 0) return state;
      let { beat, elapsed } = state;
      elapsed += event.ms * state.speed;
      while (elapsed >= ch.beats[beat]!.ms) {
        if (state.replaying && beat === ch.checkpoint.replayBeat) {
          // The replay shows just the key beat, then asks again.
          return { ...state, beat: ch.beats.length - 1, elapsed: ch.beats[ch.beats.length - 1]!.ms, playing: false, atEnd: true, replaying: false };
        }
        if (beat === ch.beats.length - 1) return { ...state, beat, elapsed: ch.beats[beat]!.ms, playing: false, atEnd: true };
        elapsed -= ch.beats[beat]!.ms;
        beat += 1;
      }
      return { ...state, beat, elapsed };
    }
  }
}

/** For the scrubber: where the current position is in the whole story, and where each chapter starts (milliseconds). */
export function timeline<S>(chapters: Chapter<S>[], state: StoryState): { at: number; total: number; chapterStarts: number[] } {
  const lengths = chapters.map((c) => c.beats.reduce((a, b) => a + b.ms, 0));
  const chapterStarts = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  const total = lengths.reduce((a, b) => a + b, 0);
  const ch = chapters[state.chapter]!;
  const at = chapterStarts[state.chapter]! + ch.beats.slice(0, state.beat).reduce((a, b) => a + b.ms, 0) + Math.min(state.elapsed, ch.beats[state.beat]!.ms);
  return { at, total, chapterStarts };
}

/** The chapter and beat at a time on the scrubber, or null if that point is in a chapter not yet unlocked. */
export function positionAt<S>(chapters: Chapter<S>[], state: StoryState, ms: number): { chapter: number; beat: number } | null {
  let t = Math.max(0, ms);
  for (let c = 0; c < chapters.length; c++) {
    for (let b = 0; b < chapters[c]!.beats.length; b++) {
      const len = chapters[c]!.beats[b]!.ms;
      if (t < len || (c === chapters.length - 1 && b === chapters[c]!.beats.length - 1)) return c <= unlockedChapter(chapters, state) ? { chapter: c, beat: b } : null;
      t -= len;
    }
  }
  return null;
}
