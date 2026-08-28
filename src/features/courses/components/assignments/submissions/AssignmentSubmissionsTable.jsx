import React, { useState } from "react"
import { Clock, Eye } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetPublicProfileQuery } from "@/store/api/userApi"
import TableColumnFilter from "@/features/courses/components/grading/TableColumnFilter"

const interpolate = (template, values) =>
  Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
    template || ""
  )

const getInitials = (name, fallback = "HV") => {
  if (!name || typeof name !== "string") return fallback
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const StudentAvatar = ({ student, size = "md", fallbackInitials = "HV" }) => {
  const [hasError, setHasError] = useState(false)
  const targetId =
    student?.studentId ||
    (typeof student?.id === "number" ||
    (typeof student?.id === "string" && !student?.id.startsWith("submission-"))
      ? student.id
      : null)

  const { data: profileResponse } = useGetPublicProfileQuery(targetId, {
    skip: Boolean(student?.avatar) || !targetId,
  })
  const profile = profileResponse?.data || profileResponse
  const avatarUrl =
    student?.avatar ||
    profile?.avatarUrl ||
    profile?.avatar ||
    profile?.meetingAvatarUrl

  const studentName =
    student?.name || profile?.fullName || profile?.name || fallbackInitials
  const initials = getInitials(studentName, fallbackInitials)

  const sizeClasses =
    size === "sm" ? "w-10 h-10 text-xs" : "w-12 h-12 text-sm"

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={studentName}
        onError={() => setHasError(true)}
        className={`${sizeClasses} rounded-full object-cover shrink-0 border border-border`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses} rounded-full bg-[#990011] text-white font-bold flex items-center justify-center shrink-0 shadow-2xs`}
    >
      {initials}
    </div>
  )
}

const getSubmissionStatusBadge = (student, qg) => {
  const status = String(student.status || "").toLowerCase()
  if (status.includes("late") || status.includes("muộn")) {
    return { label: qg.submissionLate || "Nộp muộn", style: "bg-[#FDF2F2] text-[#E02424] border border-pink-100" }
  }
  if (status.includes("not") || status.includes("chưa") || status === "not_submitted") {
    return { label: qg.submissionNotSubmitted || "Chưa nộp", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
  }
  return { label: qg.submissionSubmitted || "Đã nộp", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
}

const getGradingStatusBadge = (student, qg) => {
  const status = String(student.status || "").toLowerCase()
  if (
    status === "graded" ||
    status === "returned" ||
    (student.score !== null && student.score !== undefined && student.score !== "" && student.score !== "–")
  ) {
    return { label: qg.gradingGraded || "Đã chấm", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" }
  }
  return { label: qg.gradingNotGraded || "Chưa chấm", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" }
}

const AssignmentSubmissionsTable = ({
  students = [],
  qg = {},
  submissionStatusFilter = "all",
  onSelectSubmissionStatus,
  submittedTimeFilter = "all",
  onSelectSubmittedTime,
  gradingStatusFilter = "all",
  onSelectGradingStatus,
  scoreFilter = "all",
  onSelectScore,
  submissionStatusOptions = [],
  submittedTimeOptions = [],
  gradingStatusOptions = [],
  scoreOptions = [],
  openColumnFilter = null,
  setOpenColumnFilter,
  onSelectStudent,
}) => {
  const { formatDate, formatTime, formatRelative } = useTimezone()

  const formatSubmissionDateTime = (dateVal, fallbackTimeStr) => {
    const target = dateVal || fallbackTimeStr
    if (!target || target === "—") return null

    const d = new Date(target)
    if (!Number.isNaN(d.getTime())) {
      return {
        date: formatDate(target),
        time: formatTime(target),
      }
    }

    if (typeof target === "string" && target.trim() && target !== "—") {
      const parts = target.trim().split(/\s*[-–,]\s*|\s+/)
      if (parts.length >= 2) {
        return { date: parts[0], time: parts[1] }
      }
      return { date: target, time: "" }
    }

    return null
  }

  const getTimeAgo = (st) => {
    const target = st.submittedAt || st.updatedAt || (st.time !== "—" ? st.time : null)
    if (!target) return qg.timeUnknown || "Không rõ thời gian"
    return formatRelative(target) || qg.timeUnknown || "Không rõ thời gian"
  }

  return (
    <>
      {/* Mobile Card List View (hidden md:block) */}
      <div className="space-y-3 md:hidden">
        {students.length > 0 ? (
          students.map((st, idx) => {
            const subStatus = getSubmissionStatusBadge(st, qg)
            const gradStatus = getGradingStatusBadge(st, qg)
            const hasSubmitted = subStatus.label !== (qg.submissionNotSubmitted || "Chưa nộp")
            const studentName = st.name || `Học viên ${idx + 1}`
            const initials = getInitials(studentName, qg.studentInitials || "HV")
            const timeAgo = getTimeAgo(st)
            const submittedDT = formatSubmissionDateTime(st.submittedAt, st.time)
            const displayScore =
              st.score !== null && st.score !== undefined && st.score !== ""
                ? st.score
                : "–"

            return (
              <div
                key={st.id || idx}
                className="bg-white rounded-2xl p-3.5 border border-border shadow-2xs space-y-2.5 hover:border-gray-300 transition-colors"
              >
                {/* Top Row: Avatar, Name, Time & Eye Action Button */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <StudentAvatar
                      student={st}
                      size="sm"
                      fallbackInitials={qg.studentInitials || "HV"}
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-900 text-sm truncate">
                        {studentName}
                      </h5>
                      <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {interpolate(qg.lastUpdateAt || "Cập nhật lần cuối: {{time}}", { time: timeAgo })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Eye Action Button */}
                  <IconButton
                    size="xs"
                    variant="transparent"
                    disabled={!hasSubmitted}
                    onClick={() => {
                      if (!hasSubmitted) return
                      onSelectStudent?.(st)
                    }}
                    className="hover:!bg-red-50 !text-[#990011] shrink-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:!bg-transparent"
                    title={hasSubmitted ? (qg.viewAttempt || "Xem bài nộp") : (qg.studentHasNotSubmitted || "Học viên chưa nộp bài")}
                    aria-label={hasSubmitted ? (qg.viewAttempt || "Xem bài nộp") : (qg.studentHasNotSubmitted || "Học viên chưa nộp bài")}
                  >
                    <Eye className="w-4.5 h-4.5 text-[#990011]" />
                  </IconButton>
                </div>

                {/* Middle Row: Submitted Date Time */}
                {submittedDT && (
                  <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5 pt-1">
                    <span className="text-gray-400">{qg.submittedAt || "Thời gian nộp"}:</span>
                    <span className="font-semibold text-gray-800">{submittedDT.date} {submittedDT.time}</span>
                  </div>
                )}

                {/* Bottom Row: Status Badges & Score */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${subStatus.style}`}
                    >
                      {subStatus.label}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${gradStatus.style}`}
                    >
                      {gradStatus.label}
                    </span>
                  </div>

                  {/* Score Badge */}
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-lg border border-border/60">
                    <span className="text-gray-400 text-[11px]">{qg.score || "Điểm"}:</span>
                    <span className="font-bold text-gray-900">{displayScore}</span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs font-medium bg-gray-50/50 rounded-2xl border border-dashed border-border">
            {qg.noMatchingStudents || "Không tìm thấy học viên nào."}
          </div>
        )}
      </div>

      {/* Desktop Table View (hidden on mobile, visible md and up) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-gray-50/80 text-gray-600 font-bold text-[11px] uppercase tracking-wider">
              {/* Col 1: Student info */}
              <th className="py-3 px-5 border-r border-border min-w-[200px]">
                <span>{qg.thStudentInfo || qg.studentInformation || "Thông tin học viên"}</span>
              </th>

              {/* Col 2: Submission status */}
              <th className="py-3 px-5 border-r border-border text-center min-w-[140px]">
                <TableColumnFilter
                  title={qg.thSubmissionStatus || qg.submissionStatus || "Trạng thái nộp"}
                  filterTitle={qg.filterSubmissionStatus || qg.submissionStatus || "Lọc trạng thái nộp"}
                  activeValue={submissionStatusFilter}
                  options={submissionStatusOptions}
                  onSelect={onSelectSubmissionStatus}
                  isOpen={openColumnFilter === "submission"}
                  onToggle={() =>
                    setOpenColumnFilter((prev) => (prev === "submission" ? null : "submission"))
                  }
                  onClose={() => setOpenColumnFilter(null)}
                />
              </th>

              {/* Col 3: Submitted Time (Thời gian nộp) */}
              <th className="py-3 px-5 border-r border-border text-center min-w-[140px]">
                <TableColumnFilter
                  title={qg.thSubmittedTime || qg.submittedTime || "Thời gian nộp"}
                  filterTitle={qg.filterSubmittedTime || "Sắp xếp thời gian nộp"}
                  activeValue={submittedTimeFilter}
                  options={submittedTimeOptions}
                  onSelect={onSelectSubmittedTime}
                  isOpen={openColumnFilter === "time"}
                  onToggle={() =>
                    setOpenColumnFilter((prev) => (prev === "time" ? null : "time"))
                  }
                  onClose={() => setOpenColumnFilter(null)}
                />
              </th>

              {/* Col 4: Grading status */}
              <th className="py-3 px-5 border-r border-border text-center min-w-[140px]">
                <TableColumnFilter
                  title={qg.thGradingStatus || qg.gradingStatus || "Trạng thái chấm"}
                  filterTitle={qg.filterGradingStatus || qg.gradingStatus || "Lọc trạng thái chấm"}
                  activeValue={gradingStatusFilter}
                  options={gradingStatusOptions}
                  onSelect={onSelectGradingStatus}
                  isOpen={openColumnFilter === "grading"}
                  onToggle={() =>
                    setOpenColumnFilter((prev) => (prev === "grading" ? null : "grading"))
                  }
                  onClose={() => setOpenColumnFilter(null)}
                />
              </th>

              {/* Col 5: Score */}
              <th className="py-3 px-5 border-r border-border text-center min-w-[110px]">
                <TableColumnFilter
                  title={qg.thScore || qg.score || "Điểm"}
                  filterTitle={qg.sortScore || "Sắp xếp / Lọc điểm"}
                  activeValue={scoreFilter}
                  options={scoreOptions}
                  onSelect={onSelectScore}
                  isOpen={openColumnFilter === "score"}
                  onToggle={() =>
                    setOpenColumnFilter((prev) => (prev === "score" ? null : "score"))
                  }
                  onClose={() => setOpenColumnFilter(null)}
                />
              </th>

              {/* Col 6: Actions */}
              <th className="py-3 px-5 text-center min-w-[90px]">
                <span>{qg.thAction || qg.actions || "Hành động"}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {students.length > 0 ? (
              students.map((st, idx) => {
                const subStatus = getSubmissionStatusBadge(st, qg)
                const gradStatus = getGradingStatusBadge(st, qg)
                const hasSubmitted = subStatus.label !== (qg.submissionNotSubmitted || "Chưa nộp")
                const studentName = st.name || `Học viên ${idx + 1}`
                const initials = getInitials(studentName, qg.studentInitials || "HV")
                const timeAgo = getTimeAgo(st)
                const submittedDT = formatSubmissionDateTime(st.submittedAt, st.time)
                const displayScore =
                  st.score !== null && st.score !== undefined && st.score !== ""
                    ? st.score
                    : "–"

                return (
                  <tr
                    key={st.id || idx}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Col 1: Student info */}
                    <td className="py-4 px-5 border-r border-border">
                      <div className="flex items-center gap-3">
                        <StudentAvatar
                          student={st}
                          size="md"
                          fallbackInitials={qg.studentInitials || "HV"}
                        />
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm">
                            {studentName}
                          </h5>
                          <div className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              {interpolate(qg.lastUpdateAt || "Cập nhật lần cuối: {{time}}", { time: timeAgo })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Col 2: Submission status */}
                    <td className="py-4 px-5 border-r border-border text-center">
                      <span
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${subStatus.style}`}
                      >
                        {subStatus.label}
                      </span>
                    </td>

                    {/* Col 3: Submitted Time (Thời gian nộp) */}
                    <td className="py-4 px-5 border-r border-border text-center">
                      {submittedDT ? (
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm">
                            {submittedDT.date}
                          </span>
                          {submittedDT.time && (
                            <span className="text-[11px] text-gray-400 font-medium mt-0.5">
                              {submittedDT.time}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 font-medium text-xs">—</span>
                      )}
                    </td>

                    {/* Col 4: Grading status */}
                    <td className="py-4 px-5 border-r border-border text-center">
                      <span
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full inline-block ${gradStatus.style}`}
                      >
                        {gradStatus.label}
                      </span>
                    </td>

                    {/* Col 5: Score */}
                    <td className="py-4 px-5 border-r border-border text-center text-sm font-semibold text-gray-800">
                      {displayScore}
                    </td>

                    {/* Col 6: Action */}
                    <td className="py-4 px-5 text-center">
                      <IconButton
                        size="xs"
                        variant="transparent"
                        disabled={!hasSubmitted}
                        onClick={() => {
                          if (!hasSubmitted) return
                          onSelectStudent?.(st)
                        }}
                        className="hover:!bg-red-50 !text-[#990011] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:!bg-transparent"
                        title={hasSubmitted ? (qg.viewAttempt || "Xem bài nộp") : (qg.studentHasNotSubmitted || "Học viên chưa nộp bài")}
                        aria-label={hasSubmitted ? (qg.viewAttempt || "Xem bài nộp") : (qg.studentHasNotSubmitted || "Học viên chưa nộp bài")}
                      >
                        <Eye className="w-4.5 h-4.5 text-[#990011]" />
                      </IconButton>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-gray-400 text-xs font-medium"
                >
                  {qg.noMatchingStudents || "Không tìm thấy học viên nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default AssignmentSubmissionsTable
