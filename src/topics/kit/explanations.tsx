"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * D-040, D-043: each concept's parts in the topic journey, loaded only on its own page: the Learn stage (watch, step
 * through or try it) and the Notes the child can open at any stage. Topic id and concept id come from
 * `explanationIndex.ts`; the rest of the journey is data in `journeys.ts`.
 */
const Loading = () => <div className="min-h-[32rem] animate-pulse rounded-[28px] bg-sunk" aria-hidden />;

const LEARN: Record<string, ComponentType> = {
  "ratio-algebra/ratio": dynamic(() => import("@/topics/ratio-algebra/explain/RatioPage").then((m) => m.RatioLearnPage), { loading: Loading }),
  "fractions-2/add-different": dynamic(() => import("@/topics/fractions-2/explain/AddDifferentPage").then((m) => m.AddDifferentLearn), { loading: Loading }),
};

const NOTES: Record<string, ComponentType> = {
  "ratio-algebra/ratio": dynamic(() => import("@/topics/ratio-algebra/explain/RatioExplanation").then((m) => m.RatioNotes), { loading: Loading }),
  "fractions-2/add-different": dynamic(() => import("@/topics/fractions-2/explain/AddDifferentPage").then((m) => m.AddDifferentNotes), { loading: Loading }),
};

export function ConceptLearn({ topicId, concept }: { topicId: string; concept: string }) {
  const Learn = LEARN[`${topicId}/${concept}`];
  return Learn ? <Learn /> : null;
}

export function ConceptNotes({ topicId, concept }: { topicId: string; concept: string }) {
  const Notes = NOTES[`${topicId}/${concept}`];
  return Notes ? <Notes /> : null;
}
