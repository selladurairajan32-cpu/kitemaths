"use client";

import { GoLink } from "@/components/kid/Play";
import { topicRoutes } from "@/lib/routes";

/** D-064: inside the earlier lesson's step, one door to the hands-on lesson on the canvas (where this idea is taught now). */
export function OpenAddDifferent() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-[28px] bg-tile-orange p-5">
      <p className="text-title font-extrabold text-ink">Cut the bars yourself to see why it works.</p>
      <GoLink href={topicRoutes("fractions-2").learn("add-different")}>Open the hands-on lesson</GoLink>
    </div>
  );
}
