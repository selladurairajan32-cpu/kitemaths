import { CheckIcon } from "@/components/ui/Icons";
import { FACT_MAX, FACT_MIN, factKey, type FactState, type FactStatus } from "@/engine/facts";

/** Child-facing status words and treatments. Each status differs by colour, mark and border, never colour alone (UX-004 §1). */
export const FACT_STATUS: Record<FactStatus, { label: string; cell: string; chip: string }> = {
  known: { label: "Known", cell: "bg-success-soft text-success-ink border-2 border-success-edge", chip: "bg-success-soft text-success-ink" },
  developing: { label: "Growing", cell: "bg-sun-soft text-ink border-2 border-sun-strong", chip: "bg-sun-soft text-warn" },
  "not-yet": { label: "Not yet", cell: "bg-retry-soft text-retry-ink border-2 border-dashed border-retry-edge", chip: "bg-retry-soft text-retry-ink" },
  unseen: { label: "New", cell: "bg-surface text-muted border border-line", chip: "bg-sunk text-muted" },
};

const NUMS = Array.from({ length: FACT_MAX - FACT_MIN + 1 }, (_, i) => FACT_MIN + i);

/** TT-004 AC2: every fact 2 × 2 to 12 × 12, coloured by what the child knows. Rows are tables, columns multipliers. */
export function FactGrid({ states, caption }: { states: FactState[]; caption: string }) {
  const byKey = new Map(states.map((s) => [s.key, s]));
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="mx-auto border-separate border-spacing-1 text-label tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="size-9 text-muted">
                <span aria-hidden>×</span>
                <span className="sr-only">Times</span>
              </th>
              {NUMS.map((n) => (
                <th key={n} scope="col" className="size-9 font-bold text-ink-2">
                  {n}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NUMS.map((a) => (
              <tr key={a}>
                <th scope="row" className="size-9 font-bold text-ink-2">
                  {a}
                </th>
                {NUMS.map((b) => {
                  const s = byKey.get(factKey(a, b))!;
                  const t = FACT_STATUS[s.status];
                  return (
                    <td key={b} className={`relative size-9 min-w-9 rounded-[10px] text-center font-semibold ${t.cell}`} aria-label={`${a} × ${b} = ${a * b}: ${t.label}`}>
                      <span aria-hidden>{a * b}</span>
                      {s.status === "known" && (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-ok-bright text-white" aria-hidden>
                          <CheckIcon size={10} strokeWidth={3} />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="flex flex-wrap justify-center gap-2" aria-label="Key">
        {(["known", "developing", "not-yet", "unseen"] as FactStatus[]).map((k) => (
          <li key={k} className={`inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-label font-bold ${FACT_STATUS[k].chip}`}>
            <span className={`inline-block size-4 rounded-[5px] ${FACT_STATUS[k].cell}`} aria-hidden />
            {FACT_STATUS[k].label}
          </li>
        ))}
      </ul>
    </div>
  );
}
