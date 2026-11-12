"""Film: ratio and proportion, sharing 35 sweets in the ratio 2 : 3 (D-041). Timed by scripts/ratio.json."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, GREEN, INK, INK2, ORANGE, ScriptScene, say  # noqa: E402
from manim import (DOWN, LEFT, ORIGIN, RIGHT, UP, Circle, Circumscribe, FadeIn, FadeOut, LaggedStart, Rectangle,  # noqa: E402
                   RoundedRectangle, Square, VGroup, Write)

A, B, TOTAL = 2, 3, 35
PART = TOTAL // (A + B)


def cube(color):
    return Square(side_length=0.8, fill_color=color, fill_opacity=1, stroke_color=INK, stroke_width=3)


def group():
    """One group: 2 blue cubes and 3 orange cubes in a row."""
    return VGroup(*[cube(BLUE) for _ in range(A)], *[cube(ORANGE) for _ in range(B)]).arrange(RIGHT, buff=0.12)


def sweet(color):
    return Circle(radius=0.18, fill_color=color, fill_opacity=1, stroke_color=INK, stroke_width=2)


def jar(label, color):
    body = RoundedRectangle(width=2.6, height=3.6, corner_radius=0.3, stroke_color=INK, stroke_width=5)
    tag = say(label, size=28, color=color).next_to(body, DOWN, buff=0.25)
    return VGroup(body, tag)


class Film(ScriptScene):
    concept = "ratio"

    def construct(self):
        title = say("Ratio: sharing in a ratio", size=38).to_edge(UP, buff=0.5)
        big = say("2 : 3", size=96)
        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(big, scale=0.7), run_time=1)
        self.until("intro")

        g1 = group().move_to(UP * 0.9)
        self.play(FadeOut(big), run_time=0.4)
        self.play(LaggedStart(*[FadeIn(c, shift=DOWN * 0.4) for c in g1], lag_ratio=0.2), run_time=1.6)
        words = say("for every 2 blue, there are 3 orange", size=30, color=INK2).next_to(g1, DOWN, buff=0.6)
        self.play(FadeIn(words), run_time=0.8)
        self.until("group")

        g2 = group().next_to(g1, DOWN, buff=0.25)
        g3 = group().next_to(g2, DOWN, buff=0.25)
        count = say("4 : 6", size=40).next_to(g1, RIGHT, buff=1.0)
        self.play(FadeOut(words), run_time=0.4)
        self.play(FadeIn(g2, shift=DOWN * 0.3), FadeIn(count), run_time=1)
        self.wait(1.2)
        self.play(FadeIn(g3, shift=DOWN * 0.3), count.animate.become(say("6 : 9", size=40).move_to(count)), run_time=1)
        still = say("still 2 : 3", size=34, color=GREEN).next_to(count, DOWN, buff=0.4)
        self.play(FadeIn(still), run_time=0.6)
        self.until("more")

        self.play(FadeOut(VGroup(g1, g2, g3, count, still)), run_time=0.6)
        ask = say("Share 35 sweets in the ratio 2 : 3", size=34).next_to(title, DOWN, buff=0.4)
        pile = VGroup(*[sweet(BLUE if (i % 5) < A else ORANGE) for i in range(TOTAL)]).arrange_in_grid(rows=5, buff=0.12).move_to(DOWN * 0.5)
        self.play(FadeIn(ask), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(s, scale=0.5) for s in pile], lag_ratio=0.03), run_time=1.6)
        self.until("share")

        groups = VGroup(*[VGroup(*pile[i * 5:(i + 1) * 5]) for i in range(PART)])
        target = VGroup(*[VGroup(*[sweet(BLUE if k < A else ORANGE) for k in range(5)]).arrange(DOWN, buff=0.08) for _ in range(PART)]).arrange(RIGHT, buff=0.6).move_to(DOWN * 0.4)
        self.play(*[groups[i].animate.move_to(target[i]).arrange(DOWN, buff=0.08).move_to(target[i]) for i in range(PART)], run_time=1.6)
        sums = say("2 + 3 = 5 in each group.   35 ÷ 5 = 7 groups", size=28).next_to(groups, DOWN, buff=0.5)
        self.play(FadeIn(sums), run_time=0.8)
        self.until("parts")

        left = jar("Blue: 2 × 7 = 14", BLUE).move_to(LEFT * 3 + DOWN * 0.6)
        right = jar("Orange: 3 × 7 = 21", ORANGE).move_to(RIGHT * 3 + DOWN * 0.6)
        blues = VGroup(*[s for g in groups for s in g[:A]])
        oranges = VGroup(*[s for g in groups for s in g[A:]])
        self.play(FadeOut(sums), FadeIn(left[0]), FadeIn(right[0]), run_time=0.6)
        self.play(blues.animate.arrange_in_grid(rows=7, buff=0.1).move_to(left[0]), oranges.animate.arrange_in_grid(rows=7, buff=0.1).move_to(right[0]), run_time=1.8)
        self.play(FadeIn(left[1]), FadeIn(right[1]), run_time=0.8)
        self.until("jars")

        self.play(FadeOut(VGroup(blues, oranges, left, right, ask)), run_time=0.6)
        bar = VGroup(*[Rectangle(width=1.8, height=1.1, fill_color=BLUE if i < A else ORANGE, fill_opacity=1, stroke_color=INK, stroke_width=4) for i in range(A + B)]).arrange(RIGHT, buff=0).move_to(UP * 0.3)
        sevens = VGroup(*[say("7", size=34, color="#FFFFFF").move_to(r) for r in bar])
        total = say("14 + 21 = 35", size=40, color=GREEN).next_to(bar, DOWN, buff=0.6)
        self.play(FadeIn(bar), FadeIn(sevens), run_time=0.8)
        self.play(FadeIn(total), run_time=0.6)
        self.play(Circumscribe(total, color=GREEN, buff=0.15), run_time=1.2)
        self.until("check")

        self.play(FadeOut(VGroup(bar, sevens, total)), run_time=0.6)
        steps = VGroup(
            say("1.  Add the parts:  2 + 3 = 5", size=32),
            say("2.  Find one part:  35 ÷ 5 = 7", size=32),
            say("3.  Multiply:  2 × 7 = 14  and  3 × 7 = 21", size=32, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to(ORIGIN + DOWN * 0.2)
        for s in steps:
            self.play(FadeIn(s, shift=RIGHT * 0.3), run_time=0.7)
        self.until("remember")
