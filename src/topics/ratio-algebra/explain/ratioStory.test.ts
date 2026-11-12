import { describe, expect, it } from "vitest";
import { RATIO_STORY } from "./ratioStory";

/** D-040: the ratio story's words and numbers. Oracle: hand-worked answers. */

describe("ratio explanation story (D-040)", () => {
  it("has three chapters whose checkpoints have the right answers (hand-worked)", () => {
    expect(RATIO_STORY.map((c) => c.id)).toEqual(["for-every", "sharing", "scaling"]);
    // 6 blue in 2 : 3 → 9 orange; 20 in 3 : 1 → 15; 300 ml for 4 → 600 ml for 8.
    expect(RATIO_STORY.map((c) => c.checkpoint.answer)).toEqual([9, 15, 600]);
  });

  it("says the hand-worked sharing and scaling numbers in its captions, so nothing is only in the picture", () => {
    const words = RATIO_STORY.flatMap((c) => c.beats.map((b) => b.caption)).join(" ");
    for (const fact of ["2 : 3", "35 ÷ 5 = 7", "2 × 7 = 14", "3 × 7 = 21", "14 + 21 = 35", "3 eggs", "450 ml"]) expect(words).toContain(fact);
  });

  it("replays a beat that exists, and gives every beat a caption and a length", () => {
    for (const c of RATIO_STORY) {
      expect(c.checkpoint.replayBeat).toBeLessThan(c.beats.length);
      for (const b of c.beats) {
        expect(b.caption.length).toBeGreaterThan(20);
        expect(b.ms).toBeGreaterThan(1000);
      }
    }
  });
});
