"""Film: adding fractions with different denominators, 1/3 + 1/4 = 7/12, taught with pizzas (D-041, D-043).

Timed by scripts/add-different.json: a question with time to think, the common mistake, same-size slices, counting
together, the rule, a "your turn" (1/6 + 1/3 = 1/2) and a recap.
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, FONT, GREEN, INK, INK2, ORANGE, RED, ScriptScene, frac, say  # noqa: E402
from manim import (DOWN, LEFT, PI, RIGHT, TAU, UP, Circle, Circumscribe, Create, Cross, Dot, Ellipse, FadeIn,  # noqa: E402
                   FadeOut, Indicate, LaggedStart, Rectangle, RoundedRectangle, Sector, Text, Transform, VGroup, Write)

CRUST = "#E8A24A"
CHEESE = "#F9D57A"
PEPPERONI = "#C8412E"
EMPTY = "#EEF2FA"


def slice_(n, k, shaded, outline, r=1.55):
    """Slice k of a pizza cut into n, starting at 12 o'clock and going clockwise."""
    angle = TAU / n
    start = PI / 2 - (k + 1) * angle
    s = Sector(radius=r, start_angle=start, angle=angle, fill_color=CHEESE if shaded else EMPTY, fill_opacity=1, stroke_color=outline if shaded else "#C9D2E6", stroke_width=4 if shaded else 2.5)
    group = VGroup(s)
    if shaded and n <= 4:
        mid = start + angle / 2
        for f, dr in ((0.62, 0.0), (0.4, 0.18)):
            if angle > 0.45 or f == 0.62:
                group.add(Dot(point=[r * f * math.cos(mid + dr * angle), r * f * math.sin(mid + dr * angle), 0], radius=0.11 if n <= 4 else 0.08, color=PEPPERONI))
    return group


def pizza(n, shaded, outline, r=1.55):
    """A pizza cut into n equal slices; `shaded` lists the slices that are there (eaten)."""
    slices = VGroup(*[slice_(n, k, k in shaded, outline, r) for k in range(n)])
    rim = Circle(radius=r, stroke_color=INK, stroke_width=5)
    return VGroup(slices, rim)


def think_bubble():
    cloud = VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4),
                   Circle(radius=0.14, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=3).shift(DOWN * 0.85 + LEFT * 0.9),
                   Circle(radius=0.08, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=3).shift(DOWN * 1.15 + LEFT * 1.2))
    return VGroup(cloud, say("Think!", size=34))


