import React, { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Compass,
  RefreshCw,
  BookOpen,
  GraduationCap,
  ArrowUpDown,
  Filter,
  X,
  Sparkles,
} from "lucide-react"

import {
  useGetExploreCoursesQuery
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"

import CourseSearchInput from "../components/CourseSearchInput"
import CourseSelectFilter from "../components/CourseSelectFilter"
import TablePagination from "../components/shared/TablePagination"
import ViewModeToggle from "../components/shared/ViewModeToggle"
import StudentCourseCard from "../student/components/StudentCourseCard"
import ClassCard from "../components/ClassCard"
import CourseTabs from "../components/CourseTabs"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"
import { formatCurrencyVND } from "../utils/courseUtils"
import { resolveItemLayout } from "../utils/catalogLayout"
import { copyShareLink } from "@/shared/utils/shareUtils"

const PAGE_SIZE = 20

const ExploreCoursesPage = () => {
  const { t } = useLanguage()
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
  const [showPricePopover, setShowPricePopover] = useState(false)

  const popoverRef = useRef(null)

  const {
    currentPage,
    debouncedSearchQuery,
    searchQuery,
    setCurrentPage,
    setSearchQuery,
  } = usePaginatedSearch()

  // Close price popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowPricePopover(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Community language drives the catalog language filter (same source as Rooms).
  // Only English and Chinese are supported — Vietnamese is intentionally excluded.
  const communityLanguage = (() => {
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("communityLanguage")
      : null
    if (stored === "zh") return "CHINESE"
    if (stored === "en") return "ENGLISH"
    return undefined
  })()

  const sortOptions = [
    { value: "default", label: sc.sortDefault || "Mới nhất" },
    { value: "price_asc", label: sc.sortPriceAsc || "Giá thấp đến cao" },
    { value: "relevance", label: sc.sortRelevance || "Độ tương quan" },
  ]

  const enrollmentStatusOptions = [
    { value: "all", label: sc.enrollmentStatusAll || "Tất cả" },
    { value: "open", label: sc.enrollmentStatusOpen || "Đang mở đăng ký" },
    { value: "upcoming", label: sc.enrollmentStatusUpcoming || "Chưa mở đăng ký" },
    { value: "closed", label: sc.enrollmentStatusClosed || "Đã đóng đăng ký" },
  ]

  const categoryTabs = [
    { value: "all", label: sc.tabAllCatalog || "Tất cả", icon: Compass },
    { value: "courses", label: sc.tabCourses || "Khóa học", icon: BookOpen },
    { value: "classes", label: sc.tabClasses || "Lớp học", icon: GraduationCap },
  ]

  // Multi-select status handler
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
  const parsedMin = minPriceInput !== "" && !isNaN(Number(minPriceInput)) ? Number(minPriceInput) : undefined
  const parsedMax = maxPriceInput !== "" && !isNaN(Number(maxPriceInput)) ? Number(maxPriceInput) : undefined

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

  // Explore Courses API Query
  const exploreCatalogQuery = useGetExploreCoursesQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    language: communityLanguage,
    search: debouncedSearchQuery.trim() || undefined,
    sort: sortOrder !== "default" ? sortOrder : undefined,
    minPrice: activeMinPrice,
    maxPrice: activeMaxPrice,
    type: contentType !== "all" ? contentType : undefined,
    enrollmentStatus: activeEnrollmentStatus,
  })

  const combinedCatalog = useMemo(() => {
    const raw = exploreCatalogQuery.currentData?.data
    return Array.isArray(raw) ? raw : []
  }, [exploreCatalogQuery.currentData])

  const isLoading = exploreCatalogQuery.isLoading
  const isFetching = exploreCatalogQuery.isFetching
  const error = exploreCatalogQuery.error
  const pagination = exploreCatalogQuery.currentData?.pagination

  const totalPages = Number(pagination?.totalPages) || 1
  const totalItems = Number(pagination?.totalItems) || combinedCatalog.length
  const isWorkspace = window.location.pathname.startsWith("/workspace")

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
    setSearchQuery("")
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
  const hasActiveFilters = searchQuery.trim() !== "" || contentType !== "all" || sortOrder !== "default" || selectedStatuses.length > 0 || hasPriceFilter

  const setPricePreset = (minVal, maxVal) => {
    setMinPriceInput(minVal)
    setMaxPriceInput(maxVal)
    setCurrentPage(1)
  }

  return (
    <div className={`flex flex-col gap-6 text-[#2e2e2e] ${isWorkspace ? "" : "p-4 sm:p-6"}`}>
      {/* ─── Header & Subtitle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <Compass size={28} className="text-[#b20a1c]" />
            <span>{dict.exploreCourses || "Explore Courses"}</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {sc.exploreCoursesSubtitle || "Discover and enroll in top language courses and standalone classes to start your learning journey."}
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

        {/* Filter Popover Button ("<Filter /> Bộ lọc") */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setShowPricePopover((prev) => !prev)}
            className="flex items-center gap-1.5 pb-3 text-sm font-bold text-[#b20a1c] hover:opacity-85 transition-all cursor-pointer bg-transparent border-0 outline-none"
          >
            <Filter size={16} className="text-[#b20a1c]" />
            <span>{sc.filter || "Bộ lọc"}</span>
            {hasPriceFilter && (
              <span className="w-2 h-2 rounded-full bg-[#b20a1c]" />
            )}
          </button>

          {/* Price Popover Dropdown Card */}
          {showPricePopover && (
            <div className="absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-2rem)] bg-white border border-border/80 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#b20a1c]" /> {sc.filterByPrice || "Lọc Theo Học Phí"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPricePopover(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Presets */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{sc.quickPresets || "Gợi ý nhanh"}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPricePreset("", "")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${minPriceInput === "" && maxPriceInput === ""
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/60"
                      }`}
                  >
                    {sc.allPrices || "Tất cả giá"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset("0", "500000")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${minPriceInput === "0" && maxPriceInput === "500000"
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/60"
                      }`}
                  >
                    {sc.under500k || "Dưới 500.000 đ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset("500000", "2000000")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${minPriceInput === "500000" && maxPriceInput === "2000000"
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/60"
                      }`}
                  >
                    {sc.range500kTo2M || "500k - 2 triệu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricePreset("2000000", "")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${minPriceInput === "2000000" && maxPriceInput === ""
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/60"
                      }`}
                  >
                    {sc.above2M || "Trên 2 triệu"}
                  </button>
                </div>
              </div>

              {/* Manual Inputs */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{sc.customPriceRange || "Tùy chỉnh khoảng giá"}</span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      placeholder={sc.priceFrom || "Từ (VNĐ)"}
                      value={minPriceInput}
                      onChange={(e) => {
                        setMinPriceInput(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full h-9 px-3 bg-slate-50 border border-border rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <span className="text-slate-400 font-bold text-xs shrink-0">-</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      placeholder={sc.priceTo || "Đến (VNĐ)"}
                      value={maxPriceInput}
                      onChange={(e) => {
                        setMaxPriceInput(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="w-full h-9 px-3 bg-slate-50 border border-border rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {hasPriceFilter ? (
                  <button
                    type="button"
                    onClick={() => setPricePreset("", "")}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  >
                    {sc.clearPriceFilter || "Xóa lọc giá"}
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setShowPricePopover(false)}
                  className="bg-[#b20a1c] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-[#960817] transition-all cursor-pointer"
                >
                  {sc.apply || "Áp dụng"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Filter Section (2 Rows, No Parent Border/Card) ─── */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search Input, Sort Selector, View Mode Toggle */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
          {/* Search Input (rounded-full, no border, white bg) */}
          <div className="flex-1 min-w-0 max-w-[878px]">
            <CourseSearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder={sc.searchPlaceholder || "Tìm kiếm theo tên khóa học, lớp học hoặc giảng viên..."}
              className="w-full"
              inputClassName="w-full h-11 pl-5 pr-11 bg-white border-0 outline-none rounded-full text-sm font-normal text-slate-800 placeholder:text-slate-400 shadow-2xs focus:ring-2 focus:ring-[#b20a1c]/20 transition-all"
            />
          </div>

          {/* Right Controls: Sort Order & View Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sort Order Selector (ghost variant: no bg, no border, font normal) */}
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

      {/* ─── Catalog Grid Section ─── */}
      <div aria-busy={isFetching}>
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-border/80 bg-white p-6 shadow-xs"
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
                exploreCatalogQuery.refetch?.()
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
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-border/80 bg-white p-8 text-center shadow-xs"
          >
            <Compass size={52} aria-hidden="true" className="text-slate-300 stroke-[1.2]" />
            <h3 className="text-lg font-extrabold text-slate-800">
              {hasActiveFilters ? (sc.noCoursesFound || "No items found") : (sc.noAvailableCourses || "No offerings available")}
            </h3>
            <p className="max-w-xs text-sm font-semibold text-slate-500">
              {hasActiveFilters
                ? (sc.noCoursesFoundDesc || "Try clearing your search query or price filter.")
                : (sc.noAvailableCoursesDesc || "There are no public offerings available right now.")}
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
            <div className={viewMode === "list"
              ? "flex flex-col gap-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
              {combinedCatalog.map((item, idx) => {
                if (item.isClassItem) {
                  const classLayout = resolveItemLayout(item, viewMode)
                  return (
                    <ClassCard
                      key={`cls-${item.id}`}
                      cls={item}
                      isStudent={true}
                      courseTitle={item.courseTitle}
                      viewMode={classLayout}
                      onClick={() => handleOpenClassDetail(item)}
                      onEnroll={() => handleOpenClassDetail(item)}
                      onShare={handleShareClass}
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
                    onShare={handleShareCourse}
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
