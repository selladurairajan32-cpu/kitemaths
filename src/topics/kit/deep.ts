import type { SkillId } from "@/engine/types";

/**
 * D-055: a "deep" sub-topic for the topic learning page, written to grammar-school (11+) and GCSE Foundation standard.
 * Pure data: the study screen draws it. Text uses the kit's markup: **bold** and {n/d}.
 *
 * Pages: the big idea (an animated diagram, step by step), the method and why it works, worked examples from core to
 * GCSE, common mistakes, an exercise of exam-standard questions, and what to remember.
 */

export type Tone = "num" | "den" | "ok" | "sun";

/**
 * Diagrams the explainer animates between. Consecutive scenes of the same kind morph: cuts draw in, pieces fill.
 * - area: a rectangle in `cols` columns and `rows` rows. The first `colShade` columns are shaded one colour, the first
 *   `rowShade` rows another; where both meet is the overlap (multiplying).
 * - bars: fraction bars one above another, each `parts` pieces with runs of shading, and `coarse` thick lines that show
 *   the original cut before it was split.
 */
export type Diagram =
  | { kind: "area"; cols: number; rows: number; colShade: number; rowShade?: number; colLabel?: string; rowLabel?: string; readout?: string }
  | { kind: "bars"; bars: { parts: number; fill: { count: number; tone: Tone }[]; coarse?: number; label: string }[] };

export interface Scene {
  diagram: Diagram;
  /** What the step says, under the picture. */
  caption: string;
}

export type Level = "Core" | "11+" | "GCSE";

export interface WorkedExample {
  level: Level;
  problem: string;
  steps: string[];
  answer: string;
}

export interface Mistake {
  wrong: string;
  right: string;
  why: string;
}

export interface DeepLesson {
  lessonId: string;
  skill: SkillId;
  /** A real question the sub-topic answers, asked at the start and answered by the end. */
  hook: string;
  scenes: Scene[];
  why: string[];
  method: string[];
  keyIdea: string;
  examples: WorkedExample[];
  mistakes: Mistake[];
  /** Question ids for the exercise, easiest first. */
  exercise: string[];
  remember: string[];
  /** The answer to the hook, shown on the last page. */
  hookAnswer: string;
}
