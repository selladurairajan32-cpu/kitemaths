import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";
import { topicById } from "@/topics";
import { subTopicHref } from "@/topics/overview";
import { topicRoutes } from "@/lib/routes";

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
  const t = topicById(topic);
  if (!t?.lessonById(lessonId)) notFound();
  // D-064: a sub-topic taught on the lesson canvas has one home; its earlier lesson address sends the child there.
  const home = subTopicHref(topic, lessonId, t.skills.find((k) => k.lessonId === lessonId)?.id);
  if (home !== topicRoutes(topic).lesson(lessonId)) redirect(home);
  return <LessonStudioScreen lessonId={lessonId} />;
}
