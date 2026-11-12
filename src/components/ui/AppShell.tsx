"use client";

import { MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Hud } from "@/components/kid/Hud";
import { routes, topicRoutes } from "@/lib/routes";
import { updateLearner, updateTopic, useHydrated, useLearner } from "@/lib/store";
import { completePracticeSession, setSettings } from "@/engine/progress";
import { ArrowLeftIcon, CloseIcon, HomeIcon, MapIcon, ParentIcon, PracticeIcon, ResultsIcon, SoundIcon, TrophyIcon } from "./Icons";
import { Pic } from "@/components/paper/Pic";

/** D-043 step 3: Home, Topics, Practice, Tests, Progress. The map, labs and badges are reached from these pages. */
const KID_NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/topics", label: "Topics", Icon: MapIcon },
  { href: "/practice", label: "Practice", Icon: PracticeIcon },
  { href: "/tests", label: "Tests", Icon: TrophyIcon },
  { href: "/progress", label: "Progress", Icon: ResultsIcon },
];

/** Topic sections that belong under Practice and Tests; every other topic page is under Topics. */
const PRACTICE_SECTIONS = ["practice"];
const TEST_SECTIONS = ["check", "recheck", "mock"];

const PARENT_NAV = [
  { href: routes.parent(), label: "Overview" },
  { href: routes.parentJourney(), label: "Journey detail" },
  { href: routes.results(), label: "Full report" },
  { href: routes.parentPlan(), label: "Weekly plan" },
  { href: routes.parentFacts(), label: "Times tables" },
  { href: routes.parentStrategies(), label: "Mental maths" },
  { href: routes.parentAbout(), label: "About" },
];

/** "/t/fractions/practice/compare" → { topicId: "fractions", section: "practice" }. */
export function topicPath(pathname: string): { topicId: string; section: string } | null {
  const m = /^\/t\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  return m ? { topicId: m[1], section: m[2] ?? "" } : null;
}

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const tp = topicPath(pathname);
  if (tp) {
    if (href === "/practice") return PRACTICE_SECTIONS.includes(tp.section);
    if (href === "/tests") return TEST_SECTIONS.includes(tp.section);
    if (href === "/topics") return !PRACTICE_SECTIONS.includes(tp.section) && !TEST_SECTIONS.includes(tp.section);
    return false;
  }
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (href === "/topics") return under("/topics") || under("/journey") || under("/lab");
  if (href === "/progress") return under("/progress") || under("/badges");
  return under(href);
}

export type ShellMode = "kid" | "focus" | "parent";

/** Which chrome a route gets. Focus mode hides navigation so activities fill a phone screen. */
export function shellMode(pathname: string, practiceActive: (topicId: string) => boolean): ShellMode {
  if (pathname.startsWith("/parent") || pathname.startsWith("/results")) return "parent";
  const tp = topicPath(pathname);
  if (!tp) return "kid";
  if (["lesson", "check", "recheck", "start"].includes(tp.section)) return "focus";
  // R2: a fact session (not the facts hub or the explorer) fills the screen like a lesson.
  if (/^\/t\/[^/]+\/facts\/(practice|untimed|diagnostic|timed)/.test(pathname)) return "focus";
  if (/^\/t\/[^/]+\/strategies\/(compare|choose|timed)/.test(pathname)) return "focus";
  if (tp.section === "practice" && practiceActive(tp.topicId)) return "focus";
  return "kid";
}

/** The wordmark: the 3D kite and the name. */
function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 rounded-full" aria-label="Kite Maths home">
      <Pic name="kite" size={small ? 32 : 40} priority />
      <span className={`display whitespace-nowrap ${small ? "text-lg" : "text-[1.375rem]"} leading-none text-ink`}>Kite Maths</span>
    </Link>
  );
}

