import { recommendNext } from "@/engine/journey";
import { topicLearner, type LearnerState } from "@/engine/progress";
import { DEFAULT_TOPIC_ID, TOPICS, topicById } from "./index";
import type { TopicModule } from "./types";

/**
 * The island a learner should see on their home screen: the one they were
 * last working in, unless it's finished, in which case the next unfinished
 * island in map order. Prerequisite-aware ordering comes with more topics.
 */
export function activeTopic(state: LearnerState): TopicModule {
  const current = topicById(state.currentTopicId ?? DEFAULT_TOPIC_ID) ?? TOPICS[0];
  const finished = (t: TopicModule) => recommendNext(t, topicLearner(state, t.id)).kind === "results";
  if (!finished(current)) return current;
  return [...TOPICS].sort((a, b) => a.order - b.order).find((t) => !finished(t)) ?? current;
}
