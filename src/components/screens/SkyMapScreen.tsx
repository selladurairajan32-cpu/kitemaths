"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { StarGlyph } from "@/components/kid/Celebrate";
import { Kip, KipSays } from "@/components/kid/Kip";
import { KID_STATUS, lessonLook } from "@/components/kid/kidText";
import { CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { isPracticeMilestoneMet, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { STARS } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { LESSONS } from "@/topics/fractions/lessons";
import { skillById } from "@/topics/fractions/skills";

type Status = "done" | "current" | "open";

interface Stop {
  key: string;
  href: string;
  emoji: string;
  color: string;
  soft: string;
  title: string;
  line: string;
  status: Status;
  reward: number;
}

/** Horizontal positions (in %) for the winding path. */
const WAVE = [40, 72, 58, 28, 22, 44, 72, 62, 34];
const ROW = 128;

export function SkyMapScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const practiceMet = isPracticeMilestoneMet(FRACTIONS_TOPIC, learner);
  const strong = strongSkills(FRACTIONS_TOPIC, learner).length;
  const needStrong = Math.ceil(FRACTIONS_TOPIC.skills.length / 2);
  const review = reviewSkills(FRACTIONS_TOPIC, learner);
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
      emoji: "🎯",
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
      emoji: "🏆",
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
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Fractions island</p>
          <h1 className="display text-3xl sm:text-4xl">Adventure map</h1>
          <p className="mt-1 text-ink-2">
            {doneCount} of {stops.length} stops reached. Tap any stop to play!
          </p>
        </div>
      </header>

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

      <section className="relative overflow-hidden rounded-[2rem] border-2 border-line bg-gradient-to-b from-sky-soft via-[#eef6ff] to-brand-soft px-2 py-4 shadow-[var(--shadow-card)]" aria-label="Lessons and challenges">
        <svg className="pointer-events-none absolute inset-x-0 top-4 w-full" style={{ height }} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
          <path d={path} fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={path} fill="none" stroke="#c2cdea" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative" style={{ height }}>
          {stops.map((s, i) => {
            const x = WAVE[i % WAVE.length];
            const labelLeft = x > 50;
            return (
              <motion.li
                key={s.key}
                className="absolute"
                style={{ top: i * ROW, height: ROW, left: `${x}%` }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link href={s.href} className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" aria-label={`${s.title}. ${s.status === "done" ? "Done." : s.status === "current" ? "Next up!" : ""}`}>
                  {s.status === "current" && (
                    <motion.span
                      className="absolute -inset-3 rounded-full"
                      style={{ background: s.color, opacity: 0.25 }}
                      animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.1, 0.35] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      aria-hidden
                    />
                  )}
                  <span
                    className="press relative grid size-[4.5rem] place-items-center rounded-full border-4 border-white text-3xl transition-transform group-hover:-translate-y-0.5 sm:size-20 sm:text-4xl"
                    style={{
                      background: s.status === "open" ? "#ffffff" : s.color,
                      boxShadow: `0 5px 0 ${s.status === "open" ? "#c2cdea" : `color-mix(in srgb, ${s.color} 70%, #1d2350)`}`,
                      ["--press-edge" as string]: s.color,
                    }}
                  >
                    <span aria-hidden className={s.status === "open" ? "opacity-70" : ""}>
                      {s.emoji}
                    </span>
                    {s.status === "done" && (
                      <span className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-ok-bright text-white ring-[3px] ring-white">
                        <CheckIcon size={15} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                </Link>
                {s.status === "current" && (
                  <div className={`absolute top-1/2 -translate-y-[85%] ${labelLeft ? "left-12" : "right-12"} hidden sm:block`} aria-hidden>
                    <Kip size={46} mood="cheer" />
                  </div>
                )}
                <div
                  className={`absolute top-1/2 w-[min(15rem,34vw)] -translate-y-1/2 ${labelLeft ? "right-[3rem] pr-2 text-right sm:right-14" : "left-[3rem] pl-2 sm:left-14"}`}
                >
                  <p className="text-[0.7rem] font-bold uppercase tracking-wide" style={{ color: s.status === "open" ? "#646d9a" : s.color }}>
                    {i < LESSONS.length ? `Lesson ${i + 1}` : i === LESSONS.length ? "Practice" : "Challenge"}
                    {s.status === "current" && " · Next!"}
                  </p>
                  <p className="display text-base leading-tight text-ink sm:text-lg">{s.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted sm:text-sm">{s.line}</p>
                  {s.reward > 0 && s.status !== "done" && (
                    <p className={`mt-1 inline-flex items-center gap-1 text-xs font-bold text-sun-strong ${labelLeft ? "justify-end" : ""}`}>
                      +{s.reward} <StarGlyph size={13} />
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      <section className="card p-5" aria-labelledby="skills-title">
        <h2 id="skills-title" className="display text-xl">
          My skills
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FRACTIONS_TOPIC.skills.map((sk) => {
            const st = KID_STATUS[skillMastery(sk.id, learner.results).status];
            return (
              <li key={sk.id}>
                <Link href={routes.practice(sk.id)} className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-3 py-2.5 hover:bg-sunk">
                  <span className="text-sm font-medium">{sk.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
