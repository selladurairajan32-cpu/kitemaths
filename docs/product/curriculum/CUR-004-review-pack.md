<!-- Generated from src/topics/fractions by reviewPack.ts. Run `UPDATE_DOCS=1 npx vitest run src/topics/fractions/reviewPack.test.ts` after changing content. -->
# CUR-004: Fractions content review pack

For the **independent** reviewer (CUR-004). It lists every authored lesson step, question, distractor, picture and explanation in the R1 Fractions island. Tick each row, or log a defect in `traceability/defects.csv` (QA-004). Automated checks already cover arithmetic correctness, equal partitions and that pictures match answers (`content.test.ts`, `journey-content.test.ts`, `practice-rules.test.ts`); the review is for **ambiguity, wording, age-appropriateness and teaching quality**, which the tests cannot judge. Generated questions (templates in `generate.ts`) are listed in [PRACT-007](PRACT-007-question-variation.md).

## 1. Lessons

### Wholes and equal parts (`wholes`, Understand)

Objectives: Explain what a whole is; Recognise equal and unequal parts.

- **Explain: Everything starts with a whole.** A **whole** is one complete thing: a whole pizza, a whole chocolate bar, a whole ribbon, or even a whole bag of marbles. Fractions are all about **sharing a whole**. Before we can talk about fractions, we need to know what the whole is. _Tip:_ A whole doesn't have to be round or long — any single thing (or group) can be the whole.
- **Explain: Splitting a whole into equal parts.** Use the buttons to split the chocolate bar between different numbers of friends. Every piece is **exactly the same size**. Those are **equal parts** — fair shares. The more people share the **same bar**, the **smaller** each piece becomes.
- **Explain: Fair or not fair?** Both pizzas below are cut into 4 pieces. But only one is cut **fairly**. Fractions only work when the parts are **equal**. Four unequal pieces are **not** quarters — even though there are four of them.
- **Check: Spot the equal parts** (`ls-wholes-1`)
- **Check: Is it cut into halves?** (`ls-wholes-2`)

### Numerator and denominator (`naming`, Visualise)

Objectives: Name the numerator and denominator; Write the fraction a diagram shows.

- **Explain: A fraction has two numbers.** The **denominator** (bottom) tells us how many **equal parts** the whole is split into. The **numerator** (top) tells us how many of those parts we are **talking about** — here, the shaded parts. So {3/4} means: the whole is split into 4 equal parts, and we are looking at 3 of them. _Tip:_ Denominator — think “down”. It sits at the bottom.
- **Check: Build it: shade three fifths** (`ls-naming-shade`)
- **Worked (watch me): Watch me: what fraction is shaded?** What fraction of this circle is shaded? First I check the parts are **equal**. They are — all six slices are the same size. Next I count **all** the equal parts: 1, 2, 3, 4, 5, 6. That's the **denominator**: 6. Then I count the **shaded** parts: 1, 2. That's the **numerator**: 2. So {2/6} of the circle is shaded.
- **Worked (together): Together: what fraction is shaded?** What fraction of this bar is shaded? Check the parts are equal. ✓ They are all the same size. Count **all** the equal parts — shaded **and** unshaded. [child enters 8; hint: The bottom number counts every part, not just the shaded ones. Point to each part as you count.] Count the **shaded** parts. [child enters 3; hint: This time count only the coloured parts.] So {3/8} of the bar is shaded.
- **Check: Name the fraction** (`ls-naming-1`)
- **Check: Watch out for the trap** (`ls-naming-2`)

### The Fraction Lab (`lab`, Explore)

Objectives: Build fractions with different shapes; Notice that fractions can be made in different ways.

- **lab: Build fractions in the lab**
- **Explain: What did you notice?** You made one half with 8 parts by shading 4 of them. {4/8} and {1/2} cover **exactly the same amount** of the same whole. Different-looking fractions can be the same size. We'll explore this more soon.

### Comparing fractions (`comparing`, Explore)

Objectives: Compare fractions of the same whole with the same denominator; Explain why, with the same numerator, a bigger denominator gives a smaller fraction.

- **Explain: Same whole, same-sized pieces.** When two fractions are of the **same whole** and have the **same denominator**, their pieces are the same size. Then we just compare **how many** pieces: {2/5} is less than {4/5}.
- **Explain: The denominator surprise.** Here is a **fraction wall**. Every row is the **same whole**, split into a different number of equal parts. Look at **one piece** from each row. As the denominator gets **bigger**, each piece gets **smaller**. So {1/8} is **smaller** than {1/2}, even though 8 is bigger than 2. This works when the numerators are the same — {3/4} is bigger than {1/3}, for example. _Tip:_ More people sharing the same pizza means a smaller slice each.
- **lab: Prove it in the lab**
- **Worked (watch me): Watch me: compare {1/4} and {1/6}.** Which is bigger, {1/4} or {1/6} of the same whole? Both numerators are 1, so I'm comparing **one piece** of each. Quarters split the whole into 4. Sixths split the **same whole** into 6, so each sixth is smaller. The bars agree: the quarter piece is longer. So {1/4} > {1/6}.
- **Worked (together): Together: compare {3/8} and {5/8}.** Which is bigger, {3/8} or {5/8} of the same whole? The denominators are both 8, so the pieces are the same size. So I compare the numerators. [child enters 5; hint: The numerators are the top numbers, 3 and 5. Which is more pieces?] So {5/8} > {3/8}.
- **Check: Compare unit fractions** (`ls-comparing-1`)
- **Check: Compare sixths** (`ls-comparing-2`)

### Equivalent fractions (`equivalent`, Explore)

Objectives: See that different fractions can be equal; Find equivalent fractions by multiplying.

- **Explain: Same amount, different names.** These bars are all the same whole, and the same amount is shaded on each. {1/2}, {2/4} and {4/8} are **equivalent fractions** — they show exactly the same amount.
- **lab: Split the parts**
- **Worked (watch me): Watch me: {1/2} = ?/6.** Find the missing number: {1/2} = ?/6 The denominator went from 2 to 6. That's **× 3** — every half was split into 3. Splitting every part into 3 also triples the shaded parts. So the numerator is 1 × 3 = **3**. So {1/2} = {3/6}.
- **Worked (together): Together: {2/3} = ?/9.** Find the missing number: {2/3} = ?/9 What was the denominator multiplied by? [child enters 3; hint: Count up in 3s until you reach 9: 3, 6, 9. How many jumps?] Do the same to the numerator. [child enters 6; hint: Two lots of 3.] So {2/3} = {6/9}.
- **Check: Find the missing number** (`ls-equivalent-1`)
- **Check: Shade a half using eighths** (`ls-equivalent-2`)

### Fractions on a number line (`number-line`, Visualise)

Objectives: Count gaps, not marks; Place and read fractions between 0 and 1.

