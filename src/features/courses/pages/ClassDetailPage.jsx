import React, { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { MessageSquare } from "lucide-react"

import {
  useGetClassDetailQuery,
  useUpdateClassMutation,
  useDeleteClassMutation
} from "@/store/api/coursesApi"
import { formatCurrency } from "../utils/courseUtils"
import { formatWeeklyScheduleText } from "../utils/scheduleUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

// Import subcomponents for tabs
import ClassFeedTab from "../components/grading/ClassFeedTab"
import ClassGradingTab from "../components/grading/ClassGradingTab"
import ClassMaterialsTab from "../components/materials/ClassMaterialsTab"
import ClassMembersTab from "../components/members/ClassMembersTab"
import ClassOverviewTab from "../components/overview/ClassOverviewTab"

const ClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  const [searchParams] = useSearchParams()
  const assignmentId = searchParams.get("assignmentId")

  // Active Tab: "overview", "members", "feed", "grading", "materials"
  const [activeTab, setActiveTab] = useState("overview")

  // Sync tab with URL search parameter if present
  useEffect(() => {
    if (assignmentId) {
      setActiveTab("grading")
    }
  }, [assignmentId])

  // Fetch Class Details via RTK Query
  const { data: detailResponse, isLoading: isDetailLoading, error: detailError } = useGetClassDetailQuery(id)
  const [updateClass] = useUpdateClassMutation()
  const [deleteClass] = useDeleteClassMutation()

  // Process data for rendering
  const classData = detailResponse?.data || detailResponse || {}

  // State Management for UI Actions
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showCancelClassModal, setShowCancelClassModal] = useState(false)

  // Cancel class handler
  const handleCancelClass = async () => {
    try {
      await deleteClass(id).unwrap()
      toast.success(cd.toastCancelSuccess || "Class cancelled successfully")
      navigate("/workspace/courses")
    } catch {
      toast.error("Failed to cancel class")
    } finally {
      setShowCancelClassModal(false)
    }
  }

  // Complete class handler
  const handleCompleteClass = async () => {
    setShowActionsDropdown(false)
    try {
      await updateClass({ id, data: { status: "COMPLETED" } }).unwrap()
      toast.success(cd.toastCompleteSuccess || "Marked class as complete")
    } catch {
      toast.error("Failed to complete class")
    }
  }

  const notifyInDevelopment = () => {
    toast.success(c.devMessage || "Feature in development")
  }

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

      {!assignmentId && (
        <>
          {/* ─── Breadcrumb ─── */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
              <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.allCourses?.title || "All Courses"}</span>
              <span>/</span>
              <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classData.courseId || ""}`)}>{c.student?.courseDetails || "Course Details"}</span>
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
              {/* Trò chuyện button */}
              <button
                onClick={notifyInDevelopment}
                className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <MessageSquare size={14} className="fill-white" />
                <span>{c.student?.chat || "Chat"}</span>
              </button>

              {/* Tạo bài button */}
              <button
                onClick={() => navigate(`/workspace/courses/class/${id}/create-assignment`)}
                className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <span>{cd.createPost || "Create Post"}</span>
                <span className="text-sm font-light">+</span>
              </button>
            </div>
          </div>

          {/* ─── Navigation Tabs ─── */}
          <div className="flex border-b border-gray-150 pb-px gap-8 text-sm font-bold text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 transition-all relative ${activeTab === "overview"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
                : "hover:text-gray-600"
                }`}
            >
              {cd.overview || "Overview"}
            </button>

            <button
              onClick={() => setActiveTab("members")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "members"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
                : "hover:text-gray-600"
                }`}
            >
              <span>{cd.members || "Members"}</span>
            </button>

            <button
              onClick={() => setActiveTab("feed")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "feed"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
                : "hover:text-gray-600"
                }`}
            >
              <span>{cd.feed || "Feed"}</span>
            </button>

            <button
              onClick={() => setActiveTab("grading")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "grading"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
                : "hover:text-gray-600"
                }`}
            >
              <span>{cd.grading || "Grading"}</span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "materials"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
                : "hover:text-gray-600"
                }`}
            >
              <span>{cd.materials || "Materials"}</span>
            </button>
          </div>
        </>
      )}

      {/* ─── Tab Contents ─── */}
      {activeTab === "overview" && (
        <ClassOverviewTab
          classData={classData}
          isStudent={false}
          isEnrolled={true}
          language={language}
          cd={cd}
          id={id}
          navigate={navigate}
          showActionsDropdown={showActionsDropdown}
          setShowActionsDropdown={setShowActionsDropdown}
          onCompleteClass={handleCompleteClass}
          onCancelClassClick={() => setShowCancelClassModal(true)}
          formatCurrency={formatCurrency}
          getWeeklyScheduleText={getWeeklyScheduleText}
          upcomingSessionLabel={c.courseDetail?.upcomingSession || "Upcoming Session"}
          joinRoomLabel={c.joinRoom || "Join Room"}
          viewAllLabel={c.viewAll || "View All"}
          noUpcomingLabel={c.courseDetail?.noUpcoming || "No upcoming sessions"}
          createClassToScheduleLabel={c.courseDetail?.createClassToSchedule || "Create a class to schedule your first session."}
          teachingTasksLabel={c.teachingTasks || "Teaching Tasks"}
          gradeAssignmentLabel={c.gradeAssignment || "Grade homework"}
          giveFeedbackLabel={c.giveFeedback || "Give feedback"}
          prepareLessonLabel={c.prepareLesson || "Prepare lesson plan"}
          onJoinRoom={() => navigate(`/${language || "vi"}/meet/class-${id}`)}
          onTaskAction={() => navigate("/workspace/courses/schedule")}
          onViewTasks={() => navigate("/workspace/courses/schedule")}
        />
      )}

      {activeTab === "members" && (
        <ClassMembersTab
          id={id}
          isStudent={false}
          language={language}
          cd={cd}
        />
      )}

      {activeTab === "feed" && (
        <ClassFeedTab
          id={id}
          isStudent={false}
          language={language}
          cd={cd}
        />
      )}

      {activeTab === "grading" && (
        <ClassGradingTab
          id={id}
          isStudent={false}
          language={language}
          cd={cd}
        />
      )}

      {activeTab === "materials" && (
        <ClassMaterialsTab
          id={id}
          isStudent={false}
          language={language}
          cd={cd}
          cancelText={c.createClass?.cancel || "Hủy"}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showCancelClassModal}
        onClose={() => setShowCancelClassModal(false)}
        onConfirm={handleCancelClass}
        title={cd.cancelClass || "Cancel Class"}
        message={cd.confirmCancelClass || "Are you sure you want to cancel this class?"}
        confirmText={cd.cancelClass || "Cancel Class"}
        cancelText={c.createClass?.cancel || "Hủy"}
      />
    </div>
  )
}

export default ClassDetailPage
