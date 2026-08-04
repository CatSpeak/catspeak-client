import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, ArrowRight, RefreshCw, Compass } from "lucide-react"
import { useGetStudentJoinedClassesQuery } from "../../../../store/api/coursesApi"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import { useGetProfileQuery } from "@/features/auth"
import CourseSearchInput from "../../components/CourseSearchInput"
import CourseSelectFilter from "../../components/CourseSelectFilter"
import TablePagination from "../../components/shared/TablePagination"
import { filterStudentClasses } from "../../utils/courseTransforms"

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
  const dateText = toText(value)
  if (!dateText) return UNKNOWN_VALUE
  const date = new Date(dateText)
  if (Number.isNaN(date.getTime())) return dateText
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const normalizeClass = (item) => {
  if (!isRecord(item)) return null
  const id = toText(item.id ?? item._id ?? item.classId)
  if (!id) return null

  const progressSource = isRecord(item.progress) ? item.progress : {}
  const completedSessions = toNonNegativeNumber(progressSource.completedSessions)
  const totalSessions = toNonNegativeNumber(progressSource.totalSessions ?? item.totalSessions)

  const scheduleSource = isRecord(item.schedule) ? item.schedule : {}
  const rawDays = scheduleSource.days ?? item.scheduleDays
  const rawStartTime = toText(scheduleSource.startTime ?? item.startTime)
  const rawEndTime = toText(scheduleSource.endTime ?? item.endTime)

  const startTime = SIMPLE_TIME_PATTERN.test(rawStartTime)
    ? rawStartTime
    : UNKNOWN_VALUE
  const endTime = SIMPLE_TIME_PATTERN.test(rawEndTime)
    ? rawEndTime
    : UNKNOWN_VALUE

  return {
    id,
    name: toText(item.name ?? item.title),
    title: toText(item.title ?? item.name) || "Untitled class",
    courseId: toText(item.courseId),
    courseName: toText(item.courseName ?? item.courseTitle),
    courseTitle: toText(item.courseTitle ?? item.courseName),
    language: toText(item.language) || UNKNOWN_VALUE,
    levels: toTextList(item.levels),
    status: toText(item.status) || UNKNOWN_VALUE,
    startDate: toText(item.startDate),
    endDate: toText(item.endDate),
    studentCount: toNonNegativeNumber(item.studentCount),
    thumbnailUrl: toText(item.thumbnailUrl),
    progress: (completedSessions !== null && totalSessions !== null && totalSessions > 0)
      ? { completedSessions: Math.min(completedSessions, totalSessions), totalSessions }
      : null,
    schedule: {
      days: toTextList(rawDays),
      startTime,
      endTime,
    },
  }
}