- **Explain: The line from 0 to 1 is a whole.** Fractions are numbers, so they have a place on the number line. In this lesson we work between **0 and 1** — the distance from 0 to 1 is **one whole**. We split it into equal **gaps**, just like a bar. Count the **gaps (jumps)**, not the marks. This line has 5 marks but only **4 gaps**, so it is split into quarters. Fractions can be bigger than 1 too — {5/4} is one quarter past 1 — but we'll meet those in a later module. _Tip:_ Gaps, not marks! The marks are just the edges of the gaps.
- **Worked (watch me): Watch me: read the point.** What fraction is marked? Count the gaps from 0 to 1: there are **5**. That's the denominator. Count the jumps from 0 to the point: **2**. That's the numerator. The point shows {2/5}.
- **Worked (together): Let's do it together: read another point.** What fraction is marked? Count the gaps from 0 to 1. [child enters 6; hint: Count the jumps, not the marks: there are 7 marks.] Now count the jumps from 0 to the point. [child enters 4; hint: Start at 0 and count each jump.] The point shows {4/6}.
- **Check: Place a fraction** (`ls-line-1`)
- **Check: Read a fraction** (`ls-line-2`)

### Adding and subtracting fractions (`adding`, Apply)

Objectives: Add fractions with the same denominator; Take away fractions with the same denominator; Explain why the denominator stays the same.

- **Explain: Sevenths and sevenths make sevenths.** When fractions have the **same denominator**, the parts are all the **same size**. You can count them like objects. 2 sevenths + 3 sevenths = **5 sevenths**, just like 2 apples + 3 apples = 5 apples. The **denominator stays the same** because the parts are still sevenths: the whole is still split into 7. Adding the denominators would make 14ths, which are smaller pieces. That can't be right: we haven't cut anything again. _Tip:_ Add or take away the numerators. Keep the denominator.
- **Worked (watch me): Watch me: add two fractions.** {3/8} + {2/8} = ? Start with **3 eighths** shaded. Add **2 more eighths**. The bar is still split into 8 equal parts. Count the eighths: 3 + 2 = **5**. The denominator stays 8. {3/8} + {2/8} = {5/8}.
- **Worked (together): Let's do it together: take away.** {5/6} − {2/6} = ? Start with **5 sixths**, then take away **2 sixths**. How many sixths are left? [child enters 3; hint: 5 − 2] {5/6} − {2/6} = {3/6}. The parts are still sixths.
- **Check: Add two fractions** (`ls-add-1`)
- **Check: Take away** (`ls-add-2`)

### Fractions of amounts (`amounts`, Apply)

Objectives: Find a unit fraction of an amount; Find a non-unit fraction of an amount; Solve two-step problems where each fraction is of the same whole.

- **Explain: A fraction of a group.** The whole can be a **group** of things. To find {1/3} of 12 counters, share them into **3 equal groups**. Each group has 4 counters, so {1/3} of 12 is **4**. That is the same as 12 ÷ 3.
- **Worked (watch me): Watch me: {3/4} of 20.** What is {3/4} of 20? Divide by the **denominator** to find one quarter: 20 ÷ 4 = **5**. Multiply by the **numerator** to collect 3 quarters: 3 × 5 = **15**. So {3/4} of 20 = 15.
- **Worked (together): Together: {2/5} of 15.** What is {2/5} of 15? Divide by the denominator to find {1/5}. [child enters 3; hint: Share the 15 counters into 5 equal groups. How many are in each group?] Multiply by the numerator. [child enters 6; hint: {2/5} is 2 of the groups. Two groups of 3?] So {2/5} of 15 = 6.
- **Check: A fraction of a number** (`ls-amounts-1`)
- **Check: Solve a word problem** (`ls-amounts-2`)
- **Worked (watch me): Watch me: a two-step problem.** Ben has 40 stickers. He gives {1/4} of the 40 stickers to Sam and {1/5} of the 40 stickers to Mia. How many stickers does he give away altogether? First I find **the whole** for each fraction. Both say “of the 40 stickers”, so both are fractions of **40**. Sam gets {1/4} of 40: 40 ÷ 4 = **10**. Mia gets {1/5} of 40: 40 ÷ 5 = **8**. The question asks for **altogether**, so I add: 10 + 8 = **18**. Ben gives away 18 stickers altogether.
- **Worked (together): Together: a two-step problem.** A comic has 36 pages. Zoe reads {1/3} of the comic on Monday and {1/4} of the comic on Tuesday. How many pages has she read altogether? Both fractions are “of the comic”, so the whole for each one is **36 pages**. Monday: find {1/3} of 36. [child enters 12; hint: Share 36 into 3 equal groups. 3 × 10 = 30, and 6 more is 2 more threes.] Tuesday: find {1/4} of 36. [child enters 9; hint: Halve 36, then halve again.] Altogether means add the two amounts. [child enters 21; hint: Add Monday's pages and Tuesday's pages.] Zoe has read 21 pages altogether.
- **Check: Your own two-step problem** (`ls-amounts-4`)
- **Check: Spot the mistake** (`ls-amounts-3`)

### Explaining your thinking (`reasoning`, Explain)

Objectives: Build an explanation: say if a claim is right, give evidence, and conclude; Use a counterexample to show a claim is not always true.

- **Explain: What makes a good explanation?** A good maths explanation has three parts: **1. Decide** — is the claim right or wrong? **2. Evidence** — what does the picture or the numbers show? Count, compare or calculate. **3. Conclude** — say what the correct answer is and why.
- **Worked (watch me): Watch me: explain Tom's mistake.** Tom says {1/3} of this bar is shaded, because 1 part is shaded and 3 are not. Is he right? **Decide:** Tom is wrong. **Evidence:** I count all the equal parts: 1, 2, 3, 4. There are 4 parts altogether and 1 is shaded. **Conclude:** so the bar shows {1/4}. Tom compared the shaded part with the unshaded parts instead of with the whole. Tom is wrong: 1 of 4 equal parts is shaded, so it is {1/4}.
- **Check: Build an explanation** (`ls-reason-1`)
- **Explain: Counterexamples.** To show a claim is **not always true**, you only need **one example** where it fails. That is called a **counterexample**. Claim: “Every fraction with a 2 on top is bigger than {1/2}.” Counterexample: {2/8} has 2 on top, but it is smaller than {1/2}.
- **Check: Find a counterexample** (`ls-reason-2`)

## 2. Lesson questions

| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |
|---|---|---|---|---|---|---|---|---|
| `ls-add-1` | choose-fraction | {2/6} + {3/6} = ? | {5/6} | 5/12 (Adding or subtracting the denominators); 6/5 (Mixing up numerator and denominator); 1/6 | bar, 6 equal parts, 5 shaded, 3 of them added | Sixths add to sixths. Count the sixths. | 2 sixths + 3 sixths = 5 sixths: {5/6}. | ☐ |
| `ls-add-2` | write-fraction | Write the answer: {7/9} − {4/9} = ? | {3/9} | — | bar, 9 equal parts, 3 shaded, 4 more crossed out | Start with 7 ninths and take away 4 ninths. | 7 ninths − 4 ninths = 3 ninths: {3/9}. | ☐ |
| `ls-wholes-1` | equal-parts | Which of these are split into **equal parts**? Select all that are. | 2 shapes with equal parts | — | bar, 3 equal parts, 0 shaded / bar, 2 UNEQUAL parts, 0 shaded / circle, 4 equal parts, 0 shaded / circle, 3 UNEQUAL parts, 0 shaded | Fair shares are all exactly the same size. | The bar of 3 and the circle of 4 have equal parts. The others have one bigger piece. | ☐ |
| `ls-wholes-2` | choose | Is this chocolate bar split into **halves**? | No — the 2 pieces are different sizes | Yes — it is in 2 pieces (Counting unequal parts as fractions) | bar, 2 UNEQUAL parts, 0 shaded | Would sharing these 2 pieces be fair? | Halves are 2 equal pieces. One piece is bigger, so these are not halves. | ☐ |
| `ls-naming-shade` | shade | Tap the parts to shade {3/5} of the bar. | Shade 3 of the 5 parts | — | bar, 5 equal parts, 0 shaded | The denominator 5 tells you the bar has 5 parts. The numerator 3 tells you how many to shade. | {3/5} means 3 of the 5 equal parts are shaded. | ☐ |
| `ls-naming-1` | choose-fraction | What fraction of the bar is shaded? | {5/8} | 8/5; 5/3; 5/9 | bar, 8 equal parts, 5 shaded | Count all the parts for the bottom. Count the shaded parts for the top. | 8 equal parts with 5 shaded is {5/8}. | ☐ |
| `ls-naming-2` | choose-fraction | What fraction of the bar is shaded? | {1/4} | 1/3; 4/1; 3/4 | bar, 4 equal parts, 1 shaded | The bottom number counts every part, including the shaded one. | 4 equal parts with 1 shaded is {1/4}. | ☐ |
| `ls-comparing-1` | compare | Choose the correct sign. | {1/5} < {1/3} | — | — | Fifths or thirds — which pieces are bigger? | Fifths are smaller pieces than thirds, so {1/5} < {1/3}. | ☐ |
| `ls-comparing-2` | compare | Choose the correct sign. | {2/6} < {5/6} | — | — | The pieces are the same size (sixths). Which has more of them? | Both are sixths, and 2 is fewer than 5, so {2/6} < {5/6}. | ☐ |
| `ls-equivalent-1` | missing-number | Find the missing number. | 6 | — | — | 4 × 2 = 8. Do the same to the top. | Multiply top and bottom by 2: {3/4} = {6/8}. | ☐ |
| `ls-equivalent-2` | shade | Shade {1/2} of this bar of eighths. | Shade 4 of the 8 parts | — | bar, 8 equal parts, 0 shaded | How many eighths make a half? | {1/2} = {4/8}, so shade 4 parts. | ☐ |
| `ls-line-1` | number-line-place | Tap the number line to mark {3/4}. | The mark 3 jumps from 0 ({3/4}) | — | — | Count 3 jumps from 0. | 4 equal jumps make quarters. {3/4} is 3 jumps from 0. | ☐ |
| `ls-line-2` | choose-fraction | What fraction is marked on the number line? | {3/5} | 3/6; 5/3; 2/5 | number line, 5 gaps, point at 3 | Count the gaps from 0 to 1 first. | 5 equal gaps from 0 to 1. The point is 3 gaps along: {3/5}. | ☐ |
| `ls-amounts-1` | fraction-of | What is {1/4} of 16? | 4 | — | — | Share 16 into 4 equal groups. | 16 ÷ 4 = 4, so {1/4} of 16 is 4. | ☐ |
| `ls-amounts-2` | fraction-of | There are 24 children in a class. {3/8} of them walk to school. How many children walk? | 9 children | — | — | Find {1/8} of 24 first. | 24 ÷ 8 = 3, so {1/8} is 3 children. {3/8} is 3 × 3 = 9 children. | ☐ |
| `ls-amounts-3` | choose | Ravi says “{3/4} of 12 is 3.” What mistake has he made? | He found {1/4} of 12, but did not multiply by 3 | No mistake — he is right (Finding one part instead of several); He should have added 3 and 4 | — | Work out {1/4} of 12 yourself. What do you notice? | 12 ÷ 4 = 3 is only one quarter. Three quarters is 3 × 3 = 9. | ☐ |
| `ls-amounts-4` | number | A farmer collects 30 eggs. {1/2} of the 30 eggs are brown and {1/3} of the 30 eggs are white. The rest are speckled. How many eggs are brown or white? | 25 eggs | 15; 10; 5 | — | Both fractions are of all 30 eggs. Find {1/2} of 30 and {1/3} of 30, then add. | {1/2} of 30 = 15 brown and {1/3} of 30 = 10 white. 15 + 10 = 25 eggs are brown or white. | ☐ |
| `ls-reason-1` | explain-frame | Sam says **{3/5}** of this bar is shaded. Build the explanation by choosing in each gap. | Sam is **wrong** because the bar has **8** equal parts altogether and **3** of them are shaded, so the fraction shaded is **{3/8}**. | — | bar, 8 equal parts, 3 shaded | Count all the parts first, then the shaded parts. What did Sam count instead? | The bar has 8 equal parts and 3 are shaded, so {3/8} is shaded. Sam compared the 3 shaded parts with the 5 unshaded parts. | ☐ |
| `ls-reason-2` | counterexample | Kai says: “A fraction with a bigger denominator is always smaller.” Build two fractions that prove Kai wrong: the **second** must have the bigger denominator but **not** be smaller. | Any pair where the second fraction has the bigger denominator but is not smaller — for example {1/3} and {3/4} | — | — | Kai is only right when the numerators are the same. Try giving the second fraction a bigger numerator. | For example {1/3} and {3/4}: 4 is a bigger denominator than 3, but {3/4} is bigger than {1/3}. A bigger denominator only means smaller pieces — how many pieces matters too. | ☐ |

## 3. Practice questions

| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |
|---|---|---|---|---|---|---|---|---|
| `ad-1` | choose-fraction | {1/5} + {2/5} = ? | {3/5} | 3/10 (Adding or subtracting the denominators); 2/5; 5/3 (Mixing up numerator and denominator) | bar, 5 equal parts, 3 shaded, 2 of them added | Count the fifths: 1 fifth, then 2 more fifths. | 1 fifth + 2 fifths = 3 fifths: {3/5}. The parts are still fifths. | ☐ |
| `ad-2` | write-fraction | Write the answer: {3/8} + {4/8} = ? | {7/8} | — | bar, 8 equal parts, 7 shaded, 4 of them added | Eighths add to eighths. How many eighths altogether? | 3 eighths + 4 eighths = 7 eighths: {7/8}. | ☐ |
| `ad-3` | write-fraction | Write the answer: {5/6} − {2/6} = ? | {3/6} | — | bar, 6 equal parts, 3 shaded, 2 more crossed out | Start with 5 sixths and take 2 sixths away. | 5 sixths − 2 sixths = 3 sixths: {3/6}. The parts are still sixths. | ☐ |
| `ad-4` | choose | What is {2/9} + {5/9}? | {7/9} | {7/18} (Adding or subtracting the denominators); {3/9} | — | Ninths add to ninths. Only the number of ninths changes. | 2 ninths + 5 ninths = 7 ninths: {7/9}. | ☐ |
| `ad-5` | write-fraction | A pizza is cut into 8 equal slices. Sam eats {3/8}. What fraction of the pizza is left? | {5/8} | — | bar, 8 equal parts, 5 shaded, 3 more crossed out | The whole pizza is {8/8}. Take away {3/8}. | {8/8} − {3/8} = {5/8} of the pizza is left. | ☐ |
| `ad-6` | choose | Mia says {4/10} + {3/10} = {7/20}. Is she right? | No: tenths add to tenths, so the answer is {7/10} | Yes: you add the tops and the bottoms (Adding or subtracting the denominators); No: the answer is {12/10} | — | What size are the parts before and after adding? | The parts are tenths before and after: 4 tenths + 3 tenths = 7 tenths, {7/10}. {7/20} would be smaller than {4/10}, which can't be right. | ☐ |
| `ep-1` | equal-parts | Which shapes are split into **equal parts**? Select all that are. | 2 shapes with equal parts | — | bar, 4 equal parts, 0 shaded / bar, 3 UNEQUAL parts, 0 shaded / circle, 3 equal parts, 0 shaded / circle, 3 UNEQUAL parts, 0 shaded | Look at the size of every piece, not just how many pieces there are. | Only the shapes where every piece is the same size show equal parts. | ☐ |
| `ep-2` | choose | Mia cuts a ribbon into 2 pieces like this. Has she cut it **in half**? | No — the 2 pieces are not the same size | Yes — there are 2 pieces (Counting unequal parts as fractions); No — halves need 3 pieces | bar, 2 UNEQUAL parts, 0 shaded | Halves are 2 pieces that are exactly the same size. Are these the same size? | Halves must be 2 equal pieces. One piece is longer, so these are not halves. | ☐ |
| `ep-3` | equal-parts | Select every shape that is split into **equal parts**. | 3 shapes with equal parts | — | 2×2 grid, 0 shaded / bar, 3 UNEQUAL parts, 0 shaded / bar, 6 equal parts, 0 shaded / circle, 8 equal parts, 0 shaded | Check each shape one at a time. Are all of its pieces the same size? | The square, the bar of 6 and the circle of 8 all have equal pieces. The bar of 3 has a bigger middle piece. | ☐ |
| `ep-4` | choose | Which picture shows **quarters**? | C | A (Counting unequal parts as fractions); B; D (Counting unequal parts as fractions) | — | Quarters means 4 parts. Which shapes have 4 parts, and which of those are all equal? | Quarters are 4 equal parts. Only C has 4 pieces that are all the same size. | ☐ |
| `ep-5` | choose | Jay cuts a pizza into 3 slices like this. One slice is half the pizza and the other two are a quarter each. Is each slice **one third**? | No — the slices are not equal, so they are not thirds | Yes — there are 3 slices (Counting unequal parts as fractions); No — a pizza must always be cut into 4 | circle, 3 UNEQUAL parts, 0 shaded | Thirds are 3 equal parts. Is the half-pizza slice the same size as a quarter slice? | Thirds must be 3 equal slices. A half and two quarters are different sizes, so they are not thirds. | ☐ |
| `nm-1` | choose-fraction | What fraction of the bar is shaded? | {1/4} | 4/1; 1/3; 3/4 | bar, 4 equal parts, 1 shaded | Count all the equal parts first — that is the bottom number. | There are 4 equal parts and 1 is shaded, so {1/4} is shaded. | ☐ |
| `nm-2` | choose-fraction | What fraction of the circle is shaded? | {2/3} | 3/2; 2/1; 1/3 | circle, 3 equal parts, 2 shaded | How many equal parts is the circle split into? How many are shaded? | The circle has 3 equal parts and 2 are shaded, so {2/3} is shaded. | ☐ |
| `nm-3` | choose-fraction | What fraction of the bar is shaded? | {3/5} | 3/2; 5/3; 2/5 | bar, 5 equal parts, 3 shaded | The denominator counts every part — shaded and unshaded. | There are 5 equal parts and 3 are shaded, so {3/5} is shaded. | ☐ |
| `nm-4` | choose-fraction | What fraction of the rectangle is shaded? | {3/6} | 6/3; 3/3; 3/7 | 2×3 grid, 3 shaded | Count the small squares carefully. The shaded ones don't have to be next to each other. | There are 6 equal squares and 3 are shaded, so {3/6} is shaded. | ☐ |
| `nm-5` | write-fraction | Write the fraction of the circle that is shaded. | {5/6} | — | circle, 6 equal parts, 5 shaded | Count every slice for the bottom number, then the shaded slices for the top number. | There are 6 equal slices and 5 are shaded, so {5/6} is shaded. | ☐ |
| `nm-6` | match | Match each picture to the fraction it shows shaded. | A → {1/4}, B → {2/3}, C → {3/5} | — | bar, 4 equal parts, 1 shaded / circle, 3 equal parts, 2 shaded / bar, 5 equal parts, 3 shaded | For each picture, count all the parts, then the shaded parts. | A shows {1/4}, B shows {2/3} and C shows {3/5}. | ☐ |
| `nm-7` | choose-fraction | What fraction of the bar is shaded? | {4/6} | 6/4; 4/2; 2/6 | bar, 6 equal parts, 4 shaded | The shaded parts are spread out. Count them one at a time. | There are 6 equal parts and 4 are shaded, so {4/6} is shaded. | ☐ |
| `nm-8` | write-fraction | What fraction of the rectangle is **not** shaded? | {7/10} | — | 2×5 grid, 3 shaded | This time the top number counts the parts that are NOT shaded. | There are 10 equal squares and 3 are shaded, so 7 are not shaded: {7/10}. | ☐ |
| `nm-9` | match | Match each picture to the fraction it shows shaded. Look carefully — they are similar! | A → {2/6}, B → {4/6}, C → {2/4} | — | bar, 6 equal parts, 2 shaded / bar, 6 equal parts, 4 shaded / circle, 4 equal parts, 2 shaded | Two pictures have 6 parts and one has 4. Start with the one that is different. | A shows {2/6}, B shows {4/6} and C shows {2/4}. | ☐ |
| `nm-10` | choose-fraction | What fraction of the grid is shaded? | {5/12} | 12/5; 5/7; 5/13 | 3×4 grid, 5 shaded | There are 3 rows of 4. How many squares is that altogether? | 3 rows of 4 make 12 equal squares, and 5 are shaded, so {5/12} is shaded. | ☐ |
| `rp-1` | shade | Shade {1/3} of the bar. | Shade 1 of the 3 parts | — | bar, 3 equal parts, 0 shaded | The bar has 3 equal parts. The top number tells you how many to shade. | {1/3} means 1 of the 3 equal parts. | ☐ |
| `rp-2` | shade | Shade {3/4} of the circle. | Shade 3 of the 4 parts | — | circle, 4 equal parts, 0 shaded | The circle has 4 equal parts. Shade the number of parts on top. | {3/4} means 3 of the 4 equal parts. | ☐ |
| `rp-3` | shade | Shade {2/5} of the bar. | Shade 2 of the 5 parts | — | bar, 5 equal parts, 0 shaded | 5 is the number of parts. 2 is how many you shade. | {2/5} means 2 of the 5 equal parts. | ☐ |
| `rp-4` | shade | Shade {5/8} of the circle. | Shade 5 of the 8 parts | — | circle, 8 equal parts, 0 shaded | Count the slices: there are 8. Shade the top number of slices. | {5/8} means 5 of the 8 equal slices. | ☐ |
| `rp-5` | shade | Shade {1/2} of this bar. | Shade 4 of the 8 parts | — | bar, 8 equal parts, 0 shaded | This bar has 8 parts, not 2. How many parts make exactly half of 8? | Half of 8 parts is 4 parts, because {1/2} = {4/8}. | ☐ |
| `rp-6` | shade | Shade {2/3} of the rectangle. | Shade 4 of the 6 parts | — | 2×3 grid, 0 shaded | There are 6 squares. Split them into 3 equal groups first — how many in each group? | 6 squares in 3 equal groups is 2 per group. {2/3} is 2 groups, so shade 4 squares: {2/3} = {4/6}. | ☐ |
| `rp-7` | shade | Shade {3/4} of the rectangle. | Shade 6 of the 8 parts | — | 2×4 grid, 0 shaded | 8 squares split into 4 equal groups gives 2 in each group. | 8 ÷ 4 = 2 squares in each quarter, so {3/4} is 3 × 2 = 6 squares: {3/4} = {6/8}. | ☐ |
| `cp-1` | compare | Choose the correct sign. | {2/5} < {4/5} | — | — | Both are fifths, so the pieces are the same size. Which has more pieces? | Both fractions are fifths. 2 fifths is less than 4 fifths, so {2/5} < {4/5}. | ☐ |
| `cp-2` | compare | Choose the correct sign. | {1/2} > {1/4} | — | — | Look at the bars. Is a half piece bigger or smaller than a quarter piece? | Halves are bigger pieces than quarters, so {1/2} > {1/4}. | ☐ |
| `cp-3` | compare | Choose the correct sign. | {1/3} > {1/5} | — | — | Imagine sharing one bar between 3 people, and another between 5 people. | Sharing between more people gives smaller pieces. Thirds are bigger than fifths, so {1/3} > {1/5}. | ☐ |
| `cp-4` | compare | Choose the correct sign. | {5/8} > {3/8} | — | — | The denominators match, so compare the numerators. | Both are eighths. 5 eighths is more than 3 eighths, so {5/8} > {3/8}. | ☐ |
| `cp-5` | compare | Choose the correct sign. | {1/6} < {1/3} | — | — | Which is bigger: one of 6 equal pieces, or one of 3 equal pieces of the same whole? | Sixths are smaller pieces than thirds, so {1/6} < {1/3}. | ☐ |
| `cp-6` | compare | Choose the correct sign. | {2/4} = {1/2} | — | — | Picture both on the same bar. Do they cover the same amount? | 2 quarters cover exactly half the whole, so {2/4} = {1/2}. | ☐ |
| `cp-7` | compare | Choose the correct sign. | {3/4} > {3/5} | — | — | The numerators match — 3 pieces each. Which pieces are bigger: quarters or fifths? | Both are 3 pieces, but quarters are bigger than fifths, so {3/4} > {3/5}. | ☐ |
| `cp-8` | choose | Put these in order from **smallest to largest**: {1/3}, {1/8}, {1/5} | {1/8}, {1/5}, {1/3} | {1/3}, {1/5}, {1/8} (Thinking a bigger denominator means a bigger piece); {1/5}, {1/3}, {1/8} | — | All three have 1 on top. Which whole is cut into the most pieces? | With the same numerator, more pieces means smaller pieces: {1/8} < {1/5} < {1/3}. | ☐ |
| `cp-9` | choose | Ali eats {1/4} of a pizza. Ben eats {1/6} of a pizza the same size. Who eats more pizza? | Ali | Ben (Thinking a bigger denominator means a bigger piece); They eat the same amount | — | A pizza cut into 4 slices or into 6 slices — which slices are bigger? | Quarters are bigger than sixths of the same pizza, so Ali eats more. | ☐ |
| `eq-1` | choose | Which fraction is the **same amount** as {1/2}? | {2/4} | {2/3} (Adding instead of multiplying for equivalence); {1/4}; {2/1} (Mixing up numerator and denominator) | — | Imagine splitting each half into 2 smaller pieces. | Splitting each half into 2 gives 4 quarters, and 2 of them are shaded: {1/2} = {2/4}. | ☐ |
| `eq-2` | missing-number | Find the missing number. | 2 | — | — | The denominator was multiplied by 2. Do the same to the numerator. | 2 × 2 = 4, so multiply the numerator by 2 too: {1/2} = {2/4}. | ☐ |
| `eq-3` | missing-number | Find the missing number. | 2 | — | — | What do you multiply 3 by to get 6? | 3 × 2 = 6, so 1 × 2 = 2: {1/3} = {2/6}. | ☐ |
| `eq-4` | missing-number | Find the missing number. | 6 | — | — | Each quarter splits into 2 eighths. How many eighths do 3 quarters make? | 4 × 2 = 8, so 3 × 2 = 6: {3/4} = {6/8}. | ☐ |
| `eq-5` | missing-number | Find the missing number. | 10 | — | — | The numerator was doubled. Do the same to the denominator. | 2 × 2 = 4, so 5 × 2 = 10: {2/5} = {4/10}. | ☐ |
| `eq-6` | missing-number | Find the missing number. | 8 | — | — | What do you multiply 3 by to get 12? | 3 × 4 = 12, so 2 × 4 = 8: {2/3} = {8/12}. | ☐ |
| `eq-7` | choose | Which fraction is **not** equal to {1/2}? | {4/6} | {3/6}; {4/8}; {5/10} | — | For a half, the top number is exactly half of the bottom number. | 3 is half of 6, 4 is half of 8 and 5 is half of 10. But 4 is not half of 6, so {4/6} is not equal to {1/2}. | ☐ |
| `eq-8` | missing-number | Find the missing number. | 4 | — | — | The numerator was halved (6 → 3). Halve the denominator too. | 6 ÷ 2 = 3, so 8 ÷ 2 = 4: {6/8} = {3/4}. | ☐ |
| `nl-1` | number-line-place | Tap the number line to mark {1/4}. | The mark 1 jump from 0 ({1/4}) | — | — | The line from 0 to 1 is split into 4 equal jumps. Make 1 jump from 0. | 4 equal jumps make quarters. {1/4} is 1 jump from 0. | ☐ |
| `nl-2` | number-line-place | Tap the number line to mark {2/3}. | The mark 2 jumps from 0 ({2/3}) | — | — | Count the jumps from 0, not the marks. | 3 equal jumps make thirds. {2/3} is 2 jumps from 0. | ☐ |
| `nl-3` | choose-fraction | What fraction is marked on the number line? | {2/5} | 2/6; 5/2; 3/5 | number line, 5 gaps, point at 2 | Count the gaps between 0 and 1 — that is the denominator. | There are 5 equal gaps from 0 to 1 and the point is 2 gaps along: {2/5}. | ☐ |
| `nl-4` | number-line-place | Tap the number line to mark {3/8}. | The mark 3 jumps from 0 ({3/8}) | — | — | There are 8 jumps between 0 and 1. Count 3 jumps from 0. | {3/8} is 3 of the 8 equal jumps from 0. | ☐ |
| `nl-5` | number-line-place | This line is split into eighths. Mark {1/2}. | The mark 4 jumps from 0 ({1/2}) | — | — | Half of the way from 0 to 1. How many eighths is that? | {1/2} = {4/8}, so it is 4 jumps along — exactly halfway. | ☐ |
| `nl-6` | choose-fraction | What fraction is marked on the number line? | {5/6} | 5/7; 6/5; 1/6 | number line, 6 gaps, point at 5 | Count the gaps, not the marks. Then count the jumps to the point. | There are 6 equal gaps from 0 to 1 and the point is 5 gaps along: {5/6}. | ☐ |
| `fo-1` | fraction-of | What is {1/2} of 10? | 5 | — | — | Share the 10 counters into 2 equal groups. How many in one group? | 10 shared into 2 equal groups is 5 in each group. So {1/2} of 10 = 5. | ☐ |
| `fo-2` | fraction-of | What is {1/3} of 12? | 4 | — | — | Share 12 into 3 equal groups. | 12 ÷ 3 = 4, so {1/3} of 12 = 4. | ☐ |
| `fo-3` | fraction-of | What is {1/4} of 20? | 5 | — | — | Divide by the denominator. | 20 ÷ 4 = 5, so {1/4} of 20 = 5. | ☐ |
| `fo-4` | fraction-of | What is {3/4} of 12? | 9 | — | — | Find {1/4} of 12 first. Then you need 3 of those groups. | 12 ÷ 4 = 3 in each quarter. 3 quarters is 3 × 3 = 9. | ☐ |
| `fo-5` | fraction-of | There are 15 sweets in a bag. Sam eats {2/5} of them. How many sweets does Sam eat? | 6 sweets | — | — | Find {1/5} of 15 first, then double it. | 15 ÷ 5 = 3, so {1/5} is 3 sweets. {2/5} is 2 × 3 = 6 sweets. | ☐ |
| `fo-6` | fraction-of | A ribbon is 24 cm long. {3/8} of it is cut off. How long is the piece that is cut off? | 9 cm | — | — | Find {1/8} of 24 cm, then multiply by 3. | 24 ÷ 8 = 3 cm for each eighth. 3 eighths is 3 × 3 = 9 cm. | ☐ |
| `fo-7` | number | Mum has £18. She spends {2/3} of it. How much money does she have **left**? | £6 | 12 | — | If she spends {2/3}, what fraction is left? | She spends {2/3}, so {1/3} is left. 18 ÷ 3 = 6, so £6 is left. | ☐ |
| `fo-8` | number | {1/5} of a number is 7. What is the number? | 35 | 7 | — | If one fifth is 7, the whole is made of 5 of those fifths. | The whole is 5 fifths. 5 × 7 = 35. | ☐ |
| `rs-1` | choose | Leo says **{1/3}** of this bar is shaded. Is he right? | Leo is wrong — the parts are not equal, so they are not thirds | Leo is right — 1 out of 3 parts is shaded (Counting unequal parts as fractions); Leo is wrong — it should be {3/1} (Mixing up numerator and denominator) | bar, 3 UNEQUAL parts, 1 shaded | Are the 3 parts the same size? | The shaded part is twice the size of the others. Thirds must be equal, so Leo is wrong. | ☐ |
| `rs-2` | choose | Priya says “{1/5} is bigger than {1/3} because 5 is bigger than 3.” Is she right? | Priya is wrong — fifths are smaller pieces than thirds, so {1/5} is smaller | Priya is right (Thinking a bigger denominator means a bigger piece); Priya is wrong — they are equal because both have 1 on top | — | Would you rather have one third or one fifth of the same cake? | Sharing into 5 gives smaller pieces than sharing into 3, so {1/5} < {1/3}. | ☐ |
| `rs-3` | choose | Tom says **{1/3}** of this bar is shaded, because 1 part is shaded and 3 are not. Is he right? | Tom is wrong — the denominator counts all 4 equal parts, so it is {1/4} | Tom is right (Comparing part to part instead of part to whole); Tom is wrong — it is {3/1} (Mixing up numerator and denominator) | bar, 4 equal parts, 1 shaded | How many equal parts are there altogether, shaded and unshaded? | There are 4 equal parts altogether and 1 is shaded, so {1/4} is shaded. | ☐ |
| `rs-4` | choose | Zara says “{1/2} = {2/3} because I added 1 to the top and the bottom.” Is she right? | Zara is wrong — you multiply top and bottom by the same number, so {1/2} = {2/4} | Zara is right (Adding instead of multiplying for equivalence); Zara is wrong — {1/2} = {3/2} | — | Is {2/3} more or less than a half? Picture it on a bar. | {2/3} is more than {1/2}. Equivalent fractions come from multiplying: {1/2} = {2/4}. | ☐ |
| `rs-5` | choose | Ben says this point shows **{1/5}** because there are 5 marks on the line. Is he right? | Ben is wrong — count the gaps, not the marks. There are 4 gaps, so it shows {1/4} | Ben is right (Miscounting the total number of parts); Ben is wrong — it shows {1/3} | number line, 4 gaps, point at 1 | Fractions on a number line count the equal jumps from 0 to 1. | 5 marks make 4 equal gaps, so the point is 1 of 4 jumps: {1/4}. | ☐ |
| `rs-6` | choose | Which statement is **true**? | {3/4} of 8 is 6 | {1/3} of 9 is 6; {2/5} of 10 is 2 (Finding one part instead of several); {1/2} of 7 is 3 | — | Work each one out: divide by the bottom, multiply by the top. | 8 ÷ 4 = 2 and 2 × 3 = 6, so {3/4} of 8 is 6. The others are wrong: {1/3} of 9 is 3, {2/5} of 10 is 4 and {1/2} of 7 is 3½. | ☐ |
| `fo-9` | number | Lily has £24. She spends {1/3} of the £24 on a book and {1/4} of the £24 on lunch. How much does she spend altogether? | £14 | 8; 6; 10 | — | Both fractions are of the whole £24. Find each one, then add them. | {1/3} of £24 = £8 and {1/4} of £24 = £6. Altogether she spends £8 + £6 = £14. | ☐ |
| `rs-7` | explain-frame | Jess says **{2/6}** is bigger than **{1/3}** because 2 is bigger than 1. Build an explanation. | Jess is **wrong**. If I split every third into **2** equal pieces, {1/3} becomes **{2/6}**, so the two fractions are **equal**. | — | — | Imagine a bar split into thirds. What happens if you cut every third in half? | Splitting each third into 2 makes sixths, and 1 third becomes 2 sixths. So {2/6} = {1/3} — they are equal, not bigger. | ☐ |
| `rs-8` | counterexample | Kim says: “If a fraction has a bigger numerator, it is always the bigger fraction.” Build two fractions that prove Kim wrong: the **second** must have the bigger numerator but **not** be bigger. | Any pair where the second fraction has the bigger numerator but is not bigger — for example {1/2} and {2/8} | — | — | Make the second fraction's pieces much smaller by giving it a big denominator. | For example {1/2} and {2/8}: 2 is a bigger numerator than 1, but {2/8} is only a quarter, which is smaller than a half. So Kim's claim is not always true. | ☐ |

