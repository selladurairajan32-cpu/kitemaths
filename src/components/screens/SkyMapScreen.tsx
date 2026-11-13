"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { RichText } from "@/components/math/RichText";
import { PaperIcon, type IconName } from "@/components/paper/PaperIcon";
import { buttonClass } from "@/components/ui/Button";
import { CheckIcon, FlagIcon, PracticeIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { allLessonEvidence, unmetPrerequisites, type LessonEvidence } from "@/engine/evidence";
import { factStates } from "@/engine/facts";
import { isPracticeMilestoneMet, phaseStatuses, practiceResultsCount, PRACTICE_READY_RESULTS, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { journeyDone } from "@/engine/overview";
import { STARS } from "@/engine/rewards";
import { CANVAS_LABEL, CANVAS_PHASES, canvasReached } from "@/engine/topicJourney";
import { routes as appRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicOf } from "@/topics";
import { useTopicState } from "@/topics/context";
import { JOURNEYS } from "@/topics/kit/journeys";
import { studyPlan } from "@/topics/kit/study";
import { subTopicHref } from "@/topics/overview";
import { FACTS_TOPIC } from "@/topics/times-tables/facts";
import { WORLDS } from "@/topics/worlds";

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
  /** D-062: the heading of the part this sub-topic starts (topics with a study plan). */
  part?: string;
  /** D-062: where a lesson on the canvas has got to, 0 to 6; undefined when the sub-topic is not taught there. */
  phase?: number;
  minutes?: number;
}

type NodeStatus = "done" | "active" | "next" | "upcoming";

function Node({ status, index }: { status: NodeStatus; index: number }) {
  const cls = { done: "bg-ok text-white", active: "bg-ink text-white ring-4 ring-ink/10", next: "bg-surface text-ink ring-2 ring-ink", upcoming: "bg-surface text-muted ring-1 ring-line-strong" }[status];
  return <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-label font-semibold ${cls}`}>{status === "done" ? <CheckIcon size={18} /> : index}</span>;
}

const STATUS_TEXT: Record<NodeStatus, string> = { done: "Completed", active: "In progress", next: "Recommended next", upcoming: "Coming up" };

/**
 * A topic's page, as the first prototype's "Your learning journey" (D-066): every sub-topic in teaching order on a
 * numbered line, then the practice milestone and the mastery check; "How you'll learn" beside it. A lesson counts as done
 * only with independent evidence (CUR-002 §4). Each sub-topic opens one place: the hands-on lesson where it has one
 * (D-060), else its lesson.
 */
export function SkyMapScreen() {
  const hydrated = useHydrated();
  const { topic, learner, links } = useTopicState();
  const all = useLearner();
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

  const plan = studyPlan(topic);
  const partOf = new Map(plan.flatMap((it) => (it.kind === "sub" && it.partTitle ? [[it.lesson.id, it.partTitle] as const] : [])));
  // Sub-topics in teaching order: the study plan's where there is one (any lesson it leaves out follows).
  const planned = plan.flatMap((it) => (it.kind === "sub" ? [it.lesson] : []));
  const lessons = [...planned, ...topic.lessons.filter((l) => !planned.includes(l))];
  const stops: Stop[] = [
    ...lessons.map((l, i): Stop => {
      const e = evidence.get(l.id)!;
      const journey = e.skill ? JOURNEYS.find((j) => j.topicId === topic.id && j.skill === e.skill) : undefined;
      const saved = journey ? all.journeys?.[`${topic.id}/${journey.concept}`] : undefined;
      const phase = journey?.canvas ? (saved ? (journeyDone(saved) ? CANVAS_PHASES.length : canvasReached(saved)) : 0) : undefined;
      const look = lessonLook(l.id);
      const current = (rec.kind === "lesson" && rec.lessonId === l.id) || (rec.kind === "practice" && rec.focusSkill !== null && rec.focusSkill === e.skill && e.status === "needs-evidence");
      const unmet = e.status === "not-started" ? unmetPrerequisites(topic, learner, l.id) : [];
      return {
        key: l.id,
        href: subTopicHref(topic.id, l.id, e.skill),
        ...look,
        part: partOf.get(l.id),
        phase,
        minutes: l.minutes,
        kicker: `Lesson ${i + 1}`,
        title: l.title,
        outcome: e.skill ? skillById(e.skill).title : undefined,
        line: phase !== undefined && phase > 0 && phase < CANVAS_PHASES.length && e.status !== "evidenced" ? `Carry on: ${CANVAS_LABEL[CANVAS_PHASES[phase]!]}, step ${phase + 1} of ${CANVAS_PHASES.length}.` : lessonLine(e, l.minutes, l.summary, l.steps.length),
        extra:
          (e.status === "needs-evidence" || e.status === "needs-review") && e.skill
            ? { href: routes.practice(e.skill), label: e.status === "needs-review" ? "Practise it" : "Finish with practice" }
            : undefined,
        bestAfter: unmet.length
          ? `Best after “${unmet.map(skillName).join("” and “")}”. You can still start.`
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
      line: practiceMet ? "Your skills are strong!" : `Make ${needStrong} skills strong. ${strong} so far.`,
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
      line: a.last ? (review.length ? "Practise one skill, then try again." : "Done. Brilliant!") : "Answer on your own to finish the island.",
      status: a.last && review.length === 0 ? "done" : rec.kind === "assessment" || rec.kind === "recheck" ? "current" : "open",
      reward: STARS.check,
    },
  ];
  const doneCount = stops.filter((s) => s.status === "done").length;

  const current = stops.find((s) => s.status === "current") ?? stops.find((s) => s.status === "open");
  const world = WORLDS.find((w) => w.id === topic.world);
  const practiced = practiceResultsCount(topic, learner);
  const firstForm = Object.values(topic.assessment.forms)[0] ?? [];
  const areas: { href: string; icon: IconName; title: string; line: string }[] = [
    ...(topic.id === FACTS_TOPIC ? [{ href: links.facts(), icon: "times" as IconName, title: "My times-table facts", line: `${factStates(learner.results).filter((x) => x.status === "known").length} of 66 facts known.` }] : []),
    ...(topic.id === "mock-exams" ? [{ href: links.mock(), icon: "trophy" as IconName, title: "Practice mock", line: "Practise like a real test, then see what to work on." }] : []),
    ...(topic.id === "mental-maths" ? [{ href: links.strategies(), icon: "bulb" as IconName, title: "Mental maths methods", line: "Pick the best method, and try the one-minute challenge." }] : []),
    ...JOURNEYS.filter((j) => j.topicId === topic.id && !topic.lessons.some((l) => evidence.get(l.id)?.skill === j.skill)).map((j) => ({ href: links.learn(j.concept), icon: "bulb" as IconName, title: j.title, line: "Learn it step by step, then practise and check." })),
    { href: links.lab(), icon: "lab" as IconName, title: "Free lab", line: "Explore on your own with the topic's models." },
  ];
  const node = (s: (typeof stops)[number]): NodeStatus => (s.status === "done" ? "done" : s === current ? (s.phase || s.line.startsWith("Carry on") ? "active" : "next") : s.phase ? "active" : "upcoming");
  const practiceStop = stops[lessons.length]!;
  const checkStop = stops[lessons.length + 1]!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <header className="mb-6">
          <p className="eyebrow">{topic.title}</p>
          <h1 id="island-title" className="display text-heading-1 sm:text-display-2">
            Your learning journey
          </h1>
          <p className="mt-2 max-w-xl text-body text-ink-2">
            {lessons.length} short lessons{topic.subtitle ? `: ${topic.subtitle.charAt(0).toLowerCase()}${topic.subtitle.slice(1)}` : ""}. Then practise until you&apos;re secure, and show your mastery.
          </p>
          <p className="mt-3 text-label text-muted">
            {world ? `${world.title} · ` : ""}
            {doneCount} of {stops.length} done ·{" "}
            <Link href={appRoutes.topics()} className="font-medium text-den hover:underline">
              All topics
            </Link>
          </p>
        </header>

        {review.length > 0 && (
          <p className="mb-4 rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-body text-ink-2">
            <strong className="text-ink">{skillById(review[0]).title}</strong> needs another look.{" "}
            <Link href={routes.practice(review[0])} className="font-medium text-den underline underline-offset-4">
              Practise it
            </Link>
          </p>
        )}

        <ol aria-label="Lessons and challenges" className="relative space-y-3">
          <span className="absolute bottom-6 left-[1.2rem] top-6 w-0.5 bg-line" aria-hidden />
          {stops.slice(0, lessons.length).map((s, i) => {
            const status = node(s);
            const l = lessons[i]!;
            const primary = status === "next" || status === "active";
            return (
              <motion.li key={s.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.04 }} className="relative flex gap-4" aria-current={s === current ? "step" : undefined}>
                <Node status={status} index={i + 1} />
                <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${primary ? "ring-1 ring-ink/15" : ""}`}>
                  {s.part && <p className="eyebrow mb-2">{s.part}</p>}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-label">
                        <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">{s.phase !== undefined ? "Hands-on" : l.phase}</span>
                        <span className="text-muted">
                          {l.minutes} min · {s.phase !== undefined ? `${CANVAS_PHASES.length} steps` : `${l.steps.length} steps`}
                        </span>
                        <span className={status === "done" ? "font-medium text-ok" : status === "next" ? "font-medium text-den" : "text-muted"}>{STATUS_TEXT[status]}</span>
                      </p>
                      <h2 className="mt-1.5 font-sans text-title font-semibold">{s.title}</h2>
                      <p className="text-label text-ink-2">
                        <RichText text={s.line.startsWith("Carry on") || s.status === "done" ? s.line : l.summary} />
                      </p>
                      {s.bestAfter && <p className="mt-1.5 rounded-xl bg-warn-soft px-3 py-1.5 text-label text-ink-2">{s.bestAfter}</p>}
                      {s.extra && (
                        <Link href={s.extra.href} className="mt-1 inline-flex min-h-11 items-center text-label font-medium text-den hover:underline">
                          {s.extra.label}
                          <span className="sr-only">: {s.title}</span>
                        </Link>
                      )}
                    </div>
                    <Link href={s.href} className={buttonClass(primary ? "primary" : "secondary", "md", "shrink-0")}>
                      {status === "done" ? "Review" : status === "active" ? "Continue" : "Start"}
                      <span className="sr-only"> {s.title}</span>
                    </Link>
                  </div>
                  {status === "active" && s.phase !== undefined && <ProgressBar value={s.phase / CANVAS_PHASES.length} label={`${s.title} progress`} className="mt-3" />}
                </div>
              </motion.li>
            );
          })}

          <li className="relative flex gap-4">
            <Node status={node(practiceStop)} index={lessons.length + 1} />
            <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${practiceStop === current ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-label">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Practise</span>
                    <span className={node(practiceStop) === "done" ? "font-medium text-ok" : node(practiceStop) === "next" ? "font-medium text-den" : "text-muted"}>{STATUS_TEXT[node(practiceStop)]}</span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 font-sans text-title font-semibold">
                    <PracticeIcon size={18} /> Practice milestone
                  </h2>
                  <p className="text-label text-ink-2">
                    Answer at least {PRACTICE_READY_RESULTS} practice questions and make {needStrong} skills secure.
                  </p>
                </div>
                <Link href={practiceStop.href} className={buttonClass(practiceStop === current ? "primary" : "secondary", "md", "shrink-0")}>
                  Practise<span className="sr-only"> (practice milestone)</span>
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-label text-muted sm:grid-cols-2">
                <div>
                  <ProgressBar value={Math.min(1, practiced / PRACTICE_READY_RESULTS)} label="Practice questions answered" tone="den" />
                  <p className="mt-1">
                    {Math.min(practiced, PRACTICE_READY_RESULTS)} / {PRACTICE_READY_RESULTS} questions
                  </p>
                </div>
                <div>
                  <ProgressBar value={Math.min(1, strong / needStrong)} label="Skills secure" tone="ok" />
                  <p className="mt-1">
                    {Math.min(strong, needStrong)} / {needStrong} skills secure
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li className="relative flex gap-4">
            <Node status={node(checkStop)} index={lessons.length + 2} />
            <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${checkStop === current ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-label">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Master</span>
                    <span className={node(checkStop) === "done" ? "font-medium text-ok" : node(checkStop) === "next" ? "font-medium text-den" : "text-muted"}>{STATUS_TEXT[node(checkStop)]}</span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 font-sans text-title font-semibold">
                    <FlagIcon size={18} /> Mastery check
                  </h2>
                  <p className="text-label text-ink-2">
                    {firstForm.length} questions on your own, with no hints. {checkStop.line}
                  </p>
                </div>
                <Link href={checkStop.href} className={buttonClass(checkStop === current ? "primary" : "secondary", "md", "shrink-0")}>
                  {learner.assessment.status === "in-progress" ? "Resume check" : learner.assessment.last ? "Retake check" : "Open check"}
                </Link>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h2 className="font-sans text-body font-semibold">How you&apos;ll learn</h2>
          <p className="mt-1 text-label text-ink-2">Every topic follows the same path, so understanding comes before testing.</p>
          <ol className="mt-4 space-y-3">
            {phaseStatuses(topic, learner).map(({ phase, status }, i) => (
              <li key={phase} className="flex gap-3">
                <span className={`grid size-6 shrink-0 place-items-center rounded-full text-label font-semibold ${status === "done" ? "bg-ok text-white" : status === "current" ? "bg-ink text-white" : "bg-sunk text-muted"}`}>
                  {status === "done" ? <CheckIcon size={12} /> : i + 1}
                </span>
                <div>
                  <p className="text-label font-medium">{phase}</p>
                  <p className="text-label text-muted">{topic.phaseDescriptions[phase]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="card p-5">
          <h2 id="more-title" className="font-sans text-body font-semibold">
            More in this topic
          </h2>
          <ul className="mt-3 space-y-1">
            {areas.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="-mx-2 flex items-center gap-3 rounded-xl p-2 hover:bg-sunk">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sunk" aria-hidden>
                    <PaperIcon name={a.icon} size={24} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label font-medium text-ink">{a.title}</span>
                    <span className="block text-label text-muted">{a.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
