import { describe, expect, it } from "vitest";
import { createInitialState, finishAssessment, inTopic, setProfile, setSettings, type LearnerState } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { ESTIMATED_MINUTES, planCandidates, weekSummary, weeklyPlan } from "./plan";

/** PARENT-003: a manageable, evidence-based mix the grown-up can adjust. Hand-built learners as oracles. */

const NOW = 100 * 86_400_000;

describe("weekly learning plan (PARENT-003)", () => {
  it("never goes over the minutes chosen for a day, and has as many days as chosen", () => {
    const s = createInitialState();
    for (const [days, minutes] of [[3, 10], [5, 15], [7, 30]]) {
      const plan = weeklyPlan(s, NOW, days, minutes);
      expect(plan.length).toBe(days);
      for (const d of plan) {
        expect(d.minutes).toBeLessThanOrEqual(minutes);
        expect(d.minutes).toBe(d.items.reduce((n, i) => n + i.minutes, 0));
      }
    }
  });

  it("mixes new learning, times tables, mental maths and application across the week, each with its reason", () => {
    const plan = weeklyPlan(createInitialState(), NOW, 5, 20);
    const kinds = new Set(plan.flatMap((d) => d.items.map((i) => i.kind)));
    expect([...kinds].sort()).toEqual(["application", "facts", "mental", "new"]);
    for (const i of plan.flatMap((d) => d.items)) expect(i.why.length, i.title).toBeGreaterThan(15);
  });

  it("puts review of a flagged skill on more than one day when the evidence asks for it", () => {
    // A failed check on Fractions: both answers wrong, so the skill needs review.
    const wrong = (at: number): ItemResult => ({ questionId: `a${at}`, skill: "fractions.compare", context: "assessment", correct: false, firstTry: false, attempts: 1, hintsUsed: 0, misconceptions: [], at });
    let s: LearnerState = inTopic(createInitialState(), "fractions", (t) => finishAssessment({ ...t, assessment: { ...t.assessment, status: "in-progress", order: [], evaluations: {}, responses: {} } } as typeof t, [wrong(1), wrong(2)], 3));
    s = { ...s, currentTopicId: "fractions" };
    const plan = weeklyPlan(s, NOW, 5, 20);
    const reviewDays = plan.filter((d) => d.items.some((i) => i.kind === "review")).length;
    expect(reviewDays).toBeGreaterThanOrEqual(2);
    expect(planCandidates(s, NOW).find((i) => i.kind === "review")!.why).toMatch(/needs another look/);
  });

  it("offers a short mock for Years 5 and 6 and problem solving otherwise, and states practice estimates", () => {
    const y4 = planCandidates(setProfile(createInitialState(), { year: 4 }), NOW).find((i) => i.kind === "application")!;
    const y6 = planCandidates(setProfile(createInitialState(), { year: 6 }), NOW).find((i) => i.kind === "application")!;
    expect(y4.title).toBe("Problem solving");
    expect(y6.title).toBe("A short practice mock");
    expect(y6.href).toBe("/t/mock-exams/mock");
    expect(ESTIMATED_MINUTES.practice).toBe(8);
  });
});

describe("this week, for grown-ups (PARENT-002)", () => {
  it("counts days active, answers and recorded time in the last 7 days only, and names the islands", () => {
    const D = 86_400_000;
    const a = (at: number, extra: Partial<ItemResult> = {}): ItemResult => ({ questionId: `q${at}`, skill: "times-tables.meaning", context: "practice", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at, ...extra });
    const s = { ...createInitialState(), results: [
      a(NOW - 1 * D, { durationMs: 90_000 }),
      a(NOW - 1 * D + 1000, { durationMs: 30_000 }),
      a(NOW - 3 * D, { skill: "mental-maths.squares" }), // no recorded time
      a(NOW - 3 * D + 5, { context: "followup" }), // follow-ups aren't counted separately
      a(NOW - 8 * D, { durationMs: 600_000 }), // before the week
    ] };
    // Hand count: 2 days, 3 answers, 2 minutes recorded over 2 timed answers; two islands.
    expect(weekSummary(s, NOW)).toEqual({ daysActive: 2, answers: 3, minutesOnQuestions: 2, timedAnswers: 2, islands: ["Times tables", "Mental maths"], support: [] });
    expect(weekSummary(createInitialState(), NOW).minutesOnQuestions).toBeNull();
  });
});

describe("learner profile (PARENT-001)", () => {
  it("keeps all progress when the profile or workload changes", () => {
    const a: ItemResult = { questionId: "q", skill: "fractions.compare", context: "practice", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at: 1 };
    const s = { ...createInitialState(), results: [a] };
    const changed = setSettings(setProfile(s, { name: "Ada", year: 5 }), { planDays: 4, planMinutes: 20 });
    expect(changed.results).toEqual(s.results);
    expect(changed.topics).toEqual(s.topics);
    expect(changed.profile).toMatchObject({ name: "Ada", year: 5 });
    expect(changed.settings).toMatchObject({ planDays: 4, planMinutes: 20 });
  });
});

