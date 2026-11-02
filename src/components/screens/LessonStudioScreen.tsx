"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { FractionLab } from "@/components/lesson/FractionLab";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { BeakerIcon, CheckIcon, StudioIcon } from "@/components/ui/Icons";
import { recommendNext } from "@/engine/journey";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { LAB_LIMITS } from "@/topics/fractions/lab";
import { LESSONS, lessonById } from "@/topics/fractions/lessons";
import { ScreenSkeleton } from "./DashboardScreen";

function StudioHeader({ view, lessonId }: { view: "lesson" | "lab"; lessonId?: string }) {
  const router = useRouter();
  const learner = useLearner();
  const selectId = useId();
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">Lesson Studio</p>
        <h1 className="display text-3xl font-semibold">{view === "lab" ? "Fraction Lab" : "Fractions foundations"}</h1>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        {view === "lesson" && lessonId && (
          <div className="flex min-w-0 flex-col gap-1 sm:w-72">
            <label htmlFor={selectId} className="text-sm text-muted">
              Choose a lesson
            </label>
            <select
              id={selectId}
              value={lessonId}
              onChange={(e) => router.push(routes.lesson(e.target.value))}
              className="h-11 w-full min-w-0 max-w-full rounded-xl border border-line-strong bg-surface px-3 text-sm font-medium"
            >
              {LESSONS.map((l, i) => (
                <option key={l.id} value={l.id}>
                  {i + 1}. {l.title}
                  {learner.lessons[l.id]?.completed ? " ✓" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
        <nav aria-label="Studio view" className="inline-flex self-start rounded-xl bg-sunk p-1 sm:self-auto">
          {(
            [
              ["lesson", "Lessons", routes.studio(), <StudioIcon key="i" size={16} />],
              ["lab", "Free lab", routes.lab(), <BeakerIcon key="i" size={16} />],
            ] as const
          ).map(([id, label, href, icon]) => (
            <Link
              key={id}
              href={href}
              aria-current={view === id ? "page" : undefined}
              className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors ${
                view === id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function LessonStudioScreen({ lessonId, urlStep }: { lessonId?: string; urlStep?: number }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const fallback = rec.kind === "lesson" ? rec.lessonId : learner.currentLessonId ?? LESSONS[0].id;
  const lesson = lessonById(lessonId ?? learner.currentLessonId ?? fallback) ?? LESSONS[0];

  return (
    <div className="space-y-5">
      <StudioHeader view="lesson" lessonId={lesson.id} />
      <LessonPlayer key={lesson.id} lesson={lesson} urlStep={urlStep} />
    </div>
  );
}

export function FreeLabScreen() {
  const hydrated = useHydrated();
  if (!hydrated) return <ScreenSkeleton />;
  return (
    <div className="space-y-5">
      <StudioHeader view="lab" />
      <section className="card space-y-4 p-5 sm:p-8">
        <p className="max-w-2xl text-ink-2">
          Explore freely with bars and circles of 1 to {LAB_LIMITS.maxParts} equal parts. Build a fraction, compare two fractions of the same whole, or split
          parts (up to {LAB_LIMITS.maxSplit} pieces each) to discover equivalent fractions. The lab works with fractions from 0 up to one whole.
        </p>
        <FractionLab modes={["build", "compare", "equivalent"]} />
        <p className="flex items-center gap-2 text-sm text-muted">
          <CheckIcon size={15} /> Keyboard: Tab to a shape, arrow keys to move between parts, Space to shade.
        </p>
      </section>
    </div>
  );
}
