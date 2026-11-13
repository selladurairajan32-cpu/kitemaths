"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FIELDS } from "@/components/kid/fields";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { WorkedExample } from "@/components/lesson/WorkedExample";
import { RichText } from "@/components/math/RichText";
import { Scallop } from "@/components/kid/Scallop";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { skillMastery } from "@/engine/mastery";
import { completeLabChallenge, completeLesson, goToStep, recordResult } from "@/engine/progress";
import type { Lesson } from "@/lessons/types";
import { routes } from "@/lib/routes";
import { updateTopic, useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { EXPLAIN_SCRIPTS } from "@/topics/kit/explainScripts";
import { JOURNEYS } from "@/topics/kit/journeys";
import { studyPages, studyPlan, type StudyItem } from "@/topics/kit/study";
import { deepFor } from "@/topics/kit/deepIndex";
import { DEEP_PAGES, DeepPage, LevelChip } from "./DeepSubTopic";

/**
 * D-054 pilot: the topic learning page. The topic's sub-topics down the left (a drawer on a phone), practice stops after
 * every few and the topic test at the end; one sub-topic at a time on the right, as short pages (Understand, Example,
 * Together, Your turn, Remember), with the concept's film at the bottom where one exists. Content is the lesson's own
 * steps; progress is saved the way the lesson player saves it.
 */
export function StudyScreen({ part }: { part?: string }) {
  const hydrated = useHydrated();
  const { topic, learner } = useTopicState();
  if (!hydrated) return <ScreenSkeleton />;
  const plan = studyPlan(topic);
  const subs = plan.filter((i): i is Extract<StudyItem, { kind: "sub" }> => i.kind === "sub");
  const firstOpen = subs.find((s) => !learner.lessons[s.lesson.id]?.completed) ?? subs[0];
  const item = plan.find((i) => i.part === part) ?? firstOpen;
  const done = subs.filter((s) => learner.lessons[s.lesson.id]?.completed).length;

  return (
    <div className="space-y-8">
    {/* D-057: the page banner of the reference site: squared paper, breadcrumbs, the topic's picture on the right. */}
    <section aria-label={`${topic.title}: where you are`} className="paper-grid relative overflow-hidden rounded-[32px] bg-tile-orange px-6 pb-9 pt-6 sm:px-10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-label font-semibold text-ink-2">
            <Link href={routes.topics()} className="font-bold text-ink underline-offset-4 hover:underline">
              Topics
            </Link>
            <span aria-hidden> / </span>
            <span>{topic.title}</span>
          </nav>
          <p className="display mt-2 text-heading-1 sm:text-display-2">
            {topic.title}
          </p>
          <p className="mt-1 text-body text-ink-2">
            {done} of {subs.length} sub-topics done · practice stops after each part · a topic test at the end
          </p>
        </div>
        <span className="hidden size-28 shrink-0 place-items-center rounded-full bg-surface sm:grid" aria-hidden>
          <PaperIcon name={topic.look.icon} size={76} />
        </span>
      </div>
      <Scallop />
    </section>
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div className="hidden rounded-[28px] bg-raised p-5 lg:block">
          <TopicList plan={plan} current={item.part} done={done} total={subs.length} />
        </div>
        <details className="panel rounded-[20px] lg:hidden">
          <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 px-4 font-extrabold text-ink">
            <span>
              {topic.title}: sub-topics <span className="font-semibold text-ink-2">({done} of {subs.length} done)</span>
            </span>
            <ArrowRightIcon size={18} className="rotate-90" />
          </summary>
          <div className="border-t border-line p-3">
            <TopicList plan={plan} current={item.part} done={done} total={subs.length} compact />
          </div>
        </details>
      </aside>

      <div className="min-w-0">
        {item.kind === "sub" && <SubTopic key={item.lesson.id} item={item} plan={plan} />}
        {item.kind === "practice" && <PracticeStop item={item} plan={plan} />}
        {item.kind === "test" && <TopicTest subs={subs} />}
      </div>
    </div>
    </div>
  );
}

function TopicList({ plan, current, done, total, compact = false }: { plan: StudyItem[]; current: string; done: number; total: number; compact?: boolean }) {
  const { topic, learner, links } = useTopicState();
  return (
    <nav aria-label={`${topic.title} sub-topics`}>
      {!compact && (
        <div className="mb-4">
          <p className="display text-title text-ink">Sub-topics</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunk" aria-hidden>
            <span className="block h-full rounded-full bg-ok-bright" style={{ width: `${Math.round((done / total) * 100)}%` }} />
          </div>
          <p className="mt-1 text-label font-semibold text-ink-2">
            {done} of {total} done
          </p>
        </div>
      )}
      <ol className="space-y-1">
        {plan.map((i) => {
          const here = i.part === current;
          const finished = i.kind === "sub" && !!learner.lessons[i.lesson.id]?.completed;
          const label = i.kind === "sub" ? i.lesson.title : i.kind === "practice" ? `Practice stop ${i.number}` : "Topic test";
          const mark =
            i.kind === "sub" ? (
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-label font-extrabold ${
                  finished ? "bg-ok-bright text-white" : here ? "bg-brand text-on-brand" : "border-2 border-line-strong text-ink-2"
                }`}
              >
                {finished ? <CheckIcon size={14} strokeWidth={3} /> : i.number}
              </span>
            ) : (
              <span className={`grid size-7 shrink-0 place-items-center rounded-[8px] ${i.kind === "practice" ? FIELDS.green.bg : FIELDS.navy.bg} text-white`}>
                {i.kind === "practice" ? <ArrowRightIcon size={14} strokeWidth={3} /> : <CheckIcon size={14} strokeWidth={3} />}
              </span>
            );
          return (
            <li key={i.part}>
              {i.kind === "sub" && i.partTitle && <p className="mb-1 mt-4 px-2.5 text-label font-extrabold uppercase tracking-wide text-ink-2 first:mt-0">{i.partTitle}</p>}
              <Link
                href={links.study(i.part)}
                aria-current={here ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-[14px] px-2.5 py-1.5 leading-snug transition-colors ${
                  here ? "bg-brand-soft font-extrabold text-ink" : i.kind === "sub" ? "font-semibold text-ink hover:bg-sunk" : "font-bold text-ink-2 hover:bg-sunk"
                }`}
              >
                {mark}
                <span className="min-w-0 flex-1">
                  {label}
                  {finished && <span className="sr-only"> (done)</span>}
                  {i.kind === "sub" && deepFor(topic.id, i.lesson.id) && <span className="mt-0.5 block text-label font-extrabold text-field-navy">11+ and GCSE</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Where the concept has a film (D-041), the script it was made from. */
function filmFor(topicId: string, skill: string | null) {
  const concept = JOURNEYS.find((j) => j.topicId === topicId && j.skill === skill)?.concept;
  return concept ? EXPLAIN_SCRIPTS.find((s) => s.topicId === topicId && s.concept === concept) : undefined;
}

function nextAfter(plan: StudyItem[], part: string) {
  return plan[plan.findIndex((i) => i.part === part) + 1];
}
const itemTitle = (i: StudyItem) => (i.kind === "sub" ? i.lesson.title : i.kind === "practice" ? `Practice stop ${i.number}` : "the topic test");

function SubTopic({ item, plan }: { item: Extract<StudyItem, { kind: "sub" }>; plan: StudyItem[] }) {
  const { topic, learner, update, links } = useTopicState();
  const lesson: Lesson = item.lesson;
  const deep = deepFor(topic.id, lesson.id);
  const pages = deep ? DEEP_PAGES.map((label) => ({ label, step: null })) : studyPages(lesson);
  const saved = learner.lessons[lesson.id];
  const [page, setPage] = useState(() => (deep || saved?.completed ? 0 : Math.min(saved?.step ?? 0, lesson.steps.length - 1)));
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const subs = plan.filter((i) => i.kind === "sub").length;
  const next = nextAfter(plan, item.part);
  const film = filmFor(topic.id, item.skill);
  const used = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  const { Visual, LabStep } = topic.ui;

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [page]);

  const go = (p: number) => {
    moved.current = true;
    setPage(p);
    if (!deep && p < lesson.steps.length) update((s) => goToStep(s, lesson.id, p));
    window.scrollTo({ top: 0 });
  };
  const finish = () => update((s) => completeLesson(s, lesson.id, Date.now()));
  const onAnswered = (r: ResultDraft) => {
    update((s) => recordResult(s, { ...r, at: Date.now() }));
    go(page + 1);
  };

  const p = pages[page];
  const step = deep || p.step === null ? null : lesson.steps[p.step];
  const lastPage = page === pages.length - 1;
  const tips = lesson.steps.flatMap((s) => (s.type === "explain" && s.tip ? [s.tip] : []));

  return (
    <article aria-labelledby="sub-title" className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-label font-bold text-ink-2">
            Sub-topic {item.number} of {subs} · about {deep ? lesson.minutes + 10 : lesson.minutes} minutes
          </p>
          {deep && (
            <span className="flex gap-1.5">
              <LevelChip level="Core" />
              <LevelChip level="11+" />
              <LevelChip level="GCSE" />
            </span>
          )}
        </div>
        <h1 id="sub-title" className="display text-heading-1 sm:text-display-2">
          {lesson.title}
        </h1>
        <p className="max-w-2xl text-body-lg text-ink-2">{lesson.summary}</p>
        <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-2 sm:mx-0 sm:px-0" aria-label={`Page ${page + 1} of ${pages.length}`}>
          {pages.map((pg, i) => (
            <li key={i} className="min-w-[6.5rem] flex-1">
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === page ? "step" : undefined}
                className="group flex min-h-11 w-full flex-col items-start gap-2 text-left"
              >
                <span className={`h-1.5 w-full rounded-full transition-colors ${i === page ? "bg-ink" : i < page ? "bg-ok-bright" : "bg-line group-hover:bg-line-strong"}`} />
                <span className={`whitespace-nowrap text-label font-bold ${i === page ? "text-ink" : "text-ink-2"}`}>
                  <span className="tabular-nums">{i + 1}</span>. {pg.label}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </header>

      {deep ? (
        <section aria-labelledby="page-title" className="space-y-5">
          <h2 id="page-title" ref={heading} tabIndex={-1} className="text-heading-2 font-extrabold leading-tight text-ink outline-none">
            {p.label}
          </h2>
          <DeepPage deep={deep} page={page} onDone={() => go(page + 1)} />
        </section>
      ) : (
      <section aria-labelledby="page-title" className="panel space-y-6 rounded-[28px] p-5 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 id="page-title" ref={heading} tabIndex={-1} className="text-heading-2 font-extrabold leading-tight text-ink outline-none">
            <RichText text={step ? step.title : "What to remember"} />
          </h2>
          {step?.type === "explain" && <ReadAloud text={[step.title, ...step.body, step.tip ?? ""].join(". ")} size="lg" label="Read this to me" />}
        </div>

        {step?.type === "explain" && (
          <>
            <div className="max-w-2xl space-y-4 text-xl leading-relaxed text-ink">
              {step.body.map((t) => (
                <p key={t}>
                  <RichText text={t} />
                </p>
              ))}
            </div>
            {step.visual !== undefined && (
              <div className="flex justify-center rounded-[22px] border border-line bg-raised px-3 py-6 sm:px-6 sm:py-8">
                <Visual spec={step.visual} />
              </div>
            )}
            {step.tip && (
              <aside aria-label="Key idea" className="overflow-hidden rounded-[20px] border-2 border-field-yellow">
                <p className={`px-5 py-2 text-label font-extrabold uppercase tracking-wide ${FIELDS.yellow.bg} ${FIELDS.yellow.text}`}>Key idea</p>
                <p className="px-5 py-4 text-lg font-semibold text-ink">
                  <RichText text={step.tip} />
                </p>
              </aside>
            )}
          </>
        )}

        {step?.type === "worked" && <WorkedExample key={page} step={step} onComplete={() => {}} />}

        {step?.type === "lab" && (
          <>
            <div className="max-w-2xl space-y-3 text-xl leading-relaxed text-ink">
              {step.body.map((t) => (
                <p key={t}>
                  <RichText text={t} />
                </p>
              ))}
            </div>
            {LabStep && <LabStep step={step} completed={learner.labChallenges} onChallengeComplete={(id) => updateTopic(topic.id, (s) => completeLabChallenge(s, id))} />}
          </>
        )}

        {step?.type === "check" && (
          <>
            {step.intro && <p className="text-lg text-ink-2">{step.intro}</p>}
            <QuestionPlayer
              key={`${lesson.id}-${page}`}
              question={topic.questionById(step.questionId)}
              context="lesson"
              usedFollowUps={used}
              orderKey={`lesson:${lesson.id}`}
              onComplete={onAnswered}
              onFollowUpResult={(r) => update((s) => recordResult(s, { ...r, at: Date.now() }))}
              continueLabel="Next page"
            />
          </>
        )}

        {step === null && (
          <div className="space-y-5">
            <ul className="space-y-3">
              {lesson.objectives.map((o) => (
                <li key={o} className="flex items-start gap-3 text-xl text-ink">
                  <CheckIcon size={22} strokeWidth={3} className="mt-1 shrink-0 text-ok" />
                  {o}
                </li>
              ))}
            </ul>
            {tips.map((t) => (
              <p key={t} className="rounded-[18px] border-l-[6px] border-field-yellow bg-raised px-5 py-4 text-lg font-semibold text-ink">
                <RichText text={t} />
              </p>
            ))}
          </div>
        )}
      </section>
      )}

      <nav aria-label="Pages" className="flex items-center justify-between gap-3">
        <Button variant="secondary" size="lg" onClick={() => go(page - 1)} disabled={page === 0}>
          <ArrowLeftIcon size={18} /> Previous
        </Button>
        {!lastPage ? (
          <Button variant="cta" size="lg" onClick={() => go(page + 1)}>
            {step?.type === "check" || (deep && page === 4) ? "Skip for now" : "Next page"} <ArrowRightIcon size={18} />
          </Button>
        ) : (
          next && (
            <ButtonLink href={links.study(next.part)} variant="cta" size="lg" onClick={finish}>
              Next: {itemTitle(next)} <ArrowRightIcon size={18} />
            </ButtonLink>
          )
        )}
      </nav>

      {film && (
        <section aria-labelledby="film-title" className="space-y-3 border-t border-line pt-8">
          <h2 id="film-title" className="text-heading-2 font-extrabold text-ink">
            Prefer to watch?
          </h2>
          <p className="text-lg text-ink-2">Emma explains the same idea in a short film, with captions.</p>
          <div className="panel rounded-[28px] p-4 sm:p-6">
            <FilmPlayer concept={film.concept} film={film.film} title={film.title} />
          </div>
        </section>
      )}
    </article>
  );
}

function PracticeStop({ item, plan }: { item: Extract<StudyItem, { kind: "practice" }>; plan: StudyItem[] }) {
  const { topic, learner, links } = useTopicState();
  const next = nextAfter(plan, item.part);
  const rows = item.skills.map((id) => ({ skill: topic.skillById(id), m: skillMastery(id, learner.results) }));
  const weakest = rows.find((r) => r.m.status === "not-started" || r.m.status === "developing" || r.m.status === "needs-review") ?? rows[0];
  const word: Record<string, string> = {
    "not-started": "Not practised yet",
    developing: "Getting there",
    secure: "Strong",
    "passed-check": "Strong",
    mastered: "Mastered",
    "needs-review": "Look at again",
  };
  return (
    <article aria-labelledby="stop-title" className="space-y-6">
      <header className={`rounded-[28px] px-6 py-7 sm:px-8 ${FIELDS.green.bg} ${FIELDS.green.text}`}>
        <p className="text-label font-extrabold uppercase tracking-wide">Practice stop {item.number}</p>
        <h1 id="stop-title" className="display mt-1 text-heading-1">
          Practise what you have just learned
        </h1>
        <p className="mt-2 max-w-2xl text-lg">
          A short set of questions on the last {item.lessons.length} sub-topics. Hints are there if you need them, and a mistake brings a question to help.
        </p>
      </header>
      <section aria-labelledby="stop-skills" className="panel rounded-[28px] p-5 sm:p-8">
        <h2 id="stop-skills" className="text-title font-extrabold text-ink">
          This stop covers
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {rows.map(({ skill, m }) => (
            <li key={skill.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="text-lg font-bold text-ink">{skill.title}</span>
              <span className="flex items-center gap-3">
                <span className="text-label font-bold text-ink-2">{word[m.status]}</span>
                <Link href={links.practice(skill.id)} className="text-label font-bold text-brand-strong underline underline-offset-4">
                  Practise this
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={links.practice(weakest.skill.id)} variant="cta" size="lg">
          Start practice <ArrowRightIcon size={18} />
        </ButtonLink>
        {next && (
          <Link href={links.study(next.part)} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-brand-strong underline underline-offset-4">
            Carry on to {itemTitle(next)} <ArrowRightIcon size={18} />
          </Link>
        )}
      </div>
    </article>
  );
}

function TopicTest({ subs }: { subs: Extract<StudyItem, { kind: "sub" }>[] }) {
  const { topic } = useTopicState();
  const levels = [
    { name: "Know", line: "Recognise and recall the facts and words." },
    { name: "Do", line: "Carry out the method accurately." },
    { name: "Apply", line: "Use it in a problem from real life." },
    { name: "Explain", line: "Spot a mistake and say which reasoning is right." },
  ];
  return (
    <article aria-labelledby="test-title" className="space-y-6">
      <header className={`rounded-[28px] px-6 py-7 sm:px-8 ${FIELDS.navy.bg} ${FIELDS.navy.text}`}>
        <p className="text-label font-extrabold uppercase tracking-wide">Topic test</p>
        <h1 id="test-title" className="display mt-1 text-heading-1">
          How deeply do you understand {topic.title}?
        </h1>
        <p className="mt-2 max-w-2xl text-lg">
          About {subs.length * 2} questions, at least two on every sub-topic, asked in different ways. No hints, one question at a time, and you can go back
          before you finish.
        </p>
      </header>
      <section aria-labelledby="test-levels" className="panel rounded-[28px] p-5 sm:p-8">
        <h2 id="test-levels" className="text-title font-extrabold text-ink">
          Four kinds of question
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {levels.map((l, i) => (
            <li key={l.name} className="rounded-[18px] border border-line p-4">
              <span className="text-label font-extrabold text-ink-2">{i + 1}</span>
              <span className="block text-lg font-extrabold text-ink">{l.name}</span>
              <span className="block text-body text-ink-2">{l.line}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-body text-ink-2">
          After each answer you say how sure you are. At the end you see each sub-topic as secure, getting there or to look at again, and any mistake in thinking
          the test found, with a link back to the page that explains it.
        </p>
      </section>
      <p className="rounded-[18px] bg-sunk px-5 py-4 text-body font-semibold text-ink-2">The test itself is the next part of this pilot.</p>
    </article>
  );
}
