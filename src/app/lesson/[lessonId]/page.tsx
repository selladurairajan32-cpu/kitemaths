import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";
import { LESSONS, lessonById } from "@/topics/fractions/lessons";

export const instant = false;

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]">): Promise<Metadata> {
  const { lessonId } = await params;
  return { title: `${lessonById(lessonId)?.title ?? "Lesson"} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  if (!lessonById(lessonId)) notFound();
  return <LessonStudioScreen lessonId={lessonId} />;
}
