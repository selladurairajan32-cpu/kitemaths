"use client";

import { MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Hud } from "@/components/kid/Hud";
import { routes, topicRoutes } from "@/lib/routes";
import { updateLearner, updateTopic, useHydrated, useLearner } from "@/lib/store";
import { completePracticeSession, setSettings } from "@/engine/progress";
import { activeTopic } from "@/topics/recommend";
import { PAPER } from "@/components/paper/PaperIcon";
import { ArrowLeftIcon, BeakerIcon, CloseIcon, HomeIcon, KiteIcon, MapIcon, ParentIcon, PracticeIcon, SoundIcon } from "./Icons";

const KID_NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/journey", label: "Map", Icon: MapIcon },
  { href: "/practice", label: "Practice", Icon: PracticeIcon },
  { href: "/lab", label: "Lab", Icon: BeakerIcon },
  { href: "/badges", label: "Kites", Icon: KiteIcon },
];

const PARENT_NAV = [
  { href: routes.parent(), label: "Overview" },
  { href: routes.parentJourney(), label: "Journey detail" },
  { href: routes.results(), label: "Full report" },
];

/** "/t/fractions/practice/compare" → { topicId: "fractions", section: "practice" }. */
export function topicPath(pathname: string): { topicId: string; section: string } | null {
  const m = /^\/t\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  return m ? { topicId: m[1], section: m[2] ?? "" } : null;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  const tp = topicPath(pathname);
  if (tp) {
    if (href === "/practice") return tp.section === "practice";
    if (href === "/lab") return tp.section === "lab";
    if (href === "/journey") return tp.section !== "practice" && tp.section !== "lab";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type ShellMode = "kid" | "focus" | "parent";

/** Which chrome a route gets. Focus mode hides navigation so activities fill a phone screen. */
export function shellMode(pathname: string, practiceActive: (topicId: string) => boolean): ShellMode {
  if (pathname.startsWith("/parent") || pathname.startsWith("/results")) return "parent";
  const tp = topicPath(pathname);
  if (!tp) return "kid";
  if (["lesson", "check", "recheck", "start"].includes(tp.section)) return "focus";
  if (tp.section === "practice" && practiceActive(tp.topicId)) return "focus";
  return "kid";
}

/** The wordmark: the four-panel kite and the name, in ink. */
function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-full" aria-label="Kite Maths home">
      <svg width={small ? 26 : 30} height={small ? 26 : 30} viewBox="0 0 32 32" aria-hidden>
        <path d="M16 2 L3 14 L16 14 Z" fill={PAPER.red} />
        <path d="M16 2 L29 14 L16 14 Z" fill={PAPER.sun} />
        <path d="M29 14 L16 30 L16 14 Z" fill={PAPER.leaf} />
        <path d="M3 14 L16 30 L16 14 Z" fill={PAPER.sky} />
        <path d="M16 2 29 14 16 30 3 14Z" fill="none" stroke={PAPER.ink} strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
      <span className={`display whitespace-nowrap ${small ? "text-lg" : "text-xl"} leading-none text-ink`}>Kite Maths</span>
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
      className="grid size-10 place-items-center rounded-full text-ink-2 hover:bg-sunk"
    >
      <SoundIcon size={20} muted={!on} />
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const learner = useLearner();
  const mode = shellMode(pathname, (id) => !!learner.topics[id]?.practice.active);
  const tp = topicPath(pathname);
  const inPractice = tp?.section === "practice";
  const navTopic = topicRoutes(tp?.topicId ?? activeTopic(learner).id);
  /** Practice and Lab open the island the learner is in (or their active one). */
  const navHref = (href: string) => (href === "/practice" ? navTopic.practice() : href === "/lab" ? navTopic.lab() : href);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {mode === "focus" && (
        <header className="sticky top-0 z-40 bg-paper">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
            <Link
              href={tp ? (inPractice ? topicRoutes(tp.topicId).practice() : topicRoutes(tp.topicId).island()) : routes.journey()}
              onClick={(e) => {
                if (tp && inPractice) {
                  e.preventDefault();
                  updateTopic(tp.topicId, completePracticeSession);
                }
              }}
              className="grid size-11 place-items-center rounded-full text-muted hover:bg-sunk hover:text-ink"
              aria-label="Stop and go back"
            >
              <CloseIcon size={24} />
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
        <header className="sticky top-0 z-40 bg-paper">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Logo />
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {KID_NAV.map(({ href, label, Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={navHref(href)}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-11 items-center gap-2 rounded-full px-4 text-base font-medium transition-colors ${
                          active ? "bg-sunk text-ink" : "text-ink-2 hover:bg-sunk/60"
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
            <div className="flex items-center gap-1.5">
              <SoundToggle />
              <Hud />
              <Link
                href={routes.parent()}
                aria-label="Grown-ups"
                className="ml-1 hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm font-medium text-ink-2 hover:bg-sunk sm:flex"
              >
                <ParentIcon size={18} /> <span className="hidden xl:inline">Grown-ups</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {mode === "parent" && (
        <header className="sticky top-0 z-40 border-b border-[#e3e8ef] bg-surface">
          <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
            <div className="flex items-center gap-3">
              <Logo small />
              <span className="text-sm text-muted">Grown-ups</span>
            </div>
            <nav aria-label="Grown-ups" className="order-3 w-full overflow-x-auto sm:order-none sm:w-auto">
              <ul className="flex items-center gap-1">
                {PARENT_NAV.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={navHref(href)}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-9 items-center whitespace-nowrap rounded-[6px] px-3 text-sm font-medium ${active ? "bg-[#eef1f5] text-ink" : "text-muted hover:bg-[#f4f6f9] hover:text-ink"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <Link href="/" className="flex h-9 items-center gap-1.5 rounded-[6px] px-3 text-sm font-medium text-ink-2 hover:bg-[#f4f6f9]">
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
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {KID_NAV.map(({ href, label, Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={navHref(href)}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-16 flex-col items-center justify-center gap-1 text-sm font-medium ${active ? "text-ink" : "text-muted"}`}
                  >
                    <span className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${active ? "bg-sunk" : ""}`}>
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
