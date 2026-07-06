import React, { useState, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { toast } from "react-hot-toast"
import {
  Plus,
  Clock,
  Calendar,
  Users,
  BookOpen,
  PenSquare,
  ChevronDown,
  MoreVertical,
  FileText,
  MessageSquare,
  LayoutGrid,
  List,
  Trash2,
  Archive,
  Tag,
} from "lucide-react"

import { useGetAllCoursesQuery, useGetAllClassesQuery, useGetScheduleSessionsQuery } from "@/store/api/coursesApi"
import { formatCurrencyVND, getCourseGradientAndIcon, formatUTCDate, formatTime12h, formatDateDayMonth } from "../utils/courseUtils"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useDeleteCourse } from "../hooks/useDeleteCourse"
import useClickOutside from "@/shared/hooks/useClickOutside"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import StudentDashboard from "../student/components/StudentDashboard"
import { useRoleOverride } from "../components/RoleSwitcher"

const MyCoursesPage = () => {
  const { language, t } = useLanguage()
  const navigate = useNavigate()

  const { isStudent } = useRoleOverride()
  const c = t.courses || {}

  // Local State
  const [activeTab, setActiveTab] = useState("courses")
  const [viewMode, setViewMode] = useState("grid")
  const [statusFilter, setStatusFilter] = useState("all")

  const mc = c.myCourses || {}

  // Get current date range for the upcoming 6 months of schedule sessions
  const scheduleParams = useMemo(() => {
    const today = new Date()
    const fromStr = today.toISOString().split("T")[0]
    const future = new Date()
    future.setDate(today.getDate() + 180)
    const toStr = future.toISOString().split("T")[0]
    return { from: fromStr, to: toStr }
  }, [])

  const { data: scheduleData, isLoading: isScheduleLoading } = useGetScheduleSessionsQuery(scheduleParams, { skip: isStudent })

  // Fetch real courses and classes data in parallel
  const { data: coursesData, isLoading: isCoursesLoading, error: coursesError } = useGetAllCoursesQuery({ page: 1, pageSize: 6 }, { skip: isStudent })
  const { data: classesData, isLoading: isClassesLoading, error: classesError } = useGetAllClassesQuery({ page: 1, pageSize: 6 }, { skip: isStudent })

  const isLoading = !isStudent && (isCoursesLoading || isClassesLoading || isScheduleLoading)
  const error = !isStudent && (coursesError || classesError)

  // Hook for delete course flow
  const deleteHelper = useDeleteCourse(t)

  const rawSessions = useMemo(() => scheduleData?.data || [], [scheduleData])
  const coursesRaw = useMemo(() => coursesData?.data || [], [coursesData])
  const classesRaw = useMemo(() => classesData?.data || [], [classesData])

  const handleCreateCourse = () => {
    navigate("/workspace/courses/create")
  }

  const notifyInDevelopment = () => {
    toast.success("Tính năng đang phát triển")
  }

  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setActiveDropdown(null), {
    enabled: activeDropdown !== null,
  })

  // Transform real schedule sessions to upcoming class cards
  const upcomingClasses = useMemo(() => {
    if (rawSessions.length === 0) {
      return []
    }

    return rawSessions.slice(0, 3).map((session, index) => {
      const clsIdStr = session.class?.id?.toString() || ""
      const matchedClass = classesRaw.find(c => c.id === clsIdStr)
      const languageVal = session.class?.language
        ? session.class.language.charAt(0) + session.class.language.slice(1).toLowerCase()
        : (matchedClass?.language || "English")

      return {
        id: `sess-${clsIdStr}-${session.sessionNumber || index}`,
        classId: clsIdStr,
        title: session.class?.name || matchedClass?.title || "Untitled Session",
        time: `${formatTime12h(session.startTime)} - ${formatTime12h(session.endTime)}`,
        date: formatDateDayMonth(session.date),
        status: session.class?.status || matchedClass?.status || "UPCOMING",
        language: languageVal,
        levels: matchedClass?.levels || ["B2"],
        avatars: [
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80"
        ],
        studentCount: matchedClass?.slots || 0
      }
    })
  }, [rawSessions, classesRaw])

  // Mock Teaching Tasks list (Right Column top) matching Figma mockup
  const teachingTasks = [
    {
      id: "t1",
      title: language === "vi" ? "Chấm bài tập" : "Grade homework",
      subtitle: language === "vi" ? "Lớp tiếng anh luyện nói" : "English speaking class",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Due: Tomorrow",
      status: "Urgent",
      icon: <BookOpen size={16} />,
      iconColor: "text-[#3B82F6] bg-[#EFF6FF]"
    },
    {
      id: "t2",
      title: language === "vi" ? "Đưa feedback" : "Give feedback",
      subtitle: language === "vi" ? "Lớp viết anh ngữ chuyên nghiệp" : "Professional English writing",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Due: 3 more days",
      status: "Required",
      icon: <MessageSquare size={16} />,
      iconColor: "text-[#A855F7] bg-[#FAF5FF]"
    },
    {
      id: "t3",
      title: language === "vi" ? "Đưa feedback" : "Give feedback",
      subtitle: language === "vi" ? "Lớp viết anh ngữ chuyên nghiệp" : "Professional English writing",
      time: "11:45 AM",
      date: "31st Jul",
      due: "",
      status: "Urgent",
      icon: <MessageSquare size={16} />,
      iconColor: "text-[#D97706] bg-[#FEF3C7]"
    },
    {
      id: "t4",
      title: language === "vi" ? "Soạn giáo án" : "Prepare lesson plan",
      subtitle: language === "vi" ? "Lớp tiếng anh luyện nói" : "English speaking class",
      time: "11:45 AM",
      date: "31st Jul",
      due: "Due: 5 more days",
      status: "Later",
      icon: <FileText size={16} />,
      iconColor: "text-[#E11D48] bg-[#FFE4E6]"
    }
  ]

  const courseList = useMemo(() => coursesRaw.map((course, index) => {
    const { gradient, icon } = getCourseGradientAndIcon(index)
    return {
      id: course.id,
      title: course.name,
      language: course.language || "English",
      description: course.description || "",
      classCount: course.classCount || 0,
      students: `${course.studentCount || 0} student${(course.studentCount || 0) !== 1 ? "s" : ""}`,
      createdAt: formatUTCDate(course.createdAt, "en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: course.status || "OPEN",
      icon,
      gradient,
      thumbnailUrl: course.thumbnailUrl,
    }
  }), [coursesRaw])

  const classList = useMemo(() => classesRaw.map((cls, index) => {
    const { gradient, icon } = getCourseGradientAndIcon(index)
    const progressVal = cls.progress ? Math.round((cls.progress.completedSessions / cls.progress.totalSessions) * 100) : 0
    return {
      id: cls.id,
      title: cls.name,
      courseTitle: cls.courseName || "N/A",
      language: cls.language || "English",
      levels: cls.levels || [],
      schedule: cls.schedule?.days?.join(" - ") || "TBA",
      time: cls.schedule ? `${cls.schedule.startTime} - ${cls.schedule.endTime}` : "TBA",
      students: `${cls.studentCount || 0} / ${cls.slots || 10} students`,
      slots: cls.slots || 0,
      progress: progressVal,
      progressText: `${cls.progress?.completedSessions || 0}/${cls.progress?.totalSessions || 24}`,
      startDate: formatUTCDate(cls.startDate, "en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      endDate: formatUTCDate(cls.endDate, "en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      price: formatCurrencyVND(cls.tuitionFee),
      status: cls.status || "OPEN",
      icon,
      gradient,
      thumbnailUrl: cls.thumbnailUrl,
    }
  }), [classesRaw])

  const displayList = activeTab === "courses" ? courseList : classList

  const filteredDisplayList = useMemo(() => (
    displayList.filter(item => statusFilter === "all" || (item.status && item.status.toLowerCase() === statusFilter))
  ), [displayList, statusFilter])

  if (isStudent) {
    return <StudentDashboard t={t} language={language} />
  }

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-semibold">
        Error loading course overview: {error.message || "Unknown error"}
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
          <span className="text-[#990011] font-semibold">{c.title || "Khóa học của tôi"}</span>
        </div>
      </div>

      {/* ─── Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-black text-gray-950 tracking-tight">
          {c.title || "Khóa học của tôi"}
        </h1>
        <div className="flex items-center gap-3">
          {/* Lưu trữ button */}
          {/* <button
            onClick={() => navigate("/workspace/courses/archived")}
            className="h-10 px-5 bg-white border border-gray-250 hover:bg-gray-55/40 text-gray-600 font-extrabold text-xs rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <Archive size={14} />
            <span>{language === "vi" ? "Lưu trữ" : "Archived"}</span>
          </button> */}

          {/* Tạo khóa học + button */}
          <button
            onClick={handleCreateCourse}
            className="h-10 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white font-extrabold text-sm rounded-full flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 active:shadow-sm"
          >
            <Plus size={16} />
            <span>{c.createCourse?.title || "Tạo khóa học"}</span>
          </button>
        </div>
      </div>

      {/* ─── Top 2-Column Section: Upcoming Sessions & Tasks ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Lớp học sắp tới */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs flex flex-col gap-5 h-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[#990011] rounded-full" />
                <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>{mc.upcomingClasses || "Lớp học sắp tới"}</span>
                  <span className="bg-[#EAB308] text-white text-[10px] px-2 font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                    {String(rawSessions.length || upcomingClasses.length)}
                  </span>
                </h2>
              </div>
              <button
                onClick={() => navigate("/workspace/courses/schedule")}
                className="text-xs text-[#990011] hover:text-[#80000e] hover:underline font-bold transition-colors"
              >
                {language === "vi" ? "Xem lịch trình" : "View schedule"}
              </button>
            </div>

            {/* Vertical list of upcoming cards or empty state */}
            <div className="flex flex-col gap-4 flex-1 justify-center">
              {upcomingClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 font-bold text-base gap-3 h-full min-h-[220px]">
                  <Calendar size={54} className="text-gray-300 stroke-[1.2]" />
                  <span>{language === "vi" ? "Chưa có lớp học sắp tới" : "No Upcoming classes yet"}</span>
                </div>
              ) : (
                upcomingClasses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/workspace/courses/class/${item.classId || item.id}`)}
                    className="bg-[#FCFCFC] border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 hover:shadow-xs transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col gap-2.5">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          {item.language}
                        </span>
                        <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                          {item.levels[0]}
                        </span>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.status === "LIVE" ? "bg-[#FFE4E6] text-[#E11D48]" :
                          item.status === "TEACHING" ? "bg-[#E8F8F0] text-[#15803D]" :
                            "bg-[#EFF6FF] text-[#1D4ED8]"
                          }`}>
                          {item.status === "LIVE" ? "Live" : item.status === "TEACHING" ? "Teaching" : "Open Enrollment"}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-gray-950 leading-snug">
                        {item.title}
                      </h3>

                      {/* Time / Date */}
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>{item.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side stack and actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden shrink-0">
                          {item.avatars.map((src, i) => (
                            <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={src} alt="student" />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 font-sans">{item.studentCount}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workspace/courses/class/${item.classId || item.id}`);
                        }}
                        className="h-8 px-4 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 whitespace-nowrap"
                      >
                        <span>{item.status === "OPEN" ? (language === "vi" ? "Xem lớp" : "View class") : (language === "vi" ? "Vào phòng" : "Join room")}</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Việc giảng dạy */}
        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4 h-full justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-950 tracking-tight">
                {language === "vi" ? "Việc giảng dạy" : "Teaching Tasks"}
              </h3>
              <button
                onClick={notifyInDevelopment}
                className="text-xs font-black text-[#b20a1c] hover:underline"
              >
                {language === "vi" ? "Xem tất cả" : "View all"}
              </button>
            </div>

            {/* List of Tasks */}
            <div className="flex flex-col gap-4 flex-1 mt-2">
              {teachingTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 hover:bg-gray-50/50 p-1.5 rounded-2xl transition-colors">
                  <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${task.iconColor}`}>
                    {task.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-gray-950 truncate leading-snug">{task.title}</h4>
                    <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{task.subtitle}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400 font-bold">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{task.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-center">
                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${task.status === "Urgent" ? "bg-[#FFE4E6] text-[#E11D48]" :
                      task.status === "Required" ? "bg-[#FEF3C7] text-[#D97706]" :
                        "bg-[#E8F8F0] text-[#15803D]"
                      }`}>
                      {task.status}
                    </span>
                    <div
                      onClick={notifyInDevelopment}
                      className="w-6 h-6 rounded-full border border-[#b20a1c] flex items-center justify-center text-[#b20a1c] hover:bg-red-50/50 cursor-pointer"
                    >
                      <Plus size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ─── Navigation Tabs, Filters & Layout Toggles ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-px gap-4 mt-6">
        <div className="flex gap-8 items-center text-sm font-bold text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab("courses")}
            className={`pb-3 transition-all relative ${activeTab === "courses"
              ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
              : "hover:text-gray-600"
              }`}
          >
            {c.myCoursesTab || "Khóa học của tôi"}
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`pb-3 transition-all relative ${activeTab === "classes"
              ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011]"
              : "hover:text-gray-600"
              }`}
          >
            {c.myClassesTab || "Lớp học của tôi"}
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Status Filter select */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 outline-none appearance-none cursor-pointer hover:border-gray-300"
            >
              <option value="all">All Status</option>
              <option value="teaching">Teaching</option>
              <option value="open">Open</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Grid/List togglers */}
          <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Grid Display Area ─── */}
      <div className="flex flex-col gap-8">

        {/* Course/Class Cards Container */}
        {filteredDisplayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 min-h-[260px]">
            <BookOpen size={54} className="text-gray-300 stroke-[1.2]" />
            <span>
              {activeTab === "courses"
                ? (language === "vi" ? "Chưa có khóa học nào" : "No courses yet")
                : (language === "vi" ? "Chưa có lớp học nào" : "No classes yet")}
            </span>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>

            {filteredDisplayList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(activeTab === "courses" ? `/workspace/courses/details/${item.id}` : `/workspace/courses/class/${item.id}`)}
                className={`bg-white rounded-3xl border border-gray-100 hover:border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex justify-between ${viewMode === "grid" ? "flex-col min-h-[460px]" : "flex-row items-center p-4 gap-6"
                  }`}
              >
                {/* Thumbnail Header Area */}
                <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${viewMode === "grid" ? "h-48 w-full bg-[#D9D9D9]" : "h-20 w-28 bg-[#D9D9D9] rounded-2xl"
                  }`}>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                      <item.icon size={viewMode === "grid" ? 48 : 24} className="stroke-[1.5]" />
                    </div>
                  )}

                  {viewMode === "grid" && (
                    <>
                      {/* Top-left capacity badge (for classes only) */}
                      {activeTab === "classes" && (
                        <div className="absolute top-3 left-3 bg-[#EAB308]/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Users size={11} className="fill-white" />
                          <span>{item.slots}</span>
                        </div>
                      )}

                      {/* Top-right status badge */}
                      {item.status && (
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.status === "TEACHING" ? "bg-[#E8F8F0] text-[#15803D]" :
                            item.status === "OPEN" || item.status === "OPEN_ENROLLMENT" ? "bg-[#EFF6FF] text-[#1D4ED8]" :
                              item.status === "LIVE" ? "bg-[#FFE4E6] text-[#E11D48]" :
                                "bg-[#F3F4F6] text-[#6B7280]"
                            }`}>
                            {item.status === "TEACHING" ? "Teaching" : item.status === "OPEN" ? "Open Enrollment" : item.status}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Details Body Area */}
                <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-base text-gray-950 leading-snug line-clamp-1 hover:text-[#b20a1c] transition-colors" title={item.title}>
                        {item.title}
                      </h4>

                      {/* Dropdown Options for Courses */}
                      {viewMode === "grid" && activeTab === "courses" && (
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(activeDropdown === item.id ? null : item.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === item.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-150 rounded-2xl shadow-lg py-1 z-30 text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                  navigate(`/workspace/courses/edit/${item.id}`);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <PenSquare size={13} className="text-gray-500" />
                                <span>{c.editCourse || "Edit Course"}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdown(null);
                                  deleteHelper.setTargetId(item.id);
                                }}
                                className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                              >
                                <Trash2 size={13} />
                                <span>{c.courseDetail?.deleteCourse || "Delete Course"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Courses Tab Attributes */}
                    {activeTab === "courses" ? (
                      <>
                        <span className="text-xs text-gray-400 font-bold block">
                          {language === "vi" ? `Khóa học ${item.title}` : `Course ${item.title}`}
                        </span>
                        {item.description && (
                          <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed mt-2" title={item.description}>
                            {item.description}
                          </p>
                        )}
                        <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-gray-500">
                          <div className="flex items-center gap-2">
                            <BookOpen size={13} className="text-gray-400" />
                            <span>{item.classCount} class{item.classCount !== 1 ? "es" : ""}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={13} className="text-gray-400" />
                            <span>{item.students}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Classes Tab Attributes */
                      <>
                        <span className="text-xs text-gray-400 font-bold block">
                          {language === "vi" ? `Lớp ${item.title}` : `Class ${item.title}`}
                        </span>

                        <div className="mt-4 flex flex-col gap-2 text-xs font-semibold text-gray-500">
                          <div className="flex items-center gap-2">
                            <Tag size={13} className="text-gray-400" />
                            <span className="text-gray-900 font-extrabold">{item.price}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={13} className="text-gray-400" />
                            <span>{item.schedule}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={13} className="text-gray-400" />
                            <span>{item.startDate} - {item.endDate}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        {item.status !== "OPEN" && (
                          <div className="mt-5">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-[#b20a1c] rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footers for cards */}
                  {activeTab === "courses" && (
                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-2 text-xs font-bold">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-gray-400 text-[10px] leading-none mb-0.5">Created Date</span>
                          <span className="text-gray-900 font-black">{item.createdAt}</span>
                        </div>
                        <span className="text-[#b20a1c] hover:underline font-extrabold text-xs">Manage Details &rarr;</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* View all centered button at bottom — hidden when no data */}
        {filteredDisplayList.length > 0 && (
          <button
            onClick={() => navigate(activeTab === "courses" ? "/workspace/courses/all" : "/workspace/courses/all-classes")}
            className="text-sm font-black text-[#b20a1c] hover:underline self-center py-2"
          >
            {language === "vi" ? "Xem tất cả" : "Xem tất cả"}
          </button>
        )}
      </div>

      <ConfirmationModal
        open={deleteHelper.isOpen}
        onClose={deleteHelper.handleCancel}
        onConfirm={deleteHelper.handleConfirm}
        title={c.courseDetail?.deleteCourse || "Delete Course"}
        message={c.courseDetail?.confirmDeleteCourse || "Are you sure you want to delete this course? All associated classes will also be affected."}
        confirmText={c.courseDetail?.deleteCourse || "Delete"}
        cancelText={c.createClass?.cancel || "Cancel"}
      />
    </div>
  )
}

export default MyCoursesPage
