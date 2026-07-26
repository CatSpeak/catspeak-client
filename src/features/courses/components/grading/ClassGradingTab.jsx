import React, { useEffect, useMemo, useRef, useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import StudentAssignmentDetailView from "../assignments/StudentAssignmentDetailView"
import AssignmentSubmissionsView from "../assignments/submissions/AssignmentSubmissionsView"
import TablePagination from "../shared/TablePagination"
import {
  Search,
  ChevronDown,
  Clock,
  EyeOff,
  Eye,
  FileText,
  Timer,
  RotateCcw,
} from "lucide-react"
import { toast } from "react-hot-toast"
import {
  useGetTeacherAssignmentsQuery,
  useGetStudentAssignmentsQuery,
  useGetMyAssignmentSubmissionQuery,
  useGetTeacherQuizzesQuery,
  useGetStudentQuizzesQuery,
  usePublishTeacherQuizMutation,
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import {
  getAssignmentCount,
  getAssignmentStatus,
  getAssignmentTimeline,
  getAssignmentTitle,
  getSubmissionStatus,
} from "../../utils/assignmentUtils"
import {
  getQuizErrorMessage,
  getQuizListFromResponse,
} from "../../utils/quizUtils"

const STUDENT_PAGE_SIZE = 10

const getArrayFromResponse = (response) => {
  const data = response?.data ?? response
  return Array.isArray(data) ? data : null
}

const isRecord = (value) => (
  value !== null && typeof value === "object" && !Array.isArray(value)
)

const getDisplayableItems = (items) => {
  if (!Array.isArray(items)) return []

  const seenIds = new Set()
  return items.filter((item) => {
    if (!item || typeof item !== "object" || item.id === undefined || item.id === null) {
      return false
    }

    const id = String(item.id)
    if (seenIds.has(id)) return false
    seenIds.add(id)
    return true
  })
}

const formatDateTime = (value, language, options) => {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  const locale = language === "vi"
    ? "vi-VN"
    : (language === "zh" ? "zh-CN" : "en-US")
  return date.toLocaleString(locale, options)
}

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

// ─── Student Assignment Row ──────────────────────────────────────────
const StudentAssignmentRow = ({ assignment, classId, cd, cg, language, onSelect }) => {
  const hasEmbeddedSubmission = Object.prototype.hasOwnProperty.call(assignment, "mySubmission")
    || Object.prototype.hasOwnProperty.call(assignment, "submission")
  const embeddedSubmission = assignment.mySubmission ?? assignment.submission ?? null
  const {
    currentData: submissionResponse,
    isLoading,
  } = useGetMyAssignmentSubmissionQuery(
    { classId, assignmentId: assignment.id },
    { skip: !classId || !assignment?.id || hasEmbeddedSubmission },
  )

  const responsePayload = (
    isRecord(submissionResponse)
    && Object.prototype.hasOwnProperty.call(submissionResponse, "data")
  )
    ? submissionResponse.data
    : submissionResponse
  const submission = hasEmbeddedSubmission
    ? embeddedSubmission
    : (isRecord(responsePayload) ? responsePayload : null)

  const submissionStatus = getSubmissionStatus(submission)
  const parsedMaxScore = Number(assignment.maxScore)
  const maxScore = (
    assignment.maxScore !== null
    && assignment.maxScore !== undefined
    && assignment.maxScore !== ""
    && Number.isFinite(parsedMaxScore)
    && parsedMaxScore >= 0
  )
    ? parsedMaxScore
    : null

  const isReleased = submission?.status?.toLowerCase() === "returned"
  const grade = isReleased ? submission?.grade : null
  const gradeLabel = grade !== null && grade !== undefined
    ? (maxScore === null ? String(grade) : `${grade} / ${maxScore}`)
    : "—"

  const dueLabel = formatDateTime(assignment.dueDate, language)

  const submittedAtMs = getTimestamp(submission?.submittedAt)
  const dueAtMs = getTimestamp(assignment?.dueDate)
  const isSubmissionLate = submittedAtMs > 0 && dueAtMs > 0
    ? submittedAtMs > dueAtMs
    : false

  const displayStatus = submissionStatus === "graded"
    ? (isSubmissionLate ? "late" : "submitted")
    : submissionStatus

  return (
    <tr
      onClick={() => onSelect(assignment.id)}
      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
    >
      <td className="p-4 pl-6 font-extrabold text-gray-850 flex items-center gap-2">
        <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide shrink-0">
          BÀI TẬP
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(assignment.id)
          }}
          className="truncate max-w-xs text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] rounded"
        >
          {getAssignmentTitle(assignment)}
        </button>
      </td>
      <td className="p-4 text-gray-400">{dueLabel}</td>
      <td className="p-4">
        {isLoading && !hasEmbeddedSubmission ? (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {cg.loading || "Loading"}
          </span>
        ) : (
          <>
            {displayStatus === "not_submitted" && (
              <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
                {cd.statusNotSubmitted || "Chưa nộp"}
              </span>
            )}
            {(displayStatus === "submitted" || displayStatus === "late") && (
              <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">
                {displayStatus === "late"
                  ? (cg.filterLate || "Nộp muộn")
                  : (cd.statusNeedsGrading || "Chưa chấm")}
              </span>
            )}
            {displayStatus === "returned" && (
              <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                {cg.filterReturned || cd.statusGraded || "Đã trả bài"}
              </span>
            )}
          </>
        )}
      </td>
      <td className="p-4 pr-6 text-center font-black text-sm text-gray-900">
        {isLoading && !hasEmbeddedSubmission ? "—" : gradeLabel}
      </td>
    </tr>
  )
}

