# MM-001: Mental-strategy catalogue

<!-- Generated from src/maths/strategies.ts by src/maths/strategies.test.ts. Edit the catalogue, then run
     UPDATE_DOCS=1 npx vitest run src/maths/strategies.test.ts -->

| | |
|---|---|
| **Backlog item** | MM-001: research and validate a mental-strategy catalogue (R3) |
| **Status** | READY FOR QA (D-032). Not accepted. |
| **Acceptance criteria** | <ol><li>No strategy is taught without a mathematical justification and independently checked examples.</li><li>Claims about speed are not made without measured evidence.</li><li>Vedic techniques are included only where accurate, understandable and useful for the learner.</li></ol> |
| **Size** | 24 strategies in 5 families. |

## How each strategy is checked (AC1)

- Every strategy states **why it works**, as a mathematical argument (the distributive law, associativity, place value, an algebraic identity), and **when not to use it**.
- Every worked step is one operation (`left op right = value`). `src/maths/strategies.test.ts` recomputes **every step** of every hand-picked example, and of every input in a wide generated range that the strategy says it fits (more than 5,000 cases), with BigInt arithmetic, and checks the last step against an independent BigInt answer.
- Each strategy refuses the inputs it is unsuitable for, and the tests check the boundaries (for example, the square-ending-in-5 method refuses 34).
- Prerequisites are objective ids from the curriculum map (CUR-001); the tests reject any id that isn't in the map.

## Speed (AC2)

No strategy, lesson or screen claims that a method is faster. The tests reject the words *fast*, *quick*, *speed* and *seconds* in the catalogue. No speed has been measured, so none is claimed. The one-minute challenge (MM-011) reports a child's own accuracy and answers against their own previous runs only.

## Vedic techniques (AC3)

Accepted after evaluation in [MM-008](MM-008-vedic-evaluation.md): **Multiply near 100** and **Square a number ending in 5**. Others were evaluated and left out.

## Number bonds, partitioning and place value (MM-003)

### Bridge through 10

- **When:** Adding a one-digit number that takes you past the next ten.
- **Why it works:** Splitting the number you add doesn't change the total: a + b = a + p + q when b = p + q. Choosing p to reach the ten uses a number bond you know.
- **Not suitable:** When the ones don't cross a ten (32 + 5): just add the ones.
- **Prerequisites:** Y3.AS.1. **Years:** 2 to 4.
- **Worked example:** 47 + 8: 47 + 3 = 50 (to the next ten); 50 + 5 = 55 (the rest of 8). Answer **55**.
- **Checked examples:** 47 + 8, 38 + 5, 126 + 7.

### Partition and recombine

- **When:** Adding two two-digit numbers in your head.
- **Why it works:** Place value: 36 = 30 + 6 and 47 = 40 + 7, and addition can be done in any order and grouping, so add tens, add ones, then recombine.
- **Not suitable:** When one number is close to a ten (46 + 39): compensating is simpler.
- **Prerequisites:** Y3.NPV.2, Y3.AS.1. **Years:** 3 to 5.
- **Worked example:** 36 + 47: 30 + 40 = 70 (tens); 6 + 7 = 13 (ones); 70 + 13 = 83 (recombine). Answer **83**.
- **Checked examples:** 36 + 47, 58 + 24, 73 + 18.

### Round and adjust (adding)

- **When:** Adding a number that is 1 or 2 less than a multiple of ten, like 39 or 198.
- **Why it works:** a + b = a + (b + k) − k: adding the rounded number and taking back the extra gives the same total.
- **Not suitable:** When the number is not near a ten (46 + 34): there is nothing easy to round to.
- **Prerequisites:** Y3.AS.1, Y4.NPV.7. **Years:** 3 to 6.
- **Worked example:** 46 + 39: 46 + 40 = 86 (round 39 up to 40); 86 − 1 = 85 (take back the extra 1). Answer **85**.
- **Checked examples:** 46 + 39, 125 + 98, 347 + 199.

### Round and adjust (subtracting)

- **When:** Subtracting a number that is 1 or 2 less than a multiple of ten, like 29 or 98.
- **Why it works:** a − b = a − (b + k) + k: taking away k too many, then giving k back, leaves the same difference.
- **Not suitable:** When the number is not near a ten: counting up or partitioning is clearer.
- **Prerequisites:** Y3.AS.1, Y4.NPV.7. **Years:** 3 to 6.
- **Worked example:** 73 − 29: 73 − 30 = 43 (take away 30 instead); 43 + 1 = 44 (you took 1 too many, so give it back). Answer **44**.
- **Checked examples:** 73 − 29, 254 − 98, 600 − 199.

### Count up through the hundred

- **When:** Subtracting numbers that sit either side of a hundred or thousand, like 403 − 287.
- **Why it works:** The difference between two numbers is how far it is from one to the other, so a − b is the jump from b up to a. Jumping to the next hundred first uses bonds to 100.
- **Not suitable:** When the numbers are far apart in a way that needs many jumps, or when no exchange is needed (586 − 241).
- **Prerequisites:** Y3.AS.2, Y4.AS.1. **Years:** 3 to 6.
- **Worked example:** 403 − 287: 287 + 13 = 300 (up to the hundred); 300 + 103 = 403 (on to 403); 13 + 103 = 116 (add the jumps). Answer **116**.
- **Checked examples:** 403 − 287, 1,005 − 968, 612 − 395.

## Doubling, halving and near-doubles (MM-004)

### Near doubles

- **When:** Adding two numbers that are next to each other, like 35 + 36.
- **Why it works:** If b = a + 1, then a + b = a + a + 1 = double a, plus 1.
- **Not suitable:** When the numbers are not close together.
- **Prerequisites:** Y3.AS.1. **Years:** 2 to 4.
- **Worked example:** 35 + 36: double 35 = 70; 70 + 1 = 71. Answer **71**.
- **Checked examples:** 35 + 36, 7 + 8, 150 + 151.

### Double one, halve the other

- **When:** Multiplying when one number is even and doubling the other makes it round, like 16 × 25.
- **Why it works:** (a ÷ 2) × (b × 2) = a × b, because halving and doubling cancel out: the product stays the same.
- **Not suitable:** When both numbers are odd: halving gives a fraction.
- **Prerequisites:** Y4.MD.1, Y4.MD.3. **Years:** 4 to 6.
- **Worked example:** 16 × 25: halve 16 = 8, double 25 = 50; 8 × 50 = 400. Answer **400**.
- **Checked examples:** 16 × 25, 14 × 5, 18 × 15.

### Halve and halve again

- **When:** Dividing by 4, or finding a quarter.
- **Why it works:** 4 = 2 × 2, so dividing by 4 is dividing by 2 twice: a ÷ 4 = (a ÷ 2) ÷ 2.
- **Not suitable:** When the number isn't a multiple of 4 and you need a whole-number answer.
- **Prerequisites:** Y3.MD.1, Y3.FRAC.2. **Years:** 3 to 5.
- **Worked example:** 64 ÷ 4: half of 64 = 32; half of 32 = 16. Answer **16**.
- **Checked examples:** 64 ÷ 4, 180 ÷ 4, 348 ÷ 4.

## Multiplication and division (MM-005)

### ×5: times 10, then halve

- **When:** Multiplying by 5.
- **Why it works:** 5 = 10 ÷ 2, so a × 5 = (a × 10) ÷ 2.
- **Not suitable:** When the other number is odd and you'd rather avoid halves: the answer still works, but ends in 5.
- **Prerequisites:** Y4.MD.2, Y5.MD.5, Y5.MD.7. **Years:** 4 to 6.
- **Worked example:** 46 × 5: 46 × 10 = 460; 460 ÷ 2 = 230 (halve). Answer **230**.
- **Checked examples:** 46 × 5, 37 × 5, 128 × 5.

### ×50: times 100, then halve

- **When:** Multiplying by 50.
- **Why it works:** 50 = 100 ÷ 2, so a × 50 = (a × 100) ÷ 2.
- **Not suitable:** When the other number is odd and you'd rather avoid halves: the answer still works, but ends in 5.
- **Prerequisites:** Y4.MD.2, Y5.MD.5, Y5.MD.7. **Years:** 4 to 6.
- **Worked example:** 46 × 50: 46 × 100 = 4,600; 4,600 ÷ 2 = 2,300 (halve). Answer **2,300**.
- **Checked examples:** 46 × 50, 37 × 50, 128 × 50.

### ×25: times 100, then quarter

