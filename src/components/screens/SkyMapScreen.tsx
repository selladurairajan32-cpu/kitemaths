"use client";

import Link from "next/link";
import { Kip, KipSays } from "@/components/kid/Kip";
import { KID_STATUS } from "@/components/kid/kidText";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { RichText } from "@/components/math/RichText";
import { PaperIcon, type IconName } from "@/components/paper/PaperIcon";
import { isPicName, Pic } from "@/components/paper/Pic";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { allLessonEvidence, unmetPrerequisites, type LessonEvidence } from "@/engine/evidence";
import { isPracticeMilestoneMet, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { STARS } from "@/engine/rewards";
import { routes as appRoutes } from "@/lib/routes";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { topicOf } from "@/topics";
import { factStates } from "@/engine/facts";
import { FACTS_TOPIC } from "@/topics/times-tables/facts";

type Status = "done" | "current" | "open";

interface Stop {
  key: string;
  href: string;
  icon: IconName;
  color: string;
  soft: string;
  kicker: string;
  title: string;
  /** What the child will be able to do (the skill outcome), for lessons. */
  outcome?: string;
  line: string;
  /** A second action, such as the practice that finishes a lesson. */
  extra?: { href: string; label: string };
  /** Why another skill helps first: an explained, soft lock (FR-011 AC2). */
  bestAfter?: string;
  status: Status;
  reward: number;
}

/** Lessons sway left and right to keep the island-path feel, without fixed heights, so text can grow (UX-003 AC3). */
const SWAY = ["sm:ml-0", "sm:ml-16", "sm:ml-28", "sm:ml-16"];

/**
 * The island map: the child's learning journey (FR-011). A lesson counts as done only with independent evidence
 * (CUR-002 §4); reaching its end is shown as "finished", with the practice that completes it.
 */
export function SkyMapScreen() {
  const hydrated = useHydrated();
  const { topic, learner, links } = useTopicState();
  const { skillById, lessonLook } = topic;
  const routes = { ...links, assessment: links.check };
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(topic, learner);
  const practiceMet = isPracticeMilestoneMet(topic, learner);
  const strong = strongSkills(topic, learner).length;
  const needStrong = Math.ceil(topic.skills.length / 2);
  const review = reviewSkills(topic, learner);
  const a = learner.assessment;
  const evidence = new Map(allLessonEvidence(topic, learner).map((e) => [e.lessonId, e]));
  const skillName = (id: string) => {
    const own = topic.skills.find((s) => s.id === id);
    if (own) return own.title;
    const other = topicOf(id);
    return other?.skills.find((s) => s.id === id)?.title ?? id;
  };

  const lessonLine = (e: LessonEvidence, minutes: number, summary: string, steps: number) => {
    switch (e.status) {
      case "evidenced":
        return e.via === "placement" ? "You already knew this! Replay any time." : "Done: you showed you can do it on your own.";
      case "needs-evidence":
        return "Finished! Now answer a few new questions on your own to complete it.";
      case "needs-review":
        return "Let's make this strong again.";
      case "in-progress":
        return `Carry on: step ${Math.min((learner.lessons[e.lessonId]?.furthestStep ?? 0) + 1, steps)} of ${steps}.`;
      default:
        return `${minutes} min · ${summary}`;
    }
  };

  const stops: Stop[] = [
    ...topic.lessons.map((l, i): Stop => {
      const e = evidence.get(l.id)!;
      const look = lessonLook(l.id);
      const current = (rec.kind === "lesson" && rec.lessonId === l.id) || (rec.kind === "practice" && rec.focusSkill !== null && rec.focusSkill === e.skill && e.status === "needs-evidence");
      const unmet = e.status === "not-started" ? unmetPrerequisites(topic, learner, l.id) : [];
      return {
        key: l.id,
        href: routes.lesson(l.id),
        ...look,
        kicker: `Lesson ${i + 1}`,
        title: l.title,
        outcome: e.skill ? skillById(e.skill).title : undefined,
        line: lessonLine(e, l.minutes, l.summary, l.steps.length),
        extra:
          (e.status === "needs-evidence" || e.status === "needs-review") && e.skill
            ? { href: routes.practice(e.skill), label: e.status === "needs-review" ? "Practise it" : "Finish with practice" }
            : undefined,
        bestAfter: unmet.length
          ? `Best after “${unmet.map(skillName).join("” and “")}”: this lesson uses ${unmet.length > 1 ? "them" : "it"}. You can still start now.`
          : undefined,
        status: e.status === "evidenced" ? "done" : current ? "current" : "open",
        reward: STARS.lesson,
      };
    }),
    {
      key: "practice",
      href: routes.practice(),
      icon: "target",
      color: "var(--color-leaf)",
      soft: "var(--color-leaf-soft)",
      kicker: "Practice",
      title: "Mixed practice",
      line: practiceMet ? "Your skills are strong!" : `Make ${needStrong} skills strong (${strong} so far).`,
      status: practiceMet ? "done" : rec.kind === "practice" && !rec.focusSkill ? "current" : "open",
      reward: 0,
    },
    {
      key: "check",
      href: routes.assessment(),
      icon: "trophy",
      color: "var(--color-sun-strong)",
      soft: "var(--color-sun-soft)",
      kicker: "Challenge",
      title: "The big challenge",
      line: a.last ? (review.length ? "Revisit a skill, then recheck it." : "Completed. Brilliant!") : "Show what you know, all by yourself.",
      status: a.last && review.length === 0 ? "done" : rec.kind === "assessment" || rec.kind === "recheck" ? "current" : "open",
      reward: STARS.check,
    },
  ];
  const doneCount = stops.filter((s) => s.status === "done").length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={appRoutes.journey()} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-label font-semibold text-muted hover:text-ink">
        <ArrowLeftIcon size={16} /> World map
      </Link>
      <ScreenHero
        pic={isPicName(topic.look.icon) ? topic.look.icon : "map"}
        titleId="island-title"
        title={topic.title}
        line={`${topic.subtitle}. ${doneCount} of ${stops.length} stops done: each one says what you'll learn.`}
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

      {topic.id === FACTS_TOPIC && (
        // R2: the times-tables island's facts area (TT-004 to TT-012).
        <Link href={links.facts()} className="flex items-center gap-4 rounded-[24px] border-2 border-brand bg-surface p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)]">
          <Pic name="times" size={48} />
          <span className="min-w-0 flex-1">
            <span className="block text-title font-extrabold text-ink">My times-table facts</span>
            <span className="block text-body text-ink-2">
              {factStates(learner.results).filter((x) => x.status === "known").length} of 66 facts known. Practise, check what you know, or try timed practice.
            </span>
          </span>
          <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
        </Link>
      )}

      {topic.id === "mental-maths" && (
        // R3: the mental-maths island's methods lab (MM-009 to MM-011).
        <Link href={links.strategies()} className="flex items-center gap-4 rounded-[24px] border-2 border-brand bg-surface p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)]">
          <Pic name="bulb" size={48} />
          <span className="min-w-0 flex-1">
            <span className="block text-title font-extrabold text-ink">Methods lab</span>
            <span className="block text-body text-ink-2">Compare methods, choose one and say why, and try the one-minute challenge.</span>
          </span>
          <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
        </Link>
      )}

      <section className="rounded-[32px] bg-sky-soft px-3 py-5 sm:px-5" aria-label="Lessons and challenges">
        <ol className="relative space-y-4">
          <span className="absolute bottom-8 left-[2.375rem] top-8 w-1 rounded-full bg-surface sm:hidden" aria-hidden />
          {stops.map((s, i) => {
            const ring =
              s.status === "done" ? "ring-[5px] ring-ok-bright" : s.status === "current" ? "ring-[6px] ring-brand" : "ring-4 ring-line";
            const stateText = s.status === "done" ? "Done" : s.status === "current" ? "Next up" : "";
            return (
              <li key={s.key} className={`relative flex min-w-0 items-start gap-3 sm:gap-4 ${SWAY[i % SWAY.length]}`} aria-current={s.status === "current" ? "step" : undefined}>
                <Link href={s.href} className="group relative shrink-0 rounded-full" aria-label={`${s.title}${stateText ? `. ${stateText}.` : ""}`}>
                  <span className={`relative grid size-[4.75rem] place-items-center rounded-full bg-surface shadow-[var(--shadow-card)] transition-transform group-hover:-translate-y-0.5 ${ring}`}>
                    <PaperIcon name={s.icon} size={44} muted={s.status === "open" && i > topic.lessons.length} />
                    {s.status === "done" && (
                      <span className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-ok-bright text-white ring-[3px] ring-white">
                        <CheckIcon size={16} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                </Link>
                <div className={`min-w-0 flex-1 rounded-[24px] bg-surface p-4 shadow-[var(--shadow-card)] ${s.status === "current" ? "ring-2 ring-brand" : ""}`}>
                  <p className={`text-label font-bold ${s.status === "current" ? "text-brand-strong" : s.status === "done" ? "text-ok" : "text-muted"}`}>
                    {s.kicker}
                    {s.status === "current" && " · Next!"}
                    {s.status === "done" && " · Done"}
                  </p>
                  <p className="text-title font-extrabold text-ink">
                    <Link href={s.href} className="hover:underline">
                      {s.title}
                    </Link>
                  </p>
                  {s.outcome && <p className="text-label font-semibold text-ink-2">You&apos;ll learn: {s.outcome}</p>}
                  <p className="mt-0.5 text-label text-ink-2">
                    {/* Lesson summaries can hold fraction markup such as {1/2}. */}
                    <RichText text={s.line} />
                  </p>
                  {s.bestAfter && <p className="mt-1.5 rounded-[14px] bg-sun-soft px-3 py-1.5 text-label text-ink">{s.bestAfter}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {s.extra && (
                      <Link href={s.extra.href} className="inline-flex min-h-11 items-center text-label font-bold text-brand underline underline-offset-2">
                        {s.extra.label}
                        <span className="sr-only">: {s.title}</span>
                      </Link>
                    )}
                    {s.reward > 0 && s.status !== "done" && (
                      <span className="inline-flex items-center gap-1 text-label font-bold text-ink">
                        +{s.reward} <Pic name="star" size={20} />
                      </span>
                    )}
                  </div>
                </div>
                {s.status === "current" && (
                  <div className="hidden shrink-0 self-center lg:block" aria-hidden>
                    <Kip size={56} mood="cheer" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="card p-5" aria-labelledby="skills-title">
        <h2 id="skills-title" className="display text-title">
          My skills
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {topic.skills.map((sk) => {
            const st = KID_STATUS[skillMastery(sk.id, learner.results).status];
            return (
              <li key={sk.id}>
                <Link href={routes.practice(sk.id)} className="flex items-center justify-between gap-3 rounded-[20px] bg-paper px-3 py-2.5 hover:bg-sunk">
                  <span className="min-w-0 text-label font-medium">{sk.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-label font-bold ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