// ─── Student Quiz Row ────────────────────────────────────────────────
const StudentQuizRow = ({ quiz, language, onSelect }) => {
  const closeTimeFormatted = formatDateTime(quiz.closeTime, language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const recordStatus = typeof quiz.recordStatus === "string"
    ? quiz.recordStatus.trim().toLowerCase()
    : quiz.recordStatus
  const hasKnownRecordStatus = (
    recordStatus === null
    || recordStatus === undefined
    || recordStatus === "inprogress"
    || recordStatus === "submitted"
  )
  const hasTimeLimit = (
    quiz.timeLimitMinutes !== null
    && quiz.timeLimitMinutes !== undefined
    && quiz.timeLimitMinutes !== ""
    && Number.isFinite(Number(quiz.timeLimitMinutes))
    && Number(quiz.timeLimitMinutes) >= 0
  )

  return (
    <tr
      onClick={() => onSelect && onSelect(quiz.id)}
      className="hover:bg-red-50/20 transition-colors cursor-pointer"
    >
      <td className="p-4 pl-6 font-extrabold text-gray-850 flex items-center gap-2">
        <span className="bg-red-50 text-[#990011] border border-red-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide shrink-0 flex items-center gap-1">
          <Timer size={10} />
          QUIZ
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect?.(quiz.id)
          }}
          className="truncate max-w-xs text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] rounded"
        >
          {quiz.name || quiz.title || (language === "vi" ? "Bài kiểm tra" : "Quiz")}
        </button>
      </td>
      <td className="p-4 text-gray-400 font-semibold">{closeTimeFormatted}</td>
      <td className="p-4 flex items-center gap-2">
        {recordStatus === "submitted" ? (
          <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
            Đã nộp
          </span>
        ) : recordStatus === "inprogress" ? (
          <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">
            Đang làm
          </span>
        ) : hasKnownRecordStatus ? (
          <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
            Chưa làm
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-gray-200 uppercase tracking-wide">
            {language === "vi" ? "Không xác định" : "Unavailable"}
          </span>
        )}
        {recordStatus === "submitted" && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(quiz.id, "result")
            }}
            className="ml-auto px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Eye size={11} />
            <span>{language === "vi" ? "Xem kết quả" : "See Result"}</span>
          </button>
        )}
        {recordStatus === "inprogress" && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(quiz.id)
            }}
            className="ml-auto px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-extrabold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw size={11} />
            <span>{language === "vi" ? "Làm tiếp" : "Continue"}</span>
          </button>
        )}
      </td>
      <td className="p-4 pr-6 text-center font-black text-xs text-gray-900">
        {hasTimeLimit
          ? `${quiz.timeLimitMinutes} ${language === "vi" ? "phút" : "mins"}`
          : "—"}
      </td>
    </tr>
  )
}

