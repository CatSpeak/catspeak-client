import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Calendar, Clock, ArrowRight, Compass, Play, RefreshCw } from "lucide-react"
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
import TablePagination from "../../components/shared/TablePagination"
import { filterStudentClasses, filterStudentCourses } from "../../utils/courseTransforms"

const UNKNOWN_VALUE = "—"
const PAGE_SIZE = 24
const SUPPORTED_ROUTE_LANGUAGES = new Set(["en", "vi", "zh"])
const SIMPLE_TIME_PATTERN = /^\d{2}:\d{2}(?::\d{2})?$/

const isRecord = (value) => (
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value)
)

const toText = (value) => {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

const toNonNegativeNumber = (value) => {
  if (value === null || value === undefined || value === "") return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

const toTextList = (value) => {
  const values = Array.isArray(value) ? value : [value]
  return [...new Set(values.map(toText).filter(Boolean))]
}

const toSafeImageUrl = (value) => {
  const url = toText(value)
  if (!url) return ""
  const hasControlCharacter = [...url].some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint <= 31 || codePoint === 127
  })
  if (hasControlCharacter || url.startsWith("#")) return ""

  try {
    const parsedUrl = new URL(url, window.location.origin)
    return (
      ["http:", "https:"].includes(parsedUrl.protocol)
      && !parsedUrl.username
      && !parsedUrl.password
    )
      ? parsedUrl.href
      : ""
  } catch {
    return ""
  }
}

const normalizeProgress = (progress, completedFallback, totalFallback) => {
  const source = isRecord(progress) ? progress : {}
  const completedSessions = toNonNegativeNumber(
    source.completedSessions ?? completedFallback,
  )
  const totalSessions = toNonNegativeNumber(
    source.totalSessions ?? totalFallback,
  )

  if (completedSessions === null || totalSessions === null || totalSessions <= 0) {
    return null
  }

  return {
    completedSessions: Math.min(completedSessions, totalSessions),
    totalSessions,
  }
}

const getProgressPercent = (progress) => {
  if (!progress?.totalSessions) return 0
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (progress.completedSessions / progress.totalSessions) * 100,
      ),
    ),
  )
}

