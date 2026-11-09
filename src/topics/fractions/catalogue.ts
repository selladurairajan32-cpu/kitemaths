import { generateFromId, TEMPLATE_INFO } from "./generate";
import { MISCONCEPTIONS } from "./misconceptions";
import { ALL_QUESTIONS } from "./questions";
import { SKILLS } from "./skills";
import type { FractionQuestion } from "./types";

/**
 * MIS-001 and MIS-002: the misconception catalogue and the distractor-to-misconception map, built from the content
 * itself so the document cannot drift from what the app does. Pure. `catalogue.test.ts` keeps the document current.
 */

const SEEDS = 60;

/** Every answer option, trap or frame choice in a question that is tagged with a misconception. */
export function taggedAnswers(q: FractionQuestion): { answer: string; misconception: string }[] {
  const out: { answer: string; misconception: string }[] = [];
  const fr = (f: { n: number; d: number }) => `${f.n}/${f.d}`;
  switch (q.kind) {
    case "choose-fraction":
      for (const o of q.options) if (o.misconception) out.push({ answer: fr(o), misconception: o.misconception });
      break;
    case "choose":
      for (const o of q.options) if (o.misconception) out.push({ answer: o.label.replace(/[{}*]/g, ""), misconception: o.misconception });
      break;
    case "fraction-of":
    case "number":
      for (const t of q.traps ?? []) if (t.misconception) out.push({ answer: String(t.value), misconception: t.misconception });
      break;
    case "explain-frame":
      for (const part of q.frame) if (typeof part !== "string") for (const o of part.options) if (o.misconception) out.push({ answer: o.label, misconception: o.misconception });
      break;
  }
  return out;
}

function generatedSamples(): FractionQuestion[] {
  return TEMPLATE_INFO.flatMap((t) => t.difficulties.flatMap((d) => Array.from({ length: SEEDS }, (_, seed) => generateFromId(`g:fractions.${t.key}:${d}:${seed}`)!)));
}

export function catalogueMarkdown(): string {
  const skillTitle = (id: string) => SKILLS.find((s) => s.id === id)?.title ?? id;
  const generated = generatedSamples();
  const lines: string[] = [];
  const w = (x = "") => lines.push(x);
  w("<!-- Generated from src/topics/fractions/{misconceptions,questions,generate}.ts by catalogue.ts. Run `UPDATE_DOCS=1 npx vitest run src/topics/fractions/catalogue.test.ts` after changing content. -->");
  w("# Fractions misconception catalogue (MIS-001, MIS-002)");
  w();
  w("Status: READY FOR QA (R1, D-026). Each entry is a **possible** misconception: the app never claims to know a child's thinking from one answer (MIS-003). Educational review of the wording is CUR-004.");
  w();
  w("## 1. Catalogue");
  w();
  for (const m of MISCONCEPTIONS) {
    w(`### ${m.name}`);
    w();
    w(`- **Id:** \`${m.id}\``);
    w(`- **Skills:** ${m.skills.map(skillTitle).join(", ")}`);
    w(`- **Example evidence:** ${m.description}`);
    w(`- **What the child is told (hedged):** ${m.possibleCause}`);
    w(`- **Recovery explanation:** ${m.explanation.join(" ")}`);
    w(`- **Alternative explanations:** ${(m.alternatives ?? []).join(" ") || "None recorded."}`);
    w(`- **Recovery activity:** guided follow-up questions ${m.followUps.map((f) => `\`${f}\``).join(" and ")}, then a transfer question: a new question on the same skill (MIS-004).`);
    w();
  }
  w("## 2. Distractor-to-misconception map");
  w();
  w("Every tagged wrong answer in the hand-written questions. A tag is attached only to an answer that the misconception would produce; untagged wrong answers give a hint, not a diagnosis.");
  w();
  w("| Misconception | Question | Tagged answer |");
  w("|---|---|---|");
  for (const m of MISCONCEPTIONS) {
    for (const q of ALL_QUESTIONS) for (const t of taggedAnswers(q)) if (t.misconception === m.id) w(`| ${m.name} | \`${q.id}\` | ${t.answer.replace(/\|/g, "/")} |`);
  }
  w();
  w(`Generated questions (${SEEDS} seeds per template and difficulty) tag answers as follows:`);
  w();
  w("| Misconception | Templates | Tagged answers in the sample |");
  w("|---|---|---|");
  for (const m of MISCONCEPTIONS) {
    const hits = generated.flatMap((q) => taggedAnswers(q).filter((t) => t.misconception === m.id).map(() => q.id.split(":")[1].replace("fractions.", "")));
    w(`| ${m.name} | ${[...new Set(hits)].sort().join(", ") || "none"} | ${hits.length} |`);
  }
  w();
  return lines.join("\n");
}