// ─── Teacher Quiz Card ───────────────────────────────────────────────
const QuizCard = ({ quiz, classId, cg, language, navigate }) => {
  const [publishTeacherQuiz, { isLoading: isPublishing }] = usePublishTeacherQuizMutation()
  const publishGuardRef = useRef(false)

  const statusStr = String(quiz.status || "").toLowerCase()
  const isDraft = statusStr === "draft"
  const isOpen = statusStr === "open"
  const isUpcoming = statusStr === "upcoming"
  const isClosed = statusStr === "closed"

  const closeTimeFormatted = formatDateTime(quiz.closeTime, language, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const embeddedQuestionCount = Array.isArray(quiz.questions)
    ? quiz.questions.length
    : undefined
  const parsedQuestionCount = Number(quiz.questionCount)
  const questionCount = embeddedQuestionCount
    ?? (Number.isFinite(parsedQuestionCount) ? parsedQuestionCount : null)

  const handlePublishDirectly = async (e) => {
    e.stopPropagation()
    if (publishGuardRef.current) return

    publishGuardRef.current = true
    try {
      await publishTeacherQuiz({ classId, quizId: quiz.id }).unwrap()
      toast.success(language === "vi" ? "Đã xuất bản bài kiểm tra!" : "Quiz published!")
    } catch (err) {
      toast.error(getQuizErrorMessage(
        err,
        language,
        language === "vi"
          ? "Không thể đăng bài kiểm tra. Vui lòng kiểm tra nội dung và thử lại."
          : "Could not publish the quiz. Check its content and try again.",
      ))
    } finally {
      publishGuardRef.current = false
    }
  }

  return (
    <div
      key={`quiz-${quiz.id}`}
      className="bg-white border border-gray-250 rounded-2xl shadow-xs p-5 flex flex-col justify-between h-[270px] hover:shadow-md transition-all relative border-t-4"
      style={{
        borderTopColor:
          isClosed ? "#D1D5DB" :
            isDraft ? "#9CA3AF" :
              isUpcoming ? "#F59E0B" : "#990011"
      }}
    >
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5 flex-wrap items-center">
            {/* Quiz Type Badge */}
            <span className="bg-red-50 text-[#990011] border border-red-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
              <Timer size={10} />
              {language === "vi" ? "BÀI KIỂM TRA" : "QUIZ"}
            </span>

            {/* Status Badge */}
            {isDraft && (
              <span className="bg-gray-100 text-gray-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeDraft || "NHÁP"}
              </span>
            )}
            {isOpen && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {language === "vi" ? "ĐANG MỞ" : "OPEN"}
              </span>
            )}
            {isUpcoming && (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeUpcoming || "SẮP MỞ"}
              </span>
            )}
            {isClosed && (
              <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeClosed || "ĐÃ ĐÓNG"}
              </span>
            )}
          </div>

          {/* Quick View Details Icon Button */}
          <button
            type="button"
            onClick={() => navigate(
              `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quiz.id)}`
            )}
            className="p-1 text-gray-400 hover:text-[#990011] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title={language === "vi" ? "Xem chi tiết bài kiểm tra" : "View Quiz Details"}
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Title (Clickable to Quiz Detail) */}
        <h4
          onClick={() => navigate(
            `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quiz.id)}`
          )}
          className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-[#990011] hover:underline cursor-pointer transition-colors"
          title={language === "vi" ? "Xem chi tiết bài kiểm tra" : "View Quiz Details"}
        >
          {quiz.name || quiz.title || (language === "vi" ? "Bài kiểm tra chưa đặt tên" : "Untitled quiz")}
        </h4>

        {/* Subtitle / Timeline info */}
        <div className="flex flex-col gap-1 text-xs text-gray-400 font-semibold mb-3">
          <div className="flex items-center gap-1.5 leading-none">
            <Clock size={12} className="text-gray-400 shrink-0" />
            <span className="truncate">
              {language === "vi" ? `Hạn đóng: ${closeTimeFormatted}` : `Closes: ${closeTimeFormatted}`}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold mt-1">
            <span className="inline-flex items-center gap-1">
              <Timer size={13} className="text-gray-400 shrink-0" />
              {Number.isFinite(Number(quiz.timeLimitMinutes))
                ? `${quiz.timeLimitMinutes} ${language === "vi" ? "phút" : "mins"}`
                : "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText size={13} className="text-gray-400 shrink-0" />
              {questionCount ?? "—"} {language === "vi" ? "câu hỏi" : "questions"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Settings & Actions */}
      <div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex justify-between items-center mb-3 text-[10px] font-extrabold text-gray-600">
          <span>
            Thang điểm: {
              quiz.gradingScale === "Hundred"
                ? 100
                : (quiz.gradingScale === "Ten" ? 10 : "—")
            }
          </span>
          <span>
            {
              quiz.autoGradingEnabled === true
                ? "Tự động chấm"
                : (
                  quiz.autoGradingEnabled === false
                    ? "Chấm thủ công"
                    : "—"
                )
            }
          </span>
        </div>

        {isDraft ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(
                `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quiz.id)}/edit`
              )}
              className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold text-[10px] rounded-xl text-center transition-all active:scale-99 uppercase tracking-wider cursor-pointer"
            >
              {cg.btnContinueEditing || "Chỉnh sửa"}
            </button>
            <button
              type="button"
              onClick={handlePublishDirectly}
              disabled={isPublishing}
              aria-busy={isPublishing}
              className="flex-1 py-2 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-[10px] rounded-xl text-center transition-all active:scale-99 uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? "Đang đăng..." : "Đăng bài"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(
              `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(quiz.id)}`
            )}
            className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-655 font-extrabold text-[11px] rounded-xl text-center transition-colors active:scale-99 uppercase tracking-wider cursor-pointer"
          >
            {language === "vi" ? "Xem chi tiết bài kiểm tra" : "View Quiz Details"}
          </button>
        )}
      </div>
    </div>
  )
}

