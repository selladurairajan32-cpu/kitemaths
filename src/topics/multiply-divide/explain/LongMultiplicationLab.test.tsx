import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { longMultiplication } from "@/maths/long-multiplication";
import { topicById } from "@/topics";
import { EXPLAINERS, isKitLabDone } from "@/topics/kit/explainers";
import type { LabStepProps } from "@/topics/types";
import { areaCaptions as areaText, columnCaptions as columnText, columnSteps, hallCaptions as hallText, tryItBlanks } from "./captions";
import LongMultiplicationLab, { LongMultiplicationRemedy } from "./LongMultiplicationLab";

/**
 * ANIM-001 pilot: the animated Long multiplication lab. Three methods, Watch & Learn controls, keyboard use,
 * Try it yourself with specific feedback and "Explain it differently", completion, and an automated accessibility scan.
 */

vi.mock("@/lib/sound", () => ({ playSound: () => {} }));

const lesson = topicById("multiply-divide")!.lessonById("long")!;
const labStep = lesson.steps.find((s) => s.type === "lab") as LabStepProps["step"];

function renderLab(completed: string[] = []) {
  const onChallengeComplete = vi.fn();
  const utils = render(<LongMultiplicationLab step={labStep} completed={completed} onChallengeComplete={onChallengeComplete} />);
  return { ...utils, onChallengeComplete };
}
/** Captions keep "23 × 4" together with no-break spaces; compare with ordinary spaces. */
const plain = (t: string) => t.replace(/\u00a0/g, " ");
const caption = () => plain(screen.getByText(/^Step \d+ of \d+\./).parentElement!.textContent!);

describe("long multiplication captions (ANIM-001)", () => {
  const m = longMultiplication(23, 14);
  const hallCaptions = (x: typeof m) => hallText(x).map(plain);
  const areaCaptions = (x: typeof m) => areaText(x).map(plain);
  const columnCaptions = (x: typeof m) => columnText(x).map(plain);

  it("gives every method the steps its scene draws, in the right words", () => {
    expect(columnText(m)[4]).toContain("23\u00a0×\u00a014");
    expect(hallCaptions(m)).toHaveLength(5);
    expect(areaCaptions(m)).toHaveLength(5);
    expect(columnSteps(m).map((s) => s.kind)).toEqual(["setup", "row", "zero", "row", "sum"]);
    expect(columnCaptions(m)[1]).toBe(
      "Multiply by the **4 ones**, starting with the ones. 3 × 4 = 12: write 2, carry 1. 2 × 4 = 8, plus the carried 1 makes 9. This row is **92**, the same as 23 × 4.",
    );
    expect(columnCaptions(m)[2]).toContain("first write **0** in the ones column");
    expect(columnCaptions(m)[4]).toBe("Add the rows: 92 + 230 = **322**. So 23 × 14 = 322.");
    expect(hallCaptions(m)[4]).toContain("230 + 92 = **322** chairs");
    expect(areaCaptions(m)[2]).toBe("Each piece is an easy multiplication: 20 × 10 = 200, 3 × 10 = 30, 20 × 4 = 80, 3 × 4 = 12.");
  });

  it("builds the try-it parts for 34 × 12 with a trap for the missing zero", () => {
    expect(tryItBlanks(longMultiplication(34, 12)).map((b) => [b.prompt, b.answer, b.traps.map((t) => t.value)])).toEqual([
      ["**34 × 2** =", 68, []],
      ["**34 × 10** =", 340, [34]],
      ["**68 + 340** =", 408, [102]],
    ]);
  });
});

describe("long multiplication lesson wiring (ANIM-001)", () => {
  it("adds one lab step after the worked example and keeps the existing steps", () => {
    expect(lesson.steps.map((s) => s.type)).toEqual(["worked", "lab", "check", "check"]);
    expect(EXPLAINERS).toContain((labStep as unknown as { explainer: string }).explainer);
  });

  it("holds the lesson until the try-it is done", () => {
    expect(isKitLabDone(labStep, [])).toBe(false);
    expect(isKitLabDone(labStep, ["multiply-divide.long-try"])).toBe(true);
  });
});

