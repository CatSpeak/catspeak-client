import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Download,
  Edit,
  ExternalLink,
  FileCheck,
  Lock,
  MoreVertical,
  Search,
  Trash2,
  Unlock,
} from "lucide-react"

import { useLanguage } from "@/shared/context/LanguageContext"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"

import {
  filterSubmissionStudents,
  formatPaginationShowingText,
  getSubmissionStats,
} from "../../../utils/submissionUtils"
import AssignmentSubmissionsTable from "./AssignmentSubmissionsTable"

const ITEMS_PER_PAGE = 4

const AssignmentSubmissionsList = ({
  assignmentId,
  assignmentTitle,
  assignmentClosed,
  assignmentExpired,
  assignmentDueLabel,
  assignmentMaxScore,
  classId,
  students,
  studentSearch,
  activeFilter,
  currentPage,
  onBack,
  onToggleSubmissionsLock,
  onDownloadGradeSheet,
  onBulkReturn,
  onDeleteAssignment,
  isDeletingAssignment,
  onSelectStudent,
  onStudentSearchChange,
  onActiveFilterChange,
  onPageChange,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const coursesTranslations = t.courses || {}
  const gradingTranslations = coursesTranslations.grading || {}
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const stats = useMemo(() => getSubmissionStats(students), [students])
  const filteredStudents = useMemo(() => (
    filterSubmissionStudents(students, studentSearch, activeFilter)
  ), [students, studentSearch, activeFilter])
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredStudents, currentPage])
  const paginationText = formatPaginationShowingText({
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: filteredStudents.length,
    template: gradingTranslations.paginationShowing,
  })
  const filters = [
    { id: "all", label: gradingTranslations.filterAll || "Tất cả" },
    { id: "not_submitted", label: gradingTranslations.filterNotSubmitted || "Chưa nộp" },
    { id: "submitted", label: gradingTranslations.filterSubmitted || "Đã nộp" },
    { id: "late", label: gradingTranslations.filterLate || "Nộp muộn" },
    { id: "graded", label: gradingTranslations.filterGraded || "Đã chấm" },
    { id: "returned", label: gradingTranslations.filterReturned || "Đã trả bài" },
  ]

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{coursesTranslations.title || "Khóa học của tôi"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{coursesTranslations.allCourses?.title || "All Courses"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classId}`)}>{coursesTranslations.student?.courseDetails || "Chi tiết khóa học"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={onBack}>{coursesTranslations.student?.classDetails || "Chi tiết lớp học"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{assignmentTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {gradingTranslations.viewSubmissionsTitle || "Xem bài nộp"}
        </h1>
      </div>

      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-5 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-950 leading-tight mb-3">
              {assignmentTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {assignmentClosed ? (
                <span className="bg-gray-100 text-gray-500 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {gradingTranslations.badgeClosed || "ĐÃ ĐÓNG"}
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {gradingTranslations.badgePublished || "ĐÃ ĐĂNG"}
                </span>
              )}

              {assignmentExpired ? (
                <span className="bg-red-50 border border-red-100 text-red-655 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {gradingTranslations.badgeExpired || "HẾT HẠN"}
                </span>
              ) : (
                <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wide">
                  {gradingTranslations.badgeUpcoming || "SẮP ĐẾN HẠN"}
                </span>
              )}

              <button
                type="button"
                className="text-[#990011] hover:underline text-[11px] font-extrabold flex items-center gap-1 ml-2 transition-colors"
              >
                <span>{gradingTranslations.viewPost || "Xem bài đăng"}</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-start">
            <button
              type="button"
              onClick={() => navigate(`/workspace/courses/class/${classId}/create-assignment?assignmentId=${assignmentId}`)}
              className="h-10 px-4 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-2xs"
            >
              <Edit size={14} className="text-gray-500" />
              <span>{gradingTranslations.editBtn || "Chỉnh sửa"}</span>
            </button>

            <button
              type="button"
              onClick={onToggleSubmissionsLock}
              className={`h-10 px-4 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-sm text-white ${assignmentClosed
                ? "bg-[#990011] hover:bg-[#80000e]"
                : "bg-gray-800 hover:bg-gray-900"
                }`}
            >
              {assignmentClosed ? (
                <>
                  <Unlock size={14} />
                  <span>{gradingTranslations.openSubmissions || "Mở bài nộp"}</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>{gradingTranslations.lockSubmissions || "Khóa bài nộp"}</span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((isOpen) => !isOpen)}
                className="w-10 h-10 border border-gray-200 hover:bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 transition-colors shadow-2xs cursor-pointer"
                aria-label="More assignment actions"
                aria-expanded={showMoreMenu}
              >
                <MoreVertical size={16} />
              </button>

              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-150 rounded-2xl shadow-xl py-2 z-50 text-xs font-bold text-gray-700 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false)
                        onDownloadGradeSheet()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Download size={14} className="text-[#990011]" />
                      <span>{gradingTranslations.downloadGradeSheet || "Tải bảng điểm (.xlsx)"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false)
                        onBulkReturn()
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center gap-2 text-green-700 cursor-pointer"
                    >
                      <FileCheck size={14} />
                      <span>{gradingTranslations.bulkReturnGrade || "Trả điểm toàn bộ"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false)
                        setShowDeleteModal(true)
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 cursor-pointer border-t border-gray-100"
                    >
                      <Trash2 size={14} />
                      <span>{gradingTranslations.deleteAssignment || "Xóa bài tập"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-150 w-full" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {gradingTranslations.deadlineHeader || "HẠN NỘP"}
            </span>
            <div className="flex items-center gap-2.5 text-gray-800">
              <Calendar size={18} className="text-[#990011]" />
              <span className="text-base font-extrabold">{assignmentDueLabel}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {gradingTranslations.submittedHeader || "BÀI ĐÃ NỘP"}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="text-base font-extrabold text-gray-800 font-sans">
                {stats.submitted} <span className="text-xs font-semibold text-gray-400">/ {stats.total} {gradingTranslations.totalLabel || "Tổng số"}</span>
              </div>
              <div className="w-48 h-2 bg-gray-150 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#990011] rounded-full transition-all"
                  style={{ width: `${stats.submittedPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
              {gradingTranslations.needsGradingHeader || "CẦN CHẤM"}
            </span>
            <div className="flex items-center gap-2.5 text-amber-600">
              <FileCheck size={18} />
              <span className="text-base font-extrabold">{stats.needsGrading}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-xs flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={studentSearch}
              onChange={(event) => onStudentSearchChange(event.target.value)}
              placeholder={gradingTranslations.searchStudentsPlaceholder || "Tìm kiếm học viên..."}
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all placeholder-gray-400"
            />
          </div>

          <div className="hidden lg:flex flex-wrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 lg:pb-0 scrollbar-none lg:w-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onActiveFilterChange(filter.id)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all active:scale-95 ${isActive
                    ? "bg-[#990011] border-[#990011] text-white shadow-2xs"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-auto min-w-[170px] block lg:hidden">
            <select
              value={activeFilter}
              onChange={(event) => onActiveFilterChange(event.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#990011] transition-all appearance-none cursor-pointer"
            >
              {filters.map((filter) => (
                <option key={filter.id} value={filter.id}>{filter.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <AssignmentSubmissionsTable
          students={paginatedStudents}
          assignmentMaxScore={assignmentMaxScore}
          currentPage={currentPage}
          totalPages={totalPages}
          paginationText={paginationText}
          translations={gradingTranslations}
          onPageChange={onPageChange}
          onSelectStudent={onSelectStudent}
        />
      </div>

      {/* Delete Assignment Modal Confirmation */}
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (onDeleteAssignment) {
            await onDeleteAssignment()
          }
          setShowDeleteModal(false)
        }}
        title={gradingTranslations.deleteModalTitle || "Xóa bài tập"}
        message={
          gradingTranslations.deleteModalConfirmMsg ||
          `Bạn có chắc chắn muốn xóa bài tập "${assignmentTitle}"? Tất cả bài làm và điểm số của học sinh liên quan đến bài tập sẽ bị xóa vĩnh viễn và không thể khôi phục.`
        }
        confirmText={gradingTranslations.deleteConfirmBtn || "Xóa bài tập"}
        cancelText={t.common?.cancel || "Hủy"}
        confirmVariant="destructive"
      />
    </div>
  )
}

export default AssignmentSubmissionsList
