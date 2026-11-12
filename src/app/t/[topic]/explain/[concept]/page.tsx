import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXPLANATIONS, explanationById } from "@/topics/kit/explanationIndex";
import { ExplanationScreen } from "@/topics/kit/explanations";

export const instant = false;

/**
 * Cache Components needs at least one result for every island, so every concept id is listed for every island; the page
 * returns "not found" where a concept doesn't belong to the island.
 */
export function generateStaticParams() {
  return [...new Set(EXPLANATIONS.map((e) => e.id))].map((concept) => ({ concept }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/explain/[concept]">): Promise<Metadata> {
  const { topic, concept } = await params;
  return { title: `${explanationById(topic, concept)?.title ?? "Explanation"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/explain/[concept]">) {
  const { topic, concept } = await params;
  if (!explanationById(topic, concept)) notFound();
  return <ExplanationScreen topicId={topic} concept={concept} />;
}
