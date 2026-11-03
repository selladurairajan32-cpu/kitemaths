"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { TopicLearner } from "@/engine/progress";
import { topicRoutes } from "@/lib/routes";
import { updateTopic, useTopicLearner } from "@/lib/store";
import { topicById } from "./index";
import type { TopicModule } from "./types";

const TopicContext = createContext<TopicModule | null>(null);

/** Makes one topic available to everything inside (screens, players, lessons). */
export function TopicProvider({ topicId, children }: { topicId: string; children: ReactNode }) {
  const topic = topicById(topicId);
  if (!topic) throw new Error(`Unknown topic ${topicId}`);
  return <TopicContext.Provider value={topic}>{children}</TopicContext.Provider>;
}

export function useTopic(): TopicModule {
  const topic = useContext(TopicContext);
  if (!topic) throw new Error("useTopic must be used inside a TopicProvider");
  return topic;
}

/** The current topic, the learner's progress in it, a way to change it, and its links. */
export function useTopicState() {
  const topic = useTopic();
  const learner = useTopicLearner(topic.id);
  const update = useCallback((fn: (t: TopicLearner) => TopicLearner) => updateTopic(topic.id, fn), [topic.id]);
  const links = useMemo(() => topicRoutes(topic.id), [topic.id]);
  return { topic, learner, update, links };
}
