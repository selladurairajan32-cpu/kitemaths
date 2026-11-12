import { describe, expect, it } from "vitest";
import { filmLength, scriptProblems, type ExplainScript } from "@/engine/explainScript";
import { COMPARE_SCRIPT } from "./decimals/explain/compareScript";
import { MULTIPLY_SCRIPT } from "./fractions-2/explain/multiplyScript";
import { REMAINDER_SCRIPT } from "./multiply-divide/explain/remainderScript";
import { PERCENT_SCRIPT } from "./percentages/explain/percentScript";

/**
 * D-050: the teaching scripts for the first batch of hard concepts. Each is fit to be spoken, its numbers are right
 * (hand-worked oracles, never the maths under test), and it teaches: a question with time to think, the common
 * mistake, a turn for the child and a recap.
 */

const ALL: [string, ExplainScript<unknown>][] = [
  ["compare-decimals", COMPARE_SCRIPT as ExplainScript<unknown>],
  ["percent-of-amount", PERCENT_SCRIPT as ExplainScript<unknown>],
  ["multiply-fractions", MULTIPLY_SCRIPT as ExplainScript<unknown>],
  ["remainders", REMAINDER_SCRIPT as ExplainScript<unknown>],
];

describe("hard concept scripts (D-050)", () => {
  it("passes every script check, with film lengths added up by hand", () => {
    for (const [, s] of ALL) expect(scriptProblems(s), s.concept).toEqual([]);
    // 9 + 6.5 + 9.5 + 11 + 10.5 + 14 + 11 + 8.5 + 18.5 + 7.5 = 106
    expect(filmLength(COMPARE_SCRIPT.film)).toBe(106);
    // 8 + 6.5 + 11.5 + 11 + 8 + 11 + 10 + 8.5 + 16 + 7 = 97.5
    expect(filmLength(PERCENT_SCRIPT.film)).toBe(97.5);
    // 8.5 + 6.5 + 9.5 + 8 + 8.5 + 9 + 10.5 + 8.5 + 17.5 + 8 = 94.5
    expect(filmLength(MULTIPLY_SCRIPT.film)).toBe(94.5);
    // 8 + 6.5 + 10 + 7 + 7 + 15.5 + 7.5 + 10.5 + 18 + 7 = 97
    expect(filmLength(REMAINDER_SCRIPT.film)).toBe(97);
  });

  it("has the right checkpoint answers (hand-worked)", () => {
    // 0.7 > 0.65 (7 tenths > 6 tenths); 0.5 = 0.50 > 0.48.
    expect(COMPARE_SCRIPT.story.map((c) => c.checkpoint.answer)).toEqual([0.7, 0.5]);
    // 10% of 60 = 6; 20% of 50 = 2 × 5 = 10.
    expect(PERCENT_SCRIPT.story.map((c) => c.checkpoint.answer)).toEqual([6, 10]);
    // 2 halves × 3 thirds = 6 pieces; 1/2 × 3/4 = 3/8, so 3 eighths.
    expect(MULTIPLY_SCRIPT.story.map((c) => c.checkpoint.answer)).toEqual([6, 3]);
    // 30 ÷ 8 = 3 r 6, round up to 4; 20 ÷ 3 = 6 r 2, round down to 6.
    expect(REMAINDER_SCRIPT.story.map((c) => c.checkpoint.answer)).toEqual([4, 6]);
  });

  it("says the numbers the pictures show", () => {
    const steps = (s: ExplainScript<unknown>) => s.story.flatMap((c) => c.beats.map((b) => b.caption)).join(" ");
    for (const fact of ["0.4", "0.35", "4 tenths", "3 tenths", "0.40", "40 hundredths", "35 hundredths"]) expect(steps(COMPARE_SCRIPT as ExplainScript<unknown>)).toContain(fact);
    for (const fact of ["£80", "35%", "80 ÷ 10 = 8", "3 × £8 = £24", "£4", "£28"]) expect(steps(PERCENT_SCRIPT as ExplainScript<unknown>)).toContain(fact);
    for (const fact of ["2 × 3 = 6", "{1/2} × {1/3} = {1/6}", "1 × 1 = 1"]) expect(steps(MULTIPLY_SCRIPT as ExplainScript<unknown>)).toContain(fact);
    for (const fact of ["50 ÷ 12 = 4 remainder 2", "5 minibuses", "How many full packs? 4", "the remainder: 2"]) expect(steps(REMAINDER_SCRIPT as ExplainScript<unknown>)).toContain(fact);
  });

  it("teaches: it asks before it tells, names the mistake, and ends with a turn for the child and a recap", () => {
    for (const [, s] of ALL) {
      const cues = s.film.cues;
      expect(cues[1]!.say, s.concept).toMatch(/What do you think\?.*\[think\]$/);
      expect(cues.some((c) => c.id === "mistake"), s.concept).toBe(true);
      expect(cues.find((c) => c.id === "your-turn")!.say, s.concept).toMatch(/^Your turn\..*\[think\]/);
      expect(cues.at(-1)!.id, s.concept).toBe("recap");
      expect(s.story[0]!.beats[0]!.say, s.concept).toMatch(/\[think\]$/);
    }
  });
});
