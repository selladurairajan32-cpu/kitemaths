import { act, render, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePhases } from "./timeline";

/** ANIM-001: a step's beats play one after another, and show at once when animations are off. */
function Beats() {
  const phase = usePhases([300, 500]);
  return <p>phase {phase}</p>;
}

describe("explainer timeline (ANIM-001)", () => {
  afterEach(() => {
    MotionGlobalConfig.skipAnimations = true;
    vi.useRealTimers();
  });

  it("plays each beat after its delay when animations run", () => {
    MotionGlobalConfig.skipAnimations = false;
    vi.useFakeTimers();
    render(<Beats />);
    expect(screen.getByText("phase 0")).toBeTruthy();
    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByText("phase 1")).toBeTruthy();
    act(() => vi.advanceTimersByTime(499));
    expect(screen.getByText("phase 1")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("phase 2")).toBeTruthy();
  });

  it("shows the last beat at once when movement is off", () => {
    render(<Beats />);
    expect(screen.getByText("phase 2")).toBeTruthy();
  });
});
