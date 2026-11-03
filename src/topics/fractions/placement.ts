import { hashString } from "@/engine/random";

/**
 * The warm-up game that decides where a new learner starts.
 *
 * One medium question per lesson, in lesson order. Lessons build on each
 * other, so the learner skips the lessons they answered correctly *before*
 * their first wrong answer, and starts at the first gap. Two wrong answers in a
 * row ends the warm-up early so it never turns into a test of things they
 * haven't learned yet.
 */
export const PLACEMENT_PLAN: { lessonId: string; template: string }[] = [
  { lessonId: "wholes", template: "ep-yesno" },
  { lessonId: "naming", template: "nm-choose" },
  { lessonId: "lab", template: "rp-shade" },
  { lessonId: "comparing", template: "cp-sign" },
  { lessonId: "equivalent", template: "eq-missing" },
  { lessonId: "number-line", template: "nl-place" },
  { lessonId: "amounts", template: "fo-amount" },
  { lessonId: "reasoning", template: "rs-claim" },
];

export const PLACEMENT_STOP_AFTER = 2;

export function placementOrder(seed: string | number): string[] {
  return PLACEMENT_PLAN.map((p) => `g:fractions.${p.template}:2:${hashString(`${seed}:${p.lessonId}`) % 1_000_000_000}`);
}

/** True once the learner has missed the last two questions in a row. */
export function placementShouldStop(answers: boolean[]): boolean {
  if (answers.length < PLACEMENT_STOP_AFTER) return false;
  return answers.slice(-PLACEMENT_STOP_AFTER).every((ok) => !ok);
}

/** Lessons to skip: every lesson answered correctly before the first mistake. */
export function placedOutLessons(answers: boolean[]): string[] {
  const firstWrong = answers.indexOf(false);
  const prefix = firstWrong === -1 ? answers.length : firstWrong;
  return PLACEMENT_PLAN.slice(0, prefix).map((p) => p.lessonId);
}