const ClassGradingTab = ({ id: classId, isStudent }) => {
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const cg = c.grading || {}
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")
  const quizId = searchParams.get("quizId")

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [contentType, setContentType] = useState("all") // "all" | "assignments" | "quizzes"
  const [studentPage, setStudentPage] = useState(1)
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const timerId = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timerId)
  }, [])

  // Fetch Assignments
  const teacherAssignmentsQuery = useGetTeacherAssignmentsQuery(
    { classId },
    { skip: isStudent || !classId || Boolean(assignmentId) || Boolean(quizId) },
  )

  const studentAssignmentsQuery = useGetStudentAssignmentsQuery(
    { classId },
    { skip: !isStudent || !classId || Boolean(assignmentId) || Boolean(quizId) },
  )

  // Fetch Quizzes
  const teacherQuizzesQuery = useGetTeacherQuizzesQuery(
    { classId },
    { skip: isStudent || !classId || Boolean(assignmentId) || Boolean(quizId) },
  )

  const studentQuizzesQuery = useGetStudentQuizzesQuery(
    { classId },
    { skip: !isStudent || !classId || Boolean(assignmentId) || Boolean(quizId) },
  )

  const assignmentsResponse = isStudent
    ? studentAssignmentsQuery.currentData
    : teacherAssignmentsQuery.currentData
  const assignmentsQuery = isStudent ? studentAssignmentsQuery : teacherAssignmentsQuery
  const isAssignmentsLoading = assignmentsQuery.isLoading || (
    assignmentsQuery.isFetching && assignmentsResponse === undefined
  )

  const quizzesResponse = isStudent
    ? studentQuizzesQuery.currentData
    : teacherQuizzesQuery.currentData
  const quizzesQuery = isStudent ? studentQuizzesQuery : teacherQuizzesQuery
  const isQuizzesLoading = quizzesQuery.isLoading || (
    quizzesQuery.isFetching && quizzesResponse === undefined
  )

  const rawAssignments = useMemo(
    () => getArrayFromResponse(assignmentsResponse),
    [assignmentsResponse],
  )
  const rawQuizzes = useMemo(
    () => getQuizListFromResponse(quizzesResponse),
    [quizzesResponse],
  )

  const assignments = useMemo(() => {
    return getDisplayableItems(rawAssignments)
  }, [rawAssignments])

  const quizzes = useMemo(() => {
    return getDisplayableItems(rawQuizzes)
  }, [rawQuizzes])

  const hasMalformedAssignments = assignmentsQuery.isSuccess && !assignmentsQuery.isFetching && (
    rawAssignments === null || assignments.length !== rawAssignments.length
  )
  const hasMalformedQuizzes = quizzesQuery.isSuccess && !quizzesQuery.isFetching && (
    rawQuizzes === null || quizzes.length !== rawQuizzes.length
  )
  const hasAssignmentsError = assignmentsQuery.isError || hasMalformedAssignments
  const hasQuizzesError = quizzesQuery.isError || hasMalformedQuizzes

  const retryFailedLists = () => {
    if (hasAssignmentsError) assignmentsQuery.refetch()
    if (hasQuizzesError) quizzesQuery.refetch()
  }

  const listErrorMessage = getQuizErrorMessage(
    quizzesQuery.error,
    language,
    language === "vi"
      ? "Không thể tải đầy đủ nội dung. Bạn có thể thử lại."
      : "Some course content could not be loaded. You can try again.",
  )

  const filteredAssignments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

    return assignments
      .filter((item) => {
        const assignmentName = String(getAssignmentTitle(item, ""))
        const matchesSearch = assignmentName.toLocaleLowerCase().includes(normalizedSearch)
        const matchesStatus = statusFilter === "all"
          || getAssignmentStatus(item) === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const dateA = getTimestamp(a.createdAt)
        const dateB = getTimestamp(b.createdAt)
        return sortBy === "newest" ? dateB - dateA : dateA - dateB
      })
  }, [assignments, searchTerm, statusFilter, sortBy])

  const filteredQuizzes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

    return quizzes
      .filter((quiz) => {
        const quizName = String(quiz.name ?? quiz.title ?? "")
        const status = String(quiz.status ?? "").toLowerCase()
        const matchesSearch = quizName.toLocaleLowerCase().includes(normalizedSearch)
        const matchesStatus = statusFilter === "all"
          || (statusFilter === "published"
            ? status === "open" || status === "upcoming"
            : status === statusFilter.toLowerCase())
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const dateA = getTimestamp(a.createdAt)
        const dateB = getTimestamp(b.createdAt)
        return sortBy === "newest" ? dateB - dateA : dateA - dateB
      })
  }, [quizzes, searchTerm, statusFilter, sortBy])

  const showAssignments = contentType === "all" || contentType === "assignments"
  const showQuizzes = contentType === "all" || contentType === "quizzes"

  const studentItems = useMemo(() => {
    const items = []
    if (showAssignments) {
      filteredAssignments.forEach((assignment) => {
        items.push({ type: "assignment", value: assignment })
      })
    }
    if (showQuizzes) {
      filteredQuizzes.forEach((quiz) => {
        items.push({ type: "quiz", value: quiz })
      })
    }
    return items
  }, [
    filteredAssignments,
    filteredQuizzes,
    showAssignments,
    showQuizzes,
  ])

  const totalStudentItems = studentItems.length
  const studentTotalPages = Math.max(1, Math.ceil(totalStudentItems / STUDENT_PAGE_SIZE))
  const activeStudentPage = Math.min(studentPage, studentTotalPages)
  const visibleStudentItems = useMemo(() => {
    const start = (activeStudentPage - 1) * STUDENT_PAGE_SIZE
    return studentItems.slice(start, start + STUDENT_PAGE_SIZE)
  }, [activeStudentPage, studentItems])

  const selectContentType = (value) => {
    setContentType(value)
    setStudentPage(1)
  }

  const selectStatusOption = (value) => {
    setStatusFilter(value)
    setStudentPage(1)
  }

  const selectSortOption = (value) => {
    setSortBy(value)
    setStudentPage(1)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setStudentPage(1)
  }

  // Deep links are backed by detail endpoints; avoid fetching the full list first.
  if (assignmentId) {
    return isStudent ? (
      <StudentAssignmentDetailView
        assignmentId={assignmentId}
        classId={classId}
        onBack={() => setSearchParams({ tab: "grading" })}
      />
    ) : (
      <AssignmentSubmissionsView
        assignmentId={assignmentId}
        classId={classId}
        onBack={() => setSearchParams({ tab: "grading" })}
      />
    )
  }

  if (quizId) {
    const encodedClassId = encodeURIComponent(classId)
    const encodedQuizId = encodeURIComponent(quizId)
    const studentIdParam = searchParams.get("studentId")
    const target = isStudent
      ? `/workspace/courses/class/${encodedClassId}/quiz/${encodedQuizId}/take`
      : (studentIdParam
        ? `/workspace/courses/class/${encodedClassId}/quiz/${encodedQuizId}/submission/${encodeURIComponent(studentIdParam)}`
        : `/workspace/courses/class/${encodedClassId}/quiz/${encodedQuizId}`)
    return <Navigate to={target} replace />
  }

  const isVisibleInitialLoad = (
    (showAssignments && isAssignmentsLoading && assignmentsResponse === undefined)
    && (showQuizzes && isQuizzesLoading && quizzesResponse === undefined)
  ) || (
      showAssignments
      && !showQuizzes
      && isAssignmentsLoading
      && assignmentsResponse === undefined
    ) || (
      showQuizzes
      && !showAssignments
      && isQuizzesLoading
      && quizzesResponse === undefined
    )

  if (isVisibleInitialLoad) {
    return (
      <div
        className="flex justify-center items-center min-h-[400px]"
        role="status"
        aria-label={language === "vi" ? "Đang tải nội dung" : "Loading course content"}
      >
        <LoadingSpinner />
      </div>
    )
  }

  const isPartiallyLoading = (
    (showAssignments && isAssignmentsLoading)
    || (showQuizzes && isQuizzesLoading)
  )
  const hasVisibleListError = (
    (showAssignments && hasAssignmentsError)
    || (showQuizzes && hasQuizzesError)
  )

  // ─── Sub-View: Student personal grades view ───
  if (isStudent) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-sm font-extrabold text-gray-900">{c.student?.myGrades || "Bài tập & Điểm số"}</h3>

          {/* Content Type Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => selectContentType("all")}
              aria-pressed={contentType === "all"}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${contentType === "all" ? "bg-white text-[#990011] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {language === "vi" ? "Tất cả" : "All"}
            </button>
            <button
              type="button"
              onClick={() => selectContentType("assignments")}
              aria-pressed={contentType === "assignments"}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${contentType === "assignments" ? "bg-white text-[#990011] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {language === "vi" ? "Bài tập" : "Assignments"}
            </button>
            <button
              type="button"
              onClick={() => selectContentType("quizzes")}
              aria-pressed={contentType === "quizzes"}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${contentType === "quizzes" ? "bg-white text-[#990011] shadow-xs" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Timer size={12} />
              <span>{language === "vi" ? "Bài kiểm tra" : "Quizzes"}</span>
            </button>
          </div>
        </div>

        {hasVisibleListError && (
          <div
            role="alert"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800"
          >
            <span>{listErrorMessage}</span>
            <button
              type="button"
              onClick={retryFailedLists}
              className="self-start sm:self-auto rounded-lg border border-red-300 bg-white px-3 py-1.5 font-extrabold hover:bg-red-100"
            >
              {language === "vi" ? "Thử lại" : "Retry"}
            </button>
          </div>
        )}

        {isPartiallyLoading && (
          <p className="text-xs font-semibold text-gray-500" role="status" aria-live="polite">
            {language === "vi" ? "Đang tải thêm nội dung…" : "Loading more content…"}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-extrabold uppercase tracking-wider">
                <th className="p-4 pl-6">Nội dung</th>
                <th className="p-4">Hạn nộp / Đóng</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 pr-6 text-center">Điểm số / Giới hạn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-750">
              {totalStudentItems === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">
                    {hasVisibleListError
                      ? listErrorMessage
                      : (cg.noDataLabel || "Chưa có số liệu / Không tìm thấy mục nào.")}
                  </td>
                </tr>
              ) : (
                visibleStudentItems.map((item) => (
                  item.type === "assignment" ? (
                    <StudentAssignmentRow
                      key={`assign-${item.value.id}`}
                      assignment={item.value}
                      classId={classId}
                      cd={cd}
                      cg={cg}
                      language={language}
                      onSelect={(id) => setSearchParams({ tab: "grading", assignmentId: id })}
                    />
                  ) : (
                    <StudentQuizRow
                      key={`quiz-${item.value.id}`}
                      quiz={item.value}
                      language={language}
                      onSelect={(id, step) => navigate(
                        `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(id)}/take${step ? `?step=${step}` : ""}`
                      )}
                    />
                  )
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalStudentItems > STUDENT_PAGE_SIZE && (
          <TablePagination
            currentPage={activeStudentPage}
            totalPages={studentTotalPages}
            totalCount={totalStudentItems}
            limit={STUDENT_PAGE_SIZE}
            onPageChange={setStudentPage}
            t={t}
          />
        )}
      </div>
    )
  }

  // ─── Main View: Teacher Cards Grid ───
  const hasNoItems = (showAssignments ? filteredAssignments.length : 0) === 0 && (showQuizzes ? filteredQuizzes.length : 0) === 0

  return (
    <div className="flex flex-col gap-5">

      {/* ─── Filter & Search Bar ─── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">

        {/* Left: Content Type Tabs (All | Assignments | Quizzes) */}
        <div className="flex items-center gap-1 bg-gray-150/70 p-1 rounded-xl w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => selectContentType("all")}
            aria-pressed={contentType === "all"}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${contentType === "all" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            {language === "vi" ? "Tất cả" : "All"}
          </button>
          <button
            type="button"
            onClick={() => selectContentType("assignments")}
            aria-pressed={contentType === "assignments"}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${contentType === "assignments" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            {language === "vi" ? "Bài tập" : "Assignments"}
          </button>
          <button
            type="button"
            onClick={() => selectContentType("quizzes")}
            aria-pressed={contentType === "quizzes"}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${contentType === "quizzes" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Timer size={14} />
            <span>{language === "vi" ? "Bài kiểm tra" : "Quizzes"}</span>
          </button>
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={cg.searchPlaceholder || "Tìm kiếm bài nộp..."}
            aria-label={cg.searchPlaceholder || (language === "vi" ? "Tìm kiếm nội dung" : "Search content")}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all placeholder-gray-400"
          />
        </div>

        {/* Right: Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          {/* Status Filter */}
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => selectStatusOption(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] cursor-pointer transition-all"
            >
              <option value="all">{cg.statusFilter || "Trạng thái"}</option>
              <option value="published">{cg.badgePublished || "Đã đăng"}</option>
              <option value="draft">{cg.badgeDraft || "Nháp"}</option>
              <option value="closed">{cg.badgeClosed || "Đã đóng"}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Selection */}
          <div className="relative w-full sm:w-auto min-w-[150px]">
            <select
              value={sortBy}
              onChange={(e) => selectSortOption(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] cursor-pointer transition-all"
            >
              <option value="newest">{cg.sortNewest || "Sắp xếp: Mới nhất"}</option>
              <option value="oldest">{cg.sortOldest || "Sắp xếp: Cũ nhất"}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

      </div>

      {hasVisibleListError && (
        <div
          role="alert"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-800"
        >
          <span>{listErrorMessage}</span>
          <button
            type="button"
            onClick={retryFailedLists}
            className="self-start sm:self-auto rounded-lg border border-red-300 bg-white px-3 py-1.5 font-extrabold hover:bg-red-100"
          >
            {language === "vi" ? "Thử lại" : "Retry"}
          </button>
        </div>
      )}

      {isPartiallyLoading && (
        <p className="text-xs font-semibold text-gray-500" role="status" aria-live="polite">
          {language === "vi" ? "Đang tải thêm nội dung…" : "Loading more content…"}
        </p>
      )}

      {/* ─── Grid of Assignment & Quiz Cards ─── */}
      {hasNoItems ? (
        <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-xs text-gray-400 font-bold">
          {hasVisibleListError
            ? listErrorMessage
            : (cg.noDataLabel || "Chưa có số liệu / Không tìm thấy mục nào.")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Render Quiz Cards */}
          {showQuizzes && filteredQuizzes.map((quiz) => (
            <QuizCard
              key={`quiz-${quiz.id}`}
              quiz={quiz}
              classId={classId}
              cg={cg}
              language={language}
              navigate={navigate}
            />
          ))}

          {/* Render Assignment Cards */}
          {showAssignments && filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment)
            const isDraft = status === "draft"
            const submittedCount = getAssignmentCount(assignment, ["submittedCount", "submissionCount", "submissionsCount"])
            const enrolledCount = getAssignmentCount(assignment, ["enrolledCount", "studentCount", "totalStudents"])
            const needsGradingCount = getAssignmentCount(assignment, ["needsGradingCount", "pendingGradeCount", "ungradedCount"])
            const hasStats = (
              !isDraft
              && submittedCount !== null
              && enrolledCount !== null
            )
            const statsPercentage = hasStats && enrolledCount > 0
              ? Math.round((submittedCount / enrolledCount) * 100)
              : 0
            const notSubmittedCount = hasStats
              ? Math.max(enrolledCount - submittedCount, 0)
              : null
            const { isExpired, isUpcoming } = getAssignmentTimeline(assignment, nowMs)
            const title = getAssignmentTitle(assignment)
            const dueDate = formatDateTime(assignment.dueDate, language)

            return (
              <div
                key={`assign-${assignment.id}`}
                className="bg-white border border-gray-250 rounded-2xl shadow-xs p-5 flex flex-col justify-between h-[270px] hover:shadow-md transition-all relative border-t-4 border-t-gray-300"
                style={{
                  borderTopColor:
                    status === "closed" ? "#D1D5DB" :
                      status === "draft" ? "#E5E7EB" : "#F59E0B"
                }}
              >

                {/* Card Header & Body Info */}
                <div>
                  <div className="flex items-center mb-3">
                    <div className="flex gap-1.5 items-center flex-wrap">
                      {/* Assignment Type Badge */}
                      <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                        BÀI TẬP
                      </span>

                      {/* Badge status */}
                      {status === "published" && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgePublished || "ĐÃ ĐĂNG"}
                        </span>
                      )}
                      {status === "draft" && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeDraft || "NHÁP"}
                        </span>
                      )}
                      {status === "closed" && (
                        <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeClosed || "ĐÃ ĐÓNG"}
                        </span>
                      )}

                      {/* Badge timeline */}
                      {isUpcoming && (
                        <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeUpcoming || "SẮP ĐẾN HẠN"}
                        </span>
                      )}
                      {isExpired && (
                        <span className="bg-red-50 border border-red-100 text-red-655 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeExpired || "HẾT HẠN"}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2">
                    {title}
                  </h4>

                  {/* Subtitle / Deadline info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-4 leading-none">
                    {!isDraft ? (
                      <>
                        <Clock size={12} className={isExpired ? "text-red-500" : "text-gray-400"} />
                        <span className={isExpired ? "text-red-500" : ""}>
                          {cg.dueDateLabel || "Hạn nộp: "}{dueDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        <span>{cg.notPublishedLabel || "Chưa đăng tải cho học viên"}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress / Status Block */}
                <div>
                  {hasStats ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1.5 mb-4 shadow-2xs">
                      {/* Bar metrics */}
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-extrabold leading-none">
                        <span>
                          {cg.submittedLabel || "Đã nộp: "}{submittedCount}/{enrolledCount}
                        </span>
                        <span>{statsPercentage}%</span>
                      </div>

                      {/* Bar itself */}
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${statsPercentage}%`,
                            backgroundColor: isExpired ? "#990011" : "#D97706"
                          }}
                        />
                      </div>

                      {/* Needs grading/unsubmitted metrics */}
                      <div className="flex justify-between items-center text-[9px] font-bold mt-0.5 leading-none">
                        {needsGradingCount !== null && needsGradingCount > 0 ? (
                          <span className="text-[#990011] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#990011] rounded-full inline-block" />
                            {cg.needsGradingLabel || "Cần chấm: "}{needsGradingCount}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-red-700">
                          {cg.notSubmittedLabel || "Chưa nộp: "}{notSubmittedCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Draft or unavailable-statistics placeholder block */
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 mb-4 h-[64px]">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-bold leading-none">
                        {isDraft
                          ? (cg.noDataLabel || "Chưa có số liệu")
                          : (cg.statsUnavailableLabel || "Số liệu chưa khả dụng")}
                      </span>
                    </div>
                  )}

                  {/* Actions buttons */}
                  {isDraft ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/workspace/courses/class/${classId}/assignment/${assignment.id}`)}
                      className="w-full py-2 border border-[#990011] hover:bg-red-50/50 text-[#990011] font-extrabold text-[11px] rounded-xl text-center transition-all active:scale-99 uppercase tracking-wider"
                    >
                      {cg.btnContinueEditing || "Tiếp tục chỉnh sửa"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "grading", assignmentId: assignment.id })}
                      className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-650 font-extrabold text-[11px] rounded-xl text-center transition-colors active:scale-99 uppercase tracking-wider"
                    >
                      {cg.btnViewSubmissions || "Xem bài nộp"}
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}

export default ClassGradingTab