const formatDisplayDate = (value) => {
  const text = toText(value)
  if (!/^\d{4}-\d{2}-\d{2}(?:[T\s]|$)/.test(text)) {
    return UNKNOWN_VALUE
  }

  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return UNKNOWN_VALUE

  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

const getSessionTimestamp = (dateValue, timeValue) => {
  const date = toText(dateValue)
  const time = toText(timeValue)

  if (time && !SIMPLE_TIME_PATTERN.test(time)) {
    const timestamp = new Date(time).getTime()
    if (Number.isFinite(timestamp)) return timestamp
  }

  const datePart = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (datePart && time && SIMPLE_TIME_PATTERN.test(time)) {
    return new Date(`${datePart}T${time}`).getTime()
  }

  const timestamp = new Date(date).getTime()
  return Number.isFinite(timestamp) ? timestamp : Number.NaN
}

const formatLocalDatePart = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-")

const formatLocalTimePart = (date) => [
  String(date.getHours()).padStart(2, "0"),
  String(date.getMinutes()).padStart(2, "0"),
].join(":")

const normalizeSession = (session) => {
  if (!isRecord(session)) return null

  const rawDate = toText(session.date)
  const rawStartTime = toText(session.startTime)
  const rawEndTime = toText(session.endTime)
  const startTimestamp = getSessionTimestamp(rawDate, rawStartTime)
  const startDate = Number.isFinite(startTimestamp)
    ? new Date(startTimestamp)
    : null
  const hasAbsoluteStartTime = (
    rawStartTime
    && !SIMPLE_TIME_PATTERN.test(rawStartTime)
  )
  const endTimestamp = getSessionTimestamp(
    startDate ? formatLocalDatePart(startDate) : rawDate,
    rawEndTime,
  )

  return {
    number: toText(session.number ?? session.sessionNumber),
    topic: toText(session.topic ?? session.title),
    startTime: hasAbsoluteStartTime && startDate
      ? formatLocalTimePart(startDate)
      : rawStartTime,
    endTime: (
      rawEndTime
      && !SIMPLE_TIME_PATTERN.test(rawEndTime)
      && Number.isFinite(endTimestamp)
    )
      ? formatLocalTimePart(new Date(endTimestamp))
      : rawEndTime,
    date: hasAbsoluteStartTime && startDate
      ? formatLocalDatePart(startDate)
      : rawDate.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || rawDate,
    isLive: session.isLive === true,
    startTimestamp,
  }
}

const getUpcomingSession = (classData) => {
  const canonicalNextSession = classData?.nextSession
  if (Number.isFinite(canonicalNextSession?.startTimestamp)) {
    return canonicalNextSession
  }

  const now = Date.now()
  return (classData?.sessions || [])
    .filter((session) => (
      Number.isFinite(session.startTimestamp)
      && session.startTimestamp >= now
    ))
    .sort((left, right) => left.startTimestamp - right.startTimestamp)[0]
    || null
}

const normalizeClass = (cls) => {
  if (!isRecord(cls)) return null

  const id = toText(cls.id)
  if (!id) return null

  const schedule = isRecord(cls.schedule)
    ? {
      days: toTextList(cls.schedule.days),
      startTime: toText(cls.schedule.startTime),
      endTime: toText(cls.schedule.endTime),
    }
    : null

  return {
    id,
    courseId: toText(cls.courseId),
    courseName: toText(cls.courseName ?? cls.courseTitle),
    courseTitle: toText(cls.courseTitle ?? cls.courseName),
    name: toText(cls.name ?? cls.title),
    title: toText(cls.title ?? cls.name),
    language: toText(cls.language),
    levels: toTextList(cls.levels),
    progress: normalizeProgress(
      cls.progress,
      cls.completedSessions,
      cls.totalSessions,
    ),
    totalSessions: toNonNegativeNumber(cls.totalSessions),
    studentCount: toNonNegativeNumber(
      cls.studentCount ?? cls.enrolledStudents,
    ),
    status: toText(cls.status),
    thumbnailUrl: toSafeImageUrl(cls.thumbnailUrl),
    startDate: toText(cls.startDate),
    endDate: toText(cls.endDate),
    schedule,
    nextSession: normalizeSession(cls.nextSession),
    sessions: Array.isArray(cls.sessions)
      ? cls.sessions.map(normalizeSession).filter(Boolean)
      : [],
  }
}

const normalizeCourse = (course) => {
  if (!isRecord(course)) return null

  const id = toText(course.id)
  if (!id) return null

  const priceRange = isRecord(course.priceRange)
    ? {
      min: toNonNegativeNumber(course.priceRange.min),
      max: toNonNegativeNumber(course.priceRange.max),
    }
    : null
  const hasValidPriceRange = (
    priceRange !== null &&
    priceRange.min !== null &&
    priceRange.max !== null &&
    priceRange.min <= priceRange.max
  )

  return {
    id,
    name: toText(course.name ?? course.title),
    title: toText(course.title ?? course.name) || "Untitled course",
    language: toText(course.language) || UNKNOWN_VALUE,
    levels: toTextList(course.levels),
    description: toText(course.description),
    totalSessions: toNonNegativeNumber(course.totalSessions) ?? UNKNOWN_VALUE,
    classCount: toNonNegativeNumber(course.classCount) ?? UNKNOWN_VALUE,
    studentCount: toNonNegativeNumber(
      course.studentCount ?? course.totalStudents,
    ),
    status: toText(course.status),
    thumbnailUrl: toSafeImageUrl(course.thumbnailUrl),
    instructorName: toText(
      course.instructorName ??
      course.teacher?.name ??
      course.teacher?.fullName,
    ) || "Instructor unavailable",
    priceRange: hasValidPriceRange ? priceRange : null,
  }
}

const normalizeCollection = (value, normalizeItem) => {
  if (!Array.isArray(value)) {
    return {
      items: [],
      issueCount: value === undefined ? 0 : 1,
      hasMalformedShape: value !== undefined,
    }
  }

  const seenIds = new Set()
  const items = []
  let issueCount = 0

  value.forEach((rawItem) => {
    const item = normalizeItem(rawItem)
    if (!item || seenIds.has(item.id)) {
      issueCount += 1
      return
    }

    seenIds.add(item.id)
    items.push(item)
  })

  return { items, issueCount, hasMalformedShape: false }
}

const StudentDashboard = ({ t, language }) => {
  const sc = useMemo(() => t?.courses?.student || {}, [t])
  const navigate = useNavigate()
  const normalizedLanguage = toText(language).toLowerCase()
  const routeLanguage = SUPPORTED_ROUTE_LANGUAGES.has(normalizedLanguage)
    ? normalizedLanguage
    : "vi"

  // Local State
  const [activeTab, setActiveTab] = useState("enrolled") // "enrolled" | "explore" | "classes"
  const [viewMode, setViewMode] = useState("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [langFilter, setLangFilter] = useState("all")
  const [classesPage, setClassesPage] = useState(1)
  const [availablePage, setAvailablePage] = useState(1)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 400)
    return () => window.clearTimeout(timerId)
  }, [searchQuery])

  // API Queries
  const profileQuery = useGetProfileQuery()
  const classesQuery = useGetStudentJoinedClassesQuery({
    all: true,
    pageSize: 100,
  })
  const availableCoursesQuery = useGetStudentAvailableCoursesQuery(
    {
      page: availablePage,
      pageSize: PAGE_SIZE,
      search: debouncedSearchQuery || undefined,
      language: langFilter === "all" ? undefined : langFilter,
    },
    { skip: activeTab !== "explore" }
  )

  const normalizedClasses = useMemo(
    () => normalizeCollection(
      isRecord(classesQuery.currentData)
        ? classesQuery.currentData.data
        : classesQuery.currentData,
      normalizeClass,
    ),
    [classesQuery.currentData],
  )
  const normalizedAvailableCourses = useMemo(
    () => normalizeCollection(
      isRecord(availableCoursesQuery.currentData)
        ? availableCoursesQuery.currentData.data
        : availableCoursesQuery.currentData,
      normalizeCourse,
    ),
    [availableCoursesQuery.currentData],
  )
  const joinedClasses = normalizedClasses.items
  const availableCourses = normalizedAvailableCourses.items
  const profile = isRecord(profileQuery.data?.data)
    ? profileQuery.data.data
    : isRecord(profileQuery.data)
      ? profileQuery.data
      : null
  const displayName = toText(profile?.name) || sc.learner || "Learner"
  const avatarInitial = Array.from(displayName)[0]?.toLocaleUpperCase() || "?"
  const isProfileMalformed = (
    profileQuery.data !== undefined &&
    profile === null
  )

  // Handlers
  const handleOpenDetail = (course) => {
    const courseId = toText(course?.id)
    if (!courseId) return
    navigate(`/workspace/learning/details/${encodeURIComponent(courseId)}`)
  }

  const handleOpenClassDetail = (cls) => {
    const classId = toText(cls?.id)
    if (!classId) return
    navigate(`/workspace/learning/class/${encodeURIComponent(classId)}`)
  }

  const handleJoinClassRoom = (cls) => {
    const classId = toText(cls?.id)
    if (!classId) return
    navigate(
      `/${routeLanguage}/meet/${encodeURIComponent(`class-${classId}`)}`,
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setLevelFilter("all")
    setLangFilter("all")
    setClassesPage(1)
    setAvailablePage(1)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    clearFilters()
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setClassesPage(1)
    setAvailablePage(1)
  }

  const handleLanguageFilterChange = (value) => {
    setLangFilter(value)
    setClassesPage(1)
    setAvailablePage(1)
  }

  const handleLevelFilterChange = (value) => {
    setLevelFilter(value)
    setClassesPage(1)
    setAvailablePage(1)
  }

  // The joined-classes response comes from the same endpoint that previously powered
  // the enrolled-courses query, so derive the course cards without making a second request.
  const enrolledCourseResult = useMemo(() => {
    const coursesById = new Map()
    let issueCount = 0

    joinedClasses.forEach((cls) => {
      if (!cls.courseId) {
        issueCount += 1
        return
      }

      const existingCourse = coursesById.get(cls.courseId)
      if (existingCourse) {
        existingCourse.classCount += 1
        existingCourse.levels = [
          ...new Set([...existingCourse.levels, ...cls.levels]),
        ]
        return
      }

      coursesById.set(cls.courseId, {
        id: cls.courseId,
        name: cls.courseName || cls.courseTitle || "Untitled course",
        title: cls.courseName || cls.courseTitle || "Untitled course",
        language: cls.language || UNKNOWN_VALUE,
        levels: cls.levels,
        description: "",
        totalSessions: cls.progress?.totalSessions
          ?? cls.totalSessions
          ?? UNKNOWN_VALUE,
        classCount: 1,
        studentCount: cls.studentCount,
        status: cls.status,
        thumbnailUrl: cls.thumbnailUrl,
        instructorName: "Instructor unavailable",
        enrolledClassId: cls.id,
        enrolledClassName: cls.name || cls.title,
        progress: cls.progress,
      })
    })

    return {
      items: [...coursesById.values()],
      issueCount,
    }
  }, [joinedClasses])
  const enrolledCourses = enrolledCourseResult.items

  // Memoized listings and filters
  const currentCourses = useMemo(() => {
    if (activeTab === "enrolled") return enrolledCourses
    if (activeTab === "explore") return availableCourses
    return []
  }, [activeTab, enrolledCourses, availableCourses])

  const filters = useMemo(() => ({
    searchQuery,
    levelFilter: activeTab === "explore" ? "all" : levelFilter,
    langFilter,
  }), [activeTab, searchQuery, levelFilter, langFilter])

  const filteredCourses = useMemo(() => (
    filterStudentCourses(currentCourses, filters)
  ), [currentCourses, filters])

  const filteredClasses = useMemo(() => (
    filterStudentClasses(joinedClasses, filters)
  ), [joinedClasses, filters])
  const localFilteredItems = activeTab === "classes"
    ? filteredClasses
    : filteredCourses
  const localTotalPages = Math.max(
    1,
    Math.ceil(localFilteredItems.length / PAGE_SIZE),
  )
  const boundedClassesPage = Math.min(classesPage, localTotalPages)
  const localPageStart = (boundedClassesPage - 1) * PAGE_SIZE
  const visibleFilteredClasses = activeTab === "classes"
    ? filteredClasses.slice(localPageStart, localPageStart + PAGE_SIZE)
    : filteredClasses
  const visibleFilteredCourses = activeTab === "enrolled"
    ? filteredCourses.slice(localPageStart, localPageStart + PAGE_SIZE)
    : filteredCourses

  const activeFilterItems = activeTab === "explore"
    ? availableCourses
    : joinedClasses
  const levelsOptions = [
    ...new Set(activeFilterItems.flatMap((item) => item.levels)),
  ].sort((a, b) => a.localeCompare(b))
  const languagesOptions = [
    ...new Set(
      activeFilterItems
        .map((item) => item.language)
        .filter((language) => language && language !== UNKNOWN_VALUE),
    ),
  ].sort((a, b) => a.localeCompare(b))
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

  const activeCurrentData = activeTab === "explore"
    ? availableCoursesQuery.currentData
    : classesQuery.currentData
  const isActiveListLoading = activeTab === "explore"
    ? (
      availableCoursesQuery.isLoading
      || (
        availableCoursesQuery.isFetching
        && activeCurrentData === undefined
      )
    )
    : (
      classesQuery.isLoading
      || (classesQuery.isFetching && activeCurrentData === undefined)
    )
  const isActiveListFetching = activeTab === "explore"
    ? availableCoursesQuery.isFetching
    : classesQuery.isFetching
  const activeListError = activeTab === "explore"
    ? availableCoursesQuery.error
    : classesQuery.error
  const retryActiveList = activeTab === "explore"
    ? availableCoursesQuery.refetch
    : classesQuery.refetch
  const activeSourceItems = activeTab === "classes"
    ? joinedClasses
    : currentCourses
  const filteredItems = activeTab === "classes"
    ? filteredClasses
    : filteredCourses
  const activeNormalization = activeTab === "explore"
    ? normalizedAvailableCourses
    : normalizedClasses
  const activeIssueCount = (
    activeNormalization.issueCount +
    (activeTab === "enrolled" ? enrolledCourseResult.issueCount : 0)
  )
  const activePagination = activeTab === "explore"
    ? availableCoursesQuery.currentData?.pagination
    : classesQuery.currentData?.pagination
  const serverTotalItems = toNonNegativeNumber(activePagination?.totalItems)
  const parsedTotalPages = Number(activePagination?.totalPages)
  const activeTotalPages = activeTab === "explore"
    ? (
      Number.isFinite(parsedTotalPages)
        ? Math.max(1, Math.floor(parsedTotalPages))
        : 1
    )
    : localTotalPages
  const activeTotalItems = activeTab === "explore"
    ? serverTotalItems
    : localFilteredItems.length
  const activePage = activeTab === "explore"
    ? availablePage
    : boundedClassesPage
  const setActivePage = activeTab === "explore"
    ? setAvailablePage
    : setClassesPage
  const hasActiveDataIssue = (
    activeNormalization.hasMalformedShape ||
    activeIssueCount > 0
  )
  const hasActiveFilters = (
    searchQuery.trim() !== "" ||
    levelFilter !== "all" ||
    langFilter !== "all"
  )
  const isFilteredEmpty = (
    hasActiveFilters &&
    activeSourceItems.length > 0 &&
    filteredItems.length === 0
  )

  if (
    activeTab !== "explore"
    && (
      classesQuery.isLoading
      || (
        classesQuery.isFetching
        && classesQuery.currentData === undefined
      )
    )
  ) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[400px] items-center justify-center"
      >
        <LoadingSpinner />
        <span className="sr-only">
          {sc.loadingLearningData || "Loading your learning data"}
        </span>
      </div>
    )
  }

  const getGreeting = () => {
    const hrs = new Date().getHours()
    if (hrs < 12) return sc.greetingMorning || "Good morning"
    if (hrs < 18) return sc.greetingAfternoon || "Good afternoon"
    return sc.greetingEvening || "Good evening"
  }

  const activeCourse = enrolledCourses[0] || null
  const activeClass = activeCourse
    ? joinedClasses.find((cls) => cls.id === activeCourse.enrolledClassId)
    : null
  const activeProgressPercent = getProgressPercent(activeClass?.progress)
  const nextSession = getUpcomingSession(activeClass)

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e]">
      {/* ─── Breadcrumb ─── */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-gray-400 font-medium flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/workspace")}
          >
            {t?.nav?.home || "Home"}
          </button>
          <span>/</span>
          <span className="text-[#990011] font-semibold">{sc.dashboardTitle || "My Courses & Learning"}</span>
        </div>
      </div>

      {/* ─── Coursera-Style Student Profile Welcome Banner ─── */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-xs relative flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 mt-2">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar initial in dark circle */}
          <div
            aria-hidden="true"
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-black text-xl shadow-xs shrink-0 select-none"
          >
            {avatarInitial}
          </div>

          <div className="flex flex-col gap-1.5 mt-0.5">
            <h1 className="text-2xl font-black text-gray-900 leading-none">
              {getGreeting()}, {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-y-1.5 text-xs text-gray-500 font-semibold leading-relaxed mt-0.5">
              {sc.greetingSubtitle || "Good day to start learning a new language!"}
            </div>
            {profileQuery.isLoading ? (
              <span
                role="status"
                aria-live="polite"
                className="text-[11px] font-semibold text-gray-400"
              >
                {sc.loadingProfile || "Loading profile..."}
              </span>
            ) : (profileQuery.error || isProfileMalformed) ? (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-700"
              >
                <span>
                  {sc.profileUnavailable || "Profile details are unavailable."}
                </span>
                <button
                  type="button"
                  onClick={() => profileQuery.refetch()}
                  disabled={profileQuery.isFetching}
                  className="font-extrabold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {profileQuery.isFetching
                    ? (sc.retrying || "Retrying...")
                    : (sc.retry || "Retry")}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Isometric 3D Portal Illustration on the right */}
        <div className="w-56 h-36 shrink-0 relative overflow-hidden flex items-center justify-center select-none bg-slate-50/50 rounded-2xl border border-gray-100/50">
          <svg
            aria-hidden="true"
            focusable="false"
            width="220"
            height="150"
            viewBox="0 0 220 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
                    {activeProgressPercent}% {sc.completed || "Completed"}
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
                        <Play
                          size={14}
                          aria-hidden="true"
                          className="ml-0.5 fill-[#990011]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 leading-snug">
                          {(sc.nextUpSession || "Next Up: Session {{number}} • {{topic}}")
                            .replace("{{number}}", nextSession.number || UNKNOWN_VALUE)
                            .replace("{{topic}}", nextSession.topic || UNKNOWN_VALUE)}
                        </p>
                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5 flex items-center gap-1.5">
                          <Clock size={11} aria-hidden="true" />
                          <span>
                            {nextSession.startTime || UNKNOWN_VALUE}
                            {" - "}
                            {nextSession.endTime || UNKNOWN_VALUE}
                            {" ("}
                            {formatDisplayDate(nextSession.date)}
                            {")"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 font-medium">{sc.noSessionsScheduled || "No sessions scheduled currently."}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenClassDetail(activeClass)}
                    aria-label={`${sc.resumeLearning || "Resume Learning"}: ${activeCourse.title}`}
                    className="h-11 px-6 bg-[#990011] hover:bg-[#b20a1c] text-white font-extrabold text-sm rounded-full flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 group-hover:translate-x-0.5"
                  >
                    <span>{sc.resumeLearning || "Resume Learning"}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {activeClass?.progress && (
                <div className="w-full mt-2">
                  <div
                    role="progressbar"
                    aria-label={sc.progress || "Progress"}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={activeProgressPercent}
                    className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#990011] to-[#e7001a] rounded-full transition-all duration-500"
                      style={{ width: `${activeProgressPercent}%` }}
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
              onChange={handleTabChange}
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
            <label className="flex-1">
              <span className="sr-only">
                {sc.searchPlaceholder || "Search courses"}
              </span>
              <CourseSearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={sc.searchPlaceholder || "Search courses..."}
              />
            </label>

            {/* Selector Dropdowns */}
            <div className="flex gap-3 items-center">
              <label>
                <span className="sr-only">
                  {sc.languageLabel || "Language"}
                </span>
                <CourseSelectFilter
                  value={langFilter}
                  onChange={handleLanguageFilterChange}
                  options={languageFilterOptions}
                />
              </label>
              <label>
                <span className="sr-only">
                  {sc.levelLabel || "Level"}
                </span>
                <CourseSelectFilter
                  value={activeTab === "explore" ? "all" : levelFilter}
                  onChange={handleLevelFilterChange}
                  options={activeTab === "explore"
                    ? [levelFilterOptions[0]]
                    : levelFilterOptions}
                  disabled={activeTab === "explore"}
                  title={activeTab === "explore"
                    ? (
                      sc.catalogLevelFilterUnavailable
                      || "Level filtering is unavailable for the paginated catalog."
                    )
                    : undefined}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Cards Display Grid */}
        <div aria-busy={isActiveListFetching}>
          {isActiveListLoading && activeSourceItems.length === 0 ? (
            <div
              role="status"
              aria-live="polite"
              className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-150 bg-white p-6 shadow-xs"
            >
              <LoadingSpinner />
              <span className="sr-only">
                {sc.loadingLearningData || "Loading your learning data"}
              </span>
            </div>
          ) : activeListError && activeSourceItems.length === 0 ? (
            <div
              role="alert"
              className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-center"
            >
              <h3 className="text-lg font-extrabold text-red-800">
                {sc.loadErrorTitle || "Unable to load learning data"}
              </h3>
              <p className="max-w-sm text-sm font-semibold text-red-700">
                {sc.loadErrorDescription || "Check your connection and try again."}
              </p>
              <button
                type="button"
                onClick={() => retryActiveList()}
                disabled={isActiveListFetching}
                className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" />
                {isActiveListFetching
                  ? (sc.retrying || "Retrying...")
                  : (sc.retry || "Retry")}
              </button>
            </div>
          ) : hasActiveDataIssue && activeSourceItems.length === 0 ? (
            <div
              role="alert"
              className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center"
            >
              <h3 className="text-lg font-extrabold text-amber-900">
                {sc.invalidDataTitle || "Learning data is unavailable"}
              </h3>
              <p className="max-w-sm text-sm font-semibold text-amber-800">
                {sc.invalidDataDescription || "The server returned data in an unexpected format. Please try again."}
              </p>
              <button
                type="button"
                onClick={() => retryActiveList()}
                disabled={isActiveListFetching}
                className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-5 text-xs font-extrabold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" />
                {isActiveListFetching
                  ? (sc.retrying || "Retrying...")
                  : (sc.retry || "Retry")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {activeListError && (
                <div
                  role="alert"
                  className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 sm:flex-row sm:items-center"
                >
                  <span>
                    {sc.refreshError || "The latest data could not be loaded. The displayed information may be out of date."}
                  </span>
                  <button
                    type="button"
                    onClick={() => retryActiveList()}
                    disabled={isActiveListFetching}
                    className="self-start font-extrabold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    {isActiveListFetching
                      ? (sc.retrying || "Retrying...")
                      : (sc.retry || "Retry")}
                  </button>
                </div>
              )}

              {hasActiveDataIssue && (
                <div
                  role="alert"
                  className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 sm:flex-row sm:items-center"
                >
                  <span>
                    {sc.partialDataWarning || "Some invalid or duplicate records were omitted."}
                  </span>
                  <button
                    type="button"
                    onClick={() => retryActiveList()}
                    disabled={isActiveListFetching}
                    className="self-start font-extrabold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    {isActiveListFetching
                      ? (sc.retrying || "Retrying...")
                      : (sc.retry || "Retry")}
                  </button>
                </div>
              )}

              {isActiveListFetching && !isActiveListLoading && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-xs font-semibold text-gray-500"
                >
                  {sc.refreshing || "Refreshing learning data..."}
                </p>
              )}

              {activeTab === "classes" ? (
                visibleFilteredClasses.length === 0 ? (
                  <div
                    role="status"
                    className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-150 bg-white p-6 py-20 text-center text-base font-bold text-gray-400 shadow-xs"
                  >
                    <Calendar
                      size={54}
                      aria-hidden="true"
                      className="text-gray-300 stroke-[1.2]"
                    />
                    <h3 className="text-lg font-extrabold text-gray-800">
                      {isFilteredEmpty
                        ? (sc.noCoursesFound || "No matching classes")
                        : (sc.noClassesTitle || "No Active Classes")}
                    </h3>
                    <p className="max-w-xs text-sm font-semibold">
                      {isFilteredEmpty
                        ? (sc.noCoursesFoundDesc || "Try clearing your search query or filters.")
                        : (sc.noClassesDesc || "You don't have any scheduled sessions right now.")}
                    </p>
                    {isFilteredEmpty && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-2 h-9 rounded-full bg-[#990011] px-5 text-xs font-black text-white transition-all hover:bg-[#b20a1c] active:scale-95"
                      >
                        {sc.clearFilters || "Clear filters"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {visibleFilteredClasses.map((cls) => {
                      const progressPercent = cls.progress
                        ? getProgressPercent(cls.progress)
                        : null
                      const classTitle = cls.title || cls.name || "Untitled class"
                      const scheduleDays = cls.schedule?.days?.join(" - ") || UNKNOWN_VALUE
                      const scheduleTime = (
                        cls.schedule?.startTime &&
                        cls.schedule?.endTime
                      )
                        ? `${cls.schedule.startTime} - ${cls.schedule.endTime}`
                        : UNKNOWN_VALUE
                      const statusLabel = cls.status
                        ? cls.status.replace(/_/g, " ")
                        : UNKNOWN_VALUE

                      return (
                        <div
                          key={cls.id}
                          onClick={() => handleOpenClassDetail(cls)}
                          className="group flex cursor-pointer flex-col items-stretch justify-between gap-6 rounded-3xl border border-gray-150 bg-white p-5 transition-all duration-300 hover:border-gray-250 hover:shadow-md md:flex-row md:items-center"
                        >
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[9px] font-bold uppercase text-[#D97706]">
                                {sc.languages?.[cls.language] || cls.language || UNKNOWN_VALUE}
                              </span>
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-gray-600">
                                {cls.levels[0] || UNKNOWN_VALUE}
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-green-700">
                                <span
                                  aria-hidden="true"
                                  className="h-1.5 w-1.5 rounded-full bg-green-500"
                                />
                                {statusLabel}
                              </span>
                            </div>

                            <h3 className="text-lg font-black leading-snug text-gray-950 transition-colors group-hover:text-[#990011]">
                              {classTitle}
                            </h3>
                            <p className="-mt-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                              {sc.courseLabel || "Course: "}
                              {cls.courseName || cls.courseTitle || UNKNOWN_VALUE}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Clock size={13} aria-hidden="true" className="text-gray-400" />
                                <span>{scheduleDays} | {scheduleTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar size={13} aria-hidden="true" className="text-gray-400" />
                                <span>
                                  {formatDisplayDate(cls.startDate)}
                                  {" - "}
                                  {formatDisplayDate(cls.endDate)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-6 border-t border-gray-150 pt-4 md:justify-end md:border-t-0 md:pt-0">
                            <div className="flex min-w-[120px] flex-col gap-1">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-gray-400">
                                <span>{sc.progress || "Progress"}</span>
                                <span>
                                  {progressPercent === null
                                    ? UNKNOWN_VALUE
                                    : `${progressPercent}%`}
                                </span>
                              </div>
                              <div
                                role="progressbar"
                                aria-label={`${sc.progress || "Progress"}: ${classTitle}`}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-valuenow={progressPercent ?? undefined}
                                aria-valuetext={progressPercent === null
                                  ? (sc.progressUnavailable || "Progress unavailable")
                                  : undefined}
                                className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
                              >
                                <div
                                  className="h-full rounded-full bg-green-500"
                                  style={{ width: `${progressPercent ?? 0}%` }}
                                />
                              </div>
                              <span className="mt-0.5 text-right text-[10px] font-bold text-gray-400">
                                {cls.progress?.completedSessions ?? UNKNOWN_VALUE}
                                /
                                {cls.progress?.totalSessions ?? UNKNOWN_VALUE}
                                {" "}
                                {sc.sessionsCountText || "sessions"}
                              </span>
                            </div>

                            <button
                              type="button"
                              aria-label={`${sc.joinRoom || "Join Room"}: ${classTitle}`}
                              onClick={(event) => {
                                event.stopPropagation()
                                handleJoinClassRoom(cls)
                              }}
                              className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#990011] px-5 text-xs font-black text-white shadow-xs transition-all hover:bg-[#b20a1c] active:scale-95 group-hover:translate-x-0.5"
                            >
                              <span>{sc.joinRoom || "Join Room"}</span>
                              <ArrowRight size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              ) : visibleFilteredCourses.length === 0 ? (
                <div
                  role="status"
                  className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-150 bg-white p-6 py-20 text-center text-base font-bold text-gray-400 shadow-xs"
                >
                  <BookOpen
                    size={54}
                    aria-hidden="true"
                    className="text-gray-300 stroke-[1.2]"
                  />
                  <h3 className="text-lg font-extrabold text-gray-800">
                    {isFilteredEmpty
                      ? (sc.noCoursesFound || "No Courses Found")
                      : activeTab === "enrolled"
                        ? (sc.noEnrolledTitle || "No Enrolled Courses")
                        : (sc.noAvailableCourses || "No courses are available")}
                  </h3>
                  <p className="max-w-xs text-sm font-semibold">
                    {isFilteredEmpty
                      ? (sc.noCoursesFoundDesc || "Try clearing your search query or filters to find other courses.")
                      : activeTab === "enrolled"
                        ? (sc.noEnrolledDesc || "You haven't enrolled in any courses yet. Visit the explore tab to browse!")
                        : (sc.noAvailableCoursesDesc || "There are no courses available to explore right now.")}
                  </p>
                  {isFilteredEmpty ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-2 h-9 rounded-full bg-[#990011] px-5 text-xs font-black text-white transition-all hover:bg-[#b20a1c] active:scale-95"
                    >
                      {sc.clearFilters || "Clear filters"}
                    </button>
                  ) : activeTab === "enrolled" ? (
                    <button
                      type="button"
                      onClick={() => handleTabChange("explore")}
                      className="mt-2 flex h-9 items-center justify-center gap-1 rounded-full bg-[#990011] px-5 text-xs font-black text-white transition-all hover:bg-[#b20a1c] active:scale-95"
                    >
                      <span>{sc.exploreMore || "Explore Courses"}</span>
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                  {visibleFilteredCourses.map((course, idx) => (
                    <div
                      key={course.id}
                    >
                      <StudentCourseCard
                        course={course}
                        isEnrolled={activeTab === "enrolled"}
                        viewMode={viewMode}
                        onViewDetails={() => handleOpenDetail(course)}
                        onJoin={() => handleOpenDetail(course)}
                        t={t}
                        index={idx}
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTotalPages > 1 && (
                <TablePagination
                  currentPage={activePage}
                  totalPages={activeTotalPages}
                  totalCount={activeTotalItems ?? activeSourceItems.length}
                  limit={activePagination?.pageSize ?? PAGE_SIZE}
                  onPageChange={setActivePage}
                  t={t}
                />
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

export default StudentDashboard