- **When:** Multiplying by 25.
- **Why it works:** 25 = 100 ÷ 4, so a × 25 = (a × 100) ÷ 4.
- **Not suitable:** When the other number isn't a multiple of 4, the quarter isn't a whole number; another method is clearer.
- **Prerequisites:** Y4.MD.2, Y5.MD.5, Y5.MD.7. **Years:** 4 to 6.
- **Worked example:** 16 × 25: 16 × 100 = 1,600; 1,600 ÷ 4 = 400 (halve twice). Answer **400**.
- **Checked examples:** 16 × 25, 36 × 25, 124 × 25.

### ×9: times 10, then take away one lot

- **When:** Multiplying by 9.
- **Why it works:** 9 = 10 − 1, so a × 9 = a × 10 − a (the distributive law).
- **Not suitable:** When the other number is small enough to know the fact by heart (9 × 3).
- **Prerequisites:** Y4.MD.2, Y4.MD.5. **Years:** 4 to 6.
- **Worked example:** 37 × 9: 37 × 10 = 370; 370 − 37 = 333 (take away one 37). Answer **333**.
- **Checked examples:** 37 × 9, 125 × 9, 64 × 9.

### ×99: times 100, then take away one lot

- **When:** Multiplying by 99.
- **Why it works:** 99 = 100 − 1, so a × 99 = a × 100 − a (the distributive law).
- **Not suitable:** When the other number is small enough to know the fact by heart (99 × 3).
- **Prerequisites:** Y4.MD.2, Y4.MD.5. **Years:** 4 to 6.
- **Worked example:** 37 × 99: 37 × 100 = 3,700; 3,700 − 37 = 3,663 (take away one 37). Answer **3,663**.
- **Checked examples:** 37 × 99, 125 × 99, 64 × 99.

### ×11: times 10, then add one lot

- **When:** Multiplying by 11.
- **Why it works:** 11 = 10 + 1, so a × 11 = a × 10 + a (the distributive law).
- **Not suitable:** When the other number is small enough to know the fact by heart (11 × 3).
- **Prerequisites:** Y4.MD.2, Y4.MD.5. **Years:** 4 to 6.
- **Worked example:** 37 × 11: 37 × 10 = 370; 370 + 37 = 407 (add one 37). Answer **407**.
- **Checked examples:** 37 × 11, 125 × 11, 64 × 11.

### Partition and multiply

- **When:** Multiplying a two-digit number by a one-digit number.
- **Why it works:** The distributive law: 23 × 7 = (20 + 3) × 7 = 20 × 7 + 3 × 7.
- **Not suitable:** When the one-digit number is 5 or 9: their special methods are simpler.
- **Prerequisites:** Y4.MD.5. **Years:** 4 to 6.
- **Worked example:** 23 × 7: 20 × 7 = 140; 3 × 7 = 21; 140 + 21 = 161. Answer **161**.
- **Checked examples:** 23 × 7, 48 × 6, 76 × 3.

### Split into factors

- **When:** Multiplying by a number with easy factors, like 12 = 3 × 4 or 15 = 3 × 5.
- **Why it works:** Associativity: a × (p × q) = (a × p) × q, so multiply by one factor, then the other.
- **Not suitable:** When the number is prime (13, 17): it has no smaller factors to use.
- **Prerequisites:** Y4.MD.3, Y5.MD.1. **Years:** 5 to 6.
- **Worked example:** 14 × 12: 14 × 3 = 42; 42 × 4 = 168 (12 = 3 × 4). Answer **168**.
- **Checked examples:** 14 × 12, 21 × 15, 25 × 16.

### Divide by factors

- **When:** Dividing by a number with easy factors, like 12 = 2 × 6 or 15 = 3 × 5.
- **Why it works:** a ÷ (p × q) = (a ÷ p) ÷ q: sharing into p × q groups is sharing into p, then each into q.
- **Not suitable:** When the divisor is prime: there are no factors to split it into.
- **Prerequisites:** Y4.MD.1, Y5.MD.1. **Years:** 5 to 6.
- **Worked example:** 168 ÷ 12: 168 ÷ 2 = 84; 84 ÷ 6 = 14 (12 = 2 × 6). Answer **14**.
- **Checked examples:** 168 ÷ 12, 240 ÷ 15, 432 ÷ 24.

### Multiply near 100 (Vedic, accepted in MM-008)

