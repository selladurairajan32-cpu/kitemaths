import type { Evaluation, ItemResult, SkillId } from "./types";

export const STATE_VERSION = 2;

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
  /** PARENT-001, PARENT-003: the grown-up's chosen weekly workload. Optional; unset means 5 days of 15 minutes. */
  planDays?: number;
  planMinutes?: number;
  /** D-041: the way to learn an explanation the child chose last ("watch", "step" or "try"); unset means none yet. */
  explainMode?: string;
  /** D-041: whether Step through speaks each step. Unset means on. */
  explainVoice?: boolean;
}

export const DEFAULT_PLAN = { days: 5, minutes: 15 } as const;

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

/** One topic's progress. Results are shared across topics, so they live on the learner. */
export interface TopicProgress {
  placement: PlacementState;
  lessons: Record<string, LessonProgress>;
  currentLessonId: string | null;
  practice: PracticeState;
  assessment: AssessmentState;
  recheck: RecheckState | null;
  rechecks: Record<SkillId, AttemptRecord>;
  labChallenges: string[];
}

/**
 * What topic-level logic works on: one topic's progress plus every result.
 * Build it with `topicLearner()` and write it back with `inTopic()`.
 */
export interface TopicLearner extends TopicProgress {
  results: ItemResult[];
}

export interface LearnerState {
  version: number;
  profile: LearnerProfile;
  settings: LearnerSettings;
  /** The topic the learner was last working in. */
  currentTopicId: string | null;
  topics: Record<string, TopicProgress>;
  /** Every answer, in every topic. Skill and question ids are namespaced by topic. */
  results: ItemResult[];
}

export function createTopicProgress(): TopicProgress {
  return {
    placement: { status: "not-started", order: [], index: 0, correct: [], wrong: [], placedOut: [] },
    lessons: {},
    currentLessonId: null,
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

export function createInitialState(): LearnerState {
  return {
    version: STATE_VERSION,
    profile: { name: "", year: null, avatar: "kip" },
    settings: { sound: true, autoRead: false },
    currentTopicId: null,
    topics: {},
    results: [],
  };
}

/** A fresh learner with a topic view, for topic-level logic and tests. */
export function createTopicLearner(): TopicLearner {
  return { ...createTopicProgress(), results: [] };
}

/** One topic's progress (fresh if the learner hasn't started it) with every result. */
export function topicLearner(state: LearnerState, topicId: string): TopicLearner {
  return { ...(state.topics[topicId] ?? createTopicProgress()), results: state.results };
}

/** Applies a topic-level change and writes it back. Returns the same state if nothing changed. */
export function inTopic(state: LearnerState, topicId: string, fn: (t: TopicLearner) => TopicLearner): LearnerState {
  const view = topicLearner(state, topicId);
  const next = fn(view);
  if (next === view) return state;
  const { results, ...progress } = next;
  return { ...state, currentTopicId: topicId, results, topics: { ...state.topics, [topicId]: progress } };
}

export function isCompatibleState(raw: unknown): boolean {
  return !!raw && typeof raw === "object" && (raw as { version?: unknown }).version === STATE_VERSION;
}

/** Accepts unknown persisted data and returns a safe state. */
export function hydrateState(raw: unknown): LearnerState {
  const fresh = createInitialState();
  if (!isCompatibleState(raw)) return fresh;
  const data = raw as Partial<LearnerState>;
  const results = Array.isArray(data.results) ? data.results : [];
  const topics: Record<string, TopicProgress> = {};
  if (isRecord(data.topics)) {
    for (const [id, t] of Object.entries(data.topics as Record<string, unknown>)) topics[id] = hydrateTopic(t, false);
  }
  return {
    ...fresh,
    profile: { ...fresh.profile, ...(isRecord(data.profile) ? data.profile : {}) },
    settings: { ...fresh.settings, ...(isRecord(data.settings) ? data.settings : {}) },
    currentTopicId: typeof data.currentTopicId === "string" ? data.currentTopicId : null,
    topics,
    results,
  };
}

/**
 * Accepts one topic's saved progress (or a version-1 learner, which had the
 * same fields at the top level) and fills in anything missing.
 * `legacy` marks version-1 data, where a missing placement means the learner
 * predates placement and shouldn't be asked to take it.
 */
export function hydrateTopic(raw: unknown, legacy: boolean): TopicProgress {
  const fresh = createTopicProgress();
  if (!isRecord(raw)) return fresh;
  const data = raw as Partial<TopicLearner>;
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
    lessons: isRecord(data.lessons) ? data.lessons : {},
    currentLessonId: typeof data.currentLessonId === "string" ? data.currentLessonId : null,
    practice: { ...fresh.practice, ...(isRecord(data.practice) ? data.practice : {}) },
    assessment,
    recheck: isRecord(data.recheck) ? (data.recheck as unknown as RecheckState) : null,
    rechecks: isRecord(data.rechecks) ? data.rechecks : {},
    labChallenges: Array.isArray(data.labChallenges) ? data.labChallenges : [],
    placement: isRecord(data.placement)
      ? { ...fresh.placement, ...data.placement }
      : // Learners from before placement existed already have a journey: don't ask them.
        { ...fresh.placement, status: legacy && hasHistory(data) ? "skipped" : "not-started" },
  };
}

function hasHistory(data: Partial<TopicLearner>): boolean {
  return (Array.isArray(data.results) && data.results.length > 0) || (isRecord(data.lessons) && Object.keys(data.lessons).length > 0);
}

function isRecord(v: unknown): v is Record<string, never> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function lesson(state: TopicLearner, id: string): LessonProgress {
  return state.lessons[id] ?? { step: 0, furthestStep: 0, completed: false };
}

export function openLesson(state: TopicLearner, lessonId: string): TopicLearner {
  return {
    ...state,
    currentLessonId: lessonId,
    lessons: { ...state.lessons, [lessonId]: lesson(state, lessonId) },
  };
}

export function goToStep(state: TopicLearner, lessonId: string, step: number): TopicLearner {
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

export function completeLesson(state: TopicLearner, lessonId: string, at: number): TopicLearner {
  const current = lesson(state, lessonId);
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { ...current, completed: true, completedAt: current.completedAt ?? at },
    },
  };
}

