/**
 * D-040: the topic explanation pages, as plain data so server routes can list them. The components live in
 * `explanations.tsx` (client), keeping island content free of UI.
 */
export interface ExplanationInfo {
  topicId: string;
  id: string;
  title: string;
}

export const EXPLANATIONS: ExplanationInfo[] = [
  { topicId: "ratio-algebra", id: "ratio", title: "Ratio and proportion: sharing in a ratio" },
  // D-041 pilot: watch, step through or try it.
  { topicId: "fractions-2", id: "add-different", title: "Adding fractions with different denominators" },
];

export const explanationsFor = (topicId: string) => EXPLANATIONS.filter((e) => e.topicId === topicId);
export const explanationById = (topicId: string, id: string) => EXPLANATIONS.find((e) => e.topicId === topicId && e.id === id);
