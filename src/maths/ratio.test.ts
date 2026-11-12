import { describe, expect, it } from "vitest";
import { scaleAmount, shareInRatio, simplifyRatio } from "./ratio";

/** D-040 ratio maths. Oracles: hand-worked tables and BigInt products, never the function under test. */

describe("ratio and proportion (Y6.RP)", () => {
  it("simplifies ratios (hand-worked)", () => {
    expect(simplifyRatio([6, 9])).toEqual([2, 3]);
    expect(simplifyRatio([12, 8, 4])).toEqual([3, 2, 1]);
    expect(simplifyRatio([7, 5])).toEqual([7, 5]);
    expect(simplifyRatio([50, 50])).toEqual([1, 1]);
    expect(() => simplifyRatio([3])).toThrow(RangeError);
    expect(() => simplifyRatio([0, 4])).toThrow(RangeError);
  });

  it("shares an amount in a ratio (hand-worked)", () => {
    expect(shareInRatio(35, [2, 3])).toEqual({ onePart: 7, shares: [14, 21], partCount: 5 });
    expect(shareInRatio(20, [3, 1])).toEqual({ onePart: 5, shares: [15, 5], partCount: 4 });
    expect(shareInRatio(60, [1, 2, 3])).toEqual({ onePart: 10, shares: [10, 20, 30], partCount: 6 });
    expect(shareInRatio(0, [2, 3]).shares).toEqual([0, 0]);
    expect(() => shareInRatio(36, [2, 3])).toThrow(RangeError);
  });

  it("keeps every share in the ratio and adding to the total (BigInt oracle)", () => {
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        for (let k = 0; k <= 30; k++) {
          const total = (a + b) * k;
          const { shares } = shareInRatio(total, [a, b]);
          expect(BigInt(shares[0]) + BigInt(shares[1])).toBe(BigInt(total));
          expect(BigInt(shares[0]) * BigInt(b)).toBe(BigInt(shares[1]) * BigInt(a));
        }
      }
    }
  });

  it("scales recipe amounts exactly (hand-worked)", () => {
    expect(scaleAmount(300, 4, 6)).toBe(450);
    expect(scaleAmount(2, 4, 6)).toBe(3);
    expect(scaleAmount(300, 4, 8)).toBe(600);
    expect(scaleAmount(250, 5, 2)).toBe(100);
    expect(() => scaleAmount(2, 4, 5)).toThrow(RangeError);
    expect(() => scaleAmount(2, 0, 5)).toThrow(RangeError);
  });
});
