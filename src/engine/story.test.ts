import { describe, expect, it } from "vitest";
import { checkpointStatus, initialStory, positionAt, storyReducer, timeline, unlockedChapter, type Chapter, type StoryEvent, type StoryState } from "./story";

/** D-040 story machine. Oracles: hand-worked timings on a tiny two-chapter story. */

const story: Chapter<string>[] = [
  { id: "one", title: "One", beats: [{ id: "a", caption: "A", ms: 1000, scene: "a" }, { id: "b", caption: "B", ms: 2000, scene: "b" }], checkpoint: { prompt: "?", answer: 9, hint: "h", replayBeat: 1, worked: "w" } },
  { id: "two", title: "Two", beats: [{ id: "c", caption: "C", ms: 500, scene: "c" }], checkpoint: { prompt: "?", answer: 15, hint: "h", replayBeat: 0, worked: "w" } },
];
const run = (events: StoryEvent[], from: StoryState = initialStory()) => events.reduce((s, e) => storyReducer(story, s, e), from);

describe("story machine (D-040)", () => {
  it("plays beats in time and stops at the end of a chapter to ask its checkpoint", () => {
    let s = run([{ type: "play" }, { type: "tick", ms: 999 }]);
    expect([s.beat, s.elapsed]).toEqual([0, 999]);
    s = run([{ type: "tick", ms: 1 }], s);
    expect([s.beat, s.elapsed]).toEqual([1, 0]);
    s = run([{ type: "tick", ms: 5000 }], s);
    expect(s).toMatchObject({ beat: 1, playing: false, atEnd: true });
    expect(checkpointStatus(s)).toBe("asking");
  });

  it("plays at three-quarter speed when asked (hand-worked: 1,000 ms of real time is 750 ms of story)", () => {
    const s = run([{ type: "speed", speed: 0.75 }, { type: "play" }, { type: "tick", ms: 1000 }]);
    expect([s.beat, s.elapsed]).toEqual([0, 750]);
  });

  it("pauses, and ignores ticks while paused", () => {
    const s = run([{ type: "play" }, { type: "tick", ms: 300 }, { type: "pause" }, { type: "tick", ms: 5000 }]);
    expect([s.beat, s.elapsed, s.playing]).toEqual([0, 300, false]);
  });

  it("locks the next chapter until the checkpoint is answered, then unlocks it", () => {
    let s = run([{ type: "play" }, { type: "tick", ms: 3000 }]);
    expect(unlockedChapter(story, s)).toBe(0);
    expect(run([{ type: "next" }], s).chapter).toBe(0);
    expect(run([{ type: "seek", chapter: 1, beat: 0 }], s).chapter).toBe(0);
    s = run([{ type: "answer", value: 9 }], s);
    expect(checkpointStatus(s)).toBe("passed");
    expect(unlockedChapter(story, s)).toBe(1);
    s = run([{ type: "play" }], s);
    expect(s).toMatchObject({ chapter: 1, beat: 0, playing: true });
  });

  it("replays the key beat after a wrong answer, then asks again with the hint", () => {
    let s = run([{ type: "play" }, { type: "tick", ms: 3000 }, { type: "answer", value: 6 }]);
    expect(s).toMatchObject({ beat: 1, elapsed: 0, playing: true, replaying: true, wrong: 1 });
    expect(checkpointStatus(s)).toBe("hidden");
    s = run([{ type: "tick", ms: 2000 }], s);
    expect(s).toMatchObject({ playing: false, atEnd: true, replaying: false });
    expect(checkpointStatus(s)).toBe("wrong");
    s = run([{ type: "answer", value: 9 }], s);
    expect(checkpointStatus(s)).toBe("passed");
  });

  it("lets Show me pass the checkpoint, and marks it as shown", () => {
    const s = run([{ type: "play" }, { type: "tick", ms: 3000 }, { type: "showMe" }]);
    expect(s.shown).toBe(true);
    expect(unlockedChapter(story, s)).toBe(1);
  });

  it("ignores answers when no checkpoint is showing", () => {
    const s = run([{ type: "play" }, { type: "tick", ms: 100 }, { type: "answer", value: 9 }]);
    expect(s.passed).toEqual([]);
  });

  it("skips to the next beat, and from the last beat straight to the checkpoint", () => {
    let s = run([{ type: "play" }, { type: "tick", ms: 400 }, { type: "skip" }]);
    expect([s.beat, s.elapsed]).toEqual([1, 0]);
    s = run([{ type: "skip" }], s);
    expect(s).toMatchObject({ atEnd: true, playing: false });
    expect(checkpointStatus(s)).toBe("asking");
  });

  it("restarts the current chapter from its first beat", () => {
    const s = run([{ type: "play" }, { type: "tick", ms: 1500 }, { type: "restart" }]);
    expect([s.chapter, s.beat, s.elapsed, s.playing]).toEqual([0, 0, 0, true]);
  });

  it("maps the scrubber to beats, and refuses chapters not yet unlocked (hand-worked)", () => {
    const s = run([{ type: "play" }, { type: "tick", ms: 1500 }]);
    expect(timeline(story, s)).toEqual({ at: 1500, total: 3500, chapterStarts: [0, 3000] });
    expect(positionAt(story, s, 0)).toEqual({ chapter: 0, beat: 0 });
    expect(positionAt(story, s, 1200)).toEqual({ chapter: 0, beat: 1 });
    expect(positionAt(story, s, 3200)).toBeNull();
    const passed = run([{ type: "tick", ms: 5000 }, { type: "answer", value: 9 }], s);
    expect(positionAt(story, passed, 3200)).toEqual({ chapter: 1, beat: 0 });
  });
});
