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
import { copyShareLink } from "@/shared/utils/shareUtils"
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

  const handleShare = async (e, cls) => {
    e.preventDefault()
    e.stopPropagation()

    const classId = cls.id
    if (!classId) return

    try {
      setSharingClassId(classId)

      // 1. Call PUT /api/student/classes/{classId}/share
      await shareStudentClass({
        classId,
        isShared: true,
      }).unwrap()

      // 2. Trigger native share or copy link
      const classUrl = `${window.location.origin}/explore-courses/class/${classId}`
      const classTitle = cls.title || cls.name || "CatSpeak"
      const shareText = `Tôi đã hoàn thành lớp học "${classTitle}" trên CatSpeak!`

      if (navigator.share) {
        try {
          await navigator.share({
            title: classTitle,
            text: shareText,
            url: classUrl,
          })
          return
        } catch (err) {
          if (err.name === "AbortError") return
        }
      }

      await copyShareLink({
        url: classUrl,
        successMessage:
          cc.shareSuccess ||
          "Đã chia sẻ và sao chép liên kết chứng nhận hoàn thành lớp học!",
        errorMessage: cc.shareError || "Không thể chia sẻ lớp học",
      })
    } catch (err) {
      console.error("Failed to share completed class:", err)
      const classUrl = `${window.location.origin}/explore-courses/class/${classId}`
      await copyShareLink({
        url: classUrl,
        successMessage:
          cc.shareSuccess ||
          "Đã sao chép liên kết chứng nhận hoàn thành lớp học!",
        errorMessage: cc.shareError || "Không thể chia sẻ lớp học",
      })
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
                className="group relative flex flex-col h-full overflow-hidden border border-border bg-white hover:bg-gray-50/75 transition-colors duration-200 rounded-2xl !p-0"
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

                  {/* Top-left Badges overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                    <Badge color="cath-red">{languageLabel}</Badge>
                    <Badge color="cath-red">{levelLabel}</Badge>
                  </div>
                </div>

                {/* 2. Card Content Panel */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Course Subtitle (if part of a course) */}
                    {courseTitle && (
                      <div className="flex items-center gap-1.5 text-xs text-purple-700 font-medium">
                        <BookOpen
                          size={13}
                          className="shrink-0 text-purple-600"
                        />
                        <span className="truncate">{courseTitle}</span>
                      </div>
                    )}

                    {/* Class Title */}
                    <h3 className="font-bold line-clamp-2" title={classTitle}>
                      {classTitle}
                    </h3>

                    {/* Teacher Row */}
                    <div
                      className="flex items-center gap-2 pt-0.5 text-xs text-gray-600 cursor-pointer w-fit"
                      onClick={(e) => {
                        if (teacherId) {
                          e.stopPropagation()
                          navigate(`/profile/${teacherId}`)
                        }
                      }}
                    >
                      <Avatar
                        src={teacherAvatar}
                        name={teacherName}
                        size={24}
                        accountId={teacherId}
                        clickable={false}
                        className="shrink-0"
                      />
                      <span className="hover:text-gray-900 transition-colors truncate">
                        <span className="text-gray-400 font-normal">
                          {cc.teacher || "Giảng viên"}:
                        </span>{" "}
                        <strong className="font-medium text-gray-800 hover:underline">
                          {teacherName}
                        </strong>
                      </span>
                      {typeof teacher.rating === "number" &&
                        teacher.rating > 0 && (
                          <div className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            <Star
                              size={10}
                              className="fill-amber-500 text-amber-500"
                            />
                            <span>{teacher.rating.toFixed(1)}</span>
                          </div>
                        )}
                    </div>

                    {/* Schedule & Metadata List */}
                    <div className="space-y-1.5 pt-2 text-xs text-gray-500 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400 shrink-0" />
                        <span className="truncate">
                          {scheduleDays}{" "}
                          {scheduleTime !== UNKNOWN_VALUE
                            ? `• ${scheduleTime}`
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="truncate">
                          {formatDisplayDate(cls.startDate, formatDate)} -{" "}
                          {formatDisplayDate(cls.endDate, formatDate)}
                        </span>
                      </div>

                      {enrolled != null && (
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400 shrink-0" />
                          <span>
                            {capacity ? `${enrolled}/${capacity}` : enrolled}{" "}
                            {cc.students || "học viên"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar & Attendance */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-600 font-medium flex items-center gap-1">
                          <Sparkles size={12} className="text-cath-red-600" />
                          {cc.progress || "Tiến độ"}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          {completedSessions}/{totalSessions}{" "}
                          {cc.sessions || "buổi"} ({progressPercent}%)
                        </span>
                      </div>
                      <ProgressBar
                        progress={progressPercent}
                        heightClass="h-1.5"
                        colorClass="bg-cath-red-700"
                        trackColorClass="bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* 3. Bottom Actions Panel (No duplication) */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {/* Single Share Action */}
                    <PillButton
                      variant="secondary"
                      onClick={(e) => handleShare(e, cls)}
                      loading={isSharingThis}
                      className="!h-9 flex-1 text-xs"
                      startIcon={<Share2 size={13} />}
                    >
                      {cls.isShared
                        ? cc.shared || "Đã chia sẻ"
                        : cc.share || "Chia sẻ"}
                    </PillButton>

                    {/* Review Action or Reviewed Indicator */}
                    {!cls.isReviewed ? (
                      <PillButton
                        variant="primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/workspace/learning/class/${cls.id}/review`)
                        }}
                        className="!h-9 flex-1 text-xs"
                        startIcon={
                          <Star
                            size={13}
                            className="text-white fill-amber-400"
                          />
                        }
                      >
                        {cc.reviewNow || "Đánh giá ngay"}
                      </PillButton>
                    ) : (
                      <PillButton
                        variant="secondary"
                        disabled
                        className="!h-9 flex-1 text-xs opacity-75 cursor-default"
                        startIcon={
                          <CheckCircle2 size={13} className="text-emerald-600" />
                        }
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
    <div className="w-full flex flex-col gap-5 min-h-[500px]">
      {/* Clean Search Bar */}
      {isOwnProfile && (
        <div className="flex justify-end w-full">
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setPage(1)
            }}
            placeholder={
              cc.searchPlaceholder || "Tìm kiếm theo tên lớp, khóa học..."
            }
            className="w-full sm:w-[320px]"
          />
        </div>
      )}

      {/* Grid Content */}
      <div className="w-full">{renderContent()}</div>
    </div>
  )
}

export default CompletedClass
