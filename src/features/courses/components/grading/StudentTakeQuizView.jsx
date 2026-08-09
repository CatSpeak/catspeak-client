import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { toast as hotToast } from "react-hot-toast"
import {
  Clock,
  Timer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Calendar,
  Check,
  X,
  RotateCcw,
  CloudCheck,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  RefreshCw,
  Flag,
} from "lucide-react"
import {
  useGetStudentQuizzesQuery,
  useStartStudentQuizAttemptMutation,
  useSaveStudentQuizAnswersMutation,
  useSubmitStudentQuizAttemptMutation,
  useGetStudentQuizResultQuery,
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import {
  buildQuizAnswerPayload,
  getQuizDeadlineMs,
  getQuizErrorMessage,
  getQuizListFromResponse,
  getQuizObjectFromResponse,
  getQuizTimeRemaining,
  getStudentQuizAttemptFromResponse,
  mergeQuizResultQuestions,
} from "../../utils/quizUtils"
import { getCourseLocale } from "../../utils/courseUtils"

const AUTOSAVE_DELAY_MS = 1000

const interpolate = (template, values = {}) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template || "",
  )

const formatTimer = (totalSeconds) => {
  const safeSeconds = Number.isFinite(totalSeconds)
    ? Math.max(0, Math.floor(totalSeconds))
    : 0
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, "0"))
      .join(":")
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

const isAudioFileUrl = (url) => {
  if (typeof url !== "string") return false
  const clean = url.trim().toLowerCase()
  return (
    clean.endsWith(".mp3") ||
    clean.endsWith(".wav") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".m4a") ||
    clean.endsWith(".aac") ||
    clean.includes("audio/") ||
    clean.includes("type=audio")
  )
}

const getQuestionImageUrl = (q) => {
  if (!q || typeof q !== "object") return null
  const candidates = [
    q.mediaUrl,
    q.imageUrl,
    q.image,
    q.media,
    q.fileUrl,
    q.pictureUrl,
    q.photoUrl,
    typeof q.file === "string" ? q.file : null,
    typeof q.attachment === "string" ? q.attachment : null,
  ]
  for (const url of candidates) {
    if (typeof url === "string" && url.trim() && !isAudioFileUrl(url)) {
      return url.trim()
    }
  }
  return null
}

const getQuestionAudioUrl = (q) => {
  if (!q || typeof q !== "object") return null
  const candidates = [
    q.audioUrl,
    q.audio,
    q.audioFileUrl,
    q.soundUrl,
    q.voiceUrl,
    q.mediaUrl,
    q.fileUrl,
    q.attachmentUrl,
    typeof q.file === "string" ? q.file : null,
  ]
  for (const url of candidates) {
    if (typeof url === "string" && url.trim()) {
      if (
        isAudioFileUrl(url) ||
        url === q.audioUrl ||
        url === q.audio ||
        url === q.audioFileUrl ||
        url === q.soundUrl ||
        url === q.voiceUrl
      ) {
        return url.trim()
      }
    }
  }
  return null
}

const getQuestionTypeLabel = (typeRaw, translations = {}) => {
  const type = String(typeRaw || "").trim()
  if (type === "MultipleChoiceSingle" || type === "mcq") {
    return translations.questionTypeSingleChoice
  }
  if (type === "MultipleChoiceMultiple") {
    return translations.questionTypeMultipleChoice
  }
  if (type === "TrueFalse") {
    return translations.questionTypeTrueFalse
  }
  if (type === "FillInBlank") {
    return translations.questionTypeFillBlank
  }
  if (type === "Essay" || type === "essay") {
    return translations.questionTypeEssay
  }
  return type || translations.questionTypeDefault
}

const StudentTakeQuizView = ({ classId: propsClassId, quizId: propsQuizId, onBack }) => {
  const { formatTime, formatDateTime } = useTimezone()
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()

  const classId = propsClassId || params.classId || params.id || searchParams.get("classId") || searchParams.get("id")
  const quizId = propsQuizId || params.quizId || searchParams.get("quizId")

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const { language, t } = useLanguage()
  const sq = useMemo(() => t?.courses?.grading?.studentQuiz || {}, [t])

  // ─── API Queries & Mutations ─────────────────────────────────────────
  const {
    currentData: quizzesResponse,
    error: quizzesError,
    isLoading: isQuizzesLoading,
    isFetching: isQuizzesFetching,
    refetch: refetchQuizzes,
  } = useGetStudentQuizzesQuery({ classId }, { skip: !classId })

  const quizList = useMemo(
    () => getQuizListFromResponse(quizzesResponse),
    [quizzesResponse],
  )

  const quiz = useMemo(() => {
    return Array.isArray(quizList)
      ? quizList.find((item) => String(item.id) === String(quizId)) || null
      : null
  }, [quizId, quizList])

  const [startAttempt, { isLoading: isStarting }] = useStartStudentQuizAttemptMutation()
  const [saveAnswers] = useSaveStudentQuizAnswersMutation()
  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitStudentQuizAttemptMutation()

  // ─── Flow States ─────────────────────────────────────────────────────
  const [stepOverride, setStepOverride] = useState(null)
  const [flowQuizKey, setFlowQuizKey] = useState(null)
  const [attemptData, setAttemptData] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [markedQuestions, setMarkedQuestions] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [deadlineMs, setDeadlineMs] = useState(null)
  const [lastSavedTimeStr, setLastSavedTimeStr] = useState("")
  const [saveStatus, setSaveStatus] = useState("idle")
  const [submissionError, setSubmissionError] = useState("")
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [submittedAttemptNumber, setSubmittedAttemptNumber] = useState(null)

  const autosaveTimerRef = useRef(null)
  const saveQueueRef = useRef(Promise.resolve())
  const activeStartRequestRef = useRef(null)
  const activeSaveRequestRef = useRef(null)
  const userAnswersRef = useRef({})
  const markedQuestionsRef = useRef({})
  const questionsRef = useRef([])
  const mountedRef = useRef(true)
  const attemptActiveRef = useRef(false)
  const startGuardRef = useRef(false)
  const submitGuardRef = useRef(false)
  const autoSubmitTriggeredRef = useRef(false)
  const submitDialogRef = useRef(null)
  const cancelSubmitButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  const quizKey = JSON.stringify([classId ?? null, quizId ?? null])
  const activeQuizKeyRef = useRef(quizKey)
  activeQuizKeyRef.current = quizKey
  const hasCurrentQuizFlow = flowQuizKey === quizKey
  const requestedStep = searchParams.get("step") || searchParams.get("view")
  const defaultStep = requestedStep === "result"
    ? "result"
    : (String(quiz?.recordStatus ?? "").toLowerCase() === "submitted" ? "result" : "intro")

  const attemptStep =
    (hasCurrentQuizFlow ? stepOverride : null) ?? defaultStep

  const {
    currentData: quizResultResponse,
    error: quizResultError,
    isLoading: isQuizResultLoading,
    isFetching: isQuizResultFetching,
    refetch: refetchQuizResult,
  } = useGetStudentQuizResultQuery(
    {
      classId,
      quizId,
      attempt: submittedAttemptNumber ?? undefined,
    },
    {
      skip: !classId || !quizId || attemptStep !== "result",
    },
  )

  const questions = useMemo(
    () =>
      hasCurrentQuizFlow && Array.isArray(attemptData?.questions)
        ? attemptData.questions.filter(
          (question) =>
            question &&
            typeof question === "object" &&
            question.id !== undefined &&
            question.id !== null,
        )
        : [],
    [attemptData, hasCurrentQuizFlow],
  )

  useEffect(() => {
    questionsRef.current = questions
  }, [questions])

  useEffect(() => {
    userAnswersRef.current = userAnswers
  }, [userAnswers])

  useEffect(() => {
    markedQuestionsRef.current = markedQuestions
  }, [markedQuestions])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      attemptActiveRef.current = false
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }
      activeStartRequestRef.current?.abort?.()
      activeSaveRequestRef.current?.abort?.()
    }
  }, [])

  useEffect(() => {
    if (flowQuizKey === null || flowQuizKey === quizKey) return

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    activeStartRequestRef.current?.abort?.()
    activeStartRequestRef.current = null
    activeSaveRequestRef.current?.abort?.()
    activeSaveRequestRef.current = null
    saveQueueRef.current = Promise.resolve()
    attemptActiveRef.current = false
    startGuardRef.current = false
    submitGuardRef.current = false
    autoSubmitTriggeredRef.current = false
    userAnswersRef.current = {}
    markedQuestionsRef.current = {}
    questionsRef.current = []

    setFlowQuizKey(null)
    setStepOverride(null)
    setAttemptData(null)
    setCurrentIndex(0)
    setUserAnswers({})
    setMarkedQuestions({})
    setTimeRemaining(0)
    setDeadlineMs(null)
    setLastSavedTimeStr("")
    setSaveStatus("idle")
    setSubmissionError("")
    setShowSubmitConfirmModal(false)
    setSubmitResult(null)
    setSubmittedAttemptNumber(null)
  }, [flowQuizKey, quizKey])

  useEffect(() => {
    if (!showSubmitConfirmModal) return

    previousFocusRef.current = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => {
      cancelSubmitButtonRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(focusFrame)
      previousFocusRef.current?.focus?.()
      previousFocusRef.current = null
    }
  }, [showSubmitConfirmModal])

  // ─── Helper for checking if a question is answered ──────────────────
  const isQuestionAnswered = useCallback(
    (q) => {
      if (!q) return false
      const val = userAnswers[q.id]
      if (val === undefined || val === null) return false

      const type = q.type
      if (type === "MultipleChoiceSingle" || type === "mcq" || type === "TrueFalse") {
        return typeof val === "number" || (typeof val === "string" && val.length > 0)
      }
      if (type === "MultipleChoiceMultiple") {
        return Array.isArray(val) && val.length > 0
      }
      if (type === "FillInBlank" || type === "Essay") {
        return typeof val === "string" && val.trim().length > 0
      }
      if (typeof val === "string") return val.trim().length > 0
      if (Array.isArray(val)) return val.length > 0
      return true
    },
    [userAnswers]
  )

  const enqueueAnswerSave = useCallback(
    (answersSnapshot, markedSnapshot = markedQuestionsRef.current) => {
      const queuedQuizKey = activeQuizKeyRef.current
      const answers = buildQuizAnswerPayload(
        answersSnapshot,
        questionsRef.current,
        markedSnapshot,
      )

      if (
        !attemptActiveRef.current ||
        !classId ||
        !quizId ||
        queuedQuizKey !== quizKey
      ) {
        return saveQueueRef.current
      }

      if (answers.length === 0) {
        if (mountedRef.current) {
          setSaveStatus("idle")
        }
        return saveQueueRef.current
      }

      if (mountedRef.current) {
        setSaveStatus("saving")
      }

      saveQueueRef.current = saveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (
            !attemptActiveRef.current
            || activeQuizKeyRef.current !== queuedQuizKey
          ) {
            return
          }

          const request = saveAnswers({ classId, quizId, answers })
          activeSaveRequestRef.current = request

          try {
            await request.unwrap()
            if (
              !mountedRef.current
              || !attemptActiveRef.current
              || activeQuizKeyRef.current !== queuedQuizKey
            ) {
              return
            }

            setLastSavedTimeStr(formatTime(new Date()))
            setSaveStatus("saved")
          } catch (error) {
            if (
              !mountedRef.current ||
              !attemptActiveRef.current ||
              activeQuizKeyRef.current !== queuedQuizKey ||
              error?.name === "AbortError"
            ) {
              return
            }

            setSaveStatus("error")
            hotToast.error(
              getQuizErrorMessage(
                error,
                language,
                sq.autosaveError,
              ),
              { id: "quiz-autosave-error" },
            )
          } finally {
            if (activeSaveRequestRef.current === request) {
              activeSaveRequestRef.current = null
            }
          }
        })

      return saveQueueRef.current
    },
    [classId, language, quizId, quizKey, saveAnswers, sq.autosaveError],
  )

  const scheduleAnswerSave = useCallback(
    (answersSnapshot, markedSnapshot = markedQuestionsRef.current) => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }

      setSaveStatus("pending")
      autosaveTimerRef.current = window.setTimeout(() => {
        autosaveTimerRef.current = null
        enqueueAnswerSave(answersSnapshot, markedSnapshot)
      }, AUTOSAVE_DELAY_MS)
    },
    [enqueueAnswerSave],
  )

  const toggleMarkForReview = useCallback((questionId) => {
    if (questionId === undefined || questionId === null) return
    setMarkedQuestions((prev) => {
      const next = { ...prev, [questionId]: !prev[questionId] }
      markedQuestionsRef.current = next
      scheduleAnswerSave(userAnswersRef.current, next)
      return next
    })
  }, [scheduleAnswerSave])

  const retryAnswerSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    enqueueAnswerSave(userAnswersRef.current, markedQuestionsRef.current)
  }, [enqueueAnswerSave])

  // ─── Submit Quiz Flow ───────────────────────────────────────────────
  const executeSubmit = useCallback(async ({ timedOut = false } = {}) => {
    if (
      submitGuardRef.current ||
      !attemptActiveRef.current ||
      !classId ||
      !quizId
    ) {
      return
    }

    submitGuardRef.current = true
    attemptActiveRef.current = false
    setSubmissionError("")
    setShowSubmitConfirmModal(false)

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
      autosaveTimerRef.current = null
    }
    activeSaveRequestRef.current?.abort?.()

    try {
      const submittedQuizKey = activeQuizKeyRef.current
      const answers = buildQuizAnswerPayload(
        userAnswersRef.current,
        questionsRef.current,
        markedQuestionsRef.current,
      )
      const response = await submitAttempt({
        classId,
        quizId,
        ...(answers.length > 0 ? { answers } : {}),
      }).unwrap()
      const data = getQuizObjectFromResponse(response)

      if (!data) {
        throw new Error("Malformed quiz submission response")
      }
      if (
        !mountedRef.current
        || activeQuizKeyRef.current !== submittedQuizKey
      ) {
        return
      }

      setSubmitResult(data)
      setSubmissionError("")
      setSubmittedAttemptNumber(data.attemptNumber ?? null)
      setDeadlineMs(null)
      setSaveStatus("saved")
      setStepOverride("result")
      try {
        const refetchRequest = refetchQuizResult()
        refetchRequest?.catch?.(() => undefined)
      } catch {
        // Ignore refetch error fallback
      }
      hotToast.success(
        timedOut ? sq.autoSubmitSuccess : sq.submitSuccess,
      )
    } catch (error) {
      if (!mountedRef.current) return

      attemptActiveRef.current = true
      submitGuardRef.current = false
      const errorMessage = getQuizErrorMessage(
        error,
        language,
        sq.submitError,
      )
      setSubmissionError(errorMessage)
      hotToast.error(errorMessage)
    }
  }, [classId, language, quizId, refetchQuizResult, sq, submitAttempt])

  const handleAutoSubmitOnTimeOut = useCallback(async () => {
    if (autoSubmitTriggeredRef.current) return
    autoSubmitTriggeredRef.current = true
    hotToast(
      sq.timeUpAutoSubmitting,
      { id: "quiz-timeout" },
    )
    await executeSubmit({ timedOut: true })
  }, [executeSubmit, sq.timeUpAutoSubmitting])

  // ─── Step 1: Start Attempt Trigger ──────────────────────────────────
  const handleConfirmStart = async () => {
    if (!classId || !quizId) {
      hotToast.error(sq.missingQuizOrClassId)
      return
    }
    if (!canStart) {
      hotToast.error(sq.quizUnavailableToStart)
      return
    }
    if (startGuardRef.current) return

    startGuardRef.current = true
    const startedQuizKey = activeQuizKeyRef.current
    let request = null
    try {
      request = startAttempt({ classId, quizId })
      activeStartRequestRef.current = request
      const response = await request.unwrap()
      const data = getStudentQuizAttemptFromResponse(response)

      if (!data) {
        throw new Error("Malformed start-attempt response")
      }
      if (
        !mountedRef.current
        || activeQuizKeyRef.current !== startedQuizKey
      ) {
        return
      }

      const nextDeadlineMs = getQuizDeadlineMs({
        startedAt: data.startedAt,
        timeLimitMinutes: data.timeLimitMinutes,
      })
      if (!Number.isFinite(nextDeadlineMs)) {
        throw new Error("Malformed quiz deadline")
      }

      const initialAnswers = {}
      const initialMarked = {}
      if (Array.isArray(data.questions)) {
        data.questions.forEach((q) => {
          if (!q || q.id === undefined || q.id === null) return
          const type = q.type || "MultipleChoiceSingle"

          if (q.isMarkedForReview === true || q.isFlagged === true || q.isMarked === true) {
            initialMarked[q.id] = true
          }

          if (q.fillText !== undefined && q.fillText !== null && q.fillText !== "") {
            initialAnswers[q.id] = String(q.fillText)
          } else if (Array.isArray(q.selectedOptions) && q.selectedOptions.length > 0) {
            if (type === "MultipleChoiceMultiple") {
              initialAnswers[q.id] = q.selectedOptions.map((opt) => {
                const num = Number(opt)
                return Number.isFinite(num) ? num : String(opt)
              })
            } else {
              const firstOpt = q.selectedOptions[0]
              const num = Number(firstOpt)
              initialAnswers[q.id] = Number.isFinite(num) ? num : String(firstOpt)
            }
          }
        })
      }

      setFlowQuizKey(quizKey)
      setAttemptData(data)
      setDeadlineMs(nextDeadlineMs)
      setTimeRemaining(getQuizTimeRemaining(nextDeadlineMs))
      setCurrentIndex(0)
      setUserAnswers(initialAnswers)
      userAnswersRef.current = initialAnswers
      setMarkedQuestions(initialMarked)
      markedQuestionsRef.current = initialMarked
      setSubmitResult(null)
      setSubmittedAttemptNumber(null)
      setLastSavedTimeStr("")
      setSaveStatus("idle")
      setSubmissionError("")
      submitGuardRef.current = false
      autoSubmitTriggeredRef.current = false
      attemptActiveRef.current = true
      setStepOverride("taking")
      const isInProgress = String(quiz?.recordStatus ?? "").toLowerCase() === "inprogress"
      hotToast.success(
        isInProgress ? sq.resumeAttemptSuccess : sq.startSuccess,
      )
    } catch (error) {
      if (
        !mountedRef.current
        || activeQuizKeyRef.current !== startedQuizKey
        || error?.name === "AbortError"
      ) {
        return
      }

      hotToast.error(
        getQuizErrorMessage(
          error,
          language,
          sq.startError,
        ),
      )
    } finally {
      if (activeStartRequestRef.current === request) {
        activeStartRequestRef.current = null
      }
      if (activeQuizKeyRef.current === startedQuizKey) {
        startGuardRef.current = false
      }
    }
  }

  // ─── Timer Countdown Effect ─────────────────────────────────────────
  useEffect(() => {
    if (attemptStep !== "taking" || !Number.isFinite(deadlineMs)) return

    const updateRemainingTime = () => {
      const nextRemaining = getQuizTimeRemaining(deadlineMs)
      setTimeRemaining(nextRemaining)
      if (nextRemaining === 0) {
        handleAutoSubmitOnTimeOut()
      }
    }

    updateRemainingTime()
    const timerInterval = window.setInterval(updateRemainingTime, 1000)

    return () => window.clearInterval(timerInterval)
  }, [attemptStep, deadlineMs, handleAutoSubmitOnTimeOut])

  const handleSingleOptionSelect = (qId, optIdx) => {
    const nextAnswers = { ...userAnswersRef.current, [qId]: optIdx }
    userAnswersRef.current = nextAnswers
    setUserAnswers(nextAnswers)
    scheduleAnswerSave(nextAnswers)
  }

  const handleMultipleOptionToggle = (qId, optIdx) => {
    const currentList = Array.isArray(userAnswersRef.current[qId])
      ? userAnswersRef.current[qId]
      : []
    const nextList = currentList.includes(optIdx)
      ? currentList.filter((value) => value !== optIdx)
      : [...currentList, optIdx]
    const nextAnswers = { ...userAnswersRef.current, [qId]: nextList }
    userAnswersRef.current = nextAnswers
    setUserAnswers(nextAnswers)
    scheduleAnswerSave(nextAnswers)
  }

  const handleTextAnswerChange = (qId, textVal) => {
    const nextAnswers = { ...userAnswersRef.current, [qId]: textVal }
    userAnswersRef.current = nextAnswers
    setUserAnswers(nextAnswers)
    scheduleAnswerSave(nextAnswers)
  }

  const currentQuestion = questions[currentIndex] || null
  const answeredCount = useMemo(() => {
    return questions.filter((q) => isQuestionAnswered(q)).length
  }, [questions, isQuestionAnswered])

  const quizStatus = String(quiz?.status || "").toLowerCase()
  const recordStatus = String(quiz?.recordStatus || "")
  const hasRemainingAttempts =
    quiz?.remainingAttempts === undefined ||
    quiz?.remainingAttempts === null ||
    Number(quiz.remainingAttempts) > 0
  const canStart =
    quizStatus === "open" &&
    (recordStatus === "InProgress" || hasRemainingAttempts)
  const canRetake =
    quizStatus === "open" && Number(quiz?.remainingAttempts) > 0
  const isLowTime =
    Number.isFinite(timeRemaining) && timeRemaining >= 0 && timeRemaining < 300
  const quizStatusLabel = {
    open: sq.statusOpen,
    upcoming: sq.statusUpcoming,
    closed: sq.statusClosed,
  }[quizStatus] ?? sq.statusUnknown

  const handleRetake = () => {
    setFlowQuizKey(quizKey)
    setAttemptData(null)
    setUserAnswers({})
    userAnswersRef.current = {}
    setMarkedQuestions({})
    markedQuestionsRef.current = {}
    setCurrentIndex(0)
    setDeadlineMs(null)
    setTimeRemaining(0)
    setSubmitResult(null)
    setSubmittedAttemptNumber(null)
    setSaveStatus("idle")
    setSubmissionError("")
    setLastSavedTimeStr("")
    submitGuardRef.current = false
    autoSubmitTriggeredRef.current = false
    setStepOverride("intro")
  }

  if ((isQuizzesLoading || isQuizzesFetching) && quizzesResponse === undefined) {
    return (
      <div
        className="min-h-screen bg-white flex justify-center items-center"
        role="status"
        aria-live="polite"
        aria-label={sq.loadingQuiz}
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (quizzesError || (quizzesResponse !== undefined && quizList === null)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div
          className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-6 text-center"
          role="alert"
        >
          <h1 className="text-lg font-black text-gray-900">
            {sq.loadQuizErrorTitle}
          </h1>
          <p className="mt-2 text-sm font-semibold text-gray-600">
            {getQuizErrorMessage(
              quizzesError,
              language,
              sq.loadQuizErrorDescription,
            )}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold"
            >
              {sq.back}
            </button>
            <button
              type="button"
              onClick={refetchQuizzes}
              disabled={isQuizzesFetching}
              className="px-4 py-2 bg-[#990011] text-white rounded-xl text-sm font-bold disabled:opacity-50"
            >
              {sq.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div
          className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-6 text-center"
          role="alert"
        >
          <h1 className="text-lg font-black text-gray-900">
            {sq.quizNotFound}
          </h1>
          <button
            type="button"
            onClick={handleBack}
            className="mt-5 px-4 py-2 bg-[#990011] text-white rounded-xl text-sm font-bold"
          >
            {sq.back}
          </button>
        </div>
      </div>
    )
  }

  // ─── STEP 1: INTRO & CONFIRMATION (Whole Page, No Workspace Sidebar) ───
  if (attemptStep === "intro") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto p-4 flex flex-col items-center justify-center font-sans">
        {/* Main Info & Confirmation Card */}
        <div className="max-w-3xl w-full bg-white rounded-3xl border border-gray-150 p-6 md:p-10 shadow-lg flex flex-col gap-6">

          {/* Header & Badges */}
          <div className="flex flex-col gap-2 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-50 text-[#990011] border border-red-100 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                <Timer size={12} />
                {sq.quizBadge}
              </span>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${quizStatus === "open"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : quizStatus === "upcoming"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
              >
                {quizStatusLabel}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight leading-tight">
              {quiz?.name || sq.untitledQuiz}
            </h1>
          </div>

          {/* Details Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/70 border border-gray-150 p-4 rounded-2xl">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {sq.timeLimit}
              </span>
              <span className="text-sm font-black text-gray-850 flex items-center gap-1.5">
                <Clock size={14} className="text-[#990011]" />
                {quiz?.timeLimitMinutes != null
                  ? interpolate(sq.minutes, { count: quiz.timeLimitMinutes })
                  : "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {sq.totalQuestions}
              </span>
              <span className="text-sm font-black text-gray-850 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#990011]" />
                {(quiz?.totalQuestions ?? quiz?.totalQuestion ?? quiz?.questionCount ?? quiz?.questionsCount ?? quiz?.questions?.length ?? attemptData?.questions?.length) != null
                  ? interpolate(sq.questionCount, {
                    count: quiz?.totalQuestions ?? quiz?.totalQuestion ?? quiz?.questionCount ?? quiz?.questionsCount ?? quiz?.questions?.length ?? attemptData?.questions?.length,
                  })
                  : "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {sq.remainingAttempts}
              </span>
              <span className="text-sm font-black text-gray-850 flex items-center gap-1.5">
                <RotateCcw size={14} className="text-[#990011]" />
                {quiz?.remainingAttempts != null || quiz?.maxAttempts != null
                  ? interpolate(sq.attemptCount, {
                    count: quiz?.remainingAttempts ?? quiz?.maxAttempts,
                  })
                  : "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                {sq.maxAttempts}
              </span>
              <span className="text-sm font-black text-gray-850 flex items-center gap-1.5">
                <Layers size={14} className="text-[#990011]" />
                {quiz?.maxAttempts != null
                  ? interpolate(sq.attemptCount, { count: quiz.maxAttempts })
                  : "—"}
              </span>
            </div>
          </div>

          {/* Description box */}
          {quiz?.description && (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">
                {sq.instructions}
              </h3>
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-700 leading-relaxed">
                <RenderHTML html={quiz.description} />
              </div>
            </div>
          )}

          {/* Important Warning Notice Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex gap-3 text-amber-900">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs font-medium leading-relaxed">
              <span className="font-extrabold text-amber-950 text-sm">
                {sq.importantNotice}
              </span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>{sq.noticeCountdown}</li>
                <li>{sq.noticeAutosave}</li>
                <li>{sq.noticeStableConnection}</li>
                {recordStatus === "InProgress" && (
                  <li className="font-bold">
                    {sq.noticeResumeAttempt}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Confirmation Question & Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
            <span className="text-sm font-black text-gray-900 text-center sm:text-left">
              {recordStatus === "InProgress" || recordStatus === "inprogress"
                ? sq.resumeAttemptPrompt
                : (recordStatus === "Submitted" || recordStatus === "submitted"
                  ? (sq.retakeQuizPrompt || "You have submitted this quiz. Would you like to view results or retake?")
                  : sq.startQuizPrompt)}
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
              {(recordStatus === "Submitted" || recordStatus === "submitted") && (
                <button
                  type="button"
                  onClick={() => setStepOverride("result")}
                  className="flex-1 sm:flex-none px-4 py-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>{sq.seeResults || "View Results"}</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 sm:flex-none px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-2xl transition-all cursor-pointer"
              >
                {sq.cancel}
              </button>
              <button
                type="button"
                disabled={isStarting || !canStart}
                onClick={handleConfirmStart}
                className="flex-1 sm:flex-none px-6 py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {(recordStatus === "InProgress" || recordStatus === "inprogress" || recordStatus === "Submitted" || recordStatus === "submitted") && <RotateCcw size={14} />}
                <span>
                  {isStarting
                    ? sq.loading
                    : (!canStart
                      ? (quizStatus === "upcoming"
                        ? sq.notOpenYet
                        : sq.unavailable)
                      : (recordStatus === "InProgress" || recordStatus === "inprogress"
                        ? (sq.continueQuiz || "Continue Quiz")
                        : (recordStatus === "Submitted" || recordStatus === "submitted"
                          ? (sq.retakeQuiz || "Retake Quiz")
                          : sq.startQuiz)))}
                </span>
              </button>
            </div>
          </div>

        </div>

      </div>
    )
  }

  // ─── STEP 3: DETAILED QUIZ RESULT VIEW (Matching Design Screenshot) ───
  if (attemptStep === "result") {
    const queriedResult = getQuizObjectFromResponse(quizResultResponse)
    const resultData = queriedResult || submitResult
    const hasMalformedResult =
      quizResultResponse !== undefined && quizResultResponse !== null && !queriedResult

    if (!resultData && (isQuizResultLoading || isQuizResultFetching)) {
      return (
        <div
          className="min-h-screen bg-[#f4f5f7] flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3 text-sm font-bold text-gray-500">
            <LoadingSpinner />
            <span>
              {sq.loadingQuizResult}
            </span>
          </div>
        </div>
      )
    }

    if (!resultData && (quizResultError || hasMalformedResult)) {
      return (
        <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
          <div
            className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-6 text-center"
            role="alert"
          >
            <h1 className="text-lg font-black text-gray-900">
              {sq.loadResultErrorTitle}
            </h1>
            <p className="mt-2 text-sm font-semibold text-gray-600">
              {getQuizErrorMessage(
                quizResultError,
                language,
                sq.loadResultErrorDescription,
              )}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold"
              >
                {sq.back}
              </button>
              <button
                type="button"
                onClick={refetchQuizResult}
                disabled={isQuizResultFetching}
                className="px-4 py-2 bg-[#990011] text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw
                  size={14}
                  className={isQuizResultFetching ? "animate-spin" : ""}
                />
                {sq.retry}
              </button>
            </div>
          </div>
        </div>
      )
    }

    const displayScore =
      resultData?.displayScore ?? resultData?.rawScore ?? null
    const maxDisplayScore =
      resultData?.maxDisplayScore ?? resultData?.maxScore ?? null
    const isPassed =
      typeof resultData?.passed === "boolean" ? resultData.passed : null
    const passStatusStr = isPassed === true
      ? sq.resultPassed
      : isPassed === false
        ? sq.resultFailed
        : sq.pendingGrading

    const submittedAtMs = resultData?.submittedAt
      ? new Date(resultData.submittedAt).getTime()
      : Number.NaN
    const submittedDateStr = Number.isFinite(submittedAtMs)
      ? formatDateTime(submittedAtMs)
      : "—"

    const timeSpentSecs = Number(resultData?.timeSpentSeconds)
    const timeSpentFormatted = Number.isFinite(timeSpentSecs)
      ? interpolate(sq.timeSpentDuration, {
        minutes: Math.floor(Math.max(0, timeSpentSecs) / 60),
        seconds: Math.floor(Math.max(0, timeSpentSecs) % 60),
      })
      : "—"

    const rawResultQuestions = Array.isArray(resultData?.questions)
      ? resultData.questions
      : Array.isArray(resultData?.results)
        ? resultData.results.map((result) => ({
          ...result,
          pointsEarned: result?.points,
          points: undefined,
        }))
        : []
    const resultQuestions = mergeQuizResultQuestions(
      rawResultQuestions,
      questions,
    )

    return (
      <div className="min-h-screen bg-[#f4f5f7] pb-24 font-sans text-gray-850">
        <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6">

          {(quizResultError || hasMalformedResult) && (
            <div
              className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              role="alert"
            >
              <span>{sq.resultSummaryFallback}</span>
              <button
                type="button"
                onClick={refetchQuizResult}
                disabled={isQuizResultFetching}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-amber-300 rounded-lg font-bold disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isQuizResultFetching ? "animate-spin" : ""}
                />
                {sq.retry}
              </button>
            </div>
          )}

          {/* ─── Top Result Header Banner Card ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative shadow-xs overflow-hidden">
            {/* Left Edge Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#990011] rounded-l-2xl" />

            {/* Title & Metadata */}
            <div className="flex flex-col gap-2 pl-2">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {sq.examResult}
              </h1>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{interpolate(sq.submittedAt, { date: submittedDateStr })}</span>
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span>{interpolate(sq.timeSpent, { duration: timeSpentFormatted })}</span>
                </span>
              </div>
            </div>

            {/* Score & Pass Status Card (Right Box) */}
            <div className="bg-red-50/20 border border-red-100 rounded-2xl p-4 flex items-center gap-6 shrink-0 self-stretch sm:self-auto justify-around sm:justify-start">
              {/* Score Display */}
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {sq.score}
                </span>
                <div className="flex items-baseline">
                  <span className="text-3xl md:text-4xl font-black text-[#990011] tracking-tight">
                    {displayScore ?? "—"}
                  </span>
                  {maxDisplayScore != null && (
                    <span className="text-sm font-bold text-gray-400 ml-0.5">
                      /{maxDisplayScore}
                    </span>
                  )}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-10 bg-gray-200" />

              {/* Pass Status Display */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {sq.status}
                </span>
                {isPassed === true ? (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Check size={13} className="stroke-[3]" />
                    <span>{passStatusStr}</span>
                  </span>
                ) : isPassed === false ? (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <X size={13} className="stroke-[3]" />
                    <span>{passStatusStr}</span>
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                    <Clock size={13} />
                    <span>{passStatusStr}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── Question Details Section Header ─── */}
          <div className="flex flex-col gap-1 mt-2">
            <h2 className="text-base font-extrabold text-gray-900 pb-2 border-b border-gray-200">
              {sq.questionDetails}
            </h2>
          </div>

          {/* ─── Question Cards List ─── */}
          <div className="flex flex-col gap-5">
            {resultQuestions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm font-semibold text-gray-500">
                {sq.questionDetailsUnavailable}
              </div>
            ) : resultQuestions.map((q, qIdx) => {
              const isCorrect = q.isCorrect === true
              const isWrong = q.isCorrect === false
              const hasPointsEarned = q.pointsEarned !== undefined && q.pointsEarned !== null
              const isGradedStatus = q.status === "Đã chấm" || q.status === "Graded" || q.essayStatus === "Đã chấm" || q.status === "Passed" || q.status === "Failed"
              const isGraded = isCorrect || isWrong || hasPointsEarned || isGradedStatus
              const isPending = !isGraded

              const pointsEarnedVal = hasPointsEarned
                ? q.pointsEarned
                : isCorrect
                  ? (q.points ?? "—")
                  : isWrong
                    ? 0
                    : "—"
              const pointsMaxVal = q.points ?? "—"

              const parseOptionsArray = (opts) => {
                if (Array.isArray(opts)) return opts
                if (typeof opts === "string" && opts.trim()) {
                  try {
                    const parsed = JSON.parse(opts)
                    if (Array.isArray(parsed)) return parsed
                  } catch {
                    // Not a JSON string
                  }
                }
                return []
              }

              const rawOptions = parseOptionsArray(q.options)
              const options = rawOptions.length > 0
                ? rawOptions
                : q.type === "TrueFalse"
                  ? [sq.trueOption, sq.falseOption]
                  : []

              const studentAnswers = [
                ...parseOptionsArray(q.studentOptions),
                ...parseOptionsArray(q.selectedOptions),
                ...(q.studentAnswer !== undefined && q.studentAnswer !== null ? [q.studentAnswer] : []),
              ].map(String)

              const hasAnswerKey = q.correctAnswers !== undefined && q.correctAnswers !== null
              const correctAnswers = [
                ...parseOptionsArray(q.correctAnswers),
                ...parseOptionsArray(q.correctOptions),
              ].map(String)

              return (
                <div
                  key={q.questionId || q.id || qIdx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
                >
                  {/* Card Header Bar */}
                  <div
                    className={`px-5 py-3.5 flex justify-between items-center border-b ${isWrong
                      ? "bg-red-50/60 border-red-150"
                      : isPending
                        ? "bg-amber-50/50 border-amber-150"
                        : "bg-emerald-50/60 border-emerald-150"
                      }`}
                  >
                    <span className={`text-sm font-extrabold ${isWrong ? "text-red-950" : isPending ? "text-gray-900" : "text-emerald-950"}`}>
                      {interpolate(sq.questionNumber, { number: qIdx + 1 })}
                    </span>

                    <div>
                      {isCorrect && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>{interpolate(sq.correctScore, { earned: pointsEarnedVal, max: pointsMaxVal })}</span>
                        </span>
                      )}
                      {isWrong && (
                        <span className="bg-red-100/70 text-red-700 border border-red-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                          <XCircle size={14} />
                          <span>{interpolate(sq.incorrectScore, { earned: pointsEarnedVal, max: pointsMaxVal })}</span>
                        </span>
                      )}
                      {!isCorrect && !isWrong && isGraded && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>{interpolate(sq.gradedScore, { earned: pointsEarnedVal, max: pointsMaxVal })}</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Clock size={14} />
                          <span>{interpolate(sq.pendingScore, { earned: pointsEarnedVal, max: pointsMaxVal })}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Type Info (Above question content) */}
                  <div className="px-5 pt-4 text-base font-black text-gray-950">
                    {getQuestionTypeLabel(q?.type, sq)}
                  </div>

                  {/* Question Content / Prompt */}
                  <div className="px-5 py-2 text-sm font-bold text-gray-850 leading-relaxed">
                    <RenderHTML html={q.content} />
                  </div>

                  {/* Question Image Media (Image below content, small scale, un-cropped) */}
                  {getQuestionImageUrl(q) && (
                    <div className="mx-5 mt-2 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                      <img
                        src={getQuestionImageUrl(q)}
                        alt={interpolate(sq.questionIllustration, { number: qIdx + 1 })}
                        className="max-h-56 max-w-full w-auto h-auto object-contain rounded-xl shadow-xs"
                      />
                    </div>
                  )}

                  {/* Question Audio Media (Audio play below image) */}
                  {getQuestionAudioUrl(q) && (
                    <div className="mx-5 mt-3 p-3 bg-red-50/20 border border-red-100 rounded-2xl flex items-center gap-3 shadow-2xs">
                      <audio controls src={getQuestionAudioUrl(q)} className="w-full h-10 rounded-xl" />
                    </div>
                  )}

                  {/* Options List (Radio choices / Multiple choice) */}
                  {options && options.length > 0 && (
                    <div className="px-5 pb-4 flex flex-col gap-3">
                      {options.map((optText, optIdx) => {
                        const optIndexStr = String(optIdx)
                        const optLetter = String.fromCharCode(65 + optIdx)
                        const optTextStr = String(optText).trim()

                        const isStudentPick = (
                          studentAnswers.includes(optIndexStr) ||
                          studentAnswers.includes(optLetter) ||
                          studentAnswers.some((ans) => String(ans).trim() === optTextStr)
                        )
                        const isRightAnswer = (
                          correctAnswers.includes(optIndexStr) ||
                          correctAnswers.includes(optLetter) ||
                          correctAnswers.some((ans) => String(ans).trim() === optTextStr)
                        )

                        let optionStyle = "border-gray-200 bg-white text-gray-700 font-semibold"
                        let circleStyle = "border-gray-300"
                        let rightIcon = null

                        if (isStudentPick && !hasAnswerKey) {
                          optionStyle = "border-2 border-gray-400 bg-gray-50 text-gray-900 font-bold"
                          circleStyle = "border-2 border-gray-500 bg-gray-100"
                        } else if (isStudentPick && isRightAnswer) {
                          // Student chose correct option -> Green
                          optionStyle = "border-2 border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold"
                          circleStyle = "border-2 border-emerald-500 bg-emerald-100"
                          rightIcon = <Check size={18} className="text-emerald-600 shrink-0" />
                        } else if (isStudentPick && !isRightAnswer) {
                          // Student chose wrong option -> Red
                          optionStyle = "border-2 border-red-500 bg-red-50/20 text-red-900 font-bold"
                          circleStyle = "border-2 border-red-500 bg-red-100"
                          rightIcon = <X size={18} className="text-red-600 shrink-0" />
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 text-xs md:text-sm transition-all select-none ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Radio Dot Indicator */}
                              <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${circleStyle}`}>
                                {isStudentPick && (
                                  <span
                                    className={`w-2 h-2 rounded-full ${!hasAnswerKey
                                      ? "bg-gray-600"
                                      : isRightAnswer
                                        ? "bg-emerald-600"
                                        : "bg-red-600"
                                      }`}
                                  />
                                )}
                              </div>

                              {/* Option Label */}
                              <span className={isStudentPick && hasAnswerKey && !isRightAnswer ? "text-gray-600" : ""}>
                                <span className="font-black mr-1.5">{optLetter}.</span>
                                {optText}
                              </span>
                            </div>

                            {/* Right Icon Check / X */}
                            {rightIcon}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {options.length === 0 && studentAnswers.length > 0 && (
                    <div className="px-5 pb-4 text-xs font-semibold text-gray-700">
                      <span className="font-extrabold">
                        {sq.yourSelection}
                      </span>
                      {studentAnswers
                        .map((answer) => {
                          const index = Number(answer)
                          return Number.isInteger(index) && index >= 0
                            ? String.fromCharCode(65 + index)
                            : answer
                        })
                        .join(", ")}
                    </div>
                  )}

                  {/* Essay or Fill-in Blank Student Text */}
                  {(q.type === "Essay" || q.type === "FillInBlank") && (
                    <div className="px-5 py-4 flex flex-col gap-2">
                      <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
                        {sq.yourAnswer}
                      </span>
                      <div
                        className={`p-4 border rounded-xl text-xs md:text-sm flex items-center justify-between gap-3 ${q.type === "Essay"
                          ? "bg-gray-50 border-gray-200 text-gray-800 font-semibold"
                          : isCorrect
                            ? "border-2 border-emerald-500 bg-emerald-50/20 text-emerald-950 font-bold"
                            : isWrong
                              ? "border-2 border-red-500 bg-red-50/20 text-red-950 font-bold"
                              : "bg-gray-50 border-gray-200 text-gray-800 font-semibold"
                          }`}
                      >
                        <span>
                          {q.studentFillText ||
                            (typeof q.studentAnswer === "string" && q.studentAnswer.trim() ? q.studentAnswer : null) ||
                            sq.noAnswerProvided}
                        </span>
                        {q.type !== "Essay" && isCorrect && <Check size={18} className="text-emerald-600 shrink-0" />}
                        {q.type !== "Essay" && isWrong && <X size={18} className="text-red-600 shrink-0" />}
                      </div>
                    </div>
                  )}

                  {/* Teacher Feedback Callout */}
                  {(q.essayComment || q.comment || q.feedback) && (
                    <div className="mx-5 mb-5 bg-blue-50/80 border-l-4 border-blue-600 rounded-r-xl p-4 text-xs font-semibold text-blue-950 leading-relaxed">
                      <span className="font-extrabold text-blue-900 mr-1.5">
                        {sq.teacherFeedback}
                      </span>
                      <span>{q.essayComment || q.comment || q.feedback}</span>
                    </div>
                  )}

                  {/* Correct Answer Display Box Below Question */}
                  {hasAnswerKey && correctAnswers.length > 0 && (
                    <div className="mx-5 mb-5 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        {sq.correctAnswer}
                        <strong className="text-emerald-950 font-extrabold">
                          {correctAnswers
                            .map((ans) => {
                              const idx = Number(ans)
                              if (options && options.length > 0 && Number.isInteger(idx) && idx >= 0 && idx < options.length) {
                                return `${String.fromCharCode(65 + idx)}. ${options[idx]}`
                              }
                              if (options && options.length > 0) {
                                const foundIdx = options.findIndex((o, i) =>
                                  String(o).trim() === String(ans).trim() || String.fromCharCode(65 + i) === String(ans).trim()
                                )
                                if (foundIdx !== -1) {
                                  return `${String.fromCharCode(65 + foundIdx)}. ${options[foundIdx]}`
                                }
                              }
                              return ans
                            })
                            .join(" | ")}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Explanation Callout ("Giải thích") */}
                  {q.explanation && (
                    <div className="mx-5 mb-5 bg-gray-100/90 border-l-4 border-[#990011] rounded-r-xl p-4 text-xs font-semibold text-gray-700 leading-relaxed">
                      <span className="font-extrabold text-gray-900 mr-1.5">
                        {sq.explanation}
                      </span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>

        {/* ─── Bottom Sticky Action Bar ─── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3.5 flex justify-end items-center gap-3 z-40 shadow-lg">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
          >
            {sq.back}
          </button>

          {canRetake && (
            <button
              type="button"
              onClick={handleRetake}
              className="px-6 py-2.5 bg-[#6b000b] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>{sq.retakeQuiz}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // ─── STEP 2: EXAM PROGRESSION UI (Full Page, Standalone Route, Custom Layout) ───
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col overflow-hidden font-sans text-gray-850">

      {/* ─── TOP HEADER (Full Width) ─── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-2xs shrink-0 select-none">

        {/* Header Left: Title + Online/Status Pill */}
        <div className="flex items-center gap-4">
          <h1 className="text-base md:text-xl font-black text-gray-950 tracking-tight truncate max-w-xs sm:max-w-md md:max-w-xl">
            {quiz?.name || sq.quiz}
          </h1>
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-extrabold tracking-wide">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>{sq.inProgress}</span>
          </span>
        </div>

        {/* Header Right: Auto-Save Status + Timer Pill (Placed on RIGHT side as requested) */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Auto Save timestamp info */}
          <div
            className={`hidden md:flex items-center gap-1.5 text-xs font-bold ${saveStatus === "error" ? "text-red-600" : "text-gray-400"
              }`}
            role="status"
            aria-live="polite"
          >
            <CloudCheck
              size={16}
              className={saveStatus === "error" ? "text-red-500" : "text-emerald-500"}
            />
            <span>
              {saveStatus === "error"
                ? sq.autosaveFailed
                : saveStatus === "pending" || saveStatus === "saving"
                  ? sq.saving
                  : lastSavedTimeStr
                    ? interpolate(sq.savedAt, { time: lastSavedTimeStr })
                    : sq.answersAutosave}
            </span>
            {saveStatus === "error" && (
              <button
                type="button"
                onClick={retryAnswerSave}
                className="underline underline-offset-2"
              >
                {sq.retry}
              </button>
            )}
          </div>

          {/* TIMER BOX (Prominently placed on RIGHT SIDE of header) */}
          <div className={`px-4 py-2 border rounded-full flex items-center gap-2 font-black tracking-wider text-base md:text-lg shadow-2xs transition-all ${isLowTime
            ? "bg-red-50 text-red-650 border-red-200 animate-pulse"
            : "bg-gray-50 text-gray-900 border-gray-200"
            }`}>
            <Timer size={20} className={isLowTime ? "text-red-650" : "text-[#990011]"} />
            <span>{Number.isFinite(timeRemaining) ? formatTimer(timeRemaining) : "--:--"}</span>
          </div>
        </div>

      </div>

      {submissionError && (
        <div
          role="alert"
          className="mx-4 mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 sm:mx-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{submissionError}</span>
          <button
            type="button"
            onClick={() => executeSubmit({ timedOut: timeRemaining === 0 })}
            disabled={isSubmitting}
            className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-extrabold hover:bg-red-100 disabled:opacity-50"
          >
            {isSubmitting
              ? sq.submitting
              : sq.retrySubmission}
          </button>
        </div>
      )}

      {/* ─── MAIN 2-COLUMN CONTENT BODY ─── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6">

        {/* ─── LEFT COLUMN: Active Question Card ─── */}
        <div className="flex-1 flex flex-col gap-6">
          {questions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center text-gray-400 font-bold shadow-xs">
              {sq.noQuestions}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 flex flex-col gap-6 shadow-xs relative">

              {/* Question Header: Number + Skill Tag Badge */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 select-none">
                <h2 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">
                  {interpolate(sq.questionNumber, { number: currentIndex + 1 })}
                </h2>

                <div className="flex items-center gap-2">
                  {currentQuestion?.skillTag && (
                    <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1">
                      <span>🧠 {currentQuestion.skillTag}</span>
                    </span>
                  )}
                  <span className="px-3.5 py-1 bg-red-50 border border-red-100 rounded-xl text-xs font-black text-[#990011]">
                    {currentQuestion?.points != null
                      ? interpolate(sq.points, { count: currentQuestion.points })
                      : "—"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMarkForReview(currentQuestion?.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${markedQuestions[currentQuestion?.id]
                      ? "border-red-500 bg-red-50 text-red-500 shadow-2xs"
                      : "border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                      }`}
                    title={
                      markedQuestions[currentQuestion?.id]
                        ? sq.unflagQuestion
                        : sq.flagForReview
                    }
                  >
                    <Flag className={`w-4 h-4 ${markedQuestions[currentQuestion?.id] ? "fill-red-500" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Question Type Info (Bold, bigger text, above question content and media) */}
              <div className="text-base md:text-lg font-black text-gray-950">
                {getQuestionTypeLabel(currentQuestion?.type, sq)}
              </div>

              {/* Question Content / Prompt */}
              <div className="text-sm md:text-base font-bold text-gray-850 leading-relaxed">
                {currentQuestion?.content ? (
                  <RenderHTML html={currentQuestion.content} />
                ) : (
                  <span>{sq.noQuestionContent}</span>
                )}
              </div>

              {/* Question Image Media (Image below content, small scale, un-cropped) */}
              {getQuestionImageUrl(currentQuestion) && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={getQuestionImageUrl(currentQuestion)}
                    alt={interpolate(sq.questionIllustration, { number: currentIndex + 1 })}
                    className="max-h-56 max-w-full w-auto h-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              )}

              {/* Question Audio Media (Audio play below image) */}
              {getQuestionAudioUrl(currentQuestion) && (
                <div className="p-3 bg-red-50/20 border border-red-100 rounded-2xl flex items-center gap-3 shadow-2xs">
                  <audio controls src={getQuestionAudioUrl(currentQuestion)} className="w-full h-10 rounded-xl" />
                </div>
              )}

              {/* Question Tip / Hint Callout if provided */}
              {currentQuestion?.tipText && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2 text-xs font-semibold text-amber-900">
                  <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-950 mr-1">{sq.hint}</span>
                    <span>{currentQuestion.tipText}</span>
                  </div>
                </div>
              )}

              {/* Options & Input Area by Question Type */}
              {currentQuestion && (
                <div className="pt-2">

                  {/* 1. Multiple Choice Single / MCQ */}
                  {(currentQuestion.type === "MultipleChoiceSingle" || currentQuestion.type === "mcq") && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((opt, optIdx) => {
                        const isSelected = userAnswers[currentQuestion.id] === optIdx
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => handleSingleOptionSelect(currentQuestion.id, optIdx)}
                            aria-pressed={isSelected}
                            className={`w-full text-left flex items-center gap-4 p-4 md:p-5 border rounded-2xl cursor-pointer select-none transition-all active:scale-[0.99] ${isSelected
                              ? "border-[#990011] bg-red-50/10 shadow-xs"
                              : "border-gray-200 bg-white hover:bg-gray-50/80"
                              }`}
                          >
                            <div className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-[#990011] bg-red-50/10" : "border-gray-300"
                              }`}>
                              {isSelected && <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />}
                            </div>
                            <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-[#990011]" : "text-gray-750"}`}>
                              <span className="font-extrabold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 2. Multiple Choice Multiple */}
                  {currentQuestion.type === "MultipleChoiceMultiple" && (
                    <div className="flex flex-col gap-3">
                      {(currentQuestion.options || []).map((opt, optIdx) => {
                        const selectedList = userAnswers[currentQuestion.id] || []
                        const isSelected = selectedList.includes(optIdx)
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => handleMultipleOptionToggle(currentQuestion.id, optIdx)}
                            aria-pressed={isSelected}
                            className={`w-full text-left flex items-center gap-4 p-4 md:p-5 border rounded-2xl cursor-pointer select-none transition-all active:scale-[0.99] ${isSelected
                              ? "border-[#990011] bg-red-50/10 shadow-xs"
                              : "border-gray-200 bg-white hover:bg-gray-50/80"
                              }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected
                                ? "border-[#990011] bg-[#990011] text-white"
                                : "border-gray-300 bg-white"
                                }`}
                            >
                              {isSelected && <Check size={13} />}
                            </span>
                            <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-[#990011]" : "text-gray-750"}`}>
                              <span className="font-extrabold mr-1.5">{String.fromCharCode(65 + optIdx)}.</span>
                              {opt}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 3. True / False */}
                  {currentQuestion.type === "TrueFalse" && (
                    <div className="flex flex-col gap-3">
                      {(Array.isArray(currentQuestion.options)
                        && currentQuestion.options.length >= 2
                        ? currentQuestion.options
                        : [sq.trueOption, sq.falseOption]
                      ).map((opt, optIdx) => {
                        const isSelected = userAnswers[currentQuestion.id] === optIdx
                        return (
                          <button
                            type="button"
                            key={optIdx}
                            onClick={() => handleSingleOptionSelect(currentQuestion.id, optIdx)}
                            aria-pressed={isSelected}
                            className={`w-full text-left flex items-center gap-4 p-4 md:p-5 border rounded-2xl cursor-pointer select-none transition-all active:scale-[0.99] ${isSelected
                              ? "border-[#990011] bg-red-50/10 shadow-xs"
                              : "border-gray-200 bg-white hover:bg-gray-50/80"
                              }`}
                          >
                            <div className={`w-5 h-5 border rounded-full flex items-center justify-center transition-all shrink-0 ${isSelected ? "border-[#990011] bg-red-50/10" : "border-gray-300"
                              }`}>
                              {isSelected && <span className="w-2.5 h-2.5 bg-[#990011] rounded-full" />}
                            </div>
                            <span className={`text-xs md:text-sm font-bold ${isSelected ? "text-[#990011]" : "text-gray-750"}`}>
                              {opt}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* 4. Fill in Blank */}
                  {currentQuestion.type === "FillInBlank" && (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor={`quiz-answer-${currentIndex}`}
                        className="text-xs font-extrabold text-gray-500 uppercase tracking-wide"
                      >
                        {sq.yourAnswer}
                      </label>
                      <input
                        id={`quiz-answer-${currentIndex}`}
                        type="text"
                        value={userAnswers[currentQuestion.id] || ""}
                        onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                        placeholder={sq.answerPlaceholder}
                        className="w-full p-4 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all"
                      />
                    </div>
                  )}

                  {/* 5. Essay */}
                  {currentQuestion.type === "Essay" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor={`quiz-essay-${currentIndex}`}
                          className="text-xs font-extrabold text-gray-500 uppercase tracking-wide"
                        >
                          {sq.yourEssayAnswer}
                        </label>
                        <span className="text-[11px] font-bold text-gray-400">
                          {Number.isFinite(Number(currentQuestion.maxWordCount))
                            && Number(currentQuestion.maxWordCount) > 0
                            ? interpolate(sq.wordCountWithLimit, {
                              count: (userAnswers[currentQuestion.id] || "").trim().split(/\s+/).filter(Boolean).length,
                              max: currentQuestion.maxWordCount,
                            })
                            : interpolate(sq.wordCount, {
                              count: (userAnswers[currentQuestion.id] || "").trim().split(/\s+/).filter(Boolean).length,
                            })}
                        </span>
                      </div>
                      <textarea
                        id={`quiz-essay-${currentIndex}`}
                        value={userAnswers[currentQuestion.id] || ""}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          const maxWords = Number(currentQuestion.maxWordCount)
                          const wordCount = nextValue
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean).length
                          if (
                            !Number.isFinite(maxWords) ||
                            maxWords <= 0 ||
                            wordCount <= maxWords
                          ) {
                            handleTextAnswerChange(currentQuestion.id, nextValue)
                          }
                        }}
                        placeholder={sq.essayPlaceholder}
                        className="w-full p-4 border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] min-h-[180px] resize-y transition-all"
                      />
                    </div>
                  )}

                </div>
              )}

            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN: Questions List Grid (PLACED ON RIGHT SIDE AS REQUESTED) ─── */}
        <div className="w-full lg:w-80 shrink-0 select-none">
          <div className="bg-white rounded-3xl border border-gray-150 p-5 md:p-6 flex flex-col gap-4 shadow-xs">

            {/* Sidebar Title */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                {sq.questionsList}
              </h3>
              <span className="text-xs font-extrabold text-gray-400">
                {answeredCount}/{questions.length}
              </span>
            </div>

            {/* Legend Indicators */}
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-wrap gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                <span>{sq.done}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-gray-400 bg-white inline-block" />
                <span>{sq.unanswered}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#990011] inline-block" />
                <span>{sq.current}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="w-3 h-3 text-red-500 fill-red-500" />
                <span>{sq.flagged}</span>
              </div>
            </div>

            {/* Grid of Question Buttons */}
            <div className="grid grid-cols-5 gap-2 max-w-[280px] sm:max-w-none mx-auto lg:mx-0">
              {questions.map((q, idx) => {
                const isCurrent = currentIndex === idx
                const isAnswered = isQuestionAnswered(q)
                const isMarked = Boolean(markedQuestions[q.id])

                let btnStyle = "bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-100"
                if (isCurrent) {
                  btnStyle = "bg-[#990011] text-white font-extrabold shadow-xs border-[#990011]"
                } else if (isAnswered) {
                  btnStyle = "bg-gray-200 border border-gray-300 text-gray-900 font-extrabold"
                }

                return (
                  <button
                    key={q.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={interpolate(sq.goToQuestion, {
                      number: idx + 1,
                      answerState: isAnswered
                        ? sq.questionAnsweredState
                        : sq.questionUnansweredState,
                      flaggedState: isMarked ? sq.questionFlaggedState : "",
                    })}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs transition-all cursor-pointer active:scale-95 relative ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center border border-white shadow-xs">
                        <Flag className="w-2 h-2 text-white fill-white" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

          </div>
        </div>

      </div>

      {/* ─── BOTTOM FOOTER NAVIGATION BAR ─── */}
      <div className="bg-white border-t border-gray-200 px-6 py-3.5 flex items-center justify-between shadow-xs shrink-0 select-none">

        {/* Left: Previous Question */}
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>{sq.previousQuestion}</span>
        </button>

        {/* Right: Next Question & Submit Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{sq.nextQuestion}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowSubmitConfirmModal(true)}
            className="px-6 py-2.5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} />
            <span>{sq.submit}</span>
          </button>
        </div>

      </div>

      {/* ─── SUBMIT CONFIRMATION MODAL ─── */}
      {showSubmitConfirmModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <div
            ref={submitDialogRef}
            className="bg-white rounded-3xl border border-gray-150 p-6 md:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5 text-center animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-submit-title"
            aria-describedby="quiz-submit-description"
            aria-busy={isSubmitting}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isSubmitting) {
                event.preventDefault()
                setShowSubmitConfirmModal(false)
                return
              }

              if (event.key !== "Tab") return
              const focusableElements = Array.from(
                submitDialogRef.current?.querySelectorAll(
                  "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
                ) ?? [],
              )
              if (focusableElements.length === 0) {
                event.preventDefault()
                return
              }

              const firstElement = focusableElements[0]
              const lastElement = focusableElements[focusableElements.length - 1]
              if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault()
                lastElement.focus()
              } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault()
                firstElement.focus()
              }
            }}
          >
            <div className="w-14 h-14 bg-red-50 text-[#990011] rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Send size={24} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 id="quiz-submit-title" className="text-lg font-black text-gray-950">
                {sq.confirmSubmissionTitle}
              </h3>
              <p id="quiz-submit-description" className="text-xs font-bold text-gray-500">
                {interpolate(sq.confirmSubmissionDescription, {
                  answered: answeredCount,
                  total: questions.length,
                })}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                ref={cancelSubmitButtonRef}
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                {sq.cancelContinue}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeSubmit()}
                className="flex-1 py-3 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? sq.submitting : sq.confirmSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default StudentTakeQuizView