## 4. Follow-up questions (misconception recovery)

| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |
|---|---|---|---|---|---|---|---|---|
| `fu-ad-1` | choose | Look at the bar: {2/5} and then {1/5} more. How many equal parts is the whole bar split into? | 5, so the answer is in fifths | 10, because 5 + 5 = 10 (Adding or subtracting the denominators) | bar, 5 equal parts, 3 shaded, 1 of them added | Adding doesn't cut the bar into more pieces. | The bar is still split into 5 equal parts, so {2/5} + {1/5} = {3/5}. | ☐ |
| `fu-ad-2` | write-fraction | Write the answer: {1/4} + {2/4} = ? | {3/4} | — | bar, 4 equal parts, 3 shaded, 2 of them added | Quarters add to quarters. Count the quarters. | 1 quarter + 2 quarters = 3 quarters: {3/4}. | ☐ |
| `fu-swap-1` | choose | In the fraction {3/4}, what does the **4** tell you? | The whole is split into 4 equal parts | 4 parts are shaded (Mixing up numerator and denominator); There are 4 parts left over | bar, 4 equal parts, 3 shaded | The bottom number is the denominator. | The denominator 4 tells us the whole is split into 4 equal parts. | ☐ |
| `fu-swap-2` | write-fraction | Write the fraction that is shaded. Put the total number of parts on the bottom. | {2/5} | — | bar, 5 equal parts, 2 shaded | Total parts on the bottom, shaded parts on top. | 5 parts altogether, 2 shaded: {2/5}. | ☐ |
| `fu-bd-1` | compare | Look at the bars, then choose the correct sign. | {1/2} > {1/8} | — | — | Compare the length of the shaded pieces. | The half piece is much longer than the eighth piece, so {1/2} > {1/8}. | ☐ |
| `fu-bd-2` | choose | One cake is shared equally between 8 people. A cake the same size is shared equally between 3 people. Where does each person get **more** cake? | When it is shared between 3 people | When it is shared between 8 people (Thinking a bigger denominator means a bigger piece) | — | More people sharing means… | Fewer people sharing means bigger pieces, so {1/3} is more than {1/8}. | ☐ |
| `fu-ue-1` | choose | Which bar shows **thirds**? | B | A (Counting unequal parts as fractions) | — | Thirds are 3 parts that are all the same size. | B has 3 equal parts. A has 3 parts, but the middle one is bigger. | ☐ |
| `fu-ue-2` | equal-parts | Select the shapes that show **quarters**. | 2 shapes with equal parts | — | circle, 4 equal parts, 0 shaded / circle, 4 UNEQUAL parts, 0 shaded / 2×2 grid, 0 shaded | Quarters: 4 parts, all the same size. | The first circle and the square have 4 equal parts. The middle circle has 4 parts of different sizes. | ☐ |
| `fu-pp-1` | number | How many equal parts is this whole split into **altogether**? | 5 | 4 (Comparing part to part instead of part to whole) | bar, 5 equal parts, 1 shaded | Count every part — shaded and unshaded. | There are 5 parts altogether, so the denominator is 5. | ☐ |
| `fu-pp-2` | choose-fraction | What fraction of the circle is shaded? | {1/3} | 1/2; 3/1 | circle, 3 equal parts, 1 shaded | The bottom number is all the parts, not just the unshaded ones. | 3 parts altogether and 1 is shaded: {1/3}. | ☐ |
| `fu-mc-1` | number | How many equal **gaps** are there between 0 and 1? | 5 | 6 (Miscounting the total number of parts) | number line, 5 gaps | Count the jumps, not the lines. | 6 marks make 5 equal gaps, so the line is split into fifths. | ☐ |
| `fu-mc-2` | write-fraction | Count carefully. What fraction of the bar is shaded? | {3/7} | — | bar, 7 equal parts, 3 shaded | Point to each part as you count it. | There are 7 parts and 3 are shaded: {3/7}. | ☐ |
| `fu-uo-1` | fraction-of | What is {2/3} of 9? Use the groups to help. | 6 | — | — | One group is {1/3}. You need 2 groups. | 9 ÷ 3 = 3 in each group. 2 groups is 6. | ☐ |
| `fu-uo-2` | number | {1/4} of 16 is 4. What is {3/4} of 16? | 12 | 4 (Finding one part instead of several) | — | Three quarters is three lots of one quarter. | 3 × 4 = 12. | ☐ |
| `fu-add-1` | compare | Look at the bars. Is {1/3} the same as {2/4}? | {1/3} < {2/4} | — | — | Compare how much of each bar is shaded. | {1/3} is less than {2/4} — adding 1 to the top and bottom changed the amount. | ☐ |
| `fu-add-2` | missing-number | Each quarter is split into 2 eighths. Find the missing number. | 2 | — | — | 1 quarter becomes how many eighths? | Multiply top and bottom by 2: {1/4} = {2/8}. | ☐ |

