import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  useGetCourseDetailQuery,
  useGetStudentCourseDetailQuery,
  useEnrollInCourseMutation
} from "@/store/api/coursesApi"
import { useAuth } from "@/features/auth"
import StudentJoinModal from "../student/components/StudentJoinModal"
import {
  Calendar,
  Clock,
  GraduationCap,
  Globe,
  AlignLeft,
  User,
  BookOpen,
  MessageSquare,
  FileText,
  ChevronRight,
  Pencil,
  Tag,
} from "lucide-react"
import { formatCurrencyVND } from "../utils/courseUtils"

const CourseDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const { role } = useAuth()
  const c = t.courses || {}
  const sc = c.student || {}

  const isStudent = role !== "Teacher"

  // Fetch course details
  const teacherDetail = useGetCourseDetailQuery(id, { skip: isStudent })
  const studentDetail = useGetStudentCourseDetailQuery(id, { skip: !isStudent })

  const { data, isLoading, error } = isStudent ? studentDetail : teacherDetail

  // Student enrollment state
  const [enrollTarget, setEnrollTarget] = useState(null) // { course, class }
  const [isJoinOpen, setIsJoinOpen] = useState(false)
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  const [enrollInCourse, { isLoading: isEnrolling }] = useEnrollInCourseMutation()

  const handleOpenEnroll = (course, cls) => {
    setEnrollTarget({ course, class: cls })
    setEnrollSuccess(false)
    setIsJoinOpen(true)
  }

  const handleConfirmEnroll = async () => {
    if (!enrollTarget) return
    try {
      const result = await enrollInCourse({
        courseId: enrollTarget.course.id,
        classId: enrollTarget.class.id
      }).unwrap()

      if (result.checkoutUrl) {
        toast.success(
          language === "vi"
            ? "Đang chuyển đến trang thanh toán..."
            : "Redirecting to payment..."
        )
        window.location.href = result.checkoutUrl
      } else {
        setEnrollSuccess(true)
        toast.success(sc.enrolledSuccess
          ? sc.enrolledSuccess.replace("{{className}}", enrollTarget.class.title)
          : `Successfully enrolled in ${enrollTarget.class.title}!`
        )
      }
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to enroll in the course.")
    }
  }

  const handleSuccessClose = () => {
    setIsJoinOpen(false)
    const targetClassId = enrollTarget?.class?.id
    setEnrollTarget(null)
    if (targetClassId) {
      navigate(`/workspace/courses/class/${targetClassId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#990011]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading course detail: {error.message || "Unknown error"}
      </div>
    )
  }

  // Process data for rendering
  const rawCourse = data || {}
  const classes = rawCourse.classes || []

  // Format hours dynamically (mocking 4 hours per session as per mockup 12 sessions = 48 hours)
  const totalSessions = rawCourse.totalSessions || 0
  const durationText = `${totalSessions} Sessions (${totalSessions * 4} Hours)`

  const courseData = {
    id: rawCourse.id,
    title: rawCourse.title,
    language: rawCourse.language || "English",
    level: rawCourse.levels?.join(", ") || "N/A",
    admissionPeriod: rawCourse.enrollmentStart && rawCourse.enrollmentEnd
      ? formatDateRange(rawCourse.enrollmentStart, rawCourse.enrollmentEnd)
      : "TBA",
    duration: durationText,
    description: rawCourse.description || "",
    thumbnailUrl: rawCourse.thumbnailUrl || ""
  }

  // Calculate pricing range dynamically based on class tuition fees
  const tuitionFees = classes.map(cls => cls.tuitionFee).filter(f => f > 0)
  const minPrice = tuitionFees.length > 0 ? Math.min(...tuitionFees) : 350000
  const maxPrice = tuitionFees.length > 0 ? Math.max(...tuitionFees) : 1999000

  // Date range formatter helper (e.g. Jan 15th - Feb 16th)
  const formatDateRange = (start, end) => {
    if (!start || !end) return "TBA"

    const parseDate = (dStr) => {
      const d = new Date(dStr)
      if (isNaN(d.getTime())) return dStr
      const day = d.getUTCDate()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const month = months[d.getUTCMonth()]

      const suffix = (dayNum) => {
        if (dayNum > 3 && dayNum < 21) return "th"
        switch (dayNum % 10) {
          case 1: return "st"
          case 2: return "nd"
          case 3: return "rd"
          default: return "th"
        }
      }
      return `${month} ${day}${suffix(day)}`
    }
    return `${parseDate(start)} - ${parseDate(end)}`
  }

  const formatDateDayMonth = (dateStr) => {
    if (!dateStr) return "31st Jul"
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = d.getUTCDate()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = months[d.getUTCMonth()]
    const suffix = (dayNum) => {
      if (dayNum > 3 && dayNum < 21) return "th"
      switch (dayNum % 10) {
        case 1: return "st"
        case 2: return "nd"
        case 3: return "rd"
        default: return "th"
      }
    }
    return `${day}${suffix(day)} ${month}`
  }

  const formatTime12h = (timeStr) => {
    if (!timeStr) return "11:45 AM"
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr
    const parts = timeStr.split(":")
    const hours = parseInt(parts[0])
    if (isNaN(hours)) return timeStr
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${parts[1] || "00"} ${ampm}`
  }

  // Get next session details from classes
  const activeClasses = classes.filter(cls => cls.status === "TEACHING" || cls.status === "LIVE" || cls.status === "OPEN")
  const nextClass = activeClasses[0] || classes[0]

  // Localized Labels
  const courseDetailTitle = language === "vi" ? "Chi tiết khóa học" : "Course Details"
  const allCoursesLabel = t.allCourses?.title || (language === "vi" ? "Toàn bộ khóa học" : "All Courses")

  const languageLabel = c.languageLabel || (language === "vi" ? "Ngôn ngữ" : "Language")
  const levelLabel = c.levelLabel || (language === "vi" ? "Trình độ" : "Level")
  const admissionPeriodLabel = language === "vi" ? "Thời gian tuyển sinh" : "Admission Period"
  const durationLabel = language === "vi" ? "Thời lượng" : "Duration"
  const descriptionLabel = c.courseDetail?.description || (language === "vi" ? "Mô tả" : "Description")

  const customizeLabel = c.editCourse || (language === "vi" ? "Tùy chỉnh" : "Customize")

  const currentClassesLabel = c.courseDetail?.currentClasses || (language === "vi" ? "Lớp học hiện tại" : "Current Classes")
  const addNewClassLabel = c.courseDetail?.addNewClass || (language === "vi" ? "Tạo lớp mới" : "Add New Class")
  const noClassesYetLabel = c.courseDetail?.noClassesYet || (language === "vi" ? "Chưa có lớp học nào" : "No classes created yet")
  const startByAddingLabel = c.courseDetail?.startByAdding || (language === "vi" ? "Bắt đầu bằng cách thêm lớp học đầu tiên cho khóa học này." : "Start by adding your first class to this course.")

  const progressLabel = c.progress || (language === "vi" ? "Tiến độ" : "Progress")
  const minPriceLabel = language === "vi" ? "Giá thấp nhất" : "Lowest Price"
  const maxPriceLabel = language === "vi" ? "Giá cao nhất" : "Highest Price"

  const upcomingSessionLabel = c.courseDetail?.upcomingSession || (language === "vi" ? "Buổi dạy tiếp theo" : "Upcoming Session")
  const joinRoomLabel = c.classDetail?.joinRoom || (language === "vi" ? "Vào phòng" : "Join Room")
  const viewAllLabel = c.viewAll || (language === "vi" ? "Xem tất cả" : "View All")
  const noUpcomingLabel = c.courseDetail?.noUpcoming || (language === "vi" ? "Không có buổi dạy tiếp theo" : "No upcoming sessions")
  const createClassToScheduleLabel = c.courseDetail?.createClassToSchedule || (language === "vi" ? "Tạo lớp học mới để lên lịch cho buổi dạy đầu tiên." : "Create a class to schedule your first session.")

  const teachingTasksLabel = c.teachingTasks || (language === "vi" ? "Việc giảng dạy" : "Teaching Tasks")
  const gradeAssignmentLabel = c.gradeAssignment || (language === "vi" ? "Chấm bài tập" : "Grade homework")
  const giveFeedbackLabel = language === "vi" ? "Đưa feedback" : "Give feedback"
  const prepareLessonLabel = language === "vi" ? "Soạn giáo án" : "Prepare lesson plan"

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumb ─── */}
      <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t.nav?.home || "Trang chủ"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{c.title || "Khóa học của tôi"}</span>
        <span>/</span>
        <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace/courses")}>{allCoursesLabel}</span>
        <span>/</span>
        <span className="text-[#990011] font-semibold">{courseDetailTitle}</span>
      </div>

      {/* ─── Page Heading ─── */}
      <h1 className="text-3xl font-black text-gray-950 tracking-tight">
        {courseDetailTitle}
      </h1>

      {/* ─── Grid Content (2 Columns) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: Visual Banner, Information Card & Current Classes */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* ─── Visual Banner ─── */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 min-h-[380px] flex flex-col justify-end shadow-sm bg-cover bg-center text-white"
            style={{
              backgroundImage: `url('${courseData.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"}')`
            }}
          >
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 z-0" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full">
              {/* Course Title */}
              <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight max-w-xl">
                {courseData.title}
              </h2>

              {/* Tùy chỉnh button */}
              {!isStudent && (
                <button
                  onClick={() => navigate(`/workspace/courses/edit/${id}`)}
                  className="shrink-0 h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
                >
                  <Pencil size={14} />
                  <span>{customizeLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Ngôn ngữ */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold">{languageLabel}</span>
                  <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.language}</span>
                </div>
              </div>

              {/* Trình độ */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold">{levelLabel}</span>
                  <span className="inline-flex mt-1 items-center justify-center px-3 py-0.5 text-xs font-black text-white bg-[#EAB308] rounded-full w-fit">
                    {courseData.level}
                  </span>
                </div>
              </div>

              {/* Thời gian tuyển sinh */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#E8F8F0] text-[#15803D] flex items-center justify-center">
                  <Calendar size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold">{admissionPeriodLabel}</span>
                  <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.admissionPeriod}</span>
                </div>
              </div>

              {/* Thời lượng */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold">{durationLabel}</span>
                  <span className="text-gray-900 font-extrabold text-sm mt-0.5">{courseData.duration}</span>
                </div>
              </div>

            </div>

            {/* Mô tả */}
            <div className="flex items-start gap-3 border-t border-gray-100 pt-6">
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#F3F4F6] text-[#4B5563] flex items-center justify-center">
                <AlignLeft size={18} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-400 font-bold">{descriptionLabel}</span>
                <p className="text-gray-600 font-medium text-xs leading-relaxed mt-0.5">
                  {courseData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Current Classes Section */}
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-950 tracking-tight">
                {currentClassesLabel}
              </h3>

              {!isStudent && (
                <button
                  onClick={() => navigate("/workspace/courses/create-class", { state: { courseId: rawCourse.id } })}
                  className="px-4 py-1.5 border border-[#b20a1c] hover:bg-red-50/50 text-[#b20a1c] text-xs font-black rounded-full flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <span>{addNewClassLabel}</span>
                  <span className="text-sm font-light">+</span>
                </button>
              )}
            </div>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {classes.length > 0 ? (
                classes.map((cls) => {
                  const progress = cls.totalSessions ? Math.round((cls.completedSessions / cls.totalSessions) * 100) : 0
                  const isEnrolledInCourse = isStudent && !!rawCourse.enrolledClassId
                  const isClassEnrolled = isStudent && rawCourse.enrolledClassId === cls.id
                  const isLocked = isStudent && isEnrolledInCourse && !isClassEnrolled

                  const handleCardClick = () => {
                    if (!isStudent) {
                      navigate(`/workspace/courses/class/${cls.id}`)
                    } else if (isClassEnrolled) {
                      navigate(`/workspace/courses/class/${cls.id}`)
                    } else if (!isEnrolledInCourse) {
                      handleOpenEnroll(rawCourse, cls)
                    }
                  }

                  return (
                    <div
                      key={cls.id}
                      onClick={handleCardClick}
                      className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
                        isClassEnrolled
                          ? "border-green-300 ring-2 ring-green-50/50"
                          : isLocked
                            ? "border-gray-100 opacity-60 cursor-not-allowed"
                            : "border-gray-100 cursor-pointer"
                      }`}
                    >
                      {/* Image Thumbnail Placeholder Area */}
                      <div className="relative h-44 bg-[#D9D9D9] flex items-center justify-center overflow-hidden shrink-0">
                        {cls.thumbnailUrl ? (
                          <img src={cls.thumbnailUrl} alt={cls.title} className="w-full h-full object-cover" />
                        ) : null}

                        {/* Top-left slots/capacity pill */}
                        <div className="absolute top-3 left-3 bg-[#EAB308]/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <User size={11} className="fill-white" />
                          <span>{cls.slots || 30}</span>
                        </div>

                        {/* Top-right status pill */}
                        <div className="absolute top-3 right-3">
                          {isStudent ? (
                            isClassEnrolled ? (
                              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-green-100 text-green-700">
                                Enrolled
                              </span>
                            ) : isLocked ? (
                              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-gray-200 text-gray-500">
                                Locked
                              </span>
                            ) : (
                              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-blue-105 text-blue-700">
                                Open
                              </span>
                            )
                          ) : (
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                              cls.status === "TEACHING" ? "bg-[#E8F8F0] text-[#15803D]" :
                              cls.status === "OPEN" || cls.status === "OPEN_ENROLLMENT" ? "bg-[#EFF6FF] text-[#1D4ED8]" :
                              cls.status === "LIVE" ? "bg-[#FFE4E6] text-[#E11D48]" :
                              "bg-[#F3F4F6] text-[#6B7280]"
                            }`}>
                              {cls.status === "TEACHING" ? (c.teachingStatus || "Teaching") : cls.status === "OPEN" ? (c.openEnrollmentStatus || "Open Enrollment") : cls.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Class Details Area */}
                      <div className="p-6 flex flex-col flex-1 justify-between">
                        <div>
                          <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-1 hover:text-[#b20a1c] transition-colors" title={cls.title}>
                            {cls.title}
                          </h4>
                          <span className="text-xs text-gray-400 font-bold mt-1 block">
                            {language === "vi" ? `Khóa ${courseData.title}` : `Course ${courseData.title}`}
                          </span>

                          <div className="mt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                              <Calendar size={13} className="text-gray-400" />
                              <span>{cls.schedule?.days?.join(" - ") || "TBA"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                              <Calendar size={13} className="text-gray-400" />
                              <span>{formatDateRange(cls.startDate, cls.endDate)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Student / Teacher footer split */}
                        {isStudent ? (
                          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-4">
                            {isClassEnrolled && (
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                  <span>{progressLabel}</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Tuition Fee</span>
                                <span className="text-gray-900 font-black text-sm">{formatCurrencyVND(cls.tuitionFee)}</span>
                              </div>

                              {isClassEnrolled ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/workspace/courses/class/${cls.id}`)
                                  }}
                                  className="h-8 px-4 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                                >
                                  <span>Go to Class</span>
                                  <span>→</span>
                                </button>
                              ) : isLocked ? (
                                <span className="text-xs text-gray-400 font-bold italic">Other batch selected</span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleOpenEnroll(rawCourse, cls)
                                  }}
                                  className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                                >
                                  <span>Enroll</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Progress Section */}
                            <div className="mt-5">
                              <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                                <span>{progressLabel}</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-[#b20a1c] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                              </div>
                            </div>

                            {/* Cost footer */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                  <Tag size={13} />
                                  {minPriceLabel}
                                </span>
                                <span className="text-gray-900 font-black">{formatCurrencyVND(minPrice)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                  <Tag size={13} />
                                  {maxPriceLabel}
                                </span>
                                <span className="text-gray-900 font-black">{formatCurrencyVND(maxPrice)}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                /* Empty state card */
                <div className="bg-[#FCFCFC] border border-gray-150 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[220px] col-span-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <GraduationCap size={24} className="stroke-[1.5]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-extrabold text-sm text-gray-800">{noClassesYetLabel}</h4>
                    <p className="text-xs text-gray-400 font-bold max-w-[240px] leading-relaxed">
                      {startByAddingLabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Conditional based on Student or Teacher Role */}
        <div className="flex flex-col gap-8">
          {isStudent ? (
            <>
              {/* Instructor Information card */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
                <h3 className="text-lg font-black text-gray-950 tracking-tight">
                  {language === "vi" ? "Giảng viên phụ trách" : "Course Instructor"}
                </h3>
                <div className="flex items-center gap-4">
                  <img
                    className="w-14 h-14 rounded-full object-cover border border-gray-100"
                    src={rawCourse.instructor?.avatar || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120&h=120"}
                    alt={rawCourse.instructor?.fullName || "Instructor"}
                  />
                  <div className="flex flex-col">
                    <h4 className="font-extrabold text-gray-950 text-base">{rawCourse.instructor?.fullName || "Prof. Sarah Jenkins"}</h4>
                    <span className="text-xs text-[#990011] font-black">{rawCourse.instructor?.title || "Senior Language Coach"}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  {rawCourse.instructor?.bio || "Expert in custom curriculum development with over 8 years of native tutoring experience."}
                </p>
                <button
                  onClick={() => toast.success(language === "vi" ? "Đang mở hộp thoại chat..." : "Opening messenger...")}
                  className="mt-2 w-full h-9 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-800 text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <MessageSquare size={13} />
                  <span>{language === "vi" ? "Nhắn tin cho giảng viên" : "Contact Instructor"}</span>
                </button>
              </div>

              {/* Syllabus / Learning Outcomes */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4">
                <h3 className="text-lg font-black text-gray-950 tracking-tight">
                  {language === "vi" ? "Nội dung học tập" : "What You'll Learn"}
                </h3>
                <div className="flex flex-col gap-3.5">
                  {(rawCourse.syllabus || [
                    "Master daily communication skills & grammar nuances.",
                    "Build native vocabulary for workplace scenarios.",
                    "Improve speaking fluency and pronunciation checkmarks.",
                    "Access study sheets and curated translation assets."
                  ]).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs mt-0.5 font-bold">
                        ✓
                      </div>
                      <span className="text-xs text-gray-600 font-bold leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Buổi dạy tiếp theo */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-5">
                <h3 className="text-lg font-black text-gray-950 tracking-tight">
                  {upcomingSessionLabel}
                </h3>

                {nextClass ? (
                  <div className="flex flex-col gap-4">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {nextClass.language || courseData.language}
                      </span>
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        {nextClass.levels?.[0] || courseData.level}
                      </span>
                      <span className="ml-auto bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                        Teaching
                      </span>
                    </div>

                    {/* Class Title */}
                    <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-2">
                      {nextClass.title}
                    </h4>

                    {/* Date / Time */}
                    <div className="flex flex-col gap-2 border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Clock size={14} className="text-gray-400" />
                        <span>{formatTime12h(nextClass.schedule?.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatDateDayMonth(nextClass.startDate)}</span>
                      </div>
                    </div>

                    {/* Footer stack and Join button */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5">
                        {/* Avatars */}
                        <div className="flex -space-x-2 overflow-hidden shrink-0">
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                            alt="Student"
                          />
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                            alt="Student"
                          />
                          <img
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80"
                            alt="Student"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 font-sans">10</span>
                      </div>

                      <button
                        onClick={() => navigate(`/workspace/courses/class/${nextClass.id}`)}
                        className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                      >
                        <span>{joinRoomLabel}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FCFCFC] border border-gray-150 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2.5 min-h-[140px]">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Calendar size={18} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-xs text-gray-700">{noUpcomingLabel}</span>
                      <p className="text-[10px] text-gray-400 font-semibold max-w-[200px] leading-relaxed">
                        {createClassToScheduleLabel}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate("/workspace/courses/schedule")}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 hover:underline transition-colors mt-2 text-center"
                >
                  {viewAllLabel}
                </button>
              </div>

              {/* Việc giảng dạy */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-950 tracking-tight">
                    {teachingTasksLabel}
                  </h3>
                  <button
                    onClick={() => navigate("/workspace/courses/schedule")}
                    className="text-xs font-black text-[#b20a1c] hover:underline"
                  >
                    {viewAllLabel}
                  </button>
                </div>

                {/* List of Tasks */}
                <div className="flex flex-col gap-4">

                  {/* Task 1 */}
                  <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center">
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{gradeAssignmentLabel}</h4>
                      <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Lớp tiếng anh luyện nói</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>11:45 AM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>31st Jul</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] px-2 py-0.5 rounded">
                        Urgent
                      </span>
                      <div className="w-6 h-6 rounded-full border border-gray-150 flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer">
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Task 2 */}
                  <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#FAF5FF] text-[#A855F7] flex items-center justify-center">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{giveFeedbackLabel}</h4>
                      <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Lớp viết anh ngữ chuyên n...</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>11:45 AM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>31st Jul</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2 py-0.5 rounded">
                        Required
                      </span>
                      <div className="w-6 h-6 rounded-full border border-gray-150 flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer">
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Task 3 */}
                  <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{giveFeedbackLabel}</h4>
                      <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Lớp viết anh ngữ chuyên n...</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>11:45 AM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>31st Jul</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="bg-[#FFE4E6] text-[#E11D48] font-bold text-[10px] px-2 py-0.5 rounded">
                        Urgent
                      </span>
                      <div className="w-6 h-6 rounded-full border border-gray-150 flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer">
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Task 4 */}
                  <div className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{prepareLessonLabel}</h4>
                      <p className="text-xs text-gray-400 font-bold truncate mt-0.5">Lớp tiếng anh luyện nói</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Clock size={11} />
                          <span>11:45 AM</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>31st Jul</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="bg-[#E8F8F0] text-[#15803D] font-bold text-[10px] px-2 py-0.5 rounded">
                        Later
                      </span>
                      <div className="w-6 h-6 rounded-full border border-gray-150 flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer">
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

        </div>

      </div>

      {/* Student Enrollment Confirmation Portal */}
      {isStudent && (
        <StudentJoinModal
          open={isJoinOpen}
          onClose={() => setIsJoinOpen(false)}
          onConfirm={handleConfirmEnroll}
          course={enrollTarget?.course}
          selectedClass={enrollTarget?.class}
          isSubmitting={isEnrolling}
          success={enrollSuccess}
          onSuccessClose={handleSuccessClose}
          t={t}
        />
      )}
    </div>
  )
}

export default CourseDetailPage