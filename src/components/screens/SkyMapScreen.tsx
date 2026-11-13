"use client";

import Link from "next/link";
import { Fragment } from "react";
import { KID_STATUS } from "@/components/kid/kidText";
import { Column, NextStep, PageTitle, Row, Rows, Section, Steps, type Mark } from "@/components/kid/Plain";
import { RichText } from "@/components/math/RichText";
import { PaperIcon, type IconName } from "@/components/paper/PaperIcon";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { allLessonEvidence, unmetPrerequisites, type LessonEvidence } from "@/engine/evidence";
import { factStates } from "@/engine/facts";
import { isPracticeMilestoneMet, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { STARS } from "@/engine/rewards";
import { journeyDone } from "@/engine/overview";
import { CANVAS_LABEL, CANVAS_PHASES, canvasReached } from "@/engine/topicJourney";
import { routes as appRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicOf } from "@/topics";
import { useTopicState } from "@/topics/context";
import { JOURNEYS } from "@/topics/kit/journeys";
import { subTopicHref } from "@/topics/overview";
import { studyPlan } from "@/topics/kit/study";
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
  /** D-062: the same idea as a film with guided steps (a topic journey in the earlier layout). */
  film?: string;
  minutes?: number;
}

/**
 * A topic's page: its sub-topics in teaching order, then mixed practice and the big challenge (FR-011). A lesson counts
 * as done only with independent evidence (CUR-002 §4); reaching its end is shown as "finished", with the practice that
 * completes it. D-062: one plain list with one thing to do next. Each sub-topic opens where it is taught best: the
 * lesson canvas where it has one (D-060), the topic learning page where the topic has a study plan (D-054), else the
 * lesson. A sub-topic that also has a film journey offers it as a second way in.
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
        film: journey && !journey.canvas ? links.learn(journey.concept) : undefined,
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
  const lessonCount = lessons.length;
  const mark = (s: Stop, i: number): Mark => (s.status === "done" ? { kind: "done" } : i < lessonCount ? (s === current ? { kind: "here", n: i + 1 } : { kind: "number", n: i + 1 }) : { kind: "pic", node: <PaperIcon name={s.icon} size={26} /> });
  // The topic's special areas (facts, mocks, methods), as plain rows.
  const areas: { href: string; icon: IconName; title: string; line: string }[] = [
    ...(topic.id === FACTS_TOPIC ? [{ href: links.facts(), icon: "times" as IconName, title: "My times-table facts", line: `${factStates(learner.results).filter((x) => x.status === "known").length} of 66 facts known. Practise or check them.` }] : []),
    ...(topic.id === "mock-exams" ? [{ href: links.mock(), icon: "trophy" as IconName, title: "Practice mock", line: "Practise like a real test, then see what to work on." }] : []),
    ...(topic.id === "mental-maths" ? [{ href: links.strategies(), icon: "bulb" as IconName, title: "Mental maths methods", line: "Pick the best method, and try the one-minute challenge." }] : []),
  ];
  // Journeys that belong to no lesson here keep their own row, so nothing that was reachable is lost.
  const loose = JOURNEYS.filter((j) => j.topicId === topic.id && !topic.lessons.some((l) => evidence.get(l.id)?.skill === j.skill));

  return (
    <Column>
      <div className="flex flex-col gap-3">
        <Link href={appRoutes.topics()} className="inline-flex min-h-11 items-center gap-1.5 self-start text-label font-bold text-ink-2 hover:text-ink">
          <ArrowLeftIcon size={16} /> All topics
        </Link>
        <PageTitle id="island-title" eyebrow={world?.title} title={topic.title} line={topic.subtitle}>
          <div className="mt-2 flex max-w-md items-center gap-3">
            <ProgressBar value={doneCount / stops.length} tone="ok" label={`${doneCount} of ${stops.length} done`} className="h-2.5" />
            <span className="whitespace-nowrap text-label font-bold text-ink-2">
              {doneCount} of {stops.length} done
            </span>
          </div>
        </PageTitle>
      </div>

      {current && (
        <NextStep
          id="next-title"
          label={review.length > 0 ? "Make it strong again" : doneCount === 0 && current === stops[0] ? "Start here" : "Next"}
          title={review.length > 0 ? skillById(review[0]).title : current.title}
          line={review.length > 0 ? "A few questions on just this skill." : <RichText text={current.line} />}
          action={
            <ButtonLink href={review.length > 0 ? routes.practice(review[0]) : (current.extra?.href ?? current.href)} variant="cta" size="xl">
              {review.length > 0 ? "Practise it" : (current.extra?.label ?? (current.phase ? "Carry on" : "Start"))} <ArrowRightIcon size={20} />
            </ButtonLink>
          }
        >
          {current.phase !== undefined && review.length === 0 && <Steps count={CANVAS_PHASES.length} done={current.phase} label={`Step ${Math.min(current.phase + 1, CANVAS_PHASES.length)} of ${CANVAS_PHASES.length}`} />}
        </NextStep>
      )}

      <Section id="path-title" title="Sub-topics" line="In the order that works best. You can open any of them.">
        <Rows ordered label="Lessons and challenges">
          {stops.map((s, i) => (
            <Fragment key={s.key}>
              {s.part && (
                <li role="presentation" className="pb-2 pt-6 text-label font-extrabold uppercase tracking-widest text-muted first:pt-1">
                  {s.part}
                </li>
              )}
              {i === lessonCount && <li role="presentation" className="pb-2 pt-6 text-label font-extrabold uppercase tracking-widest text-muted">Then</li>}
              <Row
                href={s.href}
                mark={mark(s, i)}
                current={s === current}
                label={`${s.title}${s.status === "done" ? ". Done." : s === current ? ". Next up." : ""}`}
                title={s.title}
                line={<RichText text={s.line} />}
                trail={s.status === "done" ? "Done" : s.phase ? `${Math.min(s.phase, CANVAS_PHASES.length)} of ${CANVAS_PHASES.length}` : s.phase === 0 ? "Hands-on" : undefined}
                below={
                  (s.bestAfter || s.extra || s.film) && (
                    <div className="flex flex-col items-start gap-1">
                      {s.bestAfter && <p className="rounded-[14px] bg-sun-soft px-3 py-1.5 text-label text-ink">{s.bestAfter}</p>}
                      {s.extra && (
                        <Link href={s.extra.href} className="inline-flex min-h-11 items-center text-label font-bold text-brand-strong underline underline-offset-4">
                          {s.extra.label}
                          <span className="sr-only">: {s.title}</span>
                        </Link>
                      )}
                      {s.film && (
                        <Link href={s.film} className="inline-flex min-h-11 items-center text-label font-bold text-brand-strong underline underline-offset-4">
                          Watch the film and try it<span className="sr-only">: {s.title}</span>
                        </Link>
                      )}
                    </div>
                  )
                }
              />
            </Fragment>
          ))}
        </Rows>
      </Section>

      {(areas.length > 0 || loose.length > 0) && (
        <Section id="more-title" title="More in this topic">
          <Rows>
            {areas.map((a) => (
              <Row key={a.href} href={a.href} mark={{ kind: "pic", node: <PaperIcon name={a.icon} size={26} /> }} title={a.title} line={a.line} />
            ))}
            {loose.map((j) => (
              <Row key={j.concept} href={links.learn(j.concept)} mark={{ kind: "pic", node: <PaperIcon name="bulb" size={26} /> }} title={j.title} line="Learn it step by step, then practise and check what you know." />
            ))}
          </Rows>
        </Section>
      )}

      <Section id="skills-title" title="My skills" line="Open one to practise just that skill.">
        <Rows>
          {topic.skills.map((sk) => {
            const st = KID_STATUS[skillMastery(sk.id, learner.results).status];
            return (
              <li key={sk.id} className="border-t border-line last:border-b">
                <Link href={routes.practice(sk.id)} className="-mx-3 flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius-control)] px-3 py-2 hover:bg-raised">
                  <span className="min-w-0 text-body font-semibold text-ink">{sk.title}</span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-label font-bold ${st.cls}`}>{st.label}</span>
                </Link>
              </li>
            );
          })}
        </Rows>
      </Section>
    </Column>
  );
}
