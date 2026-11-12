"""Film: comparing decimals, 0.4 against 0.35 (D-050).

Timed by scripts/compare-decimals.json: two bean plants and a question with time to think, the "longer is bigger"
mistake, place-value columns, the tenths compared, a zero filling the gap (0.40), two hundred squares, the rule, a turn
for the child (0.6 against 0.58) and a recap.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import BLUE, FONT, GREEN, INK, ORANGE, RED, ScriptScene, say  # noqa: E402
from manim import (DOWN, LEFT, RIGHT, UP, Circle, Create, Cross, Ellipse, FadeIn, FadeOut, Indicate, LaggedStart,  # noqa: E402
                   Line, Polygon, Rectangle, RoundedRectangle, Square, Text, VGroup)

LEAF = "#3DAE6B"
POT = "#A3361A"
SUN = "#FFF4D4"


def plant(height, color, name, value):
    pot = Polygon([-0.6, 0, 0], [0.6, 0, 0], [0.45, -0.8, 0], [-0.45, -0.8, 0], fill_color=POT, fill_opacity=1, stroke_width=0)
    stem = Line([0, 0, 0], [0, height, 0], color=LEAF, stroke_width=12)
    leaves = VGroup(
        Ellipse(width=0.6, height=0.28, fill_color=LEAF, fill_opacity=1, stroke_width=0).rotate(0.5).move_to([-0.3, height * 0.55, 0]),
        Ellipse(width=0.6, height=0.28, fill_color=LEAF, fill_opacity=1, stroke_width=0).rotate(-0.5).move_to([0.3, height * 0.8, 0]),
    )
    label = say(f"{value} m", size=36, color=color).next_to(stem, UP, buff=0.2)
    tag = say(name, size=28, color=color).next_to(pot, DOWN, buff=0.15)
    return VGroup(pot, stem, leaves, label, tag)


def table():
    """Ones . Tenths Hundredths, with Amy's and Ben's rows; returns the group and the cells by name."""
    xs = {"ones": -2.2, "point": -1.2, "tenths": -0.2, "hundredths": 1.9}
    heads = VGroup(*[say(t, size=24, color=INK).move_to([xs[k], 1.6, 0]) for k, t in (("ones", "Ones"), ("point", "."), ("tenths", "Tenths"), ("hundredths", "Hundredths"))])
    rows = {}
    for y, name, color, digits in ((0.6, "Amy", BLUE, ("0", ".", "4", None)), (-0.6, "Ben", ORANGE, ("0", ".", "3", "5"))):
        cells = {"name": say(name, size=30, color=color).move_to([-4.4, y, 0])}
        for key, d in zip(("ones", "point", "tenths", "hundredths"), digits):
            if d is not None:
                cells[key] = Text(d, font=FONT, color=INK, weight="BOLD").scale(0.9).move_to([xs[key], y, 0])
        rows[name] = cells
    group = VGroup(heads, *[v for r in rows.values() for v in r.values()])
    return group, rows, xs


def hundred(n, color):
    cells = VGroup(*[Square(side_length=0.27, fill_color=color if i < n else "#FFFFFF", fill_opacity=1, stroke_color="#C9D2E6", stroke_width=1) for i in range(100)])
    cells.arrange_in_grid(rows=10, cols=10, buff=0, flow_order="dr")
    frame = Rectangle(width=2.7, height=2.7, stroke_color=INK, stroke_width=4).move_to(cells)
    return VGroup(cells, frame)


class Film(ScriptScene):
    concept = "compare-decimals"

    def construct(self):
        # 1. The question.
        title = say("Comparing decimals", size=36).to_edge(UP, buff=0.35)
        amy = plant(2.4, BLUE, "Amy", "0.4").shift(LEFT * 3 + DOWN * 1.6)
        ben = plant(2.1, ORANGE, "Ben", "0.35").shift(RIGHT * 3 + DOWN * 1.6)
        q = say("Whose plant grew more?", size=34).shift(UP * 1.9)
        self.play(FadeIn(title), run_time=0.8)
        self.play(FadeIn(amy, shift=UP * 0.3), FadeIn(ben, shift=UP * 0.3), run_time=1.2)
        self.play(FadeIn(q), run_time=0.6)
        self.until("hook")

        # 2. Think!
        bubble = VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), say("Think!", size=34)).move_to(UP * 0.4)
        self.at("predict", 2.2)
        self.play(FadeIn(bubble, scale=0.6), run_time=0.4)
        self.until("predict")
        self.play(FadeOut(bubble), run_time=0.3)

        # 3. The mistake: "35 is bigger than 4".
        claim = say("35 > 4, so 0.35 is bigger?", size=34, color=ORANGE).move_to(UP * 1.9)
        self.play(FadeOut(q), FadeIn(claim), run_time=0.6)
        self.play(Indicate(ben, color=ORANGE, scale_factor=1.08), run_time=1.2)
        self.until("mistake")
        self.play(FadeOut(VGroup(amy, ben, claim)), run_time=0.5)

        # 4. Place-value columns.
        tab, rows, xs = table()
        self.play(FadeIn(tab[0]), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(v) for v in rows["Amy"].values()], lag_ratio=0.2), run_time=1.2)
        self.play(LaggedStart(*[FadeIn(v) for v in rows["Ben"].values()], lag_ratio=0.2), run_time=1.2)
        self.until("columns")

        # 5. Tenths first.
        box = RoundedRectangle(width=1.4, height=3.4, corner_radius=0.2, fill_color=SUN, fill_opacity=0.6, stroke_color="#F2A516", stroke_width=5).move_to([xs["tenths"], 0.5, 0]).set_z_index(-1)
        self.play(FadeIn(box), run_time=0.6)
        cmp = say("4 tenths > 3 tenths", size=36, color=GREEN).to_edge(DOWN, buff=0.7)
        self.play(Indicate(rows["Amy"]["tenths"], color=BLUE, scale_factor=1.3), Indicate(rows["Ben"]["tenths"], color=ORANGE, scale_factor=1.3), run_time=1.2)
        self.play(FadeIn(cmp), run_time=0.6)
        self.until("tenths")

        # 6. Fill the gap with a zero.
        self.play(FadeOut(box), FadeOut(cmp), run_time=0.4)
        zero = Text("0", font=FONT, color=GREEN, weight="BOLD").scale(0.9).move_to([xs["hundredths"], 0.6, 0])
        self.play(FadeIn(zero, scale=1.8), run_time=0.8)
        hund = VGroup(say("40 hundredths", size=34, color=BLUE), say(">", size=34), say("35 hundredths", size=34, color=ORANGE)).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.7)
        self.at("zero", 6.0)
        self.play(FadeIn(hund), run_time=0.8)
        self.until("zero")

        # 7. Hundred squares.
        self.play(FadeOut(VGroup(tab, zero, hund)), run_time=0.5)
        a = hundred(40, BLUE).shift(LEFT * 2.6 + UP * 0.2)
        b = hundred(35, ORANGE).shift(RIGHT * 2.6 + UP * 0.2)
        la = say("0.40: 40 squares", size=28, color=BLUE).next_to(a, DOWN, buff=0.3)
        lb = say("0.35: 35 squares", size=28, color=ORANGE).next_to(b, DOWN, buff=0.3)
        self.play(FadeIn(a), FadeIn(b), run_time=1)
        self.play(FadeIn(la), FadeIn(lb), run_time=0.6)
        win = say("Amy's plant grew more!", size=34, color=GREEN).to_edge(DOWN, buff=0.35)
        self.at("grid", 6.5)
        self.play(FadeIn(win), run_time=0.6)
        self.until("grid")

        # 8. The rule.
        self.play(FadeOut(VGroup(a, b, la, lb, win, title)), run_time=0.5)
        card = RoundedRectangle(width=11, height=3.4, corner_radius=0.4, fill_color="#FFFFFF", fill_opacity=1, stroke_color=BLUE, stroke_width=5)
        lines = VGroup(say("1.  Line up the decimal points", size=32), say("2.  Fill any gaps with zeros", size=32), say("3.  Compare from the left", size=32, color=GREEN)).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to(card)
        head = say("The rule", size=40, color=BLUE).next_to(card, UP, buff=0.3)
        self.play(FadeIn(card), FadeIn(head), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(x, shift=RIGHT * 0.3) for x in lines], lag_ratio=0.6), run_time=2.6)
        self.until("rule")

        # 9. Your turn: 0.6 against 0.58.
        self.play(FadeOut(VGroup(card, lines, head)), run_time=0.5)
        yt = say("Your turn!", size=40, color=BLUE).to_edge(UP, buff=0.5)
        ask = say("Which is bigger: 0.6 or 0.58?", size=38).next_to(yt, DOWN, buff=0.4)
        self.play(FadeIn(yt), FadeIn(ask), run_time=0.8)
        think = VGroup(Ellipse(width=2.6, height=1.2, fill_color="#FFFFFF", fill_opacity=1, stroke_color=INK, stroke_width=4), say("Think!", size=34)).move_to(DOWN * 0.6)
        self.at("your-turn", 4.2)
        self.play(FadeIn(think, scale=0.6), run_time=0.4)
        self.at("your-turn", 6.6)
        self.play(FadeOut(think), run_time=0.3)
        work = VGroup(say("0.6 = 0.60 = 60 hundredths", size=34, color=BLUE), say("60 > 58, so 0.6 is bigger", size=34, color=GREEN)).arrange(DOWN, buff=0.4).move_to(DOWN * 0.8)
        self.play(FadeIn(work[0]), run_time=0.8)
        self.at("your-turn", 11.5)
        self.play(FadeIn(work[1]), run_time=0.8)
        self.until("your-turn")

        # 10. Recap.
        self.play(FadeOut(VGroup(yt, ask, work)), run_time=0.5)
        recap = VGroup(say("Longer isn't always bigger", size=38, color=ORANGE), say("Fill gaps with zeros", size=38, color=BLUE), say("Compare the tenths first", size=38, color=GREEN)).arrange(DOWN, buff=0.45)
        self.play(LaggedStart(*[FadeIn(x, scale=0.8) for x in recap], lag_ratio=0.5), run_time=2.2)
        self.until("recap")
