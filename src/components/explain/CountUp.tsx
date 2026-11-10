"use client";

import { animate } from "motion/react";
import { useEffect, useState } from "react";
import { useInstant } from "./timeline";

/** A number that rolls up to its value, so a total is seen to grow (ANIM-001). Reduced motion shows it at once. `svg` draws it inside SVG text. */
export function CountUp({ value, from = 0, seconds = 0.8, className, svg = false }: { value: number; from?: number; seconds?: number; className?: string; svg?: boolean }) {
  const instant = useInstant();
  const [shown, setShown] = useState(instant ? value : from);
  useEffect(() => {
    if (instant) return;
    const c = animate(from, value, { duration: seconds, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [from, value, seconds, instant]);
  const text = (instant ? value : shown).toLocaleString("en-GB");
  return svg ? <tspan className={className}>{text}</tspan> : <span className={className}>{text}</span>;
}
