import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Compass, RefreshCw } from "lucide-react"

import { useGetStudentAvailableCoursesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import CourseSearchInput from "../components/CourseSearchInput"
import CourseSelectFilter from "../components/CourseSelectFilter"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import TablePagination from "../components/shared/TablePagination"
import StudentCourseCard from "../student/components/StudentCourseCard"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"

const PAGE_SIZE = 24

const ExploreCoursesPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const c = t.courses || {}
  const sc = c.student || {}
  const dict = t.nav || {}

  const [langFilter, setLangFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  const {
    currentPage,
    debouncedSearchQuery,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
  } = usePaginatedSearch()

  const languageFilterOptions = [
    { value: "all", label: sc.allLanguages || "All Languages" },
    { value: "EN", label: sc.languages?.EN || "English" },
    { value: "VI", label: sc.languages?.VI || "Vietnamese" },
    { value: "ZH", label: sc.languages?.ZH || "Chinese" },
  ]

  const availableCoursesQuery = useGetStudentAvailableCoursesQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    language: langFilter !== "all" ? langFilter : undefined,
    search: debouncedSearchQuery.trim() || undefined,
  })

  const coursesRaw = availableCoursesQuery.currentData?.data
  const coursesList = Array.isArray(coursesRaw) ? coursesRaw : []
  const pagination = availableCoursesQuery.currentData?.pagination
  const totalPages = Number(pagination?.totalPages) || 1
  const totalItems = Number(pagination?.totalItems) || coursesList.length

  const isLoading = (
    availableCoursesQuery.isLoading ||
    (availableCoursesQuery.isFetching && availableCoursesQuery.currentData === undefined)
  )
  const isFetching = availableCoursesQuery.isFetching
  const error = availableCoursesQuery.error

  const handleOpenDetail = (course) => {
    if (!course?.id) return
    navigate(`/workspace/learning/details/${encodeURIComponent(String(course.id))}`)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setLangFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery.trim() !== "" || langFilter !== "all"

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] p-4 sm:p-6">
      {/* ─── Breadcrumbs ─── */}
      <Breadcrumb
        items={[
          { label: dict.home || "Home", onClick: () => navigate("/workspace") },
          { label: dict.exploreCourses || "Explore Courses" },
        ]}
      />

      {/* ─── Header & Search/Filter Toolbar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
            <Compass size={28} className="text-[#b20a1c]" />
            <span>{dict.exploreCourses || "Explore Courses"}</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {sc.exploreCoursesSubtitle || "Discover and enroll in top language courses to start your learning journey."}
          </p>
        </div>
      </div>

      {/* ─── Toolbar: Search, Language Filter & View Mode ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
        <label className="flex-1">
          <span className="sr-only">
            {sc.searchPlaceholder || "Search courses..."}
          </span>
          <CourseSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder={sc.searchPlaceholder || "Search courses..."}
          />
        </label>

        <div className="flex gap-3 items-center self-end sm:self-auto">
          <CourseSelectFilter
            value={langFilter}
            onChange={(val) => {
              setLangFilter(val)
              setCurrentPage(1)
            }}
            options={languageFilterOptions}
          />
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ─── Course Catalog Grid / List Section ─── */}
      <div aria-busy={isFetching}>
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-gray-150 bg-white p-6 shadow-xs"
          >
            <LoadingSpinner />
            <span className="sr-only">
              {sc.loadingLearningData || "Loading courses..."}
            </span>
          </div>
        ) : error && coursesList.length === 0 ? (
          <div
            role="alert"
            className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <h3 className="text-lg font-extrabold text-red-800">
              {sc.loadErrorTitle || "Unable to load courses"}
            </h3>
            <p className="max-w-sm text-sm font-semibold text-red-700">
              {sc.loadErrorDescription || "Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => availableCoursesQuery.refetch()}
              disabled={isFetching}
              className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 hover:bg-red-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} aria-hidden="true" />
              <span>{isFetching ? "Retrying..." : "Retry"}</span>
            </button>
          </div>
        ) : coursesList.length === 0 ? (
          <div
            role="status"
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-150 bg-white p-8 text-center shadow-xs"
          >
            <Compass size={52} aria-hidden="true" className="text-gray-300 stroke-[1.2]" />
            <h3 className="text-lg font-extrabold text-gray-800">
              {hasActiveFilters ? (sc.noCoursesFound || "No Courses Found") : (sc.noAvailableCourses || "No courses available")}
            </h3>
            <p className="max-w-xs text-sm font-semibold text-gray-500">
              {hasActiveFilters
                ? (sc.noCoursesFoundDesc || "Try clearing your search query or language filter.")
                : (sc.noAvailableCoursesDesc || "There are no public courses available right now.")}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 h-9 rounded-full bg-[#990011] hover:bg-[#b20a1c] px-5 text-xs font-extrabold text-white transition-all cursor-pointer active:scale-95"
              >
                {sc.clearFilters || "Clear filters"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {coursesList.map((course, idx) => (
                <StudentCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={false}
                  viewMode={viewMode}
                  onViewDetails={() => handleOpenDetail(course)}
                  onJoin={() => handleOpenDetail(course)}
                  t={t}
                  index={idx}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalItems}
                limit={PAGE_SIZE}
                onPageChange={setCurrentPage}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExploreCoursesPage
