# ARCH-002 — Typed question schema

| | |
|---|---|
| **Backlog item** | ARCH-002: define a typed question schema (P0, R0) |
| **Status** | READY FOR QA (D-023): failed the 6 Nov review (DEF-032 to DEF-035); corrected 6 Nov, awaiting independent retest. |
| **Date** | 5 November 2026 (sprint step 3) |
| **Acceptance criteria** | <ol><li>Questions can declare skill, year/level, difficulty, prompt, interaction type, correct answer, distractors, validation, explanation, hints, misconception tags and scoring metadata.</li><li>Invalid definitions fail validation.</li></ol> |
| **Code** | <ul><li>`src/questions/schema.ts`: the types.</li><li>`src/questions/validate.ts`: runtime validation.</li><li>`src/questions/adapt.ts`: adapters for existing data.</li><li>`src/questions/questions.test.ts`: fixtures and compatibility tests.</li></ul> |
| **Guard** | `src/architecture.test.ts` rule A7: no UI dependencies and no browser or network globals |
| **Scope** | The contract, its validation and the adapters. **Nothing in the app uses it yet**: no child-facing behaviour changes. Wiring it in (questions authored or loaded as definitions) is later, authorised work. |

## 1. Design rules

- **Plain JSON data.**
  - No functions or class instances, and no `undefined`, `NaN` or `Infinity`. The validator checks this.
  - Definitions can be stored, diffed and authored outside code, and survive a JSON round trip (tested).
- **One type per interaction.** Each interaction has its own answer, validation and scoring fields. A field from another
  interaction is rejected, for example `options` on a number entry.
- **No UI.** Pictures are described as data: a `partition`, a `number-line`, or `other` with a description. They are never
  components.
- **The maths is checked, not trusted.** The validator uses `src/maths` to check that the declared answer is right for
  the declared numbers. For example: the compare sign, the fraction of an amount, the missing number, and whether the
  target sits on a tick.
- **No invented curriculum data.** `level` is `{ years: [...] }` from verified metadata, or the explicit `"unverified"`.
  The adapters require the caller to supply it.

## 2. Common fields (every interaction)

| Backlog field | Schema field | Rules |
|---|---|---|
| Skill | `skill` | A non-empty string |
| Year / level | `level` | `{ years: [1–13, …] }` with no repeats, or `"unverified"` |
| Difficulty | `difficulty` | 1, 2 or 3 |
| Prompt | `prompt` | A non-empty string, with `**bold**` and `{n/d}` markup |
| Interaction type | `interaction` | One of the 12 below |
| Explanation | `explanation` | A non-empty string |
| Hints | `hints: string[]` | The hint ladder, gentlest first. It may be empty; entries may not be. |
| Misconception tags | `misconceptions: string[]` | Ids the question can diagnose, unique. Every tag on a distractor or trap must be listed here. |
| Scoring metadata | `scoring` | `marks` (1–100). Optional `partialCredit: "none" \| "per-part"`, but `per-part` is only for multi-select, match and explain-frame. Optional `timeLimitSeconds` for timed fluency. |
| — | `id` | Letters, digits and `. : _ -`, starting with a letter or digit. Existing ids such as `g:place-value.pv-digit:2:5` fit. |
| — | `model` (optional) | The picture the maths depends on |

## 3. Interactions: answer, distractors and validation

