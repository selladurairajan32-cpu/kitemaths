# ARCH-003 — Pure mathematical modules

| | |
|---|---|
| **Backlog item** | ARCH-003: build pure mathematical logic modules (P0, R0). Tested by QA-001. |
| **Status** | READY FOR QA (D-023): failed the 6 Nov review (DEF-029); corrected 6 Nov, awaiting independent retest. |
| **Date** | 5 November 2026 (sprint step 3, authorised by D-012 and the PO on 5 Nov) |
| **Acceptance criteria** | <ol><li>Core calculations and validators are pure functions independent of UI.</li><li>Edge cases are covered by unit tests.</li><li>UI never becomes the source of mathematical truth.</li></ol> |
| **Modules** | <ul><li>`src/maths/fraction.ts`: fractions; existing functions plus checked arithmetic, mixed numbers and partitions.</li><li>`src/maths/integer.ts`: checked integer helpers, factors, divmod, lcm.</li><li>`src/maths/place-value.ts`: place values and digits, moved out of a UI file (K-7).</li></ul> |
| **Guard** | `src/architecture.test.ts` rule A2: maths files depend only on maths files and use no browser or network globals |

This domain specification was written **before** the new functions were implemented. Each module repeats the rules for
its own functions in its header.

## 1. Number domain

| Rule | Behaviour |
|---|---|
| **Integers** | Every numerator, denominator, whole number, factor and divmod input must be a **safe integer** (`Number.isSafeInteger`: up to ±9,007,199,254,740,991). |
| **Intermediate results** | Every product and sum the new functions form, such as cross-multiplication, `lcm` and the numerators in `add`, is checked. If it would leave the safe range, the function throws `RangeError("… overflows …")`. **It never returns an imprecise result.** |
| **NaN, Infinity and non-integers** | `RangeError`, with the argument named |
| **Zero or negative denominator** | `RangeError` |
| **Division by zero** | `divide(a, 0/1)` and `divmod(a, 0)` throw `RangeError` |
| **Fraction results** | Always in simplest form, with a positive denominator. Zero is `0/1`. The sign is carried by the numerator. |
| **Negative fractions** | Allowed as inputs and results of the arithmetic functions (`subtract` can give one). Answers a child types are checked separately by `isValidFraction`, which only allows numerators of 0 or more. |

## 2. Mixed numbers

A mixed number is `{ sign, whole, n, d }`, and **the sign is authoritative**:

| Field | Rule |
|---|---|
| `sign` | `-1`, `0` or `1` |
| `whole` | A safe integer, 0 or more |
| `n` | A safe integer, 0 or more, and less than `d` |
| `d` | A safe integer, more than 0. The fractional part is in simplest form. |
| **Zero** | Canonical zero is `{ sign: 0, whole: 0, n: 0, d: 1 }`. Any other combination with `sign: 0` is invalid. |
| **Non-zero** | `sign` is ±1, and `whole` or `n` is more than 0 |
| **Whole numbers** | `n = 0` and `d = 1`. For example, 8/4 → `{ sign: 1, whole: 2, n: 0, d: 1 }`. |

**Examples:**
- −7/4 → `{ sign: -1, whole: 1, n: 3, d: 4 }`
- −3/4 → `{ sign: -1, whole: 0, n: 3, d: 4 }`. A negative proper fraction needs no negative whole number.
- 6/4 → `{ sign: 1, whole: 1, n: 1, d: 2 }`

`fromMixed` rejects anything outside these rules with a `RangeError`.

## 3. Integer division (`divmod`)

**Euclidean.** For `b ≠ 0`, `divmod(a, b)` returns `{ q, r }` where:
- `a = q·b + r`;
- `0 ≤ r < |b|`.

**Implementation** (DEF-029): the quotient is built from `a % b`, which is exact in JS, so every intermediate value stays
safe. An earlier form, `((a % |b|) + |b|) % |b|`, gave `divmod(2, MAX_SAFE_INTEGER)` = `{ q: 1.1e-16, r: 1 }`. Negative
zero is normalised to 0. Tests compare against an independent BigInt oracle for every pair of safe-integer extremes.

So the remainder is never negative:
- `divmod(-7, 2) = { q: -4, r: 1 }`;
- `divmod(7, -2) = { q: -3, r: 1 }`.

## 4. Partitions (shaded parts of a shape)

`shadedFraction(sizes, shaded)` maps a partition (a list of part sizes) and the indices of its shaded parts to a fraction.

| Input | Behaviour |
|---|---|
| Empty `sizes` | `RangeError` |
| A size that is 0 or less, NaN or infinite | `RangeError` |
| An index that is not an integer, is out of range, or is repeated | `RangeError` |
| Unequal sizes | **Valid input, but no equal-part fraction:** it returns `null`. "3 of 4 parts are shaded" doesn't mean ¾ when the parts aren't equal. |
| Equal sizes | `{ n: shaded.length, d: sizes.length }`, **not simplified**, because it names what the picture shows (2 of 4 parts is 2/4). Use `simplify` for the value. |

"Equal" uses the same tolerance as the existing `isEqualPartition` (1e-9). Sizes are geometric measures, not exact counts.

## 5. Existing functions keep their behaviour

**These keep today's behaviour exactly:**
- `gcd`, `simplify`, `equivalent`, `compare`, `compareSymbol`, `scale`;
- `fractionOfAmount`, `missingNumerator`, `missingDenominator`;
- `parseFraction`, `isEqualPartition`, `toWords`.

Their **supported domain** is the one the app uses today: small non-negative integers, with products well inside the safe
range.

**Outside that domain:**
- they are not checked: a zero denominator or an overflowing product is not reported;
- callers validate first. For example, Fractions marking turns a 0 denominator into an input problem before marking.

**Changing that would change existing behaviour,** so it is not part of this behaviour-preserving step. Known limits of
the existing functions are listed in the step-3 report (§6) as defects for R1. They are **not** locked into acceptance
tests.

## 6. What moved where (narrow, behaviour-preserving extraction)

| Duplicate inline maths | Replaced by | Callers changed |
|---|---|---|
| `gcd` in `src/topics/fractions-2/index.ts` | `gcd` from `src/maths/fraction.ts` (the same algorithm, with `Math.abs`) | fractions-2 |
| `gcd` in `src/topics/ratio-algebra/index.ts` (no `Math.abs`; only ever called with positive numbers) | `gcd` from `src/maths/fraction.ts` | ratio-algebra |
| `best()` simplest-form / mixed-number text in fractions-2 | `toMixed` from `src/maths/fraction.ts`; fractions-2 keeps only the text formatting | fractions-2 |
| `factors` in `src/topics/multiply-divide/index.ts` | `factors` from `src/maths/integer.ts` | multiply-divide |
| `PLACE` and `digitIn` in `src/topics/kit/visuals.tsx`, a UI file (K-7) | `src/maths/place-value.ts`; `visuals.tsx` and place-value import them from there | `kit/visuals.tsx`, place-value, `kit/types.ts` (`PlaceColumn`) |

**Proof that nothing changed.** `docs/product/verification/compare-generated-questions.mjs` generates every practice
and assessment question, and every kit template × difficulty × 150 seeds, with their answer texts. It does this at
`6050e3c` and at the step-3 head, then compares them. Result: [`results/step3/`](../verification/results/step3/).

## 7. Not in this step

- Changing the checked behaviour of existing functions (§5).
- Moving inline maths that has no duplicate elsewhere.
- Wider refactoring (ARCH-001 K-1 to K-6).
