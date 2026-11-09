import { describe, expect, it } from "vitest";
import { PRACTICE_SESSION_LENGTH, selectNextQuestion } from "@/engine/adaptive";
import { activityProgress, phaseStatuses, practiceResultsCount, recommendNext, topicResults, type TopicDefinition } from "@/engine/journey";
import { completeLesson, createInitialState, inTopic, recordResult, topicLearner } from "@/engine/progress";
import { badgesFor, totalStars, STARS } from "@/engine/rewards";
import type { ItemResult, QuestionBase } from "@/engine/types";
import { globalId, localId, questionById, TOPICS, topicById, topicIdOf, topicOf } from "./index";
import { activeTopic, startedTopics } from "./recommend";
import { WORLDS } from "./worlds";

describe("topic registry", () => {
  it("namespaces every skill, question and misconception by its topic, with no clashes", () => {
    const seen = new Set<string>();
    for (const t of TOPICS) {
      const ids = [
        ...t.skills.map((s) => s.id),
        ...t.misconceptions.map((m) => m.id),
        ...t.practiceQuestions.map((q) => q.id),
        ...Object.values(t.assessment.forms).flat().map((q) => q.id),
      ];
      for (const id of ids) {
        // Generated question ids carry a "g:" marker before the topic: g:<topic>.<template>:<level>:<seed>.
        expect(id.replace(/^g:/, "").startsWith(`${t.id}.`), id).toBe(true);
        expect(topicIdOf(id)).toBe(t.id);
      }
      for (const id of new Set(ids)) {
        expect(seen.has(id), `${id} clashes with another topic`).toBe(false);
        seen.add(id);
      }
    }
  });

  it("resolves every question a lesson, misconception or placement refers to", () => {
    for (const t of TOPICS) {
      for (const l of t.lessons) for (const s of l.steps) if (s.type === "check") expect(questionById(s.questionId).skill.startsWith(`${t.id}.`)).toBe(true);
      for (const m of t.misconceptions) m.followUps.forEach((id) => expect(topicOf(id)?.id).toBe(t.id));
      for (const id of t.placement?.order("seed") ?? []) expect(questionById(id).id).toBe(id);
      for (const s of t.skills) expect(t.lessonById(s.lessonId), s.id).toBeDefined();
    }
  });

  it("routes generated question ids to their topic, and converts URL ids", () => {
    expect(topicIdOf("g:fractions.nm-choose:2:7")).toBe("fractions");
    expect(questionById("g:fractions.nm-choose:2:7").skill).toBe("fractions.name");
    expect(localId("fractions.number-line")).toBe("number-line");
    expect(globalId("fractions", "number-line")).toBe("fractions.number-line");
    expect(globalId("fractions", "fractions.compare")).toBe("fractions.compare");
  });

  it("puts every playable topic on the world map exactly once", () => {
    const onMap = WORLDS.flatMap((w) => w.islands.map((i) => i.topicId)).filter(Boolean);
    expect(onMap.sort()).toEqual(TOPICS.map((t) => t.id).sort());
    TOPICS.forEach((t) => expect(topicById(t.id)).toBe(t));
  });
});

/** A tiny made-up topic, to prove a second island plugs into the engine. */
const counting: TopicDefinition<QuestionBase> = {
  id: "counting",
  title: "Counting",
  subtitle: "Count to 20",
  skills: [
    { id: "counting.to-10", title: "Count to 10", description: "", lessonId: "intro" },
    { id: "counting.to-20", title: "Count to 20", description: "", lessonId: "more" },
  ],
  lessons: [
    { id: "intro", title: "Counting to 10", phase: "Understand", summary: "", minutes: 3, steps: [] },
    { id: "more", title: "Counting to 20", phase: "Visualise", summary: "", minutes: 3, steps: [] },
  ],
  practiceQuestions: [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `counting.q${i}`,
    skill: i % 2 ? "counting.to-10" : "counting.to-20",
    difficulty: 1 as const,
    prompt: "",
    hint: "",
    explanation: "",
  })),
  assessmentQuestions: [],
  misconceptions: [],
  questionById: (id) => counting.practiceQuestions.find((q) => q.id === id)!,
};

