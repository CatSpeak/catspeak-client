import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { ArrowRight, Clock, List } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * Thẻ hiển thị thông tin bài tập/bài kiểm tra cho học viên
 */
const StudentGradingCard = ({
  status,
  statusLabel,
  title,
  typeLabel,
  type,
  duration,
  questionCount,
  timeRemainingText,
  deadlineText,
  score,
  footerText,
  actionText,
  onAction,
}) => {
  const { t } = useLanguage()
  const gradingT = t?.courses?.grading || {}

  const isOverdue = status === "overdue"
  const isPending = status === "pending"

  // Màu sắc badge trạng thái
  let statusBadgeClasses = "bg-[#E2E2E2] dark:bg-[#2A2A2A] text-[#7B7979] dark:text-gray-400" // pending, overdue
  if (status === "submitted" || status === "late") {
    statusBadgeClasses = status === "late"
      ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40"
      : "bg-[#DAFFEB] dark:bg-green-950/30 text-[#34CE56] dark:text-green-400 border border-green-200 dark:border-green-900/40"
  } else if (status === "graded" || status === "returned") {
    statusBadgeClasses = "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40"
  }

  // Màu sắc badge loại bài
  const typeBadgeClasses = type === "quiz"
    ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40"
    : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40"

  return (
    <FluentCard
      className={`relative flex flex-col justify-between space-y-4 ${
        isOverdue ? "bg-gray-50 dark:bg-[#1A1A1A]/80 opacity-90" : "bg-white dark:bg-[#1A1A1A]"
      } border border-border dark:border-[#3F3F3F] transition-all duration-300 hover:shadow-lg`}
    >
      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {typeLabel && (
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadgeClasses}`}>
            {typeLabel}
          </span>
        )}
        <span
          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadgeClasses}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-bold line-clamp-2 ${isOverdue ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
        title={title}
      >
        {title}
      </h3>

      {/* Meta Info */}
      <div className="flex flex-col gap-2.5 mb-6">
        {duration != null && String(duration) !== "0" && (
          <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Clock size={16} className="text-gray-400" />
            <span>
              {gradingT.minsLabel ? gradingT.minsLabel.replace("{{mins}}", duration) : `${duration} phút`}
            </span>
          </div>
        )}
        {questionCount != null && String(questionCount) !== "0" && (
          <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">
            <List size={16} className="text-gray-400" />
            <span>
              {gradingT.questionsLabel ? gradingT.questionsLabel.replace("{{count}}", questionCount) : `${questionCount} Câu hỏi`}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-[#3F3F3F] mt-auto" />

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-2 h-[48px]">
        <div className="flex flex-col justify-center">
          {isPending && (
            <span className="text-red-500 dark:text-red-400 font-semibold text-sm">
              {timeRemainingText}
            </span>
          )}
          {isOverdue && (
            <span className="text-gray-400 dark:text-gray-500 font-medium text-sm">
              {deadlineText}
            </span>
          )}
          {(status === "submitted" || status === "late" || status === "graded") && (
            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              {footerText || gradingT.studentTab?.pendingGrading || "Chờ chấm điểm"}
            </span>
          )}
          {status === "returned" && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#0E6EEC] dark:text-[#3B82F6] text-2xl font-black tracking-tight leading-none">
                {score !== null ? score : "—"}
              </span>
              <span className="text-gray-400 text-sm font-bold tracking-wider capitalize">
                {t?.courses?.quiz?.points || gradingT.thGrade || "Điểm"}
              </span>
            </div>
          )}
        </div>

        <div>
          <PillButton
            onClick={isOverdue ? undefined : onAction}
            disabled={isOverdue}
            variant={isOverdue ? "secondary-no-outline" : "primary"}
            className="min-w-[110px] font-bold"
            endIcon={!isOverdue ? <ArrowRight size={16} strokeWidth={3} /> : undefined}
          >
            {actionText}
          </PillButton>
        </div>
      </div>
    </FluentCard>
  )
}

export default StudentGradingCard
