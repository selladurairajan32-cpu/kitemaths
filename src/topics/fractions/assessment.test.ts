import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contentKey } from "./generate";
import { ASSESSMENT_AREAS, ASSESSMENT_FORMS, FOLLOWUP_QUESTIONS, LESSON_QUESTIONS, PRACTICE_QUESTIONS } from "./questions";
import { SKILLS } from "./skills";

/** MAST-002: the independent Fractions assessment (two parallel forms). */

describe("independent assessment (MAST-002)", () => {
  it("samples conceptual, representational, comparison, equivalence, quantity and reasoning skills on both forms", () => {
    expect(ASSESSMENT_AREAS).toEqual(["Conceptual understanding", "Representation", "Comparison and equivalence", "Application", "Reasoning"]);
    for (const [form, items] of Object.entries(ASSESSMENT_FORMS)) {
      for (const area of ASSESSMENT_AREAS) expect(items.some((q) => q.area === area), `${form} ${area}`).toBe(true);
      // Every skill twice, so one slip never decides a skill.
      for (const s of SKILLS) expect(items.filter((q) => q.skill === s.id).length, `${form} ${s.id}`).toBe(2);
      expect(items.some((q) => q.skill === "fractions.compare") && items.some((q) => q.skill === "fractions.equivalent"), form).toBe(true);
      expect(items.some((q) => q.skill === "fractions.fraction-of"), `${form}: quantity`).toBe(true);
    }
  });

  it("uses unfamiliar items: none is a practice, lesson or follow-up question, by id or by content", () => {
    const seen = [...PRACTICE_QUESTIONS, ...LESSON_QUESTIONS, ...FOLLOWUP_QUESTIONS];
    const ids = new Set(seen.map((q) => q.id));
    const keys = new Set(seen.map(contentKey));
    for (const q of Object.values(ASSESSMENT_FORMS).flat()) {
      expect(ids.has(q.id), q.id).toBe(false);
      expect(keys.has(contentKey(q)), `${q.id} repeats a practice item`).toBe(false);
    }
    // The two forms are different questions too.
    const a = new Set(ASSESSMENT_FORMS.A.map(contentKey));
    expect(ASSESSMENT_FORMS.B.filter((q) => a.has(contentKey(q))).map((q) => q.id)).toEqual([]);
  });

  it("offers no hints during the check", () => {
    for (const q of Object.values(ASSESSMENT_FORMS).flat()) expect(q.hint, q.id).toBe("");
    const runner = readFileSync(join(process.cwd(), "src/components/questions/AttemptRunner.tsx"), "utf8");
    expect(runner).not.toMatch(/request-hint|BulbIcon|>\s*Hint\s*</);
  });
});
