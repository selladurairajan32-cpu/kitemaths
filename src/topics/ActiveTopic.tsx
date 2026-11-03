"use client";

import type { ReactNode } from "react";
import { useLearner } from "@/lib/store";
import { TopicProvider } from "./context";
import { activeTopic } from "./recommend";

/** Provides the learner's active island to app-wide pages (home, grown-ups, report). */
export function ActiveTopicProvider({ children }: { children: ReactNode }) {
  const learner = useLearner();
  return <TopicProvider topicId={activeTopic(learner).id}>{children}</TopicProvider>;
}
