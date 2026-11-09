import type { ComponentType } from "react";
import { FRACTIONS_SKILL_PREREQUISITES } from "@/curriculum/prerequisites";
import type { LabStepProps, Look, QuestionInputProps, TopicModule } from "@/topics/types";
import { followUpFor, FRACTIONS_TOPIC, practicePool } from "./index";
import { PHASE_DESCRIPTIONS } from "./journey";
import { LESSONS, lessonById } from "./lessons";
import { misconceptionById } from "./misconceptions";
import { placedOutLessons, placementOrder, placementShouldStop, PLACEMENT_PLAN } from "./placement";
import { ASSESSMENT_AREAS, ASSESSMENT_FORMS, assessmentItem, formForAttempt } from "./questions";
import { skillById } from "./skills";
import { answerText, evaluate, inputProblem, isResponseComplete, responseText } from "./evaluate";
import type { FractionQuestion } from "./types";
import { FractionsQuestionInput } from "./ui/FractionsQuestionInput";
import { FractionsFreeLab, FractionsLessonLab, FREE_LAB_INTRO, isFractionsLabStepDone } from "./ui/labs";
import { RemedyVisual } from "./ui/RemedyVisual";
import { wellFormedOnly } from "./ui/wellFormed";
import { VisualRenderer } from "./ui/Visuals";

const LESSON_LOOKS: Record<string, Look> = {
  wholes: { icon: "pizza", color: "var(--color-num)", soft: "var(--color-num-soft)" },
  naming: { icon: "fraction-bar", color: "var(--color-den)", soft: "var(--color-den-soft)" },
  lab: { icon: "paint", color: "var(--color-kite-red)", soft: "var(--color-brand-soft)" },
  comparing: { icon: "scales", color: "var(--color-sun-strong)", soft: "var(--color-sun-soft)" },
  equivalent: { icon: "puzzle", color: "var(--color-leaf)", soft: "var(--color-leaf-soft)" },
  "number-line": { icon: "ruler", color: "var(--color-kite-red)", soft: "var(--color-brand-soft)" },
  adding: { icon: "plus", color: "var(--color-leaf)", soft: "var(--color-leaf-soft)" },
  amounts: { icon: "sweets", color: "var(--color-num)", soft: "var(--color-num-soft)" },
  reasoning: { icon: "magnifier", color: "var(--color-den)", soft: "var(--color-den-soft)" },
};

const LOOK: Look = { icon: "pizza", color: "var(--color-num)", soft: "var(--color-num-soft)" };

/*
 * The topic's own components take its own question and picture types. The app
 * only ever hands them this topic's questions, so widening the prop types here
 * is safe — it's the one place the casts live.
 */
export const fractions: TopicModule<FractionQuestion> = {
  ...FRACTIONS_TOPIC,
  subject: "maths",
  world: "fdp",
  years: [3, 4, 5],
  order: 1,
  look: LOOK,
  lessons: LESSONS,
  skillPrerequisites: FRACTIONS_SKILL_PREREQUISITES,
  lessonLook: (id) => LESSON_LOOKS[id] ?? LOOK,
  phaseDescriptions: PHASE_DESCRIPTIONS,
  lessonById,
  skillById,
  misconceptionById,
  followUpFor,
  practicePool: (seed, results) => wellFormedOnly(practicePool(seed, results)),
  questions: {
    Input: FractionsQuestionInput as unknown as ComponentType<QuestionInputProps<FractionQuestion>>,
    evaluate: (q, r) => evaluate(q, r as Parameters<typeof evaluate>[1]),
    isComplete: (q, r) => isResponseComplete(q, r as Parameters<typeof isResponseComplete>[1]),
    inputProblem: (q, r) => inputProblem(q, r as Parameters<typeof inputProblem>[1]),
    answerText,
    responseText: (q, r) => responseText(q, r as Parameters<typeof responseText>[1]),
  },
  assessment: {
    areas: ASSESSMENT_AREAS,
    forms: ASSESSMENT_FORMS,
    formForAttempt,
    item: assessmentItem,
  },
  placement: {
    plan: PLACEMENT_PLAN,
    order: placementOrder,
    shouldStop: placementShouldStop,
    placedOut: placedOutLessons,
  },
  ui: {
    Visual: VisualRenderer as ComponentType<{ spec: unknown }>,
    Remedy: RemedyVisual,
    LabStep: FractionsLessonLab as ComponentType<LabStepProps>,
    isLabStepDone: isFractionsLabStepDone,
    FreeLab: FractionsFreeLab,
    freeLabIntro: FREE_LAB_INTRO,
  },
};