const answer = (skill: string, i: number): ItemResult => ({
  id: `a${skill}${i}`,
  questionId: `${skill}-${i}`,
  skill,
  context: "practice",
  correct: true,
  firstTry: true,
  attempts: 1,
  hintsUsed: 0,
  misconceptions: [],
  at: 1000 + i,
});

describe("a second topic", () => {
  it("keeps its own journey while sharing results, stars and badges", () => {
    const fractions = topicById("fractions")!;
    let s = inTopic(createInitialState(), "fractions", (t) => completeLesson(t, "wholes", 1));
    s = inTopic(s, "counting", (t) => completeLesson(t, "intro", 2));
    for (let i = 0; i < 9; i++) s = inTopic(s, "counting", (t) => recordResult(t, answer("counting.to-10", i)));

    const c = topicLearner(s, "counting");
    const f = topicLearner(s, "fractions");
    expect(recommendNext(counting, c)).toMatchObject({ kind: "lesson", lessonId: "more", topicId: "counting" });
    // Reaching the end of "wholes" is activity, not evidence (FR-011 AC3): the next step is practice on its skill.
    expect(recommendNext(fractions, f)).toMatchObject({ kind: "practice", focusSkill: "fractions.equal-parts", topicId: "fractions" });

    // Counting answers never count towards fractions milestones.
    expect(practiceResultsCount(counting, c)).toBe(9);
    expect(practiceResultsCount(fractions, f)).toBe(0);
    expect(topicResults(fractions, s.results)).toHaveLength(0);
    expect(activityProgress(counting, c)).toBeGreaterThan(0);
    expect(phaseStatuses(counting, c)[0]).toEqual({ phase: "Understand", status: "done" });

    // Rewards add up across islands.
    expect(totalStars(s)).toBe(9 * 3 + 2 * STARS.lesson);
    const badges = badgesFor(s, [...fractions.skills, ...counting.skills], fractions.lessons.length + counting.lessons.length, 2000);
    expect(badges.some((b) => b.id === "skill:counting.to-10")).toBe(true);
  });

  it("gets adaptive practice from its own pool", () => {
    const asked: string[] = [];
    for (let i = 0; i < PRACTICE_SESSION_LENGTH; i++) {
      const sel = selectNextQuestion({ questions: counting.practiceQuestions, skillOrder: counting.skills.map((k) => k.id), results: [], sessionAsked: asked, focusSkill: null });
      if (!sel) break;
      expect(sel.question.id.startsWith("counting.")).toBe(true);
      asked.push(sel.question.id);
    }
    expect(asked).toHaveLength(counting.practiceQuestions.length);
  });
});

describe("skill badges follow the islands a learner has started (content audit R3)", () => {
  it("counts only the active island for a new learner, and adds an island once it has an answer", () => {
    const fresh = createInitialState();
    const startedIds = (s: typeof fresh) => startedTopics(s).map((t) => t.id);
    // A new learner has started only the island they are shown first.
    expect(startedIds(fresh)).toEqual([activeTopic(fresh).id]);
    const first = activeTopic(fresh);
    const other = TOPICS.find((t) => t.id !== first.id)!;
    const answer = (t: typeof first, at: number): ItemResult => ({
      context: "practice", skill: t.skills[0].id, questionId: t.practiceQuestions[0].id,
      correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at,
    });
    // Answering on another island makes it the active one; an untouched first island drops out.
    const elsewhere = inTopic(fresh, other.id, (t) => recordResult(t, answer(other, 1)));
    expect(startedIds(elsewhere)).toEqual([other.id]);
    // With an answer on both islands, both count.
    const both = inTopic(inTopic(fresh, first.id, (t) => recordResult(t, answer(first, 1))), other.id, (t) => recordResult(t, answer(other, 2)));
    expect(new Set(startedIds(both))).toEqual(new Set([first.id, other.id]));
    // Hand-counted oracle: the skill badges are exactly those two islands' skills.
    const skillBadges = badgesFor(both, startedTopics(both).flatMap((t) => t.skills), 1, 1).filter((b) => b.id.startsWith("skill:"));
    expect(skillBadges.length).toBe(first.skills.length + other.skills.length);
  });
});
