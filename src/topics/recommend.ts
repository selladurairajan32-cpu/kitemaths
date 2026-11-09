import { recommendNext } from "@/engine/journey";
import { topicLearner, type LearnerState } from "@/engine/progress";
import { DEFAULT_TOPIC_ID, TOPICS, topicById } from "./index";
import type { TopicModule } from "./types";
import { WORLDS } from "./worlds";

/** Map order: world by world, then each island's order within its world (DEF-013). */
export function mapOrder(a: TopicModule, b: TopicModule): number {
  const w = (t: TopicModule) => WORLDS.findIndex((x) => x.id === t.world);
  return w(a) - w(b) || a.order - b.order;
}

/**
 * The island a learner should see on their home screen: the one they were
 * last working in, unless it's finished, in which case the next unfinished
 * island in map order. Prerequisite-aware ordering comes with more topics.
 */
export function activeTopic(state: LearnerState): TopicModule {
  const current = topicById(state.currentTopicId ?? DEFAULT_TOPIC_ID) ?? TOPICS[0];
  const finished = (t: TopicModule) => recommendNext(t, topicLearner(state, t.id)).kind === "results";
  if (!finished(current)) return current;
  return [...TOPICS].sort(mapOrder).find((t) => !finished(t)) ?? current;
}
