"use client";

import { ButtonLink } from "@/components/ui/Button";
import { topicRoutes } from "@/lib/routes";

/** D-064: inside the earlier lesson's step, one door to the hands-on lesson on the canvas (where this idea is taught now). */
export function OpenAddDifferent() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-paper p-5">
      <p className="font-medium text-ink">Cut the bars yourself to see why it works.</p>
      <ButtonLink href={topicRoutes("fractions-2").learn("add-different")}>Open the hands-on lesson</ButtonLink>
    </div>
  );
}
