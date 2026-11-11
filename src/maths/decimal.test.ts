import { describe, expect, it } from "vitest";
import { decimalText, divideToPlaces, multiplyByWhole, normalise, toNumber } from "./decimal";

/** D-038 decimal maths. Oracles: BigInt arithmetic and hand-worked tables, never the function under test. */

const big = (x: number) => BigInt(x);

describe("exact decimals (Y5.FRAC.7, Y6.FRAC.8, Y6.FRAC.9)", () => {
  it("writes scaled decimals with the right places (hand-worked)", () => {
    expect(decimalText({ units: 7, places: 3 })).toBe("0.007");
    expect(decimalText({ units: 175, places: 2 })).toBe("1.75");
    expect(decimalText({ units: 4056, places: 3 })).toBe("4.056");
    expect(decimalText({ units: 12, places: 0 })).toBe("12");
    expect(decimalText({ units: 30, places: 2 })).toBe("0.30");
    expect(normalise({ units: 210, places: 2 })).toEqual({ units: 21, places: 1 });
    expect(toNumber({ units: 7, places: 3 })).toBe(0.007);
  });

  it("multiplies a decimal by a whole number exactly, matching BigInt", () => {
    for (let units = 1; units <= 999; units += 7) {
      for (let k = 2; k <= 12; k++) {
        const got = multiplyByWhole({ units, places: 2 }, k);
        // Oracle: units × k hundredths, compared after scaling both to hundredths.
        expect(big(got.units) * big(10) ** big(2 - got.places), `${units}/100 × ${k}`).toBe(big(units) * big(k));
      }
    }
    expect(decimalText(multiplyByWhole({ units: 35, places: 2 }, 6))).toBe("2.1");
    expect(toNumber(multiplyByWhole({ units: 35, places: 2 }, 6))).toBe(2.1);
  });

  it("divides by written division to at most 2 places, saying when it is exact (BigInt oracle)", () => {
    for (let n = 1; n <= 200; n++) {
      for (const d of [2, 3, 4, 5, 6, 7, 8, 20, 25]) {
        const got = divideToPlaces(n, d, 2);
        // Exact means n × 10^places is exactly units × d.
        const scaled = big(n) * big(10) ** big(got.places);
        if (got.exact) expect(big(got.units) * big(d), `${n} ÷ ${d}`).toBe(scaled);
        else {
          expect(got.places, `${n} ÷ ${d}`).toBeLessThanOrEqual(2);
          expect((big(n) * big(100)) % big(d) !== big(0), `${n} ÷ ${d}`).toBe(true);
        }
      }
    }
    expect(divideToPlaces(7, 4, 2)).toEqual({ units: 175, places: 2, exact: true });
    expect(divideToPlaces(1, 8, 2)).toEqual({ units: 12, places: 2, exact: false });
    expect(divideToPlaces(1, 8, 3)).toEqual({ units: 125, places: 3, exact: true });
    expect(divideToPlaces(9, 3, 2)).toEqual({ units: 3, places: 0, exact: true });
    expect(() => divideToPlaces(5, 0, 2)).toThrow(RangeError);
  });
});
