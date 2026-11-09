import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FactExplorerScreen } from "@/components/screens/FactExplorerScreen";
import { FactRunFromUrl } from "@/components/screens/FactsScreens";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { FACTS_TOPIC, type FactMode } from "@/topics/times-tables/facts";

const MODES: Record<string, string> = {
  practice: "Practise my facts",
  untimed: "No timer, no rush",
  diagnostic: "Find out what I know",
  timed: "Timed practice",
  explore: "Explore the tables",
};

export const instant = false;

/** Cache Components needs at least one result for every island, so every island lists the modes; only times tables serves them. */
export function generateStaticParams() {
  return Object.keys(MODES).map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/facts/[mode]">): Promise<Metadata> {
  const { mode } = await params;
  return { title: `${MODES[mode] ?? "Facts"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/facts/[mode]">) {
  const { topic, mode } = await params;
  if (topic !== FACTS_TOPIC || !(mode in MODES)) notFound();
  if (mode === "explore") return <FactExplorerScreen />;
  // The chosen table (?table=7) is read in the browser, inside Suspense, so the page itself can be prerendered.
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <FactRunFromUrl mode={mode as FactMode} />
    </Suspense>
  );
}
