import React, { lazy, Suspense, useEffect, useRef, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { MessageSquare, Video } from "lucide-react"

import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"
import {
  useGetStudentClassDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import {
  formatCurrency,
  getClassEnrollmentIssue,
  getClassEnrollmentIssueLabel,
  getClassEnrollmentIssueMessage,
  getSafeMediaUrl,
} from "../utils/courseUtils"
import { formatWeeklyScheduleText } from "../utils/scheduleUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

import ClassDetailTabs from "../components/ClassDetailTabs"
import StudentClassOverviewTab from "../components/overview/StudentClassOverviewTab"

const ClassLectureHallPage = lazy(() => import("../components/lecture-hall/pages/ClassLectureHallPage"))
const ClassGradingTab = lazy(() => import("../components/grading/ClassGradingTab"))
const ClassMembersTab = lazy(() => import("../components/members/ClassMembersTab"))

const TabLoadingFallback = () => (
  <LoadingSpinner className="flex justify-center items-center min-h-[240px]" />
)

const GRADING_DETAIL_PARAM_KEYS = [
  "assignmentId",
  "quizId",
  "studentId",
  "submissionId",
]
const VALID_TABS = ["overview", "members", "lecture-hall", "feed", "grading"]
const ENROLLED_ONLY_TABS = new Set(["members", "lecture-hall", "feed", "grading"])

const StudentClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { userTimeZone } = useTimezone()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const scd = c.studentCourseDetail || {}
  const ui = c.workspaceUi || {}
  const [searchParams, setSearchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")
  const quizId = searchParams.get("quizId")
  const hasGradingDeepLink = Boolean(assignmentId || quizId)

  const urlTab = searchParams.get("tab")
  const requestedTab = (urlTab && VALID_TABS.includes(urlTab))
    ? urlTab
    : "overview"
  const hasLockedTabDeepLink = ENROLLED_ONLY_TABS.has(requestedTab)

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("tab", tab)
    GRADING_DETAIL_PARAM_KEYS.forEach((key) => nextParams.delete(key))
    setSearchParams(nextParams)
  }

  // Fetch Class Details conditionally via RTK Query (Student view is always studentDetail)
  const {
    currentData: detailResponse,
    isLoading: isDetailLoading,
    isFetching: isDetailFetching,
    error: detailError,
    refetch: refetchDetail,
  } = useGetStudentClassDetailQuery(id, { skip: !id })
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = (
    profile.accountId
    ?? profile.id
    ?? ""
  ).toString()

  // Process data for rendering
  const classData = (
    detailResponse
    && typeof detailResponse === "object"
    && !Array.isArray(detailResponse)
    && detailResponse.id
  )
    ? detailResponse
    : null
  const isEnrolled = classData?.isEnrolled === true
  const enrollmentIssue = isEnrolled
    ? null
    : getClassEnrollmentIssue({ classData })
  const isOwner = Boolean(
    currentUserId
    && [
      classData?.instructorId,
      classData?.instructor?.id,
      classData?.teacherId,
    ].some((ownerId) => ownerId != null && String(ownerId) === currentUserId)
  )

  // Enrollment Status
  const activeTab = isEnrolled
    ? (hasGradingDeepLink ? "grading" : requestedTab)
    : "overview"

  useEffect(() => {
    if (
      isDetailLoading ||
      isDetailFetching ||
      detailError ||
      !classData ||
      isEnrolled ||
      (!hasGradingDeepLink && !hasLockedTabDeepLink)
    ) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("tab", "overview")
    GRADING_DETAIL_PARAM_KEYS.forEach((key) => nextParams.delete(key))
    setSearchParams(nextParams, { replace: true })
  }, [
    classData,
    detailError,
    hasGradingDeepLink,
    hasLockedTabDeepLink,
    isDetailFetching,
    isDetailLoading,
    isEnrolled,
    searchParams,
    setSearchParams,
  ])

  // State Management for UI Actions
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)
  const enrollmentGuardRef = useRef(false)

  // Enroll in class handler
  const handleEnroll = async () => {
    if (enrollmentGuardRef.current || isEnrolling || !classData?.id) return
    if (isOwner) {
      toast.error(c.student?.cannotEnrollOwn || "You cannot enroll in your own course or class.")
      return
    }
    if (enrollmentIssue) {
      toast.error(getClassEnrollmentIssueMessage(enrollmentIssue, c.student))
      return
    }
    enrollmentGuardRef.current = true
    try {
      const result = await enrollInCourse({
        classId: id,
        courseId: classData.courseId,
      }).unwrap()
      const resultPayload = (
        result
        && typeof result === "object"
        && !Array.isArray(result)
        && Object.prototype.hasOwnProperty.call(result, "data")
      )
        ? result.data
        : result
      if (!resultPayload || typeof resultPayload !== "object" || Array.isArray(resultPayload)) {
        throw new Error("Unexpected enrollment response")
      }
      if (resultPayload.checkoutUrl) {
        const checkoutUrl = getSafeMediaUrl(resultPayload.checkoutUrl)
        if (!checkoutUrl) throw new Error("Invalid checkout URL")
        toast.success(
          cd.toastRedirectingToPayment || "Redirecting to payment..."
        )
        window.location.assign(checkoutUrl)
      } else if (resultPayload.classId || resultPayload.enrollmentId) {
        toast.success(
          cd.toastEnrollSuccess
            ? cd.toastEnrollSuccess.replace("{{title}}", classData.title || "")
            : `Successfully enrolled in ${classData.title || ""}!`
        )
        refetchDetail()
      } else {
        throw new Error("Missing enrollment confirmation")
      }
    } catch {
      toast.error(scd.enrollFailed || "Enrollment could not be completed. Please try again.")
    } finally {
      enrollmentGuardRef.current = false
      setShowEnrollConfirm(false)
    }
  }

  const handleLockedTabSelect = (tab) => {
    const messages = {
      members: c.student?.toastEnrollToViewClassmates || "Please enroll and pay tuition to view classmates!",
      "lecture-hall": scd.toastEnrollToViewLectureHall || c.student?.toastEnrollToViewFeed || "Please enroll and pay tuition to view lecture hall!",
      grading: c.student?.toastEnrollToViewGrades || "Please enroll and pay tuition to view grades!",
    }
    toast.error(messages[tab])
  }

  const tabs = [
    { value: "overview", label: c.student?.overview || "Overview" },
    { value: "members", label: c.student?.classmates || "Classmates", locked: !isEnrolled },
    { value: "lecture-hall", label: c.student?.lectureHall || "Lecture Hall", locked: !isEnrolled },
    { value: "grading", label: c.student?.myGrades || "My Grades", locked: !isEnrolled },
  ]

  const getWeeklyScheduleText = () => formatWeeklyScheduleText(
    classData || {},
    language || "en",
    ui.tba,
    userTimeZone,
  )

  if (
    isDetailLoading
    || (isDetailFetching && detailResponse === undefined)
  ) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (detailError || !id || !classData) {
    return (
      <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold flex flex-col items-start gap-3">
        <span>{scd.classLoadFailed || "This class could not be loaded. Please try again."}</span>
        {id && (
          <button type="button" onClick={refetchDetail} className="rounded-xl bg-[#990011] px-4 py-2 text-xs font-bold text-white">
            {scd.retry || "Try again"}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {isDetailFetching && (
        <span role="status" className="sr-only">
          {scd.refreshingClass || "Refreshing class details"}
        </span>
      )}

      {/* ─── Breadcrumb ─── */}
      <Breadcrumb
        items={[
          { label: t.nav?.home || "Trang chủ", onClick: () => navigate("/workspace") },
          { label: c.student?.dashboardTitle || "Lớp học của tôi", onClick: () => navigate("/workspace/learning") },
          ...(classData.courseId
            ? [
                {
                  label: classData.courseName || classData.courseTitle || c.student?.courseDetails || "Course Details",
                  onClick: () => navigate(`/workspace/learning/details/${encodeURIComponent(String(classData.courseId))}`),
                },
              ]
            : []),
          { label: c.student?.classDetails || "Class Details" },
        ]}
      />

      {/* ─── Page Heading & Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.student?.classDetails || "Class Details"}
        </h1>

        <div className="flex items-center gap-3">
          {!isEnrolled ? (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={
                isEnrolling
                || isOwner
                || Boolean(enrollmentIssue)
              }
              title={
                isOwner
                  ? (
                    c.student?.cannotEnrollOwn
                    || "You cannot enroll in your own course or class."
                  )
                  : (
                    enrollmentIssue
                      ? getClassEnrollmentIssueMessage(
                        enrollmentIssue,
                        c.student,
                      )
                      : undefined
                  )
              }
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <span>
                {enrollmentIssue
                  ? getClassEnrollmentIssueLabel(
                    enrollmentIssue,
                    c.student,
                  )
                  : (c.student?.enrollAndPay || "Enroll & Pay Tuition")}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/${encodeURIComponent(language || "vi")}/meet/${encodeURIComponent(`class-${id}`)}`)}
                className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <Video size={14} className="fill-white" />
                <span>{c.student?.joinRoom || c.joinRoom || "Vào phòng học"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (classData?.chatGroupId) {
                    navigate(`/chat/${classData.chatGroupId}`)
                  } else {
                    navigate("/chat")
                  }
                }}
                className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <MessageSquare size={14} className="fill-[#990011]" />
                <span>{c.student?.chat || "Chat"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <ClassDetailTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        onLockedSelect={handleLockedTabSelect}
      />

      {/* ─── Tab Contents ─── */}
      <Suspense fallback={<TabLoadingFallback />}>
        {activeTab === "overview" && (
          <StudentClassOverviewTab
            classData={classData}
            isEnrolled={isEnrolled}
            language={language}
            formatCurrency={formatCurrency}
            getWeeklyScheduleText={getWeeklyScheduleText}
            upcomingSessionLabel={scd.upcomingSession || "Upcoming Session"}
            joinRoomLabel={c.joinRoom || "Join Room"}
            noUpcomingLabel={c.student?.noUpcomingSessions || "No upcoming sessions"}
            onJoinRoom={() => navigate(
              `/${encodeURIComponent(language || "vi")}/meet/${encodeURIComponent(`class-${id}`)}`
            )}
          />
        )}

        {activeTab === "members" && isEnrolled && (
          <ClassMembersTab
            classData={classData}
            isStudent={true}
          />
        )}

        {activeTab === "lecture-hall" && isEnrolled && (
          <ClassLectureHallPage
            id={id}
            isStudent={true}
          />
        )}

        {activeTab === "grading" && isEnrolled && (
          <ClassGradingTab
            id={id}
            isStudent={true}
            language={language}
            cd={cd}
          />
        )}
      </Suspense>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showEnrollConfirm}
        onClose={() => {
          if (!isEnrolling) setShowEnrollConfirm(false)
        }}
        onConfirm={handleEnroll}
        isPending={isEnrolling}
        title={c.student?.confirmEnrollment || "Confirm Class Enrollment"}
        message={
          c.student?.enrollmentConfirmRedirectMsg
            ? c.student.enrollmentConfirmRedirectMsg.replace("{{className}}", classData.title || "")
            : `Are you sure you want to enroll in ${classData.title || ""}? You will be redirected to the tuition payment gateway.`
        }
        confirmText={c.student?.payAndEnroll || "Pay & Enroll"}
        cancelText={c.student?.cancel || "Cancel"}
      />
    </div>
  )
}

export default StudentClassDetailPage
