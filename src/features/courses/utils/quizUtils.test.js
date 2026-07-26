// The repository's alias-only import resolver does not recognize Node's built-in protocol.
// eslint-disable-next-line import/no-unresolved
import test from "node:test"
// eslint-disable-next-line import/no-unresolved
import assert from "node:assert/strict"

import {
  buildQuestionFormData,
  buildQuizAnswerPayload,
  buildQuizFormData,
  buildQuizPayload,
  buildQuizUpdatePayload,
  createInitialQuizForm,
  getQuizDeadlineMs,
  getQuizErrorMessage,
  getQuizListFromResponse,
  getQuizObjectFromResponse,
  getQuizTimeRemaining,
  getStudentQuizAttemptFromResponse,
  mapQuizToFormState,
  mergeQuizResultQuestions,
  unwrapApiPayload,
  validateQuizForm,
} from "./quizUtils.js"

const createPublishableForm = () => ({
  ...createInitialQuizForm(),
  title: "Midterm",
  openDate: new Date("2026-08-01T00:00:00.000Z"),
  closeDate: new Date("2026-08-02T00:00:00.000Z"),
  questions: [{
    type: "Essay",
    content: "Write a short answer.",
    score: 5,
    correctAnswers: [],
    maxWordCount: 500,
    required: true,
  }],
})

test("API payload helpers unwrap valid response shapes safely", () => {
  const quiz = { id: 1, name: "Quiz" }

  assert.equal(unwrapApiPayload({ data: quiz }), quiz)
  assert.equal(unwrapApiPayload(quiz), quiz)
  assert.equal(unwrapApiPayload({ data: null }), null)
  assert.deepEqual(getQuizListFromResponse({ data: [] }), [])
  assert.deepEqual(getQuizListFromResponse([quiz]), [quiz])
  assert.equal(getQuizObjectFromResponse({ data: quiz }), quiz)
})

test("quiz response helpers reject malformed containers and entries", () => {
  assert.equal(getQuizListFromResponse({ data: {} }), null)
  assert.equal(getQuizListFromResponse({ data: [null] }), null)
  assert.equal(getQuizListFromResponse({ data: [{ unexpected: true }] }), null)
  assert.equal(getQuizObjectFromResponse({ data: [] }), null)
  assert.equal(getQuizObjectFromResponse({ data: "server detail" }), null)
  assert.equal(getQuizObjectFromResponse({}), null)
})

test("student attempt responses require a valid timer and unique renderable questions", () => {
  const validAttempt = {
    recordId: 10,
    attemptNumber: 1,
    startedAt: "2026-07-25T10:00:00.000Z",
    timeLimitMinutes: 60,
    questions: [{
      id: 1,
      type: "MultipleChoiceSingle",
      content: "Choose one.",
      points: 5,
      isRequired: true,
      options: ["A", "B"],
      maxWordCount: null,
    }],
  }

  assert.equal(
    getStudentQuizAttemptFromResponse({ data: validAttempt }),
    validAttempt,
  )
  assert.equal(
    getStudentQuizAttemptFromResponse({
      ...validAttempt,
      timeLimitMinutes: null,
    }),
    null,
  )
  assert.equal(
    getStudentQuizAttemptFromResponse({
      ...validAttempt,
      questions: [
        validAttempt.questions[0],
        { ...validAttempt.questions[0] },
      ],
    }),
    null,
  )
  assert.equal(
    getStudentQuizAttemptFromResponse({
      ...validAttempt,
      questions: [{
        ...validAttempt.questions[0],
        type: "Unknown",
      }],
    }),
    null,
  )
})

test("quiz mapping preserves an intentionally empty draft question list", () => {
  const form = mapQuizToFormState({
    data: {
      id: 7,
      name: "",
      status: "Draft",
      timeLimitMinutes: 0,
      maxAttempts: 0,
      passPercent: 0,
      questions: [],
    },
  })

  assert.ok(form)
  assert.deepEqual(form.questions, [])
  assert.equal(form.title, "")
  assert.equal(form.duration, "0")
  assert.equal(form.maxAttempts, 0)
  assert.equal(form.passPercent, 0)
  assert.equal(form.publishStatus, "draft")
})

test("new quiz form starts without production sample questions", () => {
  const firstForm = createInitialQuizForm()
  const secondForm = createInitialQuizForm()

  assert.deepEqual(firstForm.questions, [])
  assert.notEqual(firstForm, secondForm)
  assert.notEqual(firstForm.questions, secondForm.questions)
})