- **When:** Multiplying two numbers just below 100, like 97 × 96.
- **Why it works:** a × b = (a − (100 − b)) × 100 + (100 − a)(100 − b). Expanding (100 − x)(100 − y) gives 100 × (100 − x − y) + xy, which is the same thing.
- **Not suitable:** When the numbers are far from 100: the shortfalls get big and the method stops being simpler.
- **Prerequisites:** Y4.MD.1, Y5.MD.5, Y5.MD.7. **Years:** 6.
- **Worked example:** 97 × 96: 97 − 4 = 93 (96 is 4 short of 100); 3 × 4 = 12 (the two shortfalls multiplied); 93 × 100 = 9,300; 9,300 + 12 = 9,312. Answer **9,312**.
- **Checked examples:** 97 × 96, 98 × 93, 91 × 99.

## Squares and number patterns (MM-006)

### Square a number ending in 5 (Vedic, accepted in MM-008)

- **When:** Squaring a two-digit number that ends in 5, like 35².
- **Why it works:** (10n + 5)² = 100n² + 100n + 25 = 100 × n(n + 1) + 25. So multiply the tens digit by the next number up, then write 25.
- **Not suitable:** Any number not ending in 5: the pattern only works for 5s.
- **Prerequisites:** Y5.MD.8. **Years:** 5 to 6.
- **Worked example:** 35²: 3 × 4 = 12 (tens digit times the next number); 12 × 100 = 1,200; 1,200 + 25 = 1,225. Answer **1,225**.
- **Checked examples:** 35², 85², 15².

### From one square to the next

- **When:** Squaring a number one more than a square you know, like 21² from 20².
- **Why it works:** (n + 1)² = n² + 2n + 1 = n² + n + (n + 1): the next square adds the two numbers.
- **Not suitable:** When you don't know the square just below.
- **Prerequisites:** Y5.MD.8. **Years:** 5 to 6.
- **Worked example:** 21²: 20² = 400; 400 + 20 = 420; 420 + 21 = 441. Answer **441**.
- **Checked examples:** 21², 31², 51².

## Fraction, decimal and percentage shortcuts (MM-007)

### 10% is a tenth

- **When:** Finding 10%, 20%, 30% … of an amount.
- **Why it works:** Per cent means out of 100, so 10% = 10/100 = 1/10: divide by 10. Then multiply for 20%, 30% and so on.
- **Not suitable:** For percentages that aren't multiples of 10 (like 15%) you need a second step, such as 10% + 5%.
- **Prerequisites:** Y5.FRAC.11. **Years:** 5 to 6.
- **Worked example:** 10% of 350: 10% of 350 = 350 ÷ 10 = 35. Answer **35**.
- **Checked examples:** 10% of 350, 30% of 120, 70% of 50.

### 5% is half of 10%

- **When:** Finding 5% (or 15%) of an amount.
- **Why it works:** 5% = 10% ÷ 2, because 5/100 is half of 10/100.
- **Not suitable:** When 10% of the amount is odd: half of it is a decimal, which is fine but harder in your head.
- **Prerequisites:** Y5.FRAC.11. **Years:** 5 to 6.
- **Worked example:** 5% of 80: 10% of 80 = 8; 5% = half of that = 4. Answer **4**.
- **Checked examples:** 5% of 80, 5% of 360, 5% of 1,200.

### 25% is a quarter

- **When:** Finding 25% or 50% of an amount.
- **Why it works:** 25% = 25/100 = 1/4 and 50% = 1/2, so halve (and halve again for 25%).
- **Not suitable:** For 75%, add one more step: 75% = 50% + 25%.
- **Prerequisites:** Y5.FRAC.11, Y5.FRAC.12. **Years:** 5 to 6.
- **Worked example:** 25% of 64: 50% of 64 = half = 32; 25% = half again = 16. Answer **16**.
- **Checked examples:** 25% of 64, 50% of 90, 25% of 360.

### Divide by the bottom, times by the top

- **When:** Finding a fraction of an amount, like 3/5 of 40.
- **Why it works:** 1/5 of 40 is one of 5 equal parts: 40 ÷ 5 = 8. Three of those parts is 3 × 8 = 24.
- **Not suitable:** When the amount doesn't divide exactly by the denominator: the answer is not a whole number.
- **Prerequisites:** Y3.FRAC.2, Y4.FRAC.3. **Years:** 3 to 6.
- **Worked example:** 3/5 of 40: 1/5 of 40 = 40 ÷ 5 = 8; 3/5 = 3 × 8 = 24. Answer **24**.
- **Checked examples:** 3/5 of 40, 2/3 of 27, 7/10 of 150.
