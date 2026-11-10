"use client";

import Link from "next/link";
import { Kip, KipSays } from "@/components/kid/Kip";
import { kidNext } from "@/components/kid/kidText";
import { RichText } from "@/components/math/RichText";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { Pic, type PicName } from "@/components/paper/Pic";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, LockIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { allLessonEvidence } from "@/engine/evidence";
import { lessonsEvidenced, recommendNext, reviewSkills } from "@/engine/journey";
import { answeredToday, badgesFor, DAILY_GOAL, levelFor, STARS, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { TOPICS } from "@/topics";
import { useTopicState } from "@/topics/context";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { WORLDS } from "@/topics/worlds";
import { startedTopics } from "@/topics/recommend";

const islandCount = WORLDS.reduce((n, w) => n + w.islands.length, 0);

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
  const review = reviewSkills(topic, inTopic);
  const name = learner.profile.name.trim();
  // FR-011 AC3: a lesson is done when it has independent evidence, not when its last page was reached.
  const done = lessonsEvidenced(topic, inTopic);
  const evidence = new Map(allLessonEvidence(topic, inTopic).map((e) => [e.lessonId, e]));
  const lessonCount = TOPICS.reduce((n, t) => n + t.lessons.length, 0);
  const badges = badgesFor(learner, startedTopics(learner).flatMap((t) => t.skills), lessonCount, now);
  const won = badges.filter((b) => b.earned);
  const nextIndex = rec.kind === "lesson" ? topic.lessons.findIndex((l) => l.id === rec.lessonId) : -1;
  // R1 (content audit): Home shows the next three unfinished lessons; the island map lists them all.
  const upcoming = topic.lessons.map((l, i) => ({ l, i })).filter(({ l }) => evidence.get(l.id)!.status !== "evidenced").slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-12">
      <StorageNotice />

      {/* What to do next: the one question this screen answers, with one button (D-037). */}
      <section className="relative overflow-hidden rounded-[32px] border border-line bg-brand-soft px-5 py-8 sm:px-10 sm:py-10" aria-labelledby="next-title">
        <div className="flex items-center gap-8">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-lg font-semibold text-ink-2">
              <Pic name="sun" size={30} priority />
              {greeting(now)}
              {name ? `, ${name}` : ""}
            </p>
            <h1 id="next-title" className="display mt-3 text-heading-1 sm:text-display-1">
              {brandNew ? <>I&apos;m Kip. Let&apos;s find your start!</> : next.title}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-ink">
              {brandNew ? <>A short warm-up game finds the right {topic.title} lesson for you.</> : <RichText text={next.line} />}
            </p>
            <ButtonLink href={brandNew ? links.start() : next.href} size="xl" className="mt-6 w-full sm:w-auto">
              {brandNew ? "Play the warm-up" : next.cta} <ArrowRightIcon size={20} />
            </ButtonLink>
            {!brandNew && nextIndex >= 0 && (
              <p className="mt-4 text-body font-semibold text-ink-2">
                Lesson {nextIndex + 1} of {topic.lessons.length} · about {topic.lessons[nextIndex].minutes} minutes
              </p>
            )}
          </div>
          <div className="hidden shrink-0 sm:block" aria-hidden>
            <Kip mood={brandNew ? "cheer" : "happy"} size={150} />
          </div>
        </div>
      </section>

      {/* One message from Kip at most: a skill to revisit, else the warm-up, else the streak. */}
      {review.length > 0 ? (
        <KipSays mood="think" tone="sun" speak={`Let's revisit ${skillById(review[0]).title}.`}>
          Let&apos;s revisit <strong>{skillById(review[0]).title}</strong>.{" "}
          <Link href={links.practice(review[0])} className="inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
            Practise it
          </Link>
        </KipSays>
      ) : warmUpOpen ? (
        <KipSays mood="happy" tone="sky">
          New to {topic.title}? A warm-up finds where to start.{" "}
          <Link href={links.start()} className="inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
            Play the warm-up
          </Link>
        </KipSays>
      ) : !brandNew ? (
        <KipSays mood="happy" tone="sky">
          {!streak.activeToday
            ? streak.current === 0
              ? "Answer just one question today to start a streak!"
              : `Answer one question today to keep your ${streak.current}-day streak!`
            : today < DAILY_GOAL
              ? `Streak safe! ${DAILY_GOAL - today} more question${DAILY_GOAL - today === 1 ? "" : "s"} for today's goal.`
              : `Goal done! Come back tomorrow for a ${streak.current + 1}-day streak.`}
        </KipSays>
      ) : null}

      {/* Stars, streak and today's goal in one strip. */}
      <section aria-label="Your progress">
        <ul className="grid grid-cols-3 gap-2 rounded-[24px] border border-line bg-surface p-3 shadow-[var(--shadow-card)] sm:gap-4 sm:p-4">
          <Stat href={routes.badges()} pic="star" value={String(stars)} label={`stars · level ${level.level}`} />
          <Stat pic="flame" value={String(streak.current)} label={streak.current === 1 ? "day streak" : "days streak"} />
          <Stat href={links.practice()} pic="target" value={`${today}/${DAILY_GOAL}`} label="today" />
        </ul>
      </section>

      {/* Up next on the island: the next lessons, then the big challenge. */}
      <section aria-labelledby="island-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="island-title" className="display text-heading-2">
              Up next: {topic.title}
            </h2>
            <p className="mt-1 text-body text-ink-2">
              {done} of {topic.lessons.length} lessons done
            </p>
          </div>
          <Link href={links.island()} className="inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
            See all lessons <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {upcoming.map(({ l, i }) => {
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
                <span className="block text-lg font-extrabold leading-snug text-ink sm:text-xl">The big challenge</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-label font-bold text-ink-2">
                  {inTopic.assessment.last ? (
                    <>
                      <CheckIcon size={17} strokeWidth={3} /> Done · try again any time
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

      {/* Other places to go, kept small so they never compete with the main button. */}
      <nav aria-label="More to do" className="flex flex-wrap gap-3">
        <ButtonLink href={links.practice()} variant="secondary">
          <Pic name="target" size={24} /> Practice
        </ButtonLink>
        <ButtonLink href={routes.badges()} variant="secondary">
          <Pic name="medal" size={24} /> Badges · {won.length} of {badges.length}
        </ButtonLink>
        <ButtonLink href={routes.journey()} variant="secondary">
          <Pic name="map" size={24} /> World map · {islandCount} islands
        </ButtonLink>
        {topic.ui.FreeLab && (
          <ButtonLink href={links.lab()} variant="secondary">
            <Pic name="lab" size={24} /> The lab
          </ButtonLink>
        )}
      </nav>

      <footer className="pb-4">
        <p className="text-label text-muted">3D pictures: Microsoft Fluent Emoji, MIT licence.</p>
      </footer>
    </div>
  );
}

/** One number in the progress strip. */
function Stat({ href, pic, value, label }: { href?: string; pic: PicName; value: string; label: string }) {
  const body = (
    <>
      <Pic name={pic} size={32} />
      <span className="min-w-0">
        <span className="block text-title font-extrabold leading-tight text-ink">{value}</span>
        <span className="block text-label font-bold leading-tight text-ink-2">{label}</span>
      </span>
    </>
  );
  const cls = "flex min-h-14 items-center gap-2 rounded-[16px] p-1.5 sm:gap-3 sm:p-2";
  return <li>{href ? <Link href={href} className={`${cls} hover:bg-raised`}>{body}</Link> : <div className={cls}>{body}</div>}</li>;
}