export function hasResult(state: TopicLearner, id: string | undefined): boolean {
  return !!id && state.results.some((r) => r.id === id);
}

export function recordResult(state: TopicLearner, result: ItemResult): TopicLearner {
  if (hasResult(state, result.id)) return state;
  return { ...state, results: [...state.results, result] };
}

export function completeLabChallenge(state: TopicLearner, id: string): TopicLearner {
  if (state.labChallenges.includes(id)) return state;
  return { ...state, labChallenges: [...state.labChallenges, id] };
}

export function setPracticeFocus(state: TopicLearner, focusSkill: SkillId | null): TopicLearner {
  if (state.practice.active) return state;
  return { ...state, practice: { ...state.practice, focusSkill } };
}

export function startPracticeSession(state: TopicLearner, focusSkill: SkillId | null, at: number): TopicLearner {
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
  state: TopicLearner,
  questionId: string | null,
  reason: string | null = null,
): TopicLearner {
  const asked =
    questionId && !state.practice.sessionAsked.includes(questionId)
      ? [...state.practice.sessionAsked, questionId]
      : state.practice.sessionAsked;
  return {
    ...state,
    practice: { ...state.practice, current: questionId, currentReason: reason, sessionAsked: asked },
  };
}

export function finishPracticeQuestion(state: TopicLearner, result: ItemResult): TopicLearner {
  if (hasResult(state, result.id)) return state;
  const next = recordResult(state, result);
  return {
    ...next,
    practice: { ...next.practice, sessionResults: next.practice.sessionResults + 1 },
  };
}

export function completePracticeSession(state: TopicLearner): TopicLearner {
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

export function dismissPracticeSummary(state: TopicLearner): TopicLearner {
  if (state.practice.active) return state;
  return { ...state, practice: { ...state.practice, startedAt: null, sessionResults: 0, sessionAsked: [] } };
}

export function startAssessment(state: TopicLearner, order: string[], form = "A", seed = 0, at = 0): TopicLearner {
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
  state: TopicLearner,
  questionId: string,
  response: unknown,
  evaluation: Evaluation,
): TopicLearner {
  return {
    ...state,
    assessment: {
      ...state.assessment,
      responses: { ...state.assessment.responses, [questionId]: response },
      evaluations: { ...state.assessment.evaluations, [questionId]: evaluation },
    },
  };
}

export function clearAssessmentAnswer(state: TopicLearner, questionId: string): TopicLearner {
  const responses = { ...state.assessment.responses };
  const evaluations = { ...state.assessment.evaluations };
  delete responses[questionId];
  delete evaluations[questionId];
  return { ...state, assessment: { ...state.assessment, responses, evaluations } };
}

export function setAssessmentIndex(state: TopicLearner, index: number): TopicLearner {
  return { ...state, assessment: { ...state.assessment, index } };
}

export function finishAssessment(state: TopicLearner, results: ItemResult[], at: number): TopicLearner {
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
  state: TopicLearner,
  skill: SkillId,
  order: string[],
  form: string,
  seed: number,
  at: number,
): TopicLearner {
  return {
    ...state,
    recheck: { skill, order, form, seed, startedAt: at, index: 0, responses: {}, evaluations: {} },
  };
}

export function answerRecheck(
  state: TopicLearner,
  questionId: string,
  response: unknown | null,
  evaluation: Evaluation | null,
): TopicLearner {
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

export function setRecheckIndex(state: TopicLearner, index: number): TopicLearner {
  if (!state.recheck) return state;
  return { ...state, recheck: { ...state.recheck, index } };
}

export function finishRecheck(state: TopicLearner, results: ItemResult[], at: number): TopicLearner {
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

export function cancelRecheck(state: TopicLearner): TopicLearner {
  return { ...state, recheck: null };
}

export function setProfile(state: LearnerState, profile: Partial<LearnerProfile>): LearnerState {
  return { ...state, profile: { ...state.profile, ...profile } };
}

export function setSettings(state: LearnerState, settings: Partial<LearnerSettings>): LearnerState {
  return { ...state, settings: { ...state.settings, ...settings } };
}

export function startPlacement(state: TopicLearner, order: string[]): TopicLearner {
  return {
    ...state,
    placement: { status: "in-progress", order, index: 0, correct: [], wrong: [], placedOut: [] },
  };
}

export function skipPlacement(state: TopicLearner): TopicLearner {
  return { ...state, placement: { ...state.placement, status: "skipped" } };
}

/** Records one placement answer. Placement answers are kept as evidence but never count towards mastery. */
export function answerPlacement(state: TopicLearner, result: ItemResult): TopicLearner {
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
export function finishPlacement(state: TopicLearner, placedOut: string[], at: number): TopicLearner {
  if (state.placement.status !== "in-progress") return state;
  let next: TopicLearner = state;
  for (const lessonId of placedOut) {
    const current = lesson(next, lessonId);
    next = {
      ...next,
      lessons: { ...next.lessons, [lessonId]: { ...current, completed: true, completedAt: current.completedAt ?? at, placedOut: true } },
    };
  }
  return { ...next, placement: { ...next.placement, status: "complete", placedOut, completedAt: at } };
}
