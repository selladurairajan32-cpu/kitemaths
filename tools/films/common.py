"""Shared pieces for the explanation films (D-041): palette, text helpers and a scene timed by its script.

Each film is a Manim scene that reads its script (tools/films/scripts/<concept>.json, exported from the app's
explanation script) and ends each part on its cue's end time with `until(cue)`, so the voice, the captions and the
picture line up. Plain Text, not LaTeX, so it runs without a TeX install.
"""
import json
from pathlib import Path

from manim import BOLD, DOWN, LEFT, RIGHT, Line, Scene, Text, VGroup, config

ROOT = Path(__file__).resolve().parent
SCRIPTS = ROOT / "scripts"

config.background_color = "#F6F8FD"
INK = "#1B2559"
INK2 = "#3A4466"
BLUE = "#2563EB"
ORANGE = "#F4623A"
GREEN = "#167A4B"
RED = "#D9433A"
FONT = "DejaVu Sans"


def frac(n, d, color=INK, size=48):
    """A fraction drawn as two numbers and a bar."""
    top = Text(str(n), font=FONT, color=color, weight=BOLD).scale(size / 48)
    bot = Text(str(d), font=FONT, color=color, weight=BOLD).scale(size / 48)
    bar = Line(LEFT, RIGHT, color=color, stroke_width=5).set_width(max(top.width, bot.width) + 0.25)
    return VGroup(top, bar, bot).arrange(DOWN, buff=0.12)


def say(text, size=34, color=INK):
    """Bold text at a size given in points of a 48-point base."""
    return Text(text, font=FONT, color=color, weight=BOLD).scale(size / 48)


class ScriptScene(Scene):
    """A film scene timed by its script. Subclasses set `concept` and call `until(cue_id)` after each part."""

    concept = ""

    def setup(self):
        data = json.loads((SCRIPTS / f"{self.concept}.json").read_text())
        self.cues = {c["id"]: c for c in data["cues"]}

    def until(self, cue_id):
        """Waits until the cue ends. Fails if the animation for it ran longer than the cue."""
        end = self.cues[cue_id]["end"]
        left = end - self.renderer.time
        if left < -0.05:
            raise RuntimeError(f"{self.concept}: the animation for '{cue_id}' runs {-left:.2f} s past its cue")
        if left > 0.01:
            self.wait(left)
