"""Film: percentages of amounts, 35% of £80 (D-050).

Timed by scripts/percent-of-amount.json: a sale with time to think, the "divide by the percentage" mistake, the £80 as a
bar of ten 10% parts of £8, 35% built from three parts and half a part (£24 + £4 = £28), the rule, a turn for the
child (15% of 60) and a recap.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, GREEN, INK, ORANGE, RED, ScriptScene, say  # noqa: E402
from manim import (DOWN, LEFT, RIGHT, UP, Circle, Create, Cross, Ellipse, FadeIn, FadeOut, LaggedStart, Rectangle,  # noqa: E402
                   RoundedRectangle, VGroup)


def bar(parts=10, width=10.0, label=None):
    w = width / parts
    cells = VGroup(*[Rectangle(width=w, height=1.0, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4) for _ in range(parts)]).arrange(RIGHT, buff=0)
    texts = VGroup(*[say(label, size=24).move_to(c) for c in cells]) if label else VGroup()
    return cells, texts


def think():
    return VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), say("Think!", size=34))


class Film(ScriptScene):
    concept = "percent-of-amount"

    def construct(self):
        # 1. The sale.
        title = say("Percentages of amounts", size=36).to_edge(UP, buff=0.35)
        tag = VGroup(RoundedRectangle(width=4.2, height=2.2, corner_radius=0.3, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=5), VGroup(say("Bike", size=34), say("£80", size=60)).arrange(DOWN, buff=0.2)).shift(LEFT * 1.2 + UP * 0.3)
        off = VGroup(Circle(radius=1.0, fill_color="#E8343F", fill_opacity=1, stroke_width=0), VGroup(say("35%", size=40, color="#FFFFFF"), say("OFF", size=28, color="#FFFFFF")).arrange(DOWN, buff=0.05)).move_to(tag.get_corner(UP + RIGHT) + RIGHT * 0.6 + DOWN * 0.2)
        q = say("How much money is 35% off?", size=34).to_edge(DOWN, buff=0.8)
        self.play(FadeIn(title), run_time=0.6)
        self.play(FadeIn(tag, shift=UP * 0.3), run_time=0.8)
        self.play(FadeIn(off, scale=1.6), run_time=0.6)
        self.play(FadeIn(q), run_time=0.6)
        self.until("hook")

        # 2. Think!
        bub = think().move_to(DOWN * 2.2 + RIGHT * 3.5)
        self.at("predict", 2.2)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.until("predict")
        self.play(FadeOut(bub), run_time=0.3)

        # 3. The mistake: 80 ÷ 35.
        wrong = say("80 ÷ 35 ≈ 2 ?", size=44, color=RED).to_edge(DOWN, buff=0.8)
        self.play(FadeOut(q), FadeIn(wrong), run_time=0.6)
        cross = Cross(wrong, stroke_color=RED, stroke_width=8)
        self.at("mistake", 4.0)
        self.play(Create(cross), run_time=0.5)
        note = say("Per cent means out of every 100", size=32, color=BLUE).next_to(wrong, UP, buff=0.3)
        self.at("mistake", 6.5)
        self.play(FadeIn(note), run_time=0.6)
        self.until("mistake")
        self.play(FadeOut(VGroup(tag, off, wrong, cross, note)), run_time=0.5)

        # 4. The bar: £80 = 100%, cut into ten.
        whole = Rectangle(width=10, height=1.0, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4)
        top = say("£80 = 100%", size=36).next_to(whole, UP, buff=0.4)
        self.play(FadeIn(whole), FadeIn(top), run_time=0.8)
        cells, texts = bar(label="£8")
        self.at("bar", 5.0)
        self.play(FadeIn(cells), FadeOut(whole), run_time=1.0)
        ten = say("ten parts of 10%", size=32, color=BLUE).next_to(cells, DOWN, buff=0.4)
        self.play(FadeIn(ten), run_time=0.6)
        self.until("bar")

        # 5. 10% of 80 is 8.
        calc = say("10% = 80 ÷ 10 = £8", size=36, color=BLUE).next_to(cells, DOWN, buff=0.4)
        self.play(FadeOut(ten), FadeIn(calc), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(t, scale=1.4) for t in texts], lag_ratio=0.12), run_time=1.6)
        self.until("ten")

        # 6. Build 35%: three parts and half a part.
        self.play(FadeOut(calc), run_time=0.3)
        for i in range(3):
            self.play(cells[i].animate.set_fill(BLUE), texts[i].animate.set_color("#FFFFFF"), run_time=0.35)
        half = Rectangle(width=0.5, height=1.0, fill_color=ORANGE, fill_opacity=1, stroke_width=0).align_to(cells[3], LEFT).align_to(cells[3], UP).shift(RIGHT * 0.02)
        texts[3].set_z_index(2)  # the label stays readable on top of the 5% half
        self.play(FadeIn(half), run_time=0.5)
        parts = VGroup(say("30% = 3 × £8 = £24", size=32, color=BLUE), say("5% = half of £8 = £4", size=32, color=ORANGE)).arrange(DOWN, buff=0.3).next_to(cells, DOWN, buff=0.4)
        self.at("build", 3.0)
        self.play(FadeIn(parts[0]), run_time=0.6)
        self.at("build", 7.0)
        self.play(FadeIn(parts[1]), run_time=0.6)
        self.until("build")

        # 7. The total.
        total = say("35% of £80 = £24 + £4 = £28", size=40, color=GREEN).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(total, shift=UP * 0.2), run_time=0.8)
        self.until("total")

        # 8. The rule.
        self.play(FadeOut(VGroup(cells, texts, half, parts, total, top, title)), run_time=0.5)
        card = RoundedRectangle(width=11, height=3.4, corner_radius=0.4, fill_color="#FFFFFF", fill_opacity=1, stroke_color=BLUE, stroke_width=5)
        lines = VGroup(say("1.  Per cent means out of every 100", size=32), say("2.  Find 10%: divide by 10", size=32), say("3.  Build the percentage you need", size=32, color=GREEN)).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to(card)
        head = say("The rule", size=40, color=BLUE).next_to(card, UP, buff=0.3)
        self.play(FadeIn(card), FadeIn(head), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(x, shift=RIGHT * 0.3) for x in lines], lag_ratio=0.6), run_time=2.6)
        self.until("rule")

        # 9. Your turn: 15% of 60.
        self.play(FadeOut(VGroup(card, lines, head)), run_time=0.5)
        yt = say("Your turn!", size=40, color=BLUE).to_edge(UP, buff=0.5)
        ask = say("What is 15% of 60?", size=40).next_to(yt, DOWN, buff=0.4)
        self.play(FadeIn(yt), FadeIn(ask), run_time=0.8)
        bub = think().move_to(DOWN * 0.5)
        self.at("your-turn", 3.0)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.at("your-turn", 5.4)
        self.play(FadeOut(bub), run_time=0.3)
        work = VGroup(say("10% of 60 = 6", size=34, color=BLUE), say("5% = half of 6 = 3", size=34, color=ORANGE), say("15% = 6 + 3 = 9", size=36, color=GREEN)).arrange(DOWN, buff=0.35).move_to(DOWN * 0.8)
        self.play(LaggedStart(*[FadeIn(x) for x in work], lag_ratio=0.8), run_time=3.5)
        self.until("your-turn")

        # 10. Recap.
        self.play(FadeOut(VGroup(yt, ask, work)), run_time=0.5)
        recap = VGroup(say("Per cent: out of every 100", size=38, color=BLUE), say("Find 10% first", size=38, color=ORANGE), say("Build what you need", size=38, color=GREEN)).arrange(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(x, scale=0.8) for x in recap], lag_ratio=0.5), run_time=2.2)
        self.until("recap")
