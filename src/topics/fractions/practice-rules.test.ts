import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MISCONCEPTIONS } from "./misconceptions";
import { evaluate } from "./evaluate";
import { generateFromId, TEMPLATE_INFO } from "./generate";
import { INITIAL_LAB, labReducer, labSnapshot } from "./labState";
import { equivalent, fractionOfAmount, frac as f } from "./math";
import { ALL_QUESTIONS, PRACTICE_QUESTIONS } from "./questions";
import { SKILLS } from "./skills";
import type { FractionQuestion } from "./types";
import { isWellFormed, wellFormedOnly } from "./ui/wellFormed";
import { topicById } from "@/topics";

/** PRACT-001 to PRACT-008: rules every Fractions practice question follows. Expected values worked by hand. */

const sample = (seeds = 80) => TEMPLATE_INFO.flatMap((t) => t.difficulties.flatMap((d) => Array.from({ length: seeds }, (_, s) => generateFromId(`g:fractions.${t.key}:${d}:${s}`)!)));
const ALL = [...ALL_QUESTIONS, ...sample()];

describe("practice rules (PRACT)", () => {
  it("rejects malformed questions at run time, so they never reach a child (PRACT-001 AC3)", () => {
    const good = PRACTICE_QUESTIONS.find((q) => q.kind === "choose-fraction")!;
    expect(isWellFormed(good)).toBe(true);
    const noAnswer = { ...good, id: "fractions.bad-1", options: good.kind === "choose-fraction" ? good.options.filter((o) => !(o.n === good.answer.n && o.d === good.answer.d)) : [] } as FractionQuestion;
    const zeroParts = { id: "fractions.bad-2", skill: "fractions.represent", difficulty: 1, kind: "shade", prompt: "Shade {1/2}.", diagram: { shape: "bar", parts: 0 }, target: f(1, 2), hint: "h", explanation: "e" } as FractionQuestion;
    expect(isWellFormed(noAnswer)).toBe(false);
    expect(isWellFormed(zeroParts)).toBe(false);
    expect(wellFormedOnly([good, noAnswer, zeroParts]).map((q) => q.id)).toEqual([good.id]);
    // The app's practice pool goes through the same check, and every real question passes it.
    const pool = topicById("fractions")!.practicePool(1, []);
    expect(pool.length).toBeGreaterThan(PRACTICE_QUESTIONS.length);
    expect(ALL_QUESTIONS.filter((q) => !isWellFormed(q)).map((q) => q.id)).toEqual([]);
  });

  it("asks for a fraction to shade on valid, equal partitions where the target can be shaded exactly (PRACT-003)", () => {
    const shade = ALL.filter((q): q is Extract<FractionQuestion, { kind: "shade" }> => q.kind === "shade");
    expect(shade.length).toBeGreaterThan(100);
    for (const q of shade) {
      expect(q.prompt, q.id).toMatch(/shade \{\d+\/\d+\}/i);
      expect("sizes" in q.diagram && q.diagram.sizes, q.id).toBeFalsy();
      const parts = q.diagram.shape === "grid" ? q.diagram.rows * q.diagram.cols : q.diagram.shape === "line" ? 0 : q.diagram.parts;
      expect((q.target.n * parts) % q.target.d, q.id).toBe(0);
      expect(evaluate(q, { kind: "shade", shaded: Array.from({ length: (q.target.n * parts) / q.target.d }, (_, i) => i) }).correct, q.id).toBe(true);
    }
  });

  it("makes every matching picture unambiguous: one picture per fraction, and each picture shows its own answer (PRACT-004 AC2)", () => {
    for (const q of ALL.filter((q) => q.kind === "match")) {
      if (q.kind !== "match") continue;
      for (let i = 0; i < q.rows.length; i++) for (let j = i + 1; j < q.rows.length; j++) expect(equivalent(q.rows[i].answer, q.rows[j].answer), q.id).toBe(false);
      for (const row of q.rows) {
        const d = row.diagram;
        const total = d.shape === "grid" ? d.rows * d.cols : d.shape === "line" ? d.intervals : d.parts;
        const shown = d.shape === "line" ? d.point ?? 0 : d.shaded?.length ?? 0;
        expect(row.answer, `${q.id} ${row.id}`).toEqual({ n: shown, d: total });
      }
      expect(q.choices.length, q.id).toBe(new Set(q.choices.map((c) => `${c.n}/${c.d}`)).size);
    }
  });

  it("explains equal and unequal partitions with the mathematical reason (PRACT-005 AC2)", () => {
    for (const q of ALL.filter((q) => q.kind === "equal-parts")) expect(q.explanation, q.id).toMatch(/equal|same size/i);
  });

  it("marks number-line and fraction-of answers with the same maths the lab uses (PRACT-006 AC1)", () => {
    for (let k = 2; k <= 12; k++) {
      for (let m = 1; m <= k; m++) {
        const lab = labSnapshot(labReducer(labReducer(INITIAL_LAB, { type: "set-intervals", intervals: k }), { type: "move-marker", to: m })).line;
        const q = { id: "fractions.t", skill: "fractions.number-line", difficulty: 1, kind: "number-line-place", prompt: "", intervals: k, target: lab, hint: "", explanation: "" } as FractionQuestion;
        expect(evaluate(q, { kind: "number-line-place", index: m }).correct).toBe(true);
        if (m < k) expect(evaluate(q, { kind: "number-line-place", index: m + 1 }).correct).toBe(false);
      }
    }
    for (const q of ALL.filter((q) => q.kind === "fraction-of")) {
      if (q.kind !== "fraction-of") continue;
      expect(evaluate(q, { kind: "fraction-of", value: fractionOfAmount(q.fraction, q.amount)! }).correct, q.id).toBe(true);
    }
  });

  it("varies structure and representation within every skill, not only the numbers (PRACT-007 AC1)", () => {
    for (const s of SKILLS) {
      const qs = ALL.filter((q) => q.skill === s.id);
      const kinds = new Set(qs.map((q) => q.kind));
      // Representation: the picture's shape, or pictures versus symbols only.
      const shapes = new Set(qs.map((q) => ("diagram" in q && q.diagram ? q.diagram.shape : q.kind === "compare" && q.showVisual ? "bars" : "symbols")));
      expect(kinds.size + shapes.size, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("documents the difficulty dimensions of every template (PRACT-007 AC2)", () => {
    const doc = readFileSync(join(process.cwd(), "docs/product/curriculum/PRACT-007-question-variation.md"), "utf8");
    for (const t of TEMPLATE_INFO) expect(doc, t.key).toContain(`| \`${t.key}\` |`);
  });

  it("uses respectful, age-appropriate language in hints, feedback and diagnoses (PRACT-008 AC4)", () => {
    const words = [
      ...ALL.flatMap((q) => [q.prompt, q.hint, q.explanation, ...("traps" in q ? (q.traps ?? []).map((t) => t.feedback) : [])]),
      ...MISCONCEPTIONS.flatMap((m) => [m.possibleCause, ...m.explanation]),
    ].join("\n");
    expect(words).not.toMatch(/\b(stupid|silly|careless|lazy|wrong!|fail(ed|ure)?|bad at|obviously|easy peasy|you should know)\b/i);
    // Diagnoses stay tentative (MIS-003).
    for (const m of MISCONCEPTIONS) expect(m.possibleCause, m.id).not.toMatch(/\byou (think|believe)\b/i);
  });
});
