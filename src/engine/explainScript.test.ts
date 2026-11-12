import { describe, expect, it } from "vitest";
import { filmLength, isExplainMode, neededMs, scriptProblems, spokenWords, timedCues, withoutPauses, type ExplainScript } from "./explainScript";

/** D-041: the explanation script and its checks, against hand-worked values. */

const ok: ExplainScript<null> = {
  topicId: "t",
  concept: "c",
  title: "T",
  story: [{ id: "ch", title: "Ch", beats: [{ id: "b1", caption: "One two three four.", ms: 2000, scene: null }], checkpoint: { prompt: "?", answer: 1, hint: "h", replayBeat: 0, worked: "w" } }],
  film: { cues: [{ id: "a", text: "Hello there.", s: 1.5 }, { id: "b", text: "{1/3} and {1/4}.", s: 2.5 }], chapters: [{ title: "Start", cue: "a" }] },
};

describe("explanation scripts (D-041)", () => {
  it("counts spoken words: a fraction is two words, a sign is a word, markup is silent", () => {
    // one third / plus / one quarter / equals: 6 (the ? is silent).
    expect(spokenWords("**{1/3}** + {1/4} = ?")).toBe(6);
    // 3 times 4 equals 12 equal parts: 7.
    expect(spokenWords("3 × 4 = 12 equal parts")).toBe(7);
    // 35 divided by 5 is 7; the ratio 2 to 3: 6 + 5.
    expect(spokenWords("35 ÷ 5 is 7; the ratio 2 : 3")).toBe(11);
    expect(neededMs("One two three.")).toBe(3 * 340 + 400);
  });

  it("counts teaching pauses as time, not words, and keeps them out of captions (hand-worked)", () => {
    // 6 words (What do you think? Look again.) + a think (2,200 ms) + a pause (900 ms): 6 × 340 + 400 + 3,100.
    expect(neededMs("What do you think? [think] Look again. [pause]")).toBe(6 * 340 + 400 + 3100);
    expect(withoutPauses("Wait. [pause] Look.")).toBe("Wait. Look.");
    const bad: ExplainScript<null> = { ...ok, film: { ...ok.film, cues: [{ id: "a", text: "Think [think]", s: 9 }] , chapters: [{ title: "A", cue: "a" }] } };
    expect(scriptProblems(bad)).toEqual(["a: a pause marker in the caption"]);
  });

  it("times the film cues one after another", () => {
    expect(timedCues(ok.film).map((c) => [c.start, c.end])).toEqual([[0, 1.5], [1.5, 4]]);
    expect(filmLength(ok.film)).toBe(4);
  });

  it("accepts a fit script and reports every problem in a broken one", () => {
    expect(scriptProblems(ok)).toEqual([]);
    const bad: ExplainScript<null> = {
      ...ok,
      story: [{ ...ok.story[0]!, beats: [{ id: "b1", caption: "A much longer line that cannot be said in one second at all.", ms: 1000, scene: null }, { id: "b1", caption: " ", ms: 5000, scene: null }], checkpoint: { ...ok.story[0]!.checkpoint, replayBeat: 4 } }],
      film: { cues: [{ id: "a", text: "Far too many words for so little time here.", s: 1 }], chapters: [{ title: "X", cue: "z" }] },
    };
    expect(scriptProblems(bad)).toEqual([
      "ch: replay beat out of range",
      "b1: 1000 ms is too short to say it (needs 4820)",
      "b1: beat id used twice",
      "b1: no caption",
      "a: 1 s is too short to say it (needs 3.46)",
      'film chapter "X": no cue z',
      "film: the first chapter must start at the first cue",
    ]);
  });

  it("knows the three modes", () => {
    expect(["watch", "step", "try", "read", 3].map(isExplainMode)).toEqual([true, true, true, false, false]);
  });
});
