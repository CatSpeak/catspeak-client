import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { ArrowRight, Clock, List } from "lucide-react"

/**
 * Thẻ hiển thị thông tin bài tập/bài kiểm tra cho học viên
 */
const StudentGradingCard = ({
  status = "pending",
  statusLabel = "Chưa làm",
  title = "",
  typeLabel = "",
  type = "assignment",
  duration = "0",
  questionCount = "0",
  timeRemainingText = "",
  deadlineText = "",
  score = null,
  footerText = "",
  actionText = "Làm bài",
  onAction = () => { },
}) => {
  const isOverdue = status === "overdue"
  const isPending = status === "pending"

  // Màu sắc badge trạng thái
  let statusBadgeClasses = "bg-[#E2E2E2] text-[#7B7979]" // pending, overdue
  if (status === "submitted" || status === "late") {
    statusBadgeClasses = status === "late" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-[#DAFFEB] text-[#34CE56] border border-green-200"
  } else if (status === "graded" || status === "returned") {
    statusBadgeClasses = "bg-blue-50 text-blue-600 border border-blue-200"
  }

  // Màu sắc badge loại bài
  const typeBadgeClasses = type === "quiz" ? "bg-purple-50 text-purple-600 border border-purple-200" : "bg-indigo-50 text-indigo-600 border border-indigo-200"

  return (
    <FluentCard
      className={`relative flex flex-col justify-between space-y-4 ${isOverdue ? "bg-gray-50 opacity-90" : "bg-white"} transition-all duration-300 hover:shadow-lg`}
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
        className={`text-lg font-bold line-clamp-2 ${isOverdue ? "text-gray-500" : "text-gray-900"}`}
        title={title}
      >
        {title}
      </h3>

      {/* Meta Info */}
      <div className="flex flex-col gap-2.5 mb-6">
        {duration != null && String(duration) !== "0" && (
          <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500">
            <Clock size={16} className="text-gray-400" />
            <span>
              {duration} phút
            </span>
          </div>
        )}
        {questionCount != null && String(questionCount) !== "0" && (
          <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500">
            <List size={16} className="text-gray-400" />
            <span>
              {questionCount} Câu hỏi
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 mt-auto" />

      {/* Footer Info & Action */}
      <div className="flex items-center justify-between pt-2 h-[48px]">
        <div className="flex flex-col justify-center">
          {isPending && (
            <span className="text-red-500 font-semibold text-sm">
              {timeRemainingText}
            </span>
          )}
          {isOverdue && (
            <span className="text-gray-400 font-medium text-sm">
              {deadlineText}
            </span>
          )}
          {(status === "submitted" || status === "late" || status === "graded") && (
            <span className="text-gray-500 font-medium text-sm">
              {footerText || "Chờ chấm điểm"}
            </span>
          )}
          {status === "returned" && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#0E6EEC] text-3xl font-black tracking-tight leading-none">
                {score !== null ? score : "—"}
              </span>
              <span className="text-gray-400 text-sm font-bold tracking-wider">
                Điểm
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
