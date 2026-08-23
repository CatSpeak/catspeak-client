import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  ClipboardCheck,
  Download,
  FileCheck,
  Lock,
  MoreVertical,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash2,
  Unlock,
  ArrowUpToLine,
} from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import Pagination from "@/shared/components/ui/navigation/Pagination"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import MobileSubmissionsFilterModal from "@/features/courses/components/grading/MobileSubmissionsFilterModal"
import { getSubmissionStats } from "../../../utils/submissionUtils"
import AssignmentSubmissionsTable from "./AssignmentSubmissionsTable"

const interpolate = (template, values) =>
  Object.entries(values).reduce(
    (message, [key, value]) => message.replace(`{{${key}}}`, String(value)),
    template || ""
  )

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

const AssignmentSubmissionsList = ({
  assignmentId,
  assignmentTitle,
  assignmentClosed,
  assignmentExpired,
  assignmentDueLabel,
  classId,
  students = [],
  onBack,
  onToggleSubmissionsLock,
  onDownloadGradeSheet,
  onBulkReturn,
  onDeleteAssignment,
  isDeletingAssignment,
  isTogglingSubmissionsLock,
  isDownloadingGradeSheet,
  isBulkReturning,
  onSelectStudent,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const coursesTranslations = t.courses || {}
  const gradingTranslations = coursesTranslations.grading || {}
  const qg = gradingTranslations.teacherQuiz || {}

  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [submissionSearch, setSubmissionSearch] = useState("")
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState("all")
  const [submittedTimeFilter, setSubmittedTimeFilter] = useState("all")
  const [gradingStatusFilter, setGradingStatusFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [openColumnFilter, setOpenColumnFilter] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  useEffect(() => {
    if (!showMoreMenu) return undefined
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowMoreMenu(false)
    }
    document.addEventListener("keydown", closeOnEscape)
    return () => document.removeEventListener("keydown", closeOnEscape)
  }, [showMoreMenu])

  const stats = useMemo(() => getSubmissionStats(students), [students])

  const submissionStatusOptions = [
    { label: qg.all || "Tất cả", value: "all" },
    { label: qg.submissionSubmitted || "Đã nộp", value: "submitted", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" },
    { label: qg.submissionNotSubmitted || "Chưa nộp", value: "not_submitted", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" },
    { label: qg.submissionLate || "Nộp muộn", value: "late", style: "bg-[#FDF2F2] text-[#E02424] border border-pink-100" },
  ]

  const submittedTimeOptions = [
    { label: qg.sortDefault || "Mặc định", value: "all" },
    { label: qg.sortTimeNewest || "Mới nhất", value: "newest" },
    { label: qg.sortTimeOldest || "Cũ nhất", value: "oldest" },
  ]

  const gradingStatusOptions = [
    { label: qg.all || "Tất cả", value: "all" },
    { label: qg.gradingGraded || "Đã chấm", value: "graded", style: "bg-[#ECFDF5] text-[#059669] border border-emerald-100" },
    { label: qg.gradingNotGraded || "Chưa chấm", value: "not_graded", style: "bg-[#FFFBEB] text-[#D97706] border border-amber-100" },
  ]

  const scoreOptions = [
    { label: qg.sortDefault || "Mặc định", value: "all" },
    { label: qg.filterScored || qg.hasScore || "Có điểm", value: "scored" },
    { label: qg.filterUnscored || qg.noScore || "Chưa có điểm", value: "unscored" },
    { label: qg.sortScoreDesc || "Điểm cao đến thấp", value: "desc" },
    { label: qg.sortScoreAsc || "Điểm thấp đến cao", value: "asc" },
  ]

  const filteredStudents = useMemo(() => {
    let list = [...(students || [])]

    if (submissionSearch.trim()) {
      const q = submissionSearch.toLowerCase().trim()
      list = list.filter(
        (st) =>
          st.name?.toLowerCase().includes(q) ||
          st.email?.toLowerCase().includes(q)
      )
    }

    if (submissionStatusFilter !== "all") {
      list = list.filter((st) => {
        const sub = getSubmissionStatusBadge(st, qg)
        if (submissionStatusFilter === "submitted") return sub.label === (qg.submissionSubmitted || "Đã nộp")
        if (submissionStatusFilter === "not_submitted") return sub.label === (qg.submissionNotSubmitted || "Chưa nộp")
        if (submissionStatusFilter === "late") return sub.label === (qg.submissionLate || "Nộp muộn")
        return true
      })
    }

    if (gradingStatusFilter !== "all") {
      list = list.filter((st) => {
        const grad = getGradingStatusBadge(st, qg)
        if (gradingStatusFilter === "graded") return grad.label === (qg.gradingGraded || "Đã chấm")
        if (gradingStatusFilter === "not_graded") return grad.label === (qg.gradingNotGraded || "Chưa chấm")
        return true
      })
    }

    if (submittedTimeFilter === "newest") {
      list.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
        return timeB - timeA
      })
    } else if (submittedTimeFilter === "oldest") {
      list.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity
        return timeA - timeB
      })
    }

    if (scoreFilter === "scored") {
      list = list.filter((st) => st.score !== null && st.score !== undefined && st.score !== "" && st.score !== "–")
    } else if (scoreFilter === "unscored") {
      list = list.filter((st) => st.score === null || st.score === undefined || st.score === "" || st.score === "–")
    } else if (scoreFilter === "desc") {
      list.sort((a, b) => {
        const scoreA = Number(a.score)
        const scoreB = Number(b.score)
        const validA = Number.isFinite(scoreA)
        const validB = Number.isFinite(scoreB)
        if (validA && validB) return scoreB - scoreA
        if (validA) return -1
        if (validB) return 1
        return 0
      })
    } else if (scoreFilter === "asc") {
      list.sort((a, b) => {
        const scoreA = Number(a.score)
        const scoreB = Number(b.score)
        const validA = Number.isFinite(scoreA)
        const validB = Number.isFinite(scoreB)
        if (validA && validB) return scoreA - scoreB
        if (validA) return -1
        if (validB) return 1
        return 0
      })
    }

    return list
  }, [students, submissionSearch, submissionStatusFilter, gradingStatusFilter, submittedTimeFilter, scoreFilter, qg])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredStudents.slice(start, start + PAGE_SIZE)
  }, [filteredStudents, page])

  const activeFiltersCount =
    (submissionStatusFilter !== "all" ? 1 : 0) +
    (submittedTimeFilter !== "all" ? 1 : 0) +
    (gradingStatusFilter !== "all" ? 1 : 0) +
    (scoreFilter !== "all" ? 1 : 0)

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: coursesTranslations.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: coursesTranslations.title || "Khóa học", onClick: () => navigate("/workspace/courses") },
          { label: coursesTranslations.allCourses?.title || "Tất cả khóa học", onClick: () => navigate("/workspace/courses") },
          { label: coursesTranslations.student?.classDetails || "Chi tiết lớp học", onClick: onBack },
          { label: assignmentTitle },
        ]}
      />

      {/* Main Header Card matching screenshot */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs border border-border mb-6">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-6">
          {/* Left Title & Badges */}
          <div className="space-y-3 min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-snug break-words">
              {assignmentTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* Upcoming / Expired Badge */}
              {assignmentExpired ? (
                <span className="bg-[#EF4444] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                  {gradingTranslations.badgeExpired || "Hết hạn"}
                </span>
              ) : (
                <span className="bg-[#F59E0B] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                  {gradingTranslations.badgeUpcoming || "Sắp đến hạn"}
                </span>
              )}

              {/* Published / Closed Badge */}
              {assignmentClosed ? (
                <span className="bg-[#6B7280] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                  {gradingTranslations.badgeClosed || "Đã đóng"}
                </span>
              ) : (
                <span className="bg-[#6B7280] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-2xs">
                  {gradingTranslations.badgePublished || "Đã đăng"}
                </span>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 w-full lg:w-auto">
            {/* 1. Edit Button (IconButton with outline variant) */}
            <IconButton
              variant="outline"
              size="xs"
              className="!w-10 !h-10 shrink-0"
              innerClassName="!w-10 !h-10 [&>svg]:!w-4 [&>svg]:!h-4 !border-[#990011] !text-[#990011]"
              onClick={() => {
                navigate(`/workspace/courses/class/${encodeURIComponent(String(classId))}/assignment/${encodeURIComponent(String(assignmentId))}`)
              }}
              title={gradingTranslations.editBtn || "Chỉnh sửa"}
              aria-label={gradingTranslations.editBtn || "Chỉnh sửa"}
            >
              <Pencil className="w-4 h-4 text-[#990011]" />
            </IconButton>

            {/* 2. Post to Lecture Hall Button (PillButton with outline variant) */}
            <PillButton
              variant="outline"
              className="!h-10 flex-1 sm:flex-initial min-w-0 [&>div]:!px-2.5 sm:[&>div]:!px-4 [&>div]:!gap-1.5 sm:[&>div]:!gap-2"
              endIcon={<ArrowUpToLine className="w-4 h-4 text-[#990011]" />}
              onClick={() => {
                navigate(`/workspace/courses/class/${encodeURIComponent(String(classId))}?tab=lecture-hall`)
              }}
              title={gradingTranslations.postToLectureHall || "Đăng giảng đường"}
              aria-label={gradingTranslations.postToLectureHall || "Đăng giảng đường"}
            >
              <span className="text-[11px] sm:text-sm font-semibold truncate">
                {gradingTranslations.postToLectureHall || "Đăng giảng đường"}
              </span>
            </PillButton>

            {/* 3. Lock / Unlock Submissions Button (PillButton with primary variant) */}
            <PillButton
              variant="primary"
              className="!h-10 flex-1 sm:flex-initial min-w-0 [&>div]:!px-2.5 sm:[&>div]:!px-4 [&>div]:!gap-1.5 sm:[&>div]:!gap-2"
              bgColor={assignmentClosed ? "#059669" : "#80000e"}
              loading={isTogglingSubmissionsLock}
              endIcon={
                assignmentClosed ? (
                  <Unlock className="w-4 h-4 text-white" />
                ) : (
                  <Lock className="w-4 h-4 text-white" />
                )
              }
              onClick={onToggleSubmissionsLock}
              title={
                assignmentClosed
                  ? (gradingTranslations.openSubmissions || "Mở bài nộp")
                  : (gradingTranslations.lockSubmissions || "Khóa bài nộp")
              }
              aria-label={
                assignmentClosed
                  ? (gradingTranslations.openSubmissions || "Mở bài nộp")
                  : (gradingTranslations.lockSubmissions || "Khóa bài nộp")
              }
            >
              <span className="text-[11px] sm:text-sm font-semibold truncate">
                {assignmentClosed
                  ? (gradingTranslations.openSubmissions || "Mở bài nộp")
                  : (gradingTranslations.lockSubmissions || "Khóa bài nộp")}
              </span>
            </PillButton>

            {/* More Menu Dropdown (IconButton) */}
            <div className="relative shrink-0">
              <IconButton
                variant="secondary"
                size="xs"
                className="!w-10 !h-10 shrink-0 border border-gray-200 hover:bg-gray-50"
                innerClassName="!w-10 !h-10 [&>svg]:!w-4 [&>svg]:!h-4 text-gray-500 hover:text-gray-900"
                onClick={() => setShowMoreMenu((isOpen) => !isOpen)}
                title={gradingTranslations.moreAssignmentActions || "Thao tác khác"}
                aria-label={gradingTranslations.moreAssignmentActions || "Thao tác khác"}
                aria-expanded={showMoreMenu}
                aria-haspopup="menu"
              >
                <MoreVertical className="w-4 h-4" />
              </IconButton>

              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-xl py-2 z-50 text-xs font-bold text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isDownloadingGradeSheet}
                      onClick={() => {
                        setShowMoreMenu(false)
                        onDownloadGradeSheet()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download size={14} className="text-[#990011]" />
                      <span>
                        {isDownloadingGradeSheet
                          ? gradingTranslations.downloading || "Đang tải..."
                          : gradingTranslations.downloadGradeSheet || "Tải bảng điểm"}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isBulkReturning}
                      onClick={() => {
                        setShowMoreMenu(false)
                        onBulkReturn()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-green-700 cursor-pointer disabled:opacity-50"
                    >
                      <FileCheck size={14} />
                      <span>
                        {isBulkReturning
                          ? gradingTranslations.returning || "Đang trả bài..."
                          : gradingTranslations.bulkReturnGrade || "Trả điểm hàng loạt"}
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      disabled={isDeletingAssignment}
                      onClick={() => {
                        setShowMoreMenu(false)
                        setShowDeleteModal(true)
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 cursor-pointer border-t border-border disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span>{gradingTranslations.deleteAssignment || "Xóa bài nộp"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="h-px bg-gray-200 my-6" />

        {/* Bottom Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Stat: Hạn nộp */}
          <div className="md:col-span-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium truncate">
                {gradingTranslations.deadlineHeader || "Hạn nộp"}
              </p>
              <p className="text-sm sm:text-base font-bold text-gray-800 mt-0.5 truncate">
                {assignmentDueLabel}
              </p>
            </div>
          </div>

          {/* Right Stat: Bài đã nộp */}
          <div className="md:col-span-7 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-400 font-medium truncate">
                  {gradingTranslations.submittedHeader || "Bài đã nộp"}
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-800 truncate">
                  <span className="font-bold text-gray-900">{stats.submitted}</span>
                  <span className="text-xs text-gray-400 font-normal">
                    {" "}/ {stats.total} {gradingTranslations.totalLabel || "Tổng số"}
                  </span>
                </p>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#990011] h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.submittedPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-border space-y-4 sm:space-y-5 animate-fade-in">
        {/* Top Header Row: Title & Search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">
            {qg.submissions || gradingTranslations.submissionsList || "Danh sách nộp bài"}
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => {
                  setSubmissionSearch(e.target.value)
                  setPage(1)
                }}
                placeholder={qg.searchPlaceholder || gradingTranslations.searchStudentsPlaceholder || "Tìm kiếm học viên..."}
                className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-border rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition-all"
              />
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className={`md:hidden relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all shrink-0 cursor-pointer ${
                activeFiltersCount > 0
                  ? "border-[#990011] bg-red-50 text-[#990011]"
                  : "border-border bg-white text-gray-600 hover:bg-gray-50"
              }`}
              aria-label={qg.filter || "Bộ lọc"}
              title={qg.filter || "Bộ lọc"}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#990011] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Table & Mobile Cards */}
        <AssignmentSubmissionsTable
          students={paginatedStudents}
          qg={qg}
          submissionStatusFilter={submissionStatusFilter}
          onSelectSubmissionStatus={(val) => {
            setSubmissionStatusFilter(val)
            setPage(1)
          }}
          submittedTimeFilter={submittedTimeFilter}
          onSelectSubmittedTime={(val) => {
            setSubmittedTimeFilter(val)
            setPage(1)
          }}
          gradingStatusFilter={gradingStatusFilter}
          onSelectGradingStatus={(val) => {
            setGradingStatusFilter(val)
            setPage(1)
          }}
          scoreFilter={scoreFilter}
          onSelectScore={(val) => {
            setScoreFilter(val)
            setPage(1)
          }}
          submissionStatusOptions={submissionStatusOptions}
          submittedTimeOptions={submittedTimeOptions}
          gradingStatusOptions={gradingStatusOptions}
          scoreOptions={scoreOptions}
          openColumnFilter={openColumnFilter}
          setOpenColumnFilter={setOpenColumnFilter}
          onSelectStudent={onSelectStudent}
        />

        {/* Shared Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onChangePage={setPage}
          className="pt-4 border-t border-gray-100"
        />
      </div>

      {/* Delete Assignment Modal Confirmation */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => {
          if (!isDeletingAssignment) setShowDeleteModal(false)
        }}
        onConfirm={async () => {
          if (onDeleteAssignment && !isDeletingAssignment) {
            await onDeleteAssignment()
          }
          setShowDeleteModal(false)
        }}
        title={gradingTranslations.deleteModalTitle || "Xóa bài nộp"}
        message={interpolate(gradingTranslations.deleteModalConfirmMsg || "Bạn có chắc chắn muốn xóa bài nộp {{assignmentTitle}}?", {
          assignmentTitle,
        })}
        confirmText={
          isDeletingAssignment
            ? gradingTranslations.deletingLabel || "Đang xóa..."
            : gradingTranslations.deleteConfirmBtn || "Xóa"
        }
        cancelText={gradingTranslations.cancelBtn || "Hủy"}
        confirmVariant="destructive"
        isPending={isDeletingAssignment}
      />

      {/* Mobile Submissions Filter Modal Bottom Sheet */}
      <MobileSubmissionsFilterModal
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        submissionStatusFilter={submissionStatusFilter}
        onSelectSubmissionStatus={(val) => {
          setSubmissionStatusFilter(val)
          setPage(1)
        }}
        gradingStatusFilter={gradingStatusFilter}
        onSelectGradingStatus={(val) => {
          setGradingStatusFilter(val)
          setPage(1)
        }}
        scoreFilter={scoreFilter}
        onSelectScore={(val) => {
          setScoreFilter(val)
          setPage(1)
        }}
        submissionStatusOptions={submissionStatusOptions}
        gradingStatusOptions={gradingStatusOptions}
        scoreOptions={scoreOptions}
        onReset={() => {
          setSubmissionStatusFilter("all")
          setGradingStatusFilter("all")
          setScoreFilter("all")
          setPage(1)
        }}
        qg={qg}
      />
    </div>
  )
}

export default AssignmentSubmissionsList
