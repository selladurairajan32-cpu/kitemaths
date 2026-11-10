import { recommendNext } from "@/engine/journey";
import { topicLearner, type LearnerState } from "@/engine/progress";
import { TOPICS, topicById } from "./index";
import type { TopicModule } from "./types";
import { WORLDS } from "./worlds";

/** Map order: world by world, then each island's order within its world (DEF-013). */
export function mapOrder(a: TopicModule, b: TopicModule): number {
  const w = (t: TopicModule) => WORLDS.findIndex((x) => x.id === t.world);
  return w(a) - w(b) || a.order - b.order;
}

/**
 * DEF-001 (D-033): where a new learner starts: the first island in map order that suits their school year, or the
 * start of the map when no year is set.
 */
export function startTopic(state: LearnerState): TopicModule {
  const ordered = [...TOPICS].sort(mapOrder);
  const year = state.profile.year;
  return (year !== null && ordered.find((t) => t.years.includes(year))) || ordered[0];
}

/**
 * The island a learner should see on their home screen: the one they were
 * last working in, unless it's finished, in which case the next unfinished
 * island in map order. Prerequisite-aware ordering comes with more topics.
 */
export function activeTopic(state: LearnerState): TopicModule {
  const current = (state.currentTopicId ? topicById(state.currentTopicId) : undefined) ?? startTopic(state);
  const finished = (t: TopicModule) => recommendNext(t, topicLearner(state, t.id)).kind === "results";
  if (!finished(current)) return current;
  return [...TOPICS].sort(mapOrder).find((t) => !finished(t)) ?? current;
}

/**
 * The islands a learner has started: the active one, plus any with an answer, lesson progress or a warm-up begun.
 * Skill badges are counted only for these, so the badge total reflects where the child has been (content audit R3).
 */
export function startedTopics(state: LearnerState): TopicModule[] {
  const active = activeTopic(state).id;
  return TOPICS.filter((t) => {
    const p = state.topics[t.id];
    return (
      t.id === active ||
      state.results.some((r) => r.skill.startsWith(`${t.id}.`)) ||
      Object.keys(p?.lessons ?? {}).length > 0 ||
      (p?.placement?.status ?? "not-started") !== "not-started"
    );
  });
}
