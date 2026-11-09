import { addSubtract } from "./add-subtract";
import { areaPerimeter } from "./area-perimeter";
import { fractions } from "./fractions/module";
import { chartsData } from "./charts-data";
import { coordinates } from "./coordinates";
import { decimals } from "./decimals";
import { fractions2 } from "./fractions-2";
import { mockExams } from "./mock-exams";
import { multiplyDivide } from "./multiply-divide";
import { money } from "./money";
import { negative } from "./negative";
import { percentages } from "./percentages";
import { placeValue } from "./place-value";
import { problemSolving } from "./problem-solving";
import { ratioAlgebra } from "./ratio-algebra";
import { rounding } from "./rounding";
import { shapesAngles } from "./shapes-angles";
import { time } from "./time";
import { timesTables } from "./times-tables";
import { mentalMaths } from "./mental-maths";
import type { Question, TopicModule } from "./types";

/**
 * Every topic (island) in the app. Add a topic by building its module (see
 * `fractions/module.tsx`) and listing it here; ids for its skills, questions
 * and misconceptions must start with `<topic id>.`.
 */
export const TOPICS: TopicModule[] = [
  fractions as unknown as TopicModule,
  placeValue as unknown as TopicModule,
  rounding as unknown as TopicModule,
  negative as unknown as TopicModule,
  addSubtract as unknown as TopicModule,
  timesTables as unknown as TopicModule,
  multiplyDivide as unknown as TopicModule,
  mentalMaths as unknown as TopicModule,
  fractions2 as unknown as TopicModule,
  decimals as unknown as TopicModule,
  percentages as unknown as TopicModule,
  money as unknown as TopicModule,
  time as unknown as TopicModule,
  areaPerimeter as unknown as TopicModule,
  shapesAngles as unknown as TopicModule,
  coordinates as unknown as TopicModule,
  chartsData as unknown as TopicModule,
  ratioAlgebra as unknown as TopicModule,
  problemSolving as unknown as TopicModule,
  mockExams as unknown as TopicModule,
];

export const DEFAULT_TOPIC_ID = TOPICS[0].id;

const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function topicById(id: string): TopicModule | undefined {
  return BY_ID.get(id);
}

/** The topic a namespaced id belongs to: "fractions.compare", "g:fractions.nm-choose:2:7". */
export function topicIdOf(id: string): string {
  const bare = id.startsWith("g:") ? id.slice(2) : id;
  return bare.slice(0, bare.indexOf("."));
}

export function topicOf(id: string): TopicModule | undefined {
  return topicById(topicIdOf(id));
}

export function questionById(id: string): Question {
  const topic = topicOf(id);
  if (!topic) throw new Error(`No topic for question ${id}`);
  return topic.questionById(id);
}

/** "fractions.compare" → "compare" (for URLs). */
export function localId(id: string): string {
  return id.slice(id.indexOf(".") + 1);
}

/** "compare" in "fractions" → "fractions.compare". */
export function globalId(topicId: string, local: string): string {
  return local.startsWith(`${topicId}.`) ? local : `${topicId}.${local}`;
}
