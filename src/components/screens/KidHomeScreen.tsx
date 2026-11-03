"use client";

import Link from "next/link";
import { FlameGlyph, StarGlyph } from "@/components/kid/Celebrate";
import { KipSays } from "@/components/kid/Kip";
import { kidNext } from "@/components/kid/kidText";
import { PaperIcon, type PaperIconName } from "@/components/paper/PaperIcon";
import { PaperKite } from "@/components/paper/PaperKite";
import { SkyScene } from "@/components/paper/SkyScene";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { recommendNext, reviewSkills } from "@/engine/journey";
import { activeDays, answeredToday, DAILY_GOAL, dayKey, levelFor, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function KidHomeScreen() {
  const hydrated = useHydrated();
  if (!hydrated) return <ScreenSkeleton />;
  return (
    <ActiveTopicProvider>
      <KidHome />
    </ActiveTopicProvider>
  );
}

function KidHome() {
  const learner = useLearner();
  const { topic, learner: inTopic, links } = useTopicState();
  const now = useNow();
  const { skillById, lessonLook } = topic;

  const brandNew = inTopic.placement.status === "not-started" && learner.results.length === 0;
  const rec = recommendNext(topic, inTopic);
  const next = kidNext(rec, topic);
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const streak = streakFor(learner, now);
  const today = answeredToday(learner, now);
  const days = activeDays(learner);
  const week = Array.from({ length: 7 }, (_, i) => {
    const at = now - (6 - i) * 86_400_000;
    return { key: dayKey(at), letter: DAY_LETTERS[new Date(at).getDay()], done: days.has(dayKey(at)), today: i === 6 };
  });
  const review = reviewSkills(topic, inTopic);
  const name = learner.profile.name.trim();
  const hello = `${greeting(now)}${name ? `, ${name}` : ""}.`;

  return (
    <div className="space-y-10 sm:space-y-14">
      <StorageNotice />

      {/* What to do next: the one question this screen answers. */}
      <section className="grid items-center gap-6 lg:grid-cols-2 lg:gap-10" aria-labelledby="next-title">
        <div className="min-w-0">
          <p className="text-lg text-ink-2">{hello}</p>
          {brandNew ? (
            <>
              <h1 id="next-title" className="display mt-2 text-[1.75rem] sm:text-[2rem]">
                I&apos;m Kip. Let&apos;s find your start.
              </h1>
              <p className="mt-3 max-w-md text-ink-2">A short warm-up game shows me which fraction lessons you already know, so you start in the right place.</p>
              <ButtonLink href={links.start()} size="xl" className="mt-6">
                Play the warm-up <ArrowRightIcon size={20} />
              </ButtonLink>
            </>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-3">
                <PaperIcon name={next.icon} size={48} />
                <h1 id="next-title" className="display min-w-0 text-[1.75rem] sm:text-[2rem]">
                  {next.title}
                </h1>
              </div>
              <p className="mt-3 max-w-md text-ink-2">
                {next.kicker}. {next.line}
              </p>
              <ButtonLink href={next.href} size="xl" className="mt-6">
                {next.cta} <ArrowRightIcon size={20} />
              </ButtonLink>
            </>
          )}
        </div>
        <SkyScene progress={level.into / level.needed} nextLevel={level.level + 1} mood={brandNew ? "cheer" : "happy"} className="rounded-[4px]" />
      </section>

      {review.length > 0 && (
        <KipSays mood="think" tone="sun" speak={`Let's revisit ${skillById(review[0]).title}. A little practice will make it strong again.`}>
          Let&apos;s revisit <strong>{skillById(review[0]).title}</strong>. A little practice will make it strong again.{" "}
          <Link href={links.practice(review[0])} className="font-semibold text-ink underline underline-offset-4">
            Practise it
          </Link>
        </KipSays>
      )}

      {/* Stars, streak and today's goal: one divided panel, label over figure. */}
      <section aria-label="Your progress" className="grid rounded-[4px] bg-surface sm:grid-cols-3">
        <Link href={routes.badges()} className="block p-5 hover:bg-raised sm:p-6">
          <p className="text-base text-muted">Stars</p>
          <p className="mt-1 flex items-center gap-2 text-[2rem] font-bold leading-none tracking-[-0.02em]">
            <StarGlyph size={28} /> {stars}
          </p>
          <Meter value={level.into / level.needed} fill="bg-sun" label={`Level ${level.level}: ${level.into} of ${level.needed} stars`} />
          <p className="mt-2 text-sm text-muted">
            Level {level.level}, {level.title.toLowerCase()} · {level.needed - level.into} stars to level {level.level + 1}
          </p>
        </Link>
        <div className="border-t border-line p-5 sm:border-l sm:border-t-0 sm:p-6">
          <p className="text-base text-muted">Streak</p>
          <p className="mt-1 flex items-center gap-2 text-[2rem] font-bold leading-none tracking-[-0.02em]">
            <FlameGlyph size={28} lit={streak.activeToday} /> {streak.current} <span className="text-lg font-medium text-muted">{streak.current === 1 ? "day" : "days"}</span>
          </p>
          <ol className="mt-4 flex justify-between gap-1" aria-label="The last 7 days">
            {week.map((d) => (
              <li
                key={d.key}
                className={`grid size-8 place-items-center rounded-full text-sm font-semibold ${
                  d.done ? "bg-ink text-white" : d.today ? "border-2 border-dashed border-ink/40 text-ink-2" : "bg-sunk text-muted"
                }`}
                aria-label={`${d.today ? "Today" : d.key}: ${d.done ? "learned" : "not yet"}`}
              >
                {d.letter}
              </li>
            ))}
          </ol>
        </div>
        <div className="border-t border-line p-5 sm:border-l sm:border-t-0 sm:p-6">
          <p className="text-base text-muted">Today</p>
          <p className="mt-1 text-[2rem] font-bold leading-none tracking-[-0.02em]">
            {Math.min(today, DAILY_GOAL)} <span className="text-lg font-medium text-muted">of {DAILY_GOAL} questions</span>
          </p>
          <Meter value={Math.min(1, today / DAILY_GOAL)} fill="bg-leaf" label={`${Math.min(today, DAILY_GOAL)} of ${DAILY_GOAL} questions today`} />
          <p className="mt-2 text-sm text-muted">{today >= DAILY_GOAL ? "Goal done for today. Anything more is a bonus." : "Every answer counts, right or not yet."}</p>
        </div>
      </section>

      {/* The island: one kite per lesson, filling as you go. */}
      <section aria-labelledby="island-title">
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <h2 id="island-title" className="display text-2xl">
            {topic.title}
          </h2>
          <Link href={links.island()} className="-ml-3 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 font-medium text-ink-2 hover:bg-sunk">
            Open the island <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ol className="mt-4 grid grid-cols-4 gap-x-1 gap-y-3 md:grid-cols-8">
          {topic.lessons.map((l, i) => {
            const p = inTopic.lessons[l.id];
            const done = !!p?.completed;
            const current = rec.kind === "lesson" && rec.lessonId === l.id;
            const panels = done ? 4 : p ? Math.min(3, Math.floor((p.furthestStep / l.steps.length) * 4)) : 0;
            return (
              <li key={l.id}>
                <Link
                  href={links.lesson(l.id)}
                  className={`flex h-full flex-col items-center gap-2 rounded-[4px] px-1 py-2 text-center hover:bg-sunk ${current ? "bg-surface" : ""}`}
                  aria-label={`Lesson ${i + 1}: ${l.title}${done ? ", done" : current ? ", next" : ""}`}
                >
                  <span className="relative">
                    <PaperKite filled={panels} outline={done || current || panels > 0 ? "solid" : "dashed"} tail={false} size={52} />
                    <span className="absolute inset-0 grid place-items-center" aria-hidden>
                      <span className="grid size-7 place-items-center rounded-full bg-surface">
                        <PaperIcon name={lessonLook(l.id).icon} size={22} />
                      </span>
                    </span>
                  </span>
                  <span className={`text-sm leading-tight ${current ? "font-semibold text-ink" : done ? "text-ink-2" : "text-muted"}`}>{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Other things to do. */}
      <section aria-labelledby="more-title">
        <h2 id="more-title" className="display text-2xl">
          More to do
        </h2>
        <ul className="mt-4 divide-y divide-line rounded-[4px] bg-surface">
          <MoreRow href={links.practice()} icon="target" title="Practice" line="Ten questions across every skill, with stars for each one." />
          {topic.ui.FreeLab && <MoreRow href={links.lab()} icon="lab" title="The lab" line="Cut, colour and compare fractions in free play." />}
          <MoreRow href={routes.journey()} icon="map" title="World map" line="Every island, and the ones opening soon." />
        </ul>
      </section>
    </div>
  );
}

function Meter({ value, fill, label }: { value: number; fill: string; label: string }) {
  return (
    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-sunk" role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </div>
  );
}

function MoreRow({ href, icon, title, line }: { href: string; icon: PaperIconName; title: string; line: string }) {
  return (
    <li>
      <Link href={href} className="flex min-h-20 items-center gap-4 px-5 py-3 hover:bg-raised">
        <PaperIcon name={icon} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-ink">{title}</span>
          <span className="block text-base text-muted">{line}</span>
        </span>
        <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
      </Link>
    </li>
  );
}
