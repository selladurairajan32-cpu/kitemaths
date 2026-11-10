import { KitLabStep, KitRemedy, isKitLabDone } from "./explainers";
import type { ComponentType } from "react";
import { hashString, prng } from "@/engine/random";
import type { ItemResult, MisconceptionDef, Phase } from "@/engine/types";
import type { AssessmentKit, Look, QuestionInputProps, TopicModule } from "@/topics/types";
import { answerText, evaluate, inputProblem, isComplete, responseText } from "./evaluate";
import { KitQuestionInput } from "./Input";
import { MathVisual } from "./visuals";
import type { Difficulty, KitQuestion, KitResponse, NumericTrap, Template, TopicSpec } from "./types";

/**
 * Turns an island's content (skills, lessons, question makers, misconceptions, warm-up plan)
 * into a full topic module for the engine: generated practice, the big challenge in two forms,
 * the warm-up and follow-up questions all come from the question makers.
 */

const ID = /^g:([^.]+)\.([^:]+):([123]):(\d+)$/;

/** A generated question id: `g:<topic>.<template>:<difficulty>:<seed>`. */
export function genId(topic: string, template: string, difficulty: Difficulty, seed: number): string {
  return `g:${topic}.${template}:${difficulty}:${seed}`;
}

/** `gen(template, difficulty, seed)` for one topic: used in lessons to name a check question. */
export function genFor(topic: string) {
  return (template: string, difficulty: Difficulty, seed: number) => genId(topic, template, difficulty, seed);
}

const PHASES: Record<Phase, string> = {
  Understand: "Meet the big idea with pictures and everyday words.",
  Visualise: "See the numbers as blocks, bars and number lines.",
  Explore: "Try ideas out and spot the patterns.",
  Practise: "Strengthen each skill with practice that adapts.",
  Explain: "Say why an answer is right, and spot mistakes.",
  Apply: "Use the skill to solve real problems.",
  Master: "Show what you know on your own, and fix anything that needs another look.",
};

/** Every kit island's question makers, so mixed islands (like mock exams) can borrow them. */
const REGISTRY = new Map<string, Template[]>();
export function templatesOf(topicId: string): Template[] {
  return REGISTRY.get(topicId) ?? [];
}

