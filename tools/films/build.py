"""Builds an explanation's film and step voices from its script (D-041).

    python tools/films/build.py <concept> [--voice cori|alba|male] [--quality h|m|l]
    python tools/films/build.py --samples          # one sentence in each voice, to choose a voice

For <concept> it:
  1. renders the Manim scene tools/films/scenes/<concept with _>.py (timed by scripts/<concept>.json);
  2. records each film cue with a Piper voice, checks it fits its cue, and lays it at the cue's start time;
  3. mixes the voice onto the film and writes public/films/<concept>/film.mp4 and poster.jpg;
  4. records each Step through beat to public/voice/<concept>/<beat>.mp3, checking it fits the beat;
  5. writes tools/films/out/<concept>-report.json.
It stops with an error if any recording is longer than its time. Development only: never run in CI or the app.
Needs Python with manim 0.19 and piper-tts (requirements.txt), ffmpeg, and the voice model (downloaded on first use).
"""
import argparse
import json
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

# Voices whose training data allows commercial use. Cori: LibriVox recordings, public domain. Alba and VCTK: CC BY 4.0
# (credit the dataset). Piper itself is MIT. See README.md.
VOICES = {
    "cori": {"model": "en_GB-cori-high", "path": "cori/high", "speaker": None, "length": "0.95", "credit": "Cori Samuel (LibriVox), public domain"},
    "alba": {"model": "en_GB-alba-medium", "path": "alba/medium", "speaker": None, "length": "0.95", "credit": "Alba, CSTR University of Edinburgh, CC BY 4.0"},
    "male": {"model": "en_GB-vctk-medium", "path": "vctk/medium", "speaker": "p232", "length": "1.45", "credit": "VCTK corpus speaker p232, CSTR University of Edinburgh, CC BY 4.0"},
}
DEFAULT_VOICE = "cori"


def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)], check=True, capture_output=True, text=True)
    return float(out.stdout.strip())


def model(name):
    v = VOICES[name]
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    onnx = VOICE_DIR / f"{v['model']}.onnx"
    for f in (onnx, Path(f"{onnx}.json")):
        if not f.exists():
            print(f"downloading {f.name}")
            urllib.request.urlretrieve(f"{HF}/{v['path']}/{f.name}", f)
    return onnx


def speak(text, wav, voice):
    v = VOICES[voice]
    cmd = [sys.executable, "-m", "piper", "-m", str(model(voice)), "--length-scale", v["length"], "--sentence-silence", "0.25", "-f", str(wav)]
    if v["speaker"] is not None:
        speakers = json.loads(Path(f"{model(voice)}.json").read_text())["speaker_id_map"]
        cmd += ["-s", str(speakers[v["speaker"]])]
    run(cmd, input=text.encode(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


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
            run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "22050", "-b:a", "48k", str(voices / f"{b['id']}.mp3")])
    OUT.mkdir(exist_ok=True)
    (OUT / f"{concept}-report.json").write_text(json.dumps(report, indent=1))
    print(json.dumps({k: report[k] for k in ("concept", "voice", "film_seconds", "film_bytes")}))


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
    a = p.parse_args()
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed")
    if a.samples:
        samples()
    elif a.concept:
        build(a.concept, a.voice, a.quality)
    else:
        p.print_help()
