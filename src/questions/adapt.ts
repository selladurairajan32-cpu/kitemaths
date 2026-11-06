/**
 * ARCH-002: adapters from the existing question data to QuestionDefinition, so today's questions can be validated
 * against the schema without changing them or any screen. Pure: no UI, no I/O.
 *
 * The caller supplies the curriculum level. These adapters never invent a year mapping: pass verified years, or
 * "unverified" (CUR-001 has not yet verified objective-level year mappings).
 */
import { fractionOfAmount, missingDenominator, missingNumerator } from "@/maths/fraction";
import type { Diagram, FractionQuestion } from "@/topics/fractions/types";
import type { Level, Model, NumericTrap, Option, QuestionDefinition } from "./schema";

export interface AdaptMeta {
  level: Level;
  /** Marks for a correct answer; 1 if not given. */
  marks?: number;
}

/** The parts of an existing kit question the adapter reads (kept structural so this layer needs no UI-coupled types). */
export type KitQuestionLike = {
  id: string;
  skill: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  hint: string;
  explanation: string;
  visual?: { kind: string };
} & (
  | { kind: "choose"; options: { text: string; misconception?: string; feedback?: string }[]; answer: number; fixedOrder?: boolean }
  | { kind: "number"; answer: number; unit?: string; traps?: { value: number; misconception?: string; feedback: string }[]; negative?: boolean; decimals?: number }
);

const tags = (...lists: ({ misconception?: string }[] | undefined)[]) => [...new Set(lists.flatMap((l) => (l ?? []).map((x) => x.misconception).filter((m): m is string => !!m)))];
const strip = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

function common(q: { id: string; skill: string; difficulty: 1 | 2 | 3; prompt: string; hint: string; explanation: string }, meta: AdaptMeta, misconceptions: string[], model?: Model) {
  return strip({
    id: q.id,
    skill: q.skill,
    level: meta.level,
    difficulty: q.difficulty,
    prompt: q.prompt,
    explanation: q.explanation,
    hints: q.hint.trim() ? [q.hint] : [],
    misconceptions,
    scoring: { marks: meta.marks ?? 1 },
    model,
  });
}

/** A Fractions picture as a schema model. */
export function modelOf(d: Diagram): Model {
  if (d.shape === "line") return strip({ kind: "number-line" as const, min: 0 as const, max: 1 as const, intervals: d.intervals, point: d.point });
  if (d.shape === "grid") return strip({ kind: "partition" as const, shape: "grid" as const, parts: d.rows * d.cols, shaded: d.shaded });
  return strip({ kind: "partition" as const, shape: d.shape, parts: d.parts, sizes: d.sizes, shaded: d.shaded });
}

const fracText = (f: { n: number; d: number }) => `{${f.n}/${f.d}}`;

