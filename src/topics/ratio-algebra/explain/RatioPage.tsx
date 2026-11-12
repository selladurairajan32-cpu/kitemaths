"use client";

import dynamic from "next/dynamic";
import { RatioExplanation, type StageProps } from "./RatioExplanation";

/**
 * D-040: the ratio explanation page as the route renders it, with the WebGL stage. The 3D code (three.js) loads only
 * here, after the page; wherever WebGL is missing or motion is reduced, the stage draws the 2.5D picture instead.
 */
const RatioStage3D = dynamic<StageProps>(() => import("./RatioStage3D").then((m) => m.RatioStage3D), {
  ssr: false,
  loading: () => <div className="aspect-[5/3] w-full animate-pulse rounded-[18px] bg-surface/40" aria-hidden />,
});

export function RatioPage() {
  return <RatioExplanation Stage3D={RatioStage3D} />;
}
