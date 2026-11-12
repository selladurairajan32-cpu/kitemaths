import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { explanationById, explanationsFor } from "@/topics/kit/explanationIndex";
import { ExplanationScreen } from "@/topics/kit/explanations";

export const instant = false;

/** Only the topic comes from the layout, so this lists that topic's explanation pages. */
export function generateStaticParams({ params }: { params: { topic: string } }) {
  return explanationsFor(params.topic).map((e) => ({ concept: e.id }));
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
