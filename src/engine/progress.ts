import type { Evaluation, ItemResult, SkillId } from "./types";

export const STATE_VERSION = 1;

export interface LessonProgress {
  step: number;
  furthestStep: number;
  completed: boolean;
  completedAt?: number;
  /** Marked done by the placement check rather than by working through it. */
  placedOut?: boolean;
}

export interface PracticeState {
  active: boolean;
  startedAt: number | null;
  sessionAsked: string[];
  sessionResults: number;
  current: string | null;
  currentReason: string | null;
  focusSkill: SkillId | null;
  sessionsCompleted: number;
}

export interface AttemptRecord {
  form: string;
  seed: number;
  order: string[];
  responses: Record<string, unknown>;
  evaluations: Record<string, Evaluation>;
  startedAt: number;
  completedAt?: number;
}

export interface AssessmentState {
  status: "not-started" | "in-progress" | "complete";
  form: string;
  seed: number;
  startedAt?: number;
  order: string[];
  index: number;
  responses: Record<string, unknown>;
  evaluations: Record<string, Evaluation>;
  completedAt?: number;
  timesCompleted: number;
  last?: AttemptRecord;
}

export interface RecheckState extends AttemptRecord {
  skill: SkillId;
  index: number;
}

export interface LearnerProfile {
  name: string;
  /** School year, 3–6, if the learner chose one. */
  year: number | null;
  avatar: string;
}

export interface LearnerSettings {
  sound: boolean;
  /** Read each new question aloud automatically. */
  autoRead: boolean;
}

export interface PlacementState {
  status: "not-started" | "in-progress" | "complete" | "skipped";
  order: string[];
  index: number;
  correct: string[];
  wrong: string[];
  /** Lessons the placement showed the learner already knows. */
  placedOut: string[];
  completedAt?: number;
}

export interface LearnerState {
  version: number;
  profile: LearnerProfile;
  settings: LearnerSettings;
  placement: PlacementState;
  lessons: Record<string, LessonProgress>;
  currentLessonId: string | null;
  results: ItemResult[];
  practice: PracticeState;
  assessment: AssessmentState;
  recheck: RecheckState | null;
  rechecks: Record<SkillId, AttemptRecord>;
  labChallenges: string[];
}

export function createInitialState(): LearnerState {
  return {
    version: STATE_VERSION,
    profile: { name: "", year: null, avatar: "kip" },
    settings: { sound: true, autoRead: false },
    placement: { status: "not-started", order: [], index: 0, correct: [], wrong: [], placedOut: [] },
    lessons: {},
    currentLessonId: null,
    results: [],
    practice: {
      active: false,
      startedAt: null,
      sessionAsked: [],
      sessionResults: 0,
      current: null,
      currentReason: null,
      focusSkill: null,
      sessionsCompleted: 0,
    },
    assessment: {
      status: "not-started",
      form: "A",
      seed: 0,
      order: [],
      index: 0,
      responses: {},
      evaluations: {},
      timesCompleted: 0,
    },
    recheck: null,
    rechecks: {},
    labChallenges: [],
  };
}

export function isCompatibleState(raw: unknown): boolean {
  return !!raw && typeof raw === "object" && (raw as { version?: unknown }).version === STATE_VERSION;
}

/** Accepts unknown persisted data and returns a safe state. */
export function hydrateState(raw: unknown): LearnerState {
  const fresh = createInitialState();
  if (!isCompatibleState(raw)) return fresh;
  const data = raw as Partial<LearnerState>;
  const assessment: AssessmentState = {
    ...fresh.assessment,
    ...(isRecord(data.assessment) ? data.assessment : {}),
  };
  if (assessment.status === "complete" && !assessment.last) {
    assessment.last = {
      form: assessment.form,
      seed: assessment.seed,
      order: assessment.order,
      responses: assessment.responses,
      evaluations: assessment.evaluations,
      startedAt: assessment.completedAt ?? 0,
      completedAt: assessment.completedAt,
    };
  }
  return {
    ...fresh,
    ...data,
    lessons: isRecord(data.lessons) ? data.lessons : {},
    results: Array.isArray(data.results) ? data.results : [],
    practice: { ...fresh.practice, ...(isRecord(data.practice) ? data.practice : {}) },
    assessment,
    recheck: isRecord(data.recheck) ? (data.recheck as unknown as RecheckState) : null,
    rechecks: isRecord(data.rechecks) ? data.rechecks : {},
    labChallenges: Array.isArray(data.labChallenges) ? data.labChallenges : [],
    profile: { ...fresh.profile, ...(isRecord(data.profile) ? data.profile : {}) },
    settings: { ...fresh.settings, ...(isRecord(data.settings) ? data.settings : {}) },
    placement: isRecord(data.placement)
      ? { ...fresh.placement, ...data.placement }
      : // Learners from before placement existed already have a journey: don't ask them.
        { ...fresh.placement, status: hasHistory(data) ? "skipped" : "not-started" },
  };
}

