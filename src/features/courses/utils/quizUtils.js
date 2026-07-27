const CHOICE_QUESTION_TYPES = new Set([
  "MultipleChoiceSingle",
  "MultipleChoiceMultiple",
  "TrueFalse",
])

const QUESTION_TYPES = new Set([
  ...CHOICE_QUESTION_TYPES,
  "FillInBlank",
  "Essay",
])

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const isFileValue = (value) => (
  typeof File !== "undefined" && value instanceof File
)

const isRecord = (value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const isQuizLike = (value) => (
  isRecord(value)
  && ["id", "classId", "name", "title", "status", "questions", "timeLimitMinutes"]
    .some((key) => hasOwn(value, key))
)

const toFiniteNumber = (value) => {
  if (
    value === undefined
    || value === null
    || (typeof value === "string" && value.trim() === "")
  ) {
    return undefined
  }

  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

const toValidDate = (value) => {
  if (value === undefined || value === null || value === "") return null

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const toIsoString = (value) => toValidDate(value)?.toISOString()

const toOptionalBoolean = (value) => (
  typeof value === "boolean" ? value : undefined
)

const toOptionalText = (value) => {
  if (value === undefined || value === null) return undefined
  return String(value)
}

const toNullableTrimmedText = (value) => {
  if (value === undefined) return undefined
  if (value === null) return null

  const text = String(value).trim()
  return text || null
}

const normalizeQuestionType = (type) => {
  if (type === "mcq") return "MultipleChoiceSingle"
  if (type === "essay") return "Essay"
  return typeof type === "string" && type ? type : undefined
}

const omitUndefined = (value) => {
  if (Array.isArray(value)) {
    return value.map(omitUndefined)
  }

  if (!isRecord(value)) return value

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, omitUndefined(item)])
  )
}

const createFormQuestionId = (questionId, index) => {
  if (questionId === undefined || questionId === null || questionId === "") {
    return `q-new-${index + 1}`
  }

  const id = String(questionId)
  return id.startsWith("q-") ? id : `q-${id}`
}

const mapQuestionToFormState = (question, index) => {
  const type = normalizeQuestionType(question.type) || "MultipleChoiceSingle"
  const points = toFiniteNumber(question.points)
  const maxWordCount = toFiniteNumber(question.maxWordCount)
  const questionId = toFiniteNumber(question.id ?? question.questionId)

  return omitUndefined({
    id: createFormQuestionId(question.id ?? question.questionId, index),
    questionId: Number.isInteger(questionId) && questionId > 0
      ? questionId
      : undefined,
    type,
    score: points ?? 5,
    content: typeof question.content === "string" ? question.content : "",
    options: Array.isArray(question.options)
      ? question.options.map(String)
      : [],
    correctAnswers: Array.isArray(question.correctAnswers)
      ? question.correctAnswers.map(String)
      : [],
    maxWordCount: type === "Essay" ? (maxWordCount ?? 500) : maxWordCount,
    skillTag: toOptionalText(question.skillTag) ?? "",
    tipText: toOptionalText(question.tipText) ?? "",
    required: question.isRequired ?? question.required ?? true,
    mediaUrl: question.mediaUrl || question.imageUrl || undefined,
    audioUrl: question.audioUrl || undefined,
  })
}

const buildQuestionPayload = (question, index) => {
  if (!isRecord(question)) return {}

  const type = normalizeQuestionType(question.type)
  const isChoiceQuestion = CHOICE_QUESTION_TYPES.has(type)
  const score = toFiniteNumber(question.score ?? question.points)
  const maxWordCount = toFiniteNumber(question.maxWordCount)
  const correctAnswers = Array.isArray(question.correctAnswers)
    ? question.correctAnswers.map(String)
    : undefined
  const questionId = toFiniteNumber(question.questionId)

  return omitUndefined({
    id: Number.isInteger(questionId) && questionId > 0
      ? questionId
      : undefined,
    type,
    content: toOptionalText(question.content),
    points: score,
    isRequired: toOptionalBoolean(question.required ?? question.isRequired),
    sortOrder: index + 1,
    skillTag: toNullableTrimmedText(question.skillTag),
    mediaFile: isFileValue(question.mediaFile)
      ? question.mediaFile
      : undefined,
    audioFile: isFileValue(question.audioFile)
      ? question.audioFile
      : undefined,
    clearMedia: question.clearMedia ? true : undefined,
    clearAudio: question.clearAudio ? true : undefined,
    options: isChoiceQuestion
      ? (Array.isArray(question.options) ? question.options.map(String) : undefined)
      : null,
    correctAnswers,
    maxWordCount: type === "Essay" ? maxWordCount : null,
    tipText: toNullableTrimmedText(question.tipText),
  })
}

