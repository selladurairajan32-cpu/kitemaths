import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";
import { topicById } from "@/topics";

export const instant = false;

export function generateStaticParams({ params }: { params: { topic: string } }) {
  return (topicById(params.topic)?.lessons ?? []).map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/t/[topic]/lesson/[lessonId]">): Promise<Metadata> {
  const { topic, lessonId } = await params;
  return { title: `${topicById(topic)?.lessonById(lessonId)?.title ?? "Lesson"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/t/[topic]/lesson/[lessonId]">) {
  const { topic, lessonId } = await params;
  if (!topicById(topic)?.lessonById(lessonId)) notFound();
  return <LessonStudioScreen lessonId={lessonId} />;
}
