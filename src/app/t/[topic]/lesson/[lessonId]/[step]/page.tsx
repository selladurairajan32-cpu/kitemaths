import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";
import { topicById } from "@/topics";

export const instant = false;

/** Only the topic comes from the layout, so this lists every lesson's steps. */
export function generateStaticParams({ params }: { params: { topic: string } }) {
  const lessons = topicById(params.topic)?.lessons ?? [];
  return lessons.flatMap((l) => l.steps.map((_, i) => ({ lessonId: l.id, step: String(i + 1) })));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/lesson/[lessonId]/[step]">): Promise<Metadata> {
  const { topic, lessonId, step } = await params;
  return { title: `${topicById(topic)?.lessonById(lessonId)?.title ?? "Lesson"} · step ${step} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/lesson/[lessonId]/[step]">) {
  const { topic, lessonId, step } = await params;
  const lesson = topicById(topic)?.lessonById(lessonId);
  const index = Number(step) - 1;
  if (!lesson || !Number.isInteger(index) || index < 0 || index >= lesson.steps.length) notFound();
  return <LessonStudioScreen lessonId={lessonId} urlStep={index} />;
}
