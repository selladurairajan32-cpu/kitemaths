import type { Fraction } from "./math";
import { compare, equivalent, sameFraction } from "./math";

export type LabMode = "build" | "compare" | "equivalent" | "line";

export type LabCheck =
  | { kind: "make"; target: Fraction; parts?: number }
  | { kind: "bigger-than"; than: Fraction; parts: number }
  | { kind: "compare"; a: Fraction; b: Fraction }
  | { kind: "equivalent"; to: Fraction; parts: number };

export interface LabChallenge {
  id: string;
  mode: LabMode;
  text: string;
  hint: string;
  check: LabCheck;
  success: string;
  observe?: { prompt: string; options: { id: string; label: string }[]; answer: string; retry: string };
}

export function challengeFeedback(check: LabCheck, s: LabSnapshot): string {
  switch (check.kind) {
    case "make":
      if (check.parts !== undefined && s.build.d !== check.parts) {
        return `Your shape has ${s.build.d} part${s.build.d === 1 ? "" : "s"}. This challenge needs ${check.parts} equal parts.`;
      }
      return `You've shaded ${s.build.n} of ${s.build.d}. That isn't the same amount as ${check.target.n}/${check.target.d} yet.`;
    case "bigger-than":
      if (s.build.d !== check.parts) return `Set the shape to ${check.parts} equal parts first.`;
      return `${s.build.n}/${s.build.d} is not bigger than ${check.than.n}/${check.than.d} yet. Shade a few more parts.`;
    case "compare":
      return `The bars show ${s.compareTop.n}/${s.compareTop.d} and ${s.compareBottom.n}/${s.compareBottom.d}. Set them to ${check.a.n}/${check.a.d} and ${check.b.n}/${check.b.d}.`;
    case "equivalent":
      if (s.equivalentBase.n !== check.to.n || s.equivalentBase.d !== check.to.d) {
        return `Start by setting the top bar to ${check.to.n}/${check.to.d}.`;
      }
      return `The split bar has ${s.equivalentResult.d} parts. Change how many pieces each part is split into to reach ${check.parts}.`;
  }
}

/** What the lab currently shows, expressed as fractions. */
export interface LabSnapshot {
  build: Fraction;
  compareTop: Fraction;
  compareBottom: Fraction;
  equivalentBase: Fraction;
  equivalentResult: Fraction;
}

export function checkChallenge(check: LabCheck, s: LabSnapshot): boolean {
  switch (check.kind) {
    case "make":
      return (
        s.build.n > 0 &&
        equivalent(s.build, check.target) &&
        (check.parts === undefined || s.build.d === check.parts)
      );
    case "bigger-than":
      return s.build.d === check.parts && compare(s.build, check.than) > 0;
    case "compare":
      return sameFraction(s.compareTop, check.a) && sameFraction(s.compareBottom, check.b);
    case "equivalent":
      return (
        s.equivalentResult.d === check.parts &&
        sameFraction(s.equivalentBase, check.to) &&
        equivalent(s.equivalentResult, check.to)
      );
  }
}

export const LAB_LIMITS = { minParts: 1, maxParts: 12, maxSplit: 4 };