test("quiz mapping clones question arrays and rejects malformed question data", () => {
  const response = {
    id: "quiz-a",
    questions: [{
      id: 42,
      type: "MultipleChoiceMultiple",
      points: 0,
      content: "Pick",
      options: ["A", "B"],
      correctAnswers: [0],
    }],
  }
  const form = mapQuizToFormState(response)

  assert.deepEqual(form.questions[0], {
    id: "q-42",
    questionId: 42,
    type: "MultipleChoiceMultiple",
    score: 0,
    content: "Pick",
    options: ["A", "B"],
    correctAnswers: ["0"],
    skillTag: "",
    tipText: "",
    required: true,
  })
  form.questions[0].options.push("C")
  assert.deepEqual(response.questions[0].options, ["A", "B"])
  assert.equal(mapQuizToFormState({ id: 1, questions: "invalid" }), null)
})

test("full payload preserves zeros, empty drafts, and caller-controlled status", () => {
  const payload = buildQuizPayload({
    title: "",
    editorText: "",
    duration: "0",
    maxAttempts: 0,
    passPercent: 0,
    questions: [{
      type: "Essay",
      content: "",
      score: 0,
      required: false,
      correctAnswers: [],
      maxWordCount: 0,
    }],
  }, { status: "Draft" })

  assert.equal(payload.name, "")
  assert.equal(payload.timeLimitMinutes, 0)
  assert.equal(payload.maxAttempts, 0)
  assert.equal(payload.passPercent, 0)
  assert.equal(payload.status, "Draft")
  assert.equal(payload.questions[0].points, 0)
  assert.equal(payload.questions[0].maxWordCount, 0)
  assert.equal(payload.questions[0].isRequired, false)
  assert.deepEqual(payload.questions[0].correctAnswers, [])

  const noStatus = buildQuizPayload({ publishStatus: "now", questions: [] })
  assert.equal("status" in noStatus, false)
  assert.deepEqual(noStatus.questions, [])
})

test("payload omits undefined and invalid optional fields", () => {
  const payload = buildQuizPayload({
    title: "Draft",
    duration: undefined,
    openDate: new Date("invalid"),
    closeDate: undefined,
    questions: [{
      type: "Essay",
      content: undefined,
      score: undefined,
      required: undefined,
    }],
  })

  assert.deepEqual(payload, {
    name: "Draft",
    questions: [{
      type: "Essay",
      sortOrder: 1,
      options: null,
    }],
  })
})

test("update payload contains only normalized changed fields", () => {
  const baseline = createPublishableForm()
  const unchanged = {
    ...baseline,
    questions: baseline.questions.map((question) => cloneForTest(question)),
  }

  assert.deepEqual(buildQuizUpdatePayload(unchanged, baseline), {})

  const changed = {
    ...unchanged,
    passPercent: 0,
    editorText: "Updated",
  }
  assert.deepEqual(buildQuizUpdatePayload(changed, baseline), {
    description: "Updated",
    passPercent: 0,
  })
  assert.deepEqual(
    buildQuizUpdatePayload(unchanged, baseline, { status: "Draft" }),
    { status: "Draft" }
  )
})

test("quiz FormData uses indexed multipart question fields from Swagger", () => {
  const mediaFile = new File(["image"], "question.png", {
    type: "image/png",
    lastModified: 100,
  })
  const audioFile = new File(["audio"], "question.mp3", {
    type: "audio/mpeg",
    lastModified: 200,
  })
  const payload = buildQuizPayload({
    title: "Media quiz",
    duration: 30,
    questions: [{
      type: "MultipleChoiceSingle",
      content: "Choose one.",
      score: 5,
      required: false,
      options: ["A", "B"],
      correctAnswers: ["1"],
      mediaUrl: "blob:https://client.invalid/image",
      audioUrl: "blob:https://client.invalid/audio",
      mediaFile,
      audioFile,
    }],
  }, { status: "Draft" })

  const formData = buildQuizFormData(payload)

  assert.equal(formData.get("Name"), "Media quiz")
  assert.equal(formData.get("TimeLimitMinutes"), "30")
  assert.equal(formData.get("Status"), "Draft")
  assert.equal(formData.get("Questions"), null)
  assert.equal(formData.get("questions"), null)
  assert.equal(formData.get("Questions[0].Type"), "MultipleChoiceSingle")
  assert.equal(formData.get("Questions[0].Content"), "Choose one.")
  assert.equal(formData.get("Questions[0].Points"), "5")
  assert.equal(formData.get("Questions[0].IsRequired"), "false")
  assert.equal(formData.get("Questions[0].Options[0]"), "A")
  assert.equal(formData.get("Questions[0].Options[1]"), "B")
  assert.equal(formData.get("Questions[0].CorrectAnswers[0]"), "1")
  assert.equal(formData.get("Questions[0].MediaFile"), mediaFile)
  assert.equal(formData.get("Questions[0].AudioFile"), audioFile)
  assert.equal(formData.get("Questions[0].MediaUrl"), null)
  assert.equal(formData.get("Questions[0].AudioUrl"), null)
  assert.equal(formData.get("Questions[0].ClearMedia"), null)
  assert.equal(formData.get("Questions[0].ClearAudio"), null)
})

