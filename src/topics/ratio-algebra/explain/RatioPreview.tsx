"use client";

import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { topicRoutes } from "@/lib/routes";
import { RatioSceneSvg } from "./RatioSceneSvg";

/** D-040: the ratio lesson's "See it in 3D" step: a still of the story and a button to the full explanation. */
export function RatioPreview() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full rounded-[24px] bg-linear-to-b from-sky-soft to-brand-soft p-3">
        <RatioSceneSvg scene={{ kind: "share", total: 35, a: 2, b: 3, stage: "bar" }} />
      </div>
      <p className="text-center text-lg font-bold text-ink">Watch 35 sweets shared in the ratio 2 : 3, in 3D, with a quick check after each part.</p>
      <ButtonLink href={topicRoutes("ratio-algebra").learn("ratio")} size="lg">
        Start learning <ArrowRightIcon size={20} />
      </ButtonLink>
      <p className="text-center text-body text-ink-2">You can come back to this lesson at any time.</p>
    </div>
  );
}
