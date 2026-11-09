import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { catalogueMarkdown, taggedAnswers } from "./catalogue";
import { evaluate } from "./evaluate";
import { MISCONCEPTIONS } from "./misconceptions";
import { ALL_QUESTIONS } from "./questions";
import type { FractionQuestion } from "./types";

/** MIS-001 and MIS-002: the catalogue is complete and its document matches the content. */
const DOC = join(process.cwd(), "docs/product/curriculum/MIS-001-misconception-catalogue.md");

describe("misconception catalogue (MIS-001, MIS-002)", () => {
  it("includes the five required misconceptions", () => {
    const names = MISCONCEPTIONS.map((m) => m.id);
    for (const id of ["numerator-denominator-swap", "bigger-denominator-bigger-piece", "unequal-parts", "part-to-part", "miscounted-total"]) expect(names).toContain(`fractions.${id}`);
  });

  it("gives every entry example evidence, alternative explanations and a recovery activity", () => {
    for (const m of MISCONCEPTIONS) {
      expect(m.description.length, m.id).toBeGreaterThan(20);
      expect(m.alternatives?.length ?? 0, m.id).toBeGreaterThanOrEqual(2);
      expect(m.explanation.length, m.id).toBeGreaterThan(0);
      expect(m.followUps.length, m.id).toBeGreaterThanOrEqual(1);
      for (const f of m.followUps) expect(ALL_QUESTIONS.some((q) => q.id === f), `${m.id} -> ${f}`).toBe(true);
      // The child-facing cause is hedged: "might", "may", "looks like", "it could".
      expect(m.possibleCause, m.id).toMatch(/might|may|looks like|could/i);
    }
  });

  it("tags only answers that the evaluator marks wrong, and maps each tag to a known misconception", () => {
    const known = new Set(MISCONCEPTIONS.map((m) => m.id));
    let n = 0;
    for (const q of ALL_QUESTIONS) {
      for (const t of taggedAnswers(q)) {
        expect(known.has(t.misconception), `${q.id}: ${t.misconception}`).toBe(true);
        n++;
      }
      if (q.kind === "choose-fraction") for (const o of q.options.filter((o) => o.misconception)) expect(evaluate(q, { kind: "choose-fraction", choice: o }).correct, q.id).toBe(false);
      if (q.kind === "choose") for (const o of q.options.filter((o) => o.misconception)) expect(evaluate(q as FractionQuestion, { kind: "choose", choice: o.id }).correct, q.id).toBe(false);
    }
    expect(n).toBeGreaterThan(30);
  });

  it("keeps the catalogue document in step with the content", () => {
    const md = catalogueMarkdown() + "\n";
    if (process.env.UPDATE_DOCS) writeFileSync(DOC, md);
    expect(readFileSync(DOC, "utf8")).toBe(md);
  });
});