test("quiz update FormData includes persisted IDs and clear flags", () => {
  const payload = buildQuizPayload({
    questions: [{
      id: "q-42",
      questionId: 42,
      type: "Essay",
      content: "Updated prompt",
      score: 10,
      required: true,
      maxWordCount: 250,
      clearMedia: true,
      clearAudio: false,
    }],
  })

  const formData = buildQuizFormData(payload, { isUpdate: true })

  assert.equal(formData.get("Questions[0].Id"), "42")
  assert.equal(formData.get("Questions[0].Type"), "Essay")
  assert.equal(formData.get("Questions[0].MaxWordCount"), "250")
  assert.equal(formData.get("Questions[0].ClearMedia"), "true")
  assert.equal(formData.get("Questions[0].ClearAudio"), null)
})

test("standalone question FormData sends arrays as indexed fields", () => {
  const formData = buildQuestionFormData({
    type: "MultipleChoiceMultiple",
    content: "Pick two.",
    points: 4,
    options: ["A", "B", "C"],
    correctAnswers: ["0", "2"],
  })

  assert.equal(formData.get("Type"), "MultipleChoiceMultiple")
  assert.equal(formData.get("Content"), "Pick two.")
  assert.equal(formData.get("Points"), "4")
  assert.equal(formData.get("Options"), null)
  assert.equal(formData.get("Options[0]"), "A")
  assert.equal(formData.get("Options[2]"), "C")
  assert.equal(formData.get("CorrectAnswers[0]"), "0")
  assert.equal(formData.get("CorrectAnswers[1]"), "2")
})

test("update payload detects replacing one selected file with another", () => {
  const baseline = createPublishableForm()
  baseline.questions[0].mediaFile = new File(["one"], "question.png", {
    type: "image/png",
    lastModified: 100,
  })
  const changed = {
    ...baseline,
    questions: baseline.questions.map((question) => ({
      ...question,
      mediaFile: new File(["two"], "question.png", {
        type: "image/png",
        lastModified: 200,
      }),
    })),
  }

  assert.ok(buildQuizUpdatePayload(changed, baseline).questions)
})

test("draft validation permits incomplete quiz content but rejects malformed values", () => {
  const emptyDraft = {
    title: "Draft quiz",
    questions: [],
    openDate: null,
    closeDate: null,
  }
  assert.deepEqual(validateQuizForm(emptyDraft, { mode: "draft" }), {
    isValid: true,
    errors: [],
    firstError: null,
  })

  const invalidDraft = validateQuizForm({
    ...emptyDraft,
    duration: -1,
    openDate: "not-a-date",
  }, { mode: "draft" })
  assert.equal(invalidDraft.isValid, false)
  assert.deepEqual(
    invalidDraft.errors.map((error) => error.code),
    ["QuizInvalidTimeLimit", "QuizInvalidOpenTime"]
  )

  const unnamedDraft = validateQuizForm({
    ...emptyDraft,
    title: " ",
  }, { mode: "draft" })
  assert.equal(unnamedDraft.isValid, false)
  assert.equal(unnamedDraft.errors[0].code, "QuizNameRequired")
  assert.equal(
    unnamedDraft.firstError,
    "Enter a quiz name before saving the draft."
  )
})

test("publish validation covers required fields, dates, options, and answers", () => {
  const result = validateQuizForm({
    title: " ",
    duration: 45,
    maxAttempts: 1,
    passPercent: 50,
    openDate: "2026-08-02T00:00:00.000Z",
    closeDate: "2026-08-01T00:00:00.000Z",
    questions: [{
      type: "MultipleChoiceSingle",
      content: "",
      score: 5,
      options: ["A", ""],
      correctAnswers: ["3"],
    }],
  }, { now: Date.parse("2026-07-01T00:00:00.000Z") })

  assert.equal(result.isValid, false)
  assert.equal(result.firstError, "Enter a quiz name before publishing.")
  assert.deepEqual(
    result.errors.map((error) => error.code),
    [
      "QuizNameRequired",
      "QuizInvalidCloseTime",
      "QuizQuestionContentRequired",
      "QuizInvalidQuestionOptions",
      "QuizInvalidCorrectAnswers",
    ]
  )
})

test("publish validation accepts zero pass percentage and zero-point questions", () => {
  const form = createPublishableForm()
  form.passPercent = 0
  form.questions = [{
    type: "FillInBlank",
    content: "Complete this",
    score: 0,
    correctAnswers: ["answer"],
  }]

  assert.equal(
    validateQuizForm(form, {
      mode: "publish",
      now: Date.parse("2026-07-01T00:00:00.000Z"),
    }).isValid,
    true
  )
})

