import { allLessonEvidence, lessonEvidence, unmetPrerequisites } from "./evidence";
import { readyForRecheck, skillMastery } from "./mastery";
import type { TopicLearner } from "./progress";
import { PHASES, type ItemResult, type MisconceptionDef, type Phase, type QuestionBase, type Skill, type SkillId } from "./types";

export interface LessonSummary {
  id: string;
  title: string;
  phase: Phase;
  summary: string;
  minutes: number;
  steps: unknown[];
}

/** Everything the teaching engine needs to know about a topic. */
export interface TopicDefinition<Q extends QuestionBase = QuestionBase> {
  id: string;
  title: string;
  subtitle: string;
  skills: Skill[];
  lessons: LessonSummary[];
  practiceQuestions: Q[];
  assessmentQuestions: Q[];
  misconceptions: MisconceptionDef[];
  questionById: (id: string) => Q;
  /** Skill → skills that should be satisfied first (CUR-002 §2). Only islands with a skill graph set it. */
  skillPrerequisites?: Readonly<Record<SkillId, readonly SkillId[]>>;
}

export const PRACTICE_READY_RESULTS = 8;

type RecommendationBody =
  | { kind: "lesson"; lessonId: string; resume: boolean; title: string; reason: string }
  | { kind: "practice"; focusSkill: SkillId | null; title: string; reason: string }
  | { kind: "assessment"; resume: boolean; title: string; reason: string }
  | { kind: "recheck"; skill: SkillId; resume: boolean; title: string; reason: string }
  | { kind: "results"; title: string; reason: string };

/** What to do next, and in which topic. */
export type Recommendation = RecommendationBody & { topicId: string };

export function lessonsCompleted(topic: TopicDefinition, state: TopicLearner): number {
  return topic.lessons.filter((l) => state.lessons[l.id]?.completed).length;
}

/** Lessons with independent evidence (CUR-002 §4.2). This, not reaching the end, is what "completed" means (FR-011 AC3). */
export function lessonsEvidenced(topic: TopicDefinition, state: TopicLearner): number {
  return allLessonEvidence(topic, state).filter((e) => e.status === "evidenced").length;
}

export function strongSkills(topic: TopicDefinition, state: TopicLearner): SkillId[] {
  return topic.skills
    .map((s) => skillMastery(s.id, state.results))
    .filter((m) => m.learningSecure)
    .map((m) => m.skill);
}

export function masteredSkills(topic: TopicDefinition, state: TopicLearner): SkillId[] {
  return topic.skills
    .map((s) => skillMastery(s.id, state.results))
    .filter((m) => m.status === "mastered")
    .map((m) => m.skill);
}

export function reviewSkills(topic: TopicDefinition, state: TopicLearner): SkillId[] {
  return topic.skills
    .map((s) => skillMastery(s.id, state.results))
    .filter((m) => m.status === "needs-review")
    .map((m) => m.skill);
}

/** This topic's results only: the learner's results cover every topic. */
export function topicResults(topic: TopicDefinition, results: ItemResult[]): ItemResult[] {
  const skills = new Set(topic.skills.map((s) => s.id));
  return results.filter((r) => skills.has(r.skill));
}

export function practiceResultsCount(topic: TopicDefinition, state: TopicLearner): number {
  return topicResults(topic, state.results).filter((r) => r.context === "practice").length;
}

export function isPracticeMilestoneMet(topic: TopicDefinition, state: TopicLearner): boolean {
  return (
    practiceResultsCount(topic, state) >= PRACTICE_READY_RESULTS &&
    strongSkills(topic, state).length >= Math.ceil(topic.skills.length / 2)
  );
}

export function activityProgress(topic: TopicDefinition, state: TopicLearner): number {
  const total = topic.lessons.length + 2;
  const done =
    lessonsCompleted(topic, state) +
    (isPracticeMilestoneMet(topic, state) ? 1 : 0) +
    (state.assessment.last ? 1 : 0);
  return done / total;
}

export function recommendNext(topic: TopicDefinition, state: TopicLearner): Recommendation {
  return { ...recommendInTopic(topic, state), topicId: topic.id };
}

