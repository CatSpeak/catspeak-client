import { ChevronLeft, ChevronRight, Eye } from "lucide-react"

import { getStudentInitials } from "../../../utils/submissionUtils"

const STATUS_STYLES = {
  not_submitted: "bg-red-50 text-red-655 border-red-100",
  submitted: "bg-orange-50 text-orange-655 border-orange-100",
  late: "bg-red-50 text-red-600 border-red-100",
  graded: "bg-amber-50 text-amber-600 border-amber-100",
  returned: "bg-emerald-50 text-emerald-650 border-emerald-100",
}

const getStatusLabel = (status, translations) => {
  const labels = {
    not_submitted: translations.filterNotSubmitted || "Chưa nộp",
    submitted: translations.filterSubmitted || "Đã nộp",
    late: translations.filterLate || "Nộp muộn",
    graded: translations.filterGraded || "Đã chấm",
    returned: translations.filterReturned || "Đã trả bài",
  }

  return labels[status] || status
}

const AssignmentSubmissionsTable = ({
  students,
  assignmentMaxScore,
  currentPage,
  totalPages,
  paginationText,
  translations,
  onPageChange,
  onSelectStudent,
}) => (
  <>
    <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="min-w-[650px] w-full border-collapse text-left text-xs font-semibold text-gray-500">
          <thead>
            <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-extrabold uppercase tracking-wider">
              <th className="p-4 pl-6">{translations.thStudent || "Học viên"}</th>
              <th className="p-4">{translations.thStatus || "Trạng thái"}</th>
              <th className="p-4">{translations.thSubmittedTime || "Thời gian nộp"}</th>
              <th className="p-4 text-center">{translations.thGrade || "Điểm số"}</th>
              <th className="p-4 pr-6 text-center">{translations.thActions || "Thao tác"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-750">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                  {translations.noStudentsFound || "Không tìm thấy học viên nào."}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-extrabold uppercase shadow-2xs font-sans">
                          {getStudentInitials(student.name)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-900 text-sm leading-snug">{student.name}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{student.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    {STATUS_STYLES[student.status] && (
                      <span className={`${STATUS_STYLES[student.status]} text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wide`}>
                        {getStatusLabel(student.status, translations)}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-gray-400 font-medium whitespace-nowrap">
                    {student.time}
                  </td>

                  <td className="p-4 text-center font-black text-sm text-gray-900 font-mono whitespace-nowrap">
                    {student.score !== null && student.score !== undefined
                      ? `${student.score} / ${assignmentMaxScore}`
                      : "—"}
                  </td>

                  <td className="p-4 pr-6 text-center whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(student)}
                      className="h-8 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-extrabold text-xs rounded-lg flex items-center gap-1.5 justify-center transition-colors shadow-2xs mx-auto"
                    >
                      <Eye size={12} className="text-gray-400" />
                      <span>{translations.btnView || "Xem"}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 font-sans">
      <span className="text-xs text-gray-400 font-bold">{paginationText}</span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1
          const isActive = currentPage === page
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${isActive
                ? "bg-[#990011] text-white shadow-2xs border border-[#990011]"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  </>
)

export default AssignmentSubmissionsTable
