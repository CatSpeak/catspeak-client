import React, { useState, useMemo, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Compass, RefreshCw, BookOpen, GraduationCap, LogIn } from "lucide-react"
import { toast } from "react-hot-toast"

import {
  useGetStudentAvailableCoursesQuery,
  useGetStudentAvailableClassesQuery
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import AuthModalContext from "@/shared/context/AuthModalContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import CourseSearchInput from "../components/CourseSearchInput"
import CourseSelectFilter from "../components/CourseSelectFilter"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import TablePagination from "../components/shared/TablePagination"
import StudentCourseCard from "../student/components/StudentCourseCard"
import ClassCard from "../components/ClassCard"
import CourseTabs from "../components/CourseTabs"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"

const PAGE_SIZE = 24

const ExploreCoursesPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const authModalCtx = useContext(AuthModalContext)
  const c = t.courses || {}
  const sc = c.student || {}
  const dict = t.nav || {}

  const [contentType, setContentType] = useState("all") // "all" | "courses" | "classes"
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
    { value: "ENGLISH", label: sc.languages?.English || sc.languages?.EN || "English" },
    { value: "VIETNAMESE", label: sc.languages?.Vietnamese || sc.languages?.VI || "Vietnamese" },
    { value: "CHINESE", label: sc.languages?.Chinese || sc.languages?.ZH || "Chinese" },
  ]

  const categoryTabs = [
    { value: "all", label: sc.tabAllCatalog || "Tất cả", icon: Compass },
    { value: "courses", label: sc.tabCourses || "Khóa học", icon: BookOpen },
    { value: "classes", label: sc.tabClasses || "Lớp học", icon: GraduationCap },
  ]

  const availableCoursesQuery = useGetStudentAvailableCoursesQuery(
    {
      page: currentPage,
      pageSize: PAGE_SIZE,
      language: langFilter !== "all" ? langFilter : undefined,
      search: debouncedSearchQuery.trim() || undefined,
    },
    { skip: !isAuthenticated || contentType === "classes" }
  )

  const availableClassesQuery = useGetStudentAvailableClassesQuery(
    {
      page: currentPage,
      pageSize: PAGE_SIZE,
      language: langFilter !== "all" ? langFilter : undefined,
      search: debouncedSearchQuery.trim() || undefined,
    },
    { skip: !isAuthenticated || contentType === "courses" }
  )

  const coursesList = useMemo(() => {
    const raw = availableCoursesQuery.currentData?.data
    return (Array.isArray(raw) ? raw : []).map(item => ({ ...item, isClassItem: false }))
  }, [availableCoursesQuery.currentData])

  const classesList = useMemo(() => {
    const raw = availableClassesQuery.currentData?.data
    return (Array.isArray(raw) ? raw : []).map(item => ({ ...item, isClassItem: true }))
  }, [availableClassesQuery.currentData])

  const combinedCatalog = useMemo(() => {
    if (contentType === "courses") return coursesList
    if (contentType === "classes") return classesList
    // "all": Merge courses and all available classes
    return [...coursesList, ...classesList]
  }, [contentType, coursesList, classesList])

  const isLoading = contentType === "courses"
    ? availableCoursesQuery.isLoading
    : contentType === "classes"
      ? availableClassesQuery.isLoading
      : (availableCoursesQuery.isLoading && availableClassesQuery.isLoading)

  const isFetching = availableCoursesQuery.isFetching || availableClassesQuery.isFetching
  const error = availableCoursesQuery.error || availableClassesQuery.error

  const pagination = contentType === "classes"
    ? availableClassesQuery.currentData?.pagination
    : availableCoursesQuery.currentData?.pagination

  const totalPages = Number(pagination?.totalPages) || 1
  const totalItems = Number(pagination?.totalItems) || combinedCatalog.length

  const handleOpenCourseDetail = (course) => {
    if (!course?.id) return
    const courseId = encodeURIComponent(String(course.id))
    const isWorkspace = window.location.pathname.startsWith("/workspace")
    if (isWorkspace) {
      navigate(`/workspace/explore-courses/details/${courseId}`)
    } else {
      navigate(`/explore-courses/details/${courseId}`)
    }
  }

  const handleOpenClassDetail = () => {
    toast.info("Chi tiết lớp học sẽ sớm được cập nhật!")
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setLangFilter("all")
    setContentType("all")
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery.trim() !== "" || langFilter !== "all" || contentType !== "all"

  return (
    <div className="flex flex-col gap-6 text-[#2e2e2e] p-4 sm:p-6">
      {/* ─── Breadcrumbs ─── */}
      <Breadcrumb
        items={[
          {
            label: dict.home || "Home",
            onClick: () => navigate(window.location.pathname.startsWith("/workspace") ? "/workspace/explore-courses" : "/explore-courses")
          },
          { label: dict.exploreCourses || "Explore Courses" },
        ]}
      />

      {/* ─── Header & Subtitle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight flex items-center gap-2.5">
            <Compass size={28} className="text-[#b20a1c]" />
            <span>{dict.exploreCourses || "Explore Courses"}</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {sc.exploreCoursesSubtitle || "Discover and enroll in top language courses and standalone classes to start your learning journey."}
          </p>
        </div>
      </div>

      {/* ─── Content Category Tabs (All / Courses / Standalone Classes) ─── */}
      <div className="border-b border-gray-150 pb-px">
        <CourseTabs
          tabs={categoryTabs}
          activeTab={contentType}
          onChange={(tab) => {
            setContentType(tab)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* ─── Toolbar: Search, Language Filter & View Mode ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full justify-between bg-white rounded-3xl p-5 border border-gray-150 shadow-xs">
        <label className="flex-1">
          <span className="sr-only">
            {sc.searchPlaceholder || "Search..."}
          </span>
          <CourseSearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val)
              setCurrentPage(1)
            }}
            placeholder={sc.searchPlaceholder || "Search courses or classes..."}
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

      {/* ─── Catalog Grid / List Section ─── */}
      <div aria-busy={isFetching}>
        {!isAuthenticated || error?.status === 401 ? (
          <div
            role="status"
            className="flex min-h-[340px] flex-col items-center justify-center gap-4 rounded-3xl border border-gray-150 bg-white p-8 text-center shadow-xs"
          >
            <h3 className="text-xl font-extrabold text-gray-900">
              {sc.loginRequiredTitle || "Vui lòng đăng nhập để xem danh sách khóa học & lớp học"}
            </h3>
            <p className="max-w-md text-sm font-semibold text-gray-600 leading-relaxed">
              {sc.loginRequiredDesc || "Bạn cần đăng nhập tài khoản CatSpeak để khám phá và đăng ký các khóa học & lớp học."}
            </p>
            {authModalCtx?.openAuthModal && (
              <button
                type="button"
                onClick={() => authModalCtx.openAuthModal("login", "/explore-courses")}
                className="mt-2 h-10 px-6 rounded-full bg-[#990011] hover:bg-[#b20a1c] text-white text-xs font-black transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <LogIn size={15} />
                <span>{sc.loginNow || "Đăng nhập ngay"}</span>
              </button>
            )}
          </div>
        ) : isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-gray-150 bg-white p-6 shadow-xs"
          >
            <LoadingSpinner />
            <span className="sr-only">
              {sc.loadingLearningData || "Loading data..."}
            </span>
          </div>
        ) : error && combinedCatalog.length === 0 ? (
          <div
            role="alert"
            className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <h3 className="text-lg font-extrabold text-red-800">
              {sc.loadErrorTitle || "Unable to load data"}
            </h3>
            <p className="max-w-sm text-sm font-semibold text-red-700">
              {sc.loadErrorDescription || "Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => {
                availableCoursesQuery.refetch?.()
                availableClassesQuery.refetch?.()
              }}
              disabled={isFetching}
              className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 hover:bg-red-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} aria-hidden="true" />
              <span>{isFetching ? "Retrying..." : "Retry"}</span>
            </button>
          </div>
        ) : combinedCatalog.length === 0 ? (
          <div
            role="status"
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-gray-150 bg-white p-8 text-center shadow-xs"
          >
            <Compass size={52} aria-hidden="true" className="text-gray-300 stroke-[1.2]" />
            <h3 className="text-lg font-extrabold text-gray-800">
              {hasActiveFilters ? (sc.noCoursesFound || "No items found") : (sc.noAvailableCourses || "No offerings available")}
            </h3>
            <p className="max-w-xs text-sm font-semibold text-gray-500">
              {hasActiveFilters
                ? (sc.noCoursesFoundDesc || "Try clearing your search query or language filter.")
                : (sc.noAvailableCoursesDesc || "There are no public offerings available right now.")}
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
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
              {combinedCatalog.map((item, idx) => {
                if (item.isClassItem) {
                  return (
                    <ClassCard
                      key={`cls-${item.id}`}
                      cls={item}
                      isStudent={true}
                      courseTitle={item.courseTitle}
                      onClick={() => handleOpenClassDetail(item)}
                      onEnroll={() => handleOpenClassDetail(item)}
                    />
                  )
                }
                return (
                  <StudentCourseCard
                    key={`crs-${item.id}`}
                    course={item}
                    isEnrolled={false}
                    viewMode={viewMode}
                    onViewDetails={() => handleOpenCourseDetail(item)}
                    onJoin={() => handleOpenCourseDetail(item)}
                    t={t}
                    index={idx}
                  />
                )
              })}
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
