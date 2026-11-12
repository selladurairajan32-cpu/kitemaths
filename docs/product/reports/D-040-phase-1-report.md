# D-040 Phase 1 report: a WebGL 3D explanation page for ratio and proportion

| | |
|---|---|
| **Decision** | D-040 (12 Nov 2026): a premium redesign from reference images. Phase 1 is the topic explanation page, on ratio and proportion, in real WebGL 3D. |
| **Changes** | CH-078 to CH-081 in `DECISIONS.md` |
| **Status** | READY FOR QA. **Nothing is accepted. Not deployed:** production waits until everything, including sign-in, works end to end (D-040). |
| **Date** | 12 November 2026 |

## 1. What was built

The page lives at `/t/ratio-algebra/explain/ratio`. It is linked from the ratio lesson ("See it in 3D" step) and from
the island page.

**Header and tabs.** The tabs are Visual story, Step by step, Real-life example, Try it and Key notes. They work with
the arrow keys, and the address remembers the open tab.

**The 3D stage.** It uses three.js through React Three Fiber, on a lit round table, and tells the story in three
chapters:

| Chapter | What happens on the table |
|---|---|
| For every | Cubes drop into groups of 2 blue and 3 orange. |
| Sharing | 35 sweets glide from a heap into 7 groups of 5, then into two jars (14 and 21), then give way to a bar of five equal parts. |
| Scaling | Eggs and a milk jug scale a pancake recipe from 4 to 6 people. |

- **Interaction:** the child can drag to turn the table.
- **Labels:** drawn in the page font and colours.
- **Captions:** each beat's caption says everything the picture shows.
- **Rendering:** the stage renders only while something moves and while it is on screen.

**Playback.** Play, pause, replay, skip, a scrubber with chapter markers, and 0.75× or 1× speed.

**Chapter checkpoints.** Each chapter ends with a quick check that unlocks the next chapter. A wrong answer replays the
key beat, then asks again with a hint and offers "Show me".

**Step view.** An alternative to the animation: the same beats as a numbered sequence.

**The other tabs and sections:**
- **Step by step:** three cards.
- **Real-life example:** a slider that scales the recipe live, plus a map-scale card.
- **Try it:** share sweets by hand. The child says the group size, deals groups into jars on the 3D stage, and reads a
  share. There are three problems.
- **Key notes.**
- **Side rail:** the common mistake ("2 : 3 of 35 is not 2/3 of 35"), fading hints, and why it works.
- **Key takeaway.**
- **Final mini-checkpoint:** a real island question, marked by the island.

**Under the hood:**
- **Pure and tested:**
  - ratio maths (`maths/ratio.ts`);
  - the story machine (`engine/story.ts`);
  - the ratio story, whose captions carry every number;
  - the 3D stage layout (`stageLayout.ts`), where each sweet keeps its identity, so it glides rather than reappears.
- **Fallback:** where WebGL is missing or motion is reduced, the stage draws a 2.5D SVG picture with the same captions
  and controls.
- **Loading:** the 3D code loads only on this page, as a 244 KB gzipped chunk. `npm audit --omit=dev` found
  0 vulnerabilities.

## 2. Checks run (developer evidence)

| Check | Result |
|---|---|
| `npm test` | 595 passed, 0 failed |
| `npm run lint`, type check, `npm run build` | pass |
| `ratio-3d.cjs` at 390, 768 and 1280px | WebGL draws and changes between beats; drag turns the table; all 3 chapters and checkpoints pass, with replay and hint after a wrong answer; Try it works by keyboard; 0 axe violations on every tab; 0 console errors |
| Reduced motion | 2.5D picture, no canvas |
| Frame rate | 49 fps while gliding, at phone width with 4× CPU throttling (target 30 or more) |
| Home page | does not download the 3D code |
| 200% text | no sideways overflow at 320, 390 or 1280px |

**Corrections found and fixed:**
- At 320px with 200% text, the playback controls pushed the page 51px sideways.
- The stage did not redraw when scrolled back into view.

## 3. Limits
- **The look is a developer's judgement** against the reference images. It has had no design review.
- **The palette is Kite blue, sky and sun,** not the images' purple, because violet tokens are excluded (D-013).
- **Kip appears on other pages but not on this one;** there is no new character art (D-040).
- **Try it uses buttons and typing,** not dragging individual sweets.
- **Sound narration is not built.** Captions are always on.
- **WebGL was tested in headless Chromium only** (SwiftShader software rendering). No real tablets or phones, no screen
  reader, no children, no independent QA.
- **Only one topic has an explanation page so far.**
