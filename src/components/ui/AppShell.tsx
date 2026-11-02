"use client";

import { MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Hud } from "@/components/kid/Hud";
import { routes } from "@/lib/routes";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { completePracticeSession, setSettings } from "@/engine/progress";
import { BeakerIcon, CloseIcon, HomeIcon, MapIcon, ParentIcon, PracticeIcon, ResultsIcon, SoundIcon, TrophyIcon } from "./Icons";

const KID_NAV = [
  { href: "/", label: "Home", Icon: HomeIcon, color: "bg-brand" },
  { href: "/journey", label: "Map", Icon: MapIcon, color: "bg-sky" },
  { href: "/practice", label: "Practice", Icon: PracticeIcon, color: "bg-ok-bright" },
  { href: "/lab", label: "Lab", Icon: BeakerIcon, color: "bg-pink" },
  { href: "/badges", label: "Badges", Icon: TrophyIcon, color: "bg-sun" },
];

const PARENT_NAV = [
  { href: routes.parent(), label: "Overview" },
  { href: routes.parentJourney(), label: "Journey detail" },
  { href: routes.results(), label: "Full report" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/journey") return pathname.startsWith("/journey") || pathname.startsWith("/lesson");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type ShellMode = "kid" | "focus" | "parent";

/** Which chrome a route gets. Focus mode hides navigation so activities fill a phone screen. */
export function shellMode(pathname: string, practiceActive: boolean): ShellMode {
  if (pathname.startsWith("/parent") || pathname.startsWith("/results")) return "parent";
  if (pathname.startsWith("/lesson") || pathname.startsWith("/assessment") || pathname.startsWith("/start")) return "focus";
  if (pathname.startsWith("/practice") && practiceActive) return "focus";
  return "kid";
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-xl" aria-label="Kite Maths home">
      <svg width={small ? 28 : 34} height={small ? 28 : 34} viewBox="0 0 32 32" aria-hidden>
        <path d="M16 2 L29 14 L16 14 Z" fill="#ffc83a" />
        <path d="M16 2 L3 14 L16 14 Z" fill="#ff6a45" />
        <path d="M3 14 L16 30 L16 14 Z" fill="#6a4cff" />
        <path d="M29 14 L16 30 L16 14 Z" fill="#2f74ff" />
        <path d="M16 2 29 14 16 30 3 14Z" fill="none" stroke="#1d2350" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <span className={`display whitespace-nowrap ${small ? "text-lg" : "text-2xl"} leading-none text-ink`}>
        Kite <span className="text-brand">Maths</span>
      </span>
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
  const mode = shellMode(pathname, learner.practice.active);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {mode === "focus" && (
        <header className="sticky top-0 z-40 border-b-2 border-line/70 bg-paper/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
            <Link
              href={pathname.startsWith("/practice") ? routes.practice() : routes.journey()}
              onClick={(e) => {
                if (pathname.startsWith("/practice")) {
                  e.preventDefault();
                  updateLearner(completePracticeSession);
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
        <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Logo />
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {KID_NAV.map(({ href, label, Icon, color }) => {
                  const active = isActive(pathname, href);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-11 items-center gap-2 rounded-2xl px-3.5 text-[0.95rem] font-semibold transition-colors ${
                          active ? "bg-surface text-ink shadow-[0_3px_0_var(--color-line)] ring-2 ring-line" : "text-ink-2 hover:bg-surface/70"
                        }`}
                      >
                        <span className={`grid size-7 place-items-center rounded-lg text-white ${color}`}>
                          <Icon size={16} strokeWidth={2.4} />
                        </span>
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
                className="ml-1 hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-sm font-medium text-muted hover:bg-surface hover:text-ink sm:flex"
              >
                <ParentIcon size={18} /> <span className="hidden xl:inline">Grown-ups</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {mode === "parent" && (
        <header className="sticky top-0 z-40 border-b-2 border-line bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
            <div className="flex items-center gap-3">
              <Logo small />
              <span className="rounded-full bg-sunk px-2.5 py-1 text-xs font-semibold text-muted">Grown-ups</span>
            </div>
            <nav aria-label="Grown-ups" className="order-3 w-full overflow-x-auto sm:order-none sm:w-auto">
              <ul className="flex items-center gap-1">
                {PARENT_NAV.map(({ href, label }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex h-10 items-center whitespace-nowrap rounded-xl px-3 text-sm font-medium ${active ? "bg-ink text-white" : "text-ink-2 hover:bg-sunk"}`}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <Link href="/" className="flex h-10 items-center gap-1.5 rounded-full bg-brand-soft px-3.5 text-sm font-semibold text-brand-strong hover:bg-[#e0d8ff]">
              <ResultsIcon size={16} /> Back to child view
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
          className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {KID_NAV.map(({ href, label, Icon, color }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold ${active ? "text-ink" : "text-muted"}`}
                  >
                    <span
                      className={`grid h-8 w-12 place-items-center rounded-2xl transition-all ${
                        active ? `${color} -translate-y-0.5 text-white shadow-[0_3px_0_rgb(29_35_80/0.18)]` : ""
                      }`}
                    >
                      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
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
