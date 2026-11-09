import { LAB_LIMITS, type LabSnapshot } from "./lab";
import type { Fraction } from "./math";

/**
 * LAB-001: one mathematical state for the Fraction Lab. Every number, picture and label on screen is derived from it
 * by `labSnapshot`, so no separately editable value can disagree with the model. Pure: no React, no browser.
 */

export type LabShape = "bar" | "circle";

/** One partitioned model: how many equal parts, and which are shaded. */
export interface PartModel {
  parts: number;
  shaded: readonly number[];
}

export interface LabState {
  /** The build model. Switching between bar and circle keeps the same fraction (LAB-004 AC3). */
  build: PartModel;
  shape: LabShape;
  compareTop: PartModel;
  compareBottom: PartModel;
  /** Equivalence: a base fraction, and how many pieces each part is split into. */
  base: Fraction;
  split: number;
  /** The number-line model (LAB-006): equal intervals from 0 to 1, and the marker's mark (1 to `intervals`). */
  line: { intervals: number; marker: number };
}

export type ModelId = "build" | "compareTop" | "compareBottom";

export type LabAction =
  | { type: "set-parts"; model: ModelId; parts: number }
  | { type: "toggle"; model: ModelId; index: number }
  | { type: "shade-all"; model: ModelId }
  | { type: "clear"; model: ModelId }
  | { type: "set-shape"; shape: LabShape }
  | { type: "set-base"; base: Fraction }
  | { type: "set-split"; split: number }
  | { type: "set-intervals"; intervals: number }
  | { type: "move-marker"; to: number };

/** Denominators the lab can draw with geometrically equal parts (LAB-002). */
export const SUPPORTED_PARTS = Array.from({ length: LAB_LIMITS.maxParts - LAB_LIMITS.minParts + 1 }, (_, i) => i + LAB_LIMITS.minParts);
export const EQUIVALENT_MAX_PARTS = 6;
export const LINE_MAX_INTERVALS = 12;

export function isSupportedParts(parts: number): boolean {
  return Number.isInteger(parts) && parts >= LAB_LIMITS.minParts && parts <= LAB_LIMITS.maxParts;
}

export const INITIAL_LAB: LabState = {
  build: { parts: 4, shaded: [] },
  shape: "bar",
  compareTop: { parts: 2, shaded: [0] },
  compareBottom: { parts: 4, shaded: [0] },
  base: { n: 1, d: 2 },
  split: 1,
  line: { intervals: 4, marker: 1 },
};

function resize(m: PartModel, parts: number): PartModel {
  return { parts, shaded: m.shaded.filter((i) => i < parts) };
}

function toggle(m: PartModel, index: number): PartModel {
  if (!Number.isInteger(index) || index < 0 || index >= m.parts) return m;
  return { ...m, shaded: m.shaded.includes(index) ? m.shaded.filter((x) => x !== index) : [...m.shaded, index].sort((a, b) => a - b) };
}

/**
 * Applies one change. Unsupported values are refused (the state is returned unchanged) rather than approximated
 * (LAB-002 AC3).
 */
export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "set-parts":
      return isSupportedParts(action.parts) ? { ...state, [action.model]: resize(state[action.model], action.parts) } : state;
    case "toggle": {
      const next = toggle(state[action.model], action.index);
      return next === state[action.model] ? state : { ...state, [action.model]: next };
    }
    case "shade-all":
      return { ...state, [action.model]: { ...state[action.model], shaded: Array.from({ length: state[action.model].parts }, (_, i) => i) } };
    case "clear":
      return { ...state, [action.model]: { ...state[action.model], shaded: [] } };
    case "set-shape":
      return { ...state, shape: action.shape };
    case "set-base": {
      const { n, d } = action.base;
      if (!Number.isInteger(n) || !Number.isInteger(d) || d < 1 || d > EQUIVALENT_MAX_PARTS || n < 0) return state;
      return { ...state, base: { n: Math.min(n, d), d } };
    }
    case "set-split":
      return Number.isInteger(action.split) && action.split >= 1 && action.split <= LAB_LIMITS.maxSplit ? { ...state, split: action.split } : state;
    case "set-intervals": {
      const k = action.intervals;
      if (!Number.isInteger(k) || k < 1 || k > LINE_MAX_INTERVALS) return state;
      // Keep the marker at the same value where it still lands on a tick; otherwise move it to the nearest tick below.
      const marker = Math.max(1, Math.floor((state.line.marker * k) / state.line.intervals));
      return { ...state, line: { intervals: k, marker } };
    }
    case "move-marker": {
      // Snapping: the marker only ever sits on a mark after 0, up to 1 (LAB-006 AC2).
      const to = Math.round(action.to);
      return Number.isFinite(action.to) ? { ...state, line: { ...state.line, marker: Math.max(1, Math.min(state.line.intervals, to)) } } : state;
    }
  }
}

const fractionOf = (m: PartModel): Fraction => ({ n: m.shaded.length, d: m.parts });

/** Everything the lab displays, derived from the state. */
export function labSnapshot(s: LabState): LabSnapshot & { line: Fraction } {
  return {
    build: fractionOf(s.build),
    compareTop: fractionOf(s.compareTop),
    compareBottom: fractionOf(s.compareBottom),
    equivalentBase: s.base,
    equivalentResult: { n: s.base.n * s.split, d: s.base.d * s.split },
    line: { n: s.line.marker, d: s.line.intervals },
  };
}

/** A label for each part of a model, e.g. "Part 3 of 8, shaded" (LAB-002 AC4, LAB-007). */
export function partLabels(m: PartModel): string[] {
  return Array.from({ length: m.parts }, (_, i) => `Part ${i + 1} of ${m.parts}${m.shaded.includes(i) ? ", shaded" : ""}`);
}
