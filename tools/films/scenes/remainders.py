"""Film: remainders in real life, 50 children and minibuses of 12 (D-050).

Timed by scripts/remainders.json: the trip with time to think, 50 ÷ 12 = 4 r 2 with four full minibuses and two
children left, the mistake of stopping at four, a fifth minibus (round up), packs of pens (round down), the remainder
as the answer, the rule, a turn for the child (26 eggs in boxes of 6) and a recap.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, GREEN, INK, ORANGE, RED, ScriptScene, say  # noqa: E402
from manim import (DOWN, LEFT, RIGHT, UP, Circle, Create, Cross, Ellipse, FadeIn, FadeOut, LaggedStart, Rectangle,  # noqa: E402
                   RoundedRectangle, VGroup)

SUN = "#FFF4D4"
OKSOFT = "#E3F8EE"


def bus(filled, extra=False):
    body = RoundedRectangle(width=2.2, height=1.15, corner_radius=0.25, fill_color=OKSOFT if extra else SUN, fill_opacity=1, stroke_color=GREEN if extra else INK, stroke_width=4)
    seats = VGroup(*[Circle(radius=0.11, fill_color=BLUE if i < filled else "#FFFFFF", fill_opacity=1, stroke_color="#C9D2E6", stroke_width=2) for i in range(12)])
    seats.arrange_in_grid(rows=2, cols=6, buff=0.12).move_to(body)
    wheels = VGroup(*[Circle(radius=0.16, fill_color=INK, fill_opacity=1, stroke_width=0).move_to(body.get_bottom() + RIGHT * dx) for dx in (-0.65, 0.65)])
    return VGroup(body, seats, wheels)


def pens(n, color):
    sticks = VGroup(*[Rectangle(width=0.1, height=0.9, fill_color=color, fill_opacity=1, stroke_width=0) for _ in range(n)]).arrange(RIGHT, buff=0.06)
    return sticks


def think():
    return VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), say("Think!", size=34))


class Film(ScriptScene):
    concept = "remainders"

    def construct(self):
        # 1. The question.
        title = say("Remainders in real life", size=36).to_edge(UP, buff=0.35)
        q = say("50 children, 12 in each minibus. How many minibuses?", size=32).next_to(title, DOWN, buff=0.5)
        buses = VGroup(*[bus(0) for _ in range(4)]).arrange(RIGHT, buff=0.35).shift(LEFT * 1.3 + DOWN * 0.4)
        self.play(FadeIn(title), run_time=0.6)
        self.play(FadeIn(q), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(b, shift=RIGHT * 0.4) for b in buses], lag_ratio=0.25), run_time=1.6)
        self.until("hook")

        # 2. Think!
        bub = think().move_to(RIGHT * 4.6 + DOWN * 2.4)
        self.at("predict", 2.2)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.until("predict")
        self.play(FadeOut(bub), run_time=0.3)

        # 3. Divide: four full, two left.
        full = VGroup(*[bus(12).move_to(b) for b in buses])
        self.play(LaggedStart(*[b.animate.become(f) for b, f in zip(buses, full)], lag_ratio=0.3), run_time=2.0)
        kids = VGroup(Circle(radius=0.22, fill_color=ORANGE, fill_opacity=1, stroke_width=0), Circle(radius=0.22, fill_color=ORANGE, fill_opacity=1, stroke_width=0)).arrange(RIGHT, buff=0.2).next_to(buses, RIGHT, buff=0.7)
        left = say("2 left", size=26, color=ORANGE).next_to(kids, DOWN, buff=0.2)
        self.play(FadeIn(kids, scale=1.5), FadeIn(left), run_time=0.8)
        eq = say("50 ÷ 12 = 4 r 2", size=40).to_edge(DOWN, buff=0.7)
        self.play(FadeIn(eq), run_time=0.6)
        self.until("divide")

        # 4. The mistake: stopping at 4.
        four = say("4 minibuses?", size=40, color=RED).to_edge(DOWN, buff=0.7)
        self.play(FadeOut(eq), FadeIn(four), run_time=0.5)
        cross = Cross(four, stroke_color=RED, stroke_width=8)
        self.at("mistake", 3.0)
        self.play(Create(cross), run_time=0.5)
        self.until("mistake")

        # 5. Round up: a fifth minibus.
        fifth = bus(2, extra=True).next_to(buses, RIGHT, buff=0.35)
        five = say("4 full + 1 more = 5 minibuses", size=36, color=GREEN).to_edge(DOWN, buff=0.7)
        self.play(FadeOut(VGroup(four, cross, left)), FadeIn(fifth, shift=LEFT * 0.4), FadeOut(kids), run_time=1.0)
        self.play(FadeIn(five), run_time=0.6)
        self.until("up")

        # 6. Round down: packs of pens.
        self.play(FadeOut(VGroup(buses, fifth, five, q)), run_time=0.5)
        q2 = say("50 pens, packs of 12", size=34).next_to(title, DOWN, buff=0.5)
        packs = VGroup(*[VGroup(RoundedRectangle(width=1.95, height=1.25, corner_radius=0.15, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), pens(12, BLUE)) for _ in range(4)]).arrange(RIGHT, buff=0.3).shift(LEFT * 0.9)
        for p in packs:
            p[1].move_to(p[0])
        loose = pens(2, ORANGE).next_to(packs, RIGHT, buff=0.9)
        self.play(FadeIn(q2), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(p, scale=0.8) for p in packs], lag_ratio=0.3), FadeIn(loose), run_time=2.0)
        down = say("4 full packs: round down", size=36, color=BLUE).to_edge(DOWN, buff=0.7)
        self.at("down", 8.0)
        self.play(FadeIn(down), run_time=0.6)
        self.until("down")

        # 7. The remainder is the answer.
        ring = Circle(radius=0.75, stroke_color=GREEN, stroke_width=6).move_to(loose)
        lo = say("Left over: the remainder, 2", size=36, color=GREEN).to_edge(DOWN, buff=0.7)
        self.play(FadeOut(down), packs.animate.set_opacity(0.4), Create(ring), FadeIn(lo), run_time=1.0)
        self.until("left")

        # 8. The rule.
        self.play(FadeOut(VGroup(packs, loose, ring, lo, q2, title)), run_time=0.5)
        card = RoundedRectangle(width=11.6, height=3.8, corner_radius=0.4, fill_color="#FFFFFF", fill_opacity=1, stroke_color=BLUE, stroke_width=5)
        lines = VGroup(say("Divide, then ask what the remainder means:", size=30), say("Everyone needs a place?  Round up", size=30, color=BLUE), say("Only full ones count?  Round down", size=30, color=ORANGE), say("How many left over?  The remainder", size=30, color=GREEN)).arrange(DOWN, aligned_edge=LEFT, buff=0.3).move_to(card)
        head = say("The rule", size=40, color=BLUE).next_to(card, UP, buff=0.3)
        self.play(FadeIn(card), FadeIn(head), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(x, shift=RIGHT * 0.3) for x in lines], lag_ratio=0.6), run_time=3.0)
        self.until("rule")

        # 9. Your turn: 26 eggs, boxes of 6.
        self.play(FadeOut(VGroup(card, lines, head)), run_time=0.5)
        yt = say("Your turn!", size=40, color=BLUE).to_edge(UP, buff=0.5)
        ask = say("26 eggs, boxes of 6. How many boxes?", size=36).next_to(yt, DOWN, buff=0.4)
        self.play(FadeIn(yt), FadeIn(ask), run_time=0.8)
        bub = think().move_to(DOWN * 0.6)
        self.at("your-turn", 4.6)
        self.play(FadeIn(bub, scale=0.6), run_time=0.4)
        self.at("your-turn", 7.0)
        self.play(FadeOut(bub), run_time=0.3)
        work = VGroup(say("26 ÷ 6 = 4 r 2", size=36), say("The 2 eggs need a box too", size=34, color=ORANGE), say("5 boxes", size=40, color=GREEN)).arrange(DOWN, buff=0.35).move_to(DOWN * 1.0)
        self.play(LaggedStart(*[FadeIn(x) for x in work], lag_ratio=0.9), run_time=4.0)
        self.until("your-turn")

        # 10. Recap.
        self.play(FadeOut(VGroup(yt, ask, work)), run_time=0.5)
        recap = VGroup(say("Divide first", size=38, color=BLUE), say("Ask what the remainder means", size=38, color=ORANGE), say("Check it makes sense", size=38, color=GREEN)).arrange(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(x, scale=0.8) for x in recap], lag_ratio=0.5), run_time=2.2)
        self.until("recap")
