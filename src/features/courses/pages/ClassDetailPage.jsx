import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
import { LoadingSpinner } from "@/shared/components/ui/indicators"

// Import subcomponents for tabs
import ClassOverviewTab from "../components/detail/ClassOverviewTab"
import ClassMembersTab from "../components/detail/ClassMembersTab"
import ClassFeedTab from "../components/detail/ClassFeedTab"
import ClassGradingTab from "../components/detail/ClassGradingTab"
import ClassMaterialsTab from "../components/detail/ClassMaterialsTab"

const ClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  // Active Tab: "overview", "members", "feed", "grading", "materials"
  const [activeTab, setActiveTab] = useState("overview")

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
    toast.success("Tính năng đang phát triển")
  }

  // Helper to format weekly schedule dynamically and defensively
  const getWeeklyScheduleText = () => {
    let schedArray = null
    if (Array.isArray(classData.rawSchedule) && classData.rawSchedule.length > 0) {
      schedArray = classData.rawSchedule
    } else if (Array.isArray(classData.schedule)) {
      schedArray = classData.schedule
    }

    const dayNames = {
      vi: { "MON": "Thứ 2", "TUE": "Thứ 3", "WED": "Thứ 4", "THU": "Thứ 5", "FRI": "Thứ 6", "SAT": "Thứ 7", "SUN": "Chủ nhật" },
      zh: { "MON": "周一", "TUE": "周二", "WED": "周三", "THU": "周四", "FRI": "周五", "SAT": "周六", "SUN": "周日" },
      en: { "MON": "Mon", "TUE": "Tue", "WED": "Wed", "THU": "Thu", "FRI": "Fri", "SAT": "Sat", "SUN": "Sun" }
    }
    const currentLang = language || "en"
    const langDayNames = dayNames[currentLang] || dayNames.en

    // If we have an array of individual schedule items (e.g. raw / detailed schedule)
    if (schedArray && schedArray.length > 0) {
      // Group by time slot "startTime - endTime"
      const groups = {}
      schedArray.forEach(item => {
        const start = item.startTime || "00:00"
        const end = item.endTime || "00:00"
        const timeKey = `${start} - ${end}`
        const day = String(item.dayOfWeek || "").toUpperCase()
        const dayStr = langDayNames[day] || day

        if (!groups[timeKey]) {
          groups[timeKey] = []
        }
        groups[timeKey].push(dayStr)
      })

      // Construct formatted strings: "Day 1, Day 2 (Time Slot)"
      const groupStrings = Object.entries(groups).map(([timeKey, daysList]) => {
        const daysJoined = daysList.join(", ")
        return `${daysJoined} (${timeKey})`
      })

      return groupStrings.join("; ")
    }

    // Fallback: If it's a transformed RTK Query object: { days, startTime, endTime }
    const schedObj = classData.schedule
    if (schedObj && typeof schedObj === "object") {
      const { days, startTime, endTime } = schedObj
      if (days && days.length > 0) {
        const formattedDays = days.map(day => {
          const upperDay = String(day).toUpperCase()
          return langDayNames[upperDay] || day
        }).join(", ")

        const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : ""
        return timeStr ? `${formattedDays} (${timeStr})` : formattedDays
      }
    }

    return "TBA"
  }

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
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{language === "vi" ? "Toàn bộ khóa học" : "All Courses"}</span>
          <span>/</span>
          <span className="cursor-pointer hover:underline" onClick={() => navigate(`/workspace/courses/details/${classData.courseId || ""}`)}>{language === "vi" ? "Chi tiết khóa học" : "Course Details"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{language === "vi" ? "Chi tiết lớp học" : "Class Details"}</span>
        </div>
      </div>

      {/* ─── Page Heading & Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {language === "vi" ? "Chi tiết lớp học" : "Class Details"}
        </h1>

        <div className="flex items-center gap-3">
          {/* Trò chuyện button */}
          <button
            onClick={notifyInDevelopment}
            className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <MessageSquare size={14} className="fill-white" />
            <span>{language === "vi" ? "Trò chuyện" : "Chat"}</span>
          </button>

          {/* Tạo bài button */}
          <button
            onClick={notifyInDevelopment}
            className="h-10 px-5 bg-white border border-[#990011] text-[#990011] hover:bg-red-50/50 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <span>{language === "vi" ? "Tạo bài" : "Create Post"}</span>
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
          {language === "vi" ? "Tổng quan" : "Overview"}
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "members"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>{language === "vi" ? "Quản lý thành viên" : "Members"}</span>
        </button>

        <button
          onClick={() => setActiveTab("feed")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "feed"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>{language === "vi" ? "Bảng tin" : "Feed"}</span>
        </button>

        <button
          onClick={() => setActiveTab("grading")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "grading"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>{language === "vi" ? "Chấm điểm & quản lý" : "Grading & Management"}</span>
        </button>

        <button
          onClick={() => setActiveTab("materials")}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "materials"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          <span>{cd.materials || (language === "vi" ? "Tài liệu học tập" : "Materials")}</span>
        </button>
      </div>

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
          upcomingSessionLabel={language === "vi" ? "Buổi dạy tiếp theo" : "Upcoming Session"}
          joinRoomLabel={language === "vi" ? "Vào phòng" : "Join Room"}
          viewAllLabel={language === "vi" ? "Xem tất cả" : "View All"}
          noUpcomingLabel={language === "vi" ? "Không có buổi dạy tiếp theo" : "No upcoming sessions"}
          createClassToScheduleLabel={language === "vi" ? "Tạo lớp học mới để lên lịch cho buổi dạy đầu tiên." : "Create a class to schedule your first session."}
          teachingTasksLabel={language === "vi" ? "Việc giảng dạy" : "Teaching Tasks"}
          gradeAssignmentLabel={language === "vi" ? "Chấm bài tập" : "Grade homework"}
          giveFeedbackLabel={language === "vi" ? "Đưa feedback" : "Give feedback"}
          prepareLessonLabel={language === "vi" ? "Soạn giáo án" : "Prepare lesson plan"}
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
        title="Cancel Class"
        message={cd.confirmCancelClass || "Bạn có chắc chắn muốn hủy lớp học này?"}
        confirmText="Cancel Class"
        cancelText={c.createClass?.cancel || "Hủy"}
      />
    </div>
  )
}

export default ClassDetailPage
