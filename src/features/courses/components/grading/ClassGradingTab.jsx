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
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Award,
  Calendar,
  Filter,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { useTimezone } from "@/shared/hooks/useTimezone"
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
const interpolate = (template, values) => Object.entries(values).reduce(
  (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
  template || "",
)

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

const formatLabelDateTime = (value, formatDateTime) => {
  if (!value) return "—"
  return formatDateTime ? formatDateTime(value) : String(value)
}

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0
  return Number.isNaN(timestamp) ? 0 : timestamp
}

// ─── Student Assignment Row (Table View) ──────────────────────────────
const StudentAssignmentRow = ({ assignment, classId, cd, cg, language, onSelect }) => {
  const { formatDateTime } = useTimezone()
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

  const dueLabel = formatLabelDateTime(assignment.dueDate, formatDateTime)

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
      className="group hover:bg-amber-50/30 transition-colors cursor-pointer"
    >
      <td className="p-4 pl-6 font-extrabold text-gray-850">
        <div className="flex items-center gap-2.5">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
            {cg.badgeAssignment}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect(assignment.id)
            }}
            className="truncate max-w-sm text-left font-bold text-gray-900 group-hover:text-[#990011] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] rounded"
          >
            {getAssignmentTitle(assignment, cg.untitledAssignment)}
          </button>
        </div>
      </td>
      <td className="p-4 text-gray-500 font-semibold">{dueLabel}</td>
      <td className="p-4">
        {isLoading && !hasEmbeddedSubmission ? (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {cg.loading}
          </span>
        ) : (
          <>
            {displayStatus === "not_submitted" && (
              <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wider">
                {cd.statusNotSubmitted}
              </span>
            )}
            {(displayStatus === "submitted" || displayStatus === "late") && (
              <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                {displayStatus === "late"
                  ? cg.filterLate
                  : cd.statusNeedsGrading}
              </span>
            )}
            {displayStatus === "returned" && (
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                {cg.filterReturned}
              </span>
            )}
          </>
        )}
      </td>
      <td className="p-4 pr-6 text-center font-black text-sm text-gray-900">
        {isLoading && !hasEmbeddedSubmission ? (
          "—"
        ) : isReleased && gradeLabel !== "—" ? (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
            {gradeLabel}
          </span>
        ) : (
          <span className="text-gray-400 font-normal">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── Student Quiz Row (Table View) ───────────────────────────────────
const StudentQuizRow = ({ quiz, cg, language, onSelect }) => {
  const { formatDateTime } = useTimezone()
  const closeTimeFormatted = formatLabelDateTime(quiz.closeTime, formatDateTime)

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

  const remainingAttemptsNum = Number(quiz?.remainingAttempts ?? quiz?.remainingAttempt ?? quiz?.attemptsLeft)
  const hasRemainingAttempts = (
    quiz?.remainingAttempts === undefined &&
    quiz?.remainingAttempt === undefined &&
    quiz?.attemptsLeft === undefined
  )
    ? true
    : (Number.isFinite(remainingAttemptsNum) ? remainingAttemptsNum > 0 : true)

  return (
    <tr
      onClick={() => onSelect && onSelect(quiz.id)}
      className="group hover:bg-red-50/30 transition-colors cursor-pointer"
    >
      <td className="p-4 pl-6 font-extrabold text-gray-850">
        <div className="flex items-center gap-2.5">
          <span className="bg-red-50 text-[#990011] border border-red-200 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Timer size={10} />
            {cg.badgeQuiz}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(quiz.id)
            }}
            className="truncate max-w-sm text-left font-bold text-gray-900 group-hover:text-[#990011] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990011] rounded"
          >
            {quiz.name || quiz.title || cg.untitledQuiz}
          </button>
        </div>
      </td>
      <td className="p-4 text-gray-500 font-semibold">{closeTimeFormatted}</td>
      <td className="p-4 flex items-center gap-2">
        {recordStatus === "submitted" ? (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
            {cg.quizStatusSubmitted}
          </span>
        ) : recordStatus === "inprogress" ? (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {cg.quizStatusInProgress}
          </span>
        ) : hasKnownRecordStatus ? (
          <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-wider">
            {cg.quizStatusToDo}
          </span>
        ) : (
          <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-gray-200 uppercase tracking-wider">
            {cg.statusUnavailable}
          </span>
        )}
        {recordStatus === "submitted" && (
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onSelect?.(quiz.id, "result")
              }}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Eye size={11} />
              <span>{cg.seeQuizResultBtn}</span>
            </button>
            {hasRemainingAttempts && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect?.(quiz.id, "intro")
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw size={11} />
                <span>{cg.retakeQuizBtn || "Retake Quiz"}</span>
              </button>
            )}
          </div>
        )}
        {recordStatus === "inprogress" && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onSelect?.(quiz.id)
            }}
            className="ml-auto px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
          >
            <RotateCcw size={11} />
            <span>{cg.continueQuizBtn || "Continue Quiz"}</span>
          </button>
        )}
      </td>
      <td className="p-4 pr-6 text-center font-bold text-xs text-gray-600">
        {hasTimeLimit
          ? interpolate(cg.minsLabel, { mins: quiz.timeLimitMinutes })
          : "—"}
      </td>
    </tr>
  )
}

