"use client";

import { badgePic } from "@/components/kid/badgePic";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { Pic } from "@/components/paper/Pic";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { badgesFor, levelFor, totalStars } from "@/engine/rewards";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { TOPICS } from "@/topics";
import { startedTopics } from "@/topics/recommend";

export function BadgesScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;

  const stars = totalStars(learner);
  const level = levelFor(stars);
  const badges = badgesFor(learner, startedTopics(learner).flatMap((t) => t.skills), TOPICS.reduce((n, t) => n + t.lessons.length, 0), now);
  const earned = badges.filter((b) => b.earned);
  // Show the earned ones first, then the closest to being earned.
  const ordered = [...earned, ...badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)];

  return (
    <div className="space-y-10">
      <ScreenHero
        kip={earned.length ? "cheer" : "happy"}
        titleId="badges-title"
        title="Your badges"
        line={`Your whole collection: ${earned.length} of ${badges.length} won. Badges you've won come first, then the ones you're closest to. Each island you start adds a badge for each of its skills.`}
        aside={
          <div className="flex gap-3">
            <span className="flex items-center gap-2 rounded-[20px] bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
              <Pic name="star" size={40} />
              <span className="leading-tight">
                <span className="block text-2xl font-extrabold text-ink">{stars}</span>
                <span className="block text-label font-semibold text-muted">stars</span>
              </span>
            </span>
            <span className="flex items-center gap-2 rounded-[20px] bg-surface px-4 py-3 shadow-[var(--shadow-card)]">
              <Pic name="trophy" size={40} />
              <span className="leading-tight">
                <span className="block text-2xl font-extrabold text-ink">Level {level.level}</span>
                <span className="block text-label font-semibold text-muted">{level.title}</span>
              </span>
            </span>
          </div>
        }
      />

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {ordered.map((b) => (
          <li key={b.id} className="flex flex-col items-center gap-2 rounded-[24px] border border-line bg-surface px-4 pb-5 pt-6 text-center shadow-[var(--shadow-card)]">
            <span className={`grid size-24 place-items-center rounded-full ${b.earned ? "bg-tile-yellow" : "bg-sunk"}`}>
              <Pic name={badgePic(b.id)} size={64} muted={!b.earned} />
            </span>
            <p className="mt-1 text-lg font-extrabold leading-snug text-ink">{b.title}</p>
            <p className="text-label text-ink-2">{b.description}</p>
            {b.earned ? (
              <span className="mt-auto rounded-full bg-ok-soft px-3 py-1 text-label font-bold text-ok">Won</span>
            ) : (
              <div className="mt-auto w-full pt-1">
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-sunk"
                  role="progressbar"
                  aria-label={`${b.title} progress`}
                  aria-valuenow={Math.round(b.progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div className="h-full rounded-full bg-warn-bright" style={{ width: `${b.progress * 100}%` }} />
                </div>
                <p className="mt-1.5 text-label font-semibold text-muted">{Math.round(b.progress * 100)}% there</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
