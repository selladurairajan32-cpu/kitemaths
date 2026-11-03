"use client";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { Kip } from "@/components/kid/Kip";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { recommendNext } from "@/engine/journey";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";

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
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink via-[#ff7a8a] to-num p-5 text-white shadow-[0_6px_0_#d93a7f] sm:p-7">
        <div className="flex items-center gap-4">
          <Kip mood="cheer" size={76} />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-white/85">Free play · {topic.title}</p>
            <h1 className="display text-3xl leading-tight sm:text-4xl">Lab</h1>
            {topic.ui.freeLabIntro && <p className="mt-1 max-w-xl text-white/90">{topic.ui.freeLabIntro}</p>}
          </div>
        </div>
      </header>
      <section className="card space-y-4 p-5 sm:p-8">{FreeLab ? <FreeLab /> : <p className="text-ink-2">This island doesn&apos;t have a lab yet.</p>}</section>
    </div>
  );
}
