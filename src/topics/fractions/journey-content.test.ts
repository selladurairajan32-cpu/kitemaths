import { describe, expect, it } from "vitest";
import { generateFromId } from "./generate";
import { lessonById, LESSONS, type LessonStep } from "./lessons";
import { MISCONCEPTIONS } from "./misconceptions";
import { ALL_QUESTIONS, questionById } from "./questions";
import type { Diagram, FractionQuestion, VisualSpec } from "./types";

/**
 * FR-002 to FR-009: what the Fractions lessons and questions actually contain. These read the authored content; they are
 * developer evidence, and the educational review of the same content is CUR-004 (independent, not done here).
 */

const text = (id: string) =>
  lessonById(id)!
    .steps.flatMap((s: LessonStep) => {
      if (s.type === "explain") return [s.title, ...s.body, s.tip ?? ""];
      if (s.type === "worked") return [s.title, s.problem, ...s.steps.map((w) => w.text), s.conclusion];
      return [s.title];
    })
    .join(" ");

const visuals = (id: string): VisualSpec[] =>
  lessonById(id)!.steps.flatMap((s: LessonStep) =>
    s.type === "explain" ? (s.visual ? [s.visual] : []) : s.type === "worked" ? [...(s.visual ? [s.visual] : []), ...s.steps.flatMap((w) => (w.visual ? [w.visual] : []))] : [],
  );

const diagramsOf = (q: FractionQuestion): Diagram[] => ("diagram" in q && q.diagram ? [q.diagram] : q.kind === "equal-parts" ? q.items.map((i) => i.diagram) : q.kind === "match" ? q.rows.map((r) => r.diagram) : []);
const generated = (key: string, difficulty: number, seeds = 200) => Array.from({ length: seeds }, (_, seed) => generateFromId(`g:fractions.${key}:${difficulty}:${seed}`)!);

describe("FR-002 wholes and equal parts", () => {
  it("shows valid and invalid divisions and says why unequal pieces are not equal parts", () => {
    expect(visuals("wholes").map((v) => v.type)).toContain("fair-unfair");
    expect(text("wholes")).toMatch(/Four unequal pieces are \*\*not\*\* quarters/);
    const eq = ALL_QUESTIONS.filter((q) => q.skill === "fractions.equal-parts" && q.kind === "equal-parts");
    // The child has to tell equal from unequal: every such question offers both.
    for (const q of eq) {
      if (q.kind !== "equal-parts") continue;
      const unequal = q.items.filter((i) => (i.diagram.shape === "bar" || i.diagram.shape === "circle") && i.diagram.sizes);
      expect(unequal.length, q.id).toBeGreaterThan(0);
      expect(q.items.length - unequal.length, q.id).toBeGreaterThan(0);
    }
    expect(eq.length).toBeGreaterThanOrEqual(3);
  });
});

describe("FR-003 numerator and denominator", () => {
  it("introduces both terms with a synchronised diagram", () => {
    expect(visuals("naming").some((v) => v.type === "anatomy")).toBe(true);
    expect(text("naming")).toMatch(/\*\*denominator\*\* \(bottom\) tells us how many \*\*equal parts\*\*/);
  });

  it("never reverses the terms in lessons, hints, feedback or misconception explanations", () => {
    const all = [
      ...LESSONS.map((l) => text(l.id)),
      ...ALL_QUESTIONS.flatMap((q) => [q.hint, q.explanation]),
      ...MISCONCEPTIONS.flatMap((m) => [m.possibleCause, ...m.explanation]),
    ].join("\n");
    expect(all).not.toMatch(/top number \(denominator\)|bottom number \(numerator\)|denominator \(top\)|numerator \(bottom\)/i);
    expect(all).not.toMatch(/numerator[^.]{0,40}(how many|all the) equal parts the whole/i);
  });
});

describe("FR-004 shapes and sets", () => {
  it("covers continuous models and discrete sets", () => {
    const shapes = new Set(ALL_QUESTIONS.flatMap(diagramsOf).map((d) => d.shape));
    for (const s of ["bar", "circle", "grid"]) expect(shapes.has(s as Diagram["shape"]), s).toBe(true);
    // Discrete sets: fraction-of questions drawn as counters, and the lesson's counter groups.
    expect(ALL_QUESTIONS.some((q) => q.kind === "fraction-of" && q.showCounters)).toBe(true);
    expect(visuals("amounts").some((v) => v.type === "counters")).toBe(true);
  });
});

describe("FR-005 comparing", () => {
  it("explains why a larger denominator can mean smaller parts", () => {
    expect(text("comparing")).toMatch(/As the denominator gets \*\*bigger\*\*, each piece gets \*\*smaller\*\*/);
    expect(visuals("comparing").some((v) => v.type === "wall")).toBe(true);
  });
});

describe("FR-006 equivalence", () => {
  it("connects multiplying top and bottom by the same number to a picture of split parts", () => {
    expect(visuals("equivalent").filter((v) => v.type === "equivalent-bars").length).toBeGreaterThanOrEqual(2);
    expect(text("equivalent")).toMatch(/× 3\*\* — every half was split into 3/);
  });
});

