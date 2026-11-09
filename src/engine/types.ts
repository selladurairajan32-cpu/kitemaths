export type SkillId = string;
export type MisconceptionId = string;

export type Phase =
  | "Understand"
  | "Visualise"
  | "Explore"
  | "Practise"
  | "Explain"
  | "Apply"
  | "Master";

export const PHASES: Phase[] = [
  "Understand",
  "Visualise",
  "Explore",
  "Practise",
  "Explain",
  "Apply",
  "Master",
];

export interface Skill {
  id: SkillId;
  title: string;
  description: string;
  lessonId: string;
}

export interface QuestionBase {
  id: string;
  skill: SkillId;
  difficulty: 1 | 2 | 3;
  prompt: string;
  hint: string;
  explanation: string;
}

export interface Evaluation {
  correct: boolean;
  misconceptions: MisconceptionId[];
  feedback?: string;
}

export type ResultContext = "lesson" | "practice" | "followup" | "assessment" | "recheck" | "placement";

export const INDEPENDENT_CONTEXTS: ResultContext[] = ["assessment", "recheck"];

/** One question episode: everything that happened from first view to final answer. */
export interface ItemResult {
  id?: string;
  questionId: string;
  skill: SkillId;
  context: ResultContext;
  difficulty?: number;
  correct: boolean;
  firstTry: boolean;
  attempts: number;
  hintsUsed: number;
  misconceptions: MisconceptionId[];
  /** For follow-up questions: the misconception the follow-up was checking. */
  targets?: MisconceptionId;
  at: number;
}

export interface MisconceptionDef {
  id: MisconceptionId;
  name: string;
  /** Child-facing, hedged description of what might have happened. */
  possibleCause: string;
  /** Parent-facing description used on the results screen. */
  description: string;
  explanation: string[];
  /** Other reasons the same answer can happen, so the signal stays "possible" (MIS-001 AC2). */
  alternatives?: string[];
  skills: SkillId[];
  followUps: string[];
}