class Film(ScriptScene):
    concept = "add-different"

    def construct(self):
        # 1. The question.
        title = say("Adding fractions with different denominators", size=34).to_edge(UP, buff=0.4)
        sam = pizza(3, [0], BLUE).shift(LEFT * 4.3 + UP * 0.35)
        zara = pizza(4, [0], ORANGE).shift(RIGHT * 4.3 + UP * 0.35)
        sam_l = VGroup(say("Sam", size=30, color=BLUE), frac(1, 3, BLUE, 36)).arrange(DOWN, buff=0.15).next_to(sam, DOWN, buff=0.3)
        zara_l = VGroup(say("Zara", size=30, color=ORANGE), frac(1, 4, ORANGE, 36)).arrange(DOWN, buff=0.15).next_to(zara, DOWN, buff=0.3)
        q = VGroup(frac(1, 3, BLUE, 40), Text("+", font=FONT, color=INK), frac(1, 4, ORANGE, 40), Text("=", font=FONT, color=INK), Text("?", font=FONT, color=INK)).arrange(RIGHT, buff=0.3).move_to(UP * 0.35)
        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(sam, scale=0.8), FadeIn(sam_l), run_time=1)
        self.play(FadeIn(zara, scale=0.8), FadeIn(zara_l), run_time=1)
        self.play(FadeIn(q, shift=UP * 0.2), run_time=0.8)
        self.until("hook")

        # 2. Think!
        bubble = think_bubble().move_to(UP * 1.9)
        self.at("predict", 2.2)
        self.play(FadeIn(bubble, scale=0.6), run_time=0.4)
        self.until("predict")
        self.play(FadeOut(bubble), run_time=0.3)

        # 3. The mistake.
        wrong = VGroup(frac(1, 3, BLUE, 40), Text("+", font=FONT, color=INK), frac(1, 4, ORANGE, 40), Text("=", font=FONT, color=INK), frac(2, 7, RED, 40)).arrange(RIGHT, buff=0.3).move_to(q)
        self.play(Transform(q, wrong), run_time=0.8)
        cross = Cross(q[-1], stroke_color=RED, stroke_width=8)
        self.at("mistake", 3.0)
        self.play(Create(cross), run_time=0.5)
        note = say("2/7 is smaller than 1/3 on its own!", size=30, color=RED).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(note), run_time=0.6)
        self.until("mistake")
        self.play(FadeOut(VGroup(q, cross, note)), run_time=0.5)

        # 4. Different sizes.
        big = say("big slice", size=28, color=BLUE).next_to(sam, UP, buff=0.25)
        small = say("smaller slice", size=28, color=ORANGE).next_to(zara, UP, buff=0.25)
        self.play(Indicate(sam[0][0], color=BLUE, scale_factor=1.12), FadeIn(big), run_time=1.4)
        self.play(Indicate(zara[0][0], color=ORANGE, scale_factor=1.12), FadeIn(small), run_time=1.4)
        diff = say("Different sizes: we can't count them together yet", size=30, color=INK2).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(diff), run_time=0.6)
        self.until("slices")
        self.play(FadeOut(VGroup(big, small, diff)), run_time=0.4)

        # 5. Cut into twelfths.
        rule = say("3 × 4 = 12", size=40).move_to(UP * 2.4)
        self.play(FadeOut(title), FadeIn(rule), run_time=0.6)
        sam12 = pizza(12, [0, 1, 2, 3], BLUE).move_to(sam)
        zara12 = pizza(12, [0, 1, 2], ORANGE).move_to(zara)
        self.at("trick", 5.0)
        self.play(Transform(sam, sam12), run_time=1.6)
        self.play(Transform(zara, zara12), run_time=1.6)
        tw = say("twelfths", size=32).next_to(rule, DOWN, buff=0.2)
        self.play(FadeIn(tw), run_time=0.5)
        self.until("trick")

        # 6. Count together.
        nums = VGroup()
        for group, count, color, off in ((sam, 4, BLUE, 2.4), (zara, 3, ORANGE, 6.4)):
            centre = group.get_center()
            self.at("count", off - 1.6)
            for k in range(count):
                mid = PI / 2 - (k + 0.5) * TAU / 12
                n = Text(str(k + 1), font=FONT, color=INK).scale(0.5).move_to(centre + [1.9 * math.cos(mid), 1.9 * math.sin(mid), 0])
                nums.add(n)
                self.play(FadeIn(n, scale=1.6), run_time=0.35)
        self.play(Transform(sam_l[1], frac(4, 12, BLUE, 36).move_to(sam_l[1])), Transform(zara_l[1], frac(3, 12, ORANGE, 36).move_to(zara_l[1])), run_time=0.8)
        self.until("count")

        # 7. Put the slices together.
        whole = pizza(12, [], INK).move_to(UP * 0.35)
        self.play(FadeOut(VGroup(nums, rule, tw)), FadeIn(whole), run_time=0.6)
        moved = VGroup()
        for k in range(7):
            src = sam if k < 4 else zara
            idx = k if k < 4 else k - 4
            piece = slice_(12, k, True, BLUE if k < 4 else ORANGE).shift(whole.get_center())
            start = src[0][idx].copy()
            self.add(start)
            self.play(Transform(start, piece), run_time=0.45)
            moved.add(start)
        # The slices have moved: what is left of the two pizzas fades back.
        self.play(sam.animate.set_opacity(0.25), zara.animate.set_opacity(0.25), run_time=0.4)
        total = VGroup(frac(4, 12, BLUE, 36), Text("+", font=FONT, color=INK), frac(3, 12, ORANGE, 36), Text("=", font=FONT, color=INK), frac(7, 12, GREEN, 42)).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.35)
        self.play(FadeOut(VGroup(sam_l, zara_l)), FadeIn(total, shift=UP * 0.2), run_time=0.8)
        self.play(Circumscribe(total[-1], color=GREEN, buff=0.15), run_time=1.1)
        self.until("add")

        # 8. The rule.
        self.play(FadeOut(VGroup(sam, zara, whole, moved, total)), run_time=0.6)
        card = RoundedRectangle(width=11.5, height=3.6, corner_radius=0.4, fill_color="#FFFFFF", fill_opacity=1, stroke_color=BLUE, stroke_width=5)
        lines = VGroup(
            say("1.  Make the slices the same size", size=32),
            say("2.  Add the tops", size=32),
            say("3.  The bottom number stays the same", size=32, color=GREEN),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to(card)
        head = say("The rule", size=40, color=BLUE).next_to(card, UP, buff=0.3)
        self.play(FadeIn(card), FadeIn(head), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(x, shift=RIGHT * 0.3) for x in lines], lag_ratio=0.6), run_time=3)
        self.until("rule")

        # 9. Your turn: 1/6 + 1/3 = 3/6 = 1/2.
        self.play(FadeOut(VGroup(card, lines, head)), run_time=0.5)
        yt = say("Your turn!", size=40, color=BLUE).to_edge(UP, buff=0.5)
        ask = VGroup(frac(1, 6, BLUE, 44), Text("+", font=FONT, color=INK), frac(1, 3, ORANGE, 44), Text("=", font=FONT, color=INK), Text("?", font=FONT, color=INK)).arrange(RIGHT, buff=0.3).next_to(yt, DOWN, buff=0.4)
        self.play(FadeIn(yt), FadeIn(ask), run_time=0.8)
        bubble = think_bubble().move_to(DOWN * 1.2)
        self.at("your-turn", 2.9)
        self.play(FadeIn(bubble, scale=0.6), run_time=0.4)
        self.at("your-turn", 5.2)
        self.play(FadeOut(bubble), run_time=0.3)

        def bar(filled):
            cells = VGroup(*[Rectangle(width=1.2, height=0.8, fill_color=(BLUE if i == 0 else ORANGE) if i < filled else "#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4) for i in range(6)]).arrange(RIGHT, buff=0)
            return cells
        b1 = bar(3).move_to(DOWN * 0.9)
        step = say("1/3 = 2/6, so 1/6 + 2/6 = 3/6", size=30).next_to(b1, DOWN, buff=0.4)
        self.play(FadeIn(b1), FadeIn(step), run_time=1)
        self.at("your-turn", 10.5)
        half = say("3/6 is the same as 1/2", size=34, color=GREEN).next_to(step, DOWN, buff=0.3)
        brace = Rectangle(width=3.6, height=0.95, stroke_color=GREEN, stroke_width=6).move_to(b1[:3])
        self.play(Create(brace), FadeIn(half), run_time=0.8)
        self.until("your-turn")

        # 10. Recap.
        self.play(FadeOut(VGroup(yt, ask, b1, step, half, brace)), run_time=0.5)
        recap = VGroup(
            say("Same size slices", size=38, color=BLUE),
            say("Add the tops", size=38, color=ORANGE),
            say("Check it makes sense", size=38, color=GREEN),
        ).arrange(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(x, scale=0.8) for x in recap], lag_ratio=0.5), run_time=2.2)
        self.until("recap")
