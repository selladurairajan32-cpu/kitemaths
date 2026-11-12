# Explanation films and voices (D-041)

Every explanation page offers three ways to learn: **Watch** (a narrated film), **Step through** (an animated picture
with a voice for each step) and **Try it**. One script per concept drives all three:

- the script is TypeScript, beside its page (for example
  `src/topics/fractions-2/explain/addDifferentScript.ts`), listed in `src/topics/kit/explainScripts.ts`;
- `src/topics/kit/explainScripts.test.ts` checks every script (each line has time to be spoken) and exports a copy to
  `tools/films/scripts/<concept>.json`;
- `build.py` renders the film from `scenes/<concept>.py`, timed by that copy, records the voice, and writes
  `public/films/<concept>/film.mp4`, `poster.jpg` and `public/voice/<concept>/<beat>.mp3`.

Development only: nothing here runs in CI or ships in the app bundle. The test fails if a film, poster or step voice
is missing.

## Steps

```bash
python3 -m venv .venv && .venv/bin/pip install -r tools/films/requirements.txt   # needs ffmpeg and Pango (manimpango)
UPDATE_DOCS=1 npx vitest run src/topics/kit/explainScripts.test.ts              # after changing a script
.venv/bin/python tools/films/build.py add-different                              # one concept
.venv/bin/python tools/films/build.py --samples                                  # one line in each voice
```

`build.py` stops with an error if any recorded line is longer than its time in the script, or a scene's animation runs
past its cue. Voice models download on first use into `tools/films/voices/` (not committed).

## New concept

1. Write the script (story beats and film cues) and add it to `explainScripts.ts` and `explanationIndex.ts`.
2. Export it (`UPDATE_DOCS=1 …`), then write `scenes/<concept with _>.py`: a `Film(ScriptScene)` that calls
   `self.until("<cue id>")` at the end of each part.
3. Run `build.py <concept>`, look at a few frames, and commit the media with the code.

## Voices and licences

| Voice | Model | Training data | Licence |
|---|---|---|---|
| **cori** (default) | `en_GB-cori-high` | Cori Samuel's LibriVox readings | Public domain |
| alba | `en_GB-alba-medium` | Alba, CSTR, University of Edinburgh | CC BY 4.0: credit the dataset |
| male | `en_GB-vctk-medium`, speaker p232 | VCTK corpus, CSTR, University of Edinburgh | CC BY 4.0: credit the dataset |

Piper (the speech engine) and Manim are MIT licensed. Voices with non-commercial or unclear terms (for example
`semaine`, `jenny_dioco`, `alan`) and share-alike ones (`southern_english_female`, `northern_english_male`) are not used.

## Hosting

Films are served from `public/films` while there are few (about 2 MB each). When they grow, move them to a storage
bucket (Cloudflare R2 has no bandwidth fees) and set `NEXT_PUBLIC_FILMS_BASE_URL`; the player reads it.
