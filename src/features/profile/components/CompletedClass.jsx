import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  BookOpen,
  Compass,
  Star,
  Users,
  Share2,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetStudentCompletedClassesQuery,
  useShareStudentClassMutation,
} from "@/store/api/coursesApi"
import { Badge, EmptyState } from "@/shared/components/ui/indicators"
import CompletedClassSkeleton from "./CompletedClassSkeleton"
import FluentCard from "@/shared/components/ui/FluentCard"
import SearchInput from "@/shared/components/ui/inputs/SearchInput"
import Pagination from "@/shared/components/ui/navigation/Pagination"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Avatar from "@/shared/components/ui/Avatar"
import ProgressBar from "@/shared/components/ui/ProgressBar"
import ShareCompletedClassModal from "./ShareCompletedClassModal"
import { defaultCourseThumbnail } from "@/features/courses/utils/courseUtils"

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

const formatLanguageLabel = (lang, sc) => {
  if (!lang) return UNKNOWN_VALUE
  const str = String(lang).trim()
  const titleCased = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  return (
    sc?.languages?.[str] ||
    sc?.languages?.[titleCased] ||
    sc?.languages?.[str.toUpperCase()] ||
    titleCased
  )
}

const CompletedClass = ({ isOwnProfile }) => {
  const { t } = useLanguage()
  const { formatDate, formatScheduleDays } = useTimezone()
  const navigate = useNavigate()

  const sc = t?.courses?.student || {}
  const cc = t?.profile?.completedClass || {}
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [sharingClassId, setSharingClassId] = useState(null)
  const [selectedShareClassId, setSelectedShareClassId] = useState(null)
  const PAGE_SIZE = 6

  const {
    data: responseData,
    isLoading,
    isError,
  } = useGetStudentCompletedClassesQuery(undefined, {
    skip: !isOwnProfile,
  })

  const [shareStudentClass] = useShareStudentClassMutation()

  const classes = useMemo(() => {
    const rawData = responseData?.data || responseData || []
    return Array.isArray(rawData) ? rawData : []
  }, [responseData])

  const activeShareClass = useMemo(() => {
    if (!selectedShareClassId) return null
    return classes.find((c) => c.id === selectedShareClassId) || null
  }, [classes, selectedShareClassId])

  // Filter classes based on search query
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes

    const query = searchQuery.toLowerCase().trim()
    return classes.filter((cls) => {
      const title = (cls.title || cls.name || "").toLowerCase()
      const courseTitle = (
        cls.courseName ||
        cls.courseTitle ||
        ""
      ).toLowerCase()
      const teacherName = (
        cls.teacher?.name ||
        cls.teacher?.fullName ||
        ""
      ).toLowerCase()
      const language = (cls.language || "").toLowerCase()

      return (
        title.includes(query) ||
        courseTitle.includes(query) ||
        teacherName.includes(query) ||
        language.includes(query)
      )
    })
  }, [classes, searchQuery])

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / PAGE_SIZE))
  const boundedPage = Math.min(page, totalPages)
  const localPageStart = (boundedPage - 1) * PAGE_SIZE
  const visibleClasses = filteredClasses.slice(
    localPageStart,
    localPageStart + PAGE_SIZE,
  )

  const handleToggleShare = async (e, cls) => {
    e?.stopPropagation?.()
    const classId = cls.id
    if (!classId) return

    const nextShared = !Boolean(cls.isShared)

    try {
      setSharingClassId(classId)

      await shareStudentClass({
        classId,
        isShared: nextShared,
      }).unwrap()
    } catch (err) {
      console.error("Failed to toggle completed class share:", err)
    } finally {
      setSharingClassId(null)
    }
  }

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
      return <CompletedClassSkeleton count={6} />
    }

    if (isError) {
      return (
        <div className="py-12 text-center text-red-500 font-medium w-full bg-red-50/50 rounded-2xl border border-red-100">
          {cc.errorLoading ||
            "Đã xảy ra lỗi khi tải danh sách lớp học đã hoàn thành."}
        </div>
      )
    }

    if (filteredClasses.length === 0) {
      return (
        <FluentCard className="bg-white py-8">
          <EmptyState
            icon={Compass}
            title={
              searchQuery
                ? cc.noClassesFound || "Không tìm thấy lớp học phù hợp"
                : cc.noClassesTitle || "Chưa có lớp học đã hoàn thành"
            }
            description={
              searchQuery
                ? cc.noClassesFoundDesc ||
                  "Thử điều chỉnh từ khoá tìm kiếm của bạn."
                : cc.noClassesDesc || "Bạn chưa hoàn thành bất kỳ lớp học nào."
            }
            action={
              searchQuery ? (
                <PillButton
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setPage(1)
                  }}
                  className="mt-2"
                >
                  {cc.clearFilters || "Xóa tìm kiếm"}
                </PillButton>
              ) : null
            }
          />
        </FluentCard>
      )
    }

    return (
      <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300 gap-6">
        {/* Grid Card Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {visibleClasses.map((cls) => {
            const classTitle =
              cls.title || cls.name || cc.untitledClass || "Untitled class"
            const courseTitle = cls.courseName || cls.courseTitle || null
            const isSharingThis = sharingClassId === cls.id

            // Schedule days formatting
            let scheduleDays = UNKNOWN_VALUE
            if (
              Array.isArray(cls.schedule?.days) &&
              cls.schedule.days.length > 0
            ) {
              scheduleDays = formatScheduleDays
                ? formatScheduleDays(cls.schedule.days)
                : cls.schedule.days.join(" - ")
            } else if (Array.isArray(cls.schedule) && cls.schedule.length > 0) {
              const days = cls.schedule.map((s) => s.dayOfWeek).filter(Boolean)
              scheduleDays = formatScheduleDays
                ? formatScheduleDays(days)
                : days.join(" - ")
            }

            // Schedule time formatting
            let scheduleTime = UNKNOWN_VALUE
            if (cls.schedule?.startTime && cls.schedule?.endTime) {
              scheduleTime = `${cls.schedule.startTime} - ${cls.schedule.endTime}`
            } else if (
              Array.isArray(cls.schedule) &&
              cls.schedule.length > 0 &&
              cls.schedule[0]?.startTime &&
              cls.schedule[0]?.endTime
            ) {
              scheduleTime = `${cls.schedule[0].startTime} - ${cls.schedule[0].endTime}`
            }

            const languageLabel = formatLanguageLabel(cls.language, sc)

            const levelLabel =
              Array.isArray(cls.levels) && cls.levels[0]
                ? String(cls.levels[0]).trim().toUpperCase()
                : UNKNOWN_VALUE

            // Progress stats
            const completedSessions =
              cls.progress?.completedSessions ?? cls.completedSessions ?? 0
            const totalSessions =
              cls.progress?.totalSessions ?? cls.totalSessions ?? 0
            const progressPercent =
              totalSessions > 0
                ? Math.min(
                    100,
                    Math.round((completedSessions / totalSessions) * 100),
                  )
                : (cls.progress?.percentage ?? 100)

            // Teacher data
            const teacher = cls.teacher || {}
            const teacherName =
              teacher.name || teacher.fullName || UNKNOWN_VALUE
            const teacherAvatar =
              teacher.avatarImageUrl || teacher.avatarUrl || teacher.avatar
            const teacherId = teacher.accountId || teacher.id || cls.accountId

            // Capacity & Enrolled
            const enrolled =
              cls.enrolledCount ?? cls.studentCount ?? cls.enrolledStudents
            const capacity = cls.capacity ?? cls.slots

            const thumbnail = cls.thumbnailUrl || defaultCourseThumbnail

            return (
              <FluentCard
                key={cls.id}
                className="relative flex flex-col h-full overflow-hidden !p-0"
              >
                {/* 1. Top Cover / Hero Panel */}
                <div className="relative w-full h-44 bg-slate-100 overflow-hidden shrink-0">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={classTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-gray-400 gap-2">
                      <GraduationCap className="w-12 h-12 text-gray-300" />
                      <span className="text-xs font-medium text-gray-400">
                        {languageLabel}
                      </span>
                    </div>
                  )}

                  {/* Top Badges Overlay Bar */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                    {/* Left Badges */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Badge color="cath-red">{languageLabel}</Badge>
                      <Badge color="cath-red">{levelLabel}</Badge>
                    </div>

                    {/* Right Live isShared Badge */}
                    <Badge color="dark">
                      {cls.isShared
                        ? cc.displayed || "Hiển thị"
                        : cc.hidden || "Đã ẩn"}
                    </Badge>
                  </div>
                </div>

                {/* 2. Card Content Panel */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Header Row: Avatar + Title & Teacher */}
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={teacherAvatar}
                        name={teacherName}
                        size={40}
                        accountId={teacherId}
                        clickable={false}
                        className="shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={(e) => {
                          if (teacherId) {
                            e.stopPropagation()
                            navigate(`/profile/${teacherId}`)
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        {/* Class Title */}
                        <h3
                          className="font-bold line-clamp-2"
                          title={classTitle}
                        >
                          {classTitle}
                        </h3>

                        {/* Teacher Name Subtitle */}
                        <span
                          className="text-sm text-secondary line-clamp-1 truncate cursor-pointer hover:underline"
                          title={teacherName}
                          onClick={(e) => {
                            if (teacherId) {
                              e.stopPropagation()
                              navigate(`/profile/${teacherId}`)
                            }
                          }}
                        >
                          {teacherName}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Details: 2 clean lines */}
                    <div className="space-y-1 text-sm text-secondary">
                      {/* Course */}
                      <div className="truncate">
                        <span>{cc.course || "Khóa học"}: </span>
                        <span
                          className="font-medium text-gray-900"
                          title={
                            courseTitle ||
                            cc.standaloneClass ||
                            "Lớp học độc lập"
                          }
                        >
                          {courseTitle ||
                            cc.standaloneClass ||
                            "Lớp học độc lập"}
                        </span>
                      </div>

                      {/* Completed Date */}
                      <div className="truncate">
                        <span>{cc.completedOn || "Ngày hoàn thành"}: </span>
                        <span className="font-medium text-gray-900">
                          {formatDisplayDate(cls?.completedAtUtc, formatDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Bottom Actions Panel */}
                  <div className="flex items-center gap-2">
                    {/* Share Action -> Opens Modal */}
                    <PillButton
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedShareClassId(cls.id)
                      }}
                      className="flex-1"
                    >
                      {cc.share || "Chia sẻ"}
                    </PillButton>

                    {/* Review Action or Reviewed Indicator */}
                    {!cls.isReviewed ? (
                      <PillButton
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/workspace/learning/class/${cls.id}/review`)
                        }}
                        className="flex-1"
                      >
                        {cc.reviewNow || "Đánh giá ngay"}
                      </PillButton>
                    ) : (
                      <PillButton
                        className="flex-1"
                        variant="secondary"
                        disabled
                      >
                        {cc.reviewed || "Đã đánh giá"}
                      </PillButton>
                    )}
                  </div>
                </div>
              </FluentCard>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center w-full">
            <Pagination
              page={boundedPage}
              totalPages={totalPages}
              onChangePage={setPage}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div>{renderContent()}</div>

      {/* Share Modal */}
      <ShareCompletedClassModal
        open={Boolean(activeShareClass)}
        onClose={() => setSelectedShareClassId(null)}
        classItem={activeShareClass}
      />
    </>
  )
}

export default CompletedClass
