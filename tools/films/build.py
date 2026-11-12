"""Builds an explanation's film and step voices from its script (D-041).

    python tools/films/build.py <concept> [--voice cori|alba|male] [--quality h|m|l]
    python tools/films/build.py --samples          # one sentence in each voice, to choose a voice
    python tools/films/build.py <concept> --measure  # how long each line takes to say, to set the script's timings
    python tools/films/build.py --common            # the spoken feedback lines shared by every Step through

For <concept> it:
  1. renders the Manim scene tools/films/scenes/<concept with _>.py (timed by scripts/<concept>.json);
  2. records each film cue with a Piper voice, checks it fits its cue, and lays it at the cue's start time;
  3. mixes the voice onto the film and writes public/films/<concept>/film.mp4 and poster.jpg;
  4. records each Step through beat to public/voice/<concept>/<beat>.mp3, checking it fits the beat;
  5. writes tools/films/out/<concept>-report.json.
It stops with an error if any recording is longer than its time. Development only: never run in CI or the app.
Needs Python with manim 0.19, kokoro-onnx and piper-tts (requirements.txt), ffmpeg, and the voice models (downloaded on
first use). Voice lines may hold teaching pauses, `[pause]` and `[think]` (D-043), recorded as silence.
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
OUT = HERE / "out"
VOICE_DIR = HERE / "voices"
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB"

# Voices whose training data allows commercial use (README.md). D-043: Emma (Kokoro-82M, Apache-2.0, trained only on
# permissively licensed audio) is the default, chosen by the Product Owner. The Piper voices stay as fallbacks.
VOICES = {
    "emma": {"engine": "kokoro", "voice": "bf_emma", "speed": 0.92, "credit": "Kokoro-82M (Apache-2.0), voice bf_emma"},
    "cori": {"engine": "piper", "model": "en_GB-cori-high", "path": "cori/high", "speaker": None, "length": "0.95", "credit": "Cori Samuel (LibriVox), public domain"},
    "alba": {"engine": "piper", "model": "en_GB-alba-medium", "path": "alba/medium", "speaker": None, "length": "0.95", "credit": "Alba, CSTR University of Edinburgh, CC BY 4.0"},
    "male": {"engine": "piper", "model": "en_GB-vctk-medium", "path": "vctk/medium", "speaker": "p232", "length": "1.45", "credit": "VCTK corpus speaker p232, CSTR University of Edinburgh, CC BY 4.0"},
}
DEFAULT_VOICE = "emma"
KOKORO = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
PAUSES = {"[pause]": 0.9, "[think]": 2.2}
GAP = 0.3  # between sentences inside one line
# D-043: short spoken feedback shared by every Step through checkpoint.
COMMON = {
    "right": "Yes! That's right. Well done.",
    "wrong": "Not quite. Let's look at it again.",
}


def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], check=True, capture_output=True, text=True)
    return float(out.stdout.strip())


def fetch(url, dest):
    if not dest.exists():
        VOICE_DIR.mkdir(parents=True, exist_ok=True)
        print(f"downloading {dest.name}")
        urllib.request.urlretrieve(url, dest)
    return dest


def piper_model(v):
    onnx = fetch(f"{HF}/{v['path']}/{v['model']}.onnx", VOICE_DIR / f"{v['model']}.onnx")
    fetch(f"{HF}/{v['path']}/{v['model']}.onnx.json", Path(f"{onnx}.json"))
    return onnx


_kokoro = None


def kokoro():
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro
        _kokoro = Kokoro(str(fetch(f"{KOKORO}/kokoro-v1.0.onnx", VOICE_DIR / "kokoro-v1.0.onnx")), str(fetch(f"{KOKORO}/voices-v1.0.bin", VOICE_DIR / "voices-v1.0.bin")))
    return _kokoro


def segments(text):
    """Splits a voice line into spoken parts and pauses: [("say", text) | ("pause", seconds)]."""
    out = []
    for part in re.split(r"(\[pause\]|\[think\])", text):
        part = part.strip()
        if part in PAUSES:
            out.append(("pause", PAUSES[part]))
        elif part:
            out.append(("say", part))
    return out


def speak(text, wav, voice):
    """Records one voice line to a WAV file, with its teaching pauses as silence."""
    import numpy as np
    import soundfile as sf
    v = VOICES[voice]
    parts, rate = [], 24000
    for kind, value in segments(text):
        if kind == "pause":
            parts.append(np.zeros(int(rate * value), dtype=np.float32))
            continue
        if v["engine"] == "kokoro":
            audio, rate = kokoro().create(value, voice=v["voice"], speed=v["speed"], lang="en-gb")
        else:
            with tempfile.TemporaryDirectory() as t:
                tmp = Path(t) / "p.wav"
                cmd = [sys.executable, "-m", "piper", "-m", str(piper_model(v)), "--length-scale", v["length"], "-f", str(tmp)]
                if v["speaker"] is not None:
                    cmd += ["-s", str(json.loads(Path(f"{piper_model(v)}.json").read_text())["speaker_id_map"][v["speaker"]])]
                run(cmd, input=value.encode(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                audio, rate = sf.read(tmp, dtype="float32")
        parts += [np.asarray(audio, dtype=np.float32), np.zeros(int(rate * GAP), dtype=np.float32)]
    if parts and kind != "pause":
        parts.pop()  # no gap after the last words
    sf.write(wav, np.concatenate(parts), rate)


def render(concept, quality):
    scene = HERE / "scenes" / f"{concept.replace('-', '_')}.py"
    media = OUT / "media"
    run([sys.executable, "-m", "manim", f"-q{quality}", "--fps", "30", "--media_dir", str(media), "--disable_caching", str(scene), "Film"])
    found = sorted(media.glob(f"videos/{scene.stem}/*/Film.mp4"), key=lambda p: p.stat().st_mtime)
    if not found:
        sys.exit(f"no rendered film for {concept}")
    return found[-1]


def build(concept, voice, quality):
    script = json.loads((HERE / "scripts" / f"{concept}.json").read_text())
    films = REPO / "public" / "films" / concept
    voices = REPO / "public" / "voice" / concept
    films.mkdir(parents=True, exist_ok=True)
    voices.mkdir(parents=True, exist_ok=True)
    report = {"concept": concept, "voice": voice, "credit": VOICES[voice]["credit"], "cues": [], "beats": []}
    length = script["cues"][-1]["end"]
    silent = render(concept, quality)
    report["film_seconds"] = round(duration(silent), 2)
    if report["film_seconds"] < length - 0.1:
        sys.exit(f"{concept}: the film is {report['film_seconds']} s but the script needs {length} s")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        inputs, delays = [], []
        for i, c in enumerate(script["cues"]):
            wav = tmp / f"cue{i}.wav"
            speak(c["say"], wav, voice)
            d = duration(wav)
            room = c["end"] - c["start"]
            report["cues"].append({"id": c["id"], "speech": round(d, 2), "room": room})
            if d > room - 0.1:
                sys.exit(f"{concept}: cue '{c['id']}' takes {d:.2f} s to say but has {room} s")
            inputs += ["-i", str(wav)]
            delays.append(int(c["start"] * 1000))
        filt = "".join(f"[{i + 1}:a]adelay={ms}|{ms}[d{i}];" for i, ms in enumerate(delays))
        mix = "".join(f"[d{i}]" for i in range(len(delays)))
        film = films / "film.mp4"
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(silent), *inputs, "-filter_complex",
             f"{filt}{mix}amix=inputs={len(delays)}:normalize=0,apad,loudnorm=I=-16:TP=-1.5,aresample=44100[a]",
             "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", str(film)])
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{length * 0.62:.2f}", "-i", str(film), "-frames:v", "1", "-q:v", "4", str(films / "poster.jpg")])
        report["film_bytes"] = film.stat().st_size

        for b in script["beats"]:
            wav = tmp / f"{b['id']}.wav"
            speak(b["say"], wav, voice)
            d = duration(wav)
            report["beats"].append({"id": b["id"], "speech": round(d, 2), "room": b["seconds"]})
            if d > b["seconds"] - 0.2:
                sys.exit(f"{concept}: beat '{b['id']}' takes {d:.2f} s to say but lasts {b['seconds']} s")
            run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "24000", "-b:a", "48k", str(voices / f"{b['id']}.mp3")])
    OUT.mkdir(exist_ok=True)
    (OUT / f"{concept}-report.json").write_text(json.dumps(report, indent=1))
    print(json.dumps({k: report[k] for k in ("concept", "voice", "film_seconds", "film_bytes")}))


def measure(concept, voice):
    """Prints how long each film cue and step takes to say, against the time the script gives it."""
    script = json.loads((HERE / "scripts" / f"{concept}.json").read_text())
    with tempfile.TemporaryDirectory() as tmp:
        for kind, items in (("cue", script["cues"]), ("beat", script["beats"])):
            for x in items:
                wav = Path(tmp) / "m.wav"
                speak(x["say"], wav, voice)
                room = (x["end"] - x["start"]) if kind == "cue" else x["seconds"]
                d = duration(wav)
                print(f"{kind:4} {x['id']:14} speech {d:5.2f} s  room {room:5.2f} s  {'OK' if d <= room - (0.1 if kind == 'cue' else 0.2) else 'TOO LONG'}")


def common(voice):
    out = REPO / "public" / "voice" / "common"
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for name, line in COMMON.items():
            wav = Path(tmp) / f"{name}.wav"
            speak(line, wav, voice)
            run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "24000", "-b:a", "48k", str(out / f"{name}.mp3")])
            print(out / f"{name}.mp3")


def samples():
    out = OUT / "samples"
    out.mkdir(parents=True, exist_ok=True)
    line = "Thirds and quarters are different sizes. Cut both into twelfths: one third is four twelfths, and one quarter is three twelfths. So one third plus one quarter is seven twelfths."
    with tempfile.TemporaryDirectory() as tmp:
        for name in VOICES:
            wav = Path(tmp) / f"{name}.wav"
            speak(line, wav, name)
            run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5", "-b:a", "96k", str(out / f"voice-{name}.mp3")])
            print(out / f"voice-{name}.mp3")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("concept", nargs="?")
    p.add_argument("--voice", default=DEFAULT_VOICE, choices=sorted(VOICES))
    p.add_argument("--quality", default="h", choices=["h", "m", "l"])
    p.add_argument("--samples", action="store_true")
    p.add_argument("--measure", action="store_true")
    p.add_argument("--common", action="store_true")
    a = p.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed")
    if a.samples:
        samples()
    elif a.common:
        common(a.voice)
    elif a.concept and a.measure:
        measure(a.concept, a.voice)
    elif a.concept:
        build(a.concept, a.voice, a.quality)
    else:
        p.print_help()
