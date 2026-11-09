import { biggest } from "./pure";
import type { Skill } from "@/engine/types";
export const top = (s: Skill[]) => biggest(s.map((x) => x.title.length));
