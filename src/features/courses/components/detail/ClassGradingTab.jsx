import React, { useState, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import AssignmentSubmissionsView from "./AssignmentSubmissionsView"
import StudentAssignmentDetailView from "./StudentAssignmentDetailView"
import {
  Search,
  ChevronDown,
  Clock,
  EyeOff,
  MoreVertical,
  FileText,
} from "lucide-react"
import {
  useGetTeacherAssignmentsQuery,
  useGetStudentAssignmentsQuery,
  useGetMyAssignmentSubmissionQuery,
} from "@/store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const getAssignmentTitle = (assignment) => (
  assignment?.name || assignment?.title || "Untitled assignment"
)

const getAssignmentStatus = (assignment) => (
  String(assignment?.status || "").toLowerCase()
)

const getAssignmentCount = (assignment, keys) => {
  const value = keys.map((key) => assignment?.[key]).find((item) => item !== undefined && item !== null)
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const getAssignmentTimeline = (assignment) => {
  const dueTime = assignment?.dueDate ? new Date(assignment.dueDate).getTime() : null
  const hasDueDate = dueTime && !Number.isNaN(dueTime)
  return {
    isExpired: Boolean(hasDueDate && dueTime < Date.now()),
    isUpcoming: Boolean(hasDueDate && dueTime >= Date.now()),
  }
}

const getSubmissionStatus = (submission) => {
  if (!submission) return "not_submitted"
  return String(submission.status || "submitted").toLowerCase()
}

const StudentAssignmentRow = ({ assignment, classId, cd, cg, language, onSelect }) => {
  const { data: submissionResponse, isLoading } = useGetMyAssignmentSubmissionQuery(
    { classId, assignmentId: assignment.id },
    { skip: !classId || !assignment?.id },
  )

  const submission = submissionResponse?.data || submissionResponse || null
  const submissionStatus = getSubmissionStatus(submission)
  const maxScore = Number(assignment.maxScore) || 10
  const grade = submission?.grade
  const gradeLabel = grade !== null && grade !== undefined ? `${grade} / ${maxScore}` : "—"
  const dueLabel = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
    : "—"

  return (
    <tr
      onClick={() => onSelect(assignment.id)}
      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
    >
      <td className="p-4 pl-6 font-extrabold text-gray-850">{getAssignmentTitle(assignment)}</td>
      <td className="p-4 text-gray-400">{dueLabel}</td>
      <td className="p-4">
        {isLoading ? (
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {cg.loading || "Loading"}
          </span>
        ) : (
          <>
            {submissionStatus === "not_submitted" && (
              <span className="bg-red-50 text-red-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">
                {cd.statusNotSubmitted || "Chưa nộp"}
              </span>
            )}
            {(submissionStatus === "submitted" || submissionStatus === "late") && (
              <span className="bg-orange-50 text-orange-655 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">
                {submissionStatus === "late"
                  ? (cg.filterLate || "Nộp muộn")
                  : (cd.statusNeedsGrading || "Chưa chấm")}
              </span>
            )}
            {submissionStatus === "graded" && (
              <span className="bg-amber-50 text-amber-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-100 uppercase tracking-wide">
                {cg.filterGraded || cd.statusGraded || "Đã chấm"}
              </span>
            )}
            {submissionStatus === "returned" && (
              <span className="bg-emerald-50 text-emerald-650 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                {cg.filterReturned || cd.statusGraded || "Đã trả bài"}
              </span>
            )}
          </>
        )}
      </td>
      <td className="p-4 pr-6 text-center font-black text-sm text-gray-900">
        {isLoading ? "—" : gradeLabel}
      </td>
    </tr>
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  const statusParam = useMemo(() => {
    if (statusFilter === "all") return undefined
    if (statusFilter === "draft") return "Draft"
    if (statusFilter === "published") return "Published"
    if (statusFilter === "closed") return "Closed"
    return undefined
  }, [statusFilter])

  const teacherAssignmentsQuery = useGetTeacherAssignmentsQuery(
    {
      classId,
      status: statusParam,
      search: searchTerm || undefined,
    },
    { skip: isStudent || !classId },
  )

  const studentAssignmentsQuery = useGetStudentAssignmentsQuery(
    { classId },
    { skip: !isStudent || !classId },
  )

  const assignmentsResponse = isStudent ? studentAssignmentsQuery.data : teacherAssignmentsQuery.data
  const isAssignmentsLoading = isStudent ? studentAssignmentsQuery.isLoading : teacherAssignmentsQuery.isLoading

  const assignments = useMemo(() => {
    const rawAssignments = assignmentsResponse?.data || assignmentsResponse || []
    return Array.isArray(rawAssignments) ? rawAssignments : []
  }, [assignmentsResponse])

  const activeAssignment = useMemo(() => {
    if (!assignmentId) return null
    return assignments.find((a) => a.id?.toString() === assignmentId) || null
  }, [assignments, assignmentId])

  // Filter and Sort Assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter((item) => {
        const assignmentName = getAssignmentTitle(item)
        const matchesSearch = assignmentName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || getAssignmentStatus(item) === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        if (sortBy === "newest") {
          return dateB - dateA
        } else {
          return dateA - dateB
        }
      })
  }, [assignments, searchTerm, statusFilter, sortBy])

  // Dropdown options handlers
  const selectStatusOption = (val) => {
    setStatusFilter(val)
  }

  const selectSortOption = (val) => {
    setSortBy(val)
  }

  if (isAssignmentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  // ─── Sub-View: Student Submission Drill-down (Student View) ───
  if (isStudent && assignmentId) {
    const activeStudentAssignment = assignments.find((a) => a.id?.toString() === assignmentId) || null
    if (activeStudentAssignment) {
      return (
        <StudentAssignmentDetailView
          assignment={activeStudentAssignment}
          classId={classId}
          onBack={() => setSearchParams({})}
        />
      )
    }
  }

  // ─── Sub-View: Student personal grades view ───
  if (isStudent) {
    return (
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs p-6">
        <h3 className="text-sm font-extrabold text-gray-900 mb-4">{c.student?.myGrades || "Bài tập & Điểm số"}</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs font-semibold text-gray-500">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-extrabold uppercase tracking-wider">
                <th className="p-4 pl-6">Bài tập</th>
                <th className="p-4">Hạn nộp</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 pr-6 text-center">Điểm số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-750">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">
                    {cg.noDataLabel || "Chưa có số liệu / Không tìm thấy bài tập nào."}
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <StudentAssignmentRow
                    key={assignment.id}
                    assignment={assignment}
                    classId={classId}
                    cd={cd}
                    cg={cg}
                    language={language}
                    onSelect={(id) => setSearchParams({ assignmentId: id })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ─── Sub-View: Student Submission Drill-down (Figma Layout) ───
  if (activeAssignment) {
    return (
      <AssignmentSubmissionsView
        assignment={activeAssignment}
        classId={classId}
        onBack={() => setSearchParams({})}
      />
    )
  }

  // ─── Main View: Assignments Cards Grid ───
  return (
    <div className="flex flex-col gap-5">

      {/* ─── Search & Filters Bar ─── */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">

        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={cg.searchPlaceholder || "Tìm kiếm bài nộp..."}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all placeholder-gray-400"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto min-w-[170px]">
            <select
              value={statusFilter}
              onChange={(e) => selectStatusOption(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] cursor-pointer transition-all"
            >
              <option value="all">{cg.statusFilter || "Trạng thái bài nộp"}</option>
              <option value="published">{cg.badgePublished || "Đã đăng"}</option>
              <option value="draft">{cg.badgeDraft || "Nháp"}</option>
              <option value="closed">{cg.badgeClosed || "Đã đóng"}</option>
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort Selection */}
          <div className="relative w-full sm:w-auto min-w-[170px]">
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

      {/* ─── Grid of Assignment Cards ─── */}
      {filteredAssignments.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-150 rounded-3xl p-6 shadow-xs text-xs text-gray-400 font-bold">
          {cg.noDataLabel || "Chưa có số liệu / Không tìm thấy bài tập nào."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const status = getAssignmentStatus(assignment)
            const isDraft = status === "draft"
            const hasStats = !isDraft
            const submittedCount = getAssignmentCount(assignment, ["submittedCount", "submissionCount", "submissionsCount"])
            const enrolledCount = getAssignmentCount(assignment, ["enrolledCount", "studentCount", "totalStudents"])
            const needsGradingCount = getAssignmentCount(assignment, ["needsGradingCount", "pendingGradeCount", "ungradedCount"])
            const statsPercentage = enrolledCount > 0
              ? Math.round((submittedCount / enrolledCount) * 100)
              : 0
            const notSubmittedCount = Math.max(enrolledCount - submittedCount, 0)
            const { isExpired, isUpcoming } = getAssignmentTimeline(assignment)
            const title = getAssignmentTitle(assignment)
            const dueDate = assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleString(language === "vi" ? "vi-VN" : "en-US")
              : "—"

            return (
              <div
                key={assignment.id}
                className="bg-white border border-gray-250 rounded-2xl shadow-xs p-5 flex flex-col justify-between h-[270px] hover:shadow-md transition-all relative border-t-4 border-t-gray-300"
                style={{
                  borderTopColor:
                    status === "closed" ? "#D1D5DB" :
                      status === "draft" ? "#E5E7EB" : "#F59E0B"
                }}
              >

                {/* Card Header & Body Info */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1.5">
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

                    {/* Ellipsis Menu */}
                    <button type="button" className="text-gray-400 hover:text-gray-650 transition-colors p-0.5">
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2">
                    {title}
                  </h4>

                  {/* Subtitle / Deadline info */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-4 leading-none">
                    {hasStats ? (
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
                        {needsGradingCount > 0 ? (
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
                    /* Draft Empty Placeholder block */
                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 mb-4 h-[64px]">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-[10px] text-gray-400 font-bold leading-none">
                        {cg.noDataLabel || "Chưa có số liệu"}
                      </span>
                    </div>
                  )}

                  {/* Actions buttons */}
                  {isDraft ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/workspace/courses/class/${classId}/create-assignment?assignmentId=${assignment.id}`)}
                      className="w-full py-2 border border-[#990011] hover:bg-red-50/50 text-[#990011] font-extrabold text-[11px] rounded-xl text-center transition-all active:scale-99 uppercase tracking-wider"
                    >
                      {cg.btnContinueEditing || "Tiếp tục chỉnh sửa"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSearchParams({ assignmentId: assignment.id })}
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
