import type { QuestionBase, SkillId } from "@/engine/types";
import type { Lesson } from "@/lessons/types";
import type { IconName } from "@/components/paper/PaperIcon";

/**
 * The island kit: what a number island needs, so each new island is mostly content.
 * Two answer kinds (choose one option, type a number) and a shared set of maths pictures.
 */

/** Place-value column names, biggest first (defined with the place-value maths, ARCH-003). */
export type { PlaceColumn } from "@/maths/place-value";
import type { PlaceColumn } from "@/maths/place-value";

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
      /** Write these labels (like times: "2:45") instead of the numbers. */
      labels?: { value: number; text: string }[];
    }
  /** An array of dots in rows and columns. */
  | { kind: "array"; rows: number; cols: number }
  /** Equal groups of dots (for multiplying and sharing). */
  | { kind: "groups"; groups: number; each: number; label?: string }
  /** A bar model: a whole split into labelled parts. */
  | { kind: "bar"; parts: { label: string; size?: number; tone?: "brand" | "num" | "ok" | "plain" }[]; total?: string; note?: string }
  /** A written column sum, with an optional blank answer row. */
  | { kind: "column"; op: "+" | "−"; a: number; b: number; result?: number }
  /** A thermometer from min to max, with the reading marked. */
  | { kind: "thermo"; min: number; max: number; value: number; step?: number }
  /** A times-table grid row: n × 1 … n × 12 with one gap. */
  | { kind: "times-row"; table: number; upTo: number; gap?: number }
  /** Fraction pictures: one or more wholes, each split into equal parts, some shaded. */
  | { kind: "fraction"; parts: number; shaded: number; wholes?: number; shape?: "bar" | "circle"; label?: string }
  /** A 100 square (10 × 10) with some squares shaded: tenths, hundredths and per cent. */
  | { kind: "grid100"; shaded: number }
  /** An analogue clock. Hours may be 0–23; the face shows them on 12. `digital` adds the time in digits. */
  | { kind: "clock"; hours: number; minutes: number; digital?: boolean }
  /** Coins and notes, each in pence: 1, 2, 5, 10, 20, 50, 100, 200 are coins; 500, 1000, 2000 are notes. */
  | { kind: "coins"; pence: number[] }
  /**
   * A rectangle w × h, or an L-shape with a cut.w × cut.h corner taken from the top right.
   * `grid` draws the unit squares; `labels` writes side lengths (L-shapes also have innerV and innerH).
   */
  | { kind: "rect"; w: number; h: number; cut?: { w: number; h: number }; grid?: boolean; labels?: Partial<Record<RectSide, string>> }
  | ShapeVisualSpec;

export type RectSide = "top" | "right" | "bottom" | "left" | "innerV" | "innerH";

/** Shape Shores pictures: angles, shapes, coordinate grids, charts and tables. */
export type ShapeVisualSpec =
  /** One angle, drawn true to size from a flat arm, with an arc (a square for a right angle). */
  | { kind: "angle"; degrees: number; label?: string }
  /** Angles meeting at a point: on a straight line (parts add to 180) or all the way round (360). */
  | { kind: "angle-split"; parts: number[]; labels: string[] }
  /** A triangle drawn with these angles at the left, right and top corners, each labelled. */
  | { kind: "triangle"; angles: [number, number, number]; labels: [string, string, string] }
  /** A named 2D shape. */
  | { kind: "shape"; name: ShapeName }
  /** A coordinate grid from min to max on both axes, with lettered points (joined up if `join`). */
  | { kind: "coords"; min: number; max: number; points: { x: number; y: number; label?: string }[]; join?: boolean }
  /** A bar chart with a scale going up in `step`s. */
  | { kind: "barchart"; bars: { label: string; value: number }[]; max: number; step: number; axis?: string }
  /** A pictogram: each icon is worth `key`; half an icon is half that. */
  | { kind: "pictogram"; rows: { label: string; value: number }[]; key: number; keyLabel: string }
  /** A table with a header row. */
  | { kind: "table"; head: string[]; rows: string[][] }
  /** A line graph. */
  | { kind: "linegraph"; points: { label: string; value: number }[]; min: number; max: number; step: number; axis?: string };

export type ShapeName =
  | "square"
  | "rectangle"
  | "equilateral"
  | "right-triangle"
  | "isosceles"
  | "scalene"
  | "rhombus"
  | "parallelogram"
  | "trapezium"
  | "kite"
  | "pentagon"
  | "hexagon"
  | "octagon"
  | "circle";

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
  /** EXAM-003: the island skill a borrowed mock question came from, so it can be tagged by curriculum skill. */
  origin?: SkillId;
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
  /** Allow a decimal point, with up to this many decimal places. */
  decimals?: number;
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

/**
 * Extra fields of a kit lab step: which animated explainer to show (a name in `kit/explainers.tsx`), its numbers, and
 * the challenge ids that finish it (ANIM-001).
 */
export interface KitLab {
  explainer: string;
  numbers: number[];
  challenges: string[];
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
  lessons: Lesson<KitVisual, KitLab>[];
  lessonIcons: Record<string, IconName>;
  templates: Template[];
  misconceptions: KitMisconception[];
  /** One warm-up question per lesson, in lesson order. */
  placement: { lessonId: string; template: string }[];
}