## 5. Mastery check, form A

| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |
|---|---|---|---|---|---|---|---|---|
| `as-1` | equal-parts | Select every shape that is split into **equal parts**. | 2 shapes with equal parts | — | circle, 6 equal parts, 0 shaded / bar, 4 UNEQUAL parts, 0 shaded / 3×3 grid, 0 shaded / circle, 4 UNEQUAL parts, 0 shaded | — | The circle of 6 and the 3 × 3 grid have equal parts. The other two have pieces of different sizes. | ☐ |
| `as-2` | write-fraction | Write the fraction of the circle that is shaded. | {2/5} | — | circle, 5 equal parts, 2 shaded | — | 5 equal parts with 2 shaded is {2/5}. | ☐ |
| `as-14` | choose | Which picture shows **fifths**? | B | A (Counting unequal parts as fractions); C; D (Counting unequal parts as fractions) | — | — | Fifths are 5 equal parts. Only the circle B has 5 parts that are all the same size. | ☐ |
| `as-3` | shade | This bar has 10 parts. Shade {3/5} of it. | Shade 6 of the 10 parts | — | bar, 10 equal parts, 0 shaded | — | Each fifth is 2 tenths, so {3/5} = {6/10}: shade 6 parts. | ☐ |
| `as-4` | write-fraction | What fraction of the rectangle is **not** shaded? | {5/8} | — | 2×4 grid, 3 shaded | — | 8 equal squares, 3 shaded, so 5 are not shaded: {5/8}. | ☐ |
| `as-15` | shade | This circle has 8 slices. Shade {3/4} of it. | Shade 6 of the 8 parts | — | circle, 8 equal parts, 0 shaded | — | Each quarter is 2 eighths, so {3/4} = {6/8}: shade 6 slices. | ☐ |
| `as-16` | choose-fraction | What fraction is marked on the number line? | {3/8} | 3/9; 8/3; 5/8 | number line, 8 gaps, point at 3 | — | There are 8 equal gaps from 0 to 1 and the point is 3 gaps along: {3/8}. | ☐ |
| `as-5` | compare | Choose the correct sign. | {1/7} < {1/4} | — | — | — | Sevenths are smaller pieces than quarters, so {1/7} < {1/4}. | ☐ |
| `as-6` | compare | Choose the correct sign. | {7/9} > {4/9} | — | — | — | Both are ninths, and 7 ninths is more than 4 ninths: {7/9} > {4/9}. | ☐ |
| `as-7` | missing-number | Find the missing number. | 12 | — | — | — | 5 × 4 = 20, so 3 × 4 = 12: {3/5} = {12/20}. | ☐ |
| `as-8` | choose | Which fraction is **not** equivalent to {2/3}? | {3/4} | {4/6}; {6/9}; {8/12} | — | — | {4/6}, {6/9} and {8/12} are {2/3} multiplied by 2, 3 and 4. {3/4} adds 1 to the top and bottom, which changes the amount. | ☐ |
| `as-9` | number-line-place | This line is split into sixths. Mark {2/3}. | The mark 4 jumps from 0 ({2/3}) | — | — | — | {2/3} = {4/6}, so it is 4 jumps from 0. | ☐ |
| `as-10` | fraction-of | A bag holds 32 marbles. {5/8} of them are blue. How many marbles are blue? | 20 marbles | — | — | — | 32 ÷ 8 = 4 in each eighth. 5 eighths is 5 × 4 = 20 marbles. | ☐ |
| `as-11` | number | Jo's book has 48 pages. She reads {1/4} of the book on Monday and {1/3} of the book on Tuesday. How many pages has she read altogether? | 28 pages | 12; 16 | — | — | {1/4} of 48 = 12 and {1/3} of 48 = 16. 12 + 16 = 28 pages. | ☐ |
| `as-17` | write-fraction | Write the answer: {2/7} + {4/7} = ? | {6/7} | — | bar, 7 equal parts, 6 shaded, 4 of them added | — | 2 sevenths + 4 sevenths = 6 sevenths: {6/7}. | ☐ |
| `as-18` | choose | A jug is {9/10} full. Ava pours out {4/10}. How full is it now? | {5/10} | {13/10}; {4/10} | — | — | 9 tenths − 4 tenths = 5 tenths: {5/10}. | ☐ |
| `as-12` | choose | Kai says: “When the top numbers are the same, the fraction with the bigger denominator is bigger.” Is Kai right? | Kai is wrong — a bigger denominator means the whole is cut into more, smaller pieces | Kai is right (Thinking a bigger denominator means a bigger piece); Kai is right, but only for halves | — | — | A bigger denominator means smaller pieces, so with the same numerator the fraction is smaller. | ☐ |
| `as-13` | explain-frame | Ella says **{2/3}** of this circle is shaded. Build the explanation by choosing in each gap. | Ella is **wrong** because the circle has **5** equal parts altogether and 2 are shaded, so the fraction shaded is **{2/5}**. | — | circle, 5 equal parts, 2 shaded | — | The circle has 5 equal parts altogether and 2 are shaded: {2/5}. Ella compared the shaded parts with the unshaded parts. | ☐ |

