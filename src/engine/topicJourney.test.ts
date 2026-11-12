import { describe, expect, it } from "vitest";
import { createInitialState, hydrateState } from "./progress";
import { countPractised, finishStage, openStage, startJourney, strandSummary, templateKey } from "./topicJourney";
import type { ItemResult } from "./types";

/** D-043: the topic journey's stage rules and strand summary, against hand-worked cases. */

const result = (questionId: string, correct: boolean, at: number, extra: Partial<ItemResult> = {}): ItemResult => ({ questionId, skill: "t.s", context: "practice", correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at, ...extra });

describe("topic journey (D-043)", () => {
  it("opens only unlocked stages, and finishing a stage unlocks and opens the next", () => {
    let p = startJourney(100);
    expect(openStage(p, 1)).toEqual(p);
    p = finishStage(p);
    expect([p.stage, p.reached]).toEqual([1, 1]);
    p = openStage(p, 0);
    expect([p.stage, p.reached]).toEqual([0, 1]);
    p = finishStage(finishStage(finishStage(finishStage(finishStage(p)))));
    expect([p.stage, p.reached]).toEqual([4, 4]);
    expect(countPractised(p).practised).toBe(1);
  });

  it("reads the template key from a generated question id", () => {
    expect(templateKey("g:fractions-2.f2-add-diff:3:248549")).toBe("f2-add-diff");
    expect(templateKey("fractions.q12")).toBeNull();
  });

  it("sums each strand from this journey's answers only; a hint or a second try is not right first time", () => {
    const strands = { a: "concept", b: "application" } as const;
    const rs = [
      result("g:t.a:1:1", true, 50), // before the journey started: ignored
      result("g:t.a:1:2", true, 120),
      result("g:t.a:2:3", true, 130, { hintsUsed: 1 }),
      result("g:t.b:3:4", false, 140),
      result("g:t.c:3:5", true, 150), // no strand: ignored
      result("g:t.a:2:6", true, 160, { skill: "t.other" }), // another skill: ignored
    ];
    expect(strandSummary(rs, "t.s", strands, 100)).toEqual({ concept: { right: 1, total: 2 }, application: { right: 0, total: 1 } });
  });

  it("keeps journeys when progress is saved and loaded, and older saves load without them", () => {
    const state = { ...createInitialState(), journeys: { "t/c": startJourney(5) } };
    expect(hydrateState(JSON.parse(JSON.stringify(state))).journeys).toEqual({ "t/c": startJourney(5) });
    expect(hydrateState(JSON.parse(JSON.stringify(createInitialState()))).journeys).toBeUndefined();
  });
});