function recommendInTopic(topic: TopicDefinition, state: TopicLearner): RecommendationBody {
  const skillTitle = (id: SkillId) => topic.skills.find((s) => s.id === id)?.title ?? id;

  if (state.recheck) {
    return {
      kind: "recheck",
      skill: state.recheck.skill,
      resume: true,
      title: `Finish your recheck: ${skillTitle(state.recheck.skill)}`,
      reason: "You started a short recheck — finish it to update this skill.",
    };
  }

  // CUR-002 §5 rule 1: an assessment in progress is resumed before anything else.
  if (state.assessment.status === "in-progress") {
    return {
      kind: "assessment",
      resume: true,
      title: "Finish your mastery check",
      reason: "You've started the mastery check — your answers so far are saved.",
    };
  }

  // Rule 2: a skill needing review comes before new lessons (§4.4). Handled with the post-check rules below.
  const anyReview = state.assessment.last && topic.skills.some((s) => skillMastery(s.id, state.results).status === "needs-review");

  // Rule 3: the first lesson, in island order, without independent evidence.
  const next = anyReview ? undefined : allLessonEvidence(topic, state).find((e) => e.status !== "evidenced");
  if (next) {
    const lesson = topic.lessons.find((l) => l.id === next.lessonId)!;
    if (next.status === "needs-evidence" && next.skill) {
      // 3b: the activity is done but evidence is missing → targeted practice on that skill, not the lesson again.
      return {
        kind: "practice",
        focusSkill: next.skill,
        title: `Practise: ${skillTitle(next.skill)}`,
        reason: "You've finished the lesson. Now show you can do it on your own: answer a few new questions first time, without a hint.",
      };
    }
    const started = next.status === "in-progress";
    const unmet = unmetPrerequisites(topic, state, lesson.id).filter((p) => topic.skills.some((s) => s.id === p));
    return {
      kind: "lesson",
      lessonId: lesson.id,
      resume: started,
      title: lesson.title,
      reason: started
        ? "Pick up where you left off."
        : unmet.length
          ? `Best after “${skillTitle(unmet[0])}”, which this lesson builds on. You can start it now, and practise that skill too.`
          : "Each lesson builds on the one before, so this is the best next step.",
    };
  }

  if (!state.assessment.last) {
    if (!isPracticeMilestoneMet(topic, state)) {
      const weakest = topic.skills.map((s) => skillMastery(s.id, state.results)).find((m) => !m.learningSecure);
      return {
        kind: "practice",
        focusSkill: null,
        title: "Practise all the skills",
        reason: weakest
          ? `Lessons complete! Practice will strengthen skills such as “${skillTitle(weakest.skill)}”.`
          : "Lessons complete! A short practice will get you ready for the mastery check.",
      };
    }
    return {
      kind: "assessment",
      resume: false,
      title: "Take the mastery check",
      reason: "Your practice shows you're ready to show what you know on your own.",
    };
  }

  const mastery = topic.skills.map((s) => skillMastery(s.id, state.results));
  const review = mastery.find((m) => m.status === "needs-review");
  if (review) {
    const ready = readyForRecheck(review);
    return ready
      ? {
          kind: "recheck",
          skill: review.skill,
          resume: false,
          title: `Recheck: ${skillTitle(review.skill)}`,
          reason: "Your practice since the check looks strong. A short independent recheck will confirm it.",
        }
      : {
          kind: "practice",
          focusSkill: review.skill,
          title: `Practise: ${skillTitle(review.skill)}`,
          reason: "The mastery check showed this skill needs another look. Practise it, then take a short recheck.",
        };
  }

  const toConfirm = mastery.find((m) => m.status === "passed-check" && !m.learningSecure);
  if (toConfirm) {
    return {
      kind: "practice",
      focusSkill: toConfirm.skill,
      title: `Strengthen: ${skillTitle(toConfirm.skill)}`,
      reason: "You got this right in the check. A little more practice will confirm it is secure.",
    };
  }

  return {
    kind: "results",
    title: "Review your mastery results",
    reason: "Your latest evidence is strong across the module. See what you've achieved.",
  };
}

export type PhaseStatus = "done" | "current" | "todo";

function phaseDone(topic: TopicDefinition, phase: Phase, state: TopicLearner): boolean {
  switch (phase) {
    case "Practise":
      return isPracticeMilestoneMet(topic, state);
    case "Master":
      return !!state.assessment.last && reviewSkills(topic, state).length === 0;
    default: {
      const lessons = topic.lessons.filter((l) => l.phase === phase);
      return lessons.length > 0 && lessons.every((l) => lessonEvidence(topic, state, l.id).status === "evidenced");
    }
  }
}

/** Understand → … → Master, with the first unfinished phase marked current. */
export function phaseStatuses(topic: TopicDefinition, state: TopicLearner): { phase: Phase; status: PhaseStatus }[] {
  let currentAssigned = false;
  return PHASES.map((phase) => {
    if (phaseDone(topic, phase, state)) return { phase, status: "done" as const };
    if (!currentAssigned) {
      currentAssigned = true;
      return { phase, status: "current" as const };
    }
    return { phase, status: "todo" as const };
  });
}

export interface LearningStats {
  learningAnswered: number;
  firstTryRate: number | null;
  hintsUsed: number;
}

/** Lesson and practice answers in this topic. */
export function learningStats(topic: TopicDefinition, state: TopicLearner): LearningStats {
  const scored = topicResults(topic, state.results).filter((r) => r.context === "practice" || r.context === "lesson");
  return {
    learningAnswered: scored.length,
    firstTryRate: scored.length ? scored.filter((r) => r.firstTry).length / scored.length : null,
    hintsUsed: scored.reduce((n, r) => n + r.hintsUsed, 0),
  };
}