const arePayloadValuesEqual = (left, right) => {
  if (Object.is(left, right)) return true
  if (isFileValue(left) || isFileValue(right)) return false

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left)
      && Array.isArray(right)
      && left.length === right.length
      && left.every((item, index) => (
        arePayloadValuesEqual(item, right[index])
      ))
    )
  }

  if (isRecord(left) || isRecord(right)) {
    if (!isRecord(left) || !isRecord(right)) return false
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)
    return (
      leftKeys.length === rightKeys.length
      && leftKeys.every((key) => (
        hasOwn(right, key)
        && arePayloadValuesEqual(left[key], right[key])
      ))
    )
  }

  return false
}

const addValidationError = (errors, field, code, message, questionIndex) => {
  errors.push(omitUndefined({ field, code, message, questionIndex }))
}

const isNonEmptyText = (value) => (
  typeof value === "string" && value.trim().length > 0
)

const getQuestionId = (question) => (
  isRecord(question) ? (question.id ?? question.questionId) : undefined
)

const hasValidId = (value) => (
  (typeof value === "string" && value.trim().length > 0)
  || (typeof value === "number" && Number.isFinite(value))
)

const isValidAttemptQuestion = (question) => {
  if (
    !isRecord(question)
    || !hasValidId(question.id)
    || !QUESTION_TYPES.has(question.type)
    || typeof question.content !== "string"
  ) {
    return false
  }

  const points = toFiniteNumber(question.points)
  if (points === undefined || points < 0) return false

  if (
    question.skillTag != null
    && typeof question.skillTag !== "string"
  ) {
    return false
  }
  if (
    question.tipText != null
    && typeof question.tipText !== "string"
  ) {
    return false
  }

  if (CHOICE_QUESTION_TYPES.has(question.type)) {
    return (
      Array.isArray(question.options)
      && question.options.length >= 2
      && question.options.every((option) => typeof option === "string")
    )
  }

  return (
    question.options == null
    || (
      Array.isArray(question.options)
      && question.options.every((option) => typeof option === "string")
    )
  )
}

const getAnswerEntries = (answers) => {
  if (answers instanceof Map) return [...answers.entries()]
  return isRecord(answers) ? Object.entries(answers) : []
}

const getErrorCode = (error) => {
  if (typeof error === "string") return error
  if (!isRecord(error)) return undefined

  const data = isRecord(error.data) ? error.data : null
  const nestedError = data && isRecord(data.error) ? data.error : null
  const candidates = [
    data?.code,
    data?.errorCode,
    nestedError?.code,
    error.code,
    error.errorCode,
  ]

  return candidates.find((code) => typeof code === "string" && code)
}

