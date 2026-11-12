import { describe, expect, it } from "vitest";
import { isPicName } from "@/components/paper/Pic";
import { journeyFor, JOURNEYS } from "./journeys";

/** D-046: each journey's Key idea bar says the same as the maths, checked against hand-worked answers. */

describe("journey key ideas (D-046)", () => {
  it("draws 1/3 + 1/4 as 4 and 3 twelfths, and 35 shared 2 : 3 as five parts of 7", () => {
    // Hand-worked: 1/3 = 4/12, 1/4 = 3/12, together 7/12.
    const f = journeyFor("fractions-2", "add-different")!.keyBar;
    expect([f.cells, f.blue, f.orange]).toEqual([12, 4, 3]);
    expect(f.caption).toBe("{4/12} + {3/12} = {7/12}");
    // Hand-worked: 2 + 3 = 5 parts; 35 ÷ 5 = 7; blue 2 × 7 = 14, orange 3 × 7 = 21.
    const r = journeyFor("ratio-algebra", "ratio")!.keyBar;
    expect([r.cells, r.blue, r.orange]).toEqual([5, 2, 3]);
    expect(r.caption).toBe("5 equal parts of 7: blue 2 × 7 = 14, orange 3 × 7 = 21");
  });

  it("gives every journey a key idea, a mistake to watch out for, and a bar that fits its cells", () => {
    for (const j of JOURNEYS) {
      expect(j.keyIdea.length, j.concept).toBeGreaterThan(20);
      expect(j.misconception.length, j.concept).toBeGreaterThan(20);
      expect(j.keyBar.blue + j.keyBar.orange, j.concept).toBeLessThanOrEqual(j.keyBar.cells);
      expect(isPicName(j.pic), j.concept).toBe(true);
    }
  });
});
