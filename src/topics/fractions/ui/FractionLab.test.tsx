import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FractionLab } from "./FractionLab";

/**
 * LAB-001 to LAB-007 and QA-002: the Fraction Lab rendered in jsdom. Checks that what the child sees (pictures, notation,
 * words) follows the one lab state, by pointer and by keyboard, with accessible names.
 */

const parts = () => screen.getAllByRole("checkbox", { name: /^Part \d+ of \d+$/ });
const readout = () => screen.getByText(/equal parts? shaded/).textContent;

describe("Fraction Lab (component)", () => {
  it("shades parts with a pointer and updates the notation and words at once (LAB-003, LAB-001)", async () => {
    const user = userEvent.setup();
    render(<FractionLab modes={["build"]} />);
    expect(parts()).toHaveLength(4);
    await user.click(parts()[1]);
    expect(parts()[1].getAttribute("aria-checked")).toBe("true");
    expect(readout()).toBe("1 out of 4 equal parts shaded");
    // Shading is shown by a tick as well as colour (LAB-007 AC2).
    expect(within(parts()[1]).getByTestId("shaded-tick")).toBeTruthy();
    await user.click(parts()[1]);
    expect(parts()[1].getAttribute("aria-checked")).toBe("false");
    expect(readout()).toBe("0 out of 4 equal parts shaded");
  });

  it("works from the keyboard: arrows move between parts, Space shades (LAB-003, LAB-007)", async () => {
    const user = userEvent.setup();
    render(<FractionLab modes={["build"]} />);
    parts()[0].focus();
    await user.keyboard("{ArrowRight}{ArrowRight} ");
    expect(parts()[2].getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(parts()[2]);
    await user.keyboard("{End}{Enter}");
    expect(parts()[3].getAttribute("aria-checked")).toBe("true");
    expect(readout()).toBe("2 out of 4 equal parts shaded");
  });

  it("changes the number of equal parts only within 1 to 12, and the labels follow (LAB-002)", async () => {
    const user = userEvent.setup();
    render(<FractionLab modes={["build"]} />);
    const more = screen.getByRole("button", { name: "More: Equal parts" });
    for (let i = 0; i < 20; i++) if (!(more as HTMLButtonElement).disabled) await user.click(more);
    expect(parts()).toHaveLength(12);
    expect((more as HTMLButtonElement).disabled).toBe(true);
    expect(parts()[11].getAttribute("aria-label")).toBe("Part 12 of 12");
  });

  it("keeps the fraction when switching from bar to circle (LAB-004)", async () => {
    const user = userEvent.setup();
    render(<FractionLab modes={["build"]} />);
    await user.click(parts()[0]);
    await user.click(screen.getByRole("radio", { name: "Circle" }));
    expect(screen.getByRole("group", { name: /A circle split into 4 equal parts, 1 shaded/ })).toBeTruthy();
    expect(readout()).toBe("1 out of 4 equal parts shaded");
  });

  it("compares two models with the maths engine and recognises equivalent fractions as equal (LAB-005)", () => {
    render(<FractionLab modes={["compare"]} />);
    // Starts at 1/2 and 1/4.
    expect(screen.getByText(/one half is greater than one quarter/i)).toBeTruthy();
    fireEvent.click(screen.getAllByRole("checkbox", { name: "Part 2 of 4" })[0]);
    expect(screen.getByText(/one half is equal to two quarters/i)).toBeTruthy();
    expect(screen.getByText(/they're equivalent/i)).toBeTruthy();
  });

  it("moves the number-line marker by keyboard and by dragging, snapping to marks (LAB-006)", async () => {
    const user = userEvent.setup();
    render(<FractionLab modes={["line"]} />);
    const line = screen.getByRole("radiogroup", { name: /Number line from 0 to 1 split into 4 equal gaps/ });
    const marks = within(line).getAllByRole("radio");
    expect(marks.map((m) => m.getAttribute("aria-label"))).toEqual(["Mark 1 of 4", "Mark 2 of 4", "Mark 3 of 4", "Mark 4 of 4"]);
    marks[0].focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(/The marker is 2 of 4 equal gaps from 0/)).toBeTruthy();
    // Drag: jsdom has no layout, so give the line a size; the pointer at 75% across lands nearest mark 3.
    line.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 124, right: 600, bottom: 124, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerDown(line, { clientX: 36 + 0.74 * 528, pointerId: 1 });
    expect(screen.getByText(/The marker is 3 of 4 equal gaps from 0/)).toBeTruthy();
    fireEvent.pointerMove(line, { clientX: 590, pointerId: 1 });
    expect(screen.getByText(/The marker is 4 of 4 equal gaps from 0: that is 1 whole/)).toBeTruthy();
    fireEvent.pointerUp(line, { pointerId: 1 });
  });

  it("gives every control an accessible name (LAB-007)", () => {
    render(<FractionLab modes={["build", "compare", "equivalent", "line"]} />);
    for (const b of screen.getAllByRole("button")) expect(b.getAttribute("aria-label") || b.textContent?.trim(), b.outerHTML).toBeTruthy();
    for (const r of screen.getAllByRole("radio")) expect(r.getAttribute("aria-label") || r.textContent?.trim()).toBeTruthy();
  });
});
