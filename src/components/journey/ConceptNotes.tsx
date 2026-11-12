"use client";

import { RichText } from "@/components/math/RichText";
import { CheckIcon } from "@/components/ui/Icons";

/**
 * D-050: a concept's Notes (what the Notes button opens at any journey stage): its words with their meanings, and the
 * key takeaways. The same layout as the fractions pilot's notes, shared by the concepts added since.
 */
export function ConceptNotesView({ terms, takeaways }: { terms: [string, string][]; takeaways: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <dl className="m-0 grid gap-3">
        {terms.map(([t, d]) => (
          <div key={t} className="rounded-[20px] border border-line bg-surface p-4">
            <dt className="text-body font-extrabold text-ink">{t}</dt>
            <dd className="m-0 text-body text-ink-2">
              <RichText text={d} />
            </dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="takeaway-title" className="flex flex-col gap-2 rounded-[20px] bg-ok-soft p-4">
        <h3 id="takeaway-title" className="text-body font-extrabold text-ink">Key takeaway</h3>
        <ul className="m-0 flex flex-col gap-1.5 pl-0">
          {takeaways.map((t) => (
            <li key={t} className="flex gap-2 text-body font-semibold text-ink">
              <span className="mt-1 text-ok">
                <CheckIcon size={18} strokeWidth={3} />
              </span>
              <RichText text={t} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