function SoundToggle() {
  const learner = useLearner();
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const on = learner.settings.sound;
  return (
    <button
      type="button"
      onClick={() => updateLearner((s) => setSettings(s, { sound: !on }))}
      aria-pressed={on}
      aria-label={on ? "Sound on. Turn sound off" : "Sound off. Turn sound on"}
      className="grid size-11 place-items-center rounded-full text-ink-2 hover:bg-sunk"
    >
      <SoundIcon size={20} muted={!on} />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const learner = useLearner();
  const mode = shellMode(pathname, (id) => !!learner.topics[id]?.practice.active);
  // D-046: the child's own reduced-motion switch also stops CSS transitions and animations (globals.css).
  useEffect(() => {
    document.documentElement.dataset.motion = learner.settings.reducedMotion ? "reduced" : "";
  }, [learner.settings.reducedMotion]);
  const tp = topicPath(pathname);
  const inPractice = tp?.section === "practice";

  return (
    <MotionConfig reducedMotion={learner.settings.reducedMotion ? "always" : "user"}>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {mode === "focus" && (
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
          <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-1 sm:px-6">
            <Link
              href={tp ? (inPractice ? topicRoutes(tp.topicId).practice() : tp.section === "facts" ? topicRoutes(tp.topicId).facts() : tp.section === "strategies" ? topicRoutes(tp.topicId).strategies() : topicRoutes(tp.topicId).island()) : routes.journey()}
              onClick={(e) => {
                if (tp && inPractice) {
                  e.preventDefault();
                  updateTopic(tp.topicId, completePracticeSession);
                }
              }}
              className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2 text-ink-2 hover:bg-sunk hover:text-ink sm:px-3"
              aria-label="Stop and go back"
            >
              <CloseIcon size={24} /> <span className="hidden text-body font-bold sm:inline">Exit</span>
            </Link>
            <Logo small />
            <div className="flex items-center gap-1">
              <span className="hidden sm:block">
                <SoundToggle />
              </span>
              <Hud compact />
            </div>
          </div>
        </header>
      )}

      {mode === "kid" && (
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
          <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-1.5 sm:px-6">
            <Logo />
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex flex-wrap items-center gap-1">
                {KID_NAV.map(({ href, label, Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-11 items-center gap-1.5 rounded-full px-3.5 text-base transition-colors ${
                          active ? "bg-brand font-bold text-on-brand shadow-[0_6px_16px_rgb(37_99_235/0.3)]" : "font-semibold text-ink-2 hover:bg-brand-soft hover:text-ink"
                        }`}
                      >
                        <Icon size={20} />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="hidden sm:block">
                <SoundToggle />
              </span>
              <Hud />
              <Link
                href={routes.parent()}
                aria-label="Grown-ups"
                className="ml-1 hidden min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 text-label font-semibold text-ink-2 hover:bg-sunk sm:flex"
              >
                <ParentIcon size={18} /> <span className="hidden md:inline lg:hidden 2xl:inline">Grown-ups</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {mode === "parent" && (
        <header className="sticky top-0 z-40 border-b border-line bg-surface">
          <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Logo small />
              <span className="text-label font-semibold text-muted">Grown-ups</span>
            </div>
            <nav aria-label="Grown-ups" className="order-3 w-full min-w-0 sm:order-none sm:w-auto">
              {/* One row that scrolls sideways, so the sticky header stays short even at 200% text (D-037). */}
              <ul className="flex items-center gap-1 overflow-x-auto">
                {PARENT_NAV.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-label ${active ? "bg-brand-soft font-bold text-brand-strong" : "font-semibold text-ink-2 hover:bg-sunk hover:text-ink"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <Link href="/" className="flex min-h-11 items-center gap-1.5 rounded-full px-4 text-label font-semibold text-ink-2 hover:bg-sunk">
              <ArrowLeftIcon size={16} /> Child view
            </Link>
          </div>
        </header>
      )}

      <main
        id="main"
        className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${
          mode === "focus" ? "pb-6 pt-4 sm:pt-6" : mode === "kid" ? "pb-28 pt-4 lg:pb-16 lg:pt-6" : "pb-16 pt-6"
        }`}
      >
        {children}
      </main>

      {mode === "kid" && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <ul className="mx-auto grid max-w-xl grid-cols-5 px-3">
            {KID_NAV.map(({ href, label, Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-center text-label leading-tight [overflow-wrap:anywhere] ${active ? "font-bold text-brand-strong" : "font-semibold text-muted"}`}
                  >
                    <span className={`grid h-8 w-full max-w-14 place-items-center rounded-full transition-colors ${active ? "bg-brand text-on-brand" : ""}`}>
                      <Icon size={22} />
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </MotionConfig>
  );
}
