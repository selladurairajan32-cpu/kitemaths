import { describe, expect, it } from "vitest";
import { filmLength, scriptProblems } from "@/engine/explainScript";
import { ADD_DIFFERENT_SCRIPT as S } from "./addDifferentScript";

/** D-041 pilot script, taught as a teacher would (D-043): fit to be spoken, and its numbers right. Oracle: hand-worked. */

describe("adding fractions with different denominators: the script (D-041)", () => {
  it("passes every script check: each line has time to be spoken, cues and chapters line up", () => {
    expect(scriptProblems(S)).toEqual([]);
    // Hand-added: 9 + 6.5 + 10.5 + 10 + 10.5 + 10.5 + 11.5 + 9.5 + 17 + 8 = 103 seconds.
    expect(filmLength(S.film)).toBe(103);
  });

  it("has the right checkpoint answers (hand-worked: 1/3 = 4/12; 1/2 + 1/3 = 3/6 + 2/6 = 5/6)", () => {
    expect(S.story.map((c) => c.checkpoint.answer)).toEqual([4, 5]);
  });

  it("says every number the picture shows, in the step captions and in the film", () => {
    const steps = S.story.flatMap((c) => c.beats.map((b) => b.caption)).join(" ");
    for (const fact of ["{2/7}", "3 × 4 = 12", "4 twelfths", "3 twelfths", "7 twelfths", "{7/12}"]) expect(steps).toContain(fact);
    const film = S.film.cues.map((c) => c.text).join(" ");
    for (const fact of ["two sevenths", "Three times four is twelve", "four twelfths", "three twelfths", "seven twelfths", "three sixths, which is the same as one half"]) expect(film).toContain(fact);
  });

  it("teaches: it asks before it tells, gives time to think, and ends with a turn for the child and a recap", () => {
    const say = S.film.cues.map((c) => c.say ?? c.text);
    // The question, then a thinking pause before anything is explained.
    expect(S.film.cues[1]!.say).toMatch(/What do you think\?.*\[think\]$/);
    expect(say.findIndex((x) => x.includes("[think]"))).toBeLessThan(S.film.cues.findIndex((c) => c.id === "trick"));
    // A turn for the child, with time to think before the answer.
    expect(S.film.cues.find((c) => c.id === "your-turn")!.say).toMatch(/Your turn\..*\[think\].*one half/);
    expect(S.film.cues.at(-1)!.id).toBe("recap");
    // Step through starts with the story and a thinking pause too.
    expect(S.story[0]!.beats[0]!.say).toMatch(/\[think\]$/);
  });
});
