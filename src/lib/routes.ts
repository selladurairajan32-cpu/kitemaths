import type { SkillId } from "@/engine/types";

/** App-wide pages. */
export const routes = {
  dashboard: () => "/",
  /** The world map of every topic. */
  journey: () => "/journey",
  badges: () => "/badges",
  /** Onboarding: sends a new learner to the first topic's warm-up. */
  start: () => "/start",
  /** Practice hub: chooses a topic to practise. */
  practice: () => "/practice",
  /** Lab hub: chooses a topic's lab. */
  lab: () => "/lab",
  parent: () => "/parent",
  parentJourney: () => "/parent/journey",
  /** For a new grown-up; not behind the gate. */
  parentAbout: () => "/parent/about",
  /** Times-table facts report (TT-011). */
  parentFacts: () => "/parent/facts",
  results: () => "/results",
  review: () => "/results#review",
};

/** "fractions.compare" → "compare": skills appear in URLs without their topic prefix. */
const urlSkill = (skill: SkillId) => skill.slice(skill.indexOf(".") + 1);

/** Pages inside one topic, under /t/<topic>. */
export function topicRoutes(topicId: string) {
  const base = `/t/${topicId}`;
  return {
    island: () => base,
    studio: () => `${base}/lesson`,
    lesson: (lessonId: string, stepIndex?: number) =>
      stepIndex === undefined ? `${base}/lesson/${lessonId}` : `${base}/lesson/${lessonId}/${stepIndex + 1}`,
    lab: () => `${base}/lab`,
    practice: (skill?: SkillId | null) => (skill ? `${base}/practice/${urlSkill(skill)}` : `${base}/practice`),
    check: () => `${base}/check`,
    recheck: (skill: SkillId) => `${base}/recheck/${urlSkill(skill)}`,
    start: () => `${base}/start`,
    /** Times-table facts (R2), only on the times-tables island. */
    facts: () => `${base}/facts`,
    factsRun: (mode: "practice" | "untimed" | "diagnostic" | "timed", table?: number) => `${base}/facts/${mode}${table ? `?table=${table}` : ""}`,
    factsExplore: () => `${base}/facts/explore`,
  };
}

export type TopicLinks = ReturnType<typeof topicRoutes>;
