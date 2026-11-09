import { describe, expect, it } from "vitest";
import { compareWithLast, recentUntimedAccuracy, recommendStrategySkills, strategyMeasures, TIMED_UNLOCK, timedRuns, timedUnlocked } from "./strategyStats";
import type { ItemResult } from "./types";

/** R3 evidence: MM-011 (accuracy first, own progress only) and MM-012 (separate measures). Hand-counted oracles. */

let clock = 0;
const r = (skill: string, ok: boolean, extra: Partial<ItemResult> = {}): ItemResult => {
  clock += 10;
  return { questionId: `q${clock}`, skill, context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0, misconceptions: [], at: clock, ...extra };
};
const run = (session: string, pattern: boolean[]) => pattern.map((ok, i) => r("mental-maths.squares", ok, { context: "timed", id: `timed-mm:${session}:${i}`, durationMs: 4000 }));

describe("timed challenges open only after untimed accuracy (MM-011 AC1)", () => {
  it("needs 10 untimed answers with at least 80% right", () => {
    expect([TIMED_UNLOCK.answers, TIMED_UNLOCK.accuracy]).toEqual([10, 0.8]);
    const nine = Array.from({ length: 9 }, () => r("mental-maths.squares", true));
    expect(timedUnlocked(nine, "mental-maths")).toBe(false);
    // 10 answers, 8 right: exactly 80%.
    const ten = [...nine.slice(0, 8), r("mental-maths.squares", false), r("mental-maths.squares", false)];
    expect(recentUntimedAccuracy(ten, "mental-maths")).toEqual({ answered: 10, accuracy: 0.8 });
    expect(timedUnlocked(ten, "mental-maths")).toBe(true);
    // Timed answers and other islands don't count towards unlocking.
    const timedOnly = run("a", Array(12).fill(true));
    const otherIsland = Array.from({ length: 12 }, () => r("times-tables.meaning", true));
    expect(timedUnlocked([...timedOnly, ...otherIsland], "mental-maths")).toBe(false);
  });
});

describe("timed feedback compares only with the child's own last run (MM-011 AC2, MM-012 AC2)", () => {
  it("groups answers into runs and judges accuracy before the number answered", () => {
    const first = run("s1", [true, true, true, true, false]); // 5 answered, 4 right: 80%
    const faster = run("s2", [true, true, true, true, false, false, false]); // 7 answered, 4 right: 57%
    const runs = timedRuns([...first, ...faster], "mental-maths");
    expect(runs.map((x) => [x.answered, x.correct])).toEqual([[5, 4], [7, 4]]);
    // More answers but a smaller share right is never an improvement.
    expect(compareWithLast(runs)!.message).toBe("more-but-less-accurate");
    expect(compareWithLast(runs.slice(0, 1))!.message).toBe("first");
    const steadier = run("s3", [true, true, true, true, true]); // 100%
    expect(compareWithLast(timedRuns([...first, ...faster, ...steadier], "mental-maths"))!.message).toBe("more-accurate");
  });
});

describe("separate measures per skill (MM-012 AC1)", () => {
  it("keeps accuracy, method choice, independence, hints and time apart", () => {
    const S = "mental-maths.special-multipliers";
    const rs = [
      r(S, true, { durationMs: 3000 }),
      r(S, true, { firstTry: false, attempts: 2, durationMs: 9000 }),
      r(S, false, { hintsUsed: 2, durationMs: 6000 }),
      r(S, true, { strategy: { kind: "compare", chosen: "times-99", valid: true } }),
      r(S, false, { strategy: { kind: "choose", chosen: "times-9", valid: false } }),
      r(S, true, { context: "timed", durationMs: 2000 }),
    ];
    // Hand count over the 5 untimed answers: 3 right (60%); right first time with no hint: 2 of 5;
    // hints 2; method choices 2, 1 valid; median untimed time of 3,000, 9,000, 6,000 = 6,000; timed median 2,000.
    expect(strategyMeasures(rs, [S])[0]).toEqual({
      skill: S, answered: 5, accuracy: 0.6, choices: 2, methodChoice: 0.5, independence: 0.4, hintsUsed: 2, medianMs: 6000, timedMedianMs: 2000,
    });
  });

  it("recommends the weakest skills first, then skills not tried yet", () => {
    const a = "mental-maths.a";
    const b = "mental-maths.b";
    const c = "mental-maths.c";
    const rs = [r(a, true), r(a, true), r(b, true), r(b, false)];
    // a: 100%; b: 50%; c: not tried. Weakest first (b), then not tried (c), then the strong skill (a).
    expect(recommendStrategySkills(strategyMeasures(rs, [a, b, c]))).toEqual([b, c, a]);
  });
});
