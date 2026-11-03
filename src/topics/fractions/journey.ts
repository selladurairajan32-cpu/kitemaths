import type { Phase } from "@/engine/types";

/** What each learning phase means in this topic (shown on the grown-ups' journey page). */
export const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  Understand: "Meet the big idea in everyday language.",
  Visualise: "See fractions as pictures, bars and number lines.",
  Explore: "Build, compare and transform fractions in the lab.",
  Practise: "Strengthen each skill with adaptive practice.",
  Explain: "Build explanations and find counterexamples.",
  Apply: "Use fractions to solve real problems.",
  Master: "Show what you know independently — and fix anything that needs review.",
};