const QUIZ_ERROR_MESSAGES = {
  QuizNameRequired: {
    en: "Enter a quiz name before continuing.",
    vi: "Vui lòng nhập tên bài kiểm tra trước khi tiếp tục.",
    zh: "在继续之前请输入测试名称。",
  },
  QuizNoQuestions: {
    en: "Add at least one question before publishing the quiz.",
    vi: "Vui lòng thêm ít nhất một câu hỏi trước khi đăng bài kiểm tra.",
    zh: "在发布测试之前请至少添加一道题目。",
  },
  QuizInvalidCloseTime: {
    en: "Choose a closing time after the opening time and the current time.",
    vi: "Vui lòng chọn thời gian đóng sau thời gian mở và thời điểm hiện tại.",
    zh: "请选择在开放时间和当前时间之后的关闭时间。",
  },
  QuizHasSubmissions: {
    en: "This quiz cannot be deleted because it already has submissions.",
    vi: "Không thể xóa bài kiểm tra vì đã có bài nộp.",
    zh: "无法删除此测试，因为已存在提交记录。",
  },
  QuizAlreadyPublished: {
    en: "This quiz has already been published.",
    vi: "Bài kiểm tra này đã được đăng.",
    zh: "此测试已发布。",
  },
  QuizClosedFieldRestricted: {
    en: "Closed quizzes cannot change their schedule, late-submission setting, time limit, questions, grading scale, or result-release mode.",
    vi: "Bài kiểm tra đã đóng không thể thay đổi lịch, nộp muộn, thời lượng, câu hỏi, thang điểm hoặc chế độ trả kết quả.",
    zh: "已关闭的测试无法更改安排、迟交设置、时间限制、题目、评分标准或结果公布模式。",
  },
  QuizNotOpen: {
    en: "This quiz is not currently open.",
    vi: "Bài kiểm tra hiện không ở trạng thái đang mở.",
    zh: "此测试目前未开放。",
  },
  QuizMaxAttemptsReached: {
    en: "You have used all available attempts for this quiz.",
    vi: "Bạn đã sử dụng hết số lần làm bài cho phép.",
    zh: "您已用完此测试的所有允许尝试次数。",
  },
  QuizNoActiveAttempt: {
    en: "No active quiz attempt was found. Start or resume the quiz and try again.",
    vi: "Không tìm thấy lượt làm bài đang hoạt động. Hãy bắt đầu hoặc tiếp tục bài rồi thử lại.",
    zh: "未找到进行中的测试。请开始或继续测试后重试。",
  },
  QuizNotFound: {
    en: "The quiz could not be found.",
    vi: "Không tìm thấy bài kiểm tra.",
    zh: "未找到该测试。",
  },
  ClassNotFound: {
    en: "The class could not be found.",
    vi: "Không tìm thấy lớp học.",
    zh: "未找到该班级。",
  },
  Forbidden: {
    en: "You do not have permission to perform this action.",
    vi: "Vui lòng không có quyền thực hiện thao tác này.",
    zh: "您没有权限执行此操作。",
  },
}

export const unwrapApiPayload = (response) => {
  if (response === undefined || response === null) return null
  if (isRecord(response) && hasOwn(response, "data")) {
    return response.data ?? null
  }
  return response
}

export const getQuizListFromResponse = (response) => {
  const payload = unwrapApiPayload(response)
  if (!Array.isArray(payload) || !payload.every(isQuizLike)) return null
  return payload
}

export const getQuizObjectFromResponse = (response) => {
  const payload = unwrapApiPayload(response)
  return isQuizLike(payload) ? payload : null
}

export const getStudentQuizAttemptFromResponse = (response) => {
  const payload = unwrapApiPayload(response)
  if (
    !isRecord(payload)
    || !hasValidId(payload.recordId)
    || !Number.isInteger(toFiniteNumber(payload.attemptNumber))
    || toFiniteNumber(payload.attemptNumber) <= 0
    || !toValidDate(payload.startedAt)
    || toFiniteNumber(payload.timeLimitMinutes) === undefined
    || toFiniteNumber(payload.timeLimitMinutes) <= 0
    || !Array.isArray(payload.questions)
    || payload.questions.length === 0
    || !payload.questions.every(isValidAttemptQuestion)
  ) {
    return null
  }

  const questionIds = payload.questions.map((question) => String(question.id))
  if (new Set(questionIds).size !== questionIds.length) return null

  return payload
}

export const createInitialQuizForm = () => ({
  title: "",
  editorText: "",
  openDate: null,
  closeDate: null,
  questions: [],
  duration: "45",
  maxAttempts: 1,
  allowLateSubmission: false,
  passPercent: 50,
  shuffleQuestions: false,
  shuffleOptions: true,
  showAnswers: true,
  autoGrading: false,
  scoreScale: "scale10",
  resultRelease: "manual",
  publishStatus: "now",
  postToFeed: true,
})

