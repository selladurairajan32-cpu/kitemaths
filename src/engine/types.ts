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

/**
 * Where an answer was given. `timed` is the times-tables timed simulator (TT-009): it is kept out of skill mastery and
 * learning statistics, so speed is never read as understanding (TT-010, TT-011).
 */
export type ResultContext = "lesson" | "practice" | "followup" | "assessment" | "recheck" | "placement" | "timed";

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
  /** ARCH-005: the last answer the child submitted (the topic's own response object, JSON). Optional for older saves. */
  response?: unknown;
  /** ARCH-005: time from showing the question to finishing it, in milliseconds. Optional. */
  durationMs?: number;
  /** For follow-up questions: the misconception the follow-up was checking. */
  targets?: MisconceptionId;
  /** TT: the multiplication or division fact this answer was about (times-tables fact practice). Optional. */
  fact?: FactRef;
  /** TT-005: a wrong answer that looks like a typing slip (digits swapped, doubled or dropped), not a gap in recall. */
  slip?: boolean;
  /** TT-009: answered against the timed simulator's clock, so it is reported apart from untimed understanding (TT-011). */
  timed?: boolean;
  /** R3: a method-choice answer (MM-009 compare, MM-010 choose): the method picked and whether it was valid for the numbers. */
  strategy?: StrategyChoice;
  at: number;
}

/**
 * One times-table fact as asked: `a` is the table and `b` the multiplier (a × b = a·b). `form` says which number was
 * missing: the product (`mul`), a factor (`missing-factor`, a × ? = a·b), or one part of the division fact
 * (`div-quotient` a·b ÷ a = ?, `div-divisor` a·b ÷ ? = b, `div-dividend` ? ÷ a = b).
 */
/** MM-009, MM-010: which method a child picked for a problem, and how it was judged. */
export interface StrategyChoice {
  kind: "compare" | "choose";
  /** The catalogue id of the method picked ("standard" for the written method). */
  chosen: string;
  /** The method gives the right answer for these numbers. */
  valid: boolean;
  /** MM-010: the reason given was the right one for the method. */
  reasonRight?: boolean;
}

export type FactForm = "mul" | "missing-factor" | "div-quotient" | "div-divisor" | "div-dividend";
export interface FactRef {
  a: number;
  b: number;
  form: FactForm;
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
