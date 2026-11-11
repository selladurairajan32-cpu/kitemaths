import { describe, expect, it } from "vitest";
import { endPoint, snap, triangleFromSides } from "./geometry";

/** D-039 drawing geometry. Oracles: hand-worked triangles (3-4-5, equilateral, 30-30-120), within 0.05. */

const near = (got: number, want: number) => expect(Math.abs(got - want)).toBeLessThan(0.05);

describe("drawing geometry (Y6.GPS.1)", () => {
  it("finds the third side and angles from two sides and the angle between them (hand-worked)", () => {
    const r = triangleFromSides(3, 4, 90);
    near(r.c, 5);
    near(r.oppositeA, 36.87);
    near(r.oppositeB, 53.13);
    const eq = triangleFromSides(5, 5, 60);
    near(eq.c, 5);
    near(eq.oppositeA, 60);
    near(eq.oppositeB, 60);
    const wide = triangleFromSides(6, 6, 120);
    near(wide.c, 10.39);
    near(wide.oppositeA, 30);
    expect(() => triangleFromSides(4, 5, 180)).toThrow(RangeError);
    expect(() => triangleFromSides(0, 5, 40)).toThrow(RangeError);
  });

  it("finds the end of a line at an angle, on a screen where y points down (hand-worked)", () => {
    const o = { x: 10, y: 100 };
    const right = endPoint(o, 5, 0);
    near(right.x, 15);
    near(right.y, 100);
    const up = endPoint(o, 5, 90);
    near(up.x, 10);
    near(up.y, 95);
    const back = endPoint(o, 2, 180);
    near(back.x, 8);
  });

  it("snaps to half-centimetres and whole degrees, half away from zero", () => {
    expect(snap(5.74, 0.5)).toBe(5.5);
    expect(snap(5.75, 0.5)).toBe(6);
    expect(snap(49.5, 1)).toBe(50);
    expect(snap(-2.5, 1)).toBe(-3);
    expect(snap(0.2, 0.5)).toBe(0);
  });
});
