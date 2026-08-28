import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, BookOpen, Compass, Star } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGetStudentCompletedClassesQuery } from "@/store/api/coursesApi"
import { Badge, EmptyState } from "@/shared/components/ui/indicators"
import CompletedClassSkeleton from "./CompletedClassSkeleton"
import FluentCard from "@/shared/components/ui/FluentCard"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Pagination from "@/shared/components/ui/navigation/Pagination"
import PillButton from "@/shared/components/ui/buttons/PillButton"

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
  } = useGetStudentCompletedClassesQuery(undefined, {
    skip: !isOwnProfile,
  })

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
        <FluentCard className="bg-white">
          <EmptyState
            icon={BookOpen}
            title={cc.title || "Lớp học đã hoàn thành"}
            description={
              cc.cannotViewOther ||
              "Bạn chỉ có thể xem danh sách lớp học đã hoàn thành của chính mình."
            }
          />
        </FluentCard>
      )
    }

    if (isLoading) {
      return <CompletedClassSkeleton count={3} />
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
        <FluentCard className="bg-white">
          <EmptyState
            icon={Compass}
            title={
              searchQuery
                ? cc.noClassesFound || "Không tìm thấy lớp học đã hoàn thành"
                : cc.noClassesTitle || "Chưa có lớp học đã hoàn thành"
            }
            description={
              searchQuery
                ? cc.noClassesFoundDesc ||
                  "Thử điều chỉnh từ khoá tìm kiếm của bạn."
                : cc.noClassesDesc || "Bạn chưa hoàn thành bất kỳ lớp học nào."
            }
          />
        </FluentCard>
      )
    }

    return (
      <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-2">
          {visibleClasses.map((cls) => {
            const classTitle =
              cls.title || cls.name || cc.untitledClass || "Untitled class"

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
                className="flex cursor-pointer flex-col items-stretch gap-4 md:flex-row md:items-center bg-white"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="yellow">{languageLabel}</Badge>
                    <Badge color="gray">{levelLabel}</Badge>
                    {cls.isReviewed ? (
                      <Badge color="emerald">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                        />
                        {cc.reviewedLabel || "Đã đánh giá"}
                      </Badge>
                    ) : (
                      <Badge color="blue">
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-blue-500"
                        />
                        {cc.completedLabel || "Đã hoàn thành"}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold mb-2 sm:mb-0">{classTitle}</h3>

                    <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-x-2 text-sm text-secondary">
                      <span>
                        {cls.courseName || cls.courseTitle || UNKNOWN_VALUE}
                      </span>
                      <span
                        className="hidden md:inline-block h-1 w-1 rounded-full bg-secondary shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        {scheduleDays} | {scheduleTime}
                      </span>
                      <span
                        className="hidden md:inline-block h-1 w-1 rounded-full bg-secondary shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        {formatDisplayDate(cls.startDate, formatDate)}
                        {" - "}
                        {formatDisplayDate(cls.endDate, formatDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {!cls.isReviewed && (
                  <div className="flex shrink-0 flex-col items-stretch gap-2 md:items-end">
                    <PillButton
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/workspace/learning/class/${cls.id}/review`)
                      }}
                    >
                      {cc.reviewNow || "Đánh giá ngay"}
                    </PillButton>
                  </div>
                )}
              </FluentCard>
            )
          })}
        </div>

        <Pagination
          page={boundedPage}
          totalPages={totalPages}
          onChangePage={setPage}
        />
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4 min-h-[500px]">
      {/* Search Input */}
      {isOwnProfile && (
        <div className="flex justify-end w-full">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setPage(1)
            }}
            placeholder={cc.searchPlaceholder || "Tìm kiếm lớp học..."}
            className="w-full md:w-[360px]"
          />
        </div>
      )}

      {/* Grid Content */}
      <div className="w-full">{renderContent()}</div>
    </div>
  )
}

export default CompletedClass
