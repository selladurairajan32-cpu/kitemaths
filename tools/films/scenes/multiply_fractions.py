"""Film: multiplying fractions, 1/2 × 1/3 = 1/6 (D-050).

Timed by scripts/multiply-fractions.json: a chocolate bar (half left, Mo eats a third of it) with time to think, the
"multiplying makes it bigger" mistake, the bar cut into halves and then thirds, Mo's piece (one of six), tops and
bottoms, a number line showing 1/6 is smaller, a turn for the child (2/3 × 1/4) and a recap.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, FONT, GREEN, INK, ORANGE, RED, ScriptScene, frac, say  # noqa: E402
from manim import (DOWN, LEFT, RIGHT, UP, Create, Ellipse, FadeIn, FadeOut, Indicate, LaggedStart, Line, Rectangle,  # noqa: E402
                   RoundedRectangle, Text, VGroup)

CHOC = "#7A3B1A"
PALE = "#F3E3D3"


def think():
    return VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), say("Think!", size=34))


class Film(ScriptScene):
    concept = "multiply-fractions"

    def construct(self):
        W, H = 6.0, 3.6
        # 1. The question.
        title = say("Multiplying fractions", size=36).to_edge(UP, buff=0.35)
        bar = Rectangle(width=W, height=H, fill_color=CHOC, fill_opacity=1, stroke_color=INK, stroke_width=5).shift(UP * 0.1)
        q = VGroup(frac(1, 3, BLUE, 40), say("of", size=36), frac(1, 2, ORANGE, 40), say("= ?", size=40)).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(title), run_time=0.6)
        self.play(FadeIn(bar, shift=UP * 0.3), run_time=0.8)
        self.play(FadeIn(q), run_time=0.6)
        self.until("hook")

        # 2. Think!
        bub = think().move_to(RIGHT * 4.8 + UP * 1.5)
        self.at("predict", 2.2)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.until("predict")
        self.play(FadeOut(bub), run_time=0.3)

        # 3. The mistake.
        myth = say("Multiplying always makes it bigger?", size=34, color=RED).to_edge(DOWN, buff=0.5)
        self.play(FadeOut(q), FadeIn(myth), run_time=0.6)
        truth = say("A third of a half must be less than a half!", size=32, color=GREEN).to_edge(DOWN, buff=0.5)
        self.at("mistake", 5.0)
        self.play(FadeOut(myth), FadeIn(truth), run_time=0.6)
        self.until("mistake")
        self.play(FadeOut(truth), run_time=0.3)

        # 4. Half is left.
        right = Rectangle(width=W / 2, height=H, fill_color=PALE, fill_opacity=1, stroke_color=INK, stroke_width=5).align_to(bar, RIGHT).align_to(bar, UP)
        mid = Line(bar.get_top(), bar.get_bottom(), color=INK, stroke_width=5)
        lab = say("1/2 is left", size=34, color=ORANGE).to_edge(DOWN, buff=0.5)
        self.play(Create(mid), run_time=0.6)
        self.play(FadeIn(right), FadeIn(lab), run_time=0.8)
        self.until("half")

        # 5. Cut into thirds the other way; Mo's piece.
        rows = VGroup(*[Line(bar.get_left() + UP * (H / 2 - k * H / 3), bar.get_right() + UP * (H / 2 - k * H / 3), color=INK, stroke_width=5) for k in (1, 2)])
        self.play(FadeOut(lab), LaggedStart(*[Create(r) for r in rows], lag_ratio=0.4), run_time=1.2)
        mo = Rectangle(width=W / 2, height=H / 3, fill_color=GREEN, fill_opacity=1, stroke_color=INK, stroke_width=5).align_to(bar, LEFT).align_to(bar, UP)
        lab2 = say("Mo eats 1/3 of the half", size=34, color=GREEN).to_edge(DOWN, buff=0.5)
        self.at("third", 3.5)
        self.play(FadeIn(mo), FadeIn(lab2), run_time=0.8)
        self.until("third")

        # 6. Count: 6 pieces, Mo has 1.
        nums = VGroup()
        for i in range(6):
            c, r = i // 3, i % 3
            n = Text(str(i + 1), font=FONT, color="#FFFFFF" if c == 0 else INK, weight="BOLD").scale(0.7)
            n.move_to(bar.get_corner(UP + LEFT) + RIGHT * (W / 4 + c * W / 2) + DOWN * (H / 6 + r * H / 3))
            nums.add(n)
        self.play(FadeOut(lab2), LaggedStart(*[FadeIn(n, scale=1.6) for n in nums], lag_ratio=0.3), run_time=2.4)
        sixth = say("1 piece of 6 = 1/6", size=36, color=GREEN).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(sixth), run_time=0.6)
        self.until("count")

        # 7. Tops and bottoms.
        self.play(FadeOut(VGroup(bar, right, mid, rows, mo, nums, sixth)), run_time=0.5)
        eq = VGroup(frac(1, 2, ORANGE, 52), say("×", size=48), frac(1, 3, BLUE, 52), say("=", size=48), frac(1, 6, GREEN, 56)).arrange(RIGHT, buff=0.35).shift(UP * 0.8)
        tops = say("tops: 1 × 1 = 1", size=34).next_to(eq, DOWN, buff=0.5)
        bottoms = say("bottoms: 2 × 3 = 6", size=34).next_to(tops, DOWN, buff=0.25)
        self.play(FadeIn(eq), run_time=0.8)
        self.at("rule", 4.0)
        self.play(FadeIn(tops), run_time=0.6)
        self.at("rule", 7.0)
        self.play(FadeIn(bottoms), run_time=0.6)
        self.until("rule")

        # 8. Smaller: a number line.
        self.play(FadeOut(VGroup(eq, tops, bottoms)), run_time=0.5)
        line = Line(LEFT * 5.5, RIGHT * 5.5, color=INK, stroke_width=6)
        marks = VGroup()
        for v, n, d, col in ((0, 0, 1, INK), (1 / 6, 1, 6, GREEN), (1 / 3, 1, 3, BLUE), (1 / 2, 1, 2, ORANGE), (1, 1, 1, INK)):
            x = -5.5 + 11 * v
            tick = Line([x, -0.25, 0], [x, 0.25, 0], color=col, stroke_width=6)
            lab = (say(str(n), size=34, color=col) if d == 1 else frac(n, d, col, 34)).next_to(tick, DOWN, buff=0.25)
            marks.add(VGroup(tick, lab))
        self.play(Create(line), FadeIn(marks), run_time=1.2)
        small = say("1/6 is smaller than both!", size=36, color=GREEN).shift(UP * 1.6)
        self.play(FadeIn(small), Indicate(marks[1], color=GREEN, scale_factor=1.3), run_time=1.2)
        self.until("smaller")

        # 9. Your turn: 2/3 × 1/4.
        self.play(FadeOut(VGroup(line, marks, small, title)), run_time=0.5)
        yt = say("Your turn!", size=40, color=BLUE).to_edge(UP, buff=0.5)
        ask = VGroup(frac(2, 3, ORANGE, 44), say("×", size=44), frac(1, 4, BLUE, 44), say("= ?", size=44)).arrange(RIGHT, buff=0.3).next_to(yt, DOWN, buff=0.4)
        self.play(FadeIn(yt), FadeIn(ask), run_time=0.8)
        bub = think().move_to(DOWN * 0.8)
        self.at("your-turn", 3.0)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.at("your-turn", 5.4)
        self.play(FadeOut(bub), run_time=0.3)
        work = VGroup(say("tops: 2 × 1 = 2", size=34), say("bottoms: 3 × 4 = 12", size=34), say("2/12 = 1/6", size=40, color=GREEN)).arrange(DOWN, buff=0.35).move_to(DOWN * 1.0)
        self.play(LaggedStart(*[FadeIn(x) for x in work], lag_ratio=0.9), run_time=4.0)
        self.until("your-turn")

        # 10. Recap.
        self.play(FadeOut(VGroup(yt, ask, work)), run_time=0.5)
        recap = VGroup(say("Times a fraction = a fraction of it", size=36, color=BLUE), say("Multiply the tops and the bottoms", size=36, color=ORANGE), say("The answer is smaller", size=36, color=GREEN)).arrange(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(x, scale=0.8) for x in recap], lag_ratio=0.5), run_time=2.2)
        self.until("recap")
