"use client";

import { FractionLab } from "@/components/lesson/FractionLab";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { Kip } from "@/components/kid/Kip";
import { CheckIcon } from "@/components/ui/Icons";
import { recommendNext } from "@/engine/journey";
import { useHydrated, useLearner } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { LAB_LIMITS } from "@/topics/fractions/lab";
import { LESSONS, lessonById } from "@/topics/fractions/lessons";
import { ScreenSkeleton } from "@/components/ui/Screen";

export function LessonStudioScreen({ lessonId, urlStep }: { lessonId?: string; urlStep?: number }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const fallback = rec.kind === "lesson" ? rec.lessonId : learner.currentLessonId ?? LESSONS[0].id;
  const lesson = lessonById(lessonId ?? learner.currentLessonId ?? fallback) ?? LESSONS[0];

  return (
    <LessonPlayer key={lesson.id} lesson={lesson} urlStep={urlStep} />
  );
}

export function FreeLabScreen() {
  const hydrated = useHydrated();
  if (!hydrated) return <ScreenSkeleton />;
  return (
    <div className="space-y-5">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink via-[#ff7a8a] to-num p-5 text-white shadow-[0_6px_0_#d93a7f] sm:p-7">
        <div className="flex items-center gap-4">
          <Kip mood="cheer" size={76} />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-white/85">Free play</p>
            <h1 className="display text-3xl leading-tight sm:text-4xl">Fraction Lab 🧪</h1>
            <p className="mt-1 max-w-xl text-white/90">
              Cut shapes into up to {LAB_LIMITS.maxParts} equal parts, colour them in, compare, and split parts (up to {LAB_LIMITS.maxSplit} pieces) to discover
              equivalent fractions.
            </p>
          </div>
        </div>
      </header>
      <section className="card space-y-4 p-5 sm:p-8">
        <FractionLab modes={["build", "compare", "equivalent"]} />
        <p className="flex items-center gap-2 text-sm text-muted">
          <CheckIcon size={15} /> Keyboard: Tab to a shape, arrow keys to move between parts, Space to shade.
        </p>
      </section>
    </div>
  );
}
