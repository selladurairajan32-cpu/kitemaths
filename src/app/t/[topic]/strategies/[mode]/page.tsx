import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { ChooseScreen, CompareScreen, TimedStrategyScreen } from "@/components/screens/StrategyScreens";

const MODES: Record<string, string> = { compare: "Compare the methods", choose: "Choose and say why", timed: "One-minute challenge" };

export const instant = false;

/** Cache Components needs at least one result for every island; only mental maths serves these pages. */
export function generateStaticParams() {
  return Object.keys(MODES).map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/strategies/[mode]">): Promise<Metadata> {
  const { mode } = await params;
  return { title: `${MODES[mode] ?? "Mental maths methods"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/strategies/[mode]">) {
  const { topic, mode } = await params;
  if (topic !== "mental-maths" || !(mode in MODES)) notFound();
  // Each activity seeds its problems from the clock when it opens, so it renders in the browser, inside Suspense.
  return <Suspense fallback={<ScreenSkeleton />}>{mode === "compare" ? <CompareScreen /> : mode === "choose" ? <ChooseScreen /> : <TimedStrategyScreen />}</Suspense>;
}
