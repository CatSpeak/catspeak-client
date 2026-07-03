import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { MessageSquare, Lock } from "lucide-react"

import {
  useGetStudentClassDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { formatCurrency } from "../utils/courseUtils"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

// Import subcomponents for tabs
import StudentClassOverviewTab from "../components/detail/StudentClassOverviewTab"
import ClassMembersTab from "../components/detail/ClassMembersTab"
import ClassFeedTab from "../components/detail/ClassFeedTab"
import ClassGradingTab from "../components/detail/ClassGradingTab"
import ClassMaterialsTab from "../components/detail/ClassMaterialsTab"

const StudentClassDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const c = t.courses || {}
  const cd = c.classDetail || {}

  // Active Tab: "overview", "members", "feed", "grading", "materials"
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch Class Details conditionally via RTK Query (Student view is always studentDetail)
  const { data: detailResponse, isLoading: isDetailLoading, error: detailError } = useGetStudentClassDetailQuery(id)
  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()

  // Process data for rendering
  const classData = detailResponse?.data || detailResponse || {}

  // Enrollment Status
  const isEnrolled = !!classData.isEnrolled

  // State Management for UI Actions
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false)

  // Enroll in class handler
  const handleEnroll = async () => {
    try {
      const result = await enrollInCourse({ classId: id }).unwrap()
      if (result.checkoutUrl) {
        toast.success(
          language === "vi"
            ? "Đang chuyển đến trang thanh toán..."
            : "Redirecting to payment..."
        )
        window.location.href = result.checkoutUrl
      } else {
        toast.success(
          language === "vi"
            ? `Đăng ký lớp học ${classData.title || ""} thành công!`
            : `Successfully enrolled in ${classData.title || ""}!`
        )
      }
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to enroll in class.")
    } finally {
      setShowEnrollConfirm(false)
    }
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
          {!isEnrolled ? (
            <button
              onClick={() => setShowEnrollConfirm(true)}
              disabled={isEnrolling}
              className="h-10 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            >
              <span>{language === "vi" ? "Đăng ký & Thanh toán học phí" : "Enroll & Pay Tuition"}</span>
            </button>
          ) : (
            <button
              onClick={() => toast.success("Opening chat...")}
              className="h-10 px-5 bg-[#990011] hover:bg-[#80000e] text-white font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <MessageSquare size={14} className="fill-white" />
              <span>{language === "vi" ? "Trò chuyện" : "Chat"}</span>
            </button>
          )}
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
          onClick={() => {
            if (!isEnrolled) {
              toast.error(
                language === "vi"
                  ? "Vui lòng đăng ký và thanh toán học phí để xem bạn học!"
                  : "Please enroll and pay tuition to view classmates!"
              )
              return
            }
            setActiveTab("members")
          }}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "members"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {!isEnrolled && <Lock size={12} className="text-gray-400" />}
          <span>{language === "vi" ? "Bạn học" : "Classmates"}</span>
        </button>

        <button
          onClick={() => {
            if (!isEnrolled) {
              toast.error(
                language === "vi"
                  ? "Vui lòng đăng ký và thanh toán học phí để xem bảng tin!"
                  : "Please enroll and pay tuition to view feed!"
              )
              return
            }
            setActiveTab("feed")
          }}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "feed"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {!isEnrolled && <Lock size={12} className="text-gray-400" />}
          <span>{language === "vi" ? "Bảng tin" : "Feed"}</span>
        </button>

        <button
          onClick={() => {
            if (!isEnrolled) {
              toast.error(
                language === "vi"
                  ? "Vui lòng đăng ký và thanh toán học phí để xem điểm số!"
                  : "Please enroll and pay tuition to view grades!"
              )
              return
            }
            setActiveTab("grading")
          }}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "grading"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {!isEnrolled && <Lock size={12} className="text-gray-400" />}
          <span>{language === "vi" ? "Điểm số của tôi" : "My Grades"}</span>
        </button>

        <button
          onClick={() => {
            if (!isEnrolled) {
              toast.error(
                language === "vi"
                  ? "Vui lòng đăng ký và thanh toán học phí để xem tài liệu!"
                  : "Please enroll and pay tuition to view materials!"
              )
              return
            }
            setActiveTab("materials")
          }}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${activeTab === "materials"
            ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
            : "hover:text-gray-600"
            }`}
        >
          {!isEnrolled && <Lock size={12} className="text-gray-400" />}
          <span>{cd.materials || (language === "vi" ? "Tài liệu học tập" : "Materials")}</span>
        </button>
      </div>

      {/* ─── Tab Contents ─── */}
      {activeTab === "overview" && (
        <StudentClassOverviewTab
          classData={classData}
          isEnrolled={isEnrolled}
          language={language}
          formatCurrency={formatCurrency}
          getWeeklyScheduleText={getWeeklyScheduleText}
          upcomingSessionLabel={language === "vi" ? "Buổi học tiếp theo" : "Upcoming Session"}
          joinRoomLabel={language === "vi" ? "Vào phòng" : "Join Room"}
          noUpcomingLabel={language === "vi" ? "Chưa có buổi học nào lên lịch" : "No upcoming sessions"}
          onJoinRoom={() => navigate(`/${language || "vi"}/meet/class-${id}`)}
        />
      )}

      {activeTab === "members" && isEnrolled && (
        <ClassMembersTab
          id={id}
          isStudent={true}
          language={language}
          cd={cd}
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        open={showEnrollConfirm}
        onClose={() => setShowEnrollConfirm(false)}
        onConfirm={handleEnroll}
        title={language === "vi" ? "Xác nhận đăng ký lớp học" : "Confirm Class Enrollment"}
        message={
          language === "vi"
            ? `Bạn có chắc chắn muốn đăng ký lớp học ${classData.title || ""}? Bạn sẽ được chuyển hướng sang trang thanh toán học phí.`
            : `Are you sure you want to enroll in ${classData.title || ""}? You will be redirected to the tuition payment gateway.`
        }
        confirmText={language === "vi" ? "Thanh toán" : "Pay & Enroll"}
        cancelText={language === "vi" ? "Hủy" : "Cancel"}
      />
    </div>
  )
}

export default StudentClassDetailPage
