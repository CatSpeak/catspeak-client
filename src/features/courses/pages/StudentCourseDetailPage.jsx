import React, { useState, useEffect, useContext, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import {
  useGetStudentCourseDetailQuery,
  useGetExploreCourseDetailQuery,
} from "@/store/api/coursesApi"
import { useCreatePrivateConversationMutation } from "@/store/api/social/conversationsApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
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
import { AlertTriangle } from "lucide-react"
import useRoleOverride from "../components/RoleSwitcher"

import GeneralSection from "./StudentCourseDetailPageElement/GeneralSection"
import TeacherInforCard from "./StudentCourseDetailPageElement/TeacherInforCard"
import CourseTab from "./StudentCourseDetailPageElement/CourseTab"

const StudentCourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isStudent } = useRoleOverride()
  const { t, language } = useLanguage()
  const {
    formatDate,
    formatScheduleTime,
    formatScheduleDays,
  } = useTimezone()
  const c = t.courses || {}
  const scd = c.studentCourseDetail || {}
  const sc = c.student || {}
  const ui = c.workspaceUi || {}
  const { isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)

  const isExploreRoute = window.location.pathname.includes("/explore-courses")
  const isWorkspace = window.location.pathname.startsWith("/workspace")
  const exploreHomePath = isWorkspace
    ? "/workspace/explore-courses"
    : "/explore-courses"

  // Fetch course details (Use public explore endpoint on explore route)
  const exploreQuery = useGetExploreCourseDetailQuery(id, {
    skip: !id || !isExploreRoute,
  })
  const studentQuery = useGetStudentCourseDetailQuery(id, {
    skip: !id || isExploreRoute,
  })

  const courseDetail = isExploreRoute
    ? exploreQuery.currentData
    : studentQuery.currentData || exploreQuery.currentData

  const isLoading = isExploreRoute
    ? exploreQuery.isLoading
    : studentQuery.isLoading
  const isFetching = isExploreRoute
    ? exploreQuery.isFetching
    : studentQuery.isFetching
  const error = isExploreRoute ? exploreQuery.error : studentQuery.error
  const refetch = isExploreRoute ? exploreQuery.refetch : studentQuery.refetch

  // State
  const [expandedClassIds, setExpandedClassIds] = useState({})
  const [linkCopied, setLinkCopied] = useState(false)
  const [conflictClasses, setConflictClasses] = useState(null)
  const [enrollingClassId, setEnrollingClassId] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

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

  const doEnroll = async (classId) => {
    setEnrollingClassId(classId)
    const basePath = isWorkspace ? "/workspace" : ""
    navigate(`${basePath}/explore-courses/class/${classId}/checkout`)
  }

  const handleClassRegister = (cls) => {
    if (isAuthenticated) {
      doEnroll(cls.id, cls.courseId || courseDetail?.id)
    } else if (authModalCtx?.openAuthModal) {
      authModalCtx.openAuthModal("login", window.location.pathname)
    } else {
      toast.error(scd.loginToEnroll || sc.loginToEnroll || "Vui lòng đăng nhập để đăng ký lớp học.")
    }
  }

  const getClassButton = (cls) => {
    if (cls.enrolledInCourse) {
      return {
        key: "in_course",
        label: scd.alreadyEnrolledInCourse || sc.alreadyEnrolledInCourse || "Đã đăng ký khóa này",
        disabled: true,
      }
    }

    const issue = getClassEnrollmentIssue({ classData: cls })
    if (issue === "full")
      return {
        key: "full",
        label: scd.classFull || sc.classFull || "Đã đủ học viên",
        disabled: true,
      }
    if (issue === "closed")
      return {
        key: "closed",
        label: scd.enrollmentClosed || sc.enrollmentClosed || "Đã đóng đăng ký",
        disabled: true,
      }
    if (issue === "upcoming")
      return {
        key: "upcoming",
        label: scd.upcomingStatus || sc.upcomingStatus || "Chưa mở đăng ký",
        disabled: true,
      }
    if (issue === "unavailable")
      return {
        key: "unavailable",
        label: scd.enrollmentUnavailable || sc.enrollmentUnavailable || "Chưa mở đăng ký",
        disabled: true,
      }

    return { key: "open", label: scd.register || sc.register || "Đăng ký", disabled: false }
  }

  const isRecord = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value)
  const rawCourse =
    isRecord(courseDetail) && courseDetail.id ? courseDetail : null
  const classes = Array.isArray(rawCourse?.classes)
    ? rawCourse.classes.filter((cls) => isRecord(cls) && cls.id)
    : []
  const teacher = isRecord(rawCourse?.teacher) ? rawCourse.teacher : {}

  const upcomingClasses = useMemo(() => {
    return classes.filter((cls) => {
      const issue = getClassEnrollmentIssue({ classData: cls })
      return issue === "upcoming" || cls.status?.toUpperCase() === "UPCOMING"
    })
  }, [classes])

  const closedClasses = useMemo(() => {
    return classes.filter((cls) => {
      const issue = getClassEnrollmentIssue({ classData: cls })
      return (
        issue === "closed" ||
        ["CLOSED", "ARCHIVED", "COMPLETED", "CANCELLED"].includes(
          cls.status?.toUpperCase(),
        )
      )
    })
  }, [classes])

  const displayedClasses = useMemo(() => {
    if (activeTab === "upcoming") return upcomingClasses
    if (activeTab === "closed") return closedClasses
    return classes
  }, [activeTab, classes, upcomingClasses, closedClasses])

  const courseDetailTabs = useMemo(() => [
    { value: "overview", label: scd.tabOverview || "Tổng quan" },
    {
      value: "all",
      label: (scd.tabAllClasses || "Các lớp học hiện có ({{count}})").replace("{{count}}", String(classes.length)),
    },
    {
      value: "upcoming",
      label: (scd.tabUpcomingClasses || "Chưa mở đăng ký ({{count}})").replace("{{count}}", String(upcomingClasses.length)),
    },
    {
      value: "closed",
      label: (scd.tabClosedClasses || "Đã đóng đăng ký ({{count}})").replace("{{count}}", String(closedClasses.length)),
    },
  ], [scd, classes.length, upcomingClasses.length, closedClasses.length])

  const { data: profileResponse } = useGetUserProfileQuery(undefined, {
    skip: !isWorkspace,
  })
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = (profile.accountId ?? profile.id ?? "").toString()

  const isOwner = Boolean(
    currentUserId &&
    [rawCourse?.teacherId, rawCourse?.instructorId, teacher?.id].some(
      (ownerId) => ownerId != null && String(ownerId) === currentUserId,
    ),
  )

  useEffect(() => {
    // Only redirect if they are the owner AND they are currently in Teacher mode.
    if (isOwner && id && isWorkspace && !isStudent) {
      navigate(`/workspace/courses/details/${id}${window.location.search}`, {
        replace: true,
      })
    }
  }, [isOwner, id, isWorkspace, navigate, isStudent])

  const toggleClassExpand = (classId) => {
    setExpandedClassIds((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }))
  }

  const handleContactTeacher = async () => {
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
      const convId =
        conversation?.id ??
        conversation?.conversationId ??
        conversation?.data?.id
      if (convId) {
        navigate(`/chat/${encodeURIComponent(String(convId))}`)
      } else {
        toast.error(scd.chatOpenFailed || "Không thể mở hộp thoại.")
      }
    } catch {
      toast.error(scd.chatOpenFailed || "Không thể mở hộp thoại.")
    }
  }

  const getStartDateBadge = (startDateStr) => {
    if (!startDateStr) return { day: "—", month: ui.tba || "TBA" }
    const d = new Date(startDateStr)
    if (isNaN(d.getTime())) return { day: "—", month: ui.tba || "TBA" }
    const day = d.getDate()
    const month =
      c.months?.[d.getMonth()] ||
      d.toLocaleDateString(
        language === "vi" ? "vi-VN" : language === "zh" ? "zh-CN" : "en-US",
        { month: "long" },
      )
    return { day, month }
  }

  if (isLoading || (isFetching && courseDetail === undefined)) {
    return (
      <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
    )
  }

  if (error || (courseDetail !== undefined && !rawCourse)) {
    return (
      <div
        role="alert"
        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3"
      >
        <span>
          {scd.courseLoadFailed ||
            "This course could not be loaded. Please try again."}
        </span>
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
      <div
        role="status"
        className="p-8 text-center text-sm font-semibold text-gray-500"
      >
        {scd.courseUnavailable || "Course details are unavailable."}
      </div>
    )
  }

  // Data helpers
  const languageLabel =
    getLocalizedLanguageName(rawCourse.language, t) || rawCourse.language || "—"
  const thumbnailUrl = getSafeMediaUrl(rawCourse.thumbnailUrl)
  const teacherAvatarUrl = getSafeMediaUrl(
    teacher.avatarImageUrl || teacher.avatar || teacher.avatarUrl,
  )

  return (
    <div
      className={`flex flex-col gap-6 text-[#2e2e2e] ${isWorkspace ? "" : "p-4 sm:p-6"}`}
    >
      {isFetching && (
        <span className="sr-only" role="status">
          {scd.refreshing || "Refreshing course details"}
        </span>
      )}

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          {
            label: isExploreRoute
              ? t.nav?.exploreCourses || "Khám phá khóa học"
              : c.student?.dashboardTitle || "Lớp học của tôi",
            onClick: () =>
              navigate(
                isExploreRoute ? exploreHomePath : "/workspace/learning",
              ),
          },
          {
            label: rawCourse.name || rawCourse.title,
          },
        ]}
      />

      {/* ─── 1. UNIFIED MAIN SECTION (Responsive Order: Mobile = General -> Teacher -> Tabs) ─── */}
      <section
        id="generalSection"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
      >
        {/* GeneralSection: Order 1 on mobile, col 1..8 row 1 on md */}
        <GeneralSection
          rawCourse={rawCourse}
          thumbnailUrl={thumbnailUrl}
          defaultCourseThumbnail={defaultCourseThumbnail}
          linkCopied={linkCopied}
          handleCopyLink={handleCopyLink}
          scd={scd}
          className="order-1 md:order-none md:col-span-8 md:col-start-1 md:row-start-1"
        />

        {/* TeacherInforCard: Order 2 on mobile, col 9..12 row 1..2 (sticky) on md */}
        <TeacherInforCard
          teacher={teacher}
          teacherAvatarUrl={teacherAvatarUrl}
          rawCourse={rawCourse}
          classes={classes}
          scd={scd}
          handleContactTeacher={handleContactTeacher}
          navigate={navigate}
          className="order-2 md:order-none md:col-span-4 md:col-start-9 md:row-start-1 md:row-span-2 md:sticky md:top-24 self-start"
        />

        {/* CourseTab: Order 3 on mobile, col 1..8 row 2 on md */}
        <CourseTab
          courseDetailTabs={courseDetailTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          rawCourse={rawCourse}
          classes={classes}
          displayedClasses={displayedClasses}
          expandedClassIds={expandedClassIds}
          toggleClassExpand={toggleClassExpand}
          getClassButton={getClassButton}
          getStartDateBadge={getStartDateBadge}
          enrollingClassId={enrollingClassId}
          handleClassRegister={handleClassRegister}
          formatDate={formatDate}
          formatScheduleTime={formatScheduleTime}
          formatScheduleDays={formatScheduleDays}
          formatCurrencyVND={formatCurrencyVND}
          navigate={navigate}
          c={c}
          sc={sc}
          scd={scd}
          ui={ui}
          className="order-3 md:order-none md:col-span-8 md:col-start-1 md:row-start-2"
        />
      </section>

      {/* ─── Schedule Conflict Dialog ─── */}
      {conflictClasses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={22} className="text-amber-500 shrink-0" />
              <h2 className="text-lg font-black text-gray-950">
                {scd.scheduleConflictTitle || "Lịch học bị trùng"}
              </h2>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {scd.scheduleConflictDesc ||
                "Lịch học của lớp này trùng với lớp bạn đang học:"}
            </p>
            {(conflictClasses.names || []).length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {conflictClasses.names.map((name) => (
                  <li
                    key={name}
                    className="text-sm font-bold text-[#990011] bg-red-50 border border-red-100 rounded-xl px-3 py-2"
                  >
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
                className="h-10 px-4 rounded-full bg-[#990011] hover:bg-[#80000e] text-white text-sm font-black"
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
