import { describe, expect, it } from "vitest";
import { createInitialState, hydrateState } from "./progress";
import { canvasPhase, canvasReached, cleanStreak, countPractised, finishCanvasPhase, finishStage, openCanvasPhase, openStage, paceAfterAnswer, startJourney, strandSummary, templateKey, type JourneyProgress, type Strand } from "./topicJourney";
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

/** D-060: the lesson canvas's six phases on the five saved stages, and the pacing rule, against hand-worked cases. */
describe("lesson canvas phases and pace (D-060)", () => {
  it("walks Discover, Explore, Understand inside Learn, then one phase per stage, ending on the summary", () => {
    let p = startJourney(100);
    const seen = [canvasPhase(p)];
    for (let i = 0; i < 6; i++) seen.push(canvasPhase((p = finishCanvasPhase(p))));
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6]);
    // The saved stages are the topic journey's: three steps inside Learn, then Practise, Apply, Check, Complete.
    expect(p).toMatchObject({ stage: 4, reached: 4, learn: 2 });
    expect(canvasPhase(finishCanvasPhase(p))).toBe(6);
  });

  it("opens only phases already reached, and going back inside Learn keeps the later steps open", () => {
    let p = finishCanvasPhase(finishCanvasPhase(startJourney(100)));
    expect([canvasPhase(p), canvasReached(p)]).toEqual([2, 2]);
    expect(openCanvasPhase(p, 3)).toBe(p);
    expect(openCanvasPhase(p, -1)).toBe(p);
    expect(openCanvasPhase(p, 1.5)).toBe(p);
    p = openCanvasPhase(p, 0);
    expect([canvasPhase(p), canvasReached(p)]).toEqual([0, 2]);
    p = openCanvasPhase(p, 2);
    expect(canvasPhase(p)).toBe(2);
  });

  it("carries on a journey saved by the older layout: past Learn, every Learn step is open", () => {
    const old: JourneyProgress = { stage: 1, reached: 2, startedAt: 5, practised: 3, applied: 0 };
    expect([canvasPhase(old), canvasReached(old)]).toEqual([3, 4]);
    expect(canvasPhase(openCanvasPhase(old, 0))).toBe(0);
    expect(openCanvasPhase(old, 5)).toBe(old);
    // On Learn in the older layout there is no step saved: the canvas starts at Discover. A damaged value is clamped.
    expect(canvasPhase({ ...old, stage: 0, reached: 0 })).toBe(0);
    expect(canvasPhase({ ...old, stage: 0, reached: 0, learn: 9 })).toBe(2);
    expect(canvasPhase({ ...old, stage: 0, reached: 0, learn: Number.NaN })).toBe(0);
  });

  const LIST = [
    { key: "c", level: "guided" },
    { key: "c", level: "guided" },
    { key: "c", level: "build" },
    { key: "why", level: "build" },
    { key: "c", level: "build" },
    { key: "c", level: "challenge" },
    { key: "c", level: "challenge" },
  ];
  const STRANDS: Record<string, Strand> = { c: "concept", why: "reasoning" };

  it("passes over the rest of a level's concept questions after two clean answers in a row, and not before", () => {
    // One clean answer, or none: the next question.
    expect(paceAfterAnswer(LIST, STRANDS, 2, 1)).toBe(3);
    expect(paceAfterAnswer(LIST, STRANDS, 3, 0)).toBe(4);
    // Two clean answers at "build" (the second was the reasoning question): the last build question is passed over.
    expect(paceAfterAnswer(LIST, STRANDS, 3, 2)).toBe(5);
  });

  it("never passes over a reasoning question, and never skips at the last level", () => {
    // Two clean answers before the reasoning question: it is still asked.
    expect(paceAfterAnswer(LIST, STRANDS, 2, 2)).toBe(3);
    // The hardest level is always answered in full.
    expect(paceAfterAnswer(LIST, STRANDS, 5, 5)).toBe(6);
    expect(paceAfterAnswer(LIST, STRANDS, 6, 6)).toBe(7);
    // A list without levels (Apply) is never shortened.
    expect(paceAfterAnswer([{ key: "c" }, { key: "c" }, { key: "c" }], STRANDS, 0, 9)).toBe(1);
  });

  it("counts clean answers in a row from the newest practice answer: a hint, a second try or a wrong answer ends the run", () => {
    const rs = [result("a", true, 10), result("b", false, 11), result("c", true, 12), result("d", true, 13, { context: "followup" }), result("e", true, 14)];
    expect(cleanStreak(rs, "t.s", 0)).toBe(2);
    expect(cleanStreak([...rs, result("f", true, 15, { hintsUsed: 1 })], "t.s", 0)).toBe(0);
    expect(cleanStreak([...rs, result("f", true, 15, { firstTry: false })], "t.s", 0)).toBe(0);
    // Answers from before this journey, or for another skill, are not counted.
    expect(cleanStreak(rs, "t.s", 14)).toBe(1);
    expect(cleanStreak(rs, "t.other", 0)).toBe(0);
  });
});
