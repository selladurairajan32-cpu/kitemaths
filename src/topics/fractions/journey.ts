import { activityProgress, isPracticeMilestoneMet, reviewSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import type { LearnerState } from "@/engine/progress";
import { PHASES, type Phase } from "@/engine/types";
import { FRACTIONS_TOPIC } from "./index";
import { LESSONS } from "./lessons";

export type PhaseStatus = "done" | "current" | "todo";

export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  Understand: "Meet the big idea in everyday language.",
  Visualise: "See fractions as pictures, bars and number lines.",
  Explore: "Build, compare and transform fractions in the lab.",
  Practise: "Strengthen each skill with adaptive practice.",
  Explain: "Build explanations and find counterexamples.",
  Apply: "Use fractions to solve real problems.",
  Master: "Show what you know independently — and fix anything that needs review.",
};

function phaseDone(phase: Phase, state: LearnerState): boolean {
  switch (phase) {
    case "Practise":
      return isPracticeMilestoneMet(FRACTIONS_TOPIC, state);
    case "Explain": {
      const lessonsDone = LESSONS.filter((l) => l.phase === "Explain").every((l) => state.lessons[l.id]?.completed);
      const m = skillMastery("reasoning", state.results);
      return lessonsDone && (m.learningSecure || m.status === "mastered" || m.status === "passed-check");
    }
    case "Master":
      return !!state.assessment.last && reviewSkills(FRACTIONS_TOPIC, state).length === 0;
    default: {
      const lessons = LESSONS.filter((l) => l.phase === phase);
      return lessons.length > 0 && lessons.every((l) => state.lessons[l.id]?.completed);
    }
  }
}

export function phaseStatuses(state: LearnerState): { phase: Phase; status: PhaseStatus }[] {
  let currentAssigned = false;
  return PHASES.map((phase) => {
    if (phaseDone(phase, state)) return { phase, status: "done" as const };
    if (!currentAssigned) {
      currentAssigned = true;
      return { phase, status: "current" as const };
    }
    return { phase, status: "todo" as const };
  });
}

export function topicProgress(state: LearnerState): number {
  return activityProgress(FRACTIONS_TOPIC, state);
}

export interface LearningStats {
  learningAnswered: number;
  firstTryRate: number | null;
  hintsUsed: number;
}

export function learningStats(state: LearnerState): LearningStats {
  const scored = state.results.filter((r) => r.context === "practice" || r.context === "lesson");
  return {
    learningAnswered: scored.length,
    firstTryRate: scored.length ? scored.filter((r) => r.firstTry).length / scored.length : null,
    hintsUsed: scored.reduce((n, r) => n + r.hintsUsed, 0),
  };
}

export function firstTryRate(state: LearnerState): number | null {
  return learningStats(state).firstTryRate;
}
