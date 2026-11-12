import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyScreen } from "@/components/study/StudyScreen";
import { topicById } from "@/topics";
import { hasStudyPlan } from "@/topics/kit/study";

export const instant = false;

export async function generateMetadata({ params }: PageProps<"/t/[topic]/study">): Promise<Metadata> {
  const { topic } = await params;
  return { title: `Learn ${topicById(topic)?.title ?? ""} · Kite Maths` };
}

/** D-054 pilot: the topic learning page, opened at the first sub-topic not yet done. */
export default async function Page({ params }: PageProps<"/t/[topic]/study">) {
  const { topic } = await params;
  if (!hasStudyPlan(topic)) notFound();
  return <StudyScreen />;
}
