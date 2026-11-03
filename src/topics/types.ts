import type { ComponentType } from "react";
import type { TopicDefinition } from "@/engine/journey";
import type { Evaluation, ItemResult, MisconceptionDef, Phase, QuestionBase, Skill } from "@/engine/types";
import type { Lesson, LessonStep } from "@/lessons/types";

/**
 * A topic module: everything the app needs to teach one island. The engine
 * sees only the `TopicDefinition` part; the UI also uses the question kit,
 * lessons and the topic's own visuals.
 *
 * Question kinds belong to their topic, so two topics can each have a
 * "choose" kind without clashing. Reusable kinds can be shared as modules a
 * topic includes in its kit.
 */

export interface Question extends QuestionBase {
  kind: string;
}

export interface AnswerResponse {
  kind: string;
}

export interface QuestionInputProps<Q extends Question = Question, R extends AnswerResponse = AnswerResponse> {
  question: Q;
  response: R | null;
  onChange: (r: R | null) => void;
  locked: boolean;
  reveal?: boolean;
  orderKey?: string;
}

/** How a topic shows, marks and describes its questions. */
export interface QuestionKit<Q extends Question = Question, R extends AnswerResponse = AnswerResponse> {
  Input: ComponentType<QuestionInputProps<Q, R>>;
  evaluate(q: Q, r: R): Evaluation;
  isComplete(q: Q, r: R | null): boolean;
  /** A message when the answer can't be marked yet (e.g. a 0 denominator). */
  inputProblem(q: Q, r: R | null): string | null;
  /** The correct answer, with {n/d} and **bold** markup. */
  answerText(q: Q): string;
  /** What the child answered, for review screens. */
  responseText(q: Q, r: R | undefined): string;
}

export interface Look {
  emoji: string;
  color: string;
  soft: string;
}

export interface AssessmentKit<Q extends Question = Question> {
  areas: string[];
  forms: Record<string, (Q & { area: string })[]>;
  formForAttempt(timesCompleted: number, lastForm?: string): string;
  item(id: string): (Q & { area: string }) | undefined;
}

/** The warm-up that decides where a new learner starts in this topic. */
export interface PlacementKit {
  plan: { lessonId: string }[];
  order(seed: string | number): string[];
  shouldStop(answers: boolean[]): boolean;
  placedOut(answers: boolean[]): string[];
}

export interface LabStepProps {
  step: Extract<LessonStep, { type: "lab" }>;
  completed: string[];
  onChallengeComplete: (id: string) => void;
}

export interface TopicUI {
  /** Draws the topic's lesson pictures. */
  Visual: ComponentType<{ spec: unknown }>;
  /** A picture that helps with a misconception, if the topic has one. */
  Remedy?: ComponentType<{ misconception: string }>;
  LabStep?: ComponentType<LabStepProps>;
  isLabStepDone?(step: Extract<LessonStep, { type: "lab" }>, completed: string[]): boolean;
  /** Free-play lab page, if the topic has one. */
  FreeLab?: ComponentType;
  freeLabIntro?: string;
}

export interface TopicModule<Q extends Question = Question> extends TopicDefinition<Q> {
  subject: "maths";
  /** The world (strand) this island belongs to, e.g. "fdp". */
  world: string;
  years: number[];
  order: number;
  look: Look;
  lessons: Lesson[];
  lessonLook(lessonId: string): Look;
  phaseDescriptions: Record<Phase, string>;
  lessonById(id: string): Lesson | undefined;
  skillById(id: string): Skill;
  misconceptionById(id: string): MisconceptionDef | undefined;
  followUpFor(suspected: string[], used?: string[]): string | null;
  practicePool(sessionSeed: string | number | null, results: ItemResult[]): Q[];
  questions: QuestionKit<Q>;
  assessment: AssessmentKit<Q>;
  placement?: PlacementKit;
  ui: TopicUI;
}