| Interaction | Correct answer | Distractors | Validation and equality |
|---|---|---|---|
| `choose-one` | `correctId`, one of the option ids | The other options. Each may carry a `misconception` tag (a diagnostic distractor). The correct option may not carry one. | Option ids and texts unique; at least 2 options; optional `fixedOrder` |
| `multi-select` | `correctIds: string[]`, a **set** stored as a JSON array (unique, all option ids). Right when the chosen ids are exactly these. | The options not in `correctIds` | At least 2 options; at least 1 correct id; no repeats |
| `number-entry` | `answer` (finite) | Optional `traps`: wrong values with feedback and tags. None required for free entry. | `validation.comparison` is explicit: `exact`, `round` to *places*, or `tolerance` by *absolute*. Approximate marking is never implied. `maxDecimals`: the answer must be typeable. `allowNegative`. Traps can't equal the answer or each other. |
| `fraction-entry` | `answer: { n, d }` (n ≥ 0, d > 0) | Optional fraction `traps` | **Exact fraction equality.** `acceptEquivalent` says whether 2/4 counts for 1/2. A trap that would be marked right is rejected, and so are duplicate traps (and equivalent traps when equivalent answers are accepted). Optional `ask` says which quantity of the model is named (§3.2). |
| `compare` | `answer: "<" \| "=" \| ">"` | — | The sign must be the one cross-multiplication gives |
| `shade` | `target: { n, d }` | — | Needs an equal-part `partition` model; the target must be a whole number of its parts and not more than 1; `acceptEquivalent` |
| `number-line-place` | `target`, on a 0–1 line with `intervals` gaps; the right tick is target × intervals | — | The target must sit on a tick. If a `model` is given it must be a number line with the same number of gaps, and the target must sit on its ticks. A mark already on it is allowed (§3.2). |
| `match` | `pairs`: row id → choice id, **exactly one choice per row** | The unpaired choices | Every row paired; every pair names a real row and choice; ids unique; choice texts unique |
| `missing-number` | `answer` fills the one `null` in `right` | — | Exactly one gap; the answer must make the fractions equal |
| `fraction-of` | `answer` = fraction × amount | Optional `traps` (checked exactly; duplicates rejected) | Must be a whole number, and correct |
| `explain-frame` | Each slot's `answerId` | Each slot's other options | At least one slot; slot names unique; each `answerId` is one of its slot's options |
| `counterexample` | Any pair that breaks the **named** claim: `predicate.id` is one of a fixed list, with `params.maxDenominator` | — | The predicate is a validated identifier with parameters, **never code in the data** |

### 3.1 The numeric comparison contract

One function, `numericMatches` in `src/questions/compare.ts`, answers "would this typed value be marked as the answer?".
The validator uses it for **every** answer and trap check, so there is a single rule.

| Comparison | Rule |
|---|---|
| `exact` | `value === answer` |
| `round` to *places* | **Supported only where scaling is exact:** `|value × 10^places| ≤ MAX_SAFE_INTEGER` (9,007,199,254,740,991). Beyond that, scaling loses precision (MAX_SAFE_INTEGER and MAX_SAFE_INTEGER − 1 scale to the same double at one place) or overflows to Infinity (1e308 and 1.1e308), and rounding would silently equate distinct values (DEF-037). `roundDomainError` reports such a number, `numericMatches` throws a `RangeError` for it instead of returning a boolean, and the validator rejects the answer or trap with the path and the reason. Inside the domain, both numbers are scaled by 10^places and rounded **half away from zero**, then compared. So −2.5 rounds to −3, 2.5 to 3, and −0.25 at one place to −0.3. Negative zero equals zero. The scaling uses the stored binary double: a decimal tie that isn't exactly representable follows the double (1.005 at two places scales to 100.49999999999999 and rounds to 100). |
| `tolerance` of *absolute* | `|value − answer| ≤ absolute`: **inclusive**, with **no extra allowance**. The subtraction is ordinary double arithmetic, so the boundary is exact where the values are exactly representable (|10 − 9.5| = 0.5 matches a tolerance of 0.5) and follows the doubles otherwise. |

**Consequences for traps** (`number-entry`):
- a trap the declared comparison would mark correct is rejected;
- two traps that match each other under the comparison are rejected, because the later one's feedback could never show;
- exactly equal trap values keep the message "repeats another trap". That is the generator defect DEF-028.

`tolerance` needs only finite numbers: a difference that overflows is not a match, and distinct values are never equated. `exact` has no restriction.

