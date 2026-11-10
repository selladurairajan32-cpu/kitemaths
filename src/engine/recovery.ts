import type { Evaluation, MisconceptionId } from "./types";

/**
 * Misconception recovery flow for a single question.
 *
 * answering ──correct──→ correct
 *     │ wrong (attempt < max)
 *     ├─ misconception suspected ─→ diagnose ─→ followup ─→ followup-review ─→ answering
 *     └─ no clear cause ──────────→ answering again, with the hint shown inline
 *     │ wrong (attempt = max) ────→ revealed
 */
export type RecoveryStage =
  | "answering"
  | "diagnose"
  | "followup"
  | "followup-review"
  | "correct"
  | "revealed";

export interface RecoveryState {
  stage: RecoveryStage;
  attempts: number;
  hintsUsed: number;
  hintVisible: boolean;
  /** How many hints are showing (D-037: hints fade in one at a time). */
  hintLevel: number;
  retrying: boolean;
  misconceptions: MisconceptionId[];
  suspected: MisconceptionId[];
  followUpId: string | null;
  followUpCorrect: boolean | null;
  lastFeedback?: string;
}

export type RecoveryEvent =
  | { type: "submit"; evaluation: Evaluation }
  | { type: "continue" }
  | { type: "followup-submit"; evaluation: Evaluation }
  | { type: "request-hint" }
  /** Show the next, more helpful hint. The player offers it only while more remain. */
  | { type: "more-hint" };

export interface RecoveryOptions {
  maxAttempts?: number;
  /**
   * FR-010: show the hint automatically after an unexplained wrong answer. Off once the child has shown the skill is
   * secure, so support fades; the hint can always be requested.
   */
  autoHint?: boolean;
  followUpFor: (suspected: MisconceptionId[]) => string | null;
}

export const initialRecovery: RecoveryState = {
  stage: "answering",
  attempts: 0,
  hintsUsed: 0,
  hintVisible: false,
  hintLevel: 0,
  retrying: false,
  misconceptions: [],
  suspected: [],
  followUpId: null,
  followUpCorrect: null,
};

export function recoveryReducer(state: RecoveryState, event: RecoveryEvent, options: RecoveryOptions): RecoveryState {
  const maxAttempts = options.maxAttempts ?? 2;

  switch (event.type) {
    case "request-hint": {
      if (state.stage !== "answering" || state.hintVisible) return state;
      return { ...state, hintVisible: true, hintLevel: 1, hintsUsed: state.hintsUsed + 1 };
    }
    case "more-hint": {
      if (state.stage !== "answering" || !state.hintVisible) return state;
      return { ...state, hintLevel: state.hintLevel + 1, hintsUsed: state.hintsUsed + 1 };
    }
    case "submit": {
      if (state.stage !== "answering") return state;
      const attempts = state.attempts + 1;
      const { evaluation } = event;
      if (evaluation.correct) {
        return { ...state, attempts, stage: "correct", retrying: false, lastFeedback: evaluation.feedback };
      }
      const misconceptions = unique([...state.misconceptions, ...evaluation.misconceptions]);
      const base = {
        ...state,
        attempts,
        misconceptions,
        suspected: evaluation.misconceptions,
        lastFeedback: evaluation.feedback,
      };
      if (attempts >= maxAttempts) return { ...base, stage: "revealed", retrying: false };
      if (evaluation.misconceptions.length) {
        return {
          ...base,
          stage: "diagnose",
          hintsUsed: state.hintsUsed + 1,
          followUpId: options.followUpFor(evaluation.misconceptions),
          followUpCorrect: null,
        };
      }
      if (options.autoHint === false) return { ...base, stage: "answering", retrying: true };
      return {
        ...base,
        stage: "answering",
        retrying: true,
        hintVisible: true,
        hintLevel: Math.max(state.hintLevel, 1),
        hintsUsed: state.hintVisible ? state.hintsUsed : state.hintsUsed + 1,
      };
    }
    case "continue": {
      if (state.stage === "diagnose") {
        return state.followUpId
          ? { ...state, stage: "followup" }
          : { ...state, stage: "answering", retrying: true };
      }
      if (state.stage === "followup-review") return { ...state, stage: "answering", retrying: true };
      return state;
    }
    case "followup-submit": {
      if (state.stage !== "followup") return state;
      return { ...state, stage: "followup-review", followUpCorrect: event.evaluation.correct };
    }
  }
}

export function isFinished(state: RecoveryState): boolean {
  return state.stage === "correct" || state.stage === "revealed";
}

export function recoverySummary(state: RecoveryState) {
  return {
    correct: state.stage === "correct",
    firstTry: state.stage === "correct" && state.attempts === 1 && state.hintsUsed === 0,
    attempts: state.attempts,
    hintsUsed: state.hintsUsed,
    misconceptions: state.misconceptions,
  };
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
