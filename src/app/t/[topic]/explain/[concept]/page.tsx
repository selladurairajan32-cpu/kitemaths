import { notFound, permanentRedirect } from "next/navigation";
import { EXPLANATIONS, explanationById } from "@/topics/kit/explanationIndex";

export const instant = false;

/** D-043: the explanation now lives in the topic journey's Learn stage; old links go there. */
export function generateStaticParams() {
  return [...new Set(EXPLANATIONS.map((e) => e.id))].map((concept) => ({ concept }));
}

export default async function Page({ params }: PageProps<"/t/[topic]/explain/[concept]">) {
  const { topic, concept } = await params;
  if (!explanationById(topic, concept)) notFound();
  permanentRedirect(`/t/${topic}/learn/${concept}`);
}
