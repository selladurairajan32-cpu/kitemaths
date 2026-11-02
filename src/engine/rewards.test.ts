import { describe, expect, it } from "vitest";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { placedOutLessons, placementOrder, placementShouldStop, PLACEMENT_PLAN } from "@/topics/fractions/placement";
import { questionById } from "@/topics/fractions/questions";
import { skillById } from "@/topics/fractions/skills";
import { recommendNext } from "./journey";
import { skillMastery } from "./mastery";
import {
  answerPlacement,
  completeLesson,
  createInitialState,
  finishPlacement,
  hydrateState,
  recordResult,
  skipPlacement,
  startPlacement,
  type LearnerState,
} from "./progress";
import { answeredToday, badgesFor, DAILY_GOAL, dayKey, levelFor, STARS, starsForResult, streakFor, totalStars } from "./rewards";
import type { ItemResult } from "./types";

const DAY = 86_400_000;
const NOON = new Date(2026, 10, 2, 12).getTime();

let n = 0;
function res(partial: Partial<ItemResult> = {}): ItemResult {
  n++;
  return {
    id: `r${n}`,
    questionId: `q${n}`,
    skill: "name",
    context: "practice",
    correct: true,
    firstTry: true,
    attempts: 1,
    hintsUsed: 0,
    misconceptions: [],
    at: NOON,
    ...partial,
  };
}

function withResults(results: ItemResult[]): LearnerState {
  return results.reduce(recordResult, createInitialState());
}

describe("stars", () => {
  it("rewards effort as well as accuracy", () => {
    expect(starsForResult(res())).toBe(3);
    expect(starsForResult(res({ firstTry: false }))).toBe(2);
    expect(starsForResult(res({ correct: false, firstTry: false }))).toBe(1);
    expect(starsForResult(res({ context: "followup", correct: false }))).toBe(0);
  });

  it("adds lessons, lab challenges and checks, but not lessons skipped by placement", () => {
    let s = withResults([res(), res()]);
    s = completeLesson(s, "wholes", NOON);
    s = { ...s, labChallenges: ["a", "b"], assessment: { ...s.assessment, timesCompleted: 1 } };
    expect(totalStars(s)).toBe(6 + STARS.lesson + 2 * STARS.lab + STARS.check);
    const placed = { ...s, lessons: { ...s.lessons, naming: { step: 0, furthestStep: 0, completed: true, placedOut: true } } };
    expect(totalStars(placed)).toBe(totalStars(s));
  });

  it("levels need a few more stars each time", () => {
    expect(levelFor(0)).toMatchObject({ level: 1, into: 0, needed: 40 });
    expect(levelFor(39).level).toBe(1);
    expect(levelFor(40)).toMatchObject({ level: 2, into: 0, needed: 60 });
    expect(levelFor(100)).toMatchObject({ level: 3, into: 0, needed: 80 });
  });
});

describe("streaks and daily goal", () => {
  it("counts consecutive days, and keeps yesterday's streak alive until today is done", () => {
    const s = withResults([res({ at: NOON - 3 * DAY }), res({ at: NOON - 2 * DAY }), res({ at: NOON - DAY })]);
    expect(streakFor(s, NOON)).toEqual({ current: 3, best: 3, activeToday: false });
    const today = recordResult(s, res({ at: NOON }));
    expect(streakFor(today, NOON)).toEqual({ current: 4, best: 4, activeToday: true });
    expect(streakFor(s, NOON + DAY).current).toBe(0);
    expect(streakFor(s, NOON + DAY).best).toBe(3);
  });

  it("counts today's answers but not follow-up checks", () => {
    const s = withResults([res(), res({ context: "followup" }), res({ at: NOON - DAY })]);
    expect(answeredToday(s, NOON)).toBe(1);
    expect(dayKey(NOON)).toBe("2026-11-02");
  });

  it("awards badges from real progress", () => {
    const fresh = badgesFor(createInitialState(), FRACTIONS_TOPIC.skills, FRACTIONS_TOPIC.lessons.length, NOON);
    expect(fresh.every((b) => !b.earned)).toBe(true);
    const s = withResults(Array.from({ length: DAILY_GOAL }, () => res()));
    const earned = badgesFor(s, FRACTIONS_TOPIC.skills, FRACTIONS_TOPIC.lessons.length, NOON).filter((b) => b.earned).map((b) => b.id);
    expect(earned).toEqual(expect.arrayContaining(["first-flight", "hot-streak", "goal"]));
    expect(earned).not.toContain("century");
  });
});

describe("placement", () => {
  it("builds one real question per lesson, matching that lesson's skill", () => {
    const order = placementOrder("abc");
    expect(order).toHaveLength(PLACEMENT_PLAN.length);
    order.forEach((id, i) => {
      const lesson = FRACTIONS_TOPIC.lessons.find((l) => l.id === PLACEMENT_PLAN[i].lessonId)!;
      const skill = FRACTIONS_TOPIC.skills.find((s) => s.lessonId === lesson.id)!;
      expect(questionById(id).skill).toBe(skillById(skill.id).id);
    });
    expect(placementOrder("abc")).toEqual(order);
  });

  it("skips lessons answered correctly before the first gap, and stops after two misses in a row", () => {
    expect(placedOutLessons([true, true, false, true])).toEqual(["wholes", "naming"]);
    expect(placedOutLessons([false, true])).toEqual([]);
    expect(placementShouldStop([true, false])).toBe(false);
    expect(placementShouldStop([true, false, false])).toBe(true);
  });

  it("marks placed-out lessons done without counting placement towards mastery", () => {
    const order = placementOrder("x");
    let s = startPlacement(createInitialState(), order);
    s = answerPlacement(s, res({ id: "p1", questionId: order[0], skill: "equal-parts", context: "placement" }));
    s = answerPlacement(s, res({ id: "p1", questionId: order[0], skill: "equal-parts", context: "placement" }));
    expect(s.placement.index).toBe(1);
    s = answerPlacement(s, res({ id: "p2", questionId: order[1], skill: "name", context: "placement", correct: false, firstTry: false }));
    s = finishPlacement(s, placedOutLessons([true, false]), NOON);
    expect(s.placement.status).toBe("complete");
    expect(s.lessons.wholes).toMatchObject({ completed: true, placedOut: true });
    expect(s.lessons.naming).toBeUndefined();
    expect(skillMastery("equal-parts", s.results).status).toBe("not-started");
    const rec = recommendNext(FRACTIONS_TOPIC, s);
    expect(rec.kind === "lesson" && rec.lessonId).toBe("naming");
  });

  it("doesn't ask existing learners to take placement, and keeps new fields when loading", () => {
    const old = { ...withResults([res()]) } as Partial<LearnerState>;
    delete old.placement;
    delete old.profile;
    delete old.settings;
    const loaded = hydrateState(old);
    expect(loaded.placement.status).toBe("skipped");
    expect(loaded.settings.sound).toBe(true);
    expect(hydrateState(createInitialState()).placement.status).toBe("not-started");
    expect(skipPlacement(createInitialState()).placement.status).toBe("skipped");
  });
});