Whether a typed answer fits `maxDecimals` is checked exactly: the value must equal itself written to that many places
(`Number(value.toFixed(maxDecimals)) === value`). No tolerance is used.

Tests sit exactly at, just inside and just outside the boundary, for large and very small tolerances, and for negative
values (`questions.test.ts`, "numeric comparison contract").

### 3.2 Models: only what the definition states

A `model` describes the picture. The validator checks the answer against it **only where the definition says what the
answer means**. It never chooses whichever reading makes the answer pass.

- **`fraction-entry` with `ask`.** `ask` is `"shaded"`, `"unshaded"` or `"marked"`.
  - For a partition model, the answer must equal the shaded (or unshaded) parts over all parts, as a value.
  - For `"marked"`, the model must be a number line with a point, and the answer must equal point over gaps.
  - A partition used with `ask` must have equal parts.
  - Adapters set `ask` from the existing data's own meaning (`countedParts` in `evaluate.ts`): a number line asks for the
    marked point; a partition asks for the shaded parts unless the question says "unshaded". Nothing is inferred from the
    answer.
- **`fraction-entry` without `ask`.** The answer is **not checked against the model**. This is a recorded limitation, not
  a claim of consistency: a definition may validate even though its answer disagrees with the picture under some reading.
  It fails as soon as `ask` is stated and wrong.
- **`number-line-place`.** A model must be the same line (same number of gaps), with the target on its ticks. A mark
  already on the line is allowed.
- **Scaffolding is allowed.** A pre-shaded partition for `shade`, or a pre-marked number line, can be legitimate
  scaffolding. The validator doesn't ban them or interpret them; a ban would need an interaction that requires a blank model.
- **Not checked** (the data doesn't carry the meaning): `choose-one` options that are fractions written as text, and
  `match` row pictures against their paired choices. These are recorded limitations.

**Identifiers.**
- Question ids follow the strict id rule in §2.
- Local keys inside a question (option, slot, row and choice ids) may be any non-empty text of up to 64 characters with
  no outer spaces. Existing Fractions frames use option ids such as `2/6`.

**Errors.** `validateQuestion` returns every problem found, not just the first. Each has a path such as
`options[1].id` or `pairs.r2`, and a message that says what is wrong.

## 4. Compatibility with existing data

`fromFractionQuestion(q, meta)` and `fromKitQuestion(q, meta)` convert today's questions without changing them. The
caller supplies `meta.level`. They describe today's marking faithfully:
- Fractions `write-fraction` and `shade` accept equivalent answers;
- Fractions `number` compares exactly;
- kit `number` treats answers as equal to 3 decimal places (`round`, 3), as `kit/evaluate.ts` does.

**Results on 5 Nov** (`questions.test.ts`):
- **Fractions:** every practice, lesson, follow-up and assessment question converts and validates.
- **Kit islands:** practice and assessment questions, plus every template × difficulty × 20 seeds, convert and
  validate, apart from one known content defect.
  - **DEF-028:** some kit generators produce two traps with the same value. The second trap's feedback can never be
    shown, because marking uses the first match.
  - The schema rejects this, as it should. A wider run over seeds 0–149 found 152 of about 50,900 generated questions
    affected, across 14 templates, all on unaccepted preview islands (D-001).
  - The exception is narrow: a `number-entry` question, the trap-value path and exactly the message "repeats another trap".
    It covers nothing else, and no new exception list exists. The test allows only these known templates, and the list may
    only shrink. The generators are not changed here, because that would change existing behaviour.
  - **Review 2 (6 Nov):** the stronger rules in §3 were run over 50,959 generated and authored definitions (every kit
    template × difficulty × 150 seeds, and every Fractions question). They found no new failures: only the same 152 DEF-028
    questions in 14 templates.

## 5. Not in this step

- Using definitions in the app (loading, authoring, or marking through the schema).
- Fixing DEF-028 in the generators.
- Year mappings: CUR-001.
