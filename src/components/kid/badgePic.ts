import type { PicName } from "@/components/paper/Pic";

/** Every badge shows as a 3D picture on the shelf. */
export function badgePic(id: string): PicName {
  if (id.startsWith("skill:")) return "star";
  return (
    ({
      "first-flight": "kite",
      "lesson-1": "book",
      comeback: "rocket",
      "hot-streak": "glowing-star",
      goal: "medal",
      "streak-3": "flame",
      lab: "lab",
      century: "trophy",
      "all-lessons": "books",
      "streak-7": "flame",
      check: "trophy",
    } as Record<string, PicName>)[id] ?? "star"
  );
}
