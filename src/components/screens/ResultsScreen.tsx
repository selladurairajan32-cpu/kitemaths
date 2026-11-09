"use client";

import Link from "next/link";
import { RichText } from "@/components/math/RichText";
import { buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, FlagIcon, StarIcon } from "@/components/ui/Icons";
import { EvidenceMeter, ProgressBar, ProgressRing, StatusBadge } from "@/components/ui/Progress";
import { RecommendationLink, recommendationVerb } from "@/components/ui/RecommendationLink";
import { learningStats, recommendNext, topicResults } from "@/engine/journey";
import { MASTERY_MIN_INDEPENDENT, SECURE_MIN_EVIDENCE, misconceptionReports, skillMastery, type SkillMastery } from "@/engine/mastery";
import { useHydrated } from "@/lib/store";
import { useTopic, useTopicState } from "@/topics/context";
import type { AnswerResponse as Response } from "@/topics/types";
import { ScreenSkeleton } from "@/components/ui/Screen";

function SkillActions({ m }: { m: SkillMastery }) {
  const { topic, links: routes } = useTopicState();
  const skill = topic.skillById(m.skill);
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      <Link href={routes.practice(m.skill)} className="inline-flex min-h-11 items-center text-label font-medium text-den hover:underline">
        Practise<span className="sr-only"> {skill.title}</span>
      </Link>
      {(m.status === "needs-review" || m.status === "passed-check") && (
        <Link href={routes.recheck(m.skill)} className="inline-flex min-h-11 items-center text-label font-medium text-den hover:underline">
          Recheck<span className="sr-only"> {skill.title}</span>
        </Link>
      )}
    </span>
  );
}

function independentText(m: SkillMastery) {
  if (!m.assessed) return "Not checked yet";
  return `${m.assessed.correct}/${m.assessed.total} in ${m.assessed.context === "recheck" ? "recheck" : "mastery check"}`;
}

