/**
 * The worlds (strands) of the maths map and the islands planned for each.
 * Islands with a `topicId` are playable; the rest show as "coming soon".
 * The order follows docs/ROADMAP.md.
 */
export interface IslandPlan {
  title: string;
  emoji: string;
  topicId?: string;
}

export interface World {
  id: string;
  title: string;
  emoji: string;
  color: string;
  soft: string;
  islands: IslandPlan[];
}

export const WORLDS: World[] = [
  {
    id: "number",
    title: "Number Peaks",
    emoji: "🏔️",
    color: "#2f74ff",
    soft: "#e2ecff",
    islands: [
      { title: "Place value", emoji: "🔟" },
      { title: "Rounding & estimating", emoji: "🎯" },
      { title: "Negative numbers", emoji: "🌡️" },
    ],
  },
  {
    id: "calc",
    title: "Calculation Coast",
    emoji: "🏖️",
    color: "#1fbfae",
    soft: "#d8f7f3",
    islands: [
      { title: "Add & subtract", emoji: "➕" },
      { title: "Times tables", emoji: "✖️" },
      { title: "Multiply & divide", emoji: "➗" },
    ],
  },
  {
    id: "fdp",
    title: "Fraction Falls",
    emoji: "🍕",
    color: "#ff6a45",
    soft: "#ffe7df",
    islands: [
      { title: "Fractions foundations", emoji: "🍕", topicId: "fractions" },
      { title: "Fractions 2", emoji: "🧩" },
      { title: "Decimals", emoji: "🔸" },
      { title: "Percentages", emoji: "💯" },
    ],
  },
  {
    id: "measure",
    title: "Measure Meadows",
    emoji: "📏",
    color: "#22c174",
    soft: "#d9f7e8",
    islands: [
      { title: "Money", emoji: "🪙" },
      { title: "Time", emoji: "⏰" },
      { title: "Area & perimeter", emoji: "📐" },
    ],
  },
  {
    id: "shape",
    title: "Shape Shores",
    emoji: "🔺",
    color: "#6a4cff",
    soft: "#ece7ff",
    islands: [
      { title: "Shapes & angles", emoji: "📐" },
      { title: "Coordinates", emoji: "🧭" },
      { title: "Charts & data", emoji: "📊" },
    ],
  },
  {
    id: "summit",
    title: "11+ Summit",
    emoji: "🏆",
    color: "#f0a800",
    soft: "#fff5cf",
    islands: [
      { title: "Ratio & algebra", emoji: "⚖️" },
      { title: "Problem solving", emoji: "🧠" },
      { title: "Mock exams", emoji: "📝" },
    ],
  },
];
