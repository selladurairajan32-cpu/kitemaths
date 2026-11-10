"use client";

import { MotionGlobalConfig, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/** True when movement should be skipped: the learner asked for reduced motion, or animations are off (tests). */
export function useInstant(): boolean {
  const reduce = useReducedMotion();
  return !!reduce || MotionGlobalConfig.skipAnimations === true;
}

/**
 * A step's beats, one after another (ANIM-001 §3): phase 0 at first, then 1, 2… after each delay in milliseconds.
 * Remount the step (a new `key`) to play it again. With reduced motion every beat shows at once.
 */
export function usePhases(delays: number[]): number {
  const instant = useInstant();
  const [phase, setPhase] = useState(() => (instant ? delays.length : 0));
  useEffect(() => {
    if (instant) return;
    const timers: number[] = [];
    let at = 0;
    delays.forEach((d, i) => {
      at += d;
      timers.push(window.setTimeout(() => setPhase((p) => Math.max(p, i + 1)), at));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
    // The beats are fixed for the life of a step; a replay remounts it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instant]);
  return instant ? delays.length : phase;
}
