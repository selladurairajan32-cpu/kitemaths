import { describe, expect, it } from "vitest";
import { TOPICS } from "@/topics";
import { questionForm, registerSkillForms, skillFormsAvailable } from "./forms";
import { SECURE_MIN_FORMS, skillMastery } from "./mastery";
import type { ItemResult } from "./types";

/** MAST-001 varied examples (D-033). Hand-built answer histories as oracles. */

const S = "fractions.compare";
let at = 0;
const ans = (form: string | undefined, ok = true): ItemResult => ({ questionId: `q${++at}`, skill: S, context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0, misconceptions: [], at, ...(form ? { form } : {}) });

describe("secure needs more than one question form (MAST-001, D-033)", () => {
  it("is 2 forms", () => expect(SECURE_MIN_FORMS).toBe(2));

  it("keeps a skill developing when every right answer was the same kind of question", () => {
    expect(skillMastery(S, [ans("compare"), ans("compare"), ans("compare"), ans("compare")]).status).toBe("developing");
  });

  it("makes it secure once right answers cover two forms", () => {
    expect(skillMastery(S, [ans("compare"), ans("compare"), ans("choose:bar"), ans("compare")]).status).toBe("secure");
  });

  it("doesn't count a wrong answer's form towards variety", () => {
    // 5 right in one form, 1 wrong in another: average 5/6 is over 75%, but only one form was answered right.
    expect(skillMastery(S, [ans("compare"), ans("compare"), ans("compare"), ans("compare"), ans("compare"), ans("shade", false)]).status).toBe("developing");
  });

  it("doesn't penalise answers saved before forms were recorded", () => {
    expect(skillMastery(S, [ans(undefined), ans(undefined), ans(undefined)]).status).toBe("secure");
  });

  it("asks a skill with only one kind of question for that one form, so it can still become secure", () => {
    registerSkillForms("test.one-form", 1);
    const one = (ok = true): ItemResult => ({ ...ans("only", ok), skill: "test.one-form" });
    expect(skillMastery("test.one-form", [one(), one(), one()]).status).toBe("secure");
  });

  it("registers every island skill's forms; most skills offer two or more", () => {
    let multi = 0;
    let total = 0;
    for (const t of TOPICS) for (const s of t.skills) {
      const forms = new Set(t.practiceQuestions.filter((q) => q.skill === s.id).map(questionForm)).size;
      expect(skillFormsAvailable(s.id), s.id).toBe(forms);
      total++;
      if (forms >= 2) multi++;
    }
    // Every Fractions (R1) skill offers at least two forms.
    for (const s of TOPICS.find((t) => t.id === "fractions")!.skills) expect(skillFormsAvailable(s.id)!, s.id).toBeGreaterThanOrEqual(2);
    // Ratchet (10 Nov 2026): 48 of 105 skills, all on preview islands, have a single question maker, so the rule asks
    // them for one form. Adding question types lowers this; it may only shrink.
    expect(total - multi).toBeLessThanOrEqual(48);
  });
});
