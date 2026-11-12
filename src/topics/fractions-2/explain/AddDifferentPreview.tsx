"use client";

import Link from "next/link";
import { MODE_INFO } from "@/components/explain/modes/ExplainShell";
import { topicRoutes } from "@/lib/routes";
import { EXPLAIN_MODES } from "@/engine/explainScript";
import { FracStageView } from "./FracStage";

/** D-041: the lesson step that opens the three-way explanation of ⅓ + ¼, straight into the way the child picks. */
export function AddDifferentPreview() {
  const href = topicRoutes("fractions-2").explain("add-different");
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-[24px] bg-linear-to-b from-sky-soft to-brand-soft p-3">
        <FracStageView scene={{ stage: "count" }} still />
      </div>
      <p className="text-center text-lg font-bold text-ink">See why {"⅓"} + {"¼"} = 7/12. Pick how you like to learn:</p>
      <div className="grid w-full max-w-xl grid-cols-3 gap-2">
        {EXPLAIN_MODES.map((m) => (
          <Link key={m} href={`${href}#${m}`} className="flex min-h-14 items-center justify-center rounded-[18px] border-2 border-brand bg-surface px-2 text-center text-body font-extrabold text-brand-strong hover:bg-brand-soft">
            {MODE_INFO[m].label}
          </Link>
        ))}
      </div>
      <p className="text-center text-body text-ink-2">You can come back to this lesson at any time.</p>
    </div>
  );
}
