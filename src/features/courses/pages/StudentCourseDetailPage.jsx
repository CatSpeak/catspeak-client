import React, { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetStudentCourseDetailQuery,
  useGetExploreCourseDetailQuery,
  // useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import RenderHTML from "@/shared/components/ui/RenderHTML"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import {
  formatCurrencyVND,
  getSafeMediaUrl,
  defaultCourseThumbnail,
  getClassEnrollmentIssue,
} from "../utils/courseUtils"
import { copyShareLink } from "@/shared/utils/shareUtils"
import { getLocalizedLanguageName } from "../data/courseFormOptions"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { Calendar, Clock, Mail, CheckCircle2, BookOpen, FileText, Globe, User, Radio, Users, Video, ChevronDown, ChevronUp, GraduationCap, Share2, Check, AlertTriangle } from "lucide-react"
import useRoleOverride from "../components/RoleSwitcher"

const StudentCourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isStudent } = useRoleOverride()
  const { t } = useLanguage()
  const { formatDateMonth, formatScheduleTime, formatScheduleDays } = useTimezone()
  const c = t.courses || {}
  const scd = c.studentCourseDetail || {}
  const sc = c.student || {}
  const ui = c.workspaceUi || {}
  const { isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)

  const isExploreRoute = window.location.pathname.includes("/explore-courses")
  const isWorkspace = window.location.pathname.startsWith("/workspace")
  const exploreHomePath = isWorkspace ? "/workspace/explore-courses" : "/explore-courses"

  // Fetch course details (Use public explore endpoint on explore route)
  const exploreQuery = useGetExploreCourseDetailQuery(id, { skip: !id || !isExploreRoute })
  const studentQuery = useGetStudentCourseDetailQuery(id, { skip: !id || isExploreRoute })

  const courseDetail = isExploreRoute
    ? exploreQuery.currentData
    : (studentQuery.currentData || exploreQuery.currentData)

  const isLoading = isExploreRoute ? exploreQuery.isLoading : studentQuery.isLoading
  const isFetching = isExploreRoute ? exploreQuery.isFetching : studentQuery.isFetching
  const error = isExploreRoute ? exploreQuery.error : studentQuery.error
  const refetch = isExploreRoute ? exploreQuery.refetch : studentQuery.refetch

  // State
  const [expandedClassIds, setExpandedClassIds] = useState({})
  const [linkCopied, setLinkCopied] = useState(false)
  const [conflictClasses, setConflictClasses] = useState(null)
  const [enrollingClassId, setEnrollingClassId] = useState(null)

  // const [enrollInCourse] = useEnrollInCourseMutation()
  const [createPrivateConversation] = useCreatePrivateConversationMutation()

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/explore-courses/details/${id}`
    const ok = await copyShareLink({
      url: shareUrl,
      successMessage: scd.linkCopied || "Link copied!",
      errorMessage: scd.linkCopyFailed || "Failed to copy link",
    })
    if (ok) {
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  // const doEnroll = async (classId, courseId, confirmScheduleConflict = false) => {
  const doEnroll = async (classId) => {
    setEnrollingClassId(classId)
    // try {
    //   const result = await enrollInCourse({ classId, confirmScheduleConflict }).unwrap()
    //   const resultPayload = (
    //     result
    //     && typeof result === "object"
    //     && !Array.isArray(result)
    //     && Object.prototype.hasOwnProperty.call(result, "data")
    //   )
    //     ? result.data
    //     : result

    //   if (resultPayload?.checkoutUrl) {
    //     const checkoutUrl = getSafeMediaUrl(resultPayload.checkoutUrl)
    //     if (!checkoutUrl) throw new Error("Invalid checkout URL")
    //     toast.success(sc.enrollRedirecting || "Đang chuyển hướng đến trang thanh toán...")
    //     window.location.assign(checkoutUrl)
    //   } else {
    //     toast.success(sc.enrollSuccess || "Đăng ký lớp học thành công!")
    //     refetch()
    //   }
    // } catch (err) {
    //   const status = err?.status ?? err?.originalStatus
    //   const errorCode = err?.data?.errorCode || err?.data?.data?.errorCode
    //   if (status === 409 || errorCode === "CLASS_ENROLLMENT_SCHEDULE_CONFLICT") {
    //     const message = err?.data?.message || err?.data?.data?.message || ""
    //     const names = (message.match(/Lịch học trùng với lớp: (.+)/) || [])[1]
    //     setConflictClasses({
    //       classId,
    //       courseId,
    //       names: names ? names.split(", ").filter(Boolean) : [],
    //     })
    //     return
    //   }
    //   toast.error(err?.data?.message || err?.data?.data?.message || sc.enrollError || "Đăng ký không thành công. Vui lòng thử lại sau.")
    // } finally {
    //   setEnrollingClassId(null)
    // }
    const basePath = isWorkspace ? "/workspace" : ""
    navigate(`${basePath}/explore-courses/class/${classId}/checkout`)
  }

  const handleClassRegister = (cls) => {
    if (isAuthenticated) {
      doEnroll(cls.id, cls.courseId || courseDetail?.id)
    } else if (authModalCtx?.openAuthModal) {
      authModalCtx.openAuthModal("login", window.location.pathname)
    } else {
      toast.error(sc.loginToEnroll || "Vui lòng đăng nhập để đăng ký lớp học.")
    }
  }

  const getClassButton = (cls) => {
    if (cls.enrolledInCourse) {
      return { key: "in_course", label: sc.alreadyEnrolledInCourse || "Đã đăng ký khóa này", disabled: true }
    }

    const issue = getClassEnrollmentIssue({ classData: cls })
    if (issue === "full") return { key: "full", label: sc.classFull || "Đã đủ học viên", disabled: true }
    if (issue === "closed") return { key: "closed", label: sc.enrollmentClosed || "Đã đóng đăng ký", disabled: true }
    if (issue === "upcoming") return { key: "upcoming", label: sc.upcomingStatus || "Chưa mở đăng ký", disabled: true }
    if (issue === "unavailable") return { key: "unavailable", label: sc.enrollmentUnavailable || "Chưa mở đăng ký", disabled: true }

    return { key: "open", label: sc.register || "Đăng ký", disabled: false }
  }

  const isRecord = (value) => (
    value !== null
    && typeof value === "object"
    && !Array.isArray(value)
  )
  const rawCourse = isRecord(courseDetail) && courseDetail.id
    ? courseDetail
    : null
  const classes = Array.isArray(rawCourse?.classes)
    ? rawCourse.classes.filter((cls) => isRecord(cls) && cls.id)
    : []
  const teacher = isRecord(rawCourse?.teacher) ? rawCourse.teacher : {}

  const { data: profileResponse } = useGetUserProfileQuery(undefined, { skip: !isWorkspace })
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = (profile.accountId ?? profile.id ?? "").toString()

  const isOwner = Boolean(
    currentUserId
    && [
      rawCourse?.teacherId,
      rawCourse?.instructorId,
      teacher?.id,
    ].some((ownerId) => ownerId != null && String(ownerId) === currentUserId)
  )

  useEffect(() => {
    // Only redirect if they are the owner AND they are currently in Teacher mode.
    if (isOwner && id && isWorkspace && !isStudent) {
      navigate(`/workspace/courses/details/${id}${window.location.search}`, { replace: true })
    }
  }, [isOwner, id, isWorkspace, navigate, isStudent])

  const toggleClassExpand = (classId) => {
    setExpandedClassIds((prev) => ({
      ...prev,
      [classId]: !prev[classId]
    }))
  }

  if (isLoading || (isFetching && courseDetail === undefined)) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error || (courseDetail !== undefined && !rawCourse)) {
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3"
      >
        <span>{scd.courseLoadFailed || "This course could not be loaded. Please try again."}</span>
        <button
          type="button"
          onClick={refetch}
          className="rounded-full bg-[#990011] px-4 py-2 text-xs font-black text-white"
        >
          {scd.retry || "Try again"}
        </button>
      </div>
    )
  }

  if (!rawCourse) {
    return (
      <div role="status" className="p-8 text-center text-sm font-semibold text-gray-500">
        {scd.courseUnavailable || "Course details are unavailable."}
      </div>
    )
  }

  // Data helpers
  const languageLabel =
    getLocalizedLanguageName(rawCourse.language, t) || rawCourse.language || "—"
  const thumbnailUrl = getSafeMediaUrl(rawCourse.thumbnailUrl)
  const teacherAvatarUrl = getSafeMediaUrl(teacher.avatarImageUrl)

  return (
    <div className={`flex flex-col gap-6 text-[#2e2e2e] ${isWorkspace ? "" : "p-4 sm:p-6"}`}>
      {isFetching && (
        <span className="sr-only" role="status">
          {scd.refreshing || "Refreshing course details"}
        </span>
      )}

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          {
            label: t.nav?.home || "Home",
            onClick: () => navigate(isExploreRoute ? exploreHomePath : "/workspace"),
          },
          {
            label: isExploreRoute ? (t.nav?.exploreCourses || "Explore Courses") : (c.student?.dashboardTitle || "My Learning"),
            onClick: () => navigate(isExploreRoute ? exploreHomePath : "/workspace/learning"),
          },
          {
            label: rawCourse.title,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* ─── 1. Course Header Block inside Left Column ─── */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-5 relative">
            {/* Share Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title={scd.shareCourse || "Share course"}
              className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all active:scale-90 cursor-pointer"
            >
              {linkCopied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
            </button>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight pr-12">
              {rawCourse.title}
            </h1>

            {/* Side-by-side 50/50: Description (Left) + Thumbnail (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-1">
              {rawCourse.description && (
                <RenderHTML
                  html={rawCourse.description}
                  className="text-sm sm:text-sm md:text-base text-gray-600 font-medium leading-relaxed"
                />
              )}

              <div className="w-full">
                <img
                  src={thumbnailUrl || defaultCourseThumbnail}
                  alt={rawCourse.title || ""}
                  className="w-full h-52 sm:h-60 object-cover rounded-2xl border border-border shadow-2xs block"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* ─── 2. Overview Specifications 6-Grid ─── */}
          <div className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6">
            <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              <BookOpen size={20} className="text-[#990011]" />
              <span>{c.student?.overview || "Overview"}</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-border">
                <Radio size={18} className="text-[#990011] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.liveGroupClass || "Live Group Class"}</span>
                  <span className="text-sm font-black text-gray-950">{c.student?.liveGroupClassDesc || "Meet over live video meetings"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-border">
                <Calendar size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.totalClasses || "Total Classes"}</span>
                  <span className="text-sm font-black text-gray-950">{classes.length} {c.student?.classesText || "classes"}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-gray-50/80 rounded-2xl border border-border">
                <Globe size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[12px] text-gray-400 font-bold uppercase">{c.student?.languageLabel || "Language"}</span>
                  <span className="text-sm font-black text-gray-950">{languageLabel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── 4. Available Classes ─── */}
          <div id="schedule-section" className="bg-white rounded-3xl border border-border p-6 shadow-xs flex flex-col gap-6 scroll-mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                  <Calendar size={20} className="text-[#990011]" />
                  <span>{c.student?.availableClasses || "Available Classes"}</span>
                </h2>
                <p className="text-sm text-gray-400 font-semibold mt-0.5">{c.student?.selectClassDesc || "Select a class that best fits your daily schedule."}</p>
              </div>
            </div>

            {classes.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border border-border p-10 text-center text-gray-400 font-bold flex flex-col items-center justify-center">
                <span className="text-gray-800 text-base mb-1">{c.student?.noClassesTitle || "No Classes Available Yet"}</span>
                <span className="text-sm font-semibold max-w-[280px]">{c.student?.noClassesDesc || "New class sessions will be scheduled soon. Please check back later."}</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {classes.map((cls) => {
                  const isClassEnrolled = Boolean(cls.isEnrolled)
                  const isExpanded = !!expandedClassIds[cls.id]
                  const classButton = getClassButton(cls)
                  const enrolledSeats = cls.studentCount ?? cls.enrolledStudents ?? null
                  const totalSlots = cls.slots ?? cls.capacity ?? null
                  const remainingSlots =
                    cls.remainingSlots != null
                      ? Number(cls.remainingSlots)
                      : totalSlots != null && enrolledSeats != null
                        ? Math.max(0, Number(totalSlots) - Number(enrolledSeats))
                        : null
                  const tuitionLabel =
                    cls.tuitionFee == null
                      ? ui.tba || "TBA"
                      : Number(cls.tuitionFee) === 0
                        ? sc.priceFree || "Miễn phí"
                        : formatCurrencyVND(cls.tuitionFee)
                  const levelsText =
                    Array.isArray(cls.levels) && cls.levels.length > 0
                      ? cls.levels.join(", ")
                      : cls.level || rawCourse?.level || "—"
                  const classThumbnailUrl = getSafeMediaUrl(
                    cls?.thumbnailUrl ||
                    cls?.thumbnail ||
                    rawCourse?.thumbnailUrl,
                  )

                  return (
                    <div
                      key={cls.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${isClassEnrolled
                        ? "border-green-300 ring-2 ring-green-50/60"
                        : isExpanded
                          ? "border-[#990011]/30 shadow-md ring-2 ring-red-50/40"
                          : "border-border hover:border-gray-300 hover:shadow-2xs"
                        }`}
                    >
                      {/* Accordion Header */}
                      <div className="p-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 select-none bg-white">
                        <div className="flex-1 flex items-start sm:items-center gap-4 min-w-0">
                          {/* Class Thumbnail Image on Left */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              const classPath = isClassEnrolled
                                ? `/workspace/learning/class/${encodeURIComponent(String(cls.id))}`
                                : `/explore-courses/class/${encodeURIComponent(String(cls.id))}`
                              navigate(classPath)
                            }}
                            className="w-28 h-16 sm:w-36 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-border shrink-0 cursor-pointer group/thumb relative shadow-2xs"
                            title="Xem chi tiết lớp học"
                          >
                            <img
                              src={classThumbnailUrl || defaultCourseThumbnail}
                              alt={cls.title || "Class thumbnail"}
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Class Main Information */}
                          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                            {/* Prominent Primary Class Title */}
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const classPath = isClassEnrolled
                                    ? `/workspace/learning/class/${encodeURIComponent(String(cls.id))}`
                                    : `/explore-courses/class/${encodeURIComponent(String(cls.id))}`
                                  navigate(classPath)
                                }}
                                className="font-black text-lg sm:text-xl text-gray-950 hover:text-[#b20a1c] transition-colors leading-snug cursor-pointer flex items-center gap-1.5 group/title"
                                title="Xem chi tiết lớp học"
                              >
                                <span className="group-hover/title:underline">{cls.title}</span>
                              </h3>

                              {isClassEnrolled && (
                                <span className="bg-green-100 text-green-700 font-bold text-[12px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 size={10} />
                                  <span>{c.student?.enrolled || "Enrolled"}</span>
                                </span>
                              )}
                            </div>

                            {/* Subtitle / Schedule Badge & Dates */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm font-semibold text-gray-500">
                              {(cls.schedule?.days || (cls.schedule?.startTime && cls.schedule?.endTime)) && (
                                <div className="flex items-center gap-1.5 bg-red-50 text-[#b20a1c] px-2.5 py-0.5 rounded-md border border-red-100/70 font-black text-xs">
                                  <Clock size={12} className="shrink-0" />
                                  <span>
                                    {formatScheduleDays(
                                      cls.schedule?.days,
                                      ui.tba,
                                      " - ",
                                      cls.schedule?.startTime,
                                    )}
                                    {cls.schedule?.startTime && cls.schedule?.endTime
                                      ? ` | ${formatScheduleTime(cls.schedule.startTime, cls.startDate)} - ${formatScheduleTime(cls.schedule.endTime, cls.startDate)}`
                                      : ""}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-gray-400 shrink-0" />
                                <span>
                                  {cls.startDate && cls.endDate
                                    ? `${formatDateMonth(cls.startDate, ui.tba, cls.schedule?.startTime)} – ${formatDateMonth(cls.endDate, ui.tba, cls.schedule?.startTime)}`
                                    : cls.startDate
                                      ? `${c.student?.startsOn || "Starts"} ${formatDateMonth(cls.startDate, ui.tba, cls.schedule?.startTime)}`
                                      : ui.tba || "TBA"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-center sm:items-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-border shrink-0">
                          <div className="flex flex-col sm:items-end">
                            <span className="text-[12px] text-gray-400 font-bold uppercase tracking-wider">{c.student?.tuitionFee || "Tuition Fee"}</span>
                            <span className="text-gray-950 font-black text-base">{tuitionLabel}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isClassEnrolled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/workspace/learning/class/${encodeURIComponent(String(cls.id))}`)
                                }}
                                className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-black rounded-full transition-all active:scale-95 shadow-2xs"
                              >
                                {c.student?.goToWorkspace || "Go to Workspace →"}
                              </button>
                            )}

                            {!isClassEnrolled && (
                              <button
                                type="button"
                                disabled={classButton.disabled || enrollingClassId === cls.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleClassRegister(cls)
                                }}
                                className={`h-8 px-4 text-sm font-black rounded-full transition-all shadow-2xs ${classButton.key === "open"
                                  ? "bg-[#b20a1c] hover:bg-[#960817] text-white active:scale-95 cursor-pointer"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                              >
                                {enrollingClassId === cls.id
                                  ? (sc.processing || "Đang xử lý...")
                                  : classButton.label}
                              </button>
                            )}

                            {/* Expand/Collapse Accordion Button with Primary Text Styling */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleClassExpand(cls.id)
                              }}
                              aria-expanded={isExpanded}
                              className="h-8 px-2 flex items-center gap-1 text-sm font-black text-[#b20a1c] hover:text-[#990011] transition-colors cursor-pointer shrink-0"
                            >
                              <span>{isExpanded ? "Thu gọn" : "Chi tiết"}</span>
                              {isExpanded ? <ChevronUp size={15} className="text-[#b20a1c]" /> : <ChevronDown size={15} className="text-[#b20a1c]" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Panel */}
                      {isExpanded && (
                        <div id={`class-details-${cls.id}`} className="bg-gray-50/70 border-t border-border p-5 flex flex-col gap-4 text-sm animate-fadeIn">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-white rounded-xl p-3 border border-border flex items-start gap-2.5">
                              <Users size={18} className="text-[#990011] shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.remainingSlots || "Remaining Slots"}</span>
                                <span className="text-gray-950 font-black text-sm">
                                  {remainingSlots ?? "N/A"} / {totalSlots ?? "N/A"}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-border flex items-start gap-2.5">
                              <GraduationCap size={18} className="text-amber-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.levelLabel || "Trình độ"}</span>
                                <span className="text-gray-950 font-black text-sm">
                                  {levelsText}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-border flex items-start gap-2.5">
                              <Calendar size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">
                                  {c.student?.enrollmentPeriod || "Registration Period"}
                                </span>
                                <span className="text-gray-950 font-black text-sm truncate">
                                  {cls.enrollmentStart && cls.enrollmentEnd
                                    ? `${formatDateMonth(cls.enrollmentStart, ui.tba)} – ${formatDateMonth(cls.enrollmentEnd, ui.tba)}`
                                    : cls.enrollmentStart
                                      ? `${c.student?.startsOn || "From"} ${formatDateMonth(cls.enrollmentStart, ui.tba)}`
                                      : cls.enrollmentEnd
                                        ? `${c.student?.endsUntil || "Until"} ${formatDateMonth(cls.enrollmentEnd, ui.tba)}`
                                        : ui.tba || "TBA"}
                                </span>
                              </div>
                            </div>

                            <div className="bg-white rounded-xl p-3 border border-border flex items-start gap-2.5">
                              <Video size={18} className="text-blue-600 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-gray-400 font-bold text-[12px] uppercase">{c.student?.virtualClassroom || "Virtual Classroom"}</span>
                                <span className="text-gray-950 font-black text-sm truncate">{cls.roomName || c.student?.onlineClassroom || "Online Classroom"}</span>
                              </div>
                            </div>
                          </div>

                          {cls.rawSchedule && cls.rawSchedule.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-gray-700 text-[11px]">{c.student?.weeklySchedule || "Weekly Schedule:"}</span>
                              <div className="flex flex-wrap gap-2">
                                {cls.rawSchedule.map((s, idx) => (
                                  <span key={idx} className="bg-white border border-border text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold">
                                    <strong className="text-gray-950">
                                      {formatScheduleDays(
                                        [s.dayOfWeek],
                                        ui.tba,
                                        " - ",
                                        s.startTime,
                                      )}:
                                    </strong>{" "}
                                    {formatScheduleTime(s.startTime)} - {formatScheduleTime(s.endTime)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Always-Visible Class Description */}
                          <div className="bg-white rounded-xl p-3.5 border border-border flex flex-col gap-1">
                            <span className="font-bold text-gray-950 text-sm flex items-center gap-1">
                              <FileText size={13} className="text-[#990011]" />
                              <span>{c.student?.description || "Description"}</span>
                            </span>
                            <RenderHTML
                              html={cls.description}
                              className="text-gray-600 font-medium text-sm leading-relaxed"
                              fallback={<span className="text-gray-600 font-medium text-sm leading-relaxed">{scd.noClassDescription || "No description provided."}</span>}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* ─── MEET THE TEACHER CARD (Right Sidebar Column) ─── */}
          <div className="bg-white rounded-3xl border border-border p-6 flex flex-col gap-5">
            <h2 className="text-lg font-black text-gray-950 tracking-tight flex items-center gap-2 border-b border-border pb-3">
              <User size={18} className="text-[#990011]" />
              <span>{c.student?.meetInstructor || "Meet the Instructor"}</span>
            </h2>

            <div className="flex items-center gap-3.5">
              {teacherAvatarUrl ? (
                <img
                  className="w-14 h-14 rounded-full object-cover border border-border shadow-2xs shrink-0"
                  src={teacherAvatarUrl}
                  alt={teacher.name || ""}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-red-100 text-[#990011] flex items-center justify-center font-black text-xl border border-red-200 shadow-2xs shrink-0">
                  {(teacher.name || "T")[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-black text-gray-950 text-base truncate">
                  {teacher.name || scd.instructorUnavailable || "Instructor not provided"}
                </h3>
                {teacher.title && (
                  <span className="text-[12px] text-[#b20a1c] font-bold uppercase truncate">
                    {teacher.title}
                  </span>
                )}
              </div>
            </div>

            {teacher.introduction && (
              <div className="flex flex-col gap-1.5">
                <h4 className="font-extrabold text-sm text-gray-950 tracking-wider">{c.student?.aboutMe || "About Me"}</h4>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  {teacher.introduction}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const teacherId = teacher.accountId || teacher.id
                  if (teacherId) {
                    navigate(`/workspace/instructor/${encodeURIComponent(String(teacherId))}`)
                  }
                }}
                disabled={!teacher.accountId && !teacher.id}
                className="flex-1 h-10 border border-border hover:bg-gray-50 text-gray-800 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <User size={14} />
                <span>{c.student?.profile || "Profile"}</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!isAuthenticated) {
                    if (authModalCtx?.openAuthModal) {
                      authModalCtx.openAuthModal("login", window.location.pathname)
                    }
                    return
                  }
                  const teacherId = teacher.accountId || teacher.id
                  if (!teacherId) return
                  try {
                    const conversation = await createPrivateConversation(teacherId).unwrap()
                    const convId = conversation?.id ?? conversation?.conversationId ?? conversation?.data?.id
                    if (convId) {
                      navigate(`/chat/${encodeURIComponent(String(convId))}`)
                    } else {
                      toast.error(scd.chatOpenFailed || "Không thể mở hộp thoại.")
                    }
                  } catch {
                    toast.error(scd.chatOpenFailed || "Không thể mở hộp thoại.")
                  }
                }}
                disabled={!teacher.accountId && !teacher.id}
                className="flex-1 h-10 border border-border hover:bg-gray-50 text-gray-800 text-sm font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Mail size={14} />
                <span>{c.student?.contactInstructor || "Nhắn tin"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {conflictClasses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={22} className="text-amber-500 shrink-0" />
              <h2 className="text-lg font-black text-gray-950">{scd.scheduleConflictTitle || "Lịch học bị trùng"}</h2>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {scd.scheduleConflictDesc || "Lịch học của lớp này trùng với lớp bạn đang học:"}
            </p>
            {(conflictClasses.names || []).length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {conflictClasses.names.map((name) => (
                  <li key={name} className="text-sm font-bold text-[#b20a1c] bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    {name}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConflictClasses(null)}
                className="h-10 px-4 rounded-full border border-border text-gray-700 text-sm font-black hover:bg-gray-50"
              >
                {scd.cancel || "Hủy"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = conflictClasses
                  setConflictClasses(null)
                  doEnroll(target.classId, target.courseId, true)
                }}
                className="h-10 px-4 rounded-full bg-[#b20a1c] hover:bg-[#960817] text-white text-sm font-black"
              >
                {scd.confirmEnroll || "Vẫn đăng ký"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentCourseDetailPage
