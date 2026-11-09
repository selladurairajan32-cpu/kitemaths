"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { activeTopic } from "@/topics/recommend";

type Section = "practice" | "lab" | "start";

/**
 * `/practice`, `/lab` and `/start` open the learner's current island (DEF-014), not always Fractions. An island without a
 * lab sends `/lab` to its map instead (UX-005: no placeholder destinations).
 */
export function HubRedirect({ section }: { section: Section }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  const router = useRouter();
  const topic = activeTopic(learner);
  const links = topicRoutes(topic.id);
  const target = section === "lab" ? (topicById(topic.id)?.ui.FreeLab ? links.lab() : links.island()) : section === "start" ? links.start() : links.practice();
  useEffect(() => {
    if (hydrated) router.replace(target);
  }, [hydrated, router, target]);
  return (
    <p className="py-10 text-center text-ink-2">
      Opening <Link href={target} className="font-semibold text-brand underline underline-offset-2">{topic.title}</Link>…
    </p>
  );
}