export function ResultsScreen() {
  const hydrated = useHydrated();
  const topic = useTopic();
  const { learner, links } = useTopicState();
  const routes = { ...links, assessment: links.check };
  const { skillById, lessonById, misconceptionById } = topic;
  const { areas: ASSESSMENT_AREAS, item: assessmentItem } = topic.assessment;
  const { Input: QuestionInput, answerText, responseText } = topic.questions;
  if (!hydrated) return <ScreenSkeleton />;

  const mastery = topic.skills.map((s) => skillMastery(s.id, learner.results));
  const reports = misconceptionReports(topicResults(topic, learner.results), topic.misconceptions);
  const rec = recommendNext(topic, learner);
  const stats = learningStats(topic, learner);
  const a = learner.assessment;
  const last = a.last;

  if (learner.results.length === 0) {
    return (
      <section className="card mx-auto max-w-2xl p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-[20px] bg-sunk">
          <StarIcon size={24} />
        </span>
        <h1 className="display mt-5 text-heading-2 sm:text-heading-1">Nothing to report yet</h1>
        <p className="mx-auto mt-2 max-w-md text-ink-2">
          This report fills in once {topic.title} lesson or practice questions are answered. It shows the evidence behind each skill label, any
          misunderstandings spotted, and a question-by-question review of the mastery check.
        </p>
        <RecommendationLink rec={rec} className="mt-6">
          {recommendationVerb(rec)} <ArrowRightIcon size={18} />
        </RecommendationLink>
      </section>
    );
  }

  const strengths = mastery.filter((m) => m.status === "mastered" || m.status === "passed-check" || m.status === "secure");
  const toImprove = mastery.filter((m) => m.status === "needs-review" || m.status === "developing" || (m.status === "passed-check" && !m.learningSecure));
  const lastItems = last ? last.order.map((id) => ({ q: assessmentItem(id)!, ev: last.evaluations[id], response: last.responses[id] as Response | undefined })) : [];
  const score = lastItems.filter((x) => x.ev?.correct).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-label font-bold text-muted">{topic.title}</p>
          <h1 className="display text-heading-2 sm:text-heading-1">Full report</h1>
          <p className="mt-1 text-ink-2">
            The evidence behind every label: based on {stats.learningAnswered} lesson & practice answers{last ? " and the latest independent check" : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {a.status === "in-progress" ? (
            <Link href={routes.assessment()} className={buttonClass("primary", "lg")}>
              Resume mastery check
            </Link>
          ) : (
            <RecommendationLink rec={rec}>
              {recommendationVerb(rec)} <ArrowRightIcon size={18} />
            </RecommendationLink>
          )}
        </div>
      </header>

      {last ? (
        <section className="card grid gap-6 p-5 sm:p-7 md:grid-cols-[auto_minmax(0,1fr)]" aria-labelledby="score-title">
          <div className="flex items-center gap-5 md:flex-col md:items-start">
            <ProgressRing value={score / last.order.length} size={120} label="Mastery check score">
              <span className="text-center">
                <span className="block text-heading-1 font-extrabold tabular-nums">{score}</span>
                <span className="block text-label text-muted">of {last.order.length}</span>
              </span>
            </ProgressRing>
            <div className="space-y-2">
              <h2 id="score-title" className="text-title font-extrabold">
                Last mastery check
              </h2>
              {last.completedAt && (
                <p className="text-label text-muted">{new Date(last.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <a href="#review" className={buttonClass("secondary", "md")}>
                  Review answers
                </a>
                {a.status !== "in-progress" && (
                  <Link href={routes.assessment()} className={buttonClass("secondary", "md")}>
                    Retake check
                  </Link>
                )}
              </div>
            </div>
          </div>
          <ul className="grid content-center gap-3">
            {ASSESSMENT_AREAS.map((area) => {
              const rs = lastItems.filter((x) => x.q.area === area);
              const right = rs.filter((x) => x.ev?.correct).length;
              return (
                <li key={area}>
                  <div className="mb-1 flex justify-between text-label">
                    <span>{area}</span>
                    <span className="tabular-nums text-muted">
                      {right} / {rs.length}
                    </span>
                  </div>
                  <ProgressBar value={rs.length ? right / rs.length : 0} label={`${area}: ${right} of ${rs.length}`} tone={right === rs.length ? "ok" : "num"} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <FlagIcon size={22} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">{a.status === "in-progress" ? "Mastery check in progress" : "No mastery check yet"}</p>
              <p className="text-label text-ink-2">Skills can become “secure in practice” through practice. “Mastered” also needs the independent mastery check.</p>
            </div>
          </div>
          <Link href={routes.assessment()} className={buttonClass("secondary", "md", "shrink-0")}>
            {a.status === "in-progress" ? "Resume check" : "About the mastery check"}
          </Link>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-7" aria-labelledby="strengths-title">
          <h2 id="strengths-title" className="flex items-center gap-2 text-title font-extrabold">
            <span className="grid size-7 place-items-center rounded-full bg-ok-soft text-ok">
              <CheckIcon size={15} />
            </span>
            Strengths
          </h2>
          {strengths.length ? (
            <ul className="mt-4 space-y-3">
              {strengths.map((m) => (
                <li key={m.skill} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{skillById(m.skill).title}</p>
                    <p className="text-label text-muted">{independentText(m)} · {m.evidence} learning answers</p>
                  </div>
                  <StatusBadge status={m.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-label text-ink-2">Keep going — strengths appear once a skill has several strong answers.</p>
          )}
        </section>

        <section className="card p-5 sm:p-7" aria-labelledby="next-title">
          <h2 id="next-title" className="flex items-center gap-2 text-title font-extrabold">
            <span className="grid size-7 place-items-center rounded-full bg-den-soft text-den">
              <ArrowRightIcon size={15} />
            </span>
            Next steps
          </h2>
          {toImprove.length === 0 ? (
            <p className="mt-3 text-label text-ink-2">Everything you&apos;ve worked on looks strong. Keep practising now and then so it stays that way.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {toImprove.slice(0, 4).map((m) => {
                const skill = skillById(m.skill);
                const lesson = lessonById(skill.lessonId);
                return (
                  <li key={m.skill} className="rounded-[16px] bg-paper p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{skill.title}</p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="mt-1 text-label text-ink-2">
                      {m.status === "needs-review"
                        ? "The latest independent check showed this needs another look: revisit the lesson, practise, then take a short recheck."
                        : m.status === "passed-check"
                          ? `Right in the check, but practice evidence isn't secure yet (${m.recentCount} of ${SECURE_MIN_EVIDENCE}+ recent answers).`
                          : `More practice needed — ${m.recentCount} recent answer${m.recentCount === 1 ? "" : "s"} so far.`}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4">
                      {lesson && (
                        <Link href={routes.lesson(lesson.id, 0)} className="inline-flex min-h-11 items-center text-label font-medium text-den hover:underline">
                          Revisit “{lesson.title}”
                        </Link>
                      )}
                      <SkillActions m={m} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-7" aria-labelledby="skills-title">
        <h2 id="skills-title" className="text-title font-extrabold">
          Skill by skill
        </h2>
        <details className="mt-2 text-label text-ink-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-den">How we decide each label</summary>
          <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5">
            <li>
              <strong>Secure in practice:</strong> at least {SECURE_MIN_EVIDENCE} recent lesson or practice answers averaging 75%+ (right first time counts
              fully, right with help counts half).
            </li>
            <li>
              <strong>Passed check:</strong> every item for this skill in the latest independent check was right, but there isn&apos;t yet enough evidence to
              say mastered.
            </li>
            <li>
              <strong>Mastered:</strong> at least {MASTERY_MIN_INDEPENDENT} independent items, all right, <em>and</em> secure practice. This means
              &ldquo;mastered for now&rdquo; — a later recheck is the best way to confirm it lasts.
            </li>
            <li>
              <strong>Needs review:</strong> something in the latest independent check was wrong. Practice alone doesn&apos;t clear this; a later recheck can.
            </li>
            <li>
              Explaining is assessed with sentence frames and counterexamples you build — not free written explanations.
            </li>
          </ul>
        </details>
        <ul className="mt-4 divide-y divide-line md:hidden">
          {mastery.map((m) => (
            <li key={m.skill} className="space-y-2 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{skillById(m.skill).title}</span>
                <StatusBadge status={m.status} />
              </div>
              <EvidenceMeter count={m.recentCount} needed={SECURE_MIN_EVIDENCE} score={m.score} label={`${skillById(m.skill).title} practice`} />
              <p className="text-label text-muted">{independentText(m)}</p>
              <SkillActions m={m} />
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden md:block">
          <table className="w-full text-label">
            <caption className="sr-only">Status and evidence for each skill</caption>
            <thead>
              <tr className="border-b border-line text-left text-label text-muted">
                <th scope="col" className="py-2 pr-3 font-medium">Skill</th>
                <th scope="col" className="py-2 pr-3 font-medium">Status</th>
                <th scope="col" className="py-2 pr-3 font-medium">Practice evidence</th>
                <th scope="col" className="py-2 pr-3 font-medium">Independent check</th>
                <th scope="col" className="py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mastery.map((m) => (
                <tr key={m.skill} className="border-b border-line last:border-0">
                  <th scope="row" className="py-2 pr-3 text-left font-medium">
                    {skillById(m.skill).title}
                  </th>
                  <td className="py-2 pr-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-2 pr-3">
                    <EvidenceMeter count={m.recentCount} needed={SECURE_MIN_EVIDENCE} score={m.score} label={`${skillById(m.skill).title} practice`} />
                  </td>
                  <td className="py-2 pr-3 text-label">{independentText(m)}</td>
                  <td className="py-2 text-right">
                    <SkillActions m={m} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5 sm:p-7" aria-labelledby="misc-title">
        <h2 id="misc-title" className="text-title font-extrabold">
          Ideas to watch
        </h2>
        <p className="mt-1 text-label text-muted">
          We only call something a “likely pattern” after seeing it more than once, and we mark it resolved once later work shows the idea is understood.
        </p>
        {reports.length === 0 ? (
          <p className="mt-4 rounded-[16px] bg-ok-soft px-4 py-3 text-label text-ok">No common misconceptions spotted so far.</p>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {reports.map((r) => {
              const def = misconceptionById(r.id)!;
              const stateStyle = { watching: "bg-warn-soft text-warn", improving: "bg-den-soft text-den-strong", resolved: "bg-ok-soft text-ok" }[r.state];
              return (
                <li key={r.id} className="rounded-[20px] border border-line p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-label font-medium ${stateStyle}`}>
                      {r.state === "watching" ? "Still working on it" : r.state === "improving" ? "Improving" : "Resolved"}
                    </span>
                    <span className="text-label text-muted">{r.confidence === "likely" ? `Likely pattern · seen ${r.timesSeen} times` : "Possible · seen once"}</span>
                  </div>
                  <p className="mt-2 font-medium">{def.name}</p>
                  <p className="mt-1 text-label text-ink-2">
                    <RichText text={def.description} />
                  </p>
                  {r.state !== "resolved" && (
                    <Link href={routes.practice(def.skills[0])} className="mt-1 inline-flex min-h-11 items-center text-label font-medium text-den hover:underline">
                      Practise {skillById(def.skills[0]).title.toLowerCase()} →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {last && (
        <section id="review" className="card scroll-mt-24 p-5 sm:p-7" aria-labelledby="review-title">
          <h2 id="review-title" className="text-title font-extrabold">
            Mastery check review
          </h2>
          <p className="mt-1 text-label text-muted">Each question is shown as you saw it, with your answer and the correct answer marked.</p>
          <ol className="mt-4 divide-y divide-line">
            {lastItems.map(({ q, ev, response }, i) => {
              const right = !!ev?.correct;
              return (
                <li key={q.id}>
                  <details className="group py-2">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg py-1">
                      <span className={`grid size-7 shrink-0 place-items-center rounded-full text-label font-bold text-white ${right ? "bg-ok" : "bg-num"}`} aria-hidden>
                        {right ? "✓" : "✗"}
                      </span>
                      <span className="flex-1 text-label">
                        <span className="text-muted">
                          Q{i + 1} · {q.area} ·{" "}
                        </span>
                        <RichText text={q.prompt} />
                        <span className="sr-only">{right ? " — correct" : response ? " — not yet correct" : " — not answered"}</span>
                      </span>
                      <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>
                        ›
                      </span>
                    </summary>
                    <div className="mt-2 space-y-4 rounded-[16px] bg-paper p-4 text-label sm:ml-10">
                      <div className="pointer-events-none">
                        <QuestionInput question={q} response={response ?? null} onChange={() => {}} locked reveal orderKey={`assess:${last.seed}`} />
                      </div>
                      <p>
                        <span className="text-muted">Your answer: </span>
                        <RichText text={responseText(q, response)} />
                      </p>
                      {!right && (
                        <p>
                          <span className="text-muted">Correct answer: </span>
                          <RichText text={answerText(q)} />
                        </p>
                      )}
                      {ev?.feedback && (
                        <p className="text-ink-2">
                          <RichText text={ev.feedback} />
                        </p>
                      )}
                      <p className="text-ink-2">
                        <RichText text={q.explanation} />
                      </p>
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Activity">
        <div className="card p-5">
          <p className="text-heading-2 font-extrabold tabular-nums">{stats.learningAnswered}</p>
          <p className="text-label text-muted">lesson & practice answers</p>
        </div>
        <div className="card p-5">
          <p className="text-heading-2 font-extrabold tabular-nums">{stats.firstTryRate === null ? "—" : `${Math.round(stats.firstTryRate * 100)}%`}</p>
          <p className="text-label text-muted">of those right first time</p>
        </div>
        <div className="card p-5">
          <p className="text-heading-2 font-extrabold tabular-nums">{stats.hintsUsed}</p>
          <p className="text-label text-muted">hints & guided explanations in those answers</p>
        </div>
      </section>
    </div>
  );
}
