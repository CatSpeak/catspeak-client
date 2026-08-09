import React, { useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetTeacherQuizDetailQuery,
  useGetTeacherQuizStudentsQuery,
  useGetTeacherQuizStatsQuery,
  usePublishTeacherQuizMutation,
  useCloseTeacherQuizMutation,
  useDeleteTeacherQuizMutation,
  useExportTeacherQuizReportMutation,
  useGradeTeacherEssayMutation,
  useGetTeacherStudentAttemptQuery,
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import { getQuizObjectFromResponse } from "@/features/courses/utils/quizUtils"
import {
  Pencil,
  MoreVertical,
  HelpCircle,
  Clock,
  Calendar,
  CheckSquare,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flag,
  Play,
  Pause,
  ArrowLeft,
  Users,
  BarChart2,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Download,
  TrendingUp,
  TrendingDown,
  Check,
  Minus,
  Plus,
  Trash2,
} from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"

const SUBMISSIONS_PAGE_SIZE = 20

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const interpolate = (template, values) => Object.entries(values).reduce(
  (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
  template || "",
)

const getFirstPositiveNumber = (sources, keys) => {
  for (const source of sources) {
    if (!isRecord(source)) continue
    for (const key of keys) {
      const value = Number(source[key])
      if (Number.isFinite(value) && value > 0) return value
    }
  }
  return null
}

const getFirstNonNegativeNumber = (sources, keys) => {
  for (const source of sources) {
    if (!isRecord(source)) continue
    for (const key of keys) {
      const value = Number(source[key])
      if (Number.isFinite(value) && value >= 0) return value
    }
  }
  return null
}

const getFirstBoolean = (sources, keys) => {
  for (const source of sources) {
    if (!isRecord(source)) continue
    for (const key of keys) {
      if (typeof source[key] === "boolean") return source[key]
    }
  }
  return null
}

const getStudentsPageFromResponse = (response, requestedPage) => {
  const envelope = isRecord(response) ? response : null
  const payload = envelope && Object.prototype.hasOwnProperty.call(envelope, "data")
    ? envelope.data
    : response
  const payloadRecord = isRecord(payload) ? payload : null
  const nestedPayload = payloadRecord && Object.prototype.hasOwnProperty.call(payloadRecord, "data")
    ? payloadRecord.data
    : null
  const nestedPayloadRecord = isRecord(nestedPayload) ? nestedPayload : null

  const students = [
    payload,
    payloadRecord?.items,
    payloadRecord?.students,
    payloadRecord?.results,
    payloadRecord?.records,
    nestedPayload,
    nestedPayloadRecord?.items,
    nestedPayloadRecord?.students,
    nestedPayloadRecord?.results,
    nestedPayloadRecord?.records,
  ].find(Array.isArray) || []

  const paginationSources = [
    payloadRecord?.pagination,
    payloadRecord?.meta,
    nestedPayloadRecord?.pagination,
    nestedPayloadRecord?.meta,
    envelope?.pagination,
    envelope?.meta,
    nestedPayloadRecord,
    payloadRecord,
    envelope,
  ]
  const page = getFirstPositiveNumber(
    paginationSources,
    ["page", "currentPage", "pageNumber"],
  ) || requestedPage
  const pageSize = getFirstPositiveNumber(
    paginationSources,
    ["pageSize", "limit", "perPage"],
  ) || SUBMISSIONS_PAGE_SIZE
  const totalPages = getFirstPositiveNumber(
    paginationSources,
    ["totalPages", "pageCount"],
  )
  const totalItems = getFirstNonNegativeNumber(
    paginationSources,
    ["totalItems", "totalCount", "totalRecords"],
  )
  const explicitHasNext = getFirstBoolean(
    paginationSources,
    ["hasNextPage", "hasNext"],
  )
  const hasNextPage = explicitHasNext
    ?? (totalPages !== null ? page < totalPages : students.length === pageSize)

  return {
    students,
    page,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage,
  }
}

const isEssayQuestion = (question) => (
  String(question?.type || "").trim().toLowerCase() === "essay"
)

const formatStatistic = (value, suffix = "") => {
  if (value === null || value === undefined || value === "") return "—"
  const number = Number(value)
  return Number.isFinite(number) ? `${number}${suffix}` : "—"
}

// Question Type Label Helper
const getQuestionTypeLabel = (typeRaw, qg) => {
  const type = String(typeRaw || "").trim()
  if (type === "MultipleChoiceSingle" || type === "mcq") {
    return qg.questionTypeSingleChoice
  }
  if (type === "MultipleChoiceMultiple") {
    return qg.questionTypeMultipleChoice
  }
  if (type === "TrueFalse") {
    return qg.questionTypeTrueFalse
  }
  if (type === "FillInBlank") {
    return qg.questionTypeFillBlank
  }
  if (type === "Essay" || type === "essay") {
    return qg.questionTypeEssay
  }
  return type || qg.questionTypeDefault
}

// Custom Recharts Tooltip
const CustomChartTooltip = ({ active, payload, label }) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-100 text-xs">
        <p className="font-bold text-gray-900">{qg.scoreRange}: {label}</p>
        <p className="text-[#990011] font-semibold mt-0.5">
          {qg.studentCount}: {payload[0].value}
        </p>
      </div>
    )
  }
  return null
}

// Status Badge Component
const StatusBadge = ({ status }) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}
  const lower = String(status || "").toLowerCase()
  if (lower === "published" || lower === "open" || lower === "đang mở") {
    return (
      <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {qg.statusOpen}
      </span>
    )
  }
  if (lower === "draft" || lower === "bản nháp") {
    return (
      <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {qg.statusDraft}
      </span>
    )
  }
  return (
    <span className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      {qg.statusClosed}
    </span>
  )
}

// Date Range Formatter
const formatDateRange = (openTime, closeTime, qg, formatDate) => {
  if (!openTime && !closeTime) return qg.noTimeLimit
  const start = openTime ? formatDate(openTime) : ""
  const end = closeTime ? formatDate(closeTime) : ""
  if (start && end) return `${start} - ${end}`
  if (start) return interpolate(qg.fromDate, { date: start })
  if (end) return interpolate(qg.dueDate, { date: end })
  return qg.notAvailable
}

// Relative Time Helper ("Last update: 3 min ago")
const formatTimeAgo = (dateStr, qg) => {
  if (!dateStr) return qg.timeUnknown
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return qg.timeUnknown
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 0) return qg.inFuture
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return qg.justNow
  if (diffMins < 60) return interpolate(qg.minutesAgo, { count: diffMins })
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return interpolate(qg.hoursAgo, { count: diffHours })
  const diffDays = Math.floor(diffHours / 24)
  return interpolate(qg.daysAgo, { count: diffDays })
}

