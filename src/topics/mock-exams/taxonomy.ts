import { hashString, prng } from "@/engine/random";
import type { KitChooseQuestion, KitNumberQuestion, KitQuestion } from "@/topics/kit/types";

/**
 * EXAM-003: the 11+ question taxonomy. Every question is tagged by curriculum skill, reasoning demand, representation,
 * difficulty, format and exam profile. Curriculum questions and exam-practice questions are kept apart by `style`: an
 * island question is "curriculum" with no exam profile; only questions asked as mock practice carry "exam-practice"
 * and a profile, so the two are never conflated (AC2).
 */

export type Reasoning = "recall" | "apply" | "multi-step" | "estimation" | "pattern" | "interpretation" | "working-backwards" | "method-selection";
export type Representation = "symbolic" | "word" | "table" | "chart" | "diagram";
export type Format = "number-entry" | "multiple-choice";

export interface QuestionTags {
  /** The island skill the question practises (for a borrowed mock question, the island it came from). */
  curriculumSkill: string;
  reasoning: Reasoning;
  representation: Representation;
  difficulty: 1 | 2 | 3;
  format: Format;
  style: "curriculum" | "exam-practice";
  /** Exam profiles the question is practice for: none for curriculum questions. */
  profiles: string[];
}

/** Mock-exams question makers whose reasoning demand is known by design (EXAM-004). */
const BY_TEMPLATE: Record<string, Reasoning> = {
  "mx-estimate": "estimation",
  "mx-pattern": "pattern",
  "mx-interpret": "interpretation",
  "mx-multistep": "multi-step",
  "mx-backwards": "working-backwards",
  "mx-method": "method-selection",
  // D-037 two-part questions: part (a) is one step; part (b) builds on it.
  "mx-twopart-a": "apply",
  "mx-twopart-b": "multi-step",
};
const CHARTS = ["barchart", "pictogram", "linegraph"];
const ID = /^g:([^.]+)\.([^:]+):([123]):/;

export function tagQuestion(q: KitQuestion, profileId = "general"): QuestionTags {
  const m = ID.exec(q.id);
  const topic = m?.[1] ?? q.skill.split(".")[0];
  const template = m?.[2] ?? "";
  const visual = (q.visual as { kind?: string } | undefined)?.kind;
  const prompt = q.prompt.replace(/\*\*/g, "");
  const exam = topic === "mock-exams";
  const representation: Representation = visual === "table" ? "table" : visual && CHARTS.includes(visual) ? "chart" : visual ? "diagram" : /^[\d\s,.+−×÷=?²()/%]+$/.test(prompt.trim()) ? "symbolic" : "word";
  const reasoning: Reasoning = BY_TEMPLATE[template] ?? (representation === "symbolic" ? "recall" : "apply");
  return {
    curriculumSkill: q.origin ?? q.skill,
    reasoning,
    representation,
    difficulty: (Number(m?.[3]) || 2) as 1 | 2 | 3,
    format: q.kind === "choose" ? "multiple-choice" : "number-entry",
    style: exam ? "exam-practice" : "curriculum",
    profiles: exam ? [profileId] : [],
  };
}

/**
 * EXAM-005: a written-answer question offered as multiple choice. The options are the answer, its trap answers (each
 * keeping its feedback) and nearby numbers, four in all, in number order. Deterministic for a question.
 */
/** A written-answer question as multiple choice: 4 options, or 5 lettered (A) to (E) for an answer sheet (D-037). */
export function asMultipleChoice(q: KitNumberQuestion, optionCount: 4 | 5 = 4): KitChooseQuestion {
  const rand = prng(hashString(`mc:${q.id}`));
  const values: { value: number; feedback?: string }[] = [{ value: q.answer }];
  for (const t of q.traps ?? []) if (!values.some((v) => v.value === t.value)) values.push({ value: t.value, feedback: t.feedback });
  // Nearby numbers: whole steps, or steps at the question's own decimal places.
  const places = q.decimals ?? 0;
  const round = (v: number) => Math.round(v * 10 ** places) / 10 ** places;
  const step = Math.max(10 ** -places, round(Math.abs(q.answer) / 10));
  for (const d of [1, -1, 2, -2, 10, -10].map((k) => k * step).sort(() => rand() - 0.5)) {
    if (values.length >= optionCount) break;
    const v = round(q.answer + d);
    if (v >= 0 && !values.some((x) => x.value === v)) values.push({ value: v });
  }
  const ordered = values.slice(0, optionCount).sort((a, b) => a.value - b.value);
  // "£" goes before the number; every other unit after it (as the number box shows it).
  const before = q.unit === "£";
  const text = (v: number) => `${before ? "£" : ""}${v.toLocaleString("en-GB", { minimumFractionDigits: places, maximumFractionDigits: places })}${q.unit && !before ? ` ${q.unit}` : ""}`;
  return {
    id: q.id,
    skill: q.skill,
    difficulty: q.difficulty,
    prompt: q.prompt,
    hint: q.hint,
    explanation: q.explanation,
    visual: q.visual,
    origin: q.origin,
    kind: "choose",
    fixedOrder: true,
    options: ordered.map((v, i) => ({ text: `${optionCount === 5 ? `(${"ABCDE"[i]}) ` : ""}${text(v.value)}`, ...(v.feedback ? { feedback: v.feedback } : {}) })),
    answer: ordered.findIndex((v) => v.value === q.answer),
  };
}
