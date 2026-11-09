import type { MisconceptionDef } from "@/engine/types";

export const M = {
  SWAP: "fractions.numerator-denominator-swap",
  BIGGER_DEN: "fractions.bigger-denominator-bigger-piece",
  UNEQUAL: "fractions.unequal-parts",
  PART_PART: "fractions.part-to-part",
  MISCOUNT: "fractions.miscounted-total",
  UNIT_ONLY: "fractions.found-one-part-only",
  ADDITIVE: "fractions.additive-equivalence",
  ADD_DEN: "fractions.added-denominators",
} as const;

export const MISCONCEPTIONS: MisconceptionDef[] = [
  {
    id: M.SWAP,
    name: "Mixing up numerator and denominator",
    possibleCause:
      "It looks like the top and bottom numbers might have swapped places.",
    description:
      "Writes the total number of parts on top and the chosen parts underneath, or divides by the numerator.",
    explanation: [
      "The **bottom number (denominator)** tells us how many equal parts the whole is split into. Count every part.",
      "The **top number (numerator)** tells us how many of those parts we are talking about. Count only the shaded parts.",
    ],
    alternatives: [
      "A slip when typing into the boxes (the numbers went in the wrong boxes).",
      "Reading the picture from a different side and counting the wrong group.",
    ],
    skills: ["fractions.name", "fractions.represent", "fractions.fraction-of", "fractions.number-line"],
    followUps: ["fractions.fu-swap-1", "fractions.fu-swap-2"],
  },
  {
    id: M.BIGGER_DEN,
    name: "Thinking a bigger denominator means a bigger piece",
    possibleCause:
      "You might be thinking a bigger number on the bottom means a bigger fraction.",
    description:
      "Judges {1/8} to be larger than {1/3} because 8 is larger than 3.",
    explanation: [
      "The denominator tells us how many pieces the **same whole** is shared into.",
      "Sharing the same whole into **more** pieces makes each piece **smaller**. So with the same numerator, {1/8} is smaller than {1/3}.",
    ],
    alternatives: [
      "Comparing the numbers only, without looking at the pictures, as with whole numbers.",
      "Thinking about how many pieces there are rather than how big each one is.",
    ],
    skills: ["fractions.compare", "fractions.reasoning"],
    followUps: ["fractions.fu-bd-1", "fractions.fu-bd-2"],
  },
  {
    id: M.UNEQUAL,
    name: "Counting unequal parts as fractions",
    possibleCause:
      "It might be that the number of pieces was counted without checking they are the same size.",
    description:
      "Accepts a shape cut into different-sized pieces as showing halves, thirds or quarters.",
    explanation: [
      "Fractions only work when the whole is split into **equal** parts — fair shares.",
      "Three pieces are only thirds if all three pieces are exactly the same size.",
    ],
    alternatives: [
      "Counting pieces quickly without checking their sizes.",
      "Not seeing a small difference in size in the picture.",
    ],
    skills: ["fractions.equal-parts", "fractions.reasoning"],
    followUps: ["fractions.fu-ue-1", "fractions.fu-ue-2"],
  },
  {
    id: M.PART_PART,
    name: "Comparing part to part instead of part to whole",
    possibleCause:
      "You may have compared the shaded parts with the unshaded parts, instead of with the whole.",
    description:
      "Calls 1 shaded part out of 4 {1/3} because there is 1 shaded and 3 unshaded.",
    explanation: [
      "The denominator counts **all** the equal parts in the whole — shaded and unshaded together.",
      "1 shaded and 3 unshaded makes 4 parts altogether, so 1 of them is {1/4}.",
    ],
    alternatives: [
      "Counting the unshaded parts by mistake.",
      "A slip when counting the total.",
    ],
    skills: ["fractions.name", "fractions.reasoning"],
    followUps: ["fractions.fu-pp-1", "fractions.fu-pp-2"],
  },
  {
    id: M.MISCOUNT,
    name: "Miscounting the total number of parts",
    possibleCause:
      "The total might have been counted a little differently — for example counting the marks instead of the gaps.",
    description:
      "Counts lines or tick marks instead of parts or gaps, so the denominator is one too many or too few.",
    explanation: [
      "Count the **parts**, not the lines between them.",
      "On a number line, count the **gaps (jumps)** from 0 to 1, not the marks. 5 marks make only 4 gaps.",
    ],
    alternatives: [
      "Counting the marks instead of the gaps on a number line.",
      "Losing count on a busy picture.",
    ],
    skills: ["fractions.name", "fractions.number-line"],
    followUps: ["fractions.fu-mc-1", "fractions.fu-mc-2"],
  },
  {
    id: M.UNIT_ONLY,
    name: "Finding one part instead of several",
    possibleCause:
      "It looks like you found one part, but the question asked for more than one part.",
    description:
      "For {3/4} of 12, divides by 4 to get 3 but does not multiply by 3.",
    explanation: [
      "Dividing by the **denominator** gives the size of **one** equal part.",
      "Then multiply by the **numerator** to collect the number of parts you need.",
    ],
    alternatives: [
      "Stopping after the first step by mistake.",
      "Misreading the numerator as 1.",
    ],
    skills: ["fractions.fraction-of", "fractions.reasoning"],
    followUps: ["fractions.fu-uo-1", "fractions.fu-uo-2"],
  },
  {
    id: M.ADDITIVE,
    name: "Adding instead of multiplying for equivalence",
    possibleCause:
      "It might be that the same number was added to the top and bottom, instead of multiplying.",
    description:
      "Thinks {1/2} = {2/3} because 1 was added to the top and the bottom.",
    explanation: [
      "Equivalent fractions show the **same amount**.",
      "Splitting every part into the same number of smaller parts **multiplies** the top and bottom by the same number. Adding changes the amount.",
    ],
    alternatives: [
      "Guessing a pattern from one example.",
      "Knowing the rule but slipping in the calculation.",
    ],
    skills: ["fractions.equivalent", "fractions.reasoning"],
    followUps: ["fractions.fu-add-1", "fractions.fu-add-2"],
  },
  {
    id: M.ADD_DEN,
    name: "Adding or subtracting the denominators",
    possibleCause: "It looks like the bottom numbers might have been added (or taken away) too.",
    description: "Writes {2/7} + {3/7} = {5/14}, treating the denominator like another number to add.",
    explanation: [
      "The **denominator** names the **size** of the parts: sevenths are all the same size.",
      "Adding sevenths to sevenths still gives **sevenths**, so only the numerators are added: {2/7} + {3/7} = {5/7}. The whole is still split into 7.",
    ],
    alternatives: [
      "Following the rule for multiplying fractions, which is taught later.",
      "A slip: writing the denominator twice.",
    ],
    skills: ["fractions.add-same"],
    followUps: ["fractions.fu-ad-1", "fractions.fu-ad-2"],
  },
];

export function misconceptionById(id: string): MisconceptionDef | undefined {
  return MISCONCEPTIONS.find((m) => m.id === id);
}