test("answer payload preserves numeric and string question IDs and answer zero", () => {
  const questions = [
    { id: 10, type: "MultipleChoiceSingle" },
    { id: "question-uuid", type: "MultipleChoiceMultiple" },
    { id: "fill-id", type: "FillInBlank" },
  ]
  const answers = {
    10: 0,
    "question-uuid": [0, "2"],
    "fill-id": 0,
  }

  assert.deepEqual(buildQuizAnswerPayload(answers, questions), [
    {
      questionId: 10,
      selectedOptions: ["0"],
      fillText: null,
    },
    {
      questionId: "question-uuid",
      selectedOptions: ["0", "2"],
      fillText: null,
    },
    {
      questionId: "fill-id",
      selectedOptions: null,
      fillText: "0",
    },
  ])
})

test("answer payload supports Maps without coercing their IDs", () => {
  const answers = new Map([
    [99, "1"],
    ["external-id", null],
  ])

  assert.deepEqual(buildQuizAnswerPayload(answers), [
    {
      questionId: 99,
      selectedOptions: ["1"],
      fillText: null,
    },
    {
      questionId: "external-id",
      selectedOptions: [],
      fillText: null,
    },
  ])
})

test("deadline helpers calculate against an absolute start and reject invalid dates", () => {
  const start = Date.parse("2026-07-25T10:00:00.000Z")
  const deadline = getQuizDeadlineMs({
    startedAt: "2026-07-25T10:00:00.000Z",
    timeLimitMinutes: 45,
  })

  assert.equal(deadline, start + (45 * 60_000))
  assert.equal(getQuizTimeRemaining(deadline, start + 500), 2700)
  assert.equal(getQuizTimeRemaining(deadline, deadline + 1), 0)
  assert.equal(getQuizDeadlineMs({
    startedAt: "not-a-date",
    timeLimitMinutes: 45,
  }), null)
  assert.equal(getQuizDeadlineMs({
    startedAt: start,
    timeLimitMinutes: "invalid",
  }), null)
  assert.equal(getQuizTimeRemaining("invalid", start), null)
})

test("deadline helper uses the supplied current time only when startedAt is absent", () => {
  assert.equal(getQuizDeadlineMs({
    timeLimitMinutes: 0,
    nowMs: 1234,
  }), 1234)
  assert.equal(getQuizDeadlineMs({
    startedAt: "invalid",
    timeLimitMinutes: 10,
    nowMs: 1234,
  }), null)
})

test("known API errors are localized and unknown details are never exposed", () => {
  assert.equal(
    getQuizErrorMessage({ data: { code: "QuizMaxAttemptsReached" } }, "en"),
    "You have used all available attempts for this quiz."
  )
  assert.equal(
    getQuizErrorMessage({ data: { errorCode: "QuizNoActiveAttempt" } }, "vi"),
    "Không tìm thấy lượt làm bài đang hoạt động. Hãy bắt đầu hoặc tiếp tục bài rồi thử lại."
  )
  assert.equal(
    getQuizErrorMessage({ code: "QuizClosedFieldRestricted" }, "en"),
    "Closed quizzes cannot change their schedule, late-submission setting, time limit, questions, grading scale, or result-release mode.",
  )

  const unsafeError = {
    data: {
      code: "DatabaseFailure",
      message: "SELECT * FROM Users; token=secret",
    },
  }
  assert.equal(
    getQuizErrorMessage(unsafeError, "en"),
    "The action could not be completed. Please try again."
  )
  assert.equal(
    getQuizErrorMessage(unsafeError, "vi", "Vui lòng thử lại sau."),
    "Vui lòng thử lại sau."
  )
})

test("result question merge enriches only matching returned questions", () => {
  const resultQuestions = [
    { questionId: "a", pointsEarned: 1 },
    { questionId: "missing", status: "Pending" },
  ]
  const attemptQuestions = [
    { id: "a", content: "Question A", options: ["A", "B"], internal: "ignore" },
    { id: "attempt-only", content: "Do not add" },
  ]

  assert.deepEqual(
    mergeQuizResultQuestions(resultQuestions, attemptQuestions),
    [
      {
        questionId: "a",
        pointsEarned: 1,
        content: "Question A",
        options: ["A", "B"],
      },
      { questionId: "missing", status: "Pending" },
    ]
  )
  assert.deepEqual(mergeQuizResultQuestions(null, attemptQuestions), [])
  assert.equal(resultQuestions[0].content, undefined)
})

const cloneForTest = (value) => JSON.parse(JSON.stringify(value))
