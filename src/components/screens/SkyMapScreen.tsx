"use client";

import { Fragment } from "react";
import { FIELDS, WORLD_FIELD } from "@/components/kid/fields";
import { Kip } from "@/components/kid/Kip";
import { KID_STATUS } from "@/components/kid/kidText";
import { Fill, GoLink, Heading, Lift, Page, Pop, Stop as StopDot } from "@/components/kid/Play";
import { RichText } from "@/components/math/RichText";
import { PaperIcon, type IconName } from "@/components/paper/PaperIcon";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { allLessonEvidence, unmetPrerequisites, type LessonEvidence } from "@/engine/evidence";
import { factStates } from "@/engine/facts";
import { isPracticeMilestoneMet, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { journeyDone } from "@/engine/overview";
import { STARS } from "@/engine/rewards";
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
  minutes?: number;
}

/**
 * A topic's page: its sub-topics as a path (FR-011). A lesson counts as done only with independent evidence (CUR-002
 * §4); reaching its end is shown as "finished", with the practice that completes it. D-064, the Playground look: a
 * winding path of big round stops, green when done, yellow where the child is, with the page's one yellow button at
 * that stop. Every stop opens one place: the lesson canvas where the sub-topic has one (D-060), else its lesson.
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
  const field = WORLD_FIELD[topic.world] ?? FIELDS.blue;
  const lessonCount = lessons.length;
  // The topic's special areas (facts, mocks, methods), and any journey that belongs to no lesson here.
  const areas: { href: string; icon: IconName; title: string; line: string }[] = [
    ...(topic.id === FACTS_TOPIC ? [{ href: links.facts(), icon: "times" as IconName, title: "My times-table facts", line: `${factStates(learner.results).filter((x) => x.status === "known").length} of 66 facts known. Practise or check them.` }] : []),
    ...(topic.id === "mock-exams" ? [{ href: links.mock(), icon: "trophy" as IconName, title: "Practice mock", line: "Practise like a real test, then see what to work on." }] : []),
    ...(topic.id === "mental-maths" ? [{ href: links.strategies(), icon: "bulb" as IconName, title: "Mental maths methods", line: "Pick the best method, and try the one-minute challenge." }] : []),
    ...JOURNEYS.filter((j) => j.topicId === topic.id && !topic.lessons.some((l) => evidence.get(l.id)?.skill === j.skill)).map((j) => ({ href: links.learn(j.concept), icon: "bulb" as IconName, title: j.title, line: "Learn it step by step, then practise and check what you know." })),
  ];
  /** The path sways from side to side on a wide screen; on a phone it runs straight down. */
  const SWAY = ["sm:ml-0", "sm:ml-14", "sm:ml-28", "sm:ml-14"];

  return (
    <Page>
      <section aria-labelledby="island-title" className={`flex flex-col gap-5 rounded-[var(--radius-hero)] px-6 py-7 sm:px-10 sm:py-9 ${field.bg} ${field.text}`}>
        <Lift href={appRoutes.topics()} className="inline-flex min-h-11 items-center gap-2 self-start rounded-full bg-white/20 px-4 text-body font-extrabold">
          <ArrowLeftIcon size={18} strokeWidth={3} /> All topics
        </Lift>
        <div className="flex items-center gap-5">
          <span className="grid size-24 shrink-0 place-items-center rounded-[28px] bg-surface sm:size-28" aria-hidden>
            <PaperIcon name={topic.look.icon} size={76} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {world && <p className="text-body font-extrabold">{world.title}</p>}
            <h1 id="island-title" className="display text-heading-1 sm:text-display-1">
              {topic.title}
            </h1>
            <div className="flex max-w-md items-center gap-3">
              <Fill value={doneCount / stops.length} label={`${doneCount} of ${stops.length} done`} onDark />
              <span className="whitespace-nowrap text-body font-extrabold">
                {doneCount} of {stops.length} done
              </span>
            </div>
          </div>
        </div>
      </section>

      {review.length > 0 && (
        <Lift href={routes.practice(review[0])} className="flex items-center gap-4 rounded-[28px] bg-tile-pink p-4 sm:p-5">
          <PaperIcon name="target" size={52} />
          <span className="min-w-0 flex-1">
            <span className="block text-title font-extrabold text-ink">Let&apos;s make {skillById(review[0]).title} strong again</span>
            <span className="block text-body text-ink-2">A few quick questions on just this.</span>
          </span>
          <span className="hidden shrink-0 rounded-full bg-surface px-5 py-2 text-body font-extrabold text-ink sm:block">Practise it</span>
        </Lift>
      )}

      <section aria-labelledby="path-title" className="flex flex-col gap-5">
        <Heading id="path-title">Your path</Heading>
        <ol aria-label="Lessons and challenges" className="relative m-0 flex list-none flex-col gap-4 p-0">
          <span className="absolute bottom-10 left-10 top-10 -ml-0.5 border-l-4 border-dashed border-line-strong sm:hidden" aria-hidden />
          {stops.map((s, i) => {
            const here = s === current;
            const state = s.status === "done" ? "done" : here ? "here" : "open";
            const main = here && s.extra ? s.extra : { href: s.href, label: s.phase ? "Carry on" : i >= lessonCount ? "Go" : "Start" };
            return (
              <Fragment key={s.key}>
                {s.part && (
                  <li role="presentation" className={`mt-3 self-start rounded-full px-5 py-1.5 text-body font-extrabold first:mt-0 ${field.soft} text-ink`}>
                    {s.part}
                  </li>
                )}
                {i === lessonCount && (
                  <li role="presentation" className="mt-3 self-start rounded-full bg-tile-yellow px-5 py-1.5 text-body font-extrabold text-ink">
                    Then show what you know
                  </li>
                )}
                <li className={`relative ${SWAY[i % SWAY.length]}`} aria-current={here ? "step" : undefined}>
                  <Pop i={i}>
                    <div className={`flex items-center gap-4 rounded-[28px] ${here ? "border-4 border-ink bg-surface p-3 sm:p-4" : "p-1"}`}>
                      <Lift href={s.href} aria-label={`${s.title}${s.status === "done" ? ". Done." : here ? ". Next up." : ""}`} className="rounded-full">
                        <StopDot state={state}>{i < lessonCount ? i + 1 : <PaperIcon name={s.icon} size={40} />}</StopDot>
                      </Lift>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className={`leading-snug text-ink ${here ? "display text-heading-2" : "text-title font-extrabold"}`}>{s.title}</p>
                        <p className="text-body text-ink-2">
                          {/* A stop still to come says only how long it takes; the stop the child is on says what it is about. */}
                          <RichText text={!here && s.minutes && s.line.startsWith(`${s.minutes} min ·`) ? `${s.minutes} minutes` : s.line} />
                        </p>
                        {s.bestAfter && <p className="mt-1 self-start rounded-[14px] bg-sun-soft px-3 py-1.5 text-label text-ink">{s.bestAfter}</p>}
                        {!here && s.extra && (
                          <Lift href={s.extra.href} className="inline-flex min-h-11 items-center self-start text-body font-extrabold text-brand-strong underline underline-offset-4">
                            {s.extra.label}
                            <span className="sr-only">: {s.title}</span>
                          </Lift>
                        )}
                      </div>
                      {here && (
                        <div className="hidden shrink-0 items-center gap-3 sm:flex">
                          <Kip mood="cheer" size={64} float />
                          <GoLink href={main.href}>{main.label}</GoLink>
                        </div>
                      )}
                    </div>
                    {here && (
                      <GoLink href={main.href} className="mt-3 w-full sm:hidden">
                        {main.label}
                      </GoLink>
                    )}
                  </Pop>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </section>

      {areas.length > 0 && (
        <section aria-labelledby="more-title" className="flex flex-col gap-4">
          <Heading id="more-title">More to do here</Heading>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {areas.map((a) => (
              <li key={a.href} className="flex">
                <Lift href={a.href} className={`flex flex-1 items-center gap-4 rounded-[28px] p-5 ${field.soft}`}>
                  <span className="grid size-16 shrink-0 place-items-center rounded-full bg-surface" aria-hidden>
                    <PaperIcon name={a.icon} size={40} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-title font-extrabold text-ink">{a.title}</span>
                    <span className="block text-body text-ink-2">{a.line}</span>
                  </span>
                </Lift>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="skills-title" className="flex flex-col gap-4">
        <Heading id="skills-title">My skills</Heading>
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {topic.skills.map((sk) => {
            const st = KID_STATUS[skillMastery(sk.id, learner.results).status];
            return (
              <li key={sk.id}>
                <Lift href={routes.practice(sk.id)} className="flex min-h-12 items-center gap-3 rounded-full border-2 border-line-strong bg-surface py-1.5 pl-5 pr-2 hover:bg-raised">
                  <span className="min-w-0 text-body font-bold text-ink">{sk.title}</span>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-label font-extrabold ${st.cls}`}>{st.label}</span>
                </Lift>
              </li>
            );
          })}
        </ul>
      </section>
    </Page>
  );
}
