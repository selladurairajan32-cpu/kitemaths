"use client";

import { FactGrid, FACT_STATUS } from "@/components/facts/FactGrid";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { FACT_SECURE_STREAK, factPrompt, factReport, factStates, planSession, TABLE_ORDER, tableSummary } from "@/engine/facts";
import { useHydrated, useLearner, useNow } from "@/lib/store";

/**
 * TT-011: the grown-up times-table report. Per fact: untimed accuracy, recent consistency, division and missing-number
 * answers, and timed answers in their own column. Timed results never decide whether a fact is known, and nothing is
 * compared with other children.
 */
export function FactReportScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;
  const states = factStates(learner.results);
  const rows = factReport(learner.results).filter((r) => r.attempts + r.timedAttempts + r.slips > 0);
  const count = (s: keyof typeof FACT_STATUS) => states.filter((x) => x.status === s).length;
  const nextUp = planSession(learner.results, now, 10, { seed: "report" });
  const name = learner.profile.name.trim();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted">Times-table facts</p>
        <h1 className="display text-heading-2 sm:text-heading-1">{name ? `${name}'s times tables` : "Times tables, fact by fact"}</h1>
        <p className="mt-1 max-w-3xl text-ink-2">
          {count("known")} of {states.length} facts known, {count("developing")} growing, {count("not-yet")} not yet secure and {count("unseen")} not tried. A fact is
          known after {FACT_SECURE_STREAK} untimed answers in a row that are right first time without a hint. 7 × 8, 8 × 7 and their division facts count as
          one fact.
        </p>
      </header>

      <section className="card space-y-4 p-5 sm:p-7" aria-labelledby="grid-title">
        <h2 id="grid-title" className="text-title font-extrabold">
          Every fact
        </h2>
        <FactGrid states={states} caption="Each times-table fact and its status" />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card min-w-0 p-5 sm:p-7" aria-labelledby="tables-title">
          <h2 id="tables-title" className="text-title font-extrabold">
            By table
          </h2>
          <table className="mt-3 w-full text-label tabular-nums">
            <caption className="sr-only">Known, growing, not yet and not tried facts in each table</caption>
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th scope="col" className="py-2 pr-2 font-medium">Table</th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">Known</th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">Growing</th>
                <th scope="col" className="py-2 pr-2 text-right font-medium">Not yet</th>
                <th scope="col" className="py-2 text-right font-medium">Not tried</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ORDER.map((t) => {
                const s = tableSummary(states, t);
                return (
                  <tr key={t} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1.5 pr-2 text-left font-medium">{t}s</th>
                    <td className="py-1.5 pr-2 text-right">{s.known}</td>
                    <td className="py-1.5 pr-2 text-right">{s.developing}</td>
                    <td className="py-1.5 pr-2 text-right">{s["not-yet"]}</td>
                    <td className="py-1.5 text-right">{s.unseen}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="card min-w-0 p-5 sm:p-7" aria-labelledby="next-title">
          <h2 id="next-title" className="text-title font-extrabold">
            Recommended practice
          </h2>
          <p className="mt-1 text-label text-muted">The facts the next practice session would ask, weakest first, with a known fact revisited now and then.</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-body font-bold tabular-nums">
            {nextUp.map((f, i) => (
              <li key={i} className="rounded-[12px] bg-sunk px-3 py-1.5">
                {factPrompt(f)}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-5 sm:p-7" aria-labelledby="detail-title">
        <h2 id="detail-title" className="text-title font-extrabold">
          Fact by fact
        </h2>
        <p className="mt-1 text-label text-muted">
          Untimed answers show understanding and recall. Timed answers, from the timed practice, are shown separately and never decide whether a fact is known. Typing
          slips (the right digits mixed up) are counted apart and not treated as a gap.
        </p>
        {rows.length === 0 ? (
          <p className="mt-4 text-body text-ink-2">No facts practised yet. The table fills in as facts are answered.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-label tabular-nums">
              <caption className="sr-only">Per-fact accuracy, recent answers, division answers and timed answers</caption>
              <thead>
                <tr className="border-b border-line text-left text-muted">
                  <th scope="col" className="py-2 pr-3 font-medium">Fact</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Status</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Untimed right</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Last {FACT_SECURE_STREAK}</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Division right</th>
                  <th scope="col" className="py-2 pr-3 text-right font-medium">Timed right</th>
                  <th scope="col" className="py-2 text-right font-medium">Slips</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1.5 pr-3 text-left font-medium">
                      {r.a} × {r.b} = {r.a * r.b}
                    </th>
                    <td className="py-1.5 pr-3">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${FACT_STATUS[r.status].chip}`}>{FACT_STATUS[r.status].label}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-right">{r.attempts ? `${r.correct} / ${r.attempts}` : "—"}</td>
                    <td className="py-1.5 pr-3">
                      {r.recent.length ? (
                        <span aria-label={r.recent.map((x) => (x ? "recalled" : "missed")).join(", ")}>
                          <span aria-hidden>{r.recent.map((x) => (x ? "✓" : "✗")).join(" ")}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-1.5 pr-3 text-right">{r.inverseAttempts ? `${r.inverseCorrect} / ${r.inverseAttempts}` : "—"}</td>
                    <td className="py-1.5 pr-3 text-right">{r.timedAttempts ? `${r.timedCorrect} / ${r.timedAttempts}` : "—"}</td>
                    <td className="py-1.5 text-right">{r.slips || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
