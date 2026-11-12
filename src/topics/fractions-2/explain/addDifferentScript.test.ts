import { describe, expect, it } from "vitest";
import { filmLength, scriptProblems } from "@/engine/explainScript";
import { ADD_DIFFERENT_SCRIPT as S } from "./addDifferentScript";

/** D-041 pilot script: fit to be spoken, and its numbers right. Oracle: hand-worked answers. */

describe("adding fractions with different denominators: the script (D-041)", () => {
  it("passes every script check: each line has time to be spoken, cues and chapters line up", () => {
    expect(scriptProblems(S)).toEqual([]);
    // Hand-added: 4.5 + 7 + 8.6 + 8.6 + 5.5 + 7.5 + 8.5 + 9 = 59.2 seconds.
    expect(filmLength(S.film)).toBe(59.2);
  });

  it("has the right checkpoint answers (hand-worked: 1/3 = 4/12; 1/2 + 1/3 = 3/6 + 2/6 = 5/6)", () => {
    expect(S.story.map((c) => c.checkpoint.answer)).toEqual([4, 5]);
  });

  it("says every number the picture shows, in the step captions and in the film", () => {
    const steps = S.story.flatMap((c) => c.beats.map((b) => b.caption)).join(" ");
    for (const fact of ["{2/7}", "3 × 4 = 12", "4 twelfths", "3 twelfths", "7 twelfths", "{7/12}"]) expect(steps).toContain(fact);
    const film = S.film.cues.map((c) => c.text).join(" ");
    for (const fact of ["two sevenths", "3 times 4, which is 12", "four twelfths", "three twelfths", "7 twelfths", "seven twelfths"]) expect(film).toContain(fact);
  });
});
