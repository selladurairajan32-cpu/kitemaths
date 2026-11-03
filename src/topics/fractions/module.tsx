import type { ComponentType } from "react";
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
import { VisualRenderer } from "./ui/Visuals";

const LESSON_LOOKS: Record<string, Look> = {
  wholes: { icon: "pizza", color: "#f4623a", soft: "#fde5dc" },
  naming: { icon: "fraction-bar", color: "#2f6fd8", soft: "#dfeafb" },
  lab: { icon: "paint", color: "#e8343f", soft: "#fbe1e3" },
  comparing: { icon: "scales", color: "#d99a00", soft: "#fff4d4" },
  equivalent: { icon: "puzzle", color: "#3dae6b", soft: "#dcf3e5" },
  "number-line": { icon: "ruler", color: "#e8343f", soft: "#fbe1e3" },
  amounts: { icon: "sweets", color: "#f4623a", soft: "#fde5dc" },
  reasoning: { icon: "magnifier", color: "#2f6fd8", soft: "#dfeafb" },
};

const LOOK: Look = { icon: "pizza", color: "#f4623a", soft: "#fde5dc" };

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
  lessonLook: (id) => LESSON_LOOKS[id] ?? LOOK,
  phaseDescriptions: PHASE_DESCRIPTIONS,
  lessonById,
  skillById,
  misconceptionById,
  followUpFor,
  practicePool,
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
