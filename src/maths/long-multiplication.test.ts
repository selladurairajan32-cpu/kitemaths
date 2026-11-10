import { describe, expect, it } from "vitest";
import { columnSum, longMultiplication, placeParts } from "./long-multiplication";

/**
 * ANIM-001 maths model. Oracles: BigInt products and sums, and hand-worked tables (never the function under test).
 */

const big = (x: number) => BigInt(x);
/** Reads a column-method row back as a number: digits written (ones first) after its placeholder zeros. */
const readRow = (written: number[], zeros: number) => BigInt([...written].reverse().join("") + "0".repeat(zeros));

describe("long multiplication model (ANIM-001)", () => {
  it("splits numbers into their non-zero place parts", () => {
    expect(placeParts(23)).toEqual([20, 3]);
    expect(placeParts(14)).toEqual([10, 4]);
    expect(placeParts(105)).toEqual([100, 5]);
    expect(placeParts(7)).toEqual([7]);
    expect(placeParts(1000)).toEqual([1000]);
  });

  it("works 23 × 14 exactly as written by hand", () => {
    const m = longMultiplication(23, 14);
    expect(m.total).toBe(322);
    expect(m.cells.map((c) => [c.aPart, c.bPart, c.product])).toEqual([
      [20, 10, 200],
      [3, 10, 30],
      [20, 4, 80],
      [3, 4, 12],
    ]);
    // Ones row: 3 × 4 = 12, write 2 carry 1; 2 × 4 = 8, + 1 = 9.
    expect(m.rows[0]).toMatchObject({ multiplier: 4, digit: 4, place: 1, product: 92, zeros: 0 });
    expect(m.rows[0]!.columns).toEqual([
      { aDigit: 3, carryIn: 0, written: 2 },
      { aDigit: 2, carryIn: 1, written: 9 },
    ]);
    // Tens row: a placeholder 0, then 3 × 1 = 3 and 2 × 1 = 2.
    expect(m.rows[1]).toMatchObject({ multiplier: 10, digit: 1, place: 10, product: 230, zeros: 1 });
    expect(m.rows[1]!.columns.map((c) => c.written)).toEqual([3, 2]);
    // 92 + 230: 2 + 0 = 2, 9 + 3 = 12 write 2 carry 1, 0 + 2 + 1 = 3.
    expect(m.sum).toEqual([
      { written: 2, carryIn: 0 },
      { written: 2, carryIn: 0 },
      { written: 3, carryIn: 1 },
    ]);
  });

  it("works 34 × 12 and 47 × 6 as written by hand", () => {
    const a = longMultiplication(34, 12);
    expect(a.rows.map((r) => [r.multiplier, r.product])).toEqual([
      [2, 68],
      [10, 340],
    ]);
    expect(a.total).toBe(408);
    const b = longMultiplication(47, 6);
    // 7 × 6 = 42, write 2 carry 4; 4 × 6 = 24, + 4 = 28, write 8; the final carry 2 is written in a new column.
    expect(b.rows[0]!.columns).toEqual([
      { aDigit: 7, carryIn: 0, written: 2 },
      { aDigit: 4, carryIn: 4, written: 8 },
      { aDigit: 0, carryIn: 0, written: 2 },
    ]);
    expect(b.total).toBe(282);
  });

  it("skips a zero digit in the second number (105 × 203)", () => {
    const m = longMultiplication(105, 203);
    expect(m.bParts).toEqual([200, 3]);
    expect(m.rows.map((r) => [r.multiplier, r.zeros, r.product])).toEqual([
      [3, 0, 315],
      [200, 2, 21000],
    ]);
    expect(m.total).toBe(21315);
  });

  it("agrees with BigInt for every pair, row by row and column by column", () => {
    const pairs: [number, number][] = [];
    for (let a = 10; a <= 99; a += 7) for (let b = 10; b <= 99; b += 3) pairs.push([a, b]);
    for (let a = 100; a <= 999; a += 89) for (let b = 11; b <= 99; b += 11) pairs.push([a, b]);
    pairs.push([9999, 9999], [1, 1], [5, 10]);
    for (const [a, b] of pairs) {
      const m = longMultiplication(a, b);
      const label = `${a} × ${b}`;
      expect(big(m.total), label).toBe(big(a) * big(b));
      expect(m.cells.reduce((s, c) => s + big(c.product), BigInt(0)), label).toBe(big(a) * big(b));
      expect(m.rows.reduce((s, r) => s + big(r.product), BigInt(0)), label).toBe(big(a) * big(b));
      for (const r of m.rows) {
        expect(readRow(r.columns.map((c) => c.written), r.zeros), label).toBe(big(a) * big(r.multiplier));
        // Each column of a: digit × multiplier digit + carry in = written + 10 × carry out. The carry out of the last
        // column is whatever is written in the extra columns after it.
        const len = String(a).length;
        r.columns.slice(0, len).forEach((c, i) => {
          const carryOut = i + 1 < len ? r.columns[i + 1]!.carryIn : Number(r.columns.slice(len).map((x) => x.written).reverse().join("") || "0");
          expect(c.aDigit * r.digit + c.carryIn, label).toBe(c.written + 10 * carryOut);
        });
      }
      expect(readRow(m.sum.map((s) => s.written), 0), label).toBe(big(a) * big(b));
    }
  });

  it("adds columns with carries (hand-worked)", () => {
    expect(columnSum([68, 340])).toEqual([
      { written: 8, carryIn: 0 },
      { written: 0, carryIn: 0 },
      { written: 4, carryIn: 1 },
    ]);
    expect(columnSum([999, 1])).toEqual([
      { written: 0, carryIn: 0 },
      { written: 0, carryIn: 1 },
      { written: 0, carryIn: 1 },
      { written: 1, carryIn: 1 },
    ]);
  });

  it("refuses numbers outside its domain with RangeError", () => {
    expect(() => longMultiplication(0, 5)).toThrow(RangeError);
    expect(() => longMultiplication(-3, 5)).toThrow(RangeError);
    expect(() => longMultiplication(2.5, 5)).toThrow(RangeError);
    expect(() => longMultiplication(Number.MAX_SAFE_INTEGER, 3)).toThrow(RangeError);
    expect(() => placeParts(0)).toThrow(RangeError);
  });
});
