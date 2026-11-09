import Link from "next/link";
import { SECURE_MIN_EVIDENCE, SECURE_THRESHOLD } from "@/engine/mastery";
import { routes } from "@/lib/routes";
import { topicById } from "@/topics";
import { WORLDS } from "@/topics/worlds";

/** The module built first to the full standard; every other island is an unaccepted preview (D-001). */
const REFERENCE_TOPIC = "fractions";

/**
 * For a grown-up who is new to Kite Maths (content audit R10): what it is, what is ready, how progress is judged and
 * where it is kept. Every figure comes from the app's own data or constants, so the page can't drift from the product.
 */
export function AboutScreen() {
  const islands = WORLDS.flatMap((w) => w.islands);
  const reference = topicById(REFERENCE_TOPIC)?.title ?? "Fractions foundations";
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="display text-heading-2 sm:text-heading-1">About Kite Maths</h1>
        <p className="mt-2 text-body text-ink-2">
          Maths practice for Years 3 to 6 in England, with Kip the kite as a guide. Each topic is an island: children learn it in short lessons, practise
          it, and then show what they know on their own.
        </p>
      </header>

      <section aria-labelledby="ready-title" className="space-y-2">
        <h2 id="ready-title" className="text-title font-extrabold">
          What is ready
        </h2>
        <p className="text-body text-ink-2">
          There are {islands.length} islands in {WORLDS.length} worlds. <strong className="text-ink">{reference}</strong> is the first module built to the full
          standard: lessons, practice and an independent mastery check. It has not yet been independently signed off. The other {islands.length - 1} islands
          are early previews: they work, but have not been through the same checks.
        </p>
        <p className="text-body text-ink-2">Kite Maths is not yet complete 11+ preparation.</p>
      </section>

      <section aria-labelledby="judged-title" className="space-y-2">
        <h2 id="judged-title" className="text-title font-extrabold">
          How progress is judged
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-body text-ink-2">
          <li>A lesson counts as done only once a new question on its skill is answered right first time, without a hint. Reaching the last page is not enough.</li>
          <li>
            A skill is <strong className="text-ink">secure in practice</strong> after at least {SECURE_MIN_EVIDENCE} recent lesson or practice answers averaging{" "}
            {Math.round(SECURE_THRESHOLD * 100)}% or more. Right first time with no hint counts fully; right after a hint or a second try counts half.
          </li>
          <li>
            <strong className="text-ink">Mastered</strong> also needs the independent mastery check, which your child sees as &ldquo;the big challenge&rdquo;:
            questions on every skill, with no hints.
          </li>
          <li>Labels describe recent work on one skill. They are not a judgement of ability, and they can change.</li>
        </ul>
      </section>

      <section aria-labelledby="data-title" className="space-y-2">
        <h2 id="data-title" className="text-title font-extrabold">
          Where your child&apos;s progress is kept
        </h2>
        <ul className="list-disc space-y-1.5 pl-5 text-body text-ink-2">
          <li>In this browser, on this device. There are no accounts, and progress is not sent to a server.</li>
          <li>Clearing browser data, private browsing or using another device starts fresh.</li>
          <li>If you add your child&apos;s first name, it stays on this device too.</li>
          <li>
            Reading questions aloud uses the browser&apos;s own speech. Depending on the browser, some voices are provided online by the browser&apos;s maker.
          </li>
        </ul>
      </section>

      <section aria-labelledby="area-title" className="space-y-2">
        <h2 id="area-title" className="text-title font-extrabold">
          The grown-ups area
        </h2>
        <p className="text-body text-ink-2">
          It sits behind a simple sum, which keeps children in their own space; it is not security. It has three pages:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-body text-ink-2">
          <li>
            <Link href={routes.parent()} className="font-semibold text-den underline underline-offset-2">
              Overview
            </Link>
            : how your child is doing and what to do next, with settings and a reset.
          </li>
          <li>
            <Link href={routes.parentJourney()} className="font-semibold text-den underline underline-offset-2">
              Journey detail
            </Link>
            : lesson by lesson, with curriculum links and what each lesson builds on.
          </li>
          <li>
            <Link href={routes.results()} className="font-semibold text-den underline underline-offset-2">
              Full report
            </Link>
            : the evidence behind every label, and a question-by-question review of the mastery check.
          </li>
        </ul>
      </section>
    </article>
  );
}
