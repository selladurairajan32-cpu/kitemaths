/**
 * Question forms (MAST-001 varied examples, D-033). Pure.
 *
 * A form is a kind of question. On kit islands each question maker is its own form (its template key, from a
 * generated id `g:<topic>.<template>:…`); elsewhere it is the question's kind and its picture ("shade:circle").
 * Islands register how many forms each skill offers, so "secure" never asks for more variety than a skill has.
 */

const GENERATED = /^g:[^.]+\.([^:]+):/;

export function questionForm(q: { id: string } & object): string {
  const m = GENERATED.exec(q.id);
  if (m) return m[1];
  const x = q as { kind?: string; visual?: { kind?: string }; diagram?: { shape?: string } };
  return [x.kind ?? "question", x.visual?.kind ?? x.diagram?.shape].filter(Boolean).join(":");
}

const available = new Map<string, number>();

/** Records how many distinct forms a skill's questions offer (called once per island when islands load). */
export function registerSkillForms(skill: string, forms: number): void {
  available.set(skill, forms);
}

/** The forms a skill offers, or undefined if no island registered it. */
export const skillFormsAvailable = (skill: string): number | undefined => available.get(skill);
