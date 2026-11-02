import type { TopicDefinition } from "@/engine/journey";
import { LESSONS } from "./lessons";
import { MISCONCEPTIONS } from "./misconceptions";
import { ASSESSMENT_FORMS, PRACTICE_QUESTIONS, questionById } from "./questions";
import { SKILLS } from "./skills";
import type { FractionQuestion } from "./types";

export const FRACTIONS_TOPIC: TopicDefinition<FractionQuestion> = {
  id: "fractions",
  title: "Fractions foundations",
  subtitle: "Understanding fractions from the very beginning: the first fractions module",
  skills: SKILLS,
  lessons: LESSONS,
  practiceQuestions: PRACTICE_QUESTIONS,
  assessmentQuestions: ASSESSMENT_FORMS.A,
  misconceptions: MISCONCEPTIONS,
  questionById,
};

/** Picks the first follow-up for the first suspected misconception. */
export function followUpFor(suspected: string[], used: string[] = []): string | null {
  for (const id of suspected) {
    const def = MISCONCEPTIONS.find((m) => m.id === id);
    if (!def) continue;
    const next = def.followUps.find((q) => !used.includes(q)) ?? def.followUps[0];
    if (next) return next;
  }
  return null;
}
