"use client";

import Link from "next/link";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { Pic } from "@/components/paper/Pic";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { lessonsEvidenced } from "@/engine/journey";
import { readyForRecheck, skillMastery } from "@/engine/mastery";
import { mockSessions } from "@/engine/overview";
import { topicLearner } from "@/engine/progress";
import { STARS } from "@/engine/rewards";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { activeTopic, startedTopics } from "@/topics/recommend";

const MOCK_TOPIC = "mock-exams";

/**
 * D-043 step 3: every test in one place. Each topic's big challenge (the mastery check), skills ready for a recheck,
 * and the practice mocks. The tests themselves are unchanged; this page only lists them with the child's results.
 */
export function TestsScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const here = activeTopic(learner).id;
  const topics = startedTopics(learner).filter((t) => t.id !== MOCK_TOPIC && t.assessmentQuestions.length > 0);
  const mocks = mockSessions(learner.results);
  const lastMock = mocks[mocks.length - 1];
  const mockTopic = topicById(MOCK_TOPIC);
  const rechecks = topics.flatMap((t) =>
    t.skills
      .map((s) => ({ t, s, m: skillMastery(s.id, learner.results) }))
      .filter(({ m }) => m.status === "needs-review"),
  );

  return (
    <div className="space-y-10">
      <ScreenHero pic="trophy" titleId="tests-title" title="Tests" line="Show what you know. A big challenge checks a whole topic; a practice mock is like a real 11+ paper." />

      {rechecks.length > 0 && (
        <section aria-labelledby="recheck-title">
          <h2 id="recheck-title" className="display text-heading-2">
            Check again
          </h2>
          <p className="mt-1 text-body text-ink-2">A check showed these need another look. Practise first, then a short recheck updates the skill.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {rechecks.map(({ t, s, m }) => {
              const ready = readyForRecheck(m);
              const links = topicRoutes(t.id);
              return (
                <li key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                  <span className="min-w-0">
                    <span className="block font-extrabold text-ink">{s.title}</span>
                    <span className="block text-label font-semibold text-ink-2">{t.title}</span>
                  </span>
                  <ButtonLink href={ready ? links.recheck(s.id) : links.practice(s.id)} variant={ready ? "primary" : "secondary"}>
                    {ready ? "Recheck" : "Practise first"} <ArrowRightIcon size={18} />
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="challenges-title">
        <h2 id="challenges-title" className="display text-heading-2">
          Big challenges
        </h2>
        <p className="mt-1 text-body text-ink-2">One for each topic you have started. Best after the topic&apos;s lessons; +{STARS.check} stars each time.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((t) => {
            const tl = topicLearner(learner, t.id);
            const a = tl.assessment;
            const last = a.last ? Object.values(a.last.evaluations) : [];
            const right = last.filter((e) => e.correct).length;
            const done = lessonsEvidenced(t, tl);
            const status =
              a.status === "in-progress"
                ? "Started: your answers are saved"
                : a.last
                  ? `Last time: ${right} of ${last.length} right`
                  : done < t.lessons.length
                    ? `Best after all ${t.lessons.length} lessons (${done} done)`
                    : "Ready when you are";
            return (
              <li key={t.id} className="flex">
                <Link
                  href={topicRoutes(t.id).check()}
                  className={`card flex flex-1 items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${t.id === here ? "border-2 border-brand" : ""}`}
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-tile-yellow" aria-hidden>
                    <PaperIcon name={t.look.icon} size={38} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-extrabold leading-snug text-ink">{t.title}</span>
                    <span className={`mt-0.5 flex items-center gap-1 text-label font-bold ${a.last ? "text-ok" : "text-ink-2"}`}>
                      {a.last && <CheckIcon size={15} strokeWidth={3} />}
                      {status}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href={routes.topics()} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
          Start another topic <ArrowRightIcon size={18} />
        </Link>
      </section>

      {mockTopic && (
        <section aria-labelledby="mock-title" className="rounded-[32px] bg-tile-sky px-5 py-7 sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-[24px] bg-surface shadow-[var(--shadow-card)]" aria-hidden>
              <Pic name="exam" size={56} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="mock-title" className="display text-heading-2">
                Practice mocks
              </h2>
              <p className="mt-1 text-body text-ink-2">
                {lastMock
                  ? `You have done ${mocks.length} ${mocks.length === 1 ? "mock" : "mocks"}. Last time: ${lastMock.correct} of ${lastMock.total} right.`
                  : "A timed paper with questions from every area, set up like the 11+ test you choose. For practice only: it doesn't predict a result."}
              </p>
            </div>
            <ButtonLink href={topicRoutes(MOCK_TOPIC).mock()} size="lg">
              {lastMock ? "Another mock" : "Try a mock"} <ArrowRightIcon size={20} />
            </ButtonLink>
          </div>
        </section>
      )}
    </div>
  );
}