function hasHistory(data: Partial<LearnerState>): boolean {
  return (Array.isArray(data.results) && data.results.length > 0) || (isRecord(data.lessons) && Object.keys(data.lessons).length > 0);
}

function isRecord(v: unknown): v is Record<string, never> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function lesson(state: LearnerState, id: string): LessonProgress {
  return state.lessons[id] ?? { step: 0, furthestStep: 0, completed: false };
}

export function openLesson(state: LearnerState, lessonId: string): LearnerState {
  return {
    ...state,
    currentLessonId: lessonId,
    lessons: { ...state.lessons, [lessonId]: lesson(state, lessonId) },
  };
}

export function goToStep(state: LearnerState, lessonId: string, step: number): LearnerState {
  const current = lesson(state, lessonId);
  if (state.currentLessonId === lessonId && current.step === step && state.lessons[lessonId]) return state;
  return {
    ...state,
    currentLessonId: lessonId,
    lessons: {
      ...state.lessons,
      [lessonId]: {
        ...current,
        step,
        furthestStep: Math.max(current.furthestStep, step),
      },
    },
  };
}

export function completeLesson(state: LearnerState, lessonId: string, at: number): LearnerState {
  const current = lesson(state, lessonId);
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...current, completed: true, completedAt: current.completedAt ?? at },
    },
  };
}

export function hasResult(state: LearnerState, id: string | undefined): boolean {
  return !!id && state.results.some((r) => r.id === id);
}

export function recordResult(state: LearnerState, result: ItemResult): LearnerState {
  if (hasResult(state, result.id)) return state;
  return { ...state, results: [...state.results, result] };
}

export function completeLabChallenge(state: LearnerState, id: string): LearnerState {
  if (state.labChallenges.includes(id)) return state;
  return { ...state, labChallenges: [...state.labChallenges, id] };
}

export function setPracticeFocus(state: LearnerState, focusSkill: SkillId | null): LearnerState {
  if (state.practice.active) return state;
  return { ...state, practice: { ...state.practice, focusSkill } };
}

export function startPracticeSession(state: LearnerState, focusSkill: SkillId | null, at: number): LearnerState {
  return {
    ...state,
    practice: {
      ...state.practice,
      active: true,
      startedAt: at,
      sessionAsked: [],
      sessionResults: 0,
      current: null,
      currentReason: null,
      focusSkill,
    },
  };
}

export function setPracticeQuestion(
  state: LearnerState,
  questionId: string | null,
  reason: string | null = null,
): LearnerState {
  const asked =
    questionId && !state.practice.sessionAsked.includes(questionId)
      ? [...state.practice.sessionAsked, questionId]
      : state.practice.sessionAsked;
  return {
    ...state,
    practice: { ...state.practice, current: questionId, currentReason: reason, sessionAsked: asked },
  };
}

export function finishPracticeQuestion(state: LearnerState, result: ItemResult): LearnerState {
  if (hasResult(state, result.id)) return state;
  const next = recordResult(state, result);
  return {
    ...next,
    practice: { ...next.practice, sessionResults: next.practice.sessionResults + 1 },
  };
}

export function completePracticeSession(state: LearnerState): LearnerState {
  if (!state.practice.active) return state;
  return {
    ...state,
    practice: {
      ...state.practice,
      active: false,
      current: null,
      currentReason: null,
      sessionsCompleted: state.practice.sessionsCompleted + 1,
    },
  };
}

export function dismissPracticeSummary(state: LearnerState): LearnerState {
  if (state.practice.active) return state;
  return { ...state, practice: { ...state.practice, startedAt: null, sessionResults: 0, sessionAsked: [] } };
}

export function startAssessment(state: LearnerState, order: string[], form = "A", seed = 0, at = 0): LearnerState {
  return {
    ...state,
    assessment: {
      ...state.assessment,
      status: "in-progress",
      form,
      seed,
      startedAt: at,
      order,
      index: 0,
      responses: {},
      evaluations: {},
      completedAt: undefined,
    },
  };
}

export function answerAssessment(
  state: LearnerState,
  questionId: string,
  response: unknown,
  evaluation: Evaluation,
): LearnerState {
  return {
    ...state,
    assessment: {
      ...state.assessment,
      responses: { ...state.assessment.responses, [questionId]: response },
      evaluations: { ...state.assessment.evaluations, [questionId]: evaluation },
    },
  };
}

