# MM-008: Evaluation of Vedic Maths candidate techniques

| | |
|---|---|
| **Backlog item** | MM-008: evaluate Vedic Maths candidate techniques (R3) |
| **Status** | READY FOR QA (D-032). Not accepted. This is the delivery team's evaluation and needs educational review before acceptance. |
| **Date** | 9 November 2026 |
| **Acceptance criteria** | <ol><li>Candidate techniques such as multiplication near powers of 10, vertically-and-crosswise multiplication and selected squaring methods are individually validated.</li><li>Only suitable techniques enter the learner curriculum.</li><li>Marketing claims and unsupported historical claims are excluded.</li></ol> |

---

## 1. How each candidate was judged

Each technique had to pass three tests, in order:

1. **Accurate.** A general algebraic proof that it always gives the right answer in the range it is used for. Techniques
   that enter the curriculum are also implemented in `src/maths/strategies.ts`, where every step of every example and of
   thousands of generated cases is recomputed with BigInt arithmetic (`src/maths/strategies.test.ts`).
2. **Understandable.** A Year 5 or 6 child can follow *why* it works using ideas they already have (place value, the
   distributive law, squares), rather than following a digit rule they can't explain.
3. **Useful.** It does something the existing strategies don't, for numbers a KS2 child meets.

Tests 2 and 3 are judgements, not research findings. They are stated so that a reviewer can disagree with a specific reason.

## 2. The candidates

| Technique (traditional name) | Accurate? (proof) | Understandable at KS2? | Useful? | Decision |
|---|---|---|---|---|
| **Multiplying near 100** (*Nikhilam*, base 100) | Yes. For a = 100 − x and b = 100 − y: ab = 100(100 − x − y) + xy = (a − y) × 100 + xy. | Yes in Year 6, when written as two shortfalls and an adjustment, with the ×100 shown as its own step | Yes: makes products like 97 × 96 manageable, and practises the distributive law | **Accepted**, for both numbers 90–99 only, Year 6 (`near-hundred`). The boundary is taught: far from 100 the shortfalls get large. |
| **Squaring numbers ending in 5** (*Ekadhikena Purvena*) | Yes. (10n + 5)² = 100n² + 100n + 25 = 100 × n(n + 1) + 25. | Yes, once square numbers are known (Y5.MD.8): the proof uses only expanding brackets as areas | Yes: links square numbers to a pattern, with a clear boundary | **Accepted** for 15² to 95², Years 5–6 (`square-ending-5`). The lesson teaches that it only works for numbers ending in 5 ("34² is not 3 × 4 then 25"). |
| **Vertically and crosswise** (*Urdhva-Tiryagbhyam*), two digits by two digits | Yes. (10a + b)(10c + d) = 100ac + 10(ad + bc) + bd. | Partly. It is the grid method with the partial products added in a different order. The middle term needs carrying that a child can't see. | Low: it repeats the grid and long multiplication methods children already learn (Y4.MD.5, Y5.MD.4), with less visible structure | **Added as an optional 11+ extension (D-033)**, not part of the curriculum skills: its own lesson, labelled optional, says the grid method always works instead (`crosswise`). |
| **All from 9 and the last from 10** (subtracting from a power of 10) | Yes. For a three-digit n, 1,000 − n = (999 − n) + 1, and 999 − n subtracts each digit from 9 with no exchange. | Yes, but children tend to learn the digit rule without the reason | Low: counting up and bonds to 100 and 1,000 (`count-up`, `bridge-10`) do the same job with place value visible | **Not included.** |
| **Squaring near a base** (*Yavadunam*), such as 104² or 48² | Yes. (b + x)² = b(b + 2x) + x². | Hard: needs the square of the difference and an adjustment, and goes wrong easily when x² has more digits than the base allows | Low for KS2 | **Not included.** |

## 3. Claims left out (AC3)

- **No historical claim.** The app and the documents do not say where or when these methods began, or that they come
  from the Vedas. The origin of the techniques taught as "Vedic Mathematics" is disputed, and nothing here depends on it.
  In the app they are named by what they do ("Multiply near 100", "Square a number ending in 5"), not by a Sanskrit
  title.
- **No speed or performance claim.** The app never says these methods are faster, or that they improve results. No such
  evidence has been measured for this product (MM-001 AC2).
- **No claim that they replace standard methods.** Each accepted technique has a "When not to use it" step, and the
  lessons say a standard written method is always a good choice when no shortcut fits.

## 4. Proposals for Product Owner review

| Proposal | Value | Where |
|---|---|---|
| The one-minute challenge opens after | 10 untimed mental-maths answers with at least 80% right (`TIMED_UNLOCK`); confirmed in D-033 | MM-011, `src/engine/strategyStats.ts` |
| Vertically and crosswise as an optional 11+ extension | Built as decided in D-033 | §2 |
