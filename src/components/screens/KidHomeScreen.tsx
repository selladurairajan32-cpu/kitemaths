"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { FlameGlyph, StarGlyph } from "@/components/kid/Celebrate";
import { Kip, KipSays } from "@/components/kid/Kip";
import { kidNext, lessonLook } from "@/components/kid/kidText";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { recommendNext, reviewSkills } from "@/engine/journey";
import { activeDays, answeredToday, DAILY_GOAL, dayKey, levelFor, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { LESSONS } from "@/topics/fractions/lessons";
import { skillById } from "@/topics/fractions/skills";

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function KidHomeScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;

  const brandNew = learner.placement.status === "not-started" && learner.results.length === 0;
  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const next = kidNext(rec);
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const streak = streakFor(learner, now);
  const today = answeredToday(learner, now);
  const days = activeDays(learner);
  const week = Array.from({ length: 7 }, (_, i) => {
    const at = now - (6 - i) * 86_400_000;
    return { key: dayKey(at), letter: DAY_LETTERS[new Date(at).getDay()], done: days.has(dayKey(at)), today: i === 6 };
  });
  const review = reviewSkills(FRACTIONS_TOPIC, learner);
  const name = learner.profile.name.trim();
  const goalPct = Math.min(1, today / DAILY_GOAL);

  return (
    <div className="space-y-5 sm:space-y-6">
      <StorageNotice />

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-[#5b63ff] to-sky p-5 text-white shadow-[0_6px_0_var(--color-brand-strong)] sm:p-8"
        aria-labelledby="hero-title"
      >
        <Clouds />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 sm:block">
            <Kip mood={brandNew ? "cheer" : "happy"} size={brandNew ? 110 : 96} />
            <p className="text-lg font-semibold sm:hidden">
              {greeting(now)}
              {name ? `, ${name}` : ""}!
            </p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="hidden text-lg font-semibold text-white/85 sm:block">
              {greeting(now)}
              {name ? `, ${name}` : ""}!
            </p>
            {brandNew ? (
              <>
                <h1 id="hero-title" className="display mt-1 text-3xl leading-tight sm:text-4xl">
                  I&apos;m Kip! Let&apos;s fly into fractions together.
                </h1>
                <p className="mt-2 max-w-lg text-white/90">First, a quick warm-up game so I know where your adventure should start.</p>
                <ButtonLink href={routes.start()} variant="sun" size="xl" className="mt-5">
                  Start my adventure <ArrowRightIcon size={20} />
                </ButtonLink>
              </>
            ) : (
              <>
                <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                  <span aria-hidden>{next.emoji}</span> {next.kicker}
                </p>
                <h1 id="hero-title" className="display mt-2 text-3xl leading-tight sm:text-4xl">
                  {next.title}
                </h1>
                <p className="mt-1.5 max-w-lg text-white/90">{next.line}</p>
                <ButtonLink href={next.href} variant="sun" size="xl" className="mt-5">
                  {next.cta} <ArrowRightIcon size={20} />
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href={routes.badges()} className="card group flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="eyebrow">My stars</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-bold text-brand-strong">Level {level.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <StarGlyph size={34} />
            <span className="display text-4xl tabular-nums">{stars}</span>
          </div>
          <div>
            <div className="h-3 overflow-hidden rounded-full bg-sun-soft" role="progressbar" aria-label="Progress to next level" aria-valuenow={level.into} aria-valuemax={level.needed} aria-valuemin={0}>
              <motion.div className="h-full rounded-full bg-sun" initial={{ width: 0 }} animate={{ width: `${(level.into / level.needed) * 100}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }} />
            </div>
            <p className="mt-1.5 text-sm text-muted">
              <strong className="text-ink">{level.title}</strong> · {level.needed - level.into} stars to level {level.level + 1}
            </p>
          </div>
        </Link>

        <section className="card flex flex-col gap-3 p-5" aria-labelledby="streak-title">
          <div className="flex items-center justify-between">
            <span id="streak-title" className="eyebrow">
              My streak
            </span>
            {streak.best > 1 && <span className="text-xs font-semibold text-muted">Best: {streak.best}</span>}
          </div>
          <div className="flex items-center gap-2">
            <FlameGlyph size={34} lit={streak.activeToday} />
            <span className="display text-4xl tabular-nums">{streak.current}</span>
            <span className="text-sm font-medium text-muted">{streak.current === 1 ? "day" : "days"}</span>
          </div>
          <ol className="flex justify-between gap-1" aria-label="Last 7 days">
            {week.map((d) => (
              <li key={d.key} className="flex flex-col items-center gap-1">
                <span
                  className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                    d.done ? "bg-num text-white" : d.today ? "border-2 border-dashed border-num/60 text-num-strong" : "bg-sunk text-muted"
                  }`}
                  aria-label={`${d.today ? "Today" : d.key}: ${d.done ? "learned" : "not yet"}`}
                >
                  {d.done ? "✓" : d.letter}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card flex items-center gap-4 p-5" aria-labelledby="goal-title">
          <GoalRing value={goalPct}>
            <span className="display text-2xl tabular-nums">{Math.min(today, DAILY_GOAL)}</span>
            <span className="text-[0.7rem] font-semibold text-muted">of {DAILY_GOAL}</span>
          </GoalRing>
          <div>
            <p id="goal-title" className="eyebrow">
              Today&apos;s goal
            </p>
            <p className="display mt-1 text-xl leading-snug">{today >= DAILY_GOAL ? "Goal smashed! 🎉" : `Answer ${DAILY_GOAL} questions`}</p>
            <p className="mt-1 text-sm text-muted">{today >= DAILY_GOAL ? "Anything more is a bonus." : "Every answer gets you closer."}</p>
          </div>
        </section>
      </div>

      {review.length > 0 && (
        <KipSays mood="think" tone="sun" speak={`Let's revisit ${skillById(review[0]).title}. A little practice will make it strong again.`}>
          Let&apos;s revisit <strong>{skillById(review[0]).title}</strong>. A little practice will make it strong again!{" "}
          <Link href={routes.practice(review[0])} className="font-semibold text-brand underline underline-offset-2">
            Practise it
          </Link>
        </KipSays>
      )}

      {/* Sky path preview */}
      <section className="card p-5 sm:p-6" aria-labelledby="path-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="path-title" className="display text-2xl">
            My sky path
          </h2>
          <Link href={routes.journey()} className="inline-flex items-center gap-1 rounded-full bg-sky-soft px-3 py-1.5 text-sm font-semibold text-den-strong hover:bg-[#cce8ff]">
            Open map <ArrowRightIcon size={15} />
          </Link>
        </div>
        <ol className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
          {LESSONS.map((l, i) => {
            const p = learner.lessons[l.id];
            const done = !!p?.completed;
            const current = rec.kind === "lesson" && rec.lessonId === l.id;
            const later = !done && !current && !(p && p.furthestStep > 0);
            const look = lessonLook(l.id);
            return (
              <li key={l.id} className="snap-start">
                <Link
                  href={routes.lesson(l.id)}
                  className={`flex w-28 flex-col items-center gap-2 rounded-3xl border-2 p-3 text-center transition-transform hover:-translate-y-0.5 ${
                    current ? "border-brand bg-brand-soft" : "border-line bg-surface"
                  }`}
                  aria-label={`Lesson ${i + 1}: ${l.title}${done ? " (done)" : current ? " (next)" : ""}`}
                >
                  <span className="relative grid size-14 place-items-center rounded-full text-2xl" style={{ background: look.soft }}>
                    <span aria-hidden className={later ? "opacity-50" : ""}>
                      {look.emoji}
                    </span>
                    {done && (
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white">
                        <CheckIcon size={13} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className={`text-xs font-semibold leading-tight ${later ? "text-muted" : "text-ink"}`}>{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Play tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <PlayTile href={routes.practice()} emoji="🎯" title="Practice" line="Win stars" from="from-ok-bright" to="to-mint" edge="#139656" />
        <PlayTile href={routes.lab()} emoji="🧪" title="Fraction Lab" line="Build & explore" from="from-pink" to="to-num" edge="#d93a7f" />
        <PlayTile href={routes.journey()} emoji="🗺️" title="Adventure map" line="All the lessons" from="from-sky" to="to-den" edge="#1d55d8" />
        <PlayTile href={routes.badges()} emoji="🏅" title="Badges" line="Your trophies" from="from-sun" to="to-[#ff9d2e]" edge="#e08a00" dark />
      </div>
    </div>
  );
}

function PlayTile({ href, emoji, title, line, from, to, edge, dark = false }: { href: string; emoji: string; title: string; line: string; from: string; to: string; edge: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`press flex min-h-32 flex-col justify-between rounded-[1.75rem] bg-gradient-to-br ${from} ${to} p-4 ${dark ? "text-ink" : "text-white"} sm:p-5`}
      style={{ boxShadow: `0 5px 0 ${edge}`, ["--press-edge" as string]: edge }}
    >
      <span className="text-4xl drop-shadow-sm" aria-hidden>
        {emoji}
      </span>
      <span>
        <span className="display block text-xl leading-tight">{title}</span>
        <span className={`text-sm font-medium ${dark ? "text-ink/75" : "text-white/90"}`}>{line}</span>
      </span>
    </Link>
  );
}

function GoalRing({ value, children }: { value: number; children: React.ReactNode }) {
  const size = 92;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Daily goal ${Math.round(value * 100)}% done`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-ok-soft" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-ok-bright"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">{children}</div>
    </div>
  );
}

function Clouds() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden preserveAspectRatio="none">
      <g fill="#fff">
        <ellipse cx="85%" cy="18%" rx="70" ry="22" />
        <ellipse cx="80%" cy="14%" rx="38" ry="22" />
        <ellipse cx="60%" cy="88%" rx="90" ry="24" />
        <ellipse cx="66%" cy="82%" rx="44" ry="24" />
        <ellipse cx="10%" cy="92%" rx="60" ry="18" />
      </g>
    </svg>
  );
}
