import { describe, expect, it } from "vitest";
import { prng } from "@/engine/random";
import { INITIAL_LAB, isSupportedParts, labReducer, labSnapshot, partLabels, SUPPORTED_PARTS, type LabAction, type LabState, type ModelId } from "./labState";

/**
 * LAB-001 to LAB-006: the lab's single mathematical state. Invariants are checked after every step of long random
 * action sequences; expected values in the named cases are worked out by hand.
 */

const MODELS: ModelId[] = ["build", "compareTop", "compareBottom"];

function randomAction(rand: () => number): LabAction {
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
  const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  switch (int(0, 8)) {
    case 0: return { type: "set-parts", model: pick(MODELS), parts: int(-2, 15) };
    case 1: return { type: "toggle", model: pick(MODELS), index: int(-2, 14) };
    case 2: return { type: "shade-all", model: pick(MODELS) };
    case 3: return { type: "clear", model: pick(MODELS) };
    case 4: return { type: "set-shape", shape: pick(["bar", "circle"] as const) };
    case 5: return { type: "set-base", base: { n: int(-1, 8), d: int(-1, 8) } };
    case 6: return { type: "set-split", split: int(-1, 6) };
    case 7: return { type: "set-intervals", intervals: int(-1, 14) };
    default: return { type: "move-marker", to: int(-3, 15) + rand() };
  }
}

function invariants(s: LabState) {
  const snap = labSnapshot(s);
  for (const m of MODELS) {
    const model = s[m];
    expect(isSupportedParts(model.parts), `${m} parts ${model.parts}`).toBe(true);
    expect(new Set(model.shaded).size, `${m} has duplicate shaded parts`).toBe(model.shaded.length);
    for (const i of model.shaded) expect(i >= 0 && i < model.parts && Number.isInteger(i), `${m} shaded ${i}`).toBe(true);
    // The notation is the model: numerator = shaded parts, denominator = equal parts (LAB-001 AC1).
    const f = m === "build" ? snap.build : m === "compareTop" ? snap.compareTop : snap.compareBottom;
    expect(f).toEqual({ n: model.shaded.length, d: model.parts });
  }
  expect(snap.equivalentResult).toEqual({ n: s.base.n * s.split, d: s.base.d * s.split });
  expect(s.base.n <= s.base.d && s.base.d >= 1).toBe(true);
  expect(Number.isInteger(s.line.marker) && s.line.marker >= 1 && s.line.marker <= s.line.intervals).toBe(true);
  expect(snap.line).toEqual({ n: s.line.marker, d: s.line.intervals });
}

describe("the lab's single state (LAB-001)", () => {
  it("keeps notation, parts and pictures in agreement through 20,000 random changes", () => {
    const rand = prng(2026);
    let s = INITIAL_LAB;
    for (let i = 0; i < 20_000; i++) {
      s = labReducer(s, randomAction(rand));
      invariants(s);
    }
  });

  it("keeps the same fraction when the build model switches between bar and circle (LAB-004 AC3)", () => {
    let s = labReducer(INITIAL_LAB, { type: "set-parts", model: "build", parts: 6 });
    s = labReducer(s, { type: "toggle", model: "build", index: 0 });
    s = labReducer(s, { type: "toggle", model: "build", index: 4 });
    const before = labSnapshot(s).build;
    s = labReducer(s, { type: "set-shape", shape: "circle" });
    expect(labSnapshot(s).build).toEqual(before);
    expect(before).toEqual({ n: 2, d: 6 });
  });
});

describe("partition controls (LAB-002)", () => {
  it("offers 1 to 12 equal parts and refuses anything else rather than approximating it", () => {
    expect(SUPPORTED_PARTS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    for (const bad of [0, 13, 2.5, -1, Number.NaN]) expect(labReducer(INITIAL_LAB, { type: "set-parts", model: "build", parts: bad })).toBe(INITIAL_LAB);
  });

  it("drops shading that no longer exists when the parts change, and relabels the parts", () => {
    let s = labReducer(INITIAL_LAB, { type: "set-parts", model: "build", parts: 8 });
    for (const i of [1, 6, 7]) s = labReducer(s, { type: "toggle", model: "build", index: i });
    s = labReducer(s, { type: "set-parts", model: "build", parts: 5 });
    expect(s.build.shaded).toEqual([1]);
    expect(partLabels(s.build)).toEqual(["Part 1 of 5", "Part 2 of 5, shaded", "Part 3 of 5", "Part 4 of 5", "Part 5 of 5"]);
  });
});

describe("shading (LAB-003)", () => {
  it("updates the numerator immediately and toggles predictably on repeated taps", () => {
    let s = INITIAL_LAB;
    s = labReducer(s, { type: "toggle", model: "build", index: 2 });
    expect(labSnapshot(s).build).toEqual({ n: 1, d: 4 });
    const again = labReducer(s, { type: "toggle", model: "build", index: 2 });
    expect(labSnapshot(again).build).toEqual({ n: 0, d: 4 });
    // Three taps = one tap.
    expect(labReducer(again, { type: "toggle", model: "build", index: 2 })).toEqual(s);
    // A tap outside the shape changes nothing.
    expect(labReducer(s, { type: "toggle", model: "build", index: 4 })).toBe(s);
  });
});

describe("the lab number line (LAB-006)", () => {
  it("snaps the marker to a mark between 0 and 1 and keeps its value when the gaps change where it can", () => {
    let s = labReducer(INITIAL_LAB, { type: "move-marker", to: 2.4 });
    expect(labSnapshot(s).line).toEqual({ n: 2, d: 4 });
    s = labReducer(s, { type: "move-marker", to: 99 });
    expect(labSnapshot(s).line).toEqual({ n: 4, d: 4 });
    s = labReducer(s, { type: "move-marker", to: -5 });
    expect(labSnapshot(s).line).toEqual({ n: 1, d: 4 });
    s = labReducer(s, { type: "move-marker", to: 2 });
    s = labReducer(s, { type: "set-intervals", intervals: 8 });
    // 2/4 = 4/8: the marker stays at the same point.
    expect(labSnapshot(s).line).toEqual({ n: 4, d: 8 });
    expect(labReducer(s, { type: "set-intervals", intervals: 13 })).toBe(s);
  });
});
