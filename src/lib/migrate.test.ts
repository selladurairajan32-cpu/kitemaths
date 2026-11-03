import { describe, expect, it } from "vitest";
import { recommendNext } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { topicLearner } from "@/engine/progress";
import { badgesFor, streakFor, totalStars } from "@/engine/rewards";
import type { ItemResult } from "@/engine/types";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { questionById } from "@/topics/fractions/questions";
import { legacyQuestionId, migrateV1 } from "./migrate";

const DAY = 86_400_000;
const NOW = new Date(2026, 10, 2, 12).getTime();

const r = (i: number, p: Partial<ItemResult>): ItemResult => ({
  id: `ep-${i}`,
  questionId: "nm-1",
  skill: "name",
  context: "practice",
  correct: true,
  firstTry: true,
  attempts: 1,
  hintsUsed: 0,
  misconceptions: [],
  difficulty: 1,
  at: NOW - DAY,
  ...p,
});

/** A version-1 save shaped exactly like the ones in browsers on the live site. */
const V1 = {
  version: 1,
  profile: { name: "Ava", year: 4, avatar: "kip" },
  settings: { sound: false, autoRead: true },
  placement: { status: "complete", order: ["g:ep-yesno:2:11", "g:nm-choose:2:22"], index: 2, correct: ["g:ep-yesno:2:11"], wrong: ["g:nm-choose:2:22"], placedOut: ["wholes"], completedAt: NOW - 3 * DAY },
  lessons: {
    wholes: { step: 0, furthestStep: 0, completed: true, completedAt: NOW - 3 * DAY, placedOut: true },
    naming: { step: 5, furthestStep: 5, completed: true, completedAt: NOW - 2 * DAY },
    lab: { step: 2, furthestStep: 2, completed: false },
  },
  currentLessonId: "lab",
  results: [
    r(1, { context: "placement", questionId: "g:ep-yesno:2:11", skill: "equal-parts", at: NOW - 3 * DAY }),
    r(2, { context: "placement", questionId: "g:nm-choose:2:22", skill: "name", correct: false, firstTry: false, misconceptions: ["part-to-part"], at: NOW - 3 * DAY }),
    r(3, { questionId: "nm-2", at: NOW - 2 * DAY }),
    r(4, { questionId: "fu-pp-1", context: "followup", targets: "part-to-part", at: NOW - 2 * DAY }),
    r(5, { questionId: "g:nm-write:3:99", at: NOW - DAY }),
    r(6, { questionId: "cp-1", skill: "compare", correct: false, firstTry: false, attempts: 2, misconceptions: ["bigger-denominator-bigger-piece"], at: NOW - DAY }),
    r(7, { questionId: "as-3", skill: "compare", context: "assessment", correct: false, firstTry: false, at: NOW - DAY }),
    r(8, { questionId: "as-4", skill: "name", context: "assessment", at: NOW - DAY }),
    r(9, { questionId: "bs-5", skill: "compare", context: "recheck", at: NOW }),
  ],
  practice: { active: true, startedAt: NOW, sessionAsked: ["nm-3", "g:cp-sign:2:5"], sessionResults: 1, current: "g:cp-sign:2:5", currentReason: "focus", focusSkill: "compare", sessionsCompleted: 2 },
  assessment: {
    status: "complete",
    form: "A",
    seed: 7,
    order: ["as-3", "as-4"],
    index: 1,
    responses: { "as-3": { kind: "compare", symbol: ">" } },
    evaluations: { "as-3": { correct: false, misconceptions: ["bigger-denominator-bigger-piece"] }, "as-4": { correct: true, misconceptions: [] } },
    completedAt: NOW - DAY,
    timesCompleted: 1,
  },
  recheck: { skill: "name", order: ["bs-1", "bs-2"], form: "B", seed: 4, startedAt: NOW, index: 0, responses: {}, evaluations: {} },
  rechecks: { compare: { form: "B", seed: 3, order: ["bs-5", "bs-6"], responses: {}, evaluations: { "bs-5": { correct: true, misconceptions: [] } }, startedAt: NOW, completedAt: NOW } },
  labChallenges: ["build-3-4", "compare-1"],
};