// ─── Student Assignment Card (Grid View) ─────────────────────────────
const StudentAssignmentCard = ({ assignment, classId, cd, cg, language, onSelect, nowMs }) => {
  const { formatDateTime } = useTimezone()
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
    : null

  const dueLabel = formatLabelDateTime(assignment.dueDate, formatDateTime)

  const submittedAtMs = getTimestamp(submission?.submittedAt)
  const dueAtMs = getTimestamp(assignment?.dueDate)
  const isSubmissionLate = submittedAtMs > 0 && dueAtMs > 0 ? submittedAtMs > dueAtMs : false

  const displayStatus = submissionStatus === "graded"
    ? (isSubmissionLate ? "late" : "submitted")
    : submissionStatus

  const { isExpired } = getAssignmentTimeline(assignment, nowMs)

  return (
    <div
      onClick={() => onSelect(assignment.id)}
      className="group relative bg-white border border-gray-200 hover:border-amber-400/70 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer border-t-4 border-t-amber-500 overflow-hidden"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <FileText size={12} className="text-amber-600" />
            {cg.badgeAssignment}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isLoading && !hasEmbeddedSubmission ? (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">...</span>
            ) : (
              <>
                {displayStatus === "not_submitted" && (
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${isExpired
                    ? "bg-red-50 text-red-655 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                    {isExpired
                      ? cg.badgeExpired
                      : cd.statusNotSubmitted}
                  </span>
                )}
                {(displayStatus === "submitted" || displayStatus === "late") && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {displayStatus === "late"
                      ? cg.filterLate
                      : cd.statusNeedsGrading}
                  </span>
                )}
                {displayStatus === "returned" && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {cg.filterReturned}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#990011] transition-colors leading-snug line-clamp-2 mb-3">
          {getAssignmentTitle(assignment, cg.untitledAssignment)}
        </h4>

        {/* Info badges / Due date */}
        <div className="flex flex-col gap-2 text-xs font-semibold text-gray-500 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={13} className={isExpired && displayStatus === "not_submitted" ? "text-red-500 shrink-0" : "text-gray-400 shrink-0"} />
            <span className={`truncate text-xs ${isExpired && displayStatus === "not_submitted" ? "text-red-600 font-extrabold" : ""}`}>
              {cg.dueDateLabel}{dueLabel}
            </span>
          </div>

          {maxScore !== null && (
            <div className="flex items-center gap-2 text-gray-500">
              <Award size={13} className="text-amber-500 shrink-0" />
              <span>{interpolate(cg.maxScoreLabel, { score: maxScore })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grade Banner or Action Footer */}
      <div>
        {gradeLabel && (
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
            <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
              <Award size={14} className="text-emerald-600" />
              {cg.scoreLabel}
            </span>
            <span className="font-black text-emerald-700 text-sm bg-white px-2.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
              {gradeLabel}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(assignment.id)
          }}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${displayStatus === "returned"
            ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
            : displayStatus === "submitted" || displayStatus === "late"
              ? "bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
              : isExpired
                ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                : "bg-[#990011] hover:bg-[#80000e] text-white shadow-xs"
            }`}
        >
          <span>
            {displayStatus === "returned"
              ? cg.viewGradeBtn
              : displayStatus === "submitted" || displayStatus === "late"
                ? cg.viewSubmissionBtn
                : cg.submitAssignmentBtn}
          </span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Student Quiz Card (Grid View) ──────────────────────────────────
const StudentQuizCard = ({ quiz, cg, language, onSelect }) => {
  const { formatDateTime } = useTimezone()
  const closeTimeFormatted = formatLabelDateTime(quiz.closeTime, formatDateTime)

  const recordStatus = typeof quiz.recordStatus === "string"
    ? quiz.recordStatus.trim().toLowerCase()
    : quiz.recordStatus

  const hasTimeLimit = (
    quiz.timeLimitMinutes !== null
    && quiz.timeLimitMinutes !== undefined
    && quiz.timeLimitMinutes !== ""
    && Number.isFinite(Number(quiz.timeLimitMinutes))
    && Number(quiz.timeLimitMinutes) >= 0
  )

  const embeddedQuestionCount = Array.isArray(quiz.questions)
    ? quiz.questions.length
    : undefined
  const parsedQuestionCount = Number(quiz.questionCount)
  const questionCount = embeddedQuestionCount
    ?? (Number.isFinite(parsedQuestionCount) ? parsedQuestionCount : null)

  const remainingAttemptsNum = Number(quiz?.remainingAttempts ?? quiz?.remainingAttempt ?? quiz?.attemptsLeft)
  const hasRemainingAttempts = (
    quiz?.remainingAttempts === undefined &&
    quiz?.remainingAttempt === undefined &&
    quiz?.attemptsLeft === undefined
  )
    ? true
    : (Number.isFinite(remainingAttemptsNum) ? remainingAttemptsNum > 0 : true)

  return (
    <div
      onClick={() => onSelect && onSelect(quiz.id)}
      className="group relative bg-white border border-gray-200 hover:border-red-400/70 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer border-t-4 border-t-[#990011] overflow-hidden"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-red-50 text-[#990011] border border-red-200/80 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Timer size={12} className="text-[#990011]" />
            {cg.badgeQuiz}
          </span>

          <div className="flex items-center gap-1.5">
            {recordStatus === "submitted" ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {cg.quizStatusSubmitted}
              </span>
            ) : recordStatus === "inprogress" ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                {cg.quizStatusInProgress}
              </span>
            ) : (
              <span className="bg-red-50 text-red-655 border border-red-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {cg.quizStatusToDo}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-[#990011] transition-colors leading-snug line-clamp-2 mb-3">
          {quiz.name || quiz.title || cg.untitledQuiz}
        </h4>

        {/* Info Grid */}
        <div className="flex flex-col gap-2 text-xs font-semibold text-gray-500 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{interpolate(cg.closesLabel, { time: closeTimeFormatted })}</span>
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-xs">
            {hasTimeLimit && (
              <span className="inline-flex items-center gap-1.5">
                <Timer size={13} className="text-red-500 shrink-0" />
                {interpolate(cg.minsLabel, { mins: quiz.timeLimitMinutes })}
              </span>
            )}
            {questionCount !== null && (
              <span className="inline-flex items-center gap-1.5">
                <FileText size={13} className="text-blue-500 shrink-0" />
                {interpolate(cg.questionsLabel, { count: questionCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Button */}
      <div>
        {recordStatus === "submitted" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelect?.(quiz.id, "result")
              }}
              className={`w-full py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-[0.99] cursor-pointer shadow-2xs ${!hasRemainingAttempts ? "col-span-2" : ""}`}
            >
              <Eye size={13} />
              <span>{cg.seeQuizResultBtn}</span>
            </button>
            {hasRemainingAttempts && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(quiz.id, "intro")
                }}
                className="w-full py-2.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
              >
                <RotateCcw size={13} />
                <span>{cg.retakeQuizBtn || "Retake Quiz"}</span>
              </button>
            )}
          </div>
        ) : recordStatus === "inprogress" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(quiz.id)
            }}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <RotateCcw size={13} />
            <span>{cg.continueQuizBtn || "Continue Quiz"}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(quiz.id)
            }}
            className="w-full py-2.5 px-4 bg-[#990011] hover:bg-[#80000e] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-xs"
          >
            <span>{cg.startQuizBtn}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Teacher Quiz Card ───────────────────────────────────────────────
const QuizCard = ({ quiz, classId, cg, language, navigate }) => {
  const { formatDateTime } = useTimezone()
  const [publishTeacherQuiz, { isLoading: isPublishing }] = usePublishTeacherQuizMutation()
  const publishGuardRef = useRef(false)

  const statusStr = String(quiz.status || "").toLowerCase()
  const isDraft = statusStr === "draft"
  const isOpen = statusStr === "open"
  const isUpcoming = statusStr === "upcoming"
  const isClosed = statusStr === "closed"

  const closeTimeFormatted = formatLabelDateTime(quiz.closeTime, formatDateTime)

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
      toast.success(cg.quizPublishedToast)
    } catch (err) {
      toast.error(getQuizErrorMessage(
        err,
        language,
        cg.quizPublishErrorToast,
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
              {cg.badgeQuiz}
            </span>

            {/* Status Badge */}
            {isDraft && (
              <span className="bg-gray-100 text-gray-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeDraft}
              </span>
            )}
            {isOpen && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeOpen}
              </span>
            )}
            {isUpcoming && (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeUpcoming}
              </span>
            )}
            {isClosed && (
              <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                {cg.badgeClosed}
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
            title={cg.viewQuizDetails}
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
          title={cg.viewQuizDetails}
        >
          {quiz.name || quiz.title || cg.untitledQuiz}
        </h4>

        {/* Subtitle / Timeline info */}
        <div className="flex flex-col gap-1 text-xs text-gray-400 font-semibold mb-3">
          <div className="flex items-center gap-1.5 leading-none">
            <Clock size={12} className="text-gray-400 shrink-0" />
            <span className="truncate">
              {interpolate(cg.closesLabel, { time: closeTimeFormatted })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 font-bold mt-1">
            <span className="inline-flex items-center gap-1">
              <Timer size={13} className="text-gray-400 shrink-0" />
              {Number.isFinite(Number(quiz.timeLimitMinutes))
                ? interpolate(cg.minsLabel, { mins: quiz.timeLimitMinutes })
                : "—"}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText size={13} className="text-gray-400 shrink-0" />
              {interpolate(cg.questionsLabel, { count: questionCount ?? "—" })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Settings & Actions */}
      <div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex justify-between items-center mb-3 text-[10px] font-extrabold text-gray-600">
          <span>
            {interpolate(cg.scoreScaleLabel, {
              score: quiz.gradingScale === "Hundred"
                ? 100
                : (quiz.gradingScale === "Ten" ? 10 : "—"),
            })}
          </span>
          <span>
            {
              quiz.autoGradingEnabled === true
                ? cg.autoGraded
                : (
                  quiz.autoGradingEnabled === false
                    ? cg.manualGraded
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
              {cg.btnContinueEditing}
            </button>
            <button
              type="button"
              onClick={handlePublishDirectly}
              disabled={isPublishing}
              aria-busy={isPublishing}
              className="flex-1 py-2 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-[10px] rounded-xl text-center transition-all active:scale-99 uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? cg.publishingQuiz : cg.publishQuiz}
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
            {cg.viewQuizDetails}
          </button>
        )}
      </div>
    </div>
  )
}

const ClassGradingTab = ({ id: classId, isStudent }) => {
  const { language, t } = useLanguage()
  const { formatDateTime } = useTimezone()
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
  const [sortBy, setSortBy] = useState("dueSoon")
  const [contentType, setContentType] = useState("all") // "all" | "assignments" | "quizzes"
  const [viewMode, setViewMode] = useState("grid") // "grid" | "list"
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
    cg.loadContentError,
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

  // Student Metrics Computation
  const totalAssignmentsCount = assignments.length
  const totalQuizzesCount = quizzes.length
  const totalItemsCount = totalAssignmentsCount + totalQuizzesCount

  const pendingStudentItemsCount = useMemo(() => {
    let count = 0
    assignments.forEach((assignment) => {
      const embeddedSubmission = assignment.mySubmission ?? assignment.submission ?? null
      const status = getSubmissionStatus(embeddedSubmission)
      if (status === "not_submitted") count++
    })
    quizzes.forEach((quiz) => {
      const recordStatus = typeof quiz.recordStatus === "string" ? quiz.recordStatus.trim().toLowerCase() : quiz.recordStatus
      if (recordStatus !== "submitted") count++
    })
    return count
  }, [assignments, quizzes])

  const completedStudentItemsCount = useMemo(() => {
    let count = 0
    assignments.forEach((assignment) => {
      const embeddedSubmission = assignment.mySubmission ?? assignment.submission ?? null
      const status = getSubmissionStatus(embeddedSubmission)
      if (status === "submitted" || status === "graded" || status === "returned") count++
    })
    quizzes.forEach((quiz) => {
      const recordStatus = typeof quiz.recordStatus === "string" ? quiz.recordStatus.trim().toLowerCase() : quiz.recordStatus
      if (recordStatus === "submitted") count++
    })
    return count
  }, [assignments, quizzes])

  const gradedStudentItemsCount = useMemo(() => {
    let count = 0
    assignments.forEach((assignment) => {
      const embeddedSubmission = assignment.mySubmission ?? assignment.submission ?? null
      const status = getSubmissionStatus(embeddedSubmission)
      if (status === "returned") count++
    })
    quizzes.forEach((quiz) => {
      const recordStatus = typeof quiz.recordStatus === "string" ? quiz.recordStatus.trim().toLowerCase() : quiz.recordStatus
      if (recordStatus === "submitted") count++
    })
    return count
  }, [assignments, quizzes])

  const studentItems = useMemo(() => {
    const items = []
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

    if (showAssignments) {
      assignments.forEach((assignment) => {
        const title = String(getAssignmentTitle(assignment, "")).toLocaleLowerCase()
        const matchesSearch = !normalizedSearch || title.includes(normalizedSearch)

        const embeddedSubmission = assignment.mySubmission ?? assignment.submission ?? null
        const submissionStatus = getSubmissionStatus(embeddedSubmission)
        const { isExpired } = getAssignmentTimeline(assignment, nowMs)

        let matchesStatus = true
        if (statusFilter === "pending") {
          matchesStatus = submissionStatus === "not_submitted" && !isExpired
        } else if (statusFilter === "submitted") {
          matchesStatus = submissionStatus === "submitted" || submissionStatus === "late"
        } else if (statusFilter === "graded") {
          matchesStatus = submissionStatus === "returned" || submissionStatus === "graded"
        } else if (statusFilter === "overdue") {
          matchesStatus = (submissionStatus === "not_submitted" && isExpired) || submissionStatus === "late"
        }

        if (matchesSearch && matchesStatus) {
          items.push({
            type: "assignment",
            value: assignment,
            dueDate: getTimestamp(assignment.dueDate),
            createdAt: getTimestamp(assignment.createdAt),
          })
        }
      })
    }

    if (showQuizzes) {
      quizzes.forEach((quiz) => {
        const title = String(quiz.name ?? quiz.title ?? "").toLocaleLowerCase()
        const matchesSearch = !normalizedSearch || title.includes(normalizedSearch)

        const recordStatus = typeof quiz.recordStatus === "string" ? quiz.recordStatus.trim().toLowerCase() : quiz.recordStatus
        const closeTimestamp = getTimestamp(quiz.closeTime)

        let matchesStatus = true
        if (statusFilter === "pending") {
          matchesStatus = recordStatus !== "submitted"
        } else if (statusFilter === "submitted" || statusFilter === "graded") {
          matchesStatus = recordStatus === "submitted"
        } else if (statusFilter === "overdue") {
          matchesStatus = recordStatus !== "submitted" && closeTimestamp > 0 && closeTimestamp < nowMs
        }

        if (matchesSearch && matchesStatus) {
          items.push({
            type: "quiz",
            value: quiz,
            dueDate: closeTimestamp,
            createdAt: getTimestamp(quiz.createdAt),
          })
        }
      })
    }

    return items.sort((a, b) => {
      if (sortBy === "dueSoon") {
        const dateA = a.dueDate > 0 ? a.dueDate : Infinity
        const dateB = b.dueDate > 0 ? b.dueDate : Infinity
        return dateA - dateB
      } else if (sortBy === "oldest") {
        return a.createdAt - b.createdAt
      } else {
        return b.createdAt - a.createdAt
      }
    })
  }, [
    assignments,
    quizzes,
    showAssignments,
    showQuizzes,
    searchTerm,
    statusFilter,
    sortBy,
    nowMs,
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
        aria-label={cg.loadingCourseContent}
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
      <div className="flex flex-col gap-6">

        {/* ─── 1. Student Dashboard Overview Metrics (4 Cards) ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Items */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-[#990011] flex items-center justify-center shrink-0 border border-red-100">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{totalItemsCount}</p>
              <p className="text-xs font-bold text-gray-500">{cg.totalItems}</p>
            </div>
          </div>

          {/* Card 2: Action Required / Pending */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${pendingStudentItemsCount > 0
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
              }`}>
              <Clock size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{pendingStudentItemsCount}</p>
              <p className="text-xs font-bold text-gray-500">{cg.pendingWork}</p>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{completedStudentItemsCount}</p>
              <p className="text-xs font-bold text-gray-500">{cg.completedWork}</p>
            </div>
          </div>

          {/* Card 4: Graded / Returned */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
              <Award size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">{gradedStudentItemsCount}</p>
              <p className="text-xs font-bold text-gray-500">{cg.gradedWork}</p>
            </div>
          </div>
        </div>

        {/* ─── 2. Rich Control Bar (Search, Tabs, Filter, Sort, View Mode Toggle) ─── */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">

          {/* Left: Content Type Tabs with Counts */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => selectContentType("all")}
              aria-pressed={contentType === "all"}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${contentType === "all" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <span>{cg.filterAll}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${contentType === "all" ? "bg-red-50 text-[#990011]" : "bg-gray-200 text-gray-600"
                }`}>
                {totalItemsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectContentType("assignments")}
              aria-pressed={contentType === "assignments"}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${contentType === "assignments" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <FileText size={13} />
              <span>{cg.contentAssignments}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${contentType === "assignments" ? "bg-red-50 text-[#990011]" : "bg-gray-200 text-gray-600"
                }`}>
                {totalAssignmentsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => selectContentType("quizzes")}
              aria-pressed={contentType === "quizzes"}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center gap-1.5 ${contentType === "quizzes" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Timer size={13} />
              <span>{cg.contentQuizzes}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${contentType === "quizzes" ? "bg-red-50 text-[#990011]" : "bg-gray-200 text-gray-600"
                }`}>
                {totalQuizzesCount}
              </span>
            </button>
          </div>

          {/* Right Controls: Search, Status Filter, Sort, View Toggle */}
          <div className="flex flex-wrap items-center gap-3 flex-1 lg:justify-end">

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-full lg:max-w-[260px]">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={cg.searchByTitlePlaceholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => selectStatusOption(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] cursor-pointer transition-all"
              >
                <option value="all">{cg.statusAllOptions}</option>
                <option value="pending">{cg.statusPendingOption}</option>
                <option value="submitted">{cg.statusSubmittedOption}</option>
                <option value="graded">{cg.statusGradedOption}</option>
                <option value="overdue">{cg.statusOverdueOption}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Selection */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => selectSortOption(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] cursor-pointer transition-all"
              >
                <option value="dueSoon">{cg.sortDueSoon}</option>
                <option value="newest">{cg.sortNewest}</option>
                <option value="oldest">{cg.sortOldest}</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle Switcher */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title={cg.viewModeGrid}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-[#990011] shadow-2xs font-bold" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title={cg.viewModeList}
                className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-[#990011] shadow-2xs font-bold" : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                <List size={15} />
              </button>
            </div>

          </div>
        </div>

        {/* Errors & Loading Warnings */}
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
              {cg.retry}
            </button>
          </div>
        )}

        {isPartiallyLoading && (
          <p className="text-xs font-semibold text-gray-500" role="status" aria-live="polite">
            {cg.loadingMoreContent}
          </p>
        )}

        {/* ─── 3. Main Content (Grid View or List View) ─── */}
        {totalStudentItems === 0 ? (
          <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
              <FileText size={24} />
            </div>
            <p className="text-sm font-bold text-gray-700">
              {searchTerm || statusFilter !== "all"
                ? cg.noMatchingItems
                : cg.noDataLabel}
            </p>
            {(searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="mt-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-colors"
              >
                {cg.clearFiltersBtn}
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleStudentItems.map((item) => (
              item.type === "assignment" ? (
                <StudentAssignmentCard
                  key={`assign-${item.value.id}`}
                  assignment={item.value}
                  classId={classId}
                  cd={cd}
                  cg={cg}
                  language={language}
                  nowMs={nowMs}
                  onSelect={(id) => setSearchParams({ tab: "grading", assignmentId: id })}
                />
              ) : (
                <StudentQuizCard
                  key={`quiz-${item.value.id}`}
                  quiz={item.value}
                  cg={cg}
                  language={language}
                  onSelect={(id, step) => navigate(
                    `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(id)}/take${step ? `?step=${step}` : ""}`
                  )}
                />
              )
            ))}
          </div>
        ) : (
          /* Table List View Layout */
          <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-700 font-extrabold uppercase tracking-wider">
                    <th className="p-4 pl-6">{cg.contentHeader}</th>
                    <th className="p-4">{cg.deadlineCloseHeader}</th>
                    <th className="p-4">{cg.thStatus}</th>
                    <th className="p-4 pr-6 text-center">{cg.scoreLimitHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {visibleStudentItems.map((item) => (
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
                        cg={cg}
                        language={language}
                        onSelect={(id, step) => navigate(
                          `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(id)}/take${step ? `?step=${step}` : ""}`
                        )}
                      />
                    )
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
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
            {cg.filterAll}
          </button>
          <button
            type="button"
            onClick={() => selectContentType("assignments")}
            aria-pressed={contentType === "assignments"}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${contentType === "assignments" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            {cg.contentAssignments}
          </button>
          <button
            type="button"
            onClick={() => selectContentType("quizzes")}
            aria-pressed={contentType === "quizzes"}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${contentType === "quizzes" ? "bg-white text-[#990011] shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Timer size={14} />
            <span>{cg.contentQuizzes}</span>
          </button>
        </div>

        {/* Center: Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={cg.searchPlaceholder}
            aria-label={cg.searchContent}
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
              <option value="all">{cg.statusFilter}</option>
              <option value="published">{cg.badgePublished}</option>
              <option value="draft">{cg.badgeDraft}</option>
              <option value="closed">{cg.badgeClosed}</option>
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
              <option value="newest">{cg.sortNewest}</option>
              <option value="oldest">{cg.sortOldest}</option>
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
            {cg.retry}
          </button>
        </div>
      )}

      {isPartiallyLoading && (
        <p className="text-xs font-semibold text-gray-500" role="status" aria-live="polite">
          {cg.loadingMoreContent}
        </p>
      )}

      {/* ─── Grid of Assignment & Quiz Cards ─── */}
      {hasNoItems ? (
        <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-xs text-gray-400 font-bold">
          {hasVisibleListError
            ? listErrorMessage
            : cg.noDataLabel}
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
            const title = getAssignmentTitle(assignment, cg.untitledAssignment)
            const dueDate = formatLabelDateTime(assignment.dueDate, formatDateTime)

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
                        {cg.badgeAssignment}
                      </span>

                      {/* Badge status */}
                      {status === "published" && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgePublished}
                        </span>
                      )}
                      {status === "draft" && (
                        <span className="bg-gray-100 text-gray-500 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeDraft}
                        </span>
                      )}
                      {status === "closed" && (
                        <span className="bg-gray-100 text-gray-400 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeClosed}
                        </span>
                      )}

                      {/* Badge timeline */}
                      {isUpcoming && (
                        <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeUpcoming}
                        </span>
                      )}
                      {isExpired && (
                        <span className="bg-red-50 border border-red-100 text-red-655 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wide">
                          {cg.badgeExpired}
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
                          {cg.dueDateLabel}{dueDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        <span>{cg.notPublishedLabel}</span>
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
                          {cg.submittedLabel}{submittedCount}/{enrolledCount}
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
                            {cg.needsGradingLabel}{needsGradingCount}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-red-700">
                          {cg.notSubmittedLabel}{notSubmittedCount}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Draft or unavailable-statistics placeholder block */
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 mb-4 h-[64px]">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-bold leading-none">
                        {isDraft
                          ? cg.noDataLabel
                          : cg.statsUnavailableLabel}
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
                      {cg.btnContinueEditing}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchParams({ tab: "grading", assignmentId: assignment.id })}
                      className="w-full py-2 border border-gray-200 hover:bg-gray-50 text-gray-650 font-extrabold text-[11px] rounded-xl text-center transition-colors active:scale-99 uppercase tracking-wider"
                    >
                      {cg.btnViewSubmissions}
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
