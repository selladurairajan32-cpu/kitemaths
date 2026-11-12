import { describe, expect, it } from "vitest";
import type { TopicDefinition } from "./journey";
import { journeyDone, latestJourney, masterySummary, mockSessions, topicOverview } from "./overview";
import { createInitialState, createTopicLearner } from "./progress";
import { finishStage, startJourney } from "./topicJourney";
import type { ItemResult } from "./types";

/** D-043 step 3: the kid pages' summaries, against hand-worked cases (statuses follow the MAST-001 rules by hand). */

const r = (skill: string, correct: boolean, at: number, extra: Partial<ItemResult> = {}): ItemResult => ({
  questionId: `${skill}:${at}`,
  skill,
  context: "practice",
  correct,
  firstTry: correct,
  attempts: 1,
  hintsUsed: 0,
  misconceptions: [],
  at,
  ...extra,
});

const skills = ["t.a", "t.b", "t.c", "t.d", "t.e"].map((id) => ({ id, title: id, description: "" }));
const topic = { id: "t", title: "T", subtitle: "", skills, lessons: [], practiceQuestions: [], assessmentQuestions: [], misconceptions: [], questionById: () => ({}) } as unknown as TopicDefinition;

describe("kid page summaries (D-043 step 3)", () => {
  it("counts a topic's skills by status: mastered, on the way, developing, needs review", () => {
    const results = [
      // t.a: 3 right in practice (secure), then 2 of 2 in a check → mastered.
      r("t.a", true, 1), r("t.a", true, 2), r("t.a", true, 3), r("t.a", true, 10, { context: "assessment" }), r("t.a", true, 10, { context: "assessment" }),
      // t.b: 3 right in practice, no check → secure (on the way).
      r("t.b", true, 1), r("t.b", true, 2), r("t.b", true, 3),
      // t.c: 1 of 2 in a check → needs review.
      r("t.c", true, 1), r("t.c", true, 11, { context: "assessment" }), r("t.c", false, 11, { context: "assessment" }),
      // t.d: one wrong practice answer → developing. t.e: nothing → not started.
      r("t.d", false, 1),
    ];
    const o = topicOverview(topic, { ...createTopicLearner(), results });
    expect(o).toEqual({ topicId: "t", skills: 5, mastered: 1, onTheWay: 1, developing: 1, needsReview: 1, lessons: 0, lessonsDone: 0, started: true });
    expect(topicOverview(topic, createTopicLearner()).started).toBe(false);
    expect(topicOverview(topic, { ...createTopicLearner(), results: [r("other.x", true, 1)] }).started).toBe(false);
  });

  it("adds topics up for the mastery ring", () => {
    const a = { topicId: "a", skills: 4, mastered: 1, onTheWay: 2, developing: 0, needsReview: 1, lessons: 3, lessonsDone: 1, started: true };
    const b = { topicId: "b", skills: 6, mastered: 2, onTheWay: 0, developing: 3, needsReview: 0, lessons: 5, lessonsDone: 0, started: true };
    expect(masterySummary([a, b])).toEqual({ skills: 10, mastered: 3, onTheWay: 2, developing: 3, needsReview: 1 });
    expect(masterySummary([])).toEqual({ skills: 0, mastered: 0, onTheWay: 0, developing: 0, needsReview: 0 });
  });

  it("continues the unfinished journey worked in last, counting answers on its skill since it started", () => {
    const skillOf = (k: string) => ({ "x/one": "x.one", "y/two": "y.two", "z/done": "z.done" })[k];
    let done = startJourney(500);
    for (let i = 0; i < 4; i++) done = finishStage(done);
    expect(journeyDone(done)).toBe(true);
    const journeys = { "x/one": startJourney(100), "y/two": startJourney(200), "z/done": done, "gone/old": startJourney(900) };
    // y/two started later, so it is in front…
    expect(latestJourney({ journeys, results: [] }, skillOf)?.key).toBe("y/two");
    // …until the child answers on x/one's skill after that.
    expect(latestJourney({ journeys, results: [r("x.one", true, 300)] }, skillOf)).toMatchObject({ key: "x/one", lastAt: 300 });
    // An answer on the skill from before the journey started does not count.
    expect(latestJourney({ journeys: { "x/one": startJourney(100), "y/two": startJourney(200) }, results: [r("x.one", true, 50)] }, skillOf)?.key).toBe("y/two");
    expect(latestJourney({ journeys: { "z/done": done }, results: [] }, skillOf)).toBeNull();
    expect(latestJourney(createInitialState(), skillOf)).toBeNull();
  });

  it("groups mock answers into sessions, oldest first", () => {
    const m = (session: string, at: number, correct: boolean) => r("mock-exams.x", correct, at, { mock: { session, total: 3 } as ItemResult["mock"] });
    const rs = [m("b", 20, true), m("a", 10, true), m("a", 11, false), m("b", 21, true), r("t.a", true, 5)];
    expect(mockSessions(rs)).toEqual([
      { session: "a", at: 10, total: 3, correct: 1 },
      { session: "b", at: 20, total: 3, correct: 2 },
    ]);
  });
});
