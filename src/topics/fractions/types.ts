import type { QuestionBase } from "@/engine/types";
import type { CompareSymbol, Fraction } from "./math";

export type Diagram =
  | { shape: "bar"; parts: number; shaded?: number[]; sizes?: number[] }
  | { shape: "circle"; parts: number; shaded?: number[]; sizes?: number[] }
  | { shape: "grid"; rows: number; cols: number; shaded?: number[] }
  | { shape: "line"; intervals: number; point?: number };

export interface FractionOption extends Fraction {
  misconception?: string;
}

export interface ChoiceOption {
  id: string;
  /** Text with optional inline fractions written as {n/d}. */
  label: string;
  diagram?: Diagram;
  misconception?: string;
}

export interface NumericTrap {
  value: number;
  misconception?: string;
  feedback: string;
}

export interface FrameSlotOption {
  id: string;
  label: string;
  misconception?: string;
}

/** A sentence frame for building an explanation: text pieces and choice slots. */
export type FramePart = string | { slot: string; options: FrameSlotOption[]; answer: string };

export type CounterexampleClaim = "bigger-denominator-is-smaller" | "bigger-numerator-is-bigger";

export type FractionQuestion = QuestionBase &
  (
    | {
        kind: "choose-fraction";
        diagram: Diagram;
        ask?: "shaded" | "unshaded";
        options: FractionOption[];
        answer: Fraction;
      }
    | {
        kind: "write-fraction";
        diagram: Diagram;
        ask?: "shaded" | "unshaded";
        answer: Fraction;
      }
    | {
        kind: "choose";
        diagram?: Diagram;
        options: ChoiceOption[];
        answer: string;
      }
    | { kind: "shade"; diagram: Diagram; target: Fraction }
    | {
        kind: "equal-parts";
        items: { id: string; diagram: Diagram }[];
        answer: string[];
      }
    | {
        kind: "match";
        rows: { id: string; diagram: Diagram; answer: Fraction }[];
        choices: Fraction[];
      }
    | {
        kind: "compare";
        left: Fraction;
        right: Fraction;
        showVisual?: boolean;
      }
    | {
        kind: "number-line-place";
        intervals: number;
        target: Fraction;
      }
    | {
        kind: "fraction-of";
        fraction: Fraction;
        amount: number;
        unit?: string;
        showCounters?: boolean;
        traps?: NumericTrap[];
      }
    | {
        kind: "missing-number";
        left: Fraction;
        right: { n?: number; d?: number };
      }
    | {
        kind: "number";
        diagram?: Diagram;
        answer: number;
        unit?: string;
        traps?: NumericTrap[];
      }
    | {
        kind: "explain-frame";
        diagram?: Diagram;
        frame: FramePart[];
      }
    | {
        kind: "counterexample";
        claim: CounterexampleClaim;
        maxDenominator: number;
      }
  );

export type QuestionKind = FractionQuestion["kind"];

export type Response =
  | { kind: "choose-fraction"; choice: Fraction }
  | { kind: "write-fraction"; value: Fraction }
  | { kind: "choose"; choice: string }
  | { kind: "shade"; shaded: number[] }
  | { kind: "equal-parts"; selected: string[] }
  | { kind: "match"; pairs: Record<string, Fraction | undefined> }
  | { kind: "compare"; symbol: CompareSymbol }
  | { kind: "number-line-place"; index: number }
  | { kind: "fraction-of"; value: number }
  | { kind: "missing-number"; value: number }
  | { kind: "number"; value: number }
  | { kind: "explain-frame"; slots: Record<string, string | undefined> }
  | { kind: "counterexample"; a: Fraction; b: Fraction };

export type VisualSpec =
  | { type: "diagram"; diagram: Diagram; caption?: string; countParts?: boolean | number[] }
  | { type: "everyday" }
  | { type: "split-demo" }
  | { type: "fair-unfair" }
  | { type: "anatomy"; fraction: Fraction }
  | { type: "compare-bars"; a: Fraction; b: Fraction }
  | { type: "wall"; denominators: number[]; highlight?: number[] }
  | { type: "equivalent-bars"; fractions: Fraction[] }
  | { type: "number-line"; intervals: number; point?: number; countGaps?: boolean }
  | {
      type: "counters";
      amount: number;
      groups: number;
      highlight: number;
    };

export function diagramParts(d: Diagram): number {
  switch (d.shape) {
    case "grid":
      return d.rows * d.cols;
    case "line":
      return d.intervals;
    default:
      return d.parts;
  }
}

export function diagramSizes(d: Diagram): number[] {
  if ((d.shape === "bar" || d.shape === "circle") && d.sizes) return d.sizes;
  return Array.from({ length: diagramParts(d) }, () => 1);
}
