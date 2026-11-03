import type { Skill } from "@/engine/types";

export const SKILLS: Skill[] = [
  {
    id: "fractions.equal-parts",
    title: "Wholes and equal parts",
    description: "Knows a fraction needs a whole split into equal parts.",
    lessonId: "wholes",
  },
  {
    id: "fractions.name",
    title: "Reading fractions",
    description: "Names the fraction shown by a diagram, using numerator and denominator.",
    lessonId: "naming",
  },
  {
    id: "fractions.represent",
    title: "Showing fractions",
    description: "Shades or builds a diagram to show a given fraction.",
    lessonId: "lab",
  },
  {
    id: "fractions.compare",
    title: "Comparing fractions",
    description: "Decides which of two fractions of the same whole is bigger.",
    lessonId: "comparing",
  },
  {
    id: "fractions.equivalent",
    title: "Equivalent fractions",
    description: "Finds fractions that show the same amount.",
    lessonId: "equivalent",
  },
  {
    id: "fractions.number-line",
    title: "Fractions on a number line",
    description: "Places and reads fractions on a number line from 0 to 1.",
    lessonId: "number-line",
  },
  {
    id: "fractions.fraction-of",
    title: "Fractions of amounts",
    description: "Finds a fraction of a number or quantity, including word problems.",
    lessonId: "amounts",
  },
  {
    id: "fractions.reasoning",
    title: "Explaining and spotting mistakes",
    description: "Judges claims, builds explanations with sentence frames and finds counterexamples.",
    lessonId: "reasoning",
  },
];

export const SKILL_ORDER = SKILLS.map((s) => s.id);

export function skillById(id: string): Skill {
  const s = SKILLS.find((k) => k.id === id);
  if (!s) throw new Error(`Unknown skill ${id}`);
  return s;
}
