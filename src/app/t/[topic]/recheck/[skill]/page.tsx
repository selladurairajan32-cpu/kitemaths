import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecheckScreen } from "@/components/screens/RecheckScreen";
import { globalId, localId, topicById } from "@/topics";

export const instant = false;

export function generateStaticParams({ params }: { params: { topic: string } }) {
  return (topicById(params.topic)?.skills ?? []).map((s) => ({ skill: localId(s.id) }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/recheck/[skill]">): Promise<Metadata> {
  const { topic, skill } = await params;
  const s = topicById(topic)?.skills.find((k) => k.id === globalId(topic, skill));
  return { title: `Recheck ${s?.title ?? ""} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/recheck/[skill]">) {
  const { topic, skill } = await params;
  const id = globalId(topic, skill);
  if (!topicById(topic)?.skills.some((s) => s.id === id)) notFound();
  return <RecheckScreen skill={id} />;
}
