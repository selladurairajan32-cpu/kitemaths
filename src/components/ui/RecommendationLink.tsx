"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Recommendation } from "@/engine/journey";
import { routes } from "@/lib/routes";
import { buttonClass } from "./Button";

export function recommendationHref(rec: Recommendation): string {
  switch (rec.kind) {
    case "lesson":
      return routes.lesson(rec.lessonId);
    case "practice":
      return routes.practice(rec.focusSkill);
    case "assessment":
      return routes.assessment();
    case "recheck":
      return routes.recheck(rec.skill);
    case "results":
      return routes.results();
  }
}

export function recommendationVerb(rec: Recommendation): string {
  switch (rec.kind) {
    case "lesson":
      return rec.resume ? "Continue lesson" : "Start lesson";
    case "practice":
      return "Start practice";
    case "assessment":
      return rec.resume ? "Resume mastery check" : "Go to mastery check";
    case "recheck":
      return rec.resume ? "Resume recheck" : "Start recheck";
    case "results":
      return "View results";
  }
}

export function RecommendationLink({
  rec,
  children,
  variant = "primary",
  size = "lg",
  className = "",
}: {
  rec: Recommendation;
  children: ReactNode;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Link href={recommendationHref(rec)} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
