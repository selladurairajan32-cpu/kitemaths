import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopicProvider } from "@/topics/context";
import { PlacementScreen } from "./PlacementScreen";

/** FR-001: after the warm-up the child can choose a supported starting point. Component test in jsdom. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/fractions/start" }));
vi.mock("@/lib/sound", () => ({ playSound: () => {} }));

describe("warm-up result (FR-001)", () => {
  it("suggests a start and offers the beginning too, without locking anything", () => {
    // A learner placed out of the first two lessons.
    const saved = {
      version: 2,
      currentTopicId: "fractions",
      topics: { fractions: { placement: { status: "complete", order: [], index: 2, correct: [], wrong: [], placedOut: ["wholes", "naming"], completedAt: 1 }, lessons: { wholes: { step: 0, furthestStep: 0, completed: true, completedAt: 1, placedOut: true }, naming: { step: 0, furthestStep: 0, completed: true, completedAt: 1, placedOut: true } } } },
      results: [],
    };
    window.localStorage.setItem("kite-maths:v2", JSON.stringify(saved));
    render(
      <TopicProvider topicId="fractions">
        <PlacementScreen />
      </TopicProvider>,
    );
    expect(screen.getByText(/You already know 2 of the 9 lessons/)).toBeTruthy();
    const beginning = screen.getByRole("link", { name: /From the beginning: Wholes and equal parts/ });
    expect(beginning.getAttribute("href")).toBe("/t/fractions/lesson/wholes");
    const suggested = screen.getByRole("link", { name: /The suggested lesson: Fraction lab|The suggested lesson:/ });
    expect(suggested.getAttribute("href")).toBe("/t/fractions/lesson/lab");
    expect(screen.getByText(/The warm-up only suggests a start/)).toBeTruthy();
  });
});
