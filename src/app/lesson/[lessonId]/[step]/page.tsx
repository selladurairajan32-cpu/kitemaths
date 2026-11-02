import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonStudioScreen } from "@/components/screens/LessonStudioScreen";
import { LESSONS, lessonById } from "@/topics/fractions/lessons";

export const instant = false;

export function generateStaticParams() {
  return LESSONS.flatMap((l) => l.steps.map((_, i) => ({ lessonId: l.id, step: String(i + 1) })));
}

export async function generateMetadata({ params }: PageProps<"/lesson/[lessonId]/[step]">): Promise<Metadata> {
  const { lessonId, step } = await params;
  return { title: `${lessonById(lessonId)?.title ?? "Lesson"} · step ${step} · Kite Maths` };
}

export default async function Page({ params }: PageProps<"/lesson/[lessonId]/[step]">) {
  const { lessonId, step } = await params;
  const lesson = lessonById(lessonId);
  const index = Number(step) - 1;
  if (!lesson || !Number.isInteger(index) || index < 0 || index >= lesson.steps.length) notFound();
  return <LessonStudioScreen lessonId={lessonId} urlStep={index} />;
}
