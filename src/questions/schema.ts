/**
 * ARCH-002: the typed question schema. Spec: docs/product/architecture/ARCH-002-question-schema.md.
 *
 * A QuestionDefinition is plain JSON data (no functions, no UI types), so it can be stored, validated at runtime
 * (validate.ts) and authored outside code. Each interaction has its own answer, validation and scoring fields.
 * Existing question data is converted with the adapters in adapt.ts. Nothing in the app uses this yet (D-012):
 * wiring it in is later work.
 */

/** Curriculum level. Years must come from verified metadata; otherwise say so explicitly. */
export type Level = { years: number[] } | "unverified";

export interface Scoring {
  /** Marks for a fully correct answer: a positive integer. */
  marks: number;
  /** Only for interactions with several independent parts (multi-select, match, explain-frame). */
  partialCredit?: "none" | "per-part";
  /** A time limit, for timed practice such as MTC-style fluency. */
  timeLimitSeconds?: number;
}

export interface FractionValue {
  n: number;
  d: number;
}

/** A picture the question is about, when the maths depends on it. */
export type Model =
  | { kind: "partition"; shape: "bar" | "circle" | "grid"; parts: number; sizes?: number[]; shaded?: number[] }
  | { kind: "number-line"; min: 0; max: 1; intervals: number; point?: number }
  /** A picture whose maths is carried by the answer fields (for example a kit illustration); described, not modelled. */
  | { kind: "other"; description: string };

/** An answer option. A wrong option may name the misconception it suggests: that makes it a diagnostic distractor. */
export interface Option {
  id: string;
  /** Text with optional **bold** and {n/d} markup. */
  text: string;
  misconception?: string;
  feedback?: string;
  model?: Model;
}

export interface NumericTrap {
  value: number;
  misconception?: string;
  feedback?: string;
}

export interface FractionTrap {
  value: FractionValue;
  misconception?: string;
  feedback?: string;
}

/**
 * How a typed number is compared with the answer. Exact equality is the default; rounding and tolerance must be
 * stated explicitly, so approximate marking is never implied.
 */
export type NumericComparison = { kind: "exact" } | { kind: "round"; places: number } | { kind: "tolerance"; absolute: number };

export const INTERACTIONS = [
  "choose-one",
  "multi-select",
  "number-entry",
  "fraction-entry",
  "compare",
  "shade",
  "number-line-place",
  "match",
  "missing-number",
  "fraction-of",
  "explain-frame",
  "counterexample",
] as const;
export type Interaction = (typeof INTERACTIONS)[number];

/** Counterexample claims are named predicates with parameters, never code in the question data. */
export const COUNTEREXAMPLE_PREDICATES = ["bigger-denominator-is-smaller", "bigger-numerator-is-bigger"] as const;
export type CounterexamplePredicate = (typeof COUNTEREXAMPLE_PREDICATES)[number];

interface Common {
  id: string;
  skill: string;
  level: Level;
  difficulty: 1 | 2 | 3;
  prompt: string;
  /** Shown after the answer: why it is right. */
  explanation: string;
  /** The hint ladder, gentlest first. May be empty. */
  hints: string[];
  /** Misconception ids this question can diagnose (from its distractors and traps). */
  misconceptions: string[];
  scoring: Scoring;
  /** The picture the maths depends on, if any. */
  model?: Model;
}

export type QuestionDefinition = Common &
  (
    | { interaction: "choose-one"; options: Option[]; correctId: string; fixedOrder?: boolean }
    /** Right when the chosen ids are exactly `correctIds` (set semantics: order and duplicates don't matter). */
    | { interaction: "multi-select"; options: Option[]; correctIds: string[] }
    | {
        interaction: "number-entry";
        answer: number;
        validation: { comparison: NumericComparison; maxDecimals: number; allowNegative: boolean };
        unit?: string;
        traps?: NumericTrap[];
      }
    /** Fractions are compared exactly; `acceptEquivalent` says whether 2/4 counts for 1/2. */
    | { interaction: "fraction-entry"; answer: FractionValue; validation: { acceptEquivalent: boolean }; traps?: FractionTrap[] }
    | { interaction: "compare"; left: FractionValue; right: FractionValue; answer: "<" | "=" | ">" }
    | { interaction: "shade"; target: FractionValue; validation: { acceptEquivalent: boolean } }
    /** The child places `target` on a 0–1 line with `intervals` equal gaps; the right tick is target × intervals. */
    | { interaction: "number-line-place"; intervals: number; target: FractionValue }
    /** Right when every row is paired with its choice: `pairs` maps each row id to exactly one choice id. */
    | { interaction: "match"; rows: { id: string; text: string; model?: Model }[]; choices: { id: string; text: string }[]; pairs: Record<string, string> }
    /** left = right, with exactly one of right.n / right.d missing (null); `answer` fills it. */
    | { interaction: "missing-number"; left: FractionValue; right: { n: number | null; d: number | null }; answer: number }
    | { interaction: "fraction-of"; fraction: FractionValue; amount: number; answer: number; unit?: string; traps?: NumericTrap[] }
    /** Each slot is right when its chosen option id equals `answerId`. */
    | { interaction: "explain-frame"; frame: (string | { slot: string; options: Option[]; answerId: string })[] }
    /** The child gives two fractions that break the named claim, within the parameters. */
    | { interaction: "counterexample"; predicate: { id: CounterexamplePredicate; params: { maxDenominator: number } } }
  );

export type QuestionOf<I extends Interaction> = Extract<QuestionDefinition, { interaction: I }>;