export function defineTopic(spec: TopicSpec): TopicModule<KitQuestion> {
  const templates = new Map<string, Template>(spec.templates.map((t) => [t.key, t]));
  REGISTRY.set(spec.id, spec.templates);

  function make(id: string): KitQuestion | null {
    const m = ID.exec(id);
    if (!m || m[1] !== spec.id) return null;
    const t = templates.get(m[2]);
    const d = Number(m[3]) as Difficulty;
    if (!t || !t.difficulties.includes(d)) return null;
    const rng = prng(hashString(`${spec.id}:${t.key}:${d}:${m[4]}`));
    const body = t.make(rng, { id, skill: t.skill, difficulty: d });
    // DEF-028: a generator can emit two traps with the same value; only the first's feedback could ever show, so the
    // repeat is dropped. No answer, option or visible feedback changes.
    const raw = body.kind === "number" ? (body as { traps?: NumericTrap[] }).traps : undefined;
    const traps = raw ? raw.filter((x, i, all) => all.findIndex((y) => y.value === x.value) === i) : undefined;
    return { ...body, ...(traps ? { traps } : {}), id, skill: t.skill, difficulty: d } as KitQuestion;
  }

  function questionById(id: string): KitQuestion {
    const q = make(id);
    if (!q) throw new Error(`Unknown question ${id}`);
    return q;
  }

  const key = (q: KitQuestion) => `${q.skill}|${q.prompt}|${q.kind === "choose" ? q.options.map((o) => o.text).join("/") : q.answer}`;

  // A fixed bank, so the engine always has a known list (and tests can walk it).
  const practiceQuestions = spec.templates.flatMap((t) => t.difficulties.flatMap((d) => [1, 2, 3].map((s) => questionById(genId(spec.id, t.key, d, s)))));

  /** Fresh questions for a practice session, never ones already seen. */
  function practicePool(sessionSeed: string | number | null, results: ItemResult[]): KitQuestion[] {
    const seen = new Set<string>();
    for (const r of results) {
      const q = make(r.questionId);
      if (q) seen.add(key(q));
    }
    const out: KitQuestion[] = [];
    for (const t of spec.templates) {
      for (const d of t.difficulties) {
        let made = 0;
        for (let attempt = 0; attempt < 16 && made < 4; attempt++) {
          const seed = hashString(`${sessionSeed ?? 0}:${t.key}:${d}:${attempt}`) % 1_000_000_000;
          const q = make(genId(spec.id, t.key, d, seed));
          if (!q || seen.has(key(q))) continue;
          seen.add(key(q));
          out.push(q);
          made++;
        }
      }
    }
    return out;
  }

  // The big challenge: two questions for every skill, in two forms with different numbers.
  const areas = spec.skills.map((s) => s.title);
  const formFor = (form: "A" | "B") =>
    spec.skills.flatMap((s) => {
      const ts = spec.templates.filter((t) => t.skill === s.id);
      return [0, 1].map((k) => {
        const t = ts[k % ts.length];
        const d = t.difficulties[Math.min(t.difficulties.length - 1, 1 + k)] ?? t.difficulties[0];
        const seed = hashString(`${spec.id}:check:${form}:${s.id}:${k}`) % 1_000_000;
        return { ...questionById(genId(spec.id, t.key, d, seed)), area: s.title };
      });
    });
  const forms = { A: formFor("A"), B: formFor("B") };
  const allChecks = [...forms.A, ...forms.B];
  const assessment: AssessmentKit<KitQuestion> = {
    areas,
    forms,
    formForAttempt: (timesCompleted, lastForm) => (lastForm ? (lastForm === "A" ? "B" : "A") : timesCompleted % 2 === 0 ? "A" : "B"),
    item: (id) => allChecks.find((q) => q.id === id),
  };

  const misconceptions: MisconceptionDef[] = spec.misconceptions.map((m) => ({
    id: m.id,
    name: m.name,
    possibleCause: m.possibleCause,
    description: m.description,
    explanation: m.explanation,
    skills: m.skills,
    followUps: m.followUpTemplates.flatMap((tk) => {
      const t = templates.get(tk);
      if (!t) return [];
      return [genId(spec.id, tk, t.difficulties[0], 11), genId(spec.id, tk, t.difficulties[t.difficulties.length - 1], 23)];
    }),
  }));

  const look: Look = { icon: spec.icon, color: "var(--color-brand)", soft: "var(--color-brand-soft)" };
  const lessonLooks = new Map(spec.lessons.map((l) => [l.id, { ...look, icon: spec.lessonIcons[l.id] ?? spec.icon } as Look]));
  const skills = spec.skills;

  return {
    id: spec.id,
    title: spec.title,
    subtitle: spec.subtitle,
    subject: "maths",
    world: spec.world,
    years: spec.years,
    order: spec.order,
    skills,
    lessons: spec.lessons,
    practiceQuestions,
    assessmentQuestions: forms.A,
    misconceptions,
    questionById,
    look,
    lessonLook: (id) => lessonLooks.get(id) ?? look,
    phaseDescriptions: PHASES,
    lessonById: (id) => spec.lessons.find((l) => l.id === id),
    skillById: (id) => {
      const s = skills.find((x) => x.id === id);
      if (!s) throw new Error(`Unknown skill ${id}`);
      return s;
    },
    misconceptionById: (id) => misconceptions.find((m) => m.id === id),
    followUpFor: (suspected, used = []) => {
      for (const id of suspected) {
        const def = misconceptions.find((m) => m.id === id);
        if (!def) continue;
        const next = def.followUps.find((q) => !used.includes(q)) ?? def.followUps[0];
        if (next) return next;
      }
      return null;
    },
    practicePool,
    questions: {
      Input: KitQuestionInput as unknown as ComponentType<QuestionInputProps<KitQuestion>>,
      evaluate: (q, r) => evaluate(q, r as KitResponse),
      isComplete: (q, r) => isComplete(q, r as KitResponse | null),
      inputProblem: (q, r) => inputProblem(q, r as KitResponse | null),
      answerText,
      responseText: (q, r) => responseText(q, r as KitResponse | undefined),
    },
    assessment,
    placement: {
      plan: spec.placement.map((p) => ({ lessonId: p.lessonId })),
      order: (seed) => spec.placement.map((p) => genId(spec.id, p.template, templates.get(p.template)?.difficulties.includes(2) ? 2 : (templates.get(p.template)?.difficulties[0] ?? 1), hashString(`${seed}:${p.lessonId}`) % 1_000_000_000)),
      shouldStop: (answers) => answers.length >= 2 && answers.slice(-2).every((ok) => !ok),
      placedOut: (answers) => {
        const firstWrong = answers.indexOf(false);
        const prefix = firstWrong === -1 ? answers.length : firstWrong;
        return spec.placement.slice(0, prefix).map((p) => p.lessonId);
      },
    },
    ui: { Visual: MathVisual as ComponentType<{ spec: unknown }>, LabStep: KitLabStep, isLabStepDone: isKitLabDone, Remedy: KitRemedy },
  };
}

/* Helpers for writing question makers. */
export const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
export const pick = <T,>(r: () => number, items: readonly T[]): T => items[Math.floor(r() * items.length)];
/** Options with the right one at a random place; returns the options and its index. */
export function withAnswer<T>(r: () => number, right: T, wrong: T[]): { options: T[]; answer: number } {
  const options = [...wrong];
  const answer = Math.floor(r() * (wrong.length + 1));
  options.splice(answer, 0, right);
  return { options, answer };
}