export const mapQuizToFormState = (response) => {
  const quiz = getQuizObjectFromResponse(response)
  if (!quiz) return null
  if (hasOwn(quiz, "questions") && !Array.isArray(quiz.questions)) return null
  if (Array.isArray(quiz.questions) && !quiz.questions.every(isRecord)) return null

  return {
    title: typeof quiz.name === "string"
      ? quiz.name
      : (typeof quiz.title === "string" ? quiz.title : ""),
    editorText: typeof quiz.description === "string" ? quiz.description : "",
    openDate: toValidDate(quiz.openTime),
    closeDate: toValidDate(quiz.closeTime),
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map(mapQuestionToFormState)
      : [],
    duration: String(toFiniteNumber(quiz.timeLimitMinutes) ?? 45),
    maxAttempts: toFiniteNumber(quiz.maxAttempts) ?? 1,
    allowLateSubmission: quiz.allowLateSubmission ?? false,
    passPercent: toFiniteNumber(quiz.passPercent) ?? 50,
    shuffleQuestions: quiz.shuffleQuestions ?? false,
    shuffleOptions: quiz.shuffleOptions ?? true,
    showAnswers: quiz.showAnswersAfterSubmission ?? true,
    autoGrading: quiz.autoGradingEnabled ?? false,
    scoreScale: quiz.gradingScale === "Hundred" ? "scale100" : "scale10",
    resultRelease: quiz.resultReleaseMode === "Auto" ? "automatic" : "manual",
    publishStatus: quiz.status === "Draft" ? "draft" : "now",
    postToFeed: quiz.postToBulletinBoard ?? true,
  }
}

export const buildQuizPayload = (form, { status } = {}) => {
  if (!isRecord(form)) return {}

  const title = hasOwn(form, "title") ? form.title : form.name
  const description = hasOwn(form, "editorText")
    ? form.editorText
    : form.description
  const duration = hasOwn(form, "duration")
    ? form.duration
    : form.timeLimitMinutes
  const showAnswers = hasOwn(form, "showAnswers")
    ? form.showAnswers
    : form.showAnswersAfterSubmission
  const autoGrading = hasOwn(form, "autoGrading")
    ? form.autoGrading
    : form.autoGradingEnabled
  const scoreScale = hasOwn(form, "scoreScale")
    ? form.scoreScale
    : form.gradingScale
  const resultRelease = hasOwn(form, "resultRelease")
    ? form.resultRelease
    : form.resultReleaseMode
  const postToFeed = hasOwn(form, "postToFeed")
    ? form.postToFeed
    : form.postToBulletinBoard

  return omitUndefined({
    name: toOptionalText(title),
    description: toOptionalText(description),
    timeLimitMinutes: toFiniteNumber(duration),
    openTime: toIsoString(form.openDate ?? form.openTime),
    closeTime: toIsoString(form.closeDate ?? form.closeTime),
    maxAttempts: toFiniteNumber(form.maxAttempts),
    shuffleQuestions: toOptionalBoolean(form.shuffleQuestions),
    shuffleOptions: toOptionalBoolean(form.shuffleOptions),
    allowLateSubmission: toOptionalBoolean(form.allowLateSubmission),
    showAnswersAfterSubmission: toOptionalBoolean(showAnswers),
    autoGradingEnabled: toOptionalBoolean(autoGrading),
    gradingScale: scoreScale === "scale100"
      ? "Hundred"
      : (scoreScale === "scale10" ? "Ten" : scoreScale),
    resultReleaseMode: resultRelease === "automatic"
      ? "Auto"
      : (resultRelease === "manual" ? "Manual" : resultRelease),
    passPercent: toFiniteNumber(form.passPercent),
    postToBulletinBoard: toOptionalBoolean(postToFeed),
    status,
    questions: Array.isArray(form.questions)
      ? form.questions.map(buildQuestionPayload)
      : undefined,
  })
}

export const buildQuizUpdatePayload = (form, baselineForm, options = {}) => {
  const currentPayload = buildQuizPayload(form, options)
  if (!isRecord(baselineForm)) return currentPayload

  const baselinePayload = buildQuizPayload(baselineForm)
  return Object.fromEntries(
    Object.entries(currentPayload).filter(([key, value]) => (
      key === "status" || !arePayloadValuesEqual(value, baselinePayload[key])
    ))
  )
}