/** Totals computed straight from the version-1 data, the way version 1 did. */
function v1Stars() {
  const answers = V1.results.reduce((n, x) => {
    if (x.context === "practice" || x.context === "lesson") return n + (x.correct ? (x.firstTry ? 3 : 2) : 1);
    if (x.context === "followup") return n + (x.correct ? 1 : 0);
    if (x.context === "assessment" || x.context === "recheck") return n + (x.correct ? 2 : 1);
    return n + (x.correct ? 1 : 0);
  }, 0);
  return answers + 1 * 10 + V1.labChallenges.length * 5 + V1.assessment.timesCompleted * 20;
}

describe("migrating version-1 saves", () => {
  const v2 = migrateV1(JSON.parse(JSON.stringify(V1)))!;
  const t = topicLearner(v2, "fractions");

  it("keeps every star, the streak and the profile", () => {
    expect(totalStars(v2)).toBe(v1Stars());
    expect(streakFor(v2, NOW)).toEqual({ current: 4, best: 4, activeToday: true });
    expect(v2.profile).toEqual(V1.profile);
    expect(v2.settings).toEqual(V1.settings);
    expect(v2.currentTopicId).toBe("fractions");
  });

  it("keeps lessons, placement and practice exactly where they were", () => {
    expect(t.lessons).toEqual(V1.lessons);
    expect(t.currentLessonId).toBe("lab");
    expect(t.placement).toMatchObject({ status: "complete", placedOut: ["wholes"], correct: ["g:fractions.ep-yesno:2:11"] });
    expect(t.practice).toMatchObject({ active: true, current: "g:fractions.cp-sign:2:5", focusSkill: "fractions.compare", sessionAsked: ["fractions.nm-3", "g:fractions.cp-sign:2:5"], sessionsCompleted: 2 });
    expect(t.labChallenges).toEqual(V1.labChallenges);
  });

  it("namespaces every id so it still points at the same content", () => {
    for (const x of t.results) {
      expect(x.skill.startsWith("fractions.")).toBe(true);
      expect(() => questionById(x.questionId)).not.toThrow();
      x.misconceptions.forEach((m) => expect(FRACTIONS_TOPIC.misconceptions.some((d) => d.id === m)).toBe(true));
    }
    expect(t.results.find((x) => x.id === "ep-4")?.targets).toBe("fractions.part-to-part");
    expect(t.assessment.last?.order).toEqual(["fractions.as-3", "fractions.as-4"]);
    expect(t.assessment.last?.evaluations["fractions.as-3"].misconceptions).toEqual(["fractions.bigger-denominator-bigger-piece"]);
    expect(t.recheck).toMatchObject({ skill: "fractions.name", order: ["fractions.bs-1", "fractions.bs-2"] });
    expect(Object.keys(t.rechecks)).toEqual(["fractions.compare"]);
  });

  it("gives the same mastery picture and next step", () => {
    for (const s of ["equal-parts", "name", "compare"]) {
      const before = skillMastery(s, V1.results as ItemResult[]);
      const after = skillMastery(`fractions.${s}`, t.results);
      expect({ ...after, skill: s }).toEqual(before);
    }
    expect(recommendNext(FRACTIONS_TOPIC, t)).toMatchObject({ kind: "recheck", skill: "fractions.name", resume: true, topicId: "fractions" });
    const badges = badgesFor(v2, FRACTIONS_TOPIC.skills, FRACTIONS_TOPIC.lessons.length, NOW);
    expect(badges.find((b) => b.id === "lesson-1")?.earned).toBe(true);
  });

  it("rebuilds a migrated generated question as the same question", () => {
    const q = questionById(legacyQuestionId("g:nm-write:3:99"));
    expect(q.id).toBe("g:fractions.nm-write:3:99");
    expect(questionById("g:fractions.nm-write:3:99")).toEqual(q);
  });

  it("ignores anything that isn't a version-1 save", () => {
    expect(migrateV1(null)).toBeNull();
    expect(migrateV1({ version: 2 })).toBeNull();
    expect(migrateV1("x")).toBeNull();
    expect(legacyQuestionId("fractions.nm-1")).toBe("fractions.nm-1");
  });
});