// Student Initials Helper
const getStudentInitials = (name, fallback) => {
  if (!name || typeof name !== "string") return fallback
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Submission Status Helper
const getSubmissionStatus = (student, qg) => {
  const statusRaw = String(student.submissionStatus || student.status || "").toLowerCase()
  if (statusRaw.includes("muộn") || statusRaw.includes("late")) {
    return { label: qg.submissionLate, style: "bg-[#FDF2F2] text-[#E02424] border border-pink-100" }
  }
  if (
    statusRaw.includes("chưa") ||
    statusRaw.includes("not") ||
    statusRaw.includes("unsubmitted") ||
    (student.score == null && !statusRaw.includes("nộp") && !statusRaw.includes("submitted"))
  ) {
    return { label: qg.submissionNotSubmitted, style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
  }
  return { label: qg.submissionSubmitted, style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
}

// Grading Status Helper
const getGradingStatus = (student, qg) => {
  const gradingRaw = String(student.gradingStatus || student.essayStatus || "").toLowerCase()
  if (
    gradingRaw.includes("chưa") ||
    gradingRaw.includes("ungraded") ||
    gradingRaw.includes("draft") ||
    gradingRaw.includes("chờ")
  ) {
    return { label: qg.gradingNotGraded, style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
  }
  if (
    gradingRaw.includes("đã") ||
    gradingRaw.includes("graded") ||
    gradingRaw.includes("finalized") ||
    (student.score !== null && student.score !== undefined && student.score !== "–")
  ) {
    return { label: qg.gradingGraded, style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
  }
  return { label: qg.gradingNotGraded, style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
}

// Custom Audio Player Bar
const AudioPlayerBar = ({ src }) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}
  const audioRef = React.useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(() => { })
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (secs) => {
    if (!secs || Number.isNaN(secs)) return "0:00"
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="mt-3 mb-3 w-full bg-gray-50 border border-gray-150 p-3.5 rounded-2xl flex items-center gap-3">
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
      {/* Play / Pause Button placed to the left side of progress bar */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
        aria-label={isPlaying ? qg.pauseAudio : qg.playAudio}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current text-white" />
        ) : (
          <Play className="w-4 h-4 fill-current text-white ml-0.5" />
        )}
      </button>

      {/* Progress Track & Time Labels (Full width) */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div
          className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            if (audioRef.current && duration) {
              const newTime = pct * duration
              audioRef.current.currentTime = newTime
              setCurrentTime(newTime)
            }
          }}
        >
          <div
            className="bg-[#990011] h-full transition-all duration-150 rounded-full"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        {/* Time Labels */}
        <div className="flex justify-between text-[11px] text-gray-500 font-bold px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

const TeacherAttemptState = ({
  title,
  message,
  onClose,
  onRetry,
  isLoading = false,
}) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}

  return (
    <div className="min-h-[450px] bg-gray-100 flex flex-col">
    <div className="pb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onClose}
        className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
        title={qg.goBack}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">
        {title}
      </h1>
    </div>
    <div className="min-h-[360px] bg-white rounded-3xl border border-gray-150 flex flex-col items-center justify-center gap-4 p-8 text-center">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <AlertCircle className="w-10 h-10 text-amber-500" />
      )}
      <p className="max-w-md text-sm font-semibold text-gray-600">{message}</p>
      {!isLoading && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white hover:bg-[#80000e]"
        >
          {qg.retry}
        </button>
      )}
    </div>
    </div>
  )
}

