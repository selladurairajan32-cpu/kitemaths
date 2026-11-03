"use client";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { recommendNext } from "@/engine/journey";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { ScreenHero } from "@/components/kid/ScreenHero";

export function LessonStudioScreen({ lessonId, urlStep }: { lessonId?: string; urlStep?: number }) {
  const hydrated = useHydrated();
  const { topic, learner } = useTopicState();
  if (!hydrated) return <ScreenSkeleton />;

  const lessons = topic.lessons;
  const rec = recommendNext(topic, learner);
  const fallback = rec.kind === "lesson" ? rec.lessonId : learner.currentLessonId ?? lessons[0].id;
  const lesson = topic.lessonById(lessonId ?? learner.currentLessonId ?? fallback) ?? lessons[0];

  return <LessonPlayer key={lesson.id} lesson={lesson} urlStep={urlStep} />;
}

export function FreeLabScreen() {
  const hydrated = useHydrated();
  const { topic } = useTopicState();
  if (!hydrated) return <ScreenSkeleton />;
  const FreeLab = topic.ui.FreeLab;
  return (
    <div className="space-y-5">
      <ScreenHero pic="lab" titleId="lab-title" title="The lab" line={topic.ui.freeLabIntro ?? `Free play on ${topic.title}.`} />
      <section className="card space-y-4 p-5 sm:p-8" aria-labelledby="lab-title">{FreeLab ? <FreeLab /> : <p className="text-ink-2">This island doesn&apos;t have a lab yet.</p>}</section>
    </div>
  );
}
