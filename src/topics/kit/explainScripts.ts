import type { ExplainScript } from "@/engine/explainScript";
import { ADD_DIFFERENT_SCRIPT } from "@/topics/fractions-2/explain/addDifferentScript";
import { RATIO_SCRIPT } from "@/topics/ratio-algebra/explain/ratioStory";
import { COMPARE_SCRIPT } from "@/topics/decimals/explain/compareScript";
import { PERCENT_SCRIPT } from "@/topics/percentages/explain/percentScript";
import { MULTIPLY_SCRIPT } from "@/topics/fractions-2/explain/multiplyScript";
import { REMAINDER_SCRIPT } from "@/topics/multiply-divide/explain/remainderScript";

/**
 * D-041: every explanation script, for the checks and for the film pipeline (`tools/films`), which reads the exported
 * copy of each in `tools/films/scripts/<concept>.json`.
 */
export const EXPLAIN_SCRIPTS: ExplainScript<unknown>[] = [ADD_DIFFERENT_SCRIPT, RATIO_SCRIPT, COMPARE_SCRIPT, PERCENT_SCRIPT, MULTIPLY_SCRIPT, REMAINDER_SCRIPT];