const QUIZ_FORM_FIELDS = {
  name: "Name",
  description: "Description",
  timeLimitMinutes: "TimeLimitMinutes",
  openTime: "OpenTime",
  closeTime: "CloseTime",
  maxAttempts: "MaxAttempts",
  shuffleQuestions: "ShuffleQuestions",
  shuffleOptions: "ShuffleOptions",
  allowLateSubmission: "AllowLateSubmission",
  showAnswersAfterSubmission: "ShowAnswersAfterSubmission",
  autoGradingEnabled: "AutoGradingEnabled",
  gradingScale: "GradingScale",
  resultReleaseMode: "ResultReleaseMode",
  passPercent: "PassPercent",
  postToBulletinBoard: "PostToBulletinBoard",
  status: "Status",
}

const QUESTION_FORM_FIELDS = {
  id: "Id",
  type: "Type",
  content: "Content",
  points: "Points",
  isRequired: "IsRequired",
  sortOrder: "SortOrder",
  skillTag: "SkillTag",
  mediaFile: "MediaFile",
  audioFile: "AudioFile",
  clearMedia: "ClearMedia",
  clearAudio: "ClearAudio",
  options: "Options",
  correctAnswers: "CorrectAnswers",
  maxWordCount: "MaxWordCount",
  tipText: "TipText",
}

const appendFormValue = (formData, key, value) => {
  if (value === undefined || value === null) return
  if (isFileValue(value)) {
    formData.append(key, value)
    return
  }
  formData.append(key, String(value))
}

const appendQuestionFormFields = (
  formData,
  question,
  { prefix = "", includeUpdateFields = true } = {},
) => {
  if (!isRecord(question)) return

  Object.entries(QUESTION_FORM_FIELDS).forEach(([property, fieldName]) => {
    if (
      !includeUpdateFields
      && (
        property === "id"
        || property === "clearMedia"
        || property === "clearAudio"
      )
    ) {
      return
    }

    const value = question[property]
    const formKey = prefix ? `${prefix}.${fieldName}` : fieldName

    if (Array.isArray(value)) {
      value.forEach((item, itemIndex) => {
        appendFormValue(formData, `${formKey}[${itemIndex}]`, item)
      })
      return
    }

    appendFormValue(formData, formKey, value)
  })
}

export const buildQuizFormData = (payload, { isUpdate = false } = {}) => {
  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    return payload
  }

  const formData = new FormData()
  if (!isRecord(payload)) return formData

  const questions = Array.isArray(payload.questions) ? payload.questions : []

  Object.entries(QUIZ_FORM_FIELDS).forEach(([property, fieldName]) => {
    appendFormValue(formData, fieldName, payload[property])
  })

  questions.forEach((question, questionIndex) => {
    appendQuestionFormFields(formData, question, {
      prefix: `Questions[${questionIndex}]`,
      includeUpdateFields: isUpdate,
    })
  })

  return formData
}

export const buildQuestionFormData = (payload) => {
  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    return payload
  }

  const formData = new FormData()
  if (!isRecord(payload)) return formData

  appendQuestionFormFields(formData, payload)

  return formData
}

export const validateQuizForm = (
  form,
  { mode = "publish", now = Date.now() } = {}
) => {
  const errors = []
  const isDraft = String(mode).toLowerCase() === "draft"

  if (!isRecord(form)) {
    addValidationError(
      errors,
      "form",
      "QuizInvalidForm",
      "The quiz form is invalid."
    )
    return {
      isValid: false,
      errors,
      firstError: errors[0].message,
    }
  }

  if (!isNonEmptyText(form.title ?? form.name)) {
    addValidationError(
      errors,
      "title",
      "QuizNameRequired",
      isDraft
        ? "Enter a quiz name before saving the draft."
        : "Enter a quiz name before publishing."
    )
  }

  const duration = toFiniteNumber(form.duration ?? form.timeLimitMinutes)
  if (
    (!isDraft || duration !== undefined)
    && (!Number.isFinite(duration) || duration <= 0)
  ) {
    addValidationError(
      errors,
      "duration",
      "QuizInvalidTimeLimit",
      "The time limit must be greater than zero."
    )
  }

  const maxAttempts = toFiniteNumber(form.maxAttempts)
  if (
    (!isDraft || maxAttempts !== undefined)
    && (!Number.isInteger(maxAttempts) || maxAttempts <= 0)
  ) {
    addValidationError(
      errors,
      "maxAttempts",
      "QuizInvalidMaxAttempts",
      "The maximum number of attempts must be a positive whole number."
    )
  }

  const passPercent = toFiniteNumber(form.passPercent)
  if (
    (!isDraft || passPercent !== undefined)
    && (!Number.isFinite(passPercent) || passPercent < 0 || passPercent > 100)
  ) {
    addValidationError(
      errors,
      "passPercent",
      "QuizInvalidPassPercent",
      "The pass percentage must be between 0 and 100."
    )
  }

  const openValue = form.openDate ?? form.openTime
  const closeValue = form.closeDate ?? form.closeTime
  const openDate = toValidDate(openValue)
  const closeDate = toValidDate(closeValue)
  const hasOpenValue = openValue !== undefined && openValue !== null && openValue !== ""
  const hasCloseValue = closeValue !== undefined && closeValue !== null && closeValue !== ""

  if (hasOpenValue && !openDate) {
    addValidationError(
      errors,
      "openDate",
      "QuizInvalidOpenTime",
      "Choose a valid opening time."
    )
  } else if (!isDraft && !openDate) {
    addValidationError(
      errors,
      "openDate",
      "QuizOpenTimeRequired",
      "Choose an opening time before publishing."
    )
  }

  if (hasCloseValue && !closeDate) {
    addValidationError(
      errors,
      "closeDate",
      "QuizInvalidCloseTime",
      "Choose a valid closing time."
    )
  } else if (!isDraft && !closeDate) {
    addValidationError(
      errors,
      "closeDate",
      "QuizCloseTimeRequired",
      "Choose a closing time before publishing."
    )
  }

  if (openDate && closeDate && closeDate.getTime() <= openDate.getTime()) {
    addValidationError(
      errors,
      "closeDate",
      "QuizInvalidCloseTime",
      "The closing time must be after the opening time."
    )
  }

  const nowMs = toFiniteNumber(now)
  if (
    !isDraft
    && closeDate
    && Number.isFinite(nowMs)
    && closeDate.getTime() <= nowMs
  ) {
    addValidationError(
      errors,
      "closeDate",
      "QuizCloseTimeInPast",
      "The closing time must be in the future."
    )
  }

  if (!Array.isArray(form.questions)) {
    if (!isDraft) {
      addValidationError(
        errors,
        "questions",
        "QuizNoQuestions",
        "Add at least one question before publishing."
      )
    }
  } else if (!isDraft && form.questions.length === 0) {
    addValidationError(
      errors,
      "questions",
      "QuizNoQuestions",
      "Add at least one question before publishing."
    )
  }

  if (Array.isArray(form.questions)) {
    form.questions.forEach((question, questionIndex) => {
      if (!isRecord(question)) {
        addValidationError(
          errors,
          `questions.${questionIndex}`,
          "QuizInvalidQuestion",
          `Question ${questionIndex + 1} is invalid.`,
          questionIndex
        )
        return
      }

      if (isDraft) return

      const fieldPrefix = `questions.${questionIndex}`
      const type = normalizeQuestionType(question.type)
      if (!QUESTION_TYPES.has(type)) {
        addValidationError(
          errors,
          `${fieldPrefix}.type`,
          "QuizInvalidQuestionType",
          `Choose a valid type for question ${questionIndex + 1}.`,
          questionIndex
        )
        return
      }

      if (!isNonEmptyText(question.content)) {
        addValidationError(
          errors,
          `${fieldPrefix}.content`,
          "QuizQuestionContentRequired",
          `Enter content for question ${questionIndex + 1}.`,
          questionIndex
        )
      }

      const points = toFiniteNumber(question.score ?? question.points)
      if (!Number.isFinite(points) || points < 0) {
        addValidationError(
          errors,
          `${fieldPrefix}.score`,
          "QuizInvalidQuestionPoints",
          `Enter a non-negative score for question ${questionIndex + 1}.`,
          questionIndex
        )
      }

      if (CHOICE_QUESTION_TYPES.has(type)) {
        const options = question.options
        if (
          !Array.isArray(options)
          || options.length < 2
          || options.some((option) => !isNonEmptyText(String(option ?? "")))
        ) {
          addValidationError(
            errors,
            `${fieldPrefix}.options`,
            "QuizInvalidQuestionOptions",
            `Add at least two non-empty options for question ${questionIndex + 1}.`,
            questionIndex
          )
        }

        const correctAnswers = question.correctAnswers
        const requiresSingleAnswer = (
          type === "MultipleChoiceSingle" || type === "TrueFalse"
        )
        const hasExpectedAnswerCount = Array.isArray(correctAnswers)
          && correctAnswers.length > 0
          && (!requiresSingleAnswer || correctAnswers.length === 1)
        const normalizedAnswers = Array.isArray(correctAnswers)
          ? correctAnswers.map(String)
          : []
        const hasDuplicateAnswers = (
          new Set(normalizedAnswers).size !== normalizedAnswers.length
        )
        const hasInvalidAnswer = (
          !Array.isArray(options)
          || normalizedAnswers.some((answer) => {
            if (!/^(0|[1-9]\d*)$/.test(answer)) return true
            const optionIndex = Number(answer)
            return optionIndex < 0 || optionIndex >= options.length
          })
        )

        if (!hasExpectedAnswerCount || hasDuplicateAnswers || hasInvalidAnswer) {
          addValidationError(
            errors,
            `${fieldPrefix}.correctAnswers`,
            "QuizInvalidCorrectAnswers",
            `Choose valid correct answer options for question ${questionIndex + 1}.`,
            questionIndex
          )
        }
      } else if (type === "FillInBlank") {
        if (
          !Array.isArray(question.correctAnswers)
          || !question.correctAnswers.some((answer) => isNonEmptyText(String(answer ?? "")))
        ) {
          addValidationError(
            errors,
            `${fieldPrefix}.correctAnswers`,
            "QuizCorrectAnswerRequired",
            `Enter a correct answer for question ${questionIndex + 1}.`,
            questionIndex
          )
        }
      } else if (type === "Essay") {
        const maxWordCount = toFiniteNumber(question.maxWordCount)
        if (
          question.maxWordCount !== undefined
          && (!Number.isInteger(maxWordCount) || maxWordCount <= 0)
        ) {
          addValidationError(
            errors,
            `${fieldPrefix}.maxWordCount`,
            "QuizInvalidMaxWordCount",
            `Enter a positive word limit for question ${questionIndex + 1}.`,
            questionIndex
          )
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0]?.message ?? null,
  }
}

export const buildQuizAnswerPayload = (
  answers,
  questions = [],
  markedForReview = {},
) => {
  const questionById = new Map()
  if (Array.isArray(questions)) {
    questions.forEach((question) => {
      const id = getQuestionId(question)
      if (id !== undefined && id !== null) {
        questionById.set(String(id), question)
      }
    })
  }

  const markedEntries = getAnswerEntries(markedForReview)
    .filter(([questionId]) => questionId !== undefined && questionId !== null)
  const markedMap = new Map(
    markedEntries.map(([questionId, isMarked]) => [
      String(questionId),
      Boolean(isMarked),
    ]),
  )
  const answeredQuestionIds = new Set()

  const answerPayload = getAnswerEntries(answers)
    .filter(([, value]) => value !== undefined)
    .map(([answerId, value]) => {
      const question = questionById.get(String(answerId))
      const questionId = getQuestionId(question) ?? answerId
      const idStr = String(questionId)
      const type = normalizeQuestionType(question?.type)
      answeredQuestionIds.add(idStr)

      const isMarkedForReview = Boolean(
        markedMap.has(idStr)
          ? markedMap.get(idStr)
          : (isRecord(value) && hasOwn(value, "isMarkedForReview"))
            ? value.isMarkedForReview
            : question?.isMarkedForReview
            ?? question?.isFlagged
            ?? question?.isMarked
            ?? false,
      )

      if (type === "FillInBlank" || type === "Essay") {
        return {
          questionId,
          selectedOptions: null,
          fillText: isRecord(value)
            ? (value.fillText ?? "")
            : (value === undefined || value === null ? "" : String(value)),
          isMarkedForReview,
        }
      }

      const rawOpts = isRecord(value) && "selectedOptions" in value ? value.selectedOptions : value
      const selectedOptions = Array.isArray(rawOpts)
        ? rawOpts.map(String)
        : (rawOpts === undefined || rawOpts === null ? [] : [String(rawOpts)])

      return {
        questionId,
        selectedOptions,
        fillText: null,
        isMarkedForReview,
      }
    })

  const markOnlyPayload = markedEntries
    .filter(([questionId]) => !answeredQuestionIds.has(String(questionId)))
    .map(([markedQuestionId, isMarkedForReview]) => {
      const question = questionById.get(String(markedQuestionId))
      return {
        questionId: getQuestionId(question) ?? markedQuestionId,
        isMarkedForReview: Boolean(isMarkedForReview),
      }
    })

  return [...answerPayload, ...markOnlyPayload]
}

export const getQuizDeadlineMs = ({
  startedAt,
  timeLimitMinutes,
  nowMs = Date.now(),
} = {}) => {
  const minutes = toFiniteNumber(timeLimitMinutes)
  if (!Number.isFinite(minutes) || minutes < 0) return null

  const hasStartedAt = (
    startedAt !== undefined && startedAt !== null && startedAt !== ""
  )
  const startMs = hasStartedAt
    ? toValidDate(startedAt)?.getTime()
    : toFiniteNumber(nowMs)

  if (!Number.isFinite(startMs)) return null

  const deadlineMs = startMs + (minutes * 60_000)
  return Number.isFinite(deadlineMs) ? deadlineMs : null
}

export const getQuizTimeRemaining = (deadlineMs, nowMs = Date.now()) => {
  const deadline = toFiniteNumber(deadlineMs)
  const currentTime = toFiniteNumber(nowMs)
  if (!Number.isFinite(deadline) || !Number.isFinite(currentTime)) return null

  return Math.max(0, Math.ceil((deadline - currentTime) / 1000))
}

export const getQuizErrorMessage = (error, language = "en", fallback) => {
  const locale = language === "vi" ? "vi" : (language === "zh" ? "zh" : "en")
  const code = getErrorCode(error)
  const knownMessage = code ? QUIZ_ERROR_MESSAGES[code]?.[locale] : undefined

  if (knownMessage) return knownMessage
  if (typeof fallback === "string" && fallback.trim()) return fallback

  if (locale === "vi") return "Không thể hoàn tất thao tác. Vui lòng thử lại."
  if (locale === "zh") return "无法完成操作，请重试。"
  return "The action could not be completed. Please try again."
}

export const mergeQuizResultQuestions = (resultQuestions, attemptQuestions) => {
  if (!Array.isArray(resultQuestions)) return []

  const attemptById = new Map()
  if (Array.isArray(attemptQuestions)) {
    attemptQuestions.forEach((question) => {
      const id = getQuestionId(question)
      if (id !== undefined && id !== null && isRecord(question)) {
        attemptById.set(String(id), question)
      }
    })
  }

  const enrichableFields = [
    "type",
    "content",
    "points",
    "isRequired",
    "options",
    "maxWordCount",
    "mediaUrl",
    "imageUrl",
    "audioUrl",
    "audio",
    "image",
    "media",
    "fileUrl",
    "attachmentUrl",
    "tipText",
  ]

  return resultQuestions
    .filter(isRecord)
    .map((resultQuestion) => {
      const resultId = getQuestionId(resultQuestion)
      const attemptQuestion = (
        resultId !== undefined && resultId !== null
          ? attemptById.get(String(resultId))
          : null
      )
      if (!attemptQuestion) return { ...resultQuestion }

      const merged = { ...resultQuestion }
      enrichableFields.forEach((field) => {
        if (merged[field] === undefined && attemptQuestion[field] !== undefined) {
          merged[field] = Array.isArray(attemptQuestion[field])
            ? [...attemptQuestion[field]]
            : attemptQuestion[field]
        }
      })
      return merged
    })
}