const normalizeCollection = (rawData, normalizer) => {
  const list = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.items)
      ? rawData.items
      : []

  const items = []
  const seenIds = new Set()
  let issueCount = 0

  list.forEach((rawItem) => {
    const normalizedItem = normalizer(rawItem)
    if (!normalizedItem) {
      issueCount += 1
      return
    }
    if (seenIds.has(normalizedItem.id)) {
      issueCount += 1
      return
    }
    seenIds.add(normalizedItem.id)
    items.push(normalizedItem)
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
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [langFilter, setLangFilter] = useState("all")
  const [classesPage, setClassesPage] = useState(1)

  // API Queries
  const profileQuery = useGetProfileQuery()
  const classesQuery = useGetStudentJoinedClassesQuery({
    all: true,
    pageSize: 100,
  })

  const normalizedClasses = useMemo(
    () => normalizeCollection(
      isRecord(classesQuery.currentData)
        ? classesQuery.currentData.data
        : classesQuery.currentData,
      normalizeClass,
    ),
    [classesQuery.currentData],
  )
  const joinedClasses = normalizedClasses.items

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
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setClassesPage(1)
  }

  const handleLanguageFilterChange = (value) => {
    setLangFilter(value)
    setClassesPage(1)
  }

  const handleLevelFilterChange = (value) => {
    setLevelFilter(value)
    setClassesPage(1)
  }

  // Filters & memoized items
  const filters = useMemo(() => ({
    searchQuery,
    levelFilter,
    langFilter,
  }), [searchQuery, levelFilter, langFilter])

  const filteredClasses = useMemo(() => (
    filterStudentClasses(joinedClasses, filters)
  ), [joinedClasses, filters])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClasses.length / PAGE_SIZE),
  )
  const boundedClassesPage = Math.min(classesPage, totalPages)
  const localPageStart = (boundedClassesPage - 1) * PAGE_SIZE
  const visibleFilteredClasses = filteredClasses.slice(
    localPageStart,
    localPageStart + PAGE_SIZE,
  )

  const levelsOptions = [
    ...new Set(joinedClasses.flatMap((item) => item.levels)),
  ].sort((a, b) => a.localeCompare(b))

  const languagesOptions = [
    ...new Set(
      joinedClasses
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

  const isLoading = (
    classesQuery.isLoading
    || (classesQuery.isFetching && classesQuery.currentData === undefined)
  )
  const isFetching = classesQuery.isFetching
  const error = classesQuery.error
  const retryList = classesQuery.refetch

  const hasActiveDataIssue = (
    normalizedClasses.hasMalformedShape ||
    normalizedClasses.issueCount > 0
  )
  const hasActiveFilters = (
    searchQuery.trim() !== "" ||
    levelFilter !== "all" ||
    langFilter !== "all"
  )
  const isFilteredEmpty = (
    hasActiveFilters &&
    joinedClasses.length > 0 &&
    filteredClasses.length === 0
  )

  if (isLoading && joinedClasses.length === 0) {
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
          <span className="text-[#990011] font-semibold">{sc.myClasses || "Joined Classes"}</span>
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

        {/* Search & Selection Filters bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
          {/* Search Box */}
          <label className="flex-1">
            <span className="sr-only">
              {sc.searchPlaceholder || "Search classes..."}
            </span>
            <CourseSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={sc.searchPlaceholder || "Search classes..."}
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
                value={levelFilter}
                onChange={handleLevelFilterChange}
                options={levelFilterOptions}
              />
            </label>
          </div>
        </div>

        {/* Cards Display Grid */}
        <div aria-busy={isFetching}>
          {error && joinedClasses.length === 0 ? (
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
                onClick={() => retryList()}
                disabled={isFetching}
                className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" />
                {isFetching
                  ? (sc.retrying || "Retrying...")
                  : (sc.retry || "Retry")}
              </button>
            </div>
          ) : hasActiveDataIssue && joinedClasses.length === 0 ? (
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
                onClick={() => retryList()}
                disabled={isFetching}
                className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-5 text-xs font-extrabold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={13} aria-hidden="true" />
                {isFetching
                  ? (sc.retrying || "Retrying...")
                  : (sc.retry || "Retry")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {error && (
                <div
                  role="alert"
                  className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 sm:flex-row sm:items-center"
                >
                  <span>
                    {sc.refreshError || "The latest data could not be loaded. The displayed information may be out of date."}
                  </span>
                  <button
                    type="button"
                    onClick={() => retryList()}
                    disabled={isFetching}
                    className="self-start font-extrabold underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    {isFetching
                      ? (sc.retrying || "Retrying...")
                      : (sc.retry || "Retry")}
                  </button>
                </div>
              )}

              {visibleFilteredClasses.length === 0 ? (
                <div
                  role="status"
                  className="flex min-h-[450px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-150 bg-white p-8 text-center shadow-xs"
                >
                  <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#990011] flex items-center justify-center border border-red-100/60 shadow-xs mb-1 select-none">
                    {isFilteredEmpty ? (
                      <Compass size={30} className="stroke-[1.8]" />
                    ) : (
                      <Calendar size={30} className="stroke-[1.8]" />
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1.5 max-w-md">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">
                      {isFilteredEmpty
                        ? (sc.noCoursesFound || "No matching classes found")
                        : (sc.noClassesTitle || "No Joined Classes Yet")}
                    </h3>
                    <p className="text-sm font-semibold text-[#5a5a5a] leading-relaxed">
                      {isFilteredEmpty
                        ? (sc.noCoursesFoundDesc || "Try adjusting your search query or resetting your language and level filters.")
                        : (sc.noClassesDesc || "You haven't joined any classes yet. Explore our courses & classes catalog to start learning!")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                    {isFilteredEmpty && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="h-10 px-5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-extrabold transition-all cursor-pointer active:scale-95"
                      >
                        {sc.clearFilters || "Clear filters"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate("/explore-courses")}
                      className="h-11 px-6 rounded-full bg-[#990011] hover:bg-[#b20a1c] text-white text-xs font-black transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95 flex items-center gap-2"
                    >
                      <Compass size={16} />
                      <span>{sc.exploreMore || "Explore Courses"}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
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
              )}

              {totalPages > 1 && (
                <TablePagination
                  currentPage={boundedClassesPage}
                  totalPages={totalPages}
                  totalCount={filteredClasses.length}
                  limit={PAGE_SIZE}
                  onPageChange={setClassesPage}
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
