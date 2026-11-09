"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Kip, KipSays } from "@/components/kid/Kip";
import { kidNext } from "@/components/kid/kidText";
import { RichText } from "@/components/math/RichText";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { isPicName, Pic, type PicName } from "@/components/paper/Pic";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, LockIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { PRACTICE_SESSION_LENGTH } from "@/engine/adaptive";
import { allLessonEvidence } from "@/engine/evidence";
import { lessonsEvidenced, recommendNext, reviewSkills } from "@/engine/journey";
import { activeDays, answeredToday, badgesFor, DAILY_GOAL, dayKey, levelFor, STARS, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { TOPICS } from "@/topics";
import { useTopicState } from "@/topics/context";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { WORLDS } from "@/topics/worlds";
import { badgePic } from "@/components/kid/badgePic";

const islandCount = WORLDS.reduce((n, w) => n + w.islands.length, 0);

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
/** Each lesson card gets its own pastel tile, in turn. */
const TILES = ["bg-tile-orange", "bg-tile-pink", "bg-tile-blue", "bg-tile-yellow", "bg-tile-green", "bg-tile-sky"];


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

  // DEF-003: any lesson progress means the child has started, even before answering a question.
  const brandNew = inTopic.placement.status === "not-started" && learner.results.length === 0 && Object.keys(inTopic.lessons).length === 0;
  // DEF-011: every island's warm-up is offered from home until it is done or skipped.
  const warmUpOpen = !brandNew && inTopic.placement.status === "not-started" && !!topic.placement;
  const rec = recommendNext(topic, inTopic);
  const next = kidNext(rec, topic);
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const streak = streakFor(learner, now);
  const today = Math.min(answeredToday(learner, now), DAILY_GOAL);
  const days = activeDays(learner);
  const week = Array.from({ length: 7 }, (_, i) => {
    const at = now - (6 - i) * 86_400_000;
    return { key: dayKey(at), letter: DAY_LETTERS[new Date(at).getDay()], done: days.has(dayKey(at)), today: i === 6 };
  });
  const review = reviewSkills(topic, inTopic);
  const name = learner.profile.name.trim();
  // FR-011 AC3: a lesson is done when it has independent evidence, not when its last page was reached.
  const done = lessonsEvidenced(topic, inTopic);
  const evidence = new Map(allLessonEvidence(topic, inTopic).map((e) => [e.lessonId, e]));
  const lessonCount = TOPICS.reduce((n, t) => n + t.lessons.length, 0);
  const badges = badgesFor(learner, TOPICS.flatMap((t) => t.skills), lessonCount, now);
  const won = badges.filter((b) => b.earned);
  // Home shows what to aim for next (the closest badges still to win); the Badges page is the whole collection.
  const shelf = [...badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress), ...won].slice(0, 6);
  const nextIndex = rec.kind === "lesson" ? topic.lessons.findIndex((l) => l.id === rec.lessonId) : -1;
  const nextIcon = nextIndex >= 0 ? lessonLook(topic.lessons[nextIndex].id).icon : "pizza";
  const nextPic: PicName = isPicName(nextIcon) ? nextIcon : "pizza";

  return (
    <div className="space-y-12 sm:space-y-16">
      <StorageNotice />

      {/* What to do next: the one question this screen answers. */}
      <section className="relative overflow-hidden rounded-[32px] bg-[#edf3ff] px-5 py-8 sm:px-10 sm:py-12" aria-labelledby="next-title">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-lg font-semibold text-ink-2">
              <Pic name="sun" size={30} priority />
              {greeting(now)}
              {name ? `, ${name}` : ""}
            </p>
            {brandNew ? (
              <>
                <h1 id="next-title" className="display mt-3 text-heading-1 sm:text-display-1">
                  I&apos;m Kip. Let&apos;s find your start!
                </h1>
                <p className="mt-4 max-w-xl text-lg text-ink-2 sm:text-[1.1875rem]">
                  A short warm-up game shows me which {topic.title} lessons you already know, so you start in the right place.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href={links.start()} size="xl" className="w-full sm:w-auto">
                    Play the warm-up <ArrowRightIcon size={20} />
                  </ButtonLink>
                </div>
              </>
            ) : (
              <>
                <h1 id="next-title" className="display mt-3 text-heading-1 sm:text-display-1">
                  {next.title}
                </h1>
                <p className="mt-4 max-w-xl text-lg text-ink-2 sm:text-[1.1875rem]">
                  {next.kicker}. <RichText text={next.line} />
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <ButtonLink href={next.href} size="xl" className="w-full sm:w-auto">
                    {next.cta} <ArrowRightIcon size={20} />
                  </ButtonLink>
                  <ButtonLink href={links.island()} variant="secondary" size="xl" className="w-full sm:w-auto">
                    Open my island
                  </ButtonLink>
                </div>
                {nextIndex >= 0 && (
                  <p className="mt-5 text-label font-semibold text-muted">
                    Lesson {nextIndex + 1} of {topic.lessons.length} · {topic.lessons[nextIndex].minutes} minutes
                  </p>
                )}
              </>
            )}
          </div>
          <HeroArt
            mood={brandNew ? "cheer" : "happy"}
            cards={[
              { pic: nextPic, title: nextIndex >= 0 ? `Lesson ${nextIndex + 1}` : topic.title, sub: nextIndex >= 0 ? `of ${topic.lessons.length}` : "island" },
              { pic: "star", title: `+${STARS.lesson} stars`, sub: "for a lesson" },
              { pic: "trophy", title: `Level ${level.level + 1}`, sub: `${level.needed - level.into} stars away` },
              { pic: "flame", title: `${streak.current} day${streak.current === 1 ? "" : "s"}`, sub: "streak" },
            ]}
          />
        </div>
      </section>

      {warmUpOpen && (
        <KipSays mood="happy" tone="sky">
          New to {topic.title}? A short warm-up finds the right lesson to start with.{" "}
          <Link href={links.start()} className="inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
            Play the warm-up
          </Link>
        </KipSays>
      )}

      {review.length > 0 && (
        <KipSays mood="think" tone="sun" speak={`Let's revisit ${skillById(review[0]).title}. A little practice will make it strong again.`}>
          Let&apos;s revisit <strong>{skillById(review[0]).title}</strong>. A little practice will make it strong again.{" "}
          <Link href={links.practice(review[0])} className="font-bold text-brand-strong underline underline-offset-4">
            Practise it
          </Link>
        </KipSays>
      )}

      {/* Stars, streak, lessons and today's goal. */}
      <section aria-label="Your progress">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3 sm:gap-5">
          <StatCard href={routes.badges()} pic="star" tile="bg-tile-yellow" label="Stars" value={String(stars)} sub={`Level ${level.level} · ${level.title}`}>
            <Meter value={level.into / level.needed} fill="bg-warn-bright" label={`Level ${level.level}: ${level.into} of ${level.needed} stars`} />
          </StatCard>
          <StatCard pic="flame" tile="bg-tile-orange" label="Streak" value={String(streak.current)} unit={streak.current === 1 ? "day" : "days"} sub={streak.activeToday ? "Done for today" : streak.current === 0 ? "Play today to start one" : "Play today to keep it"}>
            <ol className="mt-2.5 flex flex-wrap gap-1" aria-label="The last 7 days">
              {week.map((d) => (
                <li
                  key={d.key}
                  className={`grid min-h-7 min-w-7 place-items-center rounded-full text-label font-bold ${d.done ? "bg-fire text-white" : d.today ? "border-2 border-dashed border-line-strong text-muted" : "bg-sunk text-muted"}`}
                  aria-label={`${d.today ? "Today" : d.key}: ${d.done ? "learned" : "not yet"}`}
                >
                  <span aria-hidden>{d.letter}</span>
                </li>
              ))}
            </ol>
          </StatCard>
          <StatCard href={links.island()} pic="books" tile="bg-tile-blue" label="Lessons" value={String(done)} unit={`of ${topic.lessons.length}`} sub={topic.title}>
            <Meter value={done / topic.lessons.length} fill="bg-brand" label={`${done} of ${topic.lessons.length} lessons done`} />
          </StatCard>
          <StatCard href={links.practice()} pic="target" tile="bg-tile-green" label="Today" value={String(today)} unit={`of ${DAILY_GOAL}`} sub={today >= DAILY_GOAL ? "Goal done. Nice work!" : "Questions answered"}>
            <Meter value={today / DAILY_GOAL} fill="bg-ok-bright" label={`${today} of ${DAILY_GOAL} questions today`} />
          </StatCard>
        </ul>
      </section>

      {/* The island: one card per lesson, then the big challenge. */}
      <section aria-labelledby="island-title">
        <SectionHead id="island-title" title={topic.title} line={`${done} of ${topic.lessons.length} lessons done. Finish them all, then take the big challenge.`} href={links.island()} cta="See the map" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {topic.lessons.map((l, i) => {
            const p = inTopic.lessons[l.id];
            const e = evidence.get(l.id)!;
            const isDone = e.status === "evidenced";
            const isNext = (rec.kind === "lesson" && rec.lessonId === l.id) || (rec.kind === "practice" && !!rec.focusSkill && rec.focusSkill === e.skill && e.status === "needs-evidence");
            const status = isDone
              ? e.via === "placement"
                ? "You already knew this"
                : "Done · you showed you can do it"
              : e.status === "needs-evidence"
                ? "Finished · practise to complete it"
                : e.status === "needs-review"
                  ? "Let's revisit this"
                  : isNext
                    ? p
                      ? `Step ${Math.min(p.furthestStep + 1, l.steps.length)} of ${l.steps.length}`
                      : "Up next"
                    : `${l.minutes} min`;
            return (
              <li key={l.id} className="flex">
                <Link
                  href={isNext && e.status === "needs-evidence" && e.skill ? links.practice(e.skill) : links.lesson(l.id)}
                  className={`relative grid flex-1 grid-cols-[4.5rem_1fr] content-center items-center gap-x-4 rounded-[24px] border bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:grid-cols-[5.25rem_1fr] sm:p-5 ${
                    isNext ? "border-2 border-brand shadow-[0_0_0_6px_var(--color-brand-soft),var(--shadow-lift)]" : "border-line"
                  }`}
                  aria-label={`Lesson ${i + 1}: ${l.title}. ${status}`}
                >
                  <span className={`grid size-[4.5rem] place-items-center rounded-[20px] sm:size-[5.25rem] ${TILES[i % TILES.length]}`}>
                    <PaperIcon name={lessonLook(l.id).icon} size={56} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label font-bold text-muted">Lesson {i + 1}</span>
                    <span className="mt-0.5 block text-body font-extrabold leading-snug text-ink sm:text-title">{l.title}</span>
                    <span className={`mt-1.5 flex items-center gap-1.5 text-label font-bold ${isDone ? "text-ok" : isNext ? "text-brand-strong" : "font-semibold text-muted"}`}>
                      {isDone && <CheckIcon size={17} strokeWidth={3} />}
                      {status}
                    </span>
                  </span>
                  {isDone && (
                    <span className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-ok-bright text-white" aria-hidden>
                      <CheckIcon size={16} strokeWidth={3} />
                    </span>
                  )}
                  {isNext && (
                    <span className="col-span-2 mt-4 flex h-12 items-center justify-center gap-2 rounded-full border-b-[3px] border-brand-strong bg-brand text-[1.0625rem] font-bold text-on-brand" aria-hidden>
                      Play <ArrowRightIcon size={18} />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <Link
              href={links.check()}
              className="relative grid flex-1 grid-cols-[4.5rem_1fr] content-center items-center gap-x-4 rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:grid-cols-[5.25rem_1fr] sm:p-5"
            >
              <span className="grid size-[4.5rem] place-items-center rounded-[20px] bg-tile-yellow sm:size-[5.25rem]">
                <Pic name="trophy" size={56} />
              </span>
              <span className="min-w-0">
                <span className="block text-label font-bold text-muted">The big challenge</span>
                <span className="mt-0.5 block text-lg font-extrabold leading-snug text-ink sm:text-xl">Show what you know</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-label font-semibold text-muted">
                  {inTopic.assessment.last ? (
                    <>
                      <CheckIcon size={17} strokeWidth={3} /> Taken · try it again any time
                    </>
                  ) : done < topic.lessons.length ? (
                    <>
                      <LockIcon size={16} /> Best after all {topic.lessons.length} lessons
                    </>
                  ) : (
                    `+${STARS.check} stars`
                  )}
                </span>
              </span>
            </Link>
          </li>
        </ol>
      </section>

      {/* Badges to collect. */}
      <section className="rounded-[32px] bg-[#f0f5ff] px-5 py-8 sm:px-10 sm:py-10" aria-labelledby="badges-title">
        <SectionHead
          id="badges-title"
          title={won.length === badges.length ? "Every badge won!" : "Badges to win next"}
          line={won.length === badges.length ? `All ${badges.length} badges are yours.` : `The ones you're closest to, and how to win them. ${won.length} of ${badges.length} won so far.`}
          href={routes.badges()}
          cta="See all badges"
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {shelf.map((b) => (
            <li key={b.id} className="flex flex-col items-center gap-2 rounded-[24px] border border-line bg-surface px-3 pb-5 pt-6 text-center shadow-[var(--shadow-card)]">
              <Pic name={badgePic(b.id)} size={72} muted={!b.earned} />
              <span className="text-body font-extrabold leading-snug text-ink">{b.title}</span>
              {!b.earned && <span className="text-label text-ink-2">{b.description}</span>}
              {b.earned ? (
                <span className="text-label font-bold text-ok">Won</span>
              ) : (
                <>
                  <Meter value={b.progress} fill="bg-warn-bright" label={`${b.title}: ${Math.round(b.progress * 100)}%`} className="mt-0 w-4/5" />
                  <span className="text-label font-semibold text-muted">{Math.round(b.progress * 100)}% there</span>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Other things to do. */}
      <section aria-labelledby="more-title">
        <h2 id="more-title" className="display text-heading-2 sm:text-heading-1">
          More to explore
        </h2>
        <ul className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">
          <MoreCard href={links.practice()} pic="target" tile="bg-tile-green" title="Practice" line={`${PRACTICE_SESSION_LENGTH} questions. Up to 3 stars each, for right first time.`} />
          {topic.ui.FreeLab && <MoreCard href={links.lab()} pic="lab" tile="bg-tile-sky" title="The lab" line="Cut, colour and compare in free play." />}
          <MoreCard href={routes.journey()} pic="map" tile="bg-tile-blue" title="World map" line={`${islandCount} islands in ${WORLDS.length} worlds, from place value to 11+ practice.`} />
        </ul>
      </section>

      <footer className="flex flex-col gap-3 pb-4">
        <KipSays mood="happy" tone="sky" size={72}>
          {/* What exactly keeps the streak going: the streak card above only says whether today is done. */}
          {!streak.activeToday
            ? streak.current === 0
              ? "Answer just one question today to start a streak!"
              : `Answer just one question today to keep your ${streak.current}-day streak!`
            : today < DAILY_GOAL
              ? `Streak safe for today. ${DAILY_GOAL - today} more question${DAILY_GOAL - today === 1 ? "" : "s"} and you reach today's goal.`
              : `Goal done! Come back tomorrow to make it a ${streak.current + 1}-day streak.`}
        </KipSays>
        <p className="text-label text-muted">3D pictures: Microsoft Fluent Emoji, MIT licence.</p>
      </footer>
    </div>
  );
}

/** Kip flying in a pale circle, with a few real numbers floating around. */
function HeroArt({ mood, cards }: { mood: "happy" | "cheer"; cards: { pic: PicName; title: string; sub: string }[] }) {
  const spots = ["left-0 top-[20%] -rotate-6", "right-0 top-[30%] rotate-[5deg]", "left-[6%] bottom-[6%] -rotate-3", "right-[4%] bottom-[2%] rotate-3"];
  return (
    <div className="relative mx-auto aspect-[1.08] w-full max-w-[34rem]" aria-hidden>
      <div className="absolute left-[9%] top-[5%] aspect-square w-[82%] rounded-full bg-[#dde8ff]" />
      <svg className="absolute left-[2%] top-[4%]" width="34" height="34" viewBox="0 0 24 24">
        <path d="M12 2.5l2.6 6 6.4.6-4.9 4.2 1.5 6.3L12 16.3 6.4 19.6l1.5-6.3L3 9.1l6.4-.6z" fill="none" stroke="#ffb020" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <svg className="absolute right-[6%] top-[2%]" width="70" height="40" viewBox="0 0 70 40">
        <path d="M4 30 C 16 4, 34 4, 36 20 S 58 36, 66 8" fill="none" stroke="#7fb0ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" />
      </svg>
      <span className="absolute bottom-[3%] left-[46%] size-4 rounded-full bg-[#ff8fab]" />
      <span className="absolute right-0 top-[58%] size-3 rounded-full bg-[#4cd38f]" />
      <span className="absolute left-[19%] top-[3%] w-[60%]">
        <Kip mood={mood} size={320} className="!h-auto !w-full rotate-[4deg]" />
      </span>
      {cards.map((c, i) => (
        <div key={i} className={`absolute flex items-center gap-2.5 rounded-[18px] bg-surface py-2 pl-2 pr-4 shadow-[var(--shadow-lift)] ${spots[i]}`}>
          <Pic name={c.pic} size={40} />
          <span className="leading-tight">
            <span className="block text-body font-extrabold text-ink">{c.title}</span>
            <span className="block text-label font-semibold text-muted">{c.sub}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionHead({ id, title, line, href, cta }: { id: string; title: string; line: string; href: string; cta: string }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="display text-heading-2 sm:text-heading-1">
          {title}
        </h2>
        <p className="mt-1.5 text-lg text-ink-2">{line}</p>
      </div>
      <Link href={href} className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-full text-[1.0625rem] font-bold text-brand-strong hover:underline sm:self-auto">
        {cta} <ArrowRightIcon size={18} />
      </Link>
    </div>
  );
}

function StatCard({
  href,
  pic,
  tile,
  label,
  value,
  unit,
  sub,
  children,
}: {
  href?: string;
  pic: PicName;
  tile: string;
  label: string;
  value: string;
  unit?: string;
  sub: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`grid size-12 shrink-0 place-items-center rounded-[16px] sm:size-14 ${tile}`}>
          <Pic name={pic} size={36} />
        </span>
        <span className="min-w-0">
          <span className="block text-label font-bold text-muted">{label}</span>
          <span className="block text-heading-2 font-extrabold leading-tight text-ink">
            {value}
            {unit && <span className="ml-1 text-label font-bold text-muted">{unit}</span>}
          </span>
        </span>
      </div>
      <p className="mt-3 text-label font-semibold text-muted">{sub}</p>
      {children}
    </>
  );
  const cls = "block h-full rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5";
  return <li>{href ? <Link href={href} className={`${cls} transition hover:shadow-[var(--shadow-lift)]`}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}

function Meter({ value, fill, label, className = "mt-3" }: { value: number; fill: string; label: string; className?: string }) {
  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-sunk ${className}`} role="progressbar" aria-label={label} aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` }} />
    </div>
  );
}

function MoreCard({ href, pic, tile, title, line }: { href: string; pic: PicName; tile: string; title: string; line: string }) {
  return (
    <li>
      <Link href={href} className="flex h-full items-center gap-4 rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:p-5">
        <span className={`grid size-16 shrink-0 place-items-center rounded-[20px] ${tile}`}>
          <Pic name={pic} size={44} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-extrabold text-ink">{title}</span>
          <span className="block text-body text-ink-2">{line}</span>
        </span>
        <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
      </Link>
    </li>
  );
}
