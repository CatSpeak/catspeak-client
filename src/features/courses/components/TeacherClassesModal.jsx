import React from "react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetExploreTeacherClassesQuery } from "@/store/api/exploreTeachersApi"
import TeacherOpenClassCard from "./TeacherOpenClassCard"

/**
 * Modal hiển thị toàn bộ lớp học đang mở của Giảng viên (Ticket 08)
 * Theo mockup: designs/explore-teacher/Xem tất cả lớp đang mở.html
 */
const TeacherClassesModal = ({
  isOpen,
  onClose,
  slugOrId,
  teacherName = "Giảng viên",
  initialClasses = [],
}) => {
  const { t } = useLanguage()

  // Fetch full open classes if modal is open
  const {
    data: classesData,
    isLoading,
    isError,
  } = useGetExploreTeacherClassesQuery(slugOrId, {
    skip: !isOpen || !slugOrId,
  })

  const classesList = classesData || initialClasses || []
  const count = classesList.length

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
      <span className="font-extrabold text-slate-900 text-lg sm:text-xl">
        {t.courses?.openClassesOfTeacher
          ?.replace("{{name}}", teacherName)
          ?.replace("{{count}}", count) ||
          `Lớp học đang mở của ${teacherName} (${count})`}
      </span>
    </div>
  )

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={modalTitle}
      fullScreenOnMobile={false}
      className="md:max-w-3xl lg:max-w-4xl max-h-[85vh] flex flex-col"
      headerClassName="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white"
      bodyClassName="p-4 sm:p-6 flex-1 overflow-y-auto bg-[#F8F9FA]"
    >
      {/* ─── Loading Skeleton ─── */}
      {isLoading && classesList.length === 0 ? (
        <div className="flex flex-col gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white rounded-2xl border border-slate-200"
            />
          ))}
        </div>
      ) : isError && classesList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          {t.courses?.errorOccurred || "Không thể tải danh sách lớp học."}
        </div>
      ) : classesList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
          {t.courses?.noClassesOpen ||
            "Hiện tại giảng viên chưa có lớp học nào đang mở."}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {classesList.map((cls) => (
            <TeacherOpenClassCard key={cls.classId} classItem={cls} />
          ))}
        </div>
      )}
    </Modal>
  )
}

export default TeacherClassesModal
