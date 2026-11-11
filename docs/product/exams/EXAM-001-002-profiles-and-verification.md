# EXAM-001 and EXAM-002: Exam profiles and how they are verified

| | |
|---|---|
| **Backlog items** | EXAM-001 (exam-profile data model) and EXAM-002 (exam-format research and verification workflow), R5 |
| **Status** | READY FOR QA (D-032; profiles added under D-037). Not accepted. |
| **Date** | 9 November 2026 |
| **Code** | `src/engine/examProfile.ts` (model, validation, change log); tests in `src/engine/exams.test.ts` |

---

## 1. What a profile records (EXAM-001)

One profile per school, consortium or area, for one admissions cycle (for example "2027 entry"). Each exam fact is a
`Known<T>`: either **verified**, with its source, or **unknown**, with an optional note. There are no defaults: an
unknown timing never borrows a "typical" one.

| Field | Meaning |
|---|---|
| `subjects` | The subjects tested |
| `provider` | Who sets the test |
| `questionFormats` | Multiple choice, standard (written answers) or mixed |
| `mathsMinutes` | The time allowed for the maths section |
| `calculators` | Whether calculators are allowed, where officially stated |
| `admissionsYear` | The admissions cycle the profile describes |
| `sourceDate` | The latest retrieval date among its verified facts, or none |
| `changes` | A dated log of every change, with the source of the new value |

A verified fact's source records the **URL** (https), the **publisher** (school, council or consortium), the
**profile it is about**, the **retrieval date** and, ideally, the **words relied on**.

## 2. Verification rules (EXAM-002)

`validateProfile` enforces these; a profile that fails is not used.

1. **Official sources first.** A fact is verified only from a page or document published by the school, the council or
   the consortium. Tutoring sites, forums and practice-paper sellers are not sources.
2. **No inference from nearby schools.** A source records which profile it is about, and it can only verify that
   profile. A neighbouring school's format can't be copied in, even if the two schools usually use the same test.
3. **Dated changes.** Every change goes through `recordChange`, which logs the date, the old and new values and the new
   source, and keeps `sourceDate` current.
4. **Unknown stays unknown.** If the official information doesn't say, the field is unknown, and the app says so.

## 3. Workflow for adding or updating a profile

1. Find the official admissions page for the school or consortium for the cycle in question.
2. For each field, quote the sentence that states it, and record the URL, publisher and today's date.
3. Leave any field that isn't stated as unknown, with a note where useful ("not stated on the 2027 admissions page").
4. Add the profile to the data and run the tests: `validateProfile` must return no problems.
5. Before each admissions cycle, re-check every verified fact, and record any change with `recordChange`.

## 4. What the app ships today

Updated 11 November 2026 (D-037, CH-065). The app ships **five profiles**. Each verified fact quotes the provider's own
public page, read on 10 November 2026; the quotes and URLs are in
[`evidence/official-sources-2026-11-10.md`](evidence/official-sources-2026-11-10.md). Anything those pages don't state
is **unknown**, and the mock uses the child's own setting for it.

| Profile (id) | Subjects | Provider | Question format | Maths timing | Calculators |
|---|---|---|---|---|---|
| General 11+ practice (`general`) | unknown | unknown | unknown | unknown | unknown |
| ISEB Common Pre-Tests (`iseb`) | English, mathematics, verbal reasoning, non-verbal reasoning | ISEB | multiple choice | 40 minutes | unknown |
| GL Assessment, general (`gl`) | unknown | GL Assessment | multiple choice | unknown (GL says timings may differ) | unknown |
| CSSE, Essex (`csse`) | English, Mathematics | CSSE | unknown | 60 minutes | unknown |
| SEAG, Northern Ireland (`seag`) | English (or Gaeilge), Mathematics | SEAG | unknown | unknown | unknown |

**Not included.** There is no CEM profile: no official CEM page could be read (the page tried returned an error), so
nothing about CEM-style tests is claimed. There is no AQE profile either. GL's local tests are run by many different
areas; the GL profile states only what GL says about its tests in general.

**What the mock does with a profile** (EXAM-005): a verified timing replaces the child's choice; a verified
multiple-choice format makes the mock multiple choice (the 5-option answer sheet counts as multiple choice). The
answer sheet, two-part questions and short timed sections are practice formats: none is claimed as any test's format.
Every mock carries the practice label (EXAM-005 AC4).

**Limits.** Facts can change each year; each profile needs re-reading against the provider's page before each
admissions round. The verification was a single developer read, not an independent check.
