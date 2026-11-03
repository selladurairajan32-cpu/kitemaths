"use client";

import { PaperIcon, type IconName } from "@/components/paper/PaperIcon";
import Link from "next/link";
import { Kip, KipSays } from "@/components/kid/Kip";
import { KID_STATUS } from "@/components/kid/kidText";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { isPracticeMilestoneMet, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { STARS } from "@/engine/rewards";
import { routes as appRoutes } from "@/lib/routes";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { isPicName, Pic } from "@/components/paper/Pic";

type Status = "done" | "current" | "open";

interface Stop {
  key: string;
  href: string;
  icon: IconName;
  color: string;
  soft: string;
  title: string;
  line: string;
  status: Status;
  reward: number;
}

/** Horizontal positions (in %) for the winding path. */
const WAVE = [40, 72, 58, 28, 22, 44, 72, 62, 34];
const ROW = 168;

export function SkyMapScreen() {
  const hydrated = useHydrated();
  const { topic, learner, links } = useTopicState();
  const { skillById, lessonLook } = topic;
  const LESSONS = topic.lessons;
  const routes = { ...links, assessment: links.check };
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(topic, learner);
  const practiceMet = isPracticeMilestoneMet(topic, learner);
  const strong = strongSkills(topic, learner).length;
  const needStrong = Math.ceil(topic.skills.length / 2);
  const review = reviewSkills(topic, learner);
  const a = learner.assessment;

  const stops: Stop[] = [
    ...LESSONS.map((l): Stop => {
      const p = learner.lessons[l.id];
      const look = lessonLook(l.id);
      const current = rec.kind === "lesson" && rec.lessonId === l.id;
      return {
        key: l.id,
        href: routes.lesson(l.id),
        ...look,
        title: l.title,
        line: p?.completed ? (p.placedOut ? "You already knew this!" : "Done — replay any time") : `${l.minutes} min · ${l.summary}`,
        status: p?.completed ? "done" : current ? "current" : "open",
        reward: STARS.lesson,
      };
    }),
    {
      key: "practice",
      href: routes.practice(),
      icon: "target",
      color: "#22c174",
      soft: "#d9f7e8",
      title: "Power-up practice",
      line: practiceMet ? "Your skills are strong!" : `Make ${needStrong} skills strong (${strong} so far)`,
      status: practiceMet ? "done" : rec.kind === "practice" && !rec.focusSkill ? "current" : "open",
      reward: 0,
    },
    {
      key: "check",
      href: routes.assessment(),
      icon: "trophy",
      color: "#f0a800",
      soft: "#fff5cf",
      title: "The big challenge",
      line: a.last ? (review.length ? "Revisit a skill, then recheck it" : "Completed — brilliant!") : "Show what you know, all by yourself",
      status: a.last && review.length === 0 ? "done" : rec.kind === "assessment" || rec.kind === "recheck" ? "current" : "open",
      reward: STARS.check,
    },
  ];

  const height = stops.length * ROW;
  const points = stops.map((_, i) => ({ x: WAVE[i % WAVE.length], y: i * ROW + ROW / 2 }));
  const path = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    })
    .join(" ");
  const doneCount = stops.filter((s) => s.status === "done").length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={appRoutes.journey()} className="inline-flex items-center gap-1.5 rounded-full px-1 text-[0.9375rem] font-semibold text-muted hover:text-ink">
        <ArrowLeftIcon size={16} /> World map
      </Link>
      <ScreenHero
        pic={isPicName(topic.look.icon) ? topic.look.icon : "map"}
        titleId="island-title"
        title={topic.title}
        line={`${doneCount} of ${stops.length} stops reached. Tap any stop to play!`}
      />

      {review.length > 0 && (
        <KipSays mood="think" tone="sun" speak={`Let's make ${skillById(review[0]).title} strong again.`}>
          <span>
            Let&apos;s make <strong>{skillById(review[0]).title}</strong> strong again!{" "}
            <Link href={routes.practice(review[0])} className="font-semibold text-brand underline underline-offset-2">
              Practise it
            </Link>
          </span>
        </KipSays>
      )}

      <section className="relative overflow-hidden rounded-[32px] bg-[#f0f5ff] px-2 py-5" aria-label="Lessons and challenges">
        <svg className="pointer-events-none absolute inset-x-0 top-5 w-full" style={{ height }} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
          <path d={path} fill="none" stroke="#fff" strokeWidth="16" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={path} fill="none" stroke="#b9cdf0" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative" style={{ height }}>
          {stops.map((s, i) => {
            const x = WAVE[i % WAVE.length];
            const labelLeft = x > 50;
            const ring =
              s.status === "done"
                ? "ring-[6px] ring-ok-bright"
                : s.status === "current"
                  ? "ring-[7px] ring-brand shadow-[0_0_0_16px_rgba(37,99,235,0.12),var(--shadow-lift)]"
                  : "ring-4 ring-[#dbe5f5]";
            return (
              <li key={s.key} className="absolute" style={{ top: i * ROW, height: ROW, left: `${x}%` }}>
                <Link
                  href={s.href}
                  className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  aria-label={`${s.title}. ${s.status === "done" ? "Done." : s.status === "current" ? "Next up!" : ""}`}
                >
                  <span className={`relative grid size-[4.75rem] place-items-center rounded-full bg-surface shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-0.5 sm:size-[5.5rem] ${ring}`}>
                    <PaperIcon name={s.icon} size={48} muted={s.status === "open" && i > LESSONS.length} />
                    {s.status === "done" && (
                      <span className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-ok-bright text-white ring-[3px] ring-white">
                        <CheckIcon size={16} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                </Link>
                {s.status === "current" && (
                  <div className={`absolute top-1/2 -translate-y-[95%] ${labelLeft ? "left-14" : "right-14"} hidden sm:block`} aria-hidden>
                    <Kip size={56} mood="cheer" />
                  </div>
                )}
                <div className={`absolute top-1/2 w-[min(15rem,34vw)] -translate-y-1/2 ${labelLeft ? "right-[3.25rem] pr-2 text-right sm:right-16" : "left-[3.25rem] pl-2 sm:left-16"}`}>
                  <p className={`text-[0.9375rem] font-bold ${s.status === "current" ? "text-brand-strong" : s.status === "done" ? "text-ok" : "text-muted"}`}>
                    {i < LESSONS.length ? `Lesson ${i + 1}` : i === LESSONS.length ? "Practice" : "Challenge"}
                    {s.status === "current" && " · Next!"}
                  </p>
                  <p className="text-lg font-extrabold leading-snug text-ink">{s.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.9375rem] text-ink-2">{s.line}</p>
                  {s.reward > 0 && s.status !== "done" && (
                    <p className={`mt-1 inline-flex items-center gap-1 text-[0.9375rem] font-bold text-ink ${labelLeft ? "justify-end" : ""}`}>
                      +{s.reward} <Pic name="star" size={20} />
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card p-5" aria-labelledby="skills-title">
        <h2 id="skills-title" className="display text-xl">
          My skills
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {topic.skills.map((sk) => {
            const st = KID_STATUS[skillMastery(sk.id, learner.results).status];
            return (
              <li key={sk.id}>
                <Link href={routes.practice(sk.id)} className="flex items-center justify-between gap-3 rounded-[20px] bg-paper px-3 py-2.5 hover:bg-sunk">
                  <span className="text-[0.9375rem] font-medium">{sk.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.9375rem] font-bold ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
