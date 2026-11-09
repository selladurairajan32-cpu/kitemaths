import { answerText } from "./evaluate";
import { LESSONS, type LessonStep } from "./lessons";
import { MISCONCEPTIONS } from "./misconceptions";
import { ASSESSMENT_FORMS, FOLLOWUP_QUESTIONS, LESSON_QUESTIONS, PRACTICE_QUESTIONS } from "./questions";
import type { Diagram, FractionQuestion } from "./types";

/**
 * CUR-004: every authored Fractions example, picture, question, distractor and explanation, laid out for an independent
 * mathematical and educational review. Generated from the content; `reviewPack.test.ts` keeps the document current.
 */

const clean = (t: string) => t.replace(/\|/g, "/").replace(/\n/g, " ");
const stop = (t: string) => (/[.?!:]$/.test(t) ? t : `${t}.`);
const misName = (id?: string) => (id ? MISCONCEPTIONS.find((m) => m.id === id)?.name ?? id : "");

function picture(d: Diagram): string {
  switch (d.shape) {
    case "line":
      return `number line, ${d.intervals} gaps${d.point !== undefined ? `, point at ${d.point}` : ""}`;
    case "grid":
      return `${d.rows}×${d.cols} grid, ${d.shaded?.length ?? 0} shaded`;
    default: {
      const extra = d.added?.length ? `, ${d.added.length} of them added` : d.removed?.length ? `, ${d.removed.length} more crossed out` : "";
      return `${d.shape}, ${d.parts} ${d.sizes ? "UNEQUAL" : "equal"} parts, ${d.shaded?.length ?? 0} shaded${extra}`;
    }
  }
}

function distractors(q: FractionQuestion): string {
  switch (q.kind) {
    case "choose-fraction":
      return q.options.filter((o) => !(o.n === q.answer.n && o.d === q.answer.d)).map((o) => `${o.n}/${o.d}${o.misconception ? ` (${misName(o.misconception)})` : ""}`).join("; ");
    case "choose":
      return q.options.filter((o) => o.id !== q.answer).map((o) => `${clean(o.label)}${o.misconception ? ` (${misName(o.misconception)})` : ""}`).join("; ");
    case "fraction-of":
    case "number":
      return (q.traps ?? []).map((t) => `${t.value}${t.misconception ? ` (${misName(t.misconception)})` : ""}`).join("; ");
    default:
      return "";
  }
}

function questionRow(q: FractionQuestion): string {
  const pic = "diagram" in q && q.diagram ? picture(q.diagram) : q.kind === "equal-parts" ? q.items.map((i) => picture(i.diagram)).join(" / ") : q.kind === "match" ? q.rows.map((r) => picture(r.diagram)).join(" / ") : "";
  return `| \`${q.id.replace("fractions.", "")}\` | ${q.kind} | ${clean(q.prompt)} | ${clean(answerText(q))} | ${clean(distractors(q)) || "—"} | ${pic || "—"} | ${clean(q.hint) || "—"} | ${clean(q.explanation)} | ☐ |`;
}

const HEAD = "| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |\n|---|---|---|---|---|---|---|---|---|";

function stepText(s: LessonStep): string {
  switch (s.type) {
    case "explain":
      return `**Explain: ${stop(s.title)}** ${s.body.join(" ")}${s.tip ? ` _Tip:_ ${s.tip}` : ""}`;
    case "worked":
      return `**Worked (${s.support === "full" ? "watch me" : "together"}): ${stop(s.title)}** ${s.problem} ${s.steps.map((w) => w.text + (w.blank ? ` [child enters ${w.blank.answer}; hint: ${w.blank.hint}]` : "")).join(" ")} ${s.conclusion}`;
    case "check":
      return `**Check: ${s.title}** (\`${s.questionId.replace("fractions.", "")}\`)`;
    default:
      return `**${s.type}: ${s.title}**`;
  }
}

export function reviewPackMarkdown(): string {
  const o: string[] = [];
  o.push("<!-- Generated from src/topics/fractions by reviewPack.ts. Run `UPDATE_DOCS=1 npx vitest run src/topics/fractions/reviewPack.test.ts` after changing content. -->");
  o.push("# CUR-004: Fractions content review pack");
  o.push("");
  o.push("For the **independent** reviewer (CUR-004). It lists every authored lesson step, question, distractor, picture and explanation in the R1 Fractions island. Tick each row, or log a defect in `traceability/defects.csv` (QA-004). Automated checks already cover arithmetic correctness, equal partitions and that pictures match answers (`content.test.ts`, `journey-content.test.ts`, `practice-rules.test.ts`); the review is for **ambiguity, wording, age-appropriateness and teaching quality**, which the tests cannot judge. Generated questions (templates in `generate.ts`) are listed in [PRACT-007](PRACT-007-question-variation.md).");
  o.push("");
  o.push("## 1. Lessons");
  for (const l of LESSONS) {
    o.push("");
    o.push(`### ${l.title} (\`${l.id}\`, ${l.phase})`);
    o.push("");
    o.push(`Objectives: ${l.objectives.join("; ")}.`);
    o.push("");
    for (const s of l.steps) o.push(`- ${stepText(s as LessonStep)}`);
  }
  for (const [title, qs] of [["2. Lesson questions", LESSON_QUESTIONS], ["3. Practice questions", PRACTICE_QUESTIONS], ["4. Follow-up questions (misconception recovery)", FOLLOWUP_QUESTIONS], ["5. Mastery check, form A", ASSESSMENT_FORMS.A], ["6. Mastery check, form B", ASSESSMENT_FORMS.B]] as const) {
    o.push("");
    o.push(`## ${title}`);
    o.push("");
    o.push(HEAD);
    for (const q of qs) o.push(questionRow(q));
  }
  o.push("");
  return o.join("\n");
}
