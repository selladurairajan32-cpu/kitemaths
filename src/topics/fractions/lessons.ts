import type {
  Lesson as GenericLesson,
  LessonStep as GenericLessonStep,
  WorkedBlank as GenericWorkedBlank,
  WorkedStep as GenericWorkedStep,
} from "@/lessons/types";
import type { LabChallenge, LabMode } from "./lab";
import { frac as f } from "./math";
import type { VisualSpec } from "./types";

/** Extra fields a fractions lab step carries. */
export interface FractionsLabStep {
  mode: LabMode;
  challenges: LabChallenge[];
}

export type Lesson = GenericLesson<VisualSpec, FractionsLabStep>;
export type LessonStep = GenericLessonStep<VisualSpec, FractionsLabStep>;
export type WorkedStep = GenericWorkedStep<VisualSpec>;
export type WorkedBlank = GenericWorkedBlank<VisualSpec>;

export const LESSONS: Lesson[] = [
  {
    id: "wholes",
    title: "Wholes and equal parts",
    phase: "Understand",
    summary: "What a whole is, and why fair shares must be equal.",
    minutes: 6,
    objectives: ["Explain what a whole is", "Recognise equal and unequal parts"],
    steps: [
      {
        type: "explain",
        title: "Everything starts with a whole",
        body: [
          "A **whole** is one complete thing: a whole pizza, a whole chocolate bar, a whole ribbon, or even a whole bag of marbles.",
          "Fractions are all about **sharing a whole**. Before we can talk about fractions, we need to know what the whole is.",
        ],
        visual: { type: "everyday" },
        tip: "A whole doesn't have to be round or long — any single thing (or group) can be the whole.",
      },
      {
        type: "explain",
        title: "Splitting a whole into equal parts",
        body: [
          "Use the buttons to split the chocolate bar between different numbers of friends.",
          "Every piece is **exactly the same size**. Those are **equal parts** — fair shares.",
          "The more people share the **same bar**, the **smaller** each piece becomes.",
        ],
        visual: { type: "split-demo" },
      },
      {
        type: "explain",
        title: "Fair or not fair?",
        body: [
          "Both pizzas below are cut into 4 pieces. But only one is cut **fairly**.",
          "Fractions only work when the parts are **equal**. Four unequal pieces are **not** quarters — even though there are four of them.",
        ],
        visual: { type: "fair-unfair" },
      },
      { type: "check", title: "Spot the equal parts", questionId: "fractions.ls-wholes-1" },
      { type: "check", title: "Is it cut into halves?", questionId: "fractions.ls-wholes-2" },
    ],
  },
  {
    id: "naming",
    title: "Numerator and denominator",
    phase: "Visualise",
    summary: "How the two numbers in a fraction describe a picture.",
    minutes: 8,
    objectives: ["Name the numerator and denominator", "Write the fraction a diagram shows"],
    steps: [
      {
        type: "explain",
        title: "A fraction has two numbers",
        body: [
          "The **denominator** (bottom) tells us how many **equal parts** the whole is split into.",
          "The **numerator** (top) tells us how many of those parts we are **talking about** — here, the shaded parts.",
          "So {3/4} means: the whole is split into 4 equal parts, and we are looking at 3 of them.",
        ],
        visual: { type: "anatomy", fraction: f(3, 4) },
        tip: "Denominator — think “down”. It sits at the bottom.",
      },
      {
        type: "check",
        title: "Build it: shade three fifths",
        questionId: "fractions.ls-naming-shade",
        intro: "Tap parts to shade them. The count below updates as you go.",
      },
      {
        type: "worked",
        title: "Watch me: what fraction is shaded?",
        support: "full",
        problem: "What fraction of this circle is shaded?",
        visual: { type: "diagram", diagram: { shape: "circle", parts: 6, shaded: [0, 1] } },
        steps: [
          { text: "First I check the parts are **equal**. They are — all six slices are the same size." },
          {
            text: "Next I count **all** the equal parts: 1, 2, 3, 4, 5, 6. That's the **denominator**: 6.",
            visual: { type: "diagram", diagram: { shape: "circle", parts: 6, shaded: [0, 1] }, countParts: true },
          },
          { text: "Then I count the **shaded** parts: 1, 2. That's the **numerator**: 2." },
        ],
        conclusion: "So {2/6} of the circle is shaded.",
      },
      {
        type: "worked",
        title: "Together: what fraction is shaded?",
        support: "faded",
        problem: "What fraction of this bar is shaded?",
        visual: { type: "diagram", diagram: { shape: "bar", parts: 8, shaded: [0, 1, 2] } },
        steps: [
          { text: "Check the parts are equal. ✓ They are all the same size." },
          {
            text: "Count **all** the equal parts — shaded **and** unshaded.",
            blank: {
              prompt: "How many parts altogether?",
              answer: 8,
              hint: "The bottom number counts every part, not just the shaded ones. Point to each part as you count.",
              traps: [
                { value: 3, feedback: "3 is the number of shaded parts. The bottom number counts all the parts, shaded and unshaded." },
                { value: 5, feedback: "5 is the number of unshaded parts. Count the shaded parts too." },
                { value: 9, feedback: "Careful — count the parts, not the lines between them." },
              ],
              support: { type: "diagram", diagram: { shape: "bar", parts: 8, shaded: [0, 1, 2] }, countParts: true },
              worked: "Count along the bar together: 1, 2, 3, 4, 5, 6, 7, 8. There are **8** parts altogether.",
            },
          },
          {
            text: "Count the **shaded** parts.",
            blank: {
              prompt: "How many are shaded?",
              answer: 3,
              hint: "This time count only the coloured parts.",
              traps: [{ value: 8, feedback: "8 is all the parts. The top number counts only the shaded ones." }],
              support: { type: "diagram", diagram: { shape: "bar", parts: 8, shaded: [0, 1, 2] }, countParts: [0, 1, 2] },
              worked: "The coloured parts are 1, 2, 3 — so **3** are shaded.",
            },
          },
        ],
        conclusion: "So {3/8} of the bar is shaded.",
      },
      { type: "check", title: "Name the fraction", questionId: "fractions.ls-naming-1" },
      {
        type: "check",
        title: "Watch out for the trap",
        questionId: "fractions.ls-naming-2",
        intro: "This one has a trap. Think about what the bottom number counts.",
      },
    ],
  },
  {
    id: "lab",
    title: "The Fraction Lab",
    phase: "Explore",
    summary: "Build your own fractions and check them.",
    minutes: 7,
    objectives: ["Build fractions with different shapes", "Notice that fractions can be made in different ways"],
    steps: [
      {
        type: "lab",
        title: "Build fractions in the lab",
        body: [
          "Choose a shape, set the number of equal parts (1 to 12) and tap parts to shade them.",
          "When you think you've built what a challenge asks, press **Check** for that challenge.",
        ],
        mode: "build",
        challenges: [
          {
            id: "build-3-4",
            mode: "build",
            text: "Make {3/4}",
            hint: "Set 4 parts, then shade 3 of them.",
            check: { kind: "make", target: f(3, 4), parts: 4 },
            success: "3 of the 4 equal parts are shaded — that's {3/4}.",
          },
          {
            id: "build-half-8",
            mode: "build",
            text: "Make one half using **8** parts",
            hint: "With 8 parts, half is 4 of them.",
            check: { kind: "make", target: f(1, 2), parts: 8 },
            success: "4 of 8 equal parts covers exactly half the whole.",
            observe: {
              prompt: "How many eighths make one half?",
              options: [
                { id: "2", label: "2" },
                { id: "4", label: "4" },
                { id: "8", label: "8" },
              ],
              answer: "4",
              retry: "Look at your shape: how many of the 8 parts did you shade to make half?",
            },
          },
          {
            id: "build-bigger-half",
            mode: "build",
            text: "Using **5** parts, make a fraction bigger than {1/2}",
            hint: "Half of 5 parts would be 2½ parts. Shade more than that.",
            check: { kind: "bigger-than", than: f(1, 2), parts: 5 },
            success: "More than half of the 5 equal parts are shaded.",
            observe: {
              prompt: "Why is your fraction bigger than one half?",
              options: [
                { id: "more-than-half", label: "More than half of the 5 equal parts are shaded" },
                { id: "five", label: "Because 5 is bigger than 2" },
                { id: "top", label: "Because the top number is odd" },
              ],
              answer: "more-than-half",
              retry: "Think about the amount shaded, not just the numbers. Is more than half the bar coloured?",
            },
          },
        ],
      },
      {
        type: "explain",
        title: "What did you notice?",
        body: [
          "You made one half with 8 parts by shading 4 of them. {4/8} and {1/2} cover **exactly the same amount** of the same whole.",
          "Different-looking fractions can be the same size. We'll explore this more soon.",
        ],
        visual: { type: "equivalent-bars", fractions: [f(1, 2), f(4, 8)] },
      },
    ],
  },
  {
    id: "comparing",
    title: "Comparing fractions",
    phase: "Explore",
    summary: "Which fraction of the same whole is bigger — and a surprise about denominators.",
    minutes: 8,
    objectives: [
      "Compare fractions of the same whole with the same denominator",
      "Explain why, with the same numerator, a bigger denominator gives a smaller fraction",
    ],
    steps: [
      {
        type: "explain",
        title: "Same whole, same-sized pieces",
        body: [
          "When two fractions are of the **same whole** and have the **same denominator**, their pieces are the same size.",
          "Then we just compare **how many** pieces: {2/5} is less than {4/5}.",
        ],
        visual: { type: "compare-bars", a: f(2, 5), b: f(4, 5) },
      },
      {
        type: "explain",
        title: "The denominator surprise",
        body: [
          "Here is a **fraction wall**. Every row is the **same whole**, split into a different number of equal parts.",
          "Look at **one piece** from each row. As the denominator gets **bigger**, each piece gets **smaller**.",
          "So {1/8} is **smaller** than {1/2}, even though 8 is bigger than 2. This works when the numerators are the same — {3/4} is bigger than {1/3}, for example.",
        ],
        visual: { type: "wall", denominators: [1, 2, 3, 4, 5, 6, 8], highlight: [2, 8] },
        tip: "More people sharing the same pizza means a smaller slice each.",
      },
      {
        type: "lab",
        title: "Prove it in the lab",
        body: [
          "Both bars are the same whole. Set them to show the fractions in each challenge, then press **Check**.",
        ],
        mode: "compare",
        challenges: [
          {
            id: "compare-third-fifth",
            mode: "compare",
            text: "Show {1/3} on top and {1/5} below",
            hint: "Top bar: 3 parts, shade 1. Bottom bar: 5 parts, shade 1.",
            check: { kind: "compare", a: f(1, 3), b: f(1, 5) },
            success: "The third is a longer piece of the same whole than the fifth.",
            observe: {
              prompt: "Which is bigger?",
              options: [
                { id: "third", label: "{1/3}" },
                { id: "fifth", label: "{1/5}" },
                { id: "same", label: "They are the same" },
              ],
              answer: "third",
              retry: "Compare the length of the shaded pieces on the two bars.",
            },
          },
          {
            id: "compare-34-58",
            mode: "compare",
            text: "Show {3/4} on top and {5/8} below",
            hint: "Top bar: 4 parts, shade 3. Bottom bar: 8 parts, shade 5.",
            check: { kind: "compare", a: f(3, 4), b: f(5, 8) },
            success: "{3/4} = {6/8}, which is one eighth more than {5/8}.",
          },
        ],
      },
      {
        type: "worked",
        title: "Watch me: compare {1/4} and {1/6}",
        support: "full",
        problem: "Which is bigger, {1/4} or {1/6} of the same whole?",
        visual: { type: "compare-bars", a: f(1, 4), b: f(1, 6) },
        steps: [
          { text: "Both numerators are 1, so I'm comparing **one piece** of each." },
          { text: "Quarters split the whole into 4. Sixths split the **same whole** into 6, so each sixth is smaller." },
          { text: "The bars agree: the quarter piece is longer." },
        ],
        conclusion: "So {1/4} > {1/6}.",
      },
      {
        type: "worked",
        title: "Together: compare {3/8} and {5/8}",
        support: "faded",
        problem: "Which is bigger, {3/8} or {5/8} of the same whole?",
        visual: { type: "compare-bars", a: f(3, 8), b: f(5, 8) },
        steps: [
          { text: "The denominators are both 8, so the pieces are the same size." },
          {
            text: "So I compare the numerators.",
            blank: {
              prompt: "Which numerator is bigger: 3 or 5?",
              answer: 5,
              hint: "The numerators are the top numbers, 3 and 5. Which is more pieces?",
              worked: "5 pieces is more than 3 pieces of the same size, so the answer is **5**.",
            },
          },
        ],
        conclusion: "So {5/8} > {3/8}.",
      },
      { type: "check", title: "Compare unit fractions", questionId: "fractions.ls-comparing-1" },
      { type: "check", title: "Compare sixths", questionId: "fractions.ls-comparing-2" },
    ],
  },
  {
    id: "equivalent",
    title: "Equivalent fractions",
    phase: "Explore",
    summary: "Different names for the same amount.",
    minutes: 8,
    objectives: ["See that different fractions can be equal", "Find equivalent fractions by multiplying"],
    steps: [
      {
        type: "explain",
        title: "Same amount, different names",
        body: [
          "These bars are all the same whole, and the same amount is shaded on each.",
          "{1/2}, {2/4} and {4/8} are **equivalent fractions** — they show exactly the same amount.",
        ],
        visual: { type: "equivalent-bars", fractions: [f(1, 2), f(2, 4), f(4, 8)] },
      },
      {
        type: "lab",
        title: "Split the parts",
        body: [
          "Set a fraction, then split **every** part into smaller equal pieces.",
          "The shaded amount never changes — but the numbers do. Press **Check** when you've built each one.",
        ],
        mode: "equivalent",
        challenges: [
          {
            id: "equiv-2-3-6",
            mode: "equivalent",
            text: "Start with {2/3}. Find an equal fraction with **6** parts",
            hint: "Set 3 parts with 2 shaded, then split each part into 2.",
            check: { kind: "equivalent", to: f(2, 3), parts: 6 },
            success: "Splitting each third into 2 gives sixths: {2/3} = {4/6}.",
          },
          {
            id: "equiv-2-3-12",
            mode: "equivalent",
            text: "Start with {2/3}. Find an equal fraction with **12** parts",
            hint: "3 × 4 = 12. Split each part into 4.",
            check: { kind: "equivalent", to: f(2, 3), parts: 12 },
            success: "Splitting each third into 4 gives twelfths: {2/3} = {8/12}.",
            observe: {
              prompt: "Splitting every part into 4 does what to the top and bottom numbers?",
              options: [
                { id: "times", label: "Multiplies both by 4" },
                { id: "plus", label: "Adds 4 to both" },
                { id: "bottom", label: "Only changes the bottom number" },
              ],
              answer: "times",
              retry: "Look: 3 parts became 12 parts, and 2 shaded parts became 8. What happened to each number?",
            },
          },
        ],
      },
      {
        type: "worked",
        title: "Watch me: {1/2} = ?/6",
        support: "full",
        problem: "Find the missing number: {1/2} = ?/6",
        visual: { type: "equivalent-bars", fractions: [f(1, 2), f(3, 6)] },
        steps: [
          { text: "The denominator went from 2 to 6. That's **× 3** — every half was split into 3." },
          { text: "Splitting every part into 3 also triples the shaded parts. So the numerator is 1 × 3 = **3**." },
        ],
        conclusion: "So {1/2} = {3/6}.",
      },
      {
        type: "worked",
        title: "Together: {2/3} = ?/9",
        support: "faded",
        problem: "Find the missing number: {2/3} = ?/9",
        visual: { type: "equivalent-bars", fractions: [f(2, 3), f(6, 9)] },
        steps: [
          {
            text: "What was the denominator multiplied by?",
            blank: {
              prompt: "3 × ? = 9",
              answer: 3,
              hint: "Count up in 3s until you reach 9: 3, 6, 9. How many jumps?",
              traps: [{ value: 6, feedback: "3 + 6 = 9, but equivalent fractions need multiplying. 3 × 6 would be 18." }],
              worked: "3, 6, 9 is three jumps of 3, so 3 × **3** = 9. Each third was split into 3.",
            },
          },
          {
            text: "Do the same to the numerator.",
            blank: {
              prompt: "2 × 3 = ?",
              answer: 6,
              hint: "Two lots of 3.",
              traps: [{ value: 5, feedback: "That's 2 + 3. We need 2 × 3 — two lots of 3." }],
              worked: "Two lots of 3 is 3 + 3 = **6**.",
            },
          },
        ],
        conclusion: "So {2/3} = {6/9}.",
      },
      { type: "check", title: "Find the missing number", questionId: "fractions.ls-equivalent-1" },
      { type: "check", title: "Shade a half using eighths", questionId: "fractions.ls-equivalent-2" },
    ],
  },
  {
    id: "number-line",
    title: "Fractions on a number line",
    phase: "Visualise",
    summary: "Fractions are numbers with a place on the number line. Here we work from 0 to 1.",
    minutes: 6,
    objectives: ["Count gaps, not marks", "Place and read fractions between 0 and 1"],
    steps: [
      {
        type: "explain",
        title: "The line from 0 to 1 is a whole",
        body: [
          "Fractions are numbers, so they have a place on the number line. In this lesson we work between **0 and 1** — the distance from 0 to 1 is **one whole**.",
          "We split it into equal **gaps**, just like a bar. Count the **gaps (jumps)**, not the marks. This line has 5 marks but only **4 gaps**, so it is split into quarters.",
          "Fractions can be bigger than 1 too — {5/4} is one quarter past 1 — but we'll meet those in a later module.",
        ],
        visual: { type: "number-line", intervals: 4, countGaps: true },
        tip: "Gaps, not marks! The marks are just the edges of the gaps.",
      },
      {
        type: "worked",
        title: "Watch me: read the point",
        support: "full",
        problem: "What fraction is marked?",
        visual: { type: "number-line", intervals: 5, point: 2 },
        steps: [
          {
            text: "Count the gaps from 0 to 1: there are **5**. That's the denominator.",
            visual: { type: "number-line", intervals: 5, point: 2, countGaps: true },
          },
          { text: "Count the jumps from 0 to the point: **2**. That's the numerator." },
        ],
        conclusion: "The point shows {2/5}.",
      },
      { type: "check", title: "Place a fraction", questionId: "fractions.ls-line-1" },
      { type: "check", title: "Read a fraction", questionId: "fractions.ls-line-2" },
    ],
  },
  {
    id: "amounts",
    title: "Fractions of amounts",
    phase: "Apply",
    summary: "Use fractions to share real quantities, including two-step problems.",
    minutes: 12,
    objectives: [
      "Find a unit fraction of an amount",
      "Find a non-unit fraction of an amount",
      "Solve two-step problems where each fraction is of the same whole",
    ],
    steps: [
      {
        type: "explain",
        title: "A fraction of a group",
        body: [
          "The whole can be a **group** of things. To find {1/3} of 12 counters, share them into **3 equal groups**.",
          "Each group has 4 counters, so {1/3} of 12 is **4**. That is the same as 12 ÷ 3.",
        ],
        visual: { type: "counters", amount: 12, groups: 3, highlight: 1 },
      },
      {
        type: "worked",
        title: "Watch me: {3/4} of 20",
        support: "full",
        problem: "What is {3/4} of 20?",
        visual: { type: "counters", amount: 20, groups: 4, highlight: 0 },
        steps: [
          {
            text: "Divide by the **denominator** to find one quarter: 20 ÷ 4 = **5**.",
            visual: { type: "counters", amount: 20, groups: 4, highlight: 1 },
          },
          {
            text: "Multiply by the **numerator** to collect 3 quarters: 3 × 5 = **15**.",
            visual: { type: "counters", amount: 20, groups: 4, highlight: 3 },
          },
        ],
        conclusion: "So {3/4} of 20 = 15.",
      },
      {
        type: "worked",
        title: "Together: {2/5} of 15",
        support: "faded",
        problem: "What is {2/5} of 15?",
        visual: { type: "counters", amount: 15, groups: 5, highlight: 0 },
        steps: [
          {
            text: "Divide by the denominator to find {1/5}.",
            blank: {
              prompt: "15 ÷ 5 = ?",
              answer: 3,
              hint: "Share the 15 counters into 5 equal groups. How many are in each group?",
              traps: [{ value: 5, feedback: "5 is the number of groups. How many counters are in each group?" }],
              support: { type: "counters", amount: 15, groups: 5, highlight: 1 },
              worked: "15 shared into 5 equal groups gives **3** in each group, because 5 × 3 = 15.",
            },
            visual: { type: "counters", amount: 15, groups: 5, highlight: 1 },
          },
          {
            text: "Multiply by the numerator.",
            blank: {
              prompt: "2 × 3 = ?",
              answer: 6,
              hint: "{2/5} is 2 of the groups. Two groups of 3?",
              traps: [{ value: 5, feedback: "That's 2 + 3. We need two groups of 3." }],
              support: { type: "counters", amount: 15, groups: 5, highlight: 2 },
              worked: "Two groups of 3 is 3 + 3 = **6**.",
            },
            visual: { type: "counters", amount: 15, groups: 5, highlight: 2 },
          },
        ],
        conclusion: "So {2/5} of 15 = 6.",
      },
      { type: "check", title: "A fraction of a number", questionId: "fractions.ls-amounts-1" },
      { type: "check", title: "Solve a word problem", questionId: "fractions.ls-amounts-2" },
      {
        type: "worked",
        title: "Watch me: a two-step problem",
        support: "full",
        problem:
          "Ben has 40 stickers. He gives {1/4} of the 40 stickers to Sam and {1/5} of the 40 stickers to Mia. How many stickers does he give away altogether?",
        visual: { type: "counters", amount: 40, groups: 4, highlight: 1 },
        steps: [
          { text: "First I find **the whole** for each fraction. Both say “of the 40 stickers”, so both are fractions of **40**." },
          {
            text: "Sam gets {1/4} of 40: 40 ÷ 4 = **10**.",
            visual: { type: "counters", amount: 40, groups: 4, highlight: 1 },
          },
          {
            text: "Mia gets {1/5} of 40: 40 ÷ 5 = **8**.",
            visual: { type: "counters", amount: 40, groups: 5, highlight: 1 },
          },
          { text: "The question asks for **altogether**, so I add: 10 + 8 = **18**." },
        ],
        conclusion: "Ben gives away 18 stickers altogether.",
      },
      {
        type: "worked",
        title: "Together: a two-step problem",
        support: "faded",
        problem:
          "A comic has 36 pages. Zoe reads {1/3} of the comic on Monday and {1/4} of the comic on Tuesday. How many pages has she read altogether?",
        steps: [
          { text: "Both fractions are “of the comic”, so the whole for each one is **36 pages**." },
          {
            text: "Monday: find {1/3} of 36.",
            blank: {
              prompt: "36 ÷ 3 = ?",
              answer: 12,
              hint: "Share 36 into 3 equal groups. 3 × 10 = 30, and 6 more is 2 more threes.",
              traps: [{ value: 9, feedback: "9 is {1/4} of 36 — that's Tuesday. Monday is {1/3}." }],
              worked: "3 × 12 = 36, so 36 ÷ 3 = **12** pages on Monday.",
            },
          },
          {
            text: "Tuesday: find {1/4} of 36.",
            blank: {
              prompt: "36 ÷ 4 = ?",
              answer: 9,
              hint: "Halve 36, then halve again.",
              worked: "Half of 36 is 18, and half of 18 is **9** pages on Tuesday.",
            },
          },
          {
            text: "Altogether means add the two amounts.",
            blank: {
              prompt: "12 + 9 = ?",
              answer: 21,
              hint: "Add Monday's pages and Tuesday's pages.",
              traps: [{ value: 3, feedback: "That's the difference. Altogether means add them." }],
              worked: "12 + 9 = **21** pages altogether.",
            },
          },
        ],
        conclusion: "Zoe has read 21 pages altogether.",
      },
      { type: "check", title: "Your own two-step problem", questionId: "fractions.ls-amounts-4" },
      { type: "check", title: "Spot the mistake", questionId: "fractions.ls-amounts-3" },
    ],
  },
  {
    id: "reasoning",
    title: "Explaining your thinking",
    phase: "Explain",
    summary: "Build mathematical explanations and find counterexamples.",
    minutes: 8,
    objectives: [
      "Build an explanation: say if a claim is right, give evidence, and conclude",
      "Use a counterexample to show a claim is not always true",
    ],
    steps: [
      {
        type: "explain",
        title: "What makes a good explanation?",
        body: [
          "A good maths explanation has three parts:",
          "**1. Decide** — is the claim right or wrong?",
          "**2. Evidence** — what does the picture or the numbers show? Count, compare or calculate.",
          "**3. Conclude** — say what the correct answer is and why.",
        ],
        visual: { type: "diagram", diagram: { shape: "bar", parts: 4, shaded: [0] } },
      },
      {
        type: "worked",
        title: "Watch me: explain Tom's mistake",
        support: "full",
        problem: "Tom says {1/3} of this bar is shaded, because 1 part is shaded and 3 are not. Is he right?",
        visual: { type: "diagram", diagram: { shape: "bar", parts: 4, shaded: [0] } },
        steps: [
          { text: "**Decide:** Tom is wrong." },
          {
            text: "**Evidence:** I count all the equal parts: 1, 2, 3, 4. There are 4 parts altogether and 1 is shaded.",
            visual: { type: "diagram", diagram: { shape: "bar", parts: 4, shaded: [0] }, countParts: true },
          },
          { text: "**Conclude:** so the bar shows {1/4}. Tom compared the shaded part with the unshaded parts instead of with the whole." },
        ],
        conclusion: "Tom is wrong: 1 of 4 equal parts is shaded, so it is {1/4}.",
      },
      {
        type: "check",
        title: "Build an explanation",
        questionId: "fractions.ls-reason-1",
        intro: "Choose a word or number for each gap to build a full explanation.",
      },
      {
        type: "explain",
        title: "Counterexamples",
        body: [
          "To show a claim is **not always true**, you only need **one example** where it fails. That is called a **counterexample**.",
          "Claim: “Every fraction with a 2 on top is bigger than {1/2}.” Counterexample: {2/8} has 2 on top, but it is smaller than {1/2}.",
        ],
        visual: { type: "compare-bars", a: f(2, 8), b: f(1, 2) },
      },
      {
        type: "check",
        title: "Find a counterexample",
        questionId: "fractions.ls-reason-2",
        intro: "This time there is no sentence to fill in — build the fractions that prove the claim wrong.",
      },
    ],
  },
];

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
