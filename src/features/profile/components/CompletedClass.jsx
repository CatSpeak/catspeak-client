import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  BookOpen,
  Compass,
  Star,
  CheckCircle2,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetStudentCompletedClassesQuery } from "@/store/api/coursesApi"
import EmptyCoursesState from "@/features/courses/components/EmptyCoursesState"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import FluentCard from "@/shared/components/ui/FluentCard"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import TablePagination from "@/features/courses/components/shared/TablePagination"

const UNKNOWN_VALUE = "—"

const formatDisplayDate = (value, formatDate) => {
  if (!value) return UNKNOWN_VALUE
  const text = String(value).trim()
  if (!/^\d{4}-\d{2}-\d{2}(?:[T\s]|$)/.test(text)) {
    return UNKNOWN_VALUE
  }
  const formatted = formatDate ? formatDate(text) : text
  return formatted || UNKNOWN_VALUE
}

const CompletedClass = ({ isOwnProfile }) => {
  const { t } = useLanguage()
  const { formatDate } = useTimezone()
  const navigate = useNavigate()

  const sc = t?.courses?.student || {}
  const cc = t?.profile?.completedClass || {}
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetStudentCompletedClassesQuery(undefined, { skip: !isOwnProfile })

  const classes = responseData?.data || []

  // Filter classes based on searchQuery
  const filteredClasses = classes.filter((cls) => {
    if (!searchQuery) return true
    const title = cls.title || cls.name || ""
    const courseTitle = cls.courseName || cls.courseTitle || ""
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE))
  const boundedPage = Math.min(page, totalPages)
  const localPageStart = (boundedPage - 1) * PAGE_SIZE
  const visibleClasses = filteredClasses.slice(
    localPageStart,
    localPageStart + PAGE_SIZE,
  )

  const renderContent = () => {
    if (!isOwnProfile) {
      return (
        <EmptyCoursesState
          icon={BookOpen}
          title={cc.title || "Lớp học đã hoàn thành"}
          message={
            cc.cannotViewOther ||
            "Bạn chỉ có thể xem danh sách lớp học đã hoàn thành của chính mình."
          }
          className="!max-w-full"
        />
      )
    }

    if (isLoading) {
      return (
        <div className="py-20 flex justify-center items-center w-full">
          <LoadingSpinner />
        </div>
      )
    }

    if (isError) {
      return (
        <div className="py-10 text-center text-red-500 font-medium w-full">
          {cc.errorLoading ||
            "Đã xảy ra lỗi khi tải danh sách lớp học đã hoàn thành."}
        </div>
      )
    }

    if (filteredClasses.length === 0) {
      return (
        <EmptyCoursesState
          className="!max-w-full"
          icon={Compass}
          title={
            searchQuery
              ? cc.noClassesFound || "Không tìm thấy lớp học đã hoàn thành"
              : cc.noClassesTitle || "Chưa có lớp học đã hoàn thành"
          }
          message={
            searchQuery
              ? cc.noClassesFoundDesc ||
              "Thử điều chỉnh từ khoá tìm kiếm của bạn."
              : cc.noClassesDesc || "Bạn chưa hoàn thành bất kỳ lớp học nào."
          }
        // action={!searchQuery ? (
        //   <button
        //     onClick={() => navigate('/explore-courses')}
        //     className="bg-[#990011] hover:bg-[#b20a1c] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 mt-2"
        //   >
        //     <Compass size={16} />
        //     <span>{cc.exploreMore || "Khám phá khoá học"}</span>
        //   </button>
        // ) : null}
        />
      )
    }

    return (
      <div className="flex flex-col gap-3 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3">
          {visibleClasses.map((cls) => {
            const classTitle = cls.title || cls.name || "Untitled class"

            let scheduleDays = UNKNOWN_VALUE
            if (
              Array.isArray(cls.schedule?.days) &&
              cls.schedule.days.length > 0
            ) {
              scheduleDays = cls.schedule.days.join(" - ")
            } else if (Array.isArray(cls.schedule) && cls.schedule.length > 0) {
              scheduleDays = cls.schedule
                .map((s) => s.dayOfWeek)
                .filter(Boolean)
                .join(" - ")
            }

            let scheduleTime = UNKNOWN_VALUE
            if (cls.schedule?.startTime && cls.schedule?.endTime) {
              scheduleTime = `${cls.schedule.startTime} - ${cls.schedule.endTime}`
            } else if (
              Array.isArray(cls.schedule) &&
              cls.schedule.length > 0 &&
              cls.schedule[0].startTime &&
              cls.schedule[0].endTime
            ) {
              scheduleTime = `${cls.schedule[0].startTime} - ${cls.schedule[0].endTime}`
            }

            const statusLabel = cls.isReviewed
              ? cc.reviewedLabel || "Đã đánh giá"
              : cc.completedLabel || "Đã hoàn thành"

            const languageLabel = cls.language
              ? sc.languages?.[cls.language] || cls.language
              : UNKNOWN_VALUE

            const levelLabel =
              Array.isArray(cls.levels) && cls.levels[0]
                ? cls.levels[0]
                : UNKNOWN_VALUE

            return (
              <FluentCard
                key={cls.id}
                onClick={() => navigate(`/workspace/learning/class/${cls.id}`)}
                className="group flex cursor-pointer flex-col items-stretch gap-4 p-5 transition-all duration-300 hover:border-[#b20a1c]/30 hover:shadow-md md:flex-row md:items-center bg-white"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9px] font-bold uppercase text-[#D97706]">
                      {languageLabel}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-gray-600">
                      {levelLabel}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-green-700">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-green-500"
                      />
                      {statusLabel}
                    </span>
                  </div>

                  <h3 className="text-lg font-black leading-snug text-gray-950 transition-colors group-hover:text-[#990011]">
                    {classTitle}
                  </h3>
                  <p className="-mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    {cc.courseLabel || "Khóa học: "}
                    {cls.courseName || cls.courseTitle || UNKNOWN_VALUE}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        size={13}
                        aria-hidden="true"
                        className="text-gray-400"
                      />
                      <span>
                        {scheduleDays} | {scheduleTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={13}
                        aria-hidden="true"
                        className="text-gray-400"
                      />
                      <span>
                        {formatDisplayDate(cls.startDate, formatDate)}
                        {" - "}
                        {formatDisplayDate(cls.endDate, formatDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
                  {cls.isReviewed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                      <CheckCircle2 size={14} />
                      {cc.reviewedLabel || "Đã đánh giá"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/workspace/learning/class/${cls.id}/review`)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#990011] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#b20a1c]"
                    >
                      <Star size={14} />
                      {cc.reviewNow || "Đánh giá ngay"}
                    </button>
                  )}
                </div>
              </FluentCard>
            )
          })}
        </div>

        {totalPages >= 1 && (
          <div className="pt-2">
            <TablePagination
              currentPage={boundedPage}
              totalPages={totalPages}
              totalCount={filteredClasses.length}
              limit={PAGE_SIZE}
              onPageChange={setPage}
              t={t}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3 min-h-[500px]">
      {/* Top Header Card containing Title and Search */}
      <FluentCard padding="p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6">
          <h2 className="text-xl font-bold">
            {cc.title || "Lớp học đã hoàn thành"}
          </h2>
          {isOwnProfile && (
            <SearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setPage(1)
              }}
              placeholder={cc.searchPlaceholder || "Tìm kiếm lớp học..."}
              className="md:w-[360px]"
            />
          )}
        </div>
      </FluentCard>

      {/* Grid Content */}
      <div className="w-full">{renderContent()}</div>
    </div>
  )
}

export default CompletedClass
