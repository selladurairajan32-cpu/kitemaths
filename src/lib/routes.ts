import type { SkillId } from "@/engine/types";

export const routes = {
  dashboard: () => "/",
  journey: () => "/journey",
  badges: () => "/badges",
  start: () => "/start",
  parent: () => "/parent",
  parentJourney: () => "/parent/journey",
  studio: () => "/lesson",
  lesson: (lessonId: string, stepIndex?: number) =>
    stepIndex === undefined ? `/lesson/${lessonId}` : `/lesson/${lessonId}/${stepIndex + 1}`,
  lab: () => "/lab",
  practice: (skill?: SkillId | null) => (skill ? `/practice/${skill}` : "/practice"),
  assessment: () => "/assessment",
  recheck: (skill: SkillId) => `/assessment/recheck/${skill}`,
  results: () => "/results",
  review: () => "/results#review",
};
