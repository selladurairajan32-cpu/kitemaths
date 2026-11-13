import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonCanvas } from "@/components/canvas/LessonCanvas";
import { JourneyScreen } from "@/components/journey/JourneyScreen";
import { journeyFor, JOURNEYS } from "@/topics/kit/journeys";

export const instant = false;

/**
 * D-043: the topic journey for one concept. Cache Components needs at least one result for every island, so every
 * concept id is listed for every island; the page returns "not found" where a concept doesn't belong to the island.
 */
export function generateStaticParams() {
  return [...new Set(JOURNEYS.map((j) => j.concept))].map((concept) => ({ concept }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/learn/[concept]">): Promise<Metadata> {
  const { topic, concept } = await params;
  return { title: `${journeyFor(topic, concept)?.title ?? "Learn"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/learn/[concept]">) {
  const { topic, concept } = await params;
  const journey = journeyFor(topic, concept);
  if (!journey) notFound();
  // D-060: the redesign pilot teaches this concept on the lesson canvas; the others keep the topic journey.
  return journey.canvas ? <LessonCanvas concept={concept} /> : <JourneyScreen concept={concept} />;
}
