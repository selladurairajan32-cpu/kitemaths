import type { ExplainScript } from "@/engine/explainScript";
import { ADD_DIFFERENT_SCRIPT } from "@/topics/fractions-2/explain/addDifferentScript";
import { RATIO_SCRIPT } from "@/topics/ratio-algebra/explain/ratioStory";

/**
 * D-041: every explanation script, for the checks and for the film pipeline (`tools/films`), which reads the exported
 * copy of each in `tools/films/scripts/<concept>.json`.
 */
export const EXPLAIN_SCRIPTS: ExplainScript<unknown>[] = [ADD_DIFFERENT_SCRIPT, RATIO_SCRIPT];
