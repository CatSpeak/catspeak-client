import React, { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Compass,
  RefreshCw,
  BookOpen,
  GraduationCap,
  ArrowUpDown,
  Filter,
} from "lucide-react"

import { useGetExploreCoursesQuery } from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

import CourseSearchInput from "../components/CourseSearchInput"
import CourseSelectFilter from "../components/CourseSelectFilter"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import StudentCourseCard from "../student/components/StudentCourseCard"
import ClassCard from "../components/ClassCard"
import CourseTabs from "../components/CourseTabs"
import ExploreCoursesFilterModal from "../components/ExploreCoursesFilterModal"
import { resolveItemLayout } from "../utils/catalogLayout"
import { copyShareLink } from "@/shared/utils/shareUtils"

const PAGE_SIZE = 24

const ExploreCoursesPage = () => {
  const { t } = useLanguage()
  const communityLanguage = localStorage.getItem("communityLanguage") || "en"
  const navigate = useNavigate()
  const c = t.courses || {}
  const sc = c.student || {}
  const dict = t.nav || {}

  // Filter States
  const [contentType, setContentType] = useState("all") // "all" | "courses" | "classes"
  const [selectedStatuses, setSelectedStatuses] = useState([]) // [] means all, or array of selected status values
  const [sortOrder, setSortOrder] = useState("default") // "default" | "price_asc" | "relevance"
  const [viewMode, setViewMode] = useState("grid") // "grid" | "list"
  const [minPriceInput, setMinPriceInput] = useState("")
  const [maxPriceInput, setMaxPriceInput] = useState("")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  // Search input state (typing) vs applied search query (submitted on Enter / search button)
  const [searchInputValue, setSearchInputValue] = useState("")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Infinite Scroll State
  const [catalogItems, setCatalogItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const secondLastItemRef = useRef(null)

  const sortOptions = [
    { value: "default", label: sc.sortDefault || "Mới nhất" },
    { value: "price_asc", label: sc.sortPriceAsc || "Giá thấp đến cao" },
    { value: "relevance", label: sc.sortRelevance || "Độ tương quan" },
  ]

  const enrollmentStatusOptions = [
    { value: "all", label: sc.enrollmentStatusAll || "Tất cả" },
    { value: "open", label: sc.enrollmentStatusOpen || "Đang mở đăng ký" },
    {
      value: "upcoming",
      label: sc.enrollmentStatusUpcoming || "Chưa mở đăng ký",
    },
    { value: "closed", label: sc.enrollmentStatusClosed || "Đã đóng đăng ký" },
  ]

  const categoryTabs = [
    { value: "all", label: sc.tabAllCatalog || "Tất cả", icon: Compass },
    { value: "courses", label: sc.tabCourses || "Khóa học", icon: BookOpen },
    {
      value: "classes",
      label: sc.tabClasses || "Lớp học",
      icon: GraduationCap,
    },
  ]

  // Event 1: Search submitted via Enter or Search button click
  const handleSearchSubmit = (val) => {
    setAppliedSearchQuery(
      typeof val === "string" ? val.trim() : searchInputValue.trim(),
    )
    setCurrentPage(1)
  }

  // Event 2: Apply filters from Modal
  const handleApplyModalFilters = ({
    enrollmentStatus,
    minPrice,
    maxPrice,
  }) => {
    setMinPriceInput(minPrice)
    setMaxPriceInput(maxPrice)
    if (enrollmentStatus !== "all") {
      setSelectedStatuses([enrollmentStatus])
    } else {
      setSelectedStatuses([])
    }
    setCurrentPage(1)
  }

  // Event 3: Multi-select status handler
  const handleToggleStatus = (val) => {
    setCurrentPage(1)
    if (val === "all") {
      setSelectedStatuses([])
      return
    }
    setSelectedStatuses((prev) => {
      let next
      if (prev.includes(val)) {
        next = prev.filter((s) => s !== val)
      } else {
        next = [...prev, val]
      }
      const specificStatuses = ["open", "upcoming", "closed"]
      if (specificStatuses.every((s) => next.includes(s))) {
        return []
      }
      return next
    })
  }

  // Validate price range inputs
  const parsedMin =
    minPriceInput !== "" && !isNaN(Number(minPriceInput))
      ? Number(minPriceInput)
      : undefined
  const parsedMax =
    maxPriceInput !== "" && !isNaN(Number(maxPriceInput))
      ? Number(maxPriceInput)
      : undefined

  let activeMinPrice = parsedMin
  let activeMaxPrice = parsedMax

  if (parsedMax != null && parsedMin == null) {
    activeMinPrice = 0
  }
  if (parsedMin != null && parsedMax != null && parsedMin > parsedMax) {
    activeMaxPrice = undefined
  }

  const activeEnrollmentStatus = useMemo(() => {
    if (selectedStatuses.length === 0) return undefined
    if (selectedStatuses.length === 1) return selectedStatuses[0]
    return selectedStatuses.join(",")
  }, [selectedStatuses])

  const resolvedLanguage = useMemo(() => {
    const code = (communityLanguage || "en").toLowerCase()
    if (code === "zh" || code === "chinese") return "chinese"
    if (code === "en" || code === "english") return "english"
    return "english"
  }, [communityLanguage])

  // Explore Courses API Query
  const exploreCatalogQuery = useGetExploreCoursesQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    language: resolvedLanguage,
    search: appliedSearchQuery || undefined,
    sort: sortOrder !== "default" ? sortOrder : undefined,
    minPrice: activeMinPrice,
    maxPrice: activeMaxPrice,
    type: contentType !== "all" ? contentType : undefined,
    enrollmentStatus: activeEnrollmentStatus,
  })

  const isLoading = exploreCatalogQuery.isLoading
  const isFetching = exploreCatalogQuery.isFetching
  const error = exploreCatalogQuery.error

  // Reset page when language changes
  useEffect(() => {
    setCurrentPage(1)
  }, [resolvedLanguage])

  // Sync / Accumulate data for Infinite Scroll
  useEffect(() => {
    if (exploreCatalogQuery.data) {
      const raw = exploreCatalogQuery.data.data
      const items = Array.isArray(raw) ? raw : []
      const pagination = exploreCatalogQuery.data.pagination
      const totalPages = Number(pagination?.totalPages) || 1

      if (currentPage === 1) {
        setCatalogItems(items)
      } else {
        setCatalogItems((prev) => {
          const existingIds = new Set(prev.map((i) => String(i.id)))
          const newItems = items.filter((i) => !existingIds.has(String(i.id)))
          return [...prev, ...newItems]
        })
      }
      setHasMore(currentPage < totalPages && items.length > 0)
    }
  }, [exploreCatalogQuery.data, currentPage])

  // Infinite Scroll Observer
  useEffect(() => {
    if (!secondLastItemRef.current || !hasMore || isFetching) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) {
          setCurrentPage((prev) => prev + 1)
        }
      },
      {
        rootMargin: "250px",
      },
    )
    observer.observe(secondLastItemRef.current)
    return () => observer.disconnect()
  }, [catalogItems, hasMore, isFetching])

  const isWorkspace = window.location.pathname.startsWith("/workspace")

  const handleOpenCourseDetail = (course) => {
    if (!course?.id) return
    const courseId = encodeURIComponent(String(course.id))
    if (isWorkspace) {
      navigate(`/workspace/explore-courses/details/${courseId}`)
    } else {
      navigate(`/explore-courses/details/${courseId}`)
    }
  }

  const handleOpenClassDetail = (cls) => {
    if (!cls?.id) return
    const classId = encodeURIComponent(String(cls.id))
    if (cls.isEnrolled) {
      navigate(`/workspace/learning/class/${classId}`)
    } else {
      navigate(`/explore-courses/class/${classId}`)
    }
  }

  const handleClearFilters = () => {
    setSearchInputValue("")
    setAppliedSearchQuery("")
    setSelectedStatuses([])
    setContentType("all")
    setSortOrder("default")
    setMinPriceInput("")
    setMaxPriceInput("")
    setCurrentPage(1)
  }

  const handleShareCourse = async (item) => {
    const shareUrl = `${window.location.origin}/explore-courses/details/${item.id || item._id}`
    await copyShareLink({
      url: shareUrl,
      successMessage: c.courseDetail?.linkCopied || "Link copied!",
      errorMessage: c.courseDetail?.linkCopyFailed || "Failed to copy link",
    })
  }

  const handleShareClass = async (item) => {
    const shareUrl = `${window.location.origin}/explore-courses/class/${item.id || item._id}`
    await copyShareLink({
      url: shareUrl,
      successMessage: c.classDetail?.linkCopied || "Link copied!",
      errorMessage: c.classDetail?.linkCopyFailed || "Failed to copy link",
    })
  }

  const hasPriceFilter = minPriceInput !== "" || maxPriceInput !== ""
  const hasActiveModalFilters = hasPriceFilter || selectedStatuses.length > 0
  const hasActiveFilters =
    appliedSearchQuery !== "" ||
    contentType !== "all" ||
    sortOrder !== "default" ||
    selectedStatuses.length > 0 ||
    hasPriceFilter

  const modalEnrollmentStatus =
    selectedStatuses.length === 1 ? selectedStatuses[0] : "all"

  // Check if we are loading initial page or after filter changes
  const isInitialLoading = (isLoading || isFetching) && currentPage === 1

  return (
    <div
      className={`flex flex-col gap-6 text-[#2e2e2e] ${isWorkspace ? "" : "p-4 sm:p-6"}`}
    >
      {/* ─── Header & Subtitle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <Compass size={28} className="text-[#b20a1c]" />
            <span>{dict.exploreCourses || "Explore Courses"}</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {sc.exploreCoursesSubtitle ||
              "Discover and enroll in top language courses and standalone classes to start your learning journey."}
          </p>
        </div>
      </div>

      {/* ─── Category Tabs & Filter Button ─── */}
      <div className="flex items-center justify-between border-b border-border/80 pb-px">
        <CourseTabs
          tabs={categoryTabs}
          activeTab={contentType}
          onChange={(tab) => {
            setContentType(tab)
            setCurrentPage(1)
          }}
        />

        {/* Filter Modal Trigger Button ("<Filter /> Bộ lọc") */}
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center gap-1.5 pb-3 text-sm font-bold text-[#b20a1c] hover:opacity-85 transition-all cursor-pointer bg-transparent border-0 outline-none"
        >
          <Filter size={16} className="text-[#b20a1c]" />
          <span>{sc.filter || "Bộ lọc"}</span>
          {hasActiveModalFilters && (
            <span className="w-2 h-2 rounded-full bg-[#b20a1c]" />
          )}
        </button>
      </div>

      {/* ─── Explore Courses Filter Modal ─── */}
      <ExploreCoursesFilterModal
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialEnrollmentStatus={modalEnrollmentStatus}
        initialMinPrice={minPriceInput}
        initialMaxPrice={maxPriceInput}
        onApply={handleApplyModalFilters}
      />

      {/* ─── Filter Section (2 Rows, No Parent Border/Card) ─── */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search Input, Sort Selector, View Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
          {/* Search Input (rounded-full, no border, white bg) */}
          <div className="flex-1 min-w-0 max-w-[878px]">
            <CourseSearchInput
              value={searchInputValue}
              onChange={setSearchInputValue}
              onSearch={handleSearchSubmit}
              placeholder={
                sc.searchPlaceholder ||
                "Tìm kiếm theo tên khóa học, lớp học hoặc giảng viên..."
              }
              className="w-full"
              inputClassName="w-full h-11 pl-5 pr-11 bg-white border-0 outline-none rounded-full text-sm font-normal text-slate-800 placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-[#b20a1c]/20 transition-all"
            />
          </div>

          {/* Right Controls: Sort Order & View Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sort Order Selector (ghost variant: no bg, border, font normal) */}
            <CourseSelectFilter
              value={sortOrder}
              onChange={(val) => {
                setSortOrder(val)
                setCurrentPage(1)
              }}
              options={sortOptions}
              icon={ArrowUpDown}
              variant="ghost"
            />

            {/* View Mode Toggle (white bg, rounded-full container, circular buttons) */}
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Row 2: Status multi-select list */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 mr-1">
            {sc.statusLabel || "Trạng thái:"}
          </span>

          {enrollmentStatusOptions.map((opt) => {
            const isSelected =
              opt.value === "all"
                ? selectedStatuses.length === 0
                : selectedStatuses.includes(opt.value)

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleToggleStatus(opt.value)}
                className={`h-8 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#b20a1c] text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-0 shadow-2xs"
                }`}
              >
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Catalog Section with Infinite Scroll ─── */}
      <div aria-busy={isFetching}>
        {isInitialLoading ? (
          /* Initial / Filter Change Skeleton Loader */
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border/80 bg-white p-4 shadow-xs flex flex-col gap-4 animate-pulse"
                >
                  <div className="aspect-[16/10] w-full bg-slate-200 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                    <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                    <div className="h-8 bg-slate-200 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-border/80 bg-white p-5 shadow-xs flex gap-5 animate-pulse items-center"
                >
                  <div className="w-44 h-28 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded-md w-2/3" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/3" />
                    <div className="h-4 bg-slate-200 rounded-md w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : error && catalogItems.length === 0 ? (
          <div
            role="alert"
            className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-center"
          >
            <h3 className="text-lg font-extrabold text-red-800">
              {sc.loadErrorTitle || "Unable to load data"}
            </h3>
            <p className="max-w-sm text-sm font-semibold text-red-700">
              {sc.loadErrorDescription ||
                "Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => {
                exploreCatalogQuery.refetch?.()
              }}
              disabled={isFetching}
              className="mt-1 flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-700 hover:bg-red-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} aria-hidden="true" />
              <span>{isFetching ? "Retrying..." : "Retry"}</span>
            </button>
          </div>
        ) : catalogItems.length === 0 ? (
          <div
            role="status"
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-border/80 bg-white p-8 text-center shadow-xs"
          >
            <Compass
              size={52}
              aria-hidden="true"
              className="text-slate-300 stroke-[1.2]"
            />
            <h3 className="text-lg font-extrabold text-slate-800">
              {hasActiveFilters
                ? sc.noCoursesFound || "No items found"
                : sc.noAvailableCourses || "No offerings available"}
            </h3>
            <p className="max-w-xs text-sm font-semibold text-slate-500">
              {hasActiveFilters
                ? sc.noCoursesFoundDesc ||
                  "Try clearing your search query or price filter."
                : sc.noAvailableCoursesDesc ||
                  "There are no public offerings available right now."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 h-9 rounded-full bg-[#b20a1c] hover:bg-[#960817] px-5 text-xs font-extrabold text-white transition-all cursor-pointer active:scale-95"
              >
                {sc.clearFilters || "Clear filters"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Cards Grid / List */}
            <div
              className={
                viewMode === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              }
            >
              {catalogItems.map((item, idx) => {
                const isSecondLast =
                  idx === Math.max(0, catalogItems.length - 2) ||
                  (catalogItems.length === 1 && idx === 0)

                if (item.isClassItem) {
                  const classLayout = resolveItemLayout(item, viewMode)
                  return (
                    <div
                      ref={isSecondLast ? secondLastItemRef : null}
                      key={`cls-${item.id || idx}`}
                      className="w-full"
                    >
                      <ClassCard
                        cls={item}
                        isStudent={true}
                        courseTitle={item.courseTitle}
                        viewMode={classLayout}
                        onClick={() => handleOpenClassDetail(item)}
                        onEnroll={() => handleOpenClassDetail(item)}
                        onShare={handleShareClass}
                      />
                    </div>
                  )
                }

                return (
                  <div
                    ref={isSecondLast ? secondLastItemRef : null}
                    key={`crs-${item.id || idx}`}
                    className="w-full"
                  >
                    <StudentCourseCard
                      course={item}
                      isEnrolled={false}
                      viewMode={viewMode}
                      onViewDetails={() => handleOpenCourseDetail(item)}
                      onJoin={() => handleOpenCourseDetail(item)}
                      onShare={handleShareCourse}
                      t={t}
                      index={idx}
                    />
                  </div>
                )
              })}
            </div>

            {/* Infinite Scroll Bottom Spinner */}
            {isFetching && currentPage > 1 && (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-2 border-[#b20a1c] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ExploreCoursesPage
