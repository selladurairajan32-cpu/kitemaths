import { completeLesson, createInitialState, finishAssessment, inTopic, recordResult, startAssessment, type LearnerState } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { M } from "@/topics/fractions/misconceptions";

/** A saved learner for component tests: two lessons evidenced, some practice, a check with one skill to review, one possible misconception. */
let at = 1000;
const r = (p: Partial<ItemResult> & Pick<ItemResult, "skill" | "questionId">): ItemResult => {
  at += 10;
  return { context: "practice", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], difficulty: 1, at, ...p };
};

export function seededLearner(): LearnerState {
  let s = createInitialState();
  s = { ...s, currentTopicId: "fractions" };
  s = inTopic(s, "fractions", (t) => {
    let x = completeLesson(t, "wholes", 900);
    x = completeLesson(x, "naming", 950);
    x = recordResult(x, r({ skill: "fractions.equal-parts", questionId: "fractions.ls-wholes-1", context: "lesson" }));
    x = recordResult(x, r({ skill: "fractions.equal-parts", questionId: "fractions.ls-wholes-2", context: "lesson" }));
    for (const q of ["fractions.nm-1", "fractions.nm-2", "fractions.nm-3"]) x = recordResult(x, r({ skill: "fractions.name", questionId: q }));
    x = recordResult(x, r({ skill: "fractions.name", questionId: "fractions.nm-5", correct: false, firstTry: false, attempts: 2, misconceptions: [M.SWAP] }));
    x = recordResult(x, r({ skill: "fractions.compare", questionId: "fractions.cp-1" }));
    x = startAssessment(x, ["fractions.as-1", "fractions.as-5"], "A", 1, at);
    x = finishAssessment(
      x,
      [
        { ...r({ skill: "fractions.equal-parts", questionId: "fractions.as-1", context: "assessment" }), at: 5000 },
        { ...r({ skill: "fractions.compare", questionId: "fractions.as-5", context: "assessment", correct: false, firstTry: false }), at: 5000 },
      ],
      5000,
    );
    return x;
  });
  return s;
}

