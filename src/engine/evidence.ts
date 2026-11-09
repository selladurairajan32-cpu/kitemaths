import { skillMastery, type SkillStatus } from "./mastery";
import type { TopicLearner } from "./progress";
import type { ItemResult, SkillId } from "./types";

/**
 * Lesson evidence and prerequisites (CUR-002 §3–§5, FR-011, RC-009). Pure.
 *
 * Four ideas stay separate:
 * - activity completed: the child reached the end of the lesson (the lesson's `completed` flag, used for stars);
 * - supported evidence: right with help;
 * - independent evidence: right first time, no hint, not revealed (`isIndependentEvidence`);
 * - skill mastery: owned by `mastery.ts` (MAST-001). Lesson evidence never awards mastery.
 */

/** The shape of a lesson the engine needs. Steps are read structurally so the engine doesn't depend on `src/lessons`. */
export interface EvidenceLesson {
  id: string;
  steps: readonly unknown[];
}

export interface EvidenceTopic {
  skills: readonly { id: SkillId; title: string; lessonId: string }[];
  lessons: readonly EvidenceLesson[];
  /** Skill → skills that should be satisfied first (CUR-002 §2). Optional: islands without a graph have none. */
  skillPrerequisites?: Readonly<Record<SkillId, readonly SkillId[]>>;
}

export type LessonEvidenceStatus =
  /** Nothing done yet. */
  | "not-started"
  /** Started, not finished. */
  | "in-progress"
  /** Finished (activity), but the evidence questions were not all answered independently. */
  | "needs-evidence"
  /** Independent evidence exists for the lesson's skill (§4.2). */
  | "evidenced"
  /** A later independent check found the skill needs review; this overrides earlier evidence (§4.4). */
  | "needs-review";

export type EvidenceSource = "lesson-check" | "practice" | "skill-status" | "placement";

export interface LessonEvidence {
  lessonId: string;
  skill: SkillId | null;
  status: LessonEvidenceStatus;
  /** How the evidence was obtained, when evidenced. */
  via: EvidenceSource | null;
  activityCompleted: boolean;
  /** The lesson's evidence questions (its final checks). Empty for a lesson without checks, such as the lab. */
  evidenceQuestions: string[];
}

/** Right first time, no hint, one attempt (CUR-002 §4.1). A revealed answer is never right first time. */
export function isIndependentEvidence(r: ItemResult): boolean {
  return r.correct && r.firstTry && r.attempts <= 1 && r.hintsUsed === 0;
}

/**
 * A lesson's evidence questions: the `check` steps after its last teaching step (CUR-002 §4.2, "its final independent
 * questions"). A lesson that ends with teaching has none.
 */
export function evidenceQuestionIds(lesson: EvidenceLesson): string[] {
  const steps = lesson.steps.map((s) => (typeof s === "object" && s !== null ? (s as { type?: unknown; questionId?: unknown }) : {}));
  let last = -1;
  steps.forEach((s, i) => {
    if (s.type !== "check") last = i;
  });
  return steps
    .slice(last + 1)
    .filter((s) => s.type === "check" && typeof s.questionId === "string")
    .map((s) => s.questionId as string);
}

const SATISFYING: SkillStatus[] = ["secure", "passed-check", "mastered"];

export function lessonEvidence(topic: EvidenceTopic, state: TopicLearner, lessonId: string): LessonEvidence {
  const lesson = topic.lessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error(`No lesson ${lessonId}`);
  const skill = topic.skills.find((s) => s.lessonId === lessonId)?.id ?? null;
  const progress = state.lessons[lessonId];
  const activityCompleted = !!progress?.completed;
  const evidenceQuestions = evidenceQuestionIds(lesson);
  const base = { lessonId, skill, activityCompleted, evidenceQuestions };

  const mastery = skill ? skillMastery(skill, state.results) : null;
  if (mastery?.status === "needs-review") return { ...base, status: "needs-review", via: null };

  const via = evidenceSource(state, lessonId, skill, evidenceQuestions, mastery?.status ?? null);
  if (via) return { ...base, status: "evidenced", via };
  if (activityCompleted) return { ...base, status: "needs-evidence", via: null };
  if ((progress?.furthestStep ?? 0) > 0) return { ...base, status: "in-progress", via: null };
  return { ...base, status: "not-started", via: null };
}

function evidenceSource(
  state: TopicLearner,
  lessonId: string,
  skill: SkillId | null,
  questions: string[],
  status: SkillStatus | null,
): EvidenceSource | null {
  if (state.lessons[lessonId]?.placedOut) return "placement";
  if (questions.length > 0) {
    const lessonResults = state.results.filter((r) => r.context === "lesson");
    if (questions.every((q) => lessonResults.some((r) => r.questionId === q && isIndependentEvidence(r)))) return "lesson-check";
  }
  if (status && SATISFYING.includes(status)) return "skill-status";
  // A fresh unassisted practice question on the skill (a transfer item) also counts (§4.1, §5.1).
  if (skill && state.results.some((r) => r.skill === skill && r.context === "practice" && isIndependentEvidence(r))) return "practice";
  return null;
}

export function allLessonEvidence(topic: EvidenceTopic, state: TopicLearner): LessonEvidence[] {
  return topic.lessons.map((l) => lessonEvidence(topic, state, l.id));
}

/**
 * Whether a prerequisite skill is satisfied (CUR-002 §3.2, RC-009): its status is secure, passed check or mastered, or
 * its lesson is evidenced, or it was placed out, and it is not marked needs review. Skills from other islands are
 * judged by their status alone.
 */
export function prerequisiteSatisfied(topic: EvidenceTopic, state: TopicLearner, skill: SkillId): boolean {
  const status = skillMastery(skill, state.results).status;
  if (status === "needs-review") return false;
  if (SATISFYING.includes(status)) return true;
  const own = topic.skills.find((s) => s.id === skill);
  return own ? lessonEvidence(topic, state, own.lessonId).status === "evidenced" : false;
}

/** The prerequisites of a lesson's skill that are not yet satisfied, in graph order. */
export function unmetPrerequisites(topic: EvidenceTopic, state: TopicLearner, lessonId: string): SkillId[] {
  const skill = topic.skills.find((s) => s.lessonId === lessonId)?.id;
  if (!skill) return [];
  return (topic.skillPrerequisites?.[skill] ?? []).filter((p) => !prerequisiteSatisfied(topic, state, p));
}
