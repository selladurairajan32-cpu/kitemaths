import { latestJourney, masterySummary, topicOverview, type MasterySummary, type TopicOverview } from "@/engine/overview";
import { topicLearner, type LearnerState } from "@/engine/progress";
import type { JourneyProgress } from "@/engine/topicJourney";
import { TOPICS } from "./index";
import { topicRoutes } from "@/lib/routes";
import { JOURNEYS, type JourneyDef } from "./kit/journeys";
import { hasStudyPlan } from "./kit/study";
import { activeTopic, mapOrder } from "./recommend";
import type { TopicModule } from "./types";

/** D-043 step 3: the kid pages' view of every topic, in map order. */
export function topicOverviews(state: LearnerState): { topic: TopicModule; o: TopicOverview }[] {
  return [...TOPICS].sort(mapOrder).map((topic) => ({ topic, o: topicOverview(topic, topicLearner(state, topic.id)) }));
}

/**
 * The mastery ring covers the topics the child has started, and always the one they are in, so a new learner sees
 * "0 of N" for their first topic rather than an empty ring.
 */
export function ringSummary(state: LearnerState, all = topicOverviews(state)): MasterySummary {
  const here = activeTopic(state).id;
  return masterySummary(all.filter(({ topic, o }) => o.started || topic.id === here).map(({ o }) => o));
}

const journeyKey = (j: JourneyDef) => `${j.topicId}/${j.concept}`;

/** Continue Learning: the unfinished journey worked in last, with its definition. */
export function continueJourney(state: LearnerState): { def: JourneyDef; progress: JourneyProgress } | null {
  const last = latestJourney(state, (key) => JOURNEYS.find((j) => journeyKey(j) === key)?.skill);
  if (!last) return null;
  return { def: JOURNEYS.find((j) => journeyKey(j) === last.key)!, progress: last.progress };
}

/** Each journey with the child's saved progress, if any. */
export function journeyCards(state: LearnerState): { def: JourneyDef; progress: JourneyProgress | undefined }[] {
  return JOURNEYS.map((def) => ({ def, progress: state.journeys?.[journeyKey(def)] }));
}

/**
 * D-062: where a sub-topic (a lesson) is taught, so every page sends the child to the same place: the lesson canvas
 * where its skill has one (D-060), the topic learning page where the topic has a study plan (D-054), else the lesson.
 */
export function subTopicHref(topicId: string, lessonId: string, skill: string | null | undefined): string {
  const links = topicRoutes(topicId);
  const canvas = skill ? JOURNEYS.find((j) => j.topicId === topicId && j.skill === skill && j.canvas) : undefined;
  if (canvas) return links.learn(canvas.concept);
  return hasStudyPlan(topicId) ? links.study(lessonId) : links.lesson(lessonId);
}
