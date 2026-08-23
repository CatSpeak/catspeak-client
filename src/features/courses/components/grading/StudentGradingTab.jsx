import React, { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import TablePagination from "../shared/TablePagination"
import StudentGradingCard from "./StudentGradingCard"
import StudentGradingFilterModal from "./StudentGradingFilterModal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import StudentAssignmentDetailView from "../assignments/StudentAssignmentDetailView"
import { SlidersHorizontal } from "lucide-react"
import { useStudentGradingData } from "../../hooks/useStudentGradingData"

const StudentGradingTab = ({ id: classId }) => {
  const { t } = useLanguage()
  const filterT = t.courses.grading.filterModal
  const gradingT = t.courses.grading
  const { formatDateTime } = useTimezone()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [showFilterModal, setShowFilterModal] = useState(false)

  const {
    activeTab,
    activeType,
    setStudentPage,
    handleTabChange,
    handleTypeChange,
    isLoading,
    normalizedItems,
    visibleItems,
    totalItems,
    totalPages,
    activePage,
    STUDENT_PAGE_SIZE,
  } = useStudentGradingData({
    classId,
    gradingT,
    filterT,
    formatDateTime,
  })

  const handleActionClick = (item) => {
    if (item.type === "assignment") {
      setSearchParams({ tab: "grading", assignmentId: item.id })
    } else {
      const isDone = item.status !== "pending" && item.status !== "overdue"
      const target = `/workspace/courses/class/${encodeURIComponent(classId)}/quiz/${encodeURIComponent(item.id)}/take${isDone ? '?step=result' : ''}`
      navigate(target)
    }
  }

  const assignmentId = searchParams.get("assignmentId")
  if (assignmentId) {
    return (
      <StudentAssignmentDetailView
        assignmentId={assignmentId}
        classId={classId}
        onBack={() => setSearchParams({ tab: "grading" })}
      />
    )
  }

  if (isLoading && normalizedItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  const activeFilterCount = (activeTab !== "all" ? 1 : 0) + (activeType !== "all" ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A1A1A]">{gradingT.gradingTitle || "Quản lý bài"}</h2>
        <div className="relative">
          <IconButton
            onClick={() => setShowFilterModal(true)}
            title={filterT.title}
            variant="outline"
          >
            <SlidersHorizontal />
          </IconButton>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[24px] h-[24px] bg-[#990011] text-white text-base font-bold rounded-full flex items-center justify-center border-[1.5px] border-white pointer-events-none z-10 px-1 leading-none shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </div>
      </div>

      <StudentGradingFilterModal
        open={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        activeStatus={activeTab}
        onStatusChange={handleTabChange}
        activeType={activeType}
        onTypeChange={handleTypeChange}
      />

      {visibleItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          {gradingT.noMatchingItems}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleItems.map((item) => (
            <StudentGradingCard
              key={`${item.type}-${item.id}`}
              type={item.type}
              typeLabel={item.type === "assignment" ? filterT.typeAssignment : filterT.typeQuiz}
              status={item.status}
              statusLabel={item.statusLabel}
              title={item.title}
              duration={item.duration}
              questionCount={item.questionCount}
              timeRemainingText={item.timeRemainingText}
              deadlineText={item.deadlineText}
              score={item.scoreText}
              footerText={item.footerText}
              actionText={item.actionText}
              onAction={() => handleActionClick(item)}
            />
          ))}
        </div>
      )}

      {totalItems > STUDENT_PAGE_SIZE && (
        <TablePagination
          currentPage={activePage}
          totalPages={totalPages}
          totalCount={totalItems}
          limit={STUDENT_PAGE_SIZE}
          onPageChange={setStudentPage}
          t={t}
        />
      )}
    </div>
  )
}

export default StudentGradingTab