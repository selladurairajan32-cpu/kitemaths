"""Film: adding fractions with different denominators, 1/3 + 1/4 = 7/12 (D-041). Timed by scripts/add-different.json."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, FONT, GREEN, INK, INK2, ORANGE, RED, ScriptScene, frac, say  # noqa: E402
from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, Create, Cross, FadeIn, FadeOut, Group, Indicate, Line,  # noqa: E402
                   Rectangle, Text, Transform, VGroup, Write)


class Film(ScriptScene):
    concept = "add-different"

    def grid(self, cols, rows, w=3.6, h=2.4, fill_cells=(), color=BLUE):
        cells = VGroup()
        for r in range(rows):
            for c in range(cols):
                cell = Rectangle(width=w / cols, height=h / rows, stroke_width=0, fill_opacity=1, fill_color="#FFFFFF")
                cell.move_to([(-w / 2) + (c + 0.5) * w / cols, (h / 2) - (r + 0.5) * h / rows, 0])
                cells.add(cell)
        outline = Rectangle(width=w, height=h, stroke_color=INK, stroke_width=5)
        vlines = VGroup(*[Line([(-w / 2) + c * w / cols, -h / 2, 0], [(-w / 2) + c * w / cols, h / 2, 0], color=INK, stroke_width=4) for c in range(1, cols)])
        hlines = VGroup(*[Line([-w / 2, (h / 2) - r * h / rows, 0], [w / 2, (h / 2) - r * h / rows, 0], color=INK, stroke_width=4) for r in range(1, rows)])
        for i in fill_cells:
            cells[i].set_fill(color, 1)
        return VGroup(cells, vlines, hlines, outline)

    def construct(self):
        title = say("Adding fractions with different denominators", size=36).to_edge(UP, buff=0.5)
        q = VGroup(frac(1, 3, BLUE), Text("+", font=FONT, color=INK).scale(1.2), frac(1, 4, ORANGE), Text("=", font=FONT, color=INK).scale(1.2), Text("?", font=FONT, color=INK).scale(1.3)).arrange(RIGHT, buff=0.4)
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(q, shift=UP * 0.3), run_time=1.2)
        self.until("question")

        wrong = VGroup(frac(1, 3, BLUE), Text("+", font=FONT, color=INK), frac(1, 4, ORANGE), Text("=", font=FONT, color=INK), frac(2, 7, ORANGE)).arrange(RIGHT, buff=0.35).scale(0.8)
        self.play(q.animate.shift(UP * 0.6).scale(0.8), run_time=0.8)
        wrong.next_to(q, DOWN, buff=0.7)
        cross = Cross(wrong[-1], stroke_color=RED, stroke_width=8)
        self.play(FadeIn(wrong), run_time=0.8)
        self.play(Create(cross), run_time=0.6)
        note = say("2/7 is smaller than 1/3 alone!", size=28, color=RED).next_to(wrong, DOWN, buff=0.4)
        self.play(FadeIn(note), run_time=0.6)
        self.until("mistake")
        self.play(FadeOut(VGroup(wrong, cross, note, q)), run_time=0.7)

        third = self.grid(3, 1, fill_cells=[0], color=BLUE).shift(LEFT * 3.2 + DOWN * 0.3)
        quarter = self.grid(1, 4, fill_cells=[0], color=ORANGE).shift(RIGHT * 3.2 + DOWN * 0.3)
        l1 = frac(1, 3, BLUE, 40).next_to(third, DOWN, buff=0.35)
        l2 = frac(1, 4, ORANGE, 40).next_to(quarter, DOWN, buff=0.35)
        self.play(FadeIn(third), FadeIn(l1), run_time=1)
        self.play(FadeIn(quarter), FadeIn(l2), run_time=1)
        self.play(Indicate(third[0][0], color=BLUE, scale_factor=1.08), Indicate(quarter[0][0], color=ORANGE, scale_factor=1.08), run_time=1.5)
        self.until("pictures")

        third12 = self.grid(3, 4, fill_cells=[0, 3, 6, 9], color=BLUE).move_to(third)
        quarter12 = self.grid(3, 4, fill_cells=[0, 1, 2], color=ORANGE).move_to(quarter)
        self.play(Create(third12[2]), run_time=1.4)
        self.play(Create(quarter12[1]), run_time=1.4)
        self.play(FadeOut(third), FadeIn(third12), FadeOut(quarter), FadeIn(quarter12), run_time=0.8)
        self.until("cut")

        twelve = say("3 × 4 = 12 equal parts in each", size=30).to_edge(UP, buff=1.4)
        self.play(FadeIn(twelve, shift=DOWN * 0.2), run_time=0.8)
        self.until("twelve")

        for i, idx in enumerate([0, 3, 6, 9]):
            num = Text(str(i + 1), font=FONT, color="#FFFFFF").scale(0.5).move_to(third12[0][idx])
            self.play(FadeIn(num, scale=1.6), run_time=0.3)
        self.play(Transform(l1, frac(4, 12, BLUE, 40).move_to(l1)), run_time=0.8)
        for i, idx in enumerate([0, 1, 2]):
            num = Text(str(i + 1), font=FONT, color="#FFFFFF").scale(0.5).move_to(quarter12[0][idx])
            self.play(FadeIn(num, scale=1.6), run_time=0.3)
        self.play(Transform(l2, frac(3, 12, ORANGE, 40).move_to(l2)), run_time=0.8)
        self.until("count")

        whole = self.grid(3, 4).move_to(DOWN * 0.3)
        self.play(FadeOut(Group(*[m for m in self.mobjects if m is not title])), run_time=0.6)
        self.play(FadeIn(whole), run_time=0.6)
        for k in range(7):
            self.play(whole[0][k].animate.set_fill(BLUE if k < 4 else ORANGE, 1), run_time=0.28)
        sumline = VGroup(frac(4, 12, BLUE, 40), Text("+", font=FONT, color=INK), frac(3, 12, ORANGE, 40), Text("=", font=FONT, color=INK), frac(7, 12, GREEN, 48)).arrange(RIGHT, buff=0.35).next_to(whole, DOWN, buff=0.45)
        self.play(FadeIn(sumline, shift=UP * 0.2), run_time=1)
        self.play(Circumscribe(sumline[-1], color=GREEN, buff=0.15), run_time=1.2)
        self.until("add")

        self.play(FadeOut(VGroup(whole, sumline)), run_time=0.6)
        steps = VGroup(
            say("1.  Make the parts the same size:", size=30),
            say("3 × 4 = 12, so use twelfths", size=30, color=INK2),
            say("2.  1/3 = 4/12   and   1/4 = 3/12", size=30),
            say("3.  Add the tops:  4/12 + 3/12 = 7/12", size=30, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.32).move_to(DOWN * 0.2)
        steps[1].shift(RIGHT * 0.62)
        for s in steps:
            self.play(FadeIn(s, shift=RIGHT * 0.3), run_time=0.7)
        self.until("remember")
