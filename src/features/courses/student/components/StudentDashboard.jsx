import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Calendar, Clock, ArrowRight, Award, Flame, Sparkles, Compass, Play, Globe } from "lucide-react"
import {
  useGetStudentAvailableCoursesQuery,
  useGetStudentJoinedClassesQuery
} from "../../../../store/api/coursesApi"
import StudentCourseCard from "./StudentCourseCard"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useGetProfileQuery } from "@/features/auth"
import CourseSearchInput from "../../components/CourseSearchInput"
import CourseSelectFilter from "../../components/CourseSelectFilter"
import CourseTabs from "../../components/CourseTabs"
import ViewModeToggle from "../../components/shared/ViewModeToggle"
import { filterStudentClasses, filterStudentCourses } from "../../utils/courseTransforms"

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
  const { data: userData } = useGetProfileQuery()
  const { data: joinedClasses, isLoading: isClassesLoading } = useGetStudentJoinedClassesQuery()
  const { data: availableCourses, isLoading: isAvailableLoading } = useGetStudentAvailableCoursesQuery(
    undefined,
    { skip: activeTab !== "explore" }
  )

  const isLoading = isClassesLoading || (activeTab === "explore" && isAvailableLoading)

  // Handlers
  const handleOpenDetail = (course) => {
    navigate(`/workspace/learning/details/${course.id}`)
  }

  const handleJoinClassRoom = (cls) => {
    navigate(`/workspace/learning/class/${cls.id}`)
  }

  // The joined-classes response comes from the same endpoint that previously powered
  // the enrolled-courses query, so derive the course cards without making a second request.
  const enrolledCourses = useMemo(() => (
    (joinedClasses || []).map((cls) => ({
      id: cls.courseId?.toString() || "",
      name: cls.courseName || cls.courseTitle || "Untitled Course",
      title: cls.courseName || cls.courseTitle || "Untitled Course",
      language: cls.language || "English",
      levels: cls.levels || ["A1"],
      description: cls.courseName ? `Enrolled in class ${cls.name || cls.title}` : "",
      totalSessions: cls.progress?.totalSessions || cls.totalSessions || 24,
      classCount: 1,
      studentCount: cls.studentCount || cls.enrolledStudents || 0,
      status: cls.status || "OPEN",
      thumbnailUrl: cls.thumbnailUrl || "",
      enrolledClassId: cls.id?.toString() || "",
      enrolledClassName: cls.name || cls.title || "",
      progress: cls.progress || { completedSessions: 0, totalSessions: 24 },
    }))
  ), [joinedClasses])

  // Memoized listings and filters
  const currentCourses = useMemo(() => {
    if (activeTab === "enrolled") return enrolledCourses || []
    if (activeTab === "explore") return availableCourses || []
    return []
  }, [activeTab, enrolledCourses, availableCourses])

  const filters = useMemo(() => ({
    searchQuery,
    levelFilter,
    langFilter,
  }), [searchQuery, levelFilter, langFilter])

  const filteredCourses = useMemo(() => (
    filterStudentCourses(currentCourses, filters)
  ), [currentCourses, filters])

  const filteredClasses = useMemo(() => (
    filterStudentClasses(joinedClasses || [], filters)
  ), [joinedClasses, filters])

  // Extract unique filter dropdown values from all data
  const levelsOptions = ["HSK3", "HSK4", "N5", "B2", "C1", "A1", "A2"]
  const languagesOptions = ["Chinese", "English", "Japanese", "Vietnamese"]
  const languageFilterOptions = [
    { value: "all", label: sc.allLanguages || "All Languages" },
    ...languagesOptions.map((lang) => ({ value: lang, label: sc.languages?.[lang] || lang })),
  ]
  const levelFilterOptions = [
    { value: "all", label: sc.allLevels || "All Levels" },
    ...levelsOptions.map((level) => ({ value: level, label: level })),
  ]
  const studentTabs = [
    { value: "enrolled", label: sc.enrolledCourses || "My Enrolled Courses", icon: BookOpen },
    { value: "explore", label: sc.exploreCourses || "Explore Catalog", icon: Compass },
    { value: "classes", label: sc.myClasses || "Joined Classes", icon: Calendar },
  ]

  if (isLoading) {
    return <LoadingSpinner className="flex justify-center items-center min-h-[400px]" />
  }

  const getGreeting = () => {
    const hrs = new Date().getHours()
    if (hrs < 12) return sc.greetingMorning || "Good morning"
    if (hrs < 18) return sc.greetingAfternoon || "Good afternoon"
    return sc.greetingEvening || "Good evening"
  }

  const activeCourse = enrolledCourses && enrolledCourses.length > 0 ? enrolledCourses[0] : null
  const activeClass = activeCourse ? (joinedClasses || []).find(cls => cls.id === activeCourse.enrolledClassId || cls.courseId === activeCourse.id) : null
  const nextSession = activeClass?.sessions && activeClass.sessions.length > 0 ? activeClass.sessions[0] : null

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumb ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <span className="cursor-pointer hover:underline" onClick={() => navigate("/workspace")}>{t?.nav?.home || "Home"}</span>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{sc.dashboardTitle || "My Courses & Learning"}</span>
        </div>
      </div>

      {/* ─── Coursera-Style Student Profile Welcome Banner ─── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs relative flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 mt-2">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar initial in dark circle */}
          <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-black text-xl shadow-xs shrink-0 select-none">
            {userData?.data?.name?.charAt(0).toUpperCase() || userData?.name?.charAt(0).toUpperCase() || "N"}
          </div>

          <div className="flex flex-col gap-1.5 mt-0.5">
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              {getGreeting()}, {userData?.data?.name || userData?.name || sc.learner || "Learner"}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1.5 text-xs text-gray-500 font-semibold leading-relaxed mt-0.5">
              {sc.greetingSubtitle || "Good day to start learning a new language!"}
            </div>
          </div>
        </div>

        {/* Isometric 3D Portal Illustration on the right */}
        <div className="w-56 h-36 shrink-0 relative overflow-hidden flex items-center justify-center select-none bg-slate-50/50 rounded-2xl border border-gray-100/50">
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="115" rx="80" ry="25" fill="#f1f5f9" />
            <path d="M70 120 L110 80 L130 90 L90 130 Z" fill="#c7d2fe" />
            <path d="M75 118 L85 110" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M85 110 L95 102" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M95 102 L105 94" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />

            <path d="M110 40 L140 25 L170 40 L170 95 L110 95 Z" fill="#fef3c7" />
            <path d="M170 40 L190 30 L190 85 L170 95 Z" fill="#f59e0b" opacity="0.8" />
            <path d="M130 95 L130 70 A 15 15 0 0 1 150 70 L150 95 Z" fill="#d97706" />
            <path d="M110 40 L140 25 L170 40 L140 50 Z" fill="#fbbf24" />

            <g transform="translate(30, 75)">
              <ellipse cx="15" cy="40" rx="15" ry="6" fill="#cbd5e1" />
              <path d="M15 10 L25 35 L5 35 Z" fill="#34d399" />
              <path d="M15 0 L22 25 L8 25 Z" fill="#10b981" />
              <rect x="13" y="35" width="4" height="8" fill="#78350f" />
            </g>
            <g transform="translate(175, 55)">
              <ellipse cx="10" cy="30" rx="10" ry="4" fill="#cbd5e1" />
              <path d="M10 5 L17 25 L3 25 Z" fill="#34d399" />
              <rect x="9" y="25" width="2" height="6" fill="#78350f" />
            </g>
          </svg>
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="flex flex-col gap-6">

        {/* ─── Active Focus / Resume Learning Card ─── */}
        {activeTab === "enrolled" && activeCourse && (
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">{sc.activeFocus || "Active Focus"}</span>
                </div>
                {activeClass?.progress && (
                  <span className="text-xs font-extrabold text-gray-500">
                    {Math.round((activeClass.progress.completedSessions / activeClass.progress.totalSessions) * 100)}% {sc.completed || "Completed"}
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-gray-950 truncate leading-snug group-hover:text-[#990011] transition-colors">
                    {activeCourse.title}
                  </h2>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-wide">
                    {sc.classLabel || "Class: "}{activeClass?.title || activeCourse.enrolledClassName || "N/A"}
                  </p>

                  {nextSession ? (
                    <div className="mt-3 p-3 bg-red-50/50 border border-red-100/50 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-[#990011] flex items-center justify-center shrink-0">
                        <Play size={14} className="ml-0.5 fill-[#990011]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 leading-snug">
                          {(sc.nextUpSession || "Next Up: Session {{number}} • {{topic}}").replace("{{number}}", nextSession.number).replace("{{topic}}", nextSession.topic)}
                        </p>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1.5">
                          <Clock size={11} /> {nextSession.startTime} - {nextSession.endTime} ({nextSession.date})
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 font-medium">{sc.noSessionsScheduled || "No sessions scheduled currently."}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleJoinClassRoom(activeClass || { id: activeCourse.enrolledClassId })}
                    className="h-11 px-6 bg-[#990011] hover:bg-[#b20a1c] text-white font-extrabold text-sm rounded-full flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 group-hover:translate-x-0.5"
                  >
                    <span>{sc.resumeLearning || "Resume Learning"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {activeClass?.progress && (
                <div className="w-full mt-2">
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#990011] to-[#e7001a] rounded-full transition-all duration-500"
                      style={{ width: `${(activeClass.progress.completedSessions / activeClass.progress.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Navigation Tabs & Layout Toggles ─── */}
        <div className="flex flex-col gap-4 bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-px overflow-x-auto whitespace-nowrap scrollbar-none gap-8">
            <CourseTabs
              tabs={studentTabs}
              activeTab={activeTab}
              onChange={(tab) => {
                setActiveTab(tab)
                setSearchQuery("")
              }}
            />

            {/* Grid/List Layout toggle controls */}
            {activeTab !== "classes" && (
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
                className="self-end sm:self-auto mb-2"
              />
            )}
          </div>

          {/* Search & Selection Filters bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between">
            {/* Search Box */}
            <CourseSearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={sc.searchPlaceholder || "Search courses..."}
              className="flex-1"
            />

            {/* Selector Dropdowns */}
            <div className="flex gap-3 items-center">
              <CourseSelectFilter
                value={langFilter}
                onChange={setLangFilter}
                options={languageFilterOptions}
              />
              <CourseSelectFilter
                value={levelFilter}
                onChange={setLevelFilter}
                options={levelFilterOptions}
              />
            </div>
          </div>
        </div>

        {/* Cards Display Grid */}
        <div>
          {activeTab === "classes" ? (
            /* Tab 3: Joined Classes Layout */
            filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 min-h-[300px] bg-white rounded-3xl border border-gray-150 p-6 shadow-xs">
                <Calendar size={54} className="text-gray-300 stroke-[1.2]" />
                <h3 className="font-extrabold text-gray-800 text-lg">{sc.noClassesTitle || "No Active Classes"}</h3>
                <p className="text-sm font-semibold max-w-xs">{sc.noClassesDesc || "You don't have any scheduled sessions right now."}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredClasses.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleJoinClassRoom(cls)}
                    className="bg-white rounded-3xl border border-gray-150 hover:border-gray-250 p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#FEF3C7] text-[#D97706] font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          {sc.languages?.[cls.language] || cls.language}
                        </span>
                        <span className="bg-gray-100 text-gray-600 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          {cls.levels[0]}
                        </span>
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {sc.activeStatus || "Active"}
                        </span>
                      </div>

                      <h3 className="font-black text-lg text-gray-950 leading-snug group-hover:text-[#990011] transition-colors">
                        {cls.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-bold -mt-1 uppercase tracking-wide">
                        {sc.courseLabel || "Course: "}{cls.courseName}
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
                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-150 shrink-0">
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
                          {cls.progress?.completedSessions}/{cls.progress?.totalSessions} {sc.sessionsCountText || "sessions"}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinClassRoom(cls)
                        }}
                        className="h-9 px-5 bg-[#990011] hover:bg-[#b20a1c] text-white text-xs font-black rounded-full flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 group-hover:translate-x-0.5"
                      >
                        <span>{sc.joinRoom || "Join Room"}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Tab 1 & Tab 2: Courses Layout */
            filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 font-bold text-base gap-3 min-h-[300px] bg-white rounded-3xl border border-gray-150 p-6 shadow-xs">
                <BookOpen size={54} className="text-gray-300 stroke-[1.2]" />
                <h3 className="font-extrabold text-gray-800 text-lg">
                  {activeTab === "enrolled" ? (sc.noEnrolledTitle || "No Enrolled Courses") : (sc.noCoursesFound || "No Courses Found")}
                </h3>
                <p className="text-sm font-semibold max-w-xs">
                  {activeTab === "enrolled"
                    ? (sc.noEnrolledDesc || "You haven't enrolled in any courses yet. Visit the explore tab to browse!")
                    : (sc.noCoursesFoundDesc || "Try clearing your search query or filters to find other courses.")}
                </p>
                {activeTab === "enrolled" && (
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="mt-2 h-9 px-5 bg-[#990011] hover:bg-[#b20a1c] text-white text-xs font-black rounded-full flex items-center justify-center gap-1 transition-all active:scale-95"
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
                    onJoin={() => handleOpenDetail(course)}
                    t={t}
                    index={idx}
                  />
                ))}
              </div>
            ))}
        </div>

      </div>

    </div>
  )
}

export default StudentDashboard
