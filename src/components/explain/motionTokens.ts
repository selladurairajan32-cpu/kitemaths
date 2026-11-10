/**
 * One set of motion values for every animated explanation (ANIM-001 §3), so all topics move the same way.
 *
 * Rules: animate only when the learner changes step or method, never on an ordinary re-render; every movement must
 * show something about the maths (a split, a regroup, a carry); with reduced motion, jump straight to the end state.
 */
import type { Transition } from "motion/react";

/** Things that move into place: pieces splitting, rows sliding, digits dropping. */
export const MOVE: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
/** Things that appear: numbers and labels. Short, so reading is never held up. */
export const APPEAR: Transition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] };
/** Delay between items revealed one after another inside a step (cells filling, digits written). */
export const STAGGER = 0.18;
/** The transition to use: nothing when the learner asked for reduced motion. */
export const motionOr = (reduce: boolean | null, t: Transition): Transition => (reduce ? { duration: 0 } : t);
