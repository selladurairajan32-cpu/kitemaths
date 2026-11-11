/**
 * Plane geometry for drawing shapes to size (Y6.GPS.1, D-039). Lengths are in any unit; angles in degrees. These are
 * floating-point drawing and measuring helpers, not part of the exact numeric-comparison contract.
 */

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/**
 * A triangle from two sides and the angle between them (side-angle-side), by the law of cosines: the third side, and
 * the angle opposite each given side.
 */
export function triangleFromSides(a: number, b: number, angleDeg: number): { c: number; oppositeA: number; oppositeB: number } {
  if (!(a > 0 && b > 0 && angleDeg > 0 && angleDeg < 180)) throw new RangeError("triangleFromSides needs positive sides and an angle between 0° and 180°");
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad(angleDeg)));
  const oppositeA = deg(Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))));
  return { c, oppositeA, oppositeB: 180 - angleDeg - oppositeA };
}

/** The end of a line of `length` from `origin` at `angleDeg` anticlockwise from "east", on a screen where y points down. */
export function endPoint(origin: { x: number; y: number }, length: number, angleDeg: number): { x: number; y: number } {
  return { x: origin.x + length * Math.cos(rad(angleDeg)), y: origin.y - length * Math.sin(rad(angleDeg)) };
}

/** Rounds to the nearest `step` (0.5 for half-centimetres, 1 for whole degrees), half away from zero. */
export function snap(value: number, step: number): number {
  const k = value / step;
  return (Math.sign(k) * Math.round(Math.abs(k))) * step;
}
