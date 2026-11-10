import { describe, expect, it } from "vitest";
import { initStepper, isLast, stepper } from "./stepper";

/** ANIM-001: Watch & Learn controls. Every transition of the pure reducer. */
describe("explainer stepper (ANIM-001)", () => {
  const s0 = initStepper(4);

  it("starts paused on the first step and refuses an empty explanation", () => {
    expect(s0).toEqual({ step: 0, count: 4, playing: false });
    expect(() => initStepper(0)).toThrow(RangeError);
  });

  it("moves with Next and Back, never past either end, and stops Play", () => {
    let s = stepper({ ...s0, playing: true }, { type: "next" });
    expect(s).toEqual({ step: 1, count: 4, playing: false });
    s = stepper(stepper(stepper(s, { type: "next" }), { type: "next" }), { type: "next" });
    expect(s.step).toBe(3);
    expect(isLast(s)).toBe(true);
    s = stepper(s, { type: "goto", step: 0 });
    expect(stepper(s, { type: "back" }).step).toBe(0);
    expect(stepper(s, { type: "goto", step: 9 }).step).toBe(3);
  });

  it("plays one step per tick and stops on the last step", () => {
    let s = stepper(s0, { type: "play" });
    expect(s.playing).toBe(true);
    s = stepper(s, { type: "tick" });
    s = stepper(s, { type: "tick" });
    expect(s).toEqual({ step: 2, count: 4, playing: true });
    s = stepper(s, { type: "tick" });
    expect(s).toEqual({ step: 3, count: 4, playing: false });
    expect(stepper(s, { type: "tick" })).toBe(s);
  });

  it("ignores ticks while paused", () => {
    const s = stepper(stepper(s0, { type: "play" }), { type: "pause" });
    expect(stepper(s, { type: "tick" })).toEqual(s);
  });

  it("replays from the start, and Play on the last step starts again", () => {
    const end = stepper(s0, { type: "goto", step: 3 });
    expect(stepper(end, { type: "replay" })).toEqual({ step: 0, count: 4, playing: true });
    expect(stepper(end, { type: "play" })).toEqual({ step: 0, count: 4, playing: true });
    expect(stepper(initStepper(1), { type: "play" }).playing).toBe(false);
  });

  it("keeps the step when switching to a method with a different number of steps", () => {
    const s = stepper(s0, { type: "goto", step: 3 });
    expect(stepper(s, { type: "reset", count: 6 })).toEqual({ step: 3, count: 6, playing: false });
    expect(stepper(s, { type: "reset", count: 2 })).toEqual({ step: 1, count: 2, playing: false });
  });
});
