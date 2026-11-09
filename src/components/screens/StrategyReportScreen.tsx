"use client";

import { ScreenSkeleton } from "@/components/ui/Screen";
import { compareWithLast, recommendStrategySkills, strategyMeasures, timedRuns } from "@/engine/strategyStats";
import { useHydrated, useLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { MM_SKILLS } from "@/topics/mental-maths";

const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)}%`);
const secs = (ms: number | null) => (ms === null ? "—" : `${(ms / 1000).toFixed(1)} s`);

/**
 * MM-012: mental-strategy analytics for grown-ups. Accuracy, method choice, independence, hints and time are separate
 * columns, never one score; a faster timed run never hides lower accuracy; the weakest skills drive the recommendations.
 */
export function StrategyReportScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const topic = topicById("mental-maths")!;
  const title = (id: string) => topic.skills.find((s) => s.id === id)?.title ?? id;
  const measures = strategyMeasures(learner.results, Object.values(MM_SKILLS));
  const recommend = recommendStrategySkills(measures);
  const runs = timedRuns(learner.results, "mental-maths");
  const cmp = compareWithLast(runs);
  const any = measures.some((m) => m.answered + m.choices > 0);
  const name = learner.profile.name.trim();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted">Mental maths</p>
        <h1 className="display text-heading-2 sm:text-heading-1">{name ? `${name}'s mental strategies` : "Mental strategies"}</h1>
        <p className="mt-1 max-w-3xl text-ink-2">
          Five separate measures for each skill. They are never added into one score, because a child can be accurate but slow, or quick but careless, and
          each needs different help.
        </p>
      </header>

      {cmp?.message === "more-but-less-accurate" && (
        <p role="status" className="rounded-[20px] border-2 border-retry-edge bg-retry-soft px-4 py-3 text-body text-retry-ink">
          In the latest one-minute challenge more questions were answered, but a smaller share were right ({cmp.last.correct} of {cmp.last.answered}, against{" "}
          {cmp.previous!.correct} of {cmp.previous!.answered} before). Accuracy has dropped, so speed is not an improvement here.
        </p>
      )}

      <section className="card p-5 sm:p-7" aria-labelledby="measures-title">
        <h2 id="measures-title" className="text-title font-extrabold">
          Skill by skill
        </h2>
        {!any ? (
          <p className="mt-3 text-body text-ink-2">No mental-maths answers yet. This fills in as the island and the methods lab are used.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-label tabular-nums">
              <caption className="sr-only">Accuracy, method choice, independence, hints and time for each mental-maths skill</caption>
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Skill</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Accuracy</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Method choice</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Independence</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Hints used</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Time, untimed</th>
                  <th scope="col" className="py-2 text-right font-medium">Time, timed</th>
                </tr>
              </thead>
              <tbody>
                {measures.map((m) => (
                  <tr key={m.skill} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1.5 pr-3 text-left font-medium">{title(m.skill)}</th>
                    <td className="py-1.5 pr-3 text-right">{m.answered ? `${pct(m.accuracy)} of ${m.answered}` : "—"}</td>
                    <td className="py-1.5 pr-3 text-right">{m.choices ? `${pct(m.methodChoice)} of ${m.choices}` : "—"}</td>
                    <td className="py-1.5 pr-3 text-right">{pct(m.independence)}</td>
                    <td className="py-1.5 pr-3 text-right">{m.answered ? m.hintsUsed : "—"}</td>
                    <td className="py-1.5 pr-3 text-right">{secs(m.medianMs)}</td>
                    <td className="py-1.5 text-right">{secs(m.timedMedianMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <dl className="mt-4 grid gap-2 text-label text-muted sm:grid-cols-2">
          <div><dt className="inline font-semibold text-ink-2">Accuracy:</dt> <dd className="inline">untimed answers right.</dd></div>
          <div><dt className="inline font-semibold text-ink-2">Method choice:</dt> <dd className="inline">a method that works was picked, in the methods lab.</dd></div>
          <div><dt className="inline font-semibold text-ink-2">Independence:</dt> <dd className="inline">right first time, with no hint.</dd></div>
          <div><dt className="inline font-semibold text-ink-2">Time:</dt> <dd className="inline">the middle (median) time per answer, untimed and timed kept apart.</dd></div>
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5 sm:p-7" aria-labelledby="rec-title">
          <h2 id="rec-title" className="text-title font-extrabold">
            What to practise next
          </h2>
          <p className="mt-1 text-label text-muted">Weakest first, by accuracy or method choice, then skills not tried yet.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-body">
            {recommend.map((id) => (
              <li key={id}>{title(id)}</li>
            ))}
          </ol>
        </section>
        <section className="card p-5 sm:p-7" aria-labelledby="runs-title">
          <h2 id="runs-title" className="text-title font-extrabold">
            One-minute challenges
          </h2>
          <p className="mt-1 text-label text-muted">Each run against the child&apos;s own previous runs only. Accuracy is listed first.</p>
          {runs.length === 0 ? (
            <p className="mt-3 text-body text-ink-2">None yet. The challenge opens after enough accurate untimed practice.</p>
          ) : (
            <ul className="mt-3 space-y-1 text-body tabular-nums">
              {runs.slice(-5).map((r) => (
                <li key={r.session}>
                  {Math.round(r.accuracy * 100)}% right · {r.correct} of {r.answered} · {new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
