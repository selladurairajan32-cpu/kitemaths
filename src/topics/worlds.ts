import type { PaperIconName } from "@/components/paper/PaperIcon";

/**
 * The worlds (strands) of the maths map and the islands planned for each.
 * Islands with a `topicId` are playable; the rest show as "opens soon".
 * The order follows docs/ROADMAP.md.
 */
export interface IslandPlan {
  title: string;
  icon: PaperIconName;
  topicId?: string;
}

export interface World {
  id: string;
  title: string;
  icon: PaperIconName;
  /** The world's band: a flat field of one paper colour, with ink or white text on it. */
  field: string;
  text: "ink" | "white";
  islands: IslandPlan[];
}

export const WORLDS: World[] = [
  {
    id: "number",
    title: "Number Peaks",
    icon: "mountain",
    field: "#d6ecfd",
    text: "ink",
    islands: [
      { title: "Place value", icon: "place-value", topicId: "place-value" },
      { title: "Rounding and estimating", icon: "rounding", topicId: "rounding" },
      { title: "Negative numbers", icon: "thermometer", topicId: "negative" },
    ],
  },
  {
    id: "calc",
    title: "Calculation Coast",
    icon: "wave",
    field: "#dcf3e5",
    text: "ink",
    islands: [
      { title: "Add and subtract", icon: "plus", topicId: "add-subtract" },
      { title: "Times tables", icon: "times", topicId: "times-tables" },
      { title: "Multiply and divide", icon: "divide", topicId: "multiply-divide" },
      { title: "Mental maths", icon: "bulb", topicId: "mental-maths" },
    ],
  },
  {
    id: "fdp",
    title: "Fraction Falls",
    icon: "falls",
    field: "#fde5dc",
    text: "ink",
    islands: [
      { title: "Fractions foundations", icon: "pizza", topicId: "fractions" },
      { title: "Fractions 2", icon: "puzzle", topicId: "fractions-2" },
      { title: "Decimals", icon: "decimal", topicId: "decimals" },
      { title: "Percentages", icon: "percent", topicId: "percentages" },
    ],
  },
  {
    id: "measure",
    title: "Measure Meadows",
    icon: "meadow",
    field: "#fff4d4",
    text: "ink",
    islands: [
      { title: "Money", icon: "coin", topicId: "money" },
      { title: "Time", icon: "clock", topicId: "time" },
      { title: "Area and perimeter", icon: "area", topicId: "area-perimeter" },
      { title: "Measures", icon: "ruler", topicId: "measures" },
    ],
  },
  {
    id: "shape",
    title: "Shape Shores",
    icon: "shapes",
    field: "#d6ecfd",
    text: "ink",
    islands: [
      { title: "Shapes and angles", icon: "angle", topicId: "shapes-angles" },
      { title: "Coordinates", icon: "compass", topicId: "coordinates" },
      { title: "Charts and data", icon: "chart", topicId: "charts-data" },
    ],
  },
  {
    id: "summit",
    title: "11+ Summit",
    icon: "summit",
    field: "#13203a",
    text: "white",
    islands: [
      { title: "Ratio and algebra", icon: "ratio", topicId: "ratio-algebra" },
      { title: "Problem solving", icon: "bulb", topicId: "problem-solving" },
      { title: "Mock exams", icon: "exam", topicId: "mock-exams" },
    ],
  },
];