## 6. Mastery check, form B

| Id | Kind | Prompt | Answer | Distractors (tag) | Picture | Hint | Explanation | OK |
|---|---|---|---|---|---|---|---|---|
| `bs-1` | equal-parts | Select every shape that is split into **equal parts**. | 2 shapes with equal parts | — | bar, 5 equal parts, 0 shaded / circle, 3 UNEQUAL parts, 0 shaded / 2×3 grid, 0 shaded / bar, 4 UNEQUAL parts, 0 shaded | — | The bar of 5 and the 2 × 3 grid have equal parts. The other two have pieces of different sizes. | ☐ |
| `bs-2` | write-fraction | Write the fraction of the bar that is shaded. | {4/7} | — | bar, 7 equal parts, 4 shaded | — | 7 equal parts with 4 shaded is {4/7}. | ☐ |
| `bs-14` | choose | Which picture shows **thirds**? | C | A (Counting unequal parts as fractions); B (Counting unequal parts as fractions); D | — | — | Thirds are 3 equal parts. Only circle C has 3 parts that are all the same size. | ☐ |
| `bs-3` | shade | This bar has 12 parts. Shade {2/3} of it. | Shade 8 of the 12 parts | — | bar, 12 equal parts, 0 shaded | — | Each third is 4 twelfths, so {2/3} = {8/12}: shade 8 parts. | ☐ |
| `bs-4` | write-fraction | What fraction of the circle is **not** shaded? | {4/6} | — | circle, 6 equal parts, 2 shaded | — | 6 equal slices, 2 shaded, so 4 are not shaded: {4/6}. | ☐ |
| `bs-15` | shade | This rectangle has 12 squares. Shade {1/4} of it. | Shade 3 of the 12 parts | — | 3×4 grid, 0 shaded | — | 12 ÷ 4 = 3, so {1/4} = {3/12}: shade 3 squares. | ☐ |
| `bs-16` | choose-fraction | What fraction is marked on the number line? | {4/6} | 4/7; 6/4; 2/6 | number line, 6 gaps, point at 4 | — | There are 6 equal gaps from 0 to 1 and the point is 4 gaps along: {4/6}. | ☐ |
| `bs-5` | compare | Choose the correct sign. | {1/9} < {1/5} | — | — | — | Ninths of a whole are smaller pieces than fifths of the same whole, so {1/9} < {1/5}. | ☐ |
| `bs-6` | compare | Choose the correct sign. | {5/7} > {3/7} | — | — | — | Both are sevenths, and 5 sevenths is more than 3 sevenths: {5/7} > {3/7}. | ☐ |
| `bs-7` | missing-number | Find the missing number. | 10 | — | — | — | 3 × 5 = 15, so 2 × 5 = 10: {2/3} = {10/15}. | ☐ |
| `bs-8` | choose | Which fraction is **not** equivalent to {3/4}? | {4/5} | {6/8}; {9/12}; {12/16} | — | — | {6/8}, {9/12} and {12/16} are {3/4} multiplied by 2, 3 and 4. {4/5} adds 1 to the top and bottom, which changes the amount. | ☐ |
| `bs-9` | number-line-place | This line is split into tenths. Mark {3/5}. | The mark 6 jumps from 0 ({3/5}) | — | — | — | {3/5} = {6/10}, so it is 6 jumps from 0. | ☐ |
| `bs-10` | fraction-of | A box holds 36 pencils. {3/4} of them are sharpened. How many pencils are sharpened? | 27 pencils | — | — | — | 36 ÷ 4 = 9 in each quarter. 3 quarters is 3 × 9 = 27 pencils. | ☐ |
| `bs-11` | number | A comic has 40 pages. Ali reads {1/5} of the comic on Saturday and {1/4} of the comic on Sunday. How many pages has he read altogether? | 18 pages | 8; 10 | — | — | Both fractions are of the whole comic: {1/5} of 40 = 8 and {1/4} of 40 = 10. 8 + 10 = 18 pages. | ☐ |
| `bs-17` | write-fraction | Write the answer: {3/5} + {1/5} = ? | {4/5} | — | bar, 5 equal parts, 4 shaded, 1 of them added | — | 3 fifths + 1 fifth = 4 fifths: {4/5}. | ☐ |
| `bs-18` | choose | What is {11/12} − {5/12}? | {6/12} | {16/12}; {5/12} | — | — | 11 twelfths − 5 twelfths = 6 twelfths: {6/12}. | ☐ |
| `bs-12` | choose | Mia says: “When two fractions have the same numerator, the one with the smaller denominator is smaller.” Is Mia right? | Mia is wrong — a smaller denominator means bigger pieces, so that fraction is bigger | Mia is right (Thinking a bigger denominator means a bigger piece); Mia is right, but only for quarters | — | — | With the same numerator, fewer pieces in the whole means bigger pieces, so the smaller denominator gives the bigger fraction. | ☐ |
| `bs-13` | explain-frame | Leo says **{3/4}** of this circle is shaded. Build the explanation by choosing in each gap. | Leo is **wrong** because the circle has **7** equal parts altogether and 3 are shaded, so the fraction shaded is **{3/7}**. | — | circle, 7 equal parts, 3 shaded | — | The circle has 7 equal parts altogether and 3 are shaded: {3/7}. Leo compared the shaded parts with the unshaded parts. | ☐ |
