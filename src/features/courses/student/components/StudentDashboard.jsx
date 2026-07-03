import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Search, LayoutGrid, List, ChevronDown, BookOpen, Users, Calendar, Clock, ArrowRight, Award } from "lucide-react"
import {
  useGetStudentEnrolledCoursesQuery,
  useGetStudentAvailableCoursesQuery,
  useGetStudentJoinedClassesQuery
} from "../../../../store/api/coursesApi"
import StudentCourseCard from "./StudentCourseCard"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

const StudentDashboard = ({ t }) => {
  const sc = t?.courses?.student || {}
  const navigate = useNavigate()

  // Local State
  const [activeTab, setActiveTab] = useState("enrolled") // "enrolled" | "explore" | "classes"
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [langFilter, setLangFilter] = useState("all")

  // API Queries
  const { data: enrolledCourses, isLoading: isEnrolledLoading } = useGetStudentEnrolledCoursesQuery()
  const { data: availableCourses, isLoading: isAvailableLoading } = useGetStudentAvailableCoursesQuery()
  const { data: joinedClasses, isLoading: isClassesLoading } = useGetStudentJoinedClassesQuery()

  const isLoading = isEnrolledLoading || isAvailableLoading || isClassesLoading

  // Handlers
  const handleOpenDetail = (course) => {
    navigate(`/workspace/courses/details/${course.id}`)
  }

  const handleJoinClassRoom = (cls) => {
    navigate(`/workspace/courses/class/${cls.id}`)
  }

  // Memoized listings and filters
  const currentCourses = useMemo(() => {
    if (activeTab === "enrolled") return enrolledCourses || []
    if (activeTab === "explore") return availableCourses || []
    return []
  }, [activeTab, enrolledCourses, availableCourses])

  const filteredCourses = useMemo(() => {
    return currentCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLevel =
        levelFilter === "all" || (course.levels && course.levels.includes(levelFilter))

      const matchesLang =
        langFilter === "all" || course.language.toLowerCase() === langFilter.toLowerCase()

      return matchesSearch && matchesLevel && matchesLang
    })
  }, [currentCourses, searchQuery, levelFilter, langFilter])

  const filteredClasses = useMemo(() => {
    const list = joinedClasses || []
    return list.filter((cls) => {
      const matchesSearch =
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.courseName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLevel =
        levelFilter === "all" || (cls.levels && cls.levels.includes(levelFilter))

      const matchesLang =
        langFilter === "all" || cls.language.toLowerCase() === langFilter.toLowerCase()

      return matchesSearch && matchesLevel && matchesLang
    })
  }, [joinedClasses, searchQuery, levelFilter, langFilter])

  // Extract unique filter dropdown values from all data
  const levelsOptions = ["HSK3", "HSK4", "N5", "B2", "C1", "A1", "A2"]
  const languagesOptions = ["Chinese", "English", "Japanese", "Vietnamese"]

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumb ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline">{t?.nav?.home || "Home"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{sc.dashboardTitle || "My Courses & Learning"}</span>
        </div>
      </div>

      {/* ─── Header Welcome Banner ─── */}
      <div className="bg-gradient-to-r from-[#990011] to-[#b20a1c] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden shrink-0">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {sc.welcomeTitle || "Welcome back, Learner!"}
            </h1>
            <p className="text-xs md:text-sm text-red-100 font-semibold max-w-lg leading-relaxed">
              {sc.welcomeSubtitle || "Track your progress, join live classes, and explore new learning paths."}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col min-w-[100px]">
              <span className="text-[10px] text-red-100 font-bold uppercase">Enrolled</span>
              <span className="text-2xl font-black mt-1">{(enrolledCourses || []).length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 flex flex-col min-w-[100px]">
              <span className="text-[10px] text-red-100 font-bold uppercase">Active Classes</span>
              <span className="text-2xl font-black mt-1">{(joinedClasses || []).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs & Filters ─── */}
      <div className="flex flex-col gap-4 mt-4">
        {/* Navigation Tabs */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-px overflow-x-auto whitespace-nowrap scrollbar-none gap-8">
          <div className="flex gap-8 text-sm font-bold text-gray-400">
            <button
              onClick={() => {
                setActiveTab("enrolled")
                setSearchQuery("")
              }}
              className={`pb-3 transition-all relative ${activeTab === "enrolled"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-[#990011] font-black"
                : "hover:text-gray-600 font-extrabold"
                }`}
            >
              {sc.enrolledCourses || "My Enrolled Courses"}
            </button>
            <button
              onClick={() => {
                setActiveTab("explore")
                setSearchQuery("")
              }}
              className={`pb-3 transition-all relative ${activeTab === "explore"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-[#990011] font-black"
                : "hover:text-gray-600 font-extrabold"
                }`}
            >
              {sc.exploreCourses || "Explore Available Courses"}
            </button>
            <button
              onClick={() => {
                setActiveTab("classes")
                setSearchQuery("")
              }}
              className={`pb-3 transition-all relative ${activeTab === "classes"
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2.5px] after:w-full after:bg-[#990011] font-black"
                : "hover:text-gray-600 font-extrabold"
                }`}
            >
              {sc.myClasses || "My Joined Classes"}
            </button>
          </div>

          {/* Grid/List Layout toggle controls */}
          {activeTab !== "classes" && (
            <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100 self-end sm:self-auto mb-2.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <LayoutGrid size={13} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white text-[#990011] shadow-xs" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <List size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Search & Selection Filters bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={sc.searchPlaceholder || "Search courses..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 bg-white hover:bg-gray-50/50 focus:bg-white border border-gray-200 focus:border-gray-300 outline-none rounded-xl text-sm font-semibold text-gray-800 transition-all placeholder:text-gray-400 shadow-xs"
            />
            <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Selector Dropdowns */}
          <div className="flex gap-3 items-center">
            {/* Language filter */}
            <div className="relative shrink-0">
              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 outline-none appearance-none cursor-pointer hover:border-gray-300"
              >
                <option value="all">{sc.allLanguages || "All Languages"}</option>
                {languagesOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Level filter */}
            <div className="relative shrink-0">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 outline-none appearance-none cursor-pointer hover:border-gray-300"
              >
                <option value="all">{sc.allLevels || "All Levels"}</option>
                {levelsOptions.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Display Area ─── */}
      <div className="mt-4">
        {activeTab === "classes" ? (
          /* Tab 3: Joined Classes Layout */
          filteredClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 min-h-[300px] bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
              <Calendar size={54} className="text-gray-300 stroke-[1.2]" />
              <h3 className="font-extrabold text-gray-800 text-lg">{sc.noClassesTitle || "No Active Classes"}</h3>
              <p className="text-sm font-semibold max-w-xs">{sc.noClassesDesc || "You don't have any scheduled sessions right now."}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleJoinClassRoom(cls)}
                    className="bg-white rounded-3xl border border-gray-100 hover:border-gray-200 p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-xs transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          {cls.language}
                        </span>
                        <span className="bg-gray-100 text-gray-600 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          {cls.levels[0]}
                        </span>
                        <span className="bg-green-50 text-green-700 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          Active
                        </span>
                      </div>

                      <h3 className="font-black text-lg text-gray-950 leading-snug">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold -mt-1 uppercase tracking-wide">
                        Course: {cls.courseName}
                      </p>

                      {/* Class timing details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-gray-400" />
                          <span>{cls.schedule?.days?.join(" - ")} | {cls.schedule?.startTime} - {cls.schedule?.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{cls.startDate} - {cls.endDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking and quick actions */}
                    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-gray-150 shrink-0">
                      <div className="flex flex-col min-w-[120px] gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                          <span>{sc.progress || "Progress"}</span>
                          <span>{cls.progress ? Math.round((cls.progress.completedSessions / cls.progress.totalSessions) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${cls.progress ? (cls.progress.completedSessions / cls.progress.totalSessions) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 text-right mt-0.5">
                          {cls.progress?.completedSessions}/{cls.progress?.totalSessions} sessions completed
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinClassRoom(cls)
                        }}
                        className="h-9 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <span>Join Room</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming sessions details list */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col gap-4 mt-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award size={18} className="text-[#990011]" />
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider">
                    {sc.upcomingSessions || "Upcoming Sessions & Schedule"}
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {filteredClasses.flatMap(cls =>
                    (cls.sessions || []).map(sess => ({ ...sess, classTitle: cls.title }))
                  ).slice(0, 4).map((sess, idx) => (
                    <div key={idx} className="flex items-start gap-4 hover:bg-gray-50/50 p-2 rounded-2xl transition-colors">
                      <div className="w-10 h-10 shrink-0 bg-[#FFE4E6] text-[#E11D48] rounded-full flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black leading-none uppercase">{new Date(sess.date).toLocaleString('en-US', { month: 'short' })}</span>
                        <span className="text-sm font-black leading-none mt-0.5">{new Date(sess.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-400 uppercase truncate">{sess.classTitle}</h4>
                        <p className="text-sm font-black text-gray-950 truncate mt-0.5">Session {sess.number}: {sess.topic}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 font-semibold">
                          <Clock size={11} />
                          <span>{sess.startTime} - {sess.endTime}</span>
                        </div>
                      </div>
                      <span className="bg-[#EFF6FF] text-[#1D4ED8] font-bold text-[9px] px-2 py-0.5 rounded uppercase self-center shrink-0">
                        Scheduled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          /* Tab 1 & Tab 2: Courses Layout */
          filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 min-h-[300px] bg-white rounded-3xl border border-gray-100 p-6 shadow-xs">
              <BookOpen size={54} className="text-gray-300 stroke-[1.2]" />
              <h3 className="font-extrabold text-gray-800 text-lg">
                {activeTab === "enrolled" ? (sc.noEnrolledTitle || "No Enrolled Courses") : "No Courses Found"}
              </h3>
              <p className="text-sm font-semibold max-w-xs">
                {activeTab === "enrolled"
                  ? (sc.noEnrolledDesc || "You haven't enrolled in any courses yet. Visit the explore tab to browse!")
                  : "Try clearing your search query or filters to find other courses."}
              </p>
              {activeTab === "enrolled" && (
                <button
                  onClick={() => setActiveTab("explore")}
                  className="mt-2 h-9 px-5 bg-[#b20a1c] hover:bg-[#990011] text-white text-xs font-black rounded-full flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <span>{sc.exploreMore || "Explore Courses"}</span>
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {filteredCourses.map((course, idx) => (
                <StudentCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={activeTab === "enrolled"}
                  viewMode={viewMode}
                  onViewDetails={() => handleOpenDetail(course)}
                  onJoin={() => handleOpenDetail(course)} // View detail drawer to select batch!
                  t={t}
                  index={idx}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default StudentDashboard
