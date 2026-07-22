import React, { lazy, Suspense, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { MessageSquare } from "lucide-react"

import {
  useGetStudentClassDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { useGetUserProfileQuery } from "@/store/api/userApi"
import { formatCurrency } from "../utils/courseUtils"
import { formatWeeklyScheduleText } from "../utils/scheduleUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

import ClassDetailTabs from "../components/ClassDetailTabs"
import StudentClassOverviewTab from "../components/overview/StudentClassOverviewTab"

const ClassFeedTab = lazy(() => import("../components/grading/ClassFeedTab"))
const ClassGradingTab = lazy(() => import("../components/grading/ClassGradingTab"))
const ClassMaterialsTab = lazy(() => import("../components/materials/ClassMaterialsTab"))
const ClassMembersTab = lazy(() => import("../components/members/ClassMembersTab"))

const TabLoadingFallback = () => (
  <LoadingSpinner className="flex justify-center items-center min-h-[240px]" />
)

const StudentClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}
  const [searchParams, setSearchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")

  const [selectedTab, setSelectedTab] = useState("overview")
  const activeTab = assignmentId ? "grading" : selectedTab

  const clearAssignmentParam = () => {
    if (!assignmentId) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete("assignmentId")
    setSearchParams(nextParams, { replace: true })
  }

  const handleTabChange = (tab) => {
    setSelectedTab(tab)
    clearAssignmentParam()
  }

  // Fetch Class Details conditionally via RTK Query (Student view is always studentDetail)
  const { data: detailResponse, isLoading: isDetailLoading, error: detailError } = useGetStudentClassDetailQuery(id, { skip: !id })
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()
  const { data: profileResponse } = useGetUserProfileQuery()
  const profile = profileResponse?.data || profileResponse || {}
  const currentUserId = profile.id?.toString() || ""

  // Process data for rendering
  const classData = detailResponse?.data || detailResponse || {}
  const isOwner = currentUserId && (classData.instructorId === currentUserId || classData.instructor?.id === currentUserId || classData.teacherId === currentUserId)

  // Enrollment Status
  const isEnrolled = !!classData.isEnrolled

  // State Management for UI Actions
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)

  // Enroll in class handler
  const handleEnroll = async () => {
    if (isOwner) {
      toast.error(c.student?.cannotEnrollOwn || "You cannot enroll in your own course or class.")
      return
    }
    try {
      const result = await enrollInCourse({ classId: id }).unwrap()
      if (result.checkoutUrl) {
        toast.success(
          cd.toastRedirectingToPayment || "Redirecting to payment..."
        )
        window.location.href = result.checkoutUrl
      } else {
        toast.success(
          cd.toastEnrollSuccess
            ? cd.toastEnrollSuccess.replace("{{title}}", classData.title || "")
            : `Successfully enrolled in ${classData.title || ""}!`
        )
      }
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to enroll in class.")
    } finally {
      setShowEnrollConfirm(false)
    }
  }

  const notifyInDevelopment = () => {
    toast.success("Tính năng đang phát triển")
  }

  const handleLockedTabSelect = (tab) => {
    const messages = {
      members: c.student?.toastEnrollToViewClassmates || "Please enroll and pay tuition to view classmates!",
      feed: c.student?.toastEnrollToViewFeed || "Please enroll and pay tuition to view feed!",
      grading: c.student?.toastEnrollToViewGrades || "Please enroll and pay tuition to view grades!",
      materials: c.student?.toastEnrollToViewMaterials || "Please enroll and pay tuition to view materials!",
    }
    toast.error(messages[tab])
  }

  const tabs = [
    { value: "overview", label: c.student?.overview || "Overview" },
    { value: "members", label: c.student?.classmates || "Classmates", locked: !isEnrolled },
    { value: "feed", label: c.student?.feed || "Feed", locked: !isEnrolled },
    { value: "grading", label: c.student?.myGrades || "My Grades", locked: !isEnrolled },
    { value: "materials", label: c.student?.materials || "Materials", locked: !isEnrolled },
  ]

  const getWeeklyScheduleText = () => formatWeeklyScheduleText(classData, language || "en")

  if (isDetailLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (detailError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading class detail: {detailError.data?.message || detailError.message || "Class not found"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">

      {/* ─── Breadcrumb ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/learning")}>{c.student?.dashboardTitle}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/learning")}>{c.allCourses?.title || "All Courses"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/learning/details/${classData.courseId || ""}`)}>{c.student?.courseDetails || "Course Details"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{c.student?.classDetails || "Class Details"}</span>
        </div>
      </div>

      {/* ─── Page Heading & Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.student?.classDetails || "Class Details"}
        </h1>

        <div className="flex items-center gap-3">
          {!isEnrolled ? (
            <button
              onClick={() => {
                if (isOwner) {
                  toast.error(c.student?.cannotEnrollOwn || "You cannot enroll in your own course or class.")
                  return
                }
                setShowEnrollConfirm(true)
              }}
              disabled={isEnrolling}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <span>{c.student?.enrollAndPay || "Enroll & Pay Tuition"}</span>
            </button>
          ) : (
            <button
              onClick={notifyInDevelopment}
              className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <MessageSquare size={14} className="fill-white" />
              <span>{c.student?.chat || "Chat"}</span>
            </button>
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
          upcomingSessionLabel={c.student?.upcomingSession || "Upcoming Session"}
          joinRoomLabel={c.joinRoom || "Join Room"}
          noUpcomingLabel={c.student?.noUpcomingSessions || "No upcoming sessions"}
          onJoinRoom={() => navigate(`/${language || "vi"}/meet/class-${id}`)}
        />
      )}

        {activeTab === "members" && isEnrolled && (
        <ClassMembersTab
          isStudent={true}
        />
      )}

        {activeTab === "feed" && isEnrolled && (
        <ClassFeedTab
          id={id}
          isStudent={true}
          language={language}
          cd={cd}
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

        {activeTab === "materials" && isEnrolled && (
        <ClassMaterialsTab
          id={id}
          isStudent={true}
          language={language}
          cd={cd}
          cancelText={c.createClass?.cancel || "Hủy"}
        />
        )}
      </Suspense>

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showEnrollConfirm}
        onClose={() => setShowEnrollConfirm(false)}
        onConfirm={handleEnroll}
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