export function fromFractionQuestion(q: FractionQuestion, meta: AdaptMeta): QuestionDefinition {
  switch (q.kind) {
    case "choose-fraction": {
      const options: Option[] = q.options.map((o, i) => strip({ id: `o${i}`, text: fracText(o), misconception: o.misconception }));
      const correct = q.options.findIndex((o) => o.n === q.answer.n && o.d === q.answer.d);
      return { ...common(q, meta, tags(q.options), modelOf(q.diagram)), interaction: "choose-one", options, correctId: `o${correct}` };
    }
    case "write-fraction":
      // Today's marking accepts equivalent fractions here (evaluate.ts: isCorrectFraction(…, true)).
      // `ask` comes from the existing data's own meaning (evaluate.ts countedParts): a number line asks for the marked
      // point; a partition asks for the shaded parts unless the question says "unshaded". Nothing is inferred from the answer.
      return {
        ...common(q, meta, [], modelOf(q.diagram)),
        interaction: "fraction-entry",
        answer: { n: q.answer.n, d: q.answer.d },
        validation: { acceptEquivalent: true },
        ask: q.diagram.shape === "line" ? "marked" : (q.ask ?? "shaded"),
      };
    case "choose":
      return {
        ...common(q, meta, tags(q.options), q.diagram ? modelOf(q.diagram) : undefined),
        interaction: "choose-one",
        options: q.options.map((o) => strip({ id: o.id, text: o.label, misconception: o.misconception, model: o.diagram ? modelOf(o.diagram) : undefined })),
        correctId: q.answer,
      };
    case "shade":
      // Today's marking accepts any shading of the right amount (count × d = n × parts).
      return { ...common(q, meta, [], modelOf(q.diagram)), interaction: "shade", target: { n: q.target.n, d: q.target.d }, validation: { acceptEquivalent: true } };
    case "equal-parts":
      return {
        ...common(q, meta, []),
        interaction: "multi-select",
        options: q.items.map((it, i) => ({ id: it.id, text: `Picture ${i + 1}`, model: modelOf(it.diagram) })),
        correctIds: [...q.answer],
      };
    case "match":
      return {
        ...common(q, meta, []),
        interaction: "match",
        rows: q.rows.map((r, i) => ({ id: r.id, text: `Picture ${i + 1}`, model: modelOf(r.diagram) })),
        choices: q.choices.map((c, i) => ({ id: `c${i}`, text: fracText(c) })),
        pairs: Object.fromEntries(q.rows.map((r) => [r.id, `c${q.choices.findIndex((c) => c.n === r.answer.n && c.d === r.answer.d)}`])),
      };
    case "compare": {
      const l = q.left.n * q.right.d;
      const r = q.right.n * q.left.d;
      return { ...common(q, meta, []), interaction: "compare", left: { n: q.left.n, d: q.left.d }, right: { n: q.right.n, d: q.right.d }, answer: l < r ? "<" : l > r ? ">" : "=" };
    }
    case "number-line-place":
      return { ...common(q, meta, []), interaction: "number-line-place", intervals: q.intervals, target: { n: q.target.n, d: q.target.d } };
    case "fraction-of":
      return strip({
        ...common(q, meta, tags(q.traps)),
        interaction: "fraction-of" as const,
        fraction: { n: q.fraction.n, d: q.fraction.d },
        amount: q.amount,
        answer: fractionOfAmount(q.fraction, q.amount) ?? Number.NaN,
        unit: q.unit,
        traps: q.traps?.map((t) => strip({ value: t.value, misconception: t.misconception, feedback: t.feedback })),
      });
    case "missing-number": {
      const findN = q.right.n === undefined;
      const answer = findN ? missingNumerator(q.left, q.right.d ?? 0) : missingDenominator(q.left, q.right.n ?? 0);
      return { ...common(q, meta, []), interaction: "missing-number", left: { n: q.left.n, d: q.left.d }, right: { n: q.right.n ?? null, d: q.right.d ?? null }, answer: answer ?? Number.NaN };
    }
    case "number":
      return strip({
        ...common(q, meta, tags(q.traps), q.diagram ? modelOf(q.diagram) : undefined),
        interaction: "number-entry" as const,
        answer: q.answer,
        // Today's Fractions marking compares exactly (value === answer) and takes whole numbers.
        validation: { comparison: { kind: "exact" as const }, maxDecimals: 0, allowNegative: false },
        unit: q.unit,
        traps: q.traps?.map((t) => strip({ value: t.value, misconception: t.misconception, feedback: t.feedback })),
      });
    case "explain-frame":
      return {
        ...common(q, meta, tags(...q.frame.map((p) => (typeof p === "string" ? [] : p.options))), q.diagram ? modelOf(q.diagram) : undefined),
        interaction: "explain-frame",
        frame: q.frame.map((p) => (typeof p === "string" ? p : { slot: p.slot, options: p.options.map((o) => strip({ id: o.id, text: o.label, misconception: o.misconception })), answerId: p.answer })),
      };
    case "counterexample":
      return { ...common(q, meta, []), interaction: "counterexample", predicate: { id: q.claim, params: { maxDenominator: q.maxDenominator } } };
  }
}

export function fromKitQuestion(q: KitQuestionLike, meta: AdaptMeta): QuestionDefinition {
  const model: Model | undefined = q.visual ? { kind: "other", description: `kit "${q.visual.kind}" picture` } : undefined;
  if (q.kind === "choose") {
    return strip({
      ...common(q, meta, tags(q.options), model),
      interaction: "choose-one" as const,
      options: q.options.map((o, i) => strip({ id: `o${i}`, text: o.text, misconception: o.misconception, feedback: o.feedback })),
      correctId: `o${q.answer}`,
      fixedOrder: q.fixedOrder,
    });
  }
  const traps: NumericTrap[] | undefined = q.traps?.map((t) => strip({ value: t.value, misconception: t.misconception, feedback: t.feedback }));
  return strip({
    ...common(q, meta, tags(q.traps), model),
    interaction: "number-entry" as const,
    answer: q.answer,
    // Today's kit marking (kit/evaluate.ts `same`) treats answers equal when they agree to 3 decimal places.
    validation: { comparison: { kind: "round" as const, places: 3 }, maxDecimals: q.decimals ?? 0, allowNegative: q.negative ?? false },
    unit: q.unit,
    traps: traps?.length ? traps : undefined,
  });
}
