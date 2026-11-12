"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * D-040: the topic explanation pages. Each is loaded only on its own page. Topic id and concept id come from
 * `explanationIndex.ts`.
 */
const Loading = () => <div className="mx-auto min-h-[40rem] max-w-6xl animate-pulse rounded-[28px] bg-sunk" aria-hidden />;

const PAGES: Record<string, ComponentType> = {
  "ratio-algebra/ratio": dynamic(() => import("@/topics/ratio-algebra/explain/RatioPage").then((m) => m.RatioPage), { loading: Loading }),
  "fractions-2/add-different": dynamic(() => import("@/topics/fractions-2/explain/AddDifferentPage").then((m) => m.AddDifferentPage), { loading: Loading }),
};

export function ExplanationScreen({ topicId, concept }: { topicId: string; concept: string }) {
  const Page = PAGES[`${topicId}/${concept}`];
  return Page ? <Page /> : null;
}
