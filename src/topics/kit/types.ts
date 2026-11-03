import type { QuestionBase, SkillId } from "@/engine/types";
import type { Lesson } from "@/lessons/types";
import type { IconName } from "@/components/paper/PaperIcon";

/**
 * The island kit: what a number island needs, so each new island is mostly content.
 * Two answer kinds (choose one option, type a number) and a shared set of maths pictures.
 */

/** Place-value column names, biggest first. */
export type PlaceColumn = "M" | "HTh" | "TTh" | "Th" | "H" | "T" | "O" | "t" | "h";

/** The kit's maths pictures. Every one is drawn, labelled and readable without colour. */
export type KitVisual =
  /** A place-value chart with one number's digits in its columns. `highlight` picks a column. */
  | { kind: "pv-chart"; value: number; columns: PlaceColumn[]; highlight?: PlaceColumn; hideDigits?: boolean }
  /** Base-ten blocks: hundreds squares, tens rods and ones cubes. */
  | { kind: "blocks"; hundreds: number; tens: number; ones: number }
  /** A number line with tick marks, labels, points and jumps. */
  | {
      kind: "line";
      min: number;
      max: number;
      step: number;
      /** Label every n-th tick (1 = every tick). */
      labelEvery?: number;
      points?: { value: number; label?: string; tone?: "brand" | "num" | "ok" }[];
      jumps?: { from: number; to: number; label?: string }[];
      /** Show a "?" over this value. */
      unknown?: number;
    }
  /** An array of dots in rows and columns. */
  | { kind: "array"; rows: number; cols: number }
  /** Equal groups of dots (for multiplying and sharing). */
  | { kind: "groups"; groups: number; each: number; label?: string }
  /** A bar model: a whole split into labelled parts. */
  | { kind: "bar"; parts: { label: string; size?: number; tone?: "brand" | "num" | "ok" | "plain" }[]; total?: string }
  /** A written column sum, with an optional blank answer row. */
  | { kind: "column"; op: "+" | "−"; a: number; b: number; result?: number }
  /** A thermometer from min to max, with the reading marked. */
  | { kind: "thermo"; min: number; max: number; value: number; step?: number }
  /** A times-table grid row: n × 1 … n × 12 with one gap. */
  | { kind: "times-row"; table: number; upTo: number; gap?: number };

export interface NumericTrap {
  value: number;
  misconception?: string;
  feedback: string;
}

export interface ChooseOption {
  /** Markup allowed: **bold** and {n/d}. */
  text: string;
  /** The misconception this wrong answer suggests. */
  misconception?: string;
  feedback?: string;
}

interface KitQuestionCommon extends QuestionBase {
  visual?: KitVisual;
}

export interface KitChooseQuestion extends KitQuestionCommon {
  kind: "choose";
  options: ChooseOption[];
  /** Index of the right option. */
  answer: number;
  /** Keep options in the given order (e.g. numbers in order, or "<, =, >"). */
  fixedOrder?: boolean;
}

export interface KitNumberQuestion extends KitQuestionCommon {
  kind: "number";
  answer: number;
  /** Shown beside the box: "cm", "°C", "£" (before) … */
  unit?: string;
  traps?: NumericTrap[];
  /** Allow a minus sign. */
  negative?: boolean;
}

export type KitQuestion = KitChooseQuestion | KitNumberQuestion;

export type KitResponse = { kind: "choose"; choice: number } | { kind: "number"; value: number | null };

export type Rng = () => number;
export type Difficulty = 1 | 2 | 3;

/** One question maker. Its questions get ids `g:<topic>.<key>:<difficulty>:<seed>`. */
export interface Template {
  key: string;
  skill: SkillId;
  difficulties: Difficulty[];
  make: (rng: Rng, base: { id: string; skill: SkillId; difficulty: Difficulty }) => Omit<KitQuestion, "id" | "skill" | "difficulty">;
}

export interface KitMisconception {
  id: string;
  name: string;
  possibleCause: string;
  description: string;
  explanation: string[];
  skills: SkillId[];
  /** Templates whose questions check this idea again. */
  followUpTemplates: string[];
}

export interface TopicSpec {
  id: string;
  title: string;
  subtitle: string;
  world: string;
  years: number[];
  order: number;
  icon: IconName;
  skills: { id: SkillId; title: string; description: string; lessonId: string }[];
  /** Lessons; check steps name a question with `gen(template, difficulty, seed)`. */
  lessons: Lesson<KitVisual>[];
  lessonIcons: Record<string, IconName>;
  templates: Template[];
  misconceptions: KitMisconception[];
  /** One warm-up question per lesson, in lesson order. */
  placement: { lessonId: string; template: string }[];
}