describe("FR-007 number line", () => {
  it("uses equal intervals from 0 to 1 with points strictly between, or on 1 only when asked", () => {
    const lines = [...ALL_QUESTIONS, ...generated("nl-place", 2), ...generated("nm-line", 3)].flatMap(diagramsOf).filter((d) => d.shape === "line");
    expect(lines.length).toBeGreaterThan(100);
    for (const d of lines) {
      if (d.shape !== "line") continue;
      expect(Number.isInteger(d.intervals) && d.intervals >= 2 && d.intervals <= 12, `intervals ${d.intervals}`).toBe(true);
      if (d.point !== undefined) expect(d.point >= 1 && d.point <= d.intervals, `point ${d.point}/${d.intervals}`).toBe(true);
    }
    for (const q of ALL_QUESTIONS.filter((q) => q.kind === "number-line-place")) {
      if (q.kind !== "number-line-place") continue;
      // The target lands exactly on a mark.
      expect((q.target.n * q.intervals) % q.target.d, q.id).toBe(0);
    }
    expect(text("number-line")).toMatch(/Count the \*\*gaps \(jumps\)\*\*, not the marks/);
  });
});

describe("FR-008 fractions of amounts", () => {
  it("teaches sharing into denominator groups, then counting numerator groups, with whole-number results first", () => {
    const counters = visuals("amounts").filter((v): v is Extract<VisualSpec, { type: "counters" }> => v.type === "counters");
    for (const c of counters) expect(c.amount % c.groups, `${c.amount} into ${c.groups}`).toBe(0);
    const steps = lessonById("amounts")!.steps;
    const firstQuestion = steps.find((s) => s.type === "check")!;
    const q = questionById((firstQuestion as Extract<LessonStep, { type: "check" }>).questionId);
    expect(q.kind).toBe("fraction-of");
    if (q.kind === "fraction-of") expect((q.amount * q.fraction.n) % q.fraction.d).toBe(0);
    for (const g of generated("fo-amount", 1)) if (g.kind === "fraction-of") expect((g.amount * g.fraction.n) % g.fraction.d).toBe(0);
  });
});

describe("FR-009 adding and subtracting with the same denominator", () => {
  const items = [...ALL_QUESTIONS.filter((q) => q.skill === "fractions.add-same"), ...[1, 2, 3].flatMap((d) => generated("ad-sum", d))];

  it("explains why the denominator stays the same", () => {
    expect(text("adding")).toMatch(/The \*\*denominator stays the same\*\* because the parts are still sevenths/);
    expect(lessonById("adding")!.steps.filter((s) => s.type === "check")).toHaveLength(2);
  });

  it("keeps every result within one whole, with valid answers", () => {
    expect(items.length).toBeGreaterThan(600);
    for (const q of items) {
      if (q.kind === "write-fraction" || q.kind === "choose-fraction") {
        expect(q.answer.n >= 0 && q.answer.n <= q.answer.d, q.id).toBe(true);
      }
    }
  });

  it("draws exactly the operation in the prompt: the picture and the symbols agree", () => {
    let checked = 0;
    for (const q of items) {
      if (q.kind !== "write-fraction" && q.kind !== "choose-fraction") continue;
      const d = q.diagram;
      if (d.shape !== "bar") continue;
      const m = /\{(\d+)\/(\d+)\}\s*([+−])\s*\{(\d+)\/(\d+)\}/.exec(q.prompt) ?? /whole bar is \{(\d+)\/(\d+)\}\. Take away \{(\d+)\/(\d+)\}/.exec(q.prompt);
      if (!m) continue;
      const [a, da, op, b, db] = m.length === 6 ? [Number(m[1]), Number(m[2]), m[3], Number(m[4]), Number(m[5])] : [Number(m[1]), Number(m[2]), "−", Number(m[3]), Number(m[4])];
      expect(da, q.id).toBe(db);
      expect(d.parts, q.id).toBe(da);
      const shaded = d.shaded ?? [];
      const result = op === "+" ? a + b : a - b;
      expect(shaded.length, q.id).toBe(result);
      expect(q.answer, q.id).toEqual({ n: result, d: da });
      if (op === "+") {
        expect(d.added?.length, q.id).toBe(b);
        expect(d.added!.every((i) => shaded.includes(i)), q.id).toBe(true);
      } else {
        expect(d.removed?.length, q.id).toBe(b);
        expect(d.removed!.some((i) => shaded.includes(i)), q.id).toBe(false);
      }
      checked++;
    }
    expect(checked).toBeGreaterThan(500);
  });

  it("flags adding the denominators as a possible misconception", () => {
    const tagged = items.filter((q) => (q.kind === "choose-fraction" && q.options.some((o) => o.misconception === "fractions.added-denominators")) || (q.kind === "choose" && q.options.some((o) => o.misconception === "fractions.added-denominators")));
    expect(tagged.length).toBeGreaterThan(100);
  });
});
