import type { JourneyStage } from "@/engine/topicJourney";

/**
 * D-052 "colour fields": which flat colour says what. One colour per journey stage and per world of topics, so a child
 * learns that blue is Learn and orange is Apply wherever they meet it. Each entry is a Tailwind background with the
 * text colour that reads on it (white at 5:1 or more; ink on yellow), and a soft tint for quieter use.
 */
export interface Field {
  bg: string;
  text: string;
  soft: string;
  ink: string;
}

const F = {
  blue: { bg: "bg-field-blue", text: "text-white", soft: "bg-tile-blue", ink: "text-field-blue" },
  green: { bg: "bg-field-green", text: "text-white", soft: "bg-tile-green", ink: "text-field-green" },
  orange: { bg: "bg-field-orange", text: "text-white", soft: "bg-tile-orange", ink: "text-field-orange" },
  teal: { bg: "bg-field-teal", text: "text-white", soft: "bg-tile-sky", ink: "text-field-teal" },
  pink: { bg: "bg-field-pink", text: "text-white", soft: "bg-tile-pink", ink: "text-field-pink" },
  sky: { bg: "bg-field-sky", text: "text-white", soft: "bg-tile-sky", ink: "text-field-sky" },
  navy: { bg: "bg-field-navy", text: "text-white", soft: "bg-tile-blue", ink: "text-field-navy" },
  yellow: { bg: "bg-field-yellow", text: "text-ink", soft: "bg-tile-yellow", ink: "text-ink" },
} satisfies Record<string, Field>;

export const FIELDS = F;
export type FieldName = keyof typeof F;

export const STAGE_FIELD: Record<JourneyStage, Field> = { learn: F.blue, practise: F.green, apply: F.orange, check: F.teal, complete: F.yellow };

/** The worlds of the map (topics/worlds.ts ids). */
export const WORLD_FIELD: Record<string, Field> = { number: F.blue, calc: F.teal, fdp: F.orange, measure: F.green, shape: F.pink, summit: F.navy };

/** For lists of peers (journeys, plan items): colours in turn. */
export const CYCLE: Field[] = [F.blue, F.green, F.orange, F.teal, F.pink, F.sky];
