import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudyScreen } from "@/components/study/StudyScreen";
import { TOPICS, topicById } from "@/topics";
import { hasStudyPlan, studyPlan } from "@/topics/kit/study";

export const instant = false;

/** Cache Components needs a result for every island: each part of every planned topic is listed for every island. */
export function generateStaticParams() {
  const parts = new Set(TOPICS.flatMap((t) => studyPlan(t).map((i) => i.part)));
  return [...parts].map((part) => ({ part }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/study/[part]">): Promise<Metadata> {
  const { topic, part } = await params;
  const t = topicById(topic);
  const item = t ? studyPlan(t).find((i) => i.part === part) : undefined;
  const title = item?.kind === "sub" ? item.lesson.title : item?.kind === "practice" ? `Practice stop ${item.number}` : "Topic test";
  return { title: `${title} · ${t?.title ?? ""} · Kite Maths` };
}

/** D-054 pilot: one sub-topic, practice stop or the topic test. */
export default async function Page({ params }: PageProps<"/t/[topic]/study/[part]">) {
  const { topic, part } = await params;
  const t = topicById(topic);
  if (!t || !hasStudyPlan(topic) || !studyPlan(t).some((i) => i.part === part)) notFound();
  return <StudyScreen part={part} />;
}
