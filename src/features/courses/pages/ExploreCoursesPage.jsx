import React, { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Compass, RefreshCw, BookOpen, GraduationCap, ArrowUpDown, Globe, Coins, X, RotateCcw, Sparkles, ChevronDown } from "lucide-react"

import {
  useGetExploreCoursesQuery
} from "@/store/api/coursesApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import { LoadingSpinner } from "@/shared/components/ui/indicators"
import Breadcrumb from "@/shared/components/ui/navigation/Breadcrumb"

import CourseSearchInput from "../components/CourseSearchInput"
import CourseSelectFilter from "../components/CourseSelectFilter"
import TablePagination from "../components/shared/TablePagination"
import StudentCourseCard from "../student/components/StudentCourseCard"
import ClassCard from "../components/ClassCard"
import CourseTabs from "../components/CourseTabs"
import { usePaginatedSearch } from "../hooks/usePaginatedSearch"
import { formatCurrencyVND } from "../utils/courseUtils"

const PAGE_SIZE = 20

const ExploreCoursesPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const c = t.courses || {}
  const sc = c.student || {}
  const dict = t.nav || {}

  // Filter States
  const [contentType, setContentType] = useState("all") // "all" | "courses" | "classes"
  const [langFilter, setLangFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("default") // "default" | "price_asc" | "relevance"
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

  // Filter Options (No Japanese or Korean)
  const languageFilterOptions = [
    { value: "all", label: sc.allLanguages || "Tất cả ngôn ngữ" },
    { value: "en", label: sc.languages?.English || "Tiếng Anh (EN)" },
    { value: "vi", label: sc.languages?.Vietnamese || "Tiếng Việt (VI)" },
    { value: "zh", label: sc.languages?.Chinese || "Tiếng Trung (ZH)" },
  ]

  const sortOptions = [
    { value: "default", label: sc.sortDefault || "Mới nhất" },
    { value: "price_asc", label: sc.sortPriceAsc || "Giá thấp đến cao" },
    { value: "relevance", label: sc.sortRelevance || "Độ tương quan" },
  ]

  const categoryTabs = [
    { value: "all", label: sc.tabAllCatalog || "Tất cả", icon: Compass },
    { value: "courses", label: sc.tabCourses || "Khóa học", icon: BookOpen },
    { value: "classes", label: sc.tabClasses || "Lớp học", icon: GraduationCap },
  ]

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

  // Explore Courses API Query
  const exploreCatalogQuery = useGetExploreCoursesQuery({
    page: currentPage,
    pageSize: PAGE_SIZE,
    language: langFilter !== "all" ? langFilter : undefined,
    search: debouncedSearchQuery.trim() || undefined,
    sort: sortOrder !== "default" ? sortOrder : undefined,
    minPrice: activeMinPrice,
    maxPrice: activeMaxPrice,
    type: contentType !== "all" ? contentType : undefined,
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
    const isWorkspace = window.location.pathname.startsWith("/workspace")
    if (cls.isEnrolled) {
      navigate(isWorkspace ? `/workspace/learning/class/${classId}` : `/learning/class/${classId}`)
    } else {
      navigate(`/explore-courses/class/${classId}`)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setLangFilter("all")
    setContentType("all")
    setSortOrder("default")
    setMinPriceInput("")
    setMaxPriceInput("")
    setCurrentPage(1)
  }

  const hasPriceFilter = minPriceInput !== "" || maxPriceInput !== ""
  const hasActiveFilters = searchQuery.trim() !== "" || langFilter !== "all" || contentType !== "all" || sortOrder !== "default" || hasPriceFilter

  const setPricePreset = (minVal, maxVal) => {
    setMinPriceInput(minVal)
    setMaxPriceInput(maxVal)
    setCurrentPage(1)
  }

  return (
    <div className={`flex flex-col gap-6 text-[#2e2e2e] ${isWorkspace ? "" : "p-4 sm:p-6"}`}>
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
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <Compass size={28} className="text-[#b20a1c]" />
            <span>{dict.exploreCourses || "Explore Courses"}</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {sc.exploreCoursesSubtitle || "Discover and enroll in top language courses and standalone classes to start your learning journey."}
          </p>
        </div>
      </div>

      {/* ─── Category Tabs ─── */}
      <div className="border-b border-slate-200/80 pb-px">
        <CourseTabs
          tabs={categoryTabs}
          activeTab={contentType}
          onChange={(tab) => {
            setContentType(tab)
            setCurrentPage(1)
          }}
        />
      </div>

      {/* ─── Sleek E-Commerce Filter Bar ─── */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col gap-3.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full justify-between">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <CourseSearchInput
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val)
                setCurrentPage(1)
              }}
              placeholder={sc.searchPlaceholder || "Tìm kiếm theo tên khóa học, lớp học hoặc giảng viên..."}
            />
          </div>

          {/* E-Commerce Uniform Height Pill Controls (h-9) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Pill Selector */}
            <CourseSelectFilter
              value={langFilter}
              onChange={(val) => {
                setLangFilter(val)
                setCurrentPage(1)
              }}
              options={languageFilterOptions}
              icon={Globe}
            />

            {/* Sort Order Pill Selector */}
            <CourseSelectFilter
              value={sortOrder}
              onChange={(val) => {
                setSortOrder(val)
                setCurrentPage(1)
              }}
              options={sortOptions}
              icon={ArrowUpDown}
            />

            {/* Price Popover Pill Button */}
            <div className="relative" ref={popoverRef}>
              <button
                type="button"
                onClick={() => setShowPricePopover((prev) => !prev)}
                className={`h-9 px-3.5 rounded-full border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs ${hasPriceFilter || showPricePopover
                  ? "border-[#b20a1c] bg-rose-50 text-[#b20a1c] ring-2 ring-rose-100"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <Coins size={14} className={hasPriceFilter ? "text-[#b20a1c]" : "text-slate-500"} />
                <span>
                  {hasPriceFilter
                    ? `${minPriceInput ? formatCurrencyVND(minPriceInput) : "0 đ"} - ${maxPriceInput ? formatCurrencyVND(maxPriceInput) : "∞"}`
                    : "Khoảng giá"}
                </span>
              </button>

              {/* Price Popover Dropdown Card */}
              {showPricePopover && (
                <div className="absolute right-0 top-11 z-50 w-80 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#b20a1c]" /> Lọc Theo Học Phí
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPricePopover(false)}
                      className="text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Presets */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Gợi ý nhanh</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPricePreset("", "")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all ${minPriceInput === "" && maxPriceInput === ""
                          ? "bg-slate-950 text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                      >
                        Tất cả giá
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricePreset("0", "500000")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all ${minPriceInput === "0" && maxPriceInput === "500000"
                          ? "bg-[#b20a1c] text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                      >
                        Dưới 500.000 đ
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricePreset("500000", "2000000")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all ${minPriceInput === "500000" && maxPriceInput === "2000000"
                          ? "bg-[#b20a1c] text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                      >
                        500k - 2 triệu
                      </button>
                      <button
                        type="button"
                        onClick={() => setPricePreset("2000000", "")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold text-left transition-all ${minPriceInput === "2000000" && maxPriceInput === ""
                          ? "bg-[#b20a1c] text-white"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                          }`}
                      >
                        Trên 2 triệu
                      </button>
                    </div>
                  </div>

                  {/* Manual Inputs */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tùy chỉnh khoảng giá</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Từ (VNĐ)"
                        value={minPriceInput}
                        onChange={(e) => {
                          setMinPriceInput(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white"
                      />
                      <span className="text-slate-400 font-bold text-xs">-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Đến (VNĐ)"
                        value={maxPriceInput}
                        onChange={(e) => {
                          setMaxPriceInput(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1">
                    {hasPriceFilter ? (
                      <button
                        type="button"
                        onClick={() => setPricePreset("", "")}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        Xóa lọc giá
                      </button>
                    ) : <span />}
                    <button
                      type="button"
                      onClick={() => setShowPricePopover(false)}
                      className="bg-[#b20a1c] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs hover:bg-[#960817] transition-all"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Active Filter Pills Bar ─── */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Bộ lọc đang áp dụng:</span>

            {searchQuery.trim() !== "" && (
              <span className="bg-rose-50/90 text-[#b20a1c] border border-rose-200/80 px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs">
                Từ khóa: "{searchQuery.trim()}"
                <X size={12} className="cursor-pointer hover:text-rose-800" onClick={() => setSearchQuery("")} />
              </span>
            )}

            {contentType !== "all" && (
              <span className="bg-rose-50/90 text-[#b20a1c] border border-rose-200/80 px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs">
                Loại: {contentType === "courses" ? "Khóa học" : "Lớp học"}
                <X size={12} className="cursor-pointer hover:text-rose-800" onClick={() => setContentType("all")} />
              </span>
            )}

            {langFilter !== "all" && (
              <span className="bg-rose-50/90 text-[#b20a1c] border border-rose-200/80 px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs">
                Ngôn ngữ: {langFilter.toUpperCase()}
                <X size={12} className="cursor-pointer hover:text-rose-800" onClick={() => setLangFilter("all")} />
              </span>
            )}

            {sortOrder !== "default" && (
              <span className="bg-rose-50/90 text-[#b20a1c] border border-rose-200/80 px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs">
                Sắp xếp: {sortOrder === "price_asc" ? "Giá tăng dần" : "Độ tương quan"}
                <X size={12} className="cursor-pointer hover:text-rose-800" onClick={() => setSortOrder("default")} />
              </span>
            )}

            {hasPriceFilter && (
              <span className="bg-rose-50/90 text-[#b20a1c] border border-rose-200/80 px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs">
                Giá: {minPriceInput ? formatCurrencyVND(minPriceInput) : "0 đ"} - {maxPriceInput ? formatCurrencyVND(maxPriceInput) : "∞"}
                <X size={12} className="cursor-pointer hover:text-rose-800" onClick={() => setPricePreset("", "")} />
              </span>
            )}

            <button
              type="button"
              onClick={handleClearFilters}
              className="text-slate-500 hover:text-[#b20a1c] font-extrabold text-xs flex items-center gap-1 ml-auto cursor-pointer transition-colors"
            >
              <RotateCcw size={12} />
              <span>Xóa tất cả</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Catalog Grid Section ─── */}
      <div aria-busy={isFetching}>
        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs"
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
            className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xs"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    viewMode="grid"
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