export function clearAssessmentAnswer(state: LearnerState, questionId: string): LearnerState {
  const responses = { ...state.assessment.responses };
  const evaluations = { ...state.assessment.evaluations };
  delete responses[questionId];
  delete evaluations[questionId];
  return { ...state, assessment: { ...state.assessment, responses, evaluations } };
}

export function setAssessmentIndex(state: LearnerState, index: number): LearnerState {
  return { ...state, assessment: { ...state.assessment, index } };
}

export function finishAssessment(state: LearnerState, results: ItemResult[], at: number): LearnerState {
  if (state.assessment.status !== "in-progress") return state;
  const a = state.assessment;
  return {
    ...state,
    results: [...state.results, ...results],
    assessment: {
      ...a,
      status: "complete",
      completedAt: at,
      timesCompleted: a.timesCompleted + 1,
      last: {
        form: a.form,
        seed: a.seed,
        order: a.order,
        responses: a.responses,
        evaluations: a.evaluations,
        startedAt: a.startedAt ?? at,
        completedAt: at,
      },
    },
  };
}

export function startRecheck(
  state: LearnerState,
  skill: SkillId,
  order: string[],
  form: string,
  seed: number,
  at: number,
): LearnerState {
  return {
    ...state,
    recheck: { skill, order, form, seed, startedAt: at, index: 0, responses: {}, evaluations: {} },
  };
}

export function answerRecheck(
  state: LearnerState,
  questionId: string,
  response: unknown | null,
  evaluation: Evaluation | null,
): LearnerState {
  if (!state.recheck) return state;
  const responses = { ...state.recheck.responses };
  const evaluations = { ...state.recheck.evaluations };
  if (response === null || !evaluation) {
    delete responses[questionId];
    delete evaluations[questionId];
  } else {
    responses[questionId] = response;
    evaluations[questionId] = evaluation;
  }
  return { ...state, recheck: { ...state.recheck, responses, evaluations } };
}

export function setRecheckIndex(state: LearnerState, index: number): LearnerState {
  if (!state.recheck) return state;
  return { ...state, recheck: { ...state.recheck, index } };
}

export function finishRecheck(state: LearnerState, results: ItemResult[], at: number): LearnerState {
  const r = state.recheck;
  if (!r) return state;
  const attempt: AttemptRecord = {
    form: r.form,
    seed: r.seed,
    order: r.order,
    responses: r.responses,
    evaluations: r.evaluations,
    startedAt: r.startedAt,
    completedAt: at,
  };
  return {
    ...state,
    results: [...state.results, ...results],
    recheck: null,
    rechecks: { ...state.rechecks, [r.skill]: attempt },
  };
}

export function cancelRecheck(state: LearnerState): LearnerState {
  return { ...state, recheck: null };
}

export function setProfile(state: LearnerState, profile: Partial<LearnerProfile>): LearnerState {
  return { ...state, profile: { ...state.profile, ...profile } };
}

export function setSettings(state: LearnerState, settings: Partial<LearnerSettings>): LearnerState {
  return { ...state, settings: { ...state.settings, ...settings } };
}

export function startPlacement(state: LearnerState, order: string[]): LearnerState {
  return {
    ...state,
    placement: { status: "in-progress", order, index: 0, correct: [], wrong: [], placedOut: [] },
  };
}

export function skipPlacement(state: LearnerState): LearnerState {
  return { ...state, placement: { ...state.placement, status: "skipped" } };
}

/** Records one placement answer. Placement answers are kept as evidence but never count towards mastery. */
export function answerPlacement(state: LearnerState, result: ItemResult): LearnerState {
  const p = state.placement;
  if (p.status !== "in-progress" || hasResult(state, result.id)) return state;
  const id = result.questionId;
  return {
    ...recordResult(state, result),
    placement: {
      ...p,
      index: p.index + 1,
      correct: result.correct ? [...p.correct, id] : p.correct,
      wrong: result.correct ? p.wrong : [...p.wrong, id],
    },
  };
}

/** Finishes placement: lessons the learner showed they know are marked as done. */
export function finishPlacement(state: LearnerState, placedOut: string[], at: number): LearnerState {
  if (state.placement.status !== "in-progress") return state;
  let next: LearnerState = state;
  for (const lessonId of placedOut) {
    const current = lesson(next, lessonId);
    next = {
      ...next,
      lessons: { ...next.lessons, [lessonId]: { ...current, completed: true, completedAt: current.completedAt ?? at, placedOut: true } },
    };
  }
  return { ...next, placement: { ...next.placement, status: "complete", placedOut, completedAt: at } };
}