describe("long multiplication lab (ANIM-001)", () => {
  it("offers three ways to see it and starts with the real-life one", () => {
    renderLab();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["In real lifeChairs in a hall", "Picture itAn area model", "Step by stepThe column method"]);
    expect(tabs[0]!.getAttribute("aria-selected")).toBe("true");
    expect(caption()).toContain("14 rows");
  });

  it("steps forward and back, plays, and replays from the start", async () => {
    const user = userEvent.setup();
    renderLab();
    await user.click(screen.getByRole("button", { name: /Next step/ }));
    expect(caption()).toContain("Step 2 of 5");
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(caption()).toContain("Step 1 of 5");
    await user.click(screen.getByRole("button", { name: "Go to step 5" }));
    expect(caption()).toContain("322");
    expect(screen.getByRole("button", { name: /Next step/ })).toHaveProperty("disabled", true);
    await user.click(screen.getByRole("button", { name: /Watch again/ }));
    expect(caption()).toContain("Step 1 of 5");
    expect(screen.getByRole("button", { name: /Pause/ })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Pause/ }));
    expect(screen.getByRole("button", { name: /Play/ })).toBeTruthy();
  });

  it("switches method with the keyboard and keeps the step", async () => {
    const user = userEvent.setup();
    renderLab();
    await user.click(screen.getByRole("button", { name: "Go to step 3" }));
    screen.getAllByRole("tab")[0]!.focus();
    await user.keyboard("{ArrowRight}");
    const picture = screen.getByRole("tab", { name: /Picture it/ });
    expect(picture.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(picture);
    expect(caption()).toContain("Step 3 of 5");
    expect(caption()).toContain("20 × 10 = 200");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: /Step by step/ }).getAttribute("aria-selected")).toBe("true");
    // Arrow keys inside the player move between steps.
    await user.click(screen.getByRole("button", { name: "Go to step 1" }));
    await user.keyboard("{ArrowRight}");
    expect(caption()).toContain("Step 2 of 5");
    expect(caption()).toContain("write 2, carry 1");
  });

  it("gives specific feedback, offers another way to see it, and completes when every part is right", async () => {
    const user = userEvent.setup();
    const { onChallengeComplete } = renderLab();
    const answer = async (v: string) => {
      const box = screen.getByRole("textbox", { name: /34 × |68 \+ 340/ });
      await user.clear(box);
      await user.type(box, v);
      await user.click(screen.getByRole("button", { name: "Check" }));
    };
    await answer("68");
    await answer("34");
    expect(screen.getByRole("status").textContent).toContain("Did you forget the 0?");
    await user.click(screen.getByRole("button", { name: "Explain it differently" }));
    expect(screen.getByRole("tab", { name: /Picture it/ }).getAttribute("aria-selected")).toBe("true");
    expect(caption()).toContain("Step 1 of 5");
    await answer("340");
    await answer("400");
    expect(screen.getByRole("status").textContent).toContain("Add the ones");
    expect(onChallengeComplete).not.toHaveBeenCalled();
    await answer("408");
    expect(onChallengeComplete).toHaveBeenCalledWith("multiply-divide.long-try");
    expect(screen.getByText(/Every part is right/)).toBeTruthy();
  });

  it("shows the finished try-it when the lab was done before", () => {
    renderLab(["multiply-divide.long-try"]);
    expect(screen.getByText(/Every part is right/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check" })).toBeNull();
  });

  it("lets the learner split the rows any way and always reach the same total", async () => {
    const user = userEvent.setup();
    renderLab();
    const slider = screen.getByRole("slider", { name: /Split the 14 rows/ });
    expect(slider.getAttribute("aria-valuetext")).toBe("10 rows and 4 rows");
    await user.click(screen.getByRole("button", { name: "Fewer rows on top" }));
    expect(slider.getAttribute("aria-valuetext")).toBe("9 rows and 5 rows");
    expect(screen.getByText(/207 \+ 115 =/).textContent).toContain("322");
  });

  it("offers the same three ways after a tens-place slip in practice", () => {
    render(<LongMultiplicationRemedy />);
    expect(screen.getByText(/Explain it differently/)).toBeTruthy();
    expect(within(screen.getByRole("tablist")).getAllByRole("tab")).toHaveLength(3);
  });

  it("has no automated accessibility violations", async () => {
    const { container } = renderLab();
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