// Full-Page Student Attempt Grading View for Teacher
const TeacherStudentGradeView = ({ submission, quizDetail, onClose, classId, quizId }) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}
  const studentId = submission.studentId || submission.id || submission.studentCode
  const {
    data: attemptResponse,
    isLoading: isAttemptLoading,
    isFetching: isAttemptFetching,
    isError: isAttemptError,
    refetch: refetchAttempt,
  } = useGetTeacherStudentAttemptQuery(
    { classId, quizId, studentId },
    { skip: !classId || !quizId || !studentId },
  )
  const attemptData = getQuizObjectFromResponse(attemptResponse)

  const [gradeEssay] = useGradeTeacherEssayMutation()
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [essayScores, setEssayScores] = useState({})
  const [essayComments, setEssayComments] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const attemptTitle = quizDetail?.name || quizDetail?.title || qg.quizDetails

  if (!studentId) {
    return (
      <TeacherAttemptState
        title={attemptTitle}
        message={qg.studentNotIdentified}
        onClose={onClose}
      />
    )
  }

  if (isAttemptLoading || (isAttemptFetching && !attemptData)) {
    return (
      <TeacherAttemptState
        title={attemptTitle}
        message={qg.loadingStudentAttempt}
        onClose={onClose}
        isLoading
      />
    )
  }

  if (isAttemptError) {
    return (
      <TeacherAttemptState
        title={attemptTitle}
        message={qg.loadStudentAttemptError}
        onClose={onClose}
        onRetry={refetchAttempt}
      />
    )
  }

  if (!attemptData) {
    return (
      <TeacherAttemptState
        title={attemptTitle}
        message={qg.attemptDataUnavailable}
        onClose={onClose}
        onRetry={refetchAttempt}
      />
    )
  }

  const displayQuestions = Array.isArray(attemptData.questions)
    ? attemptData.questions
    : []

  if (displayQuestions.length === 0) {
    return (
      <TeacherAttemptState
        title={attemptTitle}
        message={qg.attemptQuestionsUnavailable}
        onClose={onClose}
        onRetry={refetchAttempt}
      />
    )
  }

  const studentName = attemptData?.studentName || submission.studentName || submission.name || qg.student
  const studentCode = attemptData?.studentCode || submission.studentCode || submission.studentId || qg.notAvailable
  const submissionTime = attemptData?.submittedAt || submission.submittedAt || submission.createdAt || submission.date

  const currentQuestion = displayQuestions[selectedQuestionIndex] || displayQuestions[0] || null
  const currentQuestionIndex = displayQuestions[selectedQuestionIndex]
    ? selectedQuestionIndex
    : 0
  const currentQId = currentQuestion ? (currentQuestion.questionId ?? currentQuestion.id) : null
  const isCurrentEssay = isEssayQuestion(currentQuestion)
  const rawPointsMax = currentQuestion?.points ?? currentQuestion?.maxPoints
  const pointsMax = Number.isFinite(Number(rawPointsMax))
    ? Number(rawPointsMax)
    : null

  const totalQuestionsCount = displayQuestions.length
  const gradedQuestionsCount = displayQuestions.filter((q) => {
    const qId = q.questionId ?? q.id
    const hasLocalScore = essayScores[qId] !== undefined && essayScores[qId] !== ""
    if (hasLocalScore) return true
    if (isEssayQuestion(q)) {
      return (q.essayScore !== undefined && q.essayScore !== null) || q.essayScoreFinalized === true || (q.pointsEarned !== undefined && q.pointsEarned !== null)
    }
    return q.isCorrect !== undefined || q.pointsEarned !== undefined || q.status === "Đúng" || q.status === "Sai"
  }).length

  const scoreDisplay = attemptData?.displayScore ?? attemptData?.rawScore ?? submission.score ?? "—"
  const questionPoints = displayQuestions.map((q) => Number(q.points ?? q.maxPoints))
  const calculatedMaxScore = questionPoints.every(Number.isFinite)
    ? questionPoints.reduce((total, points) => total + points, 0)
    : null
  const maxScore = attemptData?.maxDisplayScore
    ?? attemptData?.maxScore
    ?? quizDetail?.maxScore
    ?? quizDetail?.points
    ?? calculatedMaxScore

  // Current question score & comment state
  const currentScoreVal = currentQId !== null && currentQId !== undefined
    ? (essayScores[currentQId] !== undefined
      ? essayScores[currentQId]
      : (currentQuestion?.essayScore ?? currentQuestion?.pointsEarned ?? ""))
    : ""
  const currentCommentVal = currentQId !== null && currentQId !== undefined
    ? (essayComments[currentQId] !== undefined
      ? essayComments[currentQId]
      : (currentQuestion?.essayComment ?? currentQuestion?.comment ?? ""))
    : ""

  const handleStepScore = (delta) => {
    if (!isCurrentEssay || currentQId === null || currentQId === undefined) return
    const parsedCurrentScore = Number.parseFloat(currentScoreVal)
    const currentScore = Number.isFinite(parsedCurrentScore) ? parsedCurrentScore : 0
    const upperBound = pointsMax ?? Number.POSITIVE_INFINITY
    const next = Math.max(
      0,
      Math.min(upperBound, Number.parseFloat((currentScore + delta).toFixed(2))),
    )
    setEssayScores((prev) => ({ ...prev, [currentQId]: next }))
  }

  const handleScoreInputChange = (val) => {
    if (!isCurrentEssay || currentQId === null || currentQId === undefined) return
    if (val === "") {
      setEssayScores((prev) => ({ ...prev, [currentQId]: "" }))
      return
    }
    const num = Number.parseFloat(val)
    if (!Number.isNaN(num)) {
      const clamped = Math.max(0, Math.min(pointsMax ?? Number.POSITIVE_INFINITY, num))
      setEssayScores((prev) => ({ ...prev, [currentQId]: clamped }))
    } else {
      setEssayScores((prev) => ({ ...prev, [currentQId]: val }))
    }
  }

  const handleSaveGrade = async (isDraft = false) => {
    if (!isCurrentEssay) {
      toast.error(qg.onlyEssayManualGrading)
      return
    }

    const targetStudentId = attemptData.studentId ?? submission.studentId ?? submission.id ?? studentId
    const targetAttemptNumber = Number(attemptData.attemptNumber ?? submission.attemptNumber)
    if (!targetStudentId || !Number.isInteger(targetAttemptNumber) || targetAttemptNumber <= 0) {
      toast.error(qg.missingAttemptInfo)
      return
    }

    const modifiedQIds = new Set([
      ...Object.keys(essayScores),
      ...Object.keys(essayComments),
    ])

    const questionsToGrade = []
    let hasMissingScore = false
    let hasInvalidScore = false

    displayQuestions.forEach((q) => {
      const qId = q.questionId ?? q.id
      if (qId === null || qId === undefined) return

      if (!isEssayQuestion(q)) return

      if (!modifiedQIds.has(String(qId))) return

      let scoreVal
      if (Object.prototype.hasOwnProperty.call(essayScores, qId)) {
        if (essayScores[qId] === "") {
          hasMissingScore = true
          return
        }
        scoreVal = Number.parseFloat(essayScores[qId])
      } else if (q.essayScore !== undefined && q.essayScore !== null) {
        scoreVal = Number.parseFloat(q.essayScore)
      } else if (q.pointsEarned !== undefined && q.pointsEarned !== null) {
        scoreVal = Number.parseFloat(q.pointsEarned)
      } else {
        hasMissingScore = true
        return
      }

      const questionMax = Number(q.points ?? q.maxPoints)
      if (
        !Number.isFinite(scoreVal)
        || scoreVal < 0
        || (Number.isFinite(questionMax) && scoreVal > questionMax)
      ) {
        hasInvalidScore = true
        return
      }

      const commentVal = essayComments[qId] !== undefined
        ? essayComments[qId]
        : (q.essayComment ?? q.comment ?? "")

      questionsToGrade.push({
        questionId: qId,
        score: scoreVal,
        comment: commentVal,
      })
    })

    if (hasMissingScore) {
      toast.error(qg.essayScoreRequired)
      return
    }

    if (hasInvalidScore) {
      toast.error(qg.invalidEssayScore)
      return
    }

    if (questionsToGrade.length === 0) {
      toast.error(qg.scoreOrCommentRequired)
      return
    }

    setIsSaving(true)
    try {
      await Promise.all(
        questionsToGrade.map((item) =>
          gradeEssay({
            classId,
            quizId,
            questionId: item.questionId,
            studentId: targetStudentId,
            attemptNumber: targetAttemptNumber,
            score: item.score,
            comment: item.comment,
            isDraft,
          }).unwrap()
        )
      )

      const msg = questionsToGrade.length === 1
        ? (isDraft ? qg.gradeDraftSaved : qg.gradingCompleted)
        : interpolate(
          isDraft ? qg.gradeDraftSavedMultiple : qg.gradingCompletedMultiple,
          { count: questionsToGrade.length },
        )

      toast.success(msg)

      setEssayScores({})
      setEssayComments({})

      if (refetchAttempt) {
        await refetchAttempt()
      }
    } catch {
      toast.error(qg.saveGradeError)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="pb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-700 transition-colors cursor-pointer"
            title={qg.goBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-black text-gray-950 tracking-tight">
            {attemptTitle}
          </h1>
        </div>

        {/* Right Header: Grading progress + Score badge */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{qg.graded}</span>
              <span className="text-xs font-black text-gray-800">
                {interpolate(qg.gradedQuestionsCount, {
                  graded: gradedQuestionsCount,
                  total: totalQuestionsCount,
                })}
              </span>
            </div>
            <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="bg-[#990011] h-full rounded-full transition-all duration-300"
                style={{ width: `${totalQuestionsCount ? (gradedQuestionsCount / totalQuestionsCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">{qg.score}</span>
            <span className="text-xl md:text-2xl font-black text-[#990011]">
              {scoreDisplay}{maxScore !== null && maxScore !== undefined ? `/${maxScore}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left Column: Active Question & Answer Details */}
        {currentQuestion ? (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-150 flex flex-col gap-6 shadow-xs">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl md:text-2xl font-black text-[#990011] tracking-tight">
                {interpolate(qg.questionNumber, { number: currentQuestionIndex + 1 })}
              </h2>
              <span className="px-3.5 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
                {pointsMax !== null
                  ? interpolate(qg.points, { count: pointsMax })
                  : qg.noMaximumScore}
              </span>
            </div>

            {/* Question Type Label */}
            <div className="text-sm font-bold text-gray-700">
              <span className="font-extrabold text-gray-900">{getQuestionTypeLabel(currentQuestion.type, qg)}</span>
            </div>

            {/* Question Prompt */}
            {currentQuestion.content && (
              <div className="text-sm md:text-base font-bold text-gray-850 leading-relaxed">
                <RenderHTML html={currentQuestion.content} />
              </div>
            )}

            {/* Question Image Media */}
            {(currentQuestion.mediaUrl || currentQuestion.imageUrl) && (
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                <img
                  src={currentQuestion.mediaUrl || currentQuestion.imageUrl}
                  alt={interpolate(qg.questionIllustration, {
                    number: currentQuestionIndex + 1,
                  })}
                  className="max-h-80 max-w-full w-auto h-auto object-contain rounded-xl shadow-xs"
                />
              </div>
            )}

            {/* Question Audio Media */}
            {currentQuestion.audioUrl && (
              <AudioPlayerBar src={currentQuestion.audioUrl} />
            )}

            {/* Student Answer Box */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">
                {qg.answerLabel}
              </span>

              {isCurrentEssay ? (
                <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-5 text-sm font-medium text-gray-800 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                  {currentQuestion.studentFillText || currentQuestion.answerText || qg.noStudentEssayAnswer}
                </div>
              ) : currentQuestion.type === "FillInBlank" ? (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    <span className="font-bold text-gray-500 block mb-1">{qg.studentAnswer}</span>
                    <p className="text-gray-900 font-bold whitespace-pre-wrap">
                      {currentQuestion.studentFillText || currentQuestion.answerText || currentQuestion.fillText || qg.noAnswer}
                    </p>
                  </div>
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                    <span className="font-bold text-emerald-700 block mb-1">{qg.correctAnswer}</span>
                    <p className="font-extrabold text-emerald-950">
                      {Array.isArray(currentQuestion.correctAnswers)
                        ? currentQuestion.correctAnswers.join(" / ")
                        : (currentQuestion.correctAnswer || qg.noCorrectAnswer)}
                    </p>
                  </div>
                </div>
              ) : (
                /* Multiple Choice / TrueFalse Option List */
                <div className="space-y-2.5 text-xs">
                  {Array.isArray(currentQuestion.options) && currentQuestion.options.map((opt, optIdx) => {
                    const strIdx = String(optIdx)
                    const studentOpts = Array.isArray(currentQuestion.studentOptions) ? currentQuestion.studentOptions.map(String) : []
                    const rawCorrect = currentQuestion.correctAnswers || currentQuestion.correctAnswer || []
                    const correctAnswers = Array.isArray(rawCorrect) ? rawCorrect.map(String) : [String(rawCorrect)]

                    const isStudentPick = studentOpts.includes(strIdx) || studentOpts.includes(opt)
                    const isRightOpt = correctAnswers.includes(strIdx) || correctAnswers.includes(opt)
                    const isMultipleChoice = currentQuestion.type === "MultipleChoiceMultiple"

                    let style = "bg-gray-50 border-gray-150 text-gray-700"
                    let boxStyle = "border-gray-300 bg-white"
                    if (isStudentPick && isRightOpt) {
                      style = "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                      boxStyle = "border-emerald-600 bg-emerald-600 text-white"
                    } else if (isStudentPick && !isRightOpt) {
                      style = "bg-red-50 border-red-300 text-red-900 font-bold"
                      boxStyle = "border-red-600 bg-red-600 text-white"
                    } else if (!isStudentPick && isRightOpt) {
                      style = "bg-blue-50 border-blue-200 text-blue-900 font-bold"
                      boxStyle = "border-blue-600 bg-blue-600 text-white"
                    }

                    return (
                      <div key={optIdx} className={`p-3.5 border rounded-2xl flex items-center justify-between ${style}`}>
                        <div className="flex items-center gap-3">
                          {isMultipleChoice ? (
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${boxStyle}`}>
                              {(isStudentPick || isRightOpt) && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          ) : (
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isStudentPick || isRightOpt ? (isStudentPick && isRightOpt ? "border-emerald-600" : isStudentPick ? "border-red-600" : "border-blue-600") : "border-gray-300 bg-white"}`}>
                              {(isStudentPick || isRightOpt) && (
                                <div className={`w-2 h-2 rounded-full ${isStudentPick && isRightOpt ? "bg-emerald-600" : isStudentPick ? "bg-red-600" : "bg-blue-600"}`} />
                              )}
                            </div>
                          )}
                          <span className="font-semibold">{String.fromCharCode(65 + optIdx)}. {opt}</span>
                        </div>
                        {isStudentPick && <span className="text-[10px] font-black uppercase tracking-wider">{qg.selected}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 font-bold border border-gray-150">
            {qg.questionInformationNotFound}
          </div>
        )}

        {/* Right Column: Questions Navigation Grid & Grading Panel */}
        <div className="flex flex-col gap-6 select-none">
          {/* Card 1: Questions List Navigation Grid */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-center text-gray-900 tracking-tight">
              {qg.questionsList}
            </h3>
            <div className="border-b border-gray-150" />

            <div className="grid grid-cols-5 gap-3 mx-auto">
              {displayQuestions.map((q, qIdx) => {
                const isCurrent = currentQuestionIndex === qIdx
                const isEssay = isEssayQuestion(q)
                const qId = q.questionId ?? q.id
                const hasGrade = (essayScores[qId] !== undefined && essayScores[qId] !== "") || (q.essayScore !== undefined && q.essayScore !== null) || q.essayScoreFinalized === true || (q.pointsEarned !== undefined && q.pointsEarned !== null)
                const isPending = isEssay && !hasGrade

                let btnStyle = "bg-gray-200 text-gray-800 font-bold hover:bg-gray-300"
                if (isCurrent) {
                  btnStyle = "bg-[#990011] text-white font-extrabold shadow-sm border-2 border-[#990011]"
                } else if (isPending) {
                  btnStyle = "border-2 border-red-500 text-red-600 bg-white font-bold hover:bg-red-50"
                }

                return (
                  <button
                    key={qId || qIdx}
                    type="button"
                    onClick={() => setSelectedQuestionIndex(qIdx)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${btnStyle}`}
                  >
                    {qIdx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Card 2: Grading & Feedback Panel */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-black text-center text-gray-900 tracking-tight">
              {isCurrentEssay ? qg.gradingAndFeedback : qg.automaticGradingResult}
            </h3>
            <div className="border-b border-gray-150" />

            {/* Student Avatar Card */}
            <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-gray-300 shrink-0 flex items-center justify-center text-gray-600 font-bold text-sm">
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-gray-900 text-sm truncate">{studentName}</span>
                <span className="text-xs text-gray-500 font-medium">{qg.studentCode}: {studentCode}</span>
                <span className="text-xs text-gray-400 font-medium">
                  {submissionTime
                    ? `${qg.submitted}: ${formatTimeAgo(submissionTime, qg)}`
                    : qg.noSubmissionTime}
                </span>
              </div>
            </div>

            {isCurrentEssay ? (
              <>
                {/* Score Stepper */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{qg.score}</label>
                  <div className="flex items-center rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => handleStepScore(-0.5)}
                      className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-800 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                      aria-label={qg.decreaseScore}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 text-center font-extrabold text-sm text-gray-900 flex items-center justify-center gap-1 px-2">
                      <input
                        type="number"
                        step="0.5"
                        max={pointsMax ?? undefined}
                        min="0"
                        value={currentScoreVal}
                        onChange={(e) => handleScoreInputChange(e.target.value)}
                        placeholder={qg.scorePlaceholder}
                        className="w-20 text-center font-black text-red-700 bg-transparent focus:outline-none"
                      />
                      <span className="text-gray-400 font-bold">
                        / {pointsMax ?? "—"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStepScore(0.5)}
                      className="w-10 h-10 rounded-xl bg-[#990011] hover:bg-[#80000e] text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                      aria-label={qg.increaseScore}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Feedback Textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">{qg.feedback}</label>
                  <textarea
                    value={currentCommentVal}
                    onChange={(e) => {
                      if (currentQId !== null && currentQId !== undefined) {
                        setEssayComments((prev) => ({ ...prev, [currentQId]: e.target.value }))
                      }
                    }}
                    placeholder={qg.feedbackPlaceholder}
                    className="w-full p-4 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-800 bg-gray-50/50 min-h-[110px] resize-y focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveGrade(false)}
                  disabled={
                    isSaving
                    || isAttemptFetching
                    || currentQId === null
                    || currentQId === undefined
                  }
                  className="bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-sm py-3.5 rounded-2xl w-full shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? qg.saving : qg.save}
                </button>
              </>
            ) : (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-center">
                <p className="text-xs font-semibold text-blue-800">
                  {qg.automaticallyGradedNotice}
                </p>
                <p className="mt-2 text-lg font-black text-gray-900">
                  {currentQuestion.pointsEarned ?? "—"}
                  {pointsMax !== null ? `/${pointsMax}` : ""}
                </p>
                {typeof currentQuestion.isCorrect === "boolean" && (
                  <p className={`mt-1 text-xs font-bold ${currentQuestion.isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                    {currentQuestion.isCorrect ? qg.correct : qg.incorrect}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Single Question Display Card
const QuestionDetailCard = ({ question, index }) => {
  const { t } = useLanguage()
  const qg = t.courses?.grading?.teacherQuiz || {}
  const [isFlagged, setIsFlagged] = useState(false)

  const points = question.points ?? question.score ?? 5
  const content = question.content || question.title || question.questionText || ""
  const options = Array.isArray(question.options) ? question.options : []
  const rawCorrect = question.correctAnswers || question.correctAnswer || question.answerText || question.solution
  const correctAnswers = Array.isArray(rawCorrect)
    ? rawCorrect.map((a) => String(a).trim())
    : (rawCorrect !== undefined && rawCorrect !== null && String(rawCorrect).trim() !== "" ? [String(rawCorrect).trim()] : [])

  const type = question.type || "MultipleChoiceSingle"
  const imageUrl = question.imageUrl || question.mediaUrl
  const audioUrl = question.audioUrl

  // Check if option is marked as correct
  const isOptionCorrect = (opt, optIdx) => {
    if (correctAnswers.length === 0) return false
    const letter = String.fromCharCode(65 + optIdx)
    const strOpt = String(opt).trim()
    return (
      correctAnswers.includes(strOpt) ||
      correctAnswers.includes(letter) ||
      correctAnswers.includes(String(optIdx))
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative mb-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-[#990011]">
          {interpolate(qg.questionNumber, { number: index + 1 })}
        </h4>
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-lg">
            {interpolate(qg.points, { count: points })}
          </span>
          <button
            type="button"
            onClick={() => setIsFlagged(!isFlagged)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${isFlagged
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-red-200 text-red-500 hover:bg-red-50"
              }`}
            title={isFlagged ? qg.unflag : qg.flag}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Question Type Info */}
      <div className="text-sm font-bold text-gray-700 mb-2">
        <span className="font-extrabold text-gray-900">{getQuestionTypeLabel(type, qg)}</span>
      </div>

      {/* Content / Prompt */}
      {content && (
        <div className="text-sm text-gray-700 font-medium leading-relaxed mb-4">
          <RenderHTML html={content} />
        </div>
      )}

      {/* Image Media Preview */}
      {imageUrl && (
        <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 flex justify-center bg-gray-50 p-2">
          <img
            src={imageUrl}
            alt={interpolate(qg.questionIllustration, { number: index + 1 })}
            className="max-h-48 max-w-xs sm:max-w-sm w-auto h-auto object-contain rounded-xl"
          />
        </div>
      )}

      {/* Audio Media Player Bar */}
      {audioUrl && (
        <div className="mb-3">
          <AudioPlayerBar src={audioUrl} />
        </div>
      )}

      {/* Choice Options List */}
      {options.length > 0 && (
        <div className="space-y-3 mt-4">
          {options.map((opt, optIdx) => {
            const isCorrect = isOptionCorrect(opt, optIdx)
            const prefixLetter = String.fromCharCode(65 + optIdx)
            const hasPrefix = typeof opt === "string" && /^[A-Z]\.\s/.test(opt.trim())
            const displayText = hasPrefix ? opt : `${prefixLetter}. ${opt}`
            const isMultipleChoice = type === "MultipleChoiceMultiple"

            return (
              <div
                key={optIdx}
                className={`w-full p-4 rounded-2xl border flex items-center gap-3 text-sm font-medium transition-all ${isCorrect
                  ? "bg-red-50/50 border-red-300 text-red-900 font-bold"
                  : "bg-gray-50/70 border-gray-100 text-gray-700"
                  }`}
              >
                {isMultipleChoice ? (
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isCorrect ? "border-[#990011] bg-[#990011]" : "border-gray-300 bg-white"
                      }`}
                  >
                    {isCorrect && (
                      <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isCorrect ? "border-[#990011]" : "border-gray-300 bg-white"
                      }`}
                  >
                    {isCorrect && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#990011]" />
                    )}
                  </div>
                )}
                <span>{displayText}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Fill In Blank Correct Answer display */}
      {type === "FillInBlank" && (
        <div className="mt-3 p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-extrabold text-emerald-800">
              {correctAnswers.length > 0
                ? correctAnswers.join(" / ")
                : qg.noCorrectAnswer}
            </span>
          </div>
        </div>
      )}

      {/* Essay / Text Question info */}
      {type === "Essay" && (
        <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 font-medium">
          {interpolate(qg.essayManualWordLimit, {
            count: question.maxWordCount || 500,
          })}
        </div>
      )}
    </div>
  )
}

// Main Teacher Quiz Detail View Component
const TeacherQuizDetailView = ({ classId, quizId, onEdit, onBack }) => {
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const c = t?.courses || {}
  const cg = c?.grading || {}
  const qg = cg.teacherQuiz || {}
  const navigate = useNavigate()
  const routeParams = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const routeStudentId = routeParams.studentId || searchParams.get("studentId")

  const urlTab = searchParams.get("tab")
  const VALID_QUIZ_TABS = ["overview", "submissions", "stats"]
  const activeTab = (urlTab && VALID_QUIZ_TABS.includes(urlTab)) ? urlTab : "overview"

  const setActiveTab = (tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set("tab", tab)
      return next
    })
  }
  const [isQuestionsCollapsed, setIsQuestionsCollapsed] = useState(false)
  const [visibleQuestionsCount, setVisibleQuestionsCount] = useState(1)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Submissions search & modal state
  const [submissionSearch, setSubmissionSearch] = useState("")
  const [submissionPage, setSubmissionPage] = useState(1)
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState(null)

  const activeSubmission = selectedStudentSubmission || (routeStudentId ? { studentId: routeStudentId, id: routeStudentId } : null)

  // Fetch Quiz Detail
  const {
    data: detailResponse,
    isLoading: isQuizLoading,
    isError: isQuizError,
    refetch: refetchQuiz,
  } = useGetTeacherQuizDetailQuery(
    { classId, quizId },
    { skip: !classId || !quizId }
  )
  const quizDetail = getQuizObjectFromResponse(detailResponse)

  // Fetch Students / Submissions from API
  const {
    data: studentsResponse,
    isLoading: isStudentsLoading,
    isFetching: isStudentsFetching,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useGetTeacherQuizStudentsQuery(
    {
      classId,
      quizId,
      search: submissionSearch,
      page: submissionPage,
      pageSize: SUBMISSIONS_PAGE_SIZE,
    },
    { skip: !classId || !quizId || activeTab !== "submissions" }
  )

  // Fetch Stats from API
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    isError: isStatsError,
    refetch: refetchStats,
  } = useGetTeacherQuizStatsQuery(
    { classId, quizId },
    { skip: !classId || !quizId || activeTab !== "stats" }
  )

  // Export Report Mutation
  const [exportQuizReport, { isLoading: isExporting }] = useExportTeacherQuizReportMutation()

  // Mutations
  const [publishQuiz, { isLoading: isPublishing }] = usePublishTeacherQuizMutation()
  const [closeQuiz, { isLoading: isClosing }] = useCloseTeacherQuizMutation()
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteTeacherQuizMutation()

  if (isQuizLoading) {
    return (
      <div
        role="status"
        aria-label={qg.loadingQuizDetails}
        className="flex justify-center items-center min-h-[450px]"
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (isQuizError || !quizDetail) {
    return (
      <div className="mx-auto flex min-h-[400px] max-w-md flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-semibold text-gray-700">
          {qg.loadQuizDetailsError}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
          >
            {qg.goBack}
          </button>
          <button
            type="button"
            onClick={refetchQuiz}
            className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
          >
            {qg.retry}
          </button>
        </div>
      </div>
    )
  }

  if (activeSubmission) {
    return (
      <TeacherStudentGradeView
        submission={activeSubmission}
        quizDetail={quizDetail}
        classId={classId}
        quizId={quizId}
        onClose={() => {
          setSelectedStudentSubmission(null)
          if (routeStudentId) {
            navigate(`/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quizId)}`)
          }
        }}
      />
    )
  }

  const questions = Array.isArray(quizDetail.questions) ? quizDetail.questions : []
  const totalQuestions = questions.length
  const timeLimit = quizDetail.timeLimitMinutes
  const maxAttempts = quizDetail.maxAttempts

  // Extract student submission list and pagination from supported API envelopes.
  const studentsPageData = getStudentsPageFromResponse(studentsResponse, submissionPage)
  const studentsList = studentsPageData.students

  // Accept the documented object/envelope shapes and reject malformed payloads.
  const rawStatsData = (
    isRecord(statsResponse)
    && Object.prototype.hasOwnProperty.call(statsResponse, "data")
  )
    ? statsResponse.data
    : statsResponse
  const statsData = isRecord(rawStatsData) ? rawStatsData : null

  const distributionList = Array.isArray(statsData?.distribution)
    ? statsData.distribution
    : []

  const topMissedList = Array.isArray(statsData?.topMissedQuestions)
    ? statsData.topMissedQuestions
    : []

  const isQuizMutating = isPublishing || isClosing || isDeleting

  const handlePublish = async () => {
    try {
      await publishQuiz({ classId, quizId }).unwrap()
      toast.success(qg.publishSuccess)
      refetchQuiz()
    } catch {
      toast.error(qg.publishError)
    }
  }

  const handleClose = async () => {
    try {
      await closeQuiz({ classId, quizId }).unwrap()
      toast.success(qg.closeSuccess)
      refetchQuiz()
    } catch {
      toast.error(qg.closeError)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(qg.deleteConfirm)) {
      try {
        await deleteQuiz({ classId, quizId }).unwrap()
        toast.success(qg.deleteSuccess)
        if (onBack) onBack()
        else navigate(`/workspace/courses/class/${classId}`)
      } catch {
        toast.error(qg.deleteError)
      }
    }
  }

  const handleExportReport = async () => {
    try {
      const blob = await exportQuizReport({ classId, quizId }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = interpolate(qg.reportFileName, { quizId })
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success(qg.exportSuccess)
    } catch {
      toast.error(qg.exportError)
    }
  }

  return (
    <div className="w-full mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        className="mb-4"
        items={[
          { label: qg.home, onClick: () => navigate("/workspace") },
          { label: qg.myCourses, onClick: () => navigate("/workspace/courses") },
          { label: qg.allCourses, onClick: () => navigate("/workspace/courses/all") },
          {
            label: qg.courseDetails,
            onClick: () => {
              if (quizDetail?.courseId) {
                navigate(`/workspace/courses/details/${encodeURIComponent(String(quizDetail.courseId))}`)
              } else {
                navigate("/workspace/courses")
              }
            },
          },
          {
            label: qg.classDetails,
            onClick: onBack || (() => navigate(`/workspace/courses/class/${classId}`)),
          },
          { label: quizDetail.name || quizDetail.title || qg.quizDetails },
        ]}
      />

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {quizDetail.name || quizDetail.title || qg.quizDetails}
            </h1>
            <StatusBadge status={quizDetail.status} />
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Edit Button */}
            <button
              type="button"
              onClick={onEdit}
              className="border border-[#990011]/30 hover:border-[#990011] text-[#990011] bg-white hover:bg-red-50/50 px-4 py-2 rounded-full flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all active:scale-98"
            >
              <Pencil className="w-3.5 h-3.5 text-[#990011]" />
              <span>{qg.edit}</span>
            </button>

            {/* Ellipsis Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-9 h-9 rounded-full border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
                aria-label={qg.moreOptions}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 text-xs font-medium">
                  {quizDetail.status === "Draft" && (
                    <button
                      type="button"
                      disabled={isQuizMutating}
                      onClick={() => {
                        setIsMenuOpen(false)
                        handlePublish()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-emerald-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{qg.publishQuiz}</span>
                    </button>
                  )}
                  {quizDetail.status !== "Closed" && (
                    <button
                      type="button"
                      disabled={isQuizMutating}
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleClose()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-amber-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{qg.closeQuiz}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isQuizMutating}
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleDelete()
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{qg.deleteQuiz}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Số câu hỏi */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{qg.questionCountLabel}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {interpolate(qg.questionCountValue, { count: totalQuestions })}
              </p>
            </div>
          </div>

          {/* Card 2: Thời gian */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{qg.durationLabel}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {timeLimit !== null && timeLimit !== undefined
                  ? interpolate(qg.minutes, { count: timeLimit })
                  : qg.noTimeLimit}
              </p>
            </div>
          </div>

          {/* Card 3: Thời hạn */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{qg.deadlineLabel}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {formatDateRange(quizDetail.openTime, quizDetail.closeTime, qg, formatDate)}
              </p>
            </div>
          </div>

          {/* Card 4: Số lần nộp */}
          <div className="bg-gray-50/60 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#990011] flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{qg.attemptCountLabel}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {maxAttempts ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6 flex gap-8">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "overview"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {qg.overview}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "submissions"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {qg.submissions}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "stats"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {qg.statistics}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className={`pb-3 px-1 text-sm transition-colors cursor-pointer font-bold ${activeTab === "edit"
            ? "border-b-2 border-[#990011] text-[#990011]"
            : "text-gray-500 hover:text-gray-700"
            }`}
        >
          {qg.edit}
        </button>
      </div>

      {/* TAB CONTENT: Overview (Tổng quan) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Mô tả Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">{qg.description}</h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                {quizDetail.description ? (
                  <RenderHTML html={quizDetail.description} />
                ) : (
                  <span className="text-gray-400">{qg.noDescription}</span>
                )}
              </div>
            </div>

            {/* Danh sách câu hỏi Section */}
            <div>
              {/* Header line */}
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-base font-bold text-gray-900">
                  {interpolate(qg.questionsListWithCount, { count: totalQuestions })}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>{isQuestionsCollapsed ? qg.expand : qg.collapse}</span>
                  {isQuestionsCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Questions Container */}
              {!isQuestionsCollapsed && (
                <div>
                  {questions.length > 0 ? (
                    questions.slice(0, visibleQuestionsCount).map((q, idx) => (
                      <QuestionDetailCard key={q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm font-medium text-gray-400">
                      {qg.quizHasNoQuestions}
                    </div>
                  )}

                  {/* Expand / View More questions button */}
                  {totalQuestions > visibleQuestionsCount ? (
                    <div className="text-center pt-2 pb-4">
                      <button
                        type="button"
                        onClick={() => setVisibleQuestionsCount(totalQuestions)}
                        className="text-xs font-bold text-[#990011] inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>
                          {interpolate(qg.viewMoreQuestions, {
                            count: totalQuestions - visibleQuestionsCount,
                          })}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : totalQuestions > 1 ? (
                    <div className="text-center pt-2 pb-4">
                      <button
                        type="button"
                        onClick={() => setVisibleQuestionsCount(1)}
                        className="text-xs font-bold text-gray-500 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>{qg.collapseQuestionList}</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                {qg.quizConfiguration}
              </h3>

              <div className="divide-y divide-gray-100 text-xs">
                {/* Xáo trộn câu hỏi */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">{qg.shuffleQuestions}</span>
                  <span
                    className={
                      quizDetail.shuffleQuestions
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.shuffleQuestions ? qg.yes : qg.no}
                  </span>
                </div>

                {/* Xáo trộn đáp án */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">{qg.shuffleAnswers}</span>
                  <span
                    className={
                      quizDetail.shuffleOptions
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.shuffleOptions ? qg.yes : qg.no}
                  </span>
                </div>

                {/* Hiển thị đáp án sau khi nộp */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">
                    {qg.showAnswersAfterSubmission}
                  </span>
                  <span
                    className={
                      quizDetail.showAnswersAfterSubmission
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.showAnswersAfterSubmission ? qg.yes : qg.no}
                  </span>
                </div>

                {/* Cho phép nộp muộn */}
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600 font-medium">{qg.allowLateSubmission}</span>
                  <span
                    className={
                      quizDetail.allowLateSubmission
                        ? "text-[#990011] font-bold"
                        : "text-gray-900 font-bold"
                    }
                  >
                    {quizDetail.allowLateSubmission ? qg.yes : qg.no}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Submissions (Danh sách nộp bài) */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          {/* Header & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-base font-bold text-gray-900">
              {qg.submissions}
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => {
                  setSubmissionSearch(e.target.value)
                  setSubmissionPage(1)
                }}
                placeholder={qg.searchStudentsPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#990011]"
              />
            </div>
          </div>

          {isStudentsLoading || isStudentsFetching ? (
            <div role="status" aria-label={qg.loadingSubmissions} className="py-12 text-center">
              <LoadingSpinner />
            </div>
          ) : isStudentsError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-xs font-semibold text-gray-600">
                {qg.loadSubmissionsError}
              </p>
              <button
                type="button"
                onClick={refetchStudents}
                className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white"
              >
                {qg.retry}
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] text-gray-700 font-semibold border-b border-gray-200">
                      <th className="py-4 px-5 border-r border-gray-200">
                        <div className="flex items-center justify-between gap-2">
                          <span>{qg.studentInformation}</span>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                        </div>
                      </th>
                      <th className="py-4 px-5 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <span>{qg.submissionStatus}</span>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                        </div>
                      </th>
                      <th className="py-4 px-5 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <span>{qg.gradingStatus}</span>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                        </div>
                      </th>
                      <th className="py-4 px-5 border-r border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <span>{qg.score}</span>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#990011] stroke-[2.5]" />
                        </div>
                      </th>
                      <th className="py-4 px-5 text-center">
                        <span>{qg.actions}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {studentsList.length > 0 ? (
                      studentsList.map((st, idx) => {
                        const subStatus = getSubmissionStatus(st, qg)
                        const gradStatus = getGradingStatus(st, qg)
                        const studentNumber = ((submissionPage - 1) * SUBMISSIONS_PAGE_SIZE) + idx + 1
                        const studentName = st.studentName || st.name || interpolate(qg.studentNumber, { number: studentNumber })
                        const initials = getStudentInitials(studentName, qg.studentInitials)
                        const timeAgo = formatTimeAgo(st.updatedAt || st.submittedAt, qg)
                        const targetStudentId = st.studentId ?? st.id
                        const displayScore =
                          st.score !== null && st.score !== undefined && st.score !== ""
                            ? st.score
                            : "–"

                        return (
                          <tr
                            key={st.studentId || st.id || idx}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            {/* Col 1: Student info */}
                            <td className="py-4 px-5 border-r border-gray-200">
                              <div className="flex items-center gap-3">
                                {st.avatar ? (
                                  <img
                                    src={st.avatar}
                                    alt={studentName}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 font-bold text-sm flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                )}
                                <div>
                                  <h5 className="font-bold text-gray-900 text-sm">
                                    {studentName}
                                  </h5>
                                  <div className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{interpolate(qg.lastUpdateAt, { time: timeAgo })}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Col 2: Submission status */}
                            <td className="py-4 px-5 border-r border-gray-200 text-center">
                              <span
                                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${subStatus.style}`}
                              >
                                {subStatus.label}
                              </span>
                            </td>

                            {/* Col 3: Grading status */}
                            <td className="py-4 px-5 border-r border-gray-200 text-center">
                              <span
                                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${gradStatus.style}`}
                              >
                                {gradStatus.label}
                              </span>
                            </td>

                            {/* Col 4: Score */}
                            <td className="py-4 px-5 border-r border-gray-200 text-center text-sm font-semibold text-gray-800">
                              {displayScore}
                            </td>

                            {/* Col 5: Action */}
                            <td className="py-4 px-5 text-center">
                              <button
                                type="button"
                                disabled={targetStudentId === null || targetStudentId === undefined}
                                onClick={() => {
                                  setSelectedStudentSubmission(st)
                                  navigate(`/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quizId)}/submission/${encodeURIComponent(targetStudentId)}`)
                                }}
                                className="w-8 h-8 rounded-full text-[#990011] hover:bg-red-50 inline-flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                title={qg.viewAttempt}
                              >
                                <Eye className="w-4.5 h-4.5 text-[#990011]" />
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-gray-400 text-xs font-medium"
                        >
                          {submissionSearch
                            ? qg.noMatchingStudents
                            : qg.noStudentSubmissions}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {(submissionPage > 1 || studentsPageData.hasNextPage || (studentsPageData.totalPages ?? 0) > 1) && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-gray-500">
                    {interpolate(qg.pageLabel, { page: studentsPageData.page })}
                    {studentsPageData.totalPages
                      ? interpolate(qg.totalPagesSuffix, { totalPages: studentsPageData.totalPages })
                      : ""}
                    {studentsPageData.totalItems !== null
                      ? interpolate(qg.studentsTotalSuffix, { count: studentsPageData.totalItems })
                      : ""}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={submissionPage <= 1}
                      onClick={() => setSubmissionPage((page) => Math.max(1, page - 1))}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {qg.previousPage}
                    </button>
                    <button
                      type="button"
                      disabled={!studentsPageData.hasNextPage}
                      onClick={() => setSubmissionPage((page) => page + 1)}
                      className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white hover:bg-[#80000e] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {qg.nextPage}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: Stats (Thống kê) */}
      {activeTab === "stats" && (
        (isStatsLoading || (isStatsFetching && statsResponse === undefined)) ? (
          <div
            role="status"
            className="flex min-h-[320px] items-center justify-center rounded-3xl border border-gray-100 bg-white"
          >
            <LoadingSpinner />
            <span className="sr-only">{qg.loadingStatistics}</span>
          </div>
        ) : isStatsError ? (
          <div
            role="alert"
            className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-3xl border border-red-100 bg-white p-8 text-center"
          >
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-semibold text-gray-600">
              {qg.loadStatisticsError}
            </p>
            <button
              type="button"
              onClick={refetchStats}
              className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white hover:bg-[#80000e]"
            >
              {qg.retry}
            </button>
          </div>
        ) : !statsData ? (
          <div
            role="status"
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white p-8 text-center"
          >
            <BarChart2 className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">
              {qg.statisticsUnavailable}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {isStatsFetching && (
              <span role="status" className="sr-only">
                {qg.updatingStatistics}
              </span>
            )}
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Title & Export Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {interpolate(qg.statisticsTitle, {
                    quizTitle: quizDetail.name || quizDetail.title || qg.quiz,
                  })}
                </h2>
                <button
                  type="button"
                  onClick={handleExportReport}
                  disabled={isExporting}
                  className="bg-[#990011] hover:bg-[#80000e] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>{isExporting ? qg.exporting : qg.exportReport}</span>
                </button>
              </div>

              {/* 4 Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1: Điểm TB */}
                <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center font-bold text-sm text-[#990011] shrink-0">
                    Σ
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{qg.averageScore}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {formatStatistic(statsData.averageScore)}
                    </p>
                  </div>
                </div>

                {/* Card 2: Tỷ lệ hoàn thành */}
                <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#990011] shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#990011]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{qg.completionRate}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {formatStatistic(statsData.completionRate, "%")}
                    </p>
                  </div>
                </div>

                {/* Card 3: Điểm cao nhất */}
                <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#990011] shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#990011]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{qg.highestScore}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {formatStatistic(statsData.highestScore)}
                    </p>
                  </div>
                </div>

                {/* Card 4: Điểm thấp nhất */}
                <div className="bg-gray-50/70 rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                    <TrendingDown className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{qg.lowestScore}</p>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {formatStatistic(statsData.lowestScore)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Left (Score Distribution) + Right (Top Missed Questions) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Phân bố điểm số */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <h3 className="text-base font-bold text-gray-900 mb-4">
                  {qg.scoreDistribution}
                </h3>

                {/* Recharts Bar Chart */}
                {distributionList.length > 0 ? (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={distributionList}
                        margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="quizBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#990011" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#d44856" stopOpacity={0.65} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                          dataKey="range"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#374151", fontSize: 12, fontWeight: 700 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9ca3af", fontSize: 11 }}
                          domain={[0, (dataMax) => Math.max(20, dataMax)]}
                          ticks={[0, 5, 10, 15, 20]}
                        />
                        <RechartsTooltip content={<CustomChartTooltip />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                        <Bar
                          dataKey="count"
                          fill="url(#quizBarGradient)"
                          radius={[8, 8, 0, 0]}
                          barSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-xs font-semibold text-gray-400">
                    {qg.noScoreDistributionData}
                  </div>
                )}
              </div>

              {/* Right Column: Câu hỏi sai nhiều nhất */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
                <h3 className="text-base font-bold text-gray-900 mb-6">
                  {qg.mostMissedQuestions}
                </h3>

                {topMissedList.length > 0 ? (
                  <div className="divide-y divide-gray-100 space-y-3">
                    {topMissedList.map((q, idx) => (
                      <div key={idx} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-900">
                            {interpolate(qg.questionShort, { number: q.questionNumber })}
                          </h4>
                          <span className="text-xs font-bold text-[#990011]">
                            {interpolate(qg.percentCorrect, { percent: q.correctPercent })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium line-clamp-1 mt-1">
                          {q.questionSnippet}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-8">
                    {qg.noFrequentlyMissedQuestions}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export default TeacherQuizDetailView
