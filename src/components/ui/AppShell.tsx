"use client";

import { MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HomeIcon, PathIcon, PracticeIcon, ResultsIcon, StudioIcon } from "./Icons";

const NAV = [
  { href: "/", label: "Dashboard", short: "Home", Icon: HomeIcon },
  { href: "/journey", label: "Journey", short: "Journey", Icon: PathIcon },
  { href: "/lesson", label: "Lesson Studio", short: "Studio", Icon: StudioIcon },
  { href: "/practice", label: "Practice", short: "Practice", Icon: PracticeIcon },
  { href: "/results", label: "Results", short: "Results", Icon: ResultsIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/results") return pathname.startsWith("/results") || pathname.startsWith("/assessment");
  if (href === "/lesson") return pathname.startsWith("/lesson") || pathname.startsWith("/lab");
  return pathname.startsWith(href);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Kite Maths home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <path d="M16 2 29 14 16 30 3 14Z" fill="#fde6dd" stroke="#1b2130" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M16 2v28M3 14h26" stroke="#1b2130" strokeWidth="1.8" />
        <path d="M16 2 29 14H16Z" fill="#e0603f" />
      </svg>
      <span className="display text-xl font-semibold tracking-tight">Kite Maths</span>
      <span className="hidden rounded-full bg-sunk px-2 py-0.5 text-[0.7rem] font-medium text-muted xl:inline">
        Fractions foundations · Prototype
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map(({ href, label, Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors ${
                        active ? "bg-ink text-white" : "text-ink-2 hover:bg-sunk"
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-8">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {NAV.map(({ href, short, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium ${
                    active ? "text-ink" : "text-muted"
                  }`}
                >
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
                      active ? "bg-ink text-white" : ""
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {short}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
}
