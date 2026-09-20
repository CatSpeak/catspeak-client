import React, { useState, useEffect, useRef, useMemo } from "react"
import { Link } from "react-router-dom"
import { Star, Search, ChevronDown, Loader2 } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetExploreTeacherReviewsQuery } from "@/store/api/exploreTeachersApi"
import { formatRating, formatTeacherNumber } from "../utils/teacherUtils"

/**
 * Modal hiển thị toàn bộ nhận xét học viên kèm Filter & Infinite Scroll (BR-EX-GV-09, Ticket 08)
 * Theo mockup: designs/explore-teacher/Xem toàn bộ nhận xét.html
 */
const TeacherReviewsModal = ({
  isOpen,
  onClose,
  slugOrId,
  teacherName = "Giảng viên",
  initialRating = 5.0,
  initialReviewCount = 0,
  initialStarDistribution = {},
}) => {
  const { t } = useLanguage()

  // ─── Filter States ───
  const [selectedStars, setSelectedStars] = useState(0) // 0 = all
  const [selectedSort, setSelectedSort] = useState("newest") // newest | highest | lowest
  const [searchKeyword, setSearchKeyword] = useState("")
  const [debouncedKeyword, setDebouncedKeyword] = useState("")

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword.trim())
    }, 300)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  // ─── Pagination & Infinite Scroll State (BR-EX-GV-09) ───
  const [page, setPage] = useState(1)
  const [accumulatedReviews, setAccumulatedReviews] = useState([])
  const [hasMore, setHasMore] = useState(false)

  // Reset pagination and list whenever filters change
  useEffect(() => {
    setPage(1)
    setAccumulatedReviews([])
  }, [selectedStars, selectedSort, debouncedKeyword, slugOrId])

  // ─── Query Hook ───
  const {
    data: reviewsResponse,
    isLoading,
    isFetching,
  } = useGetExploreTeacherReviewsQuery(
    {
      slugOrId,
      stars: selectedStars,
      sort: selectedSort,
      keyword: debouncedKeyword,
      page,
      pageSize: 10,
    },
    {
      skip: !isOpen || !slugOrId,
    }
  )

  // Update accumulated list as new pages arrive
  useEffect(() => {
    if (!reviewsResponse) return

    const incoming = reviewsResponse.data || []
    const pagination = reviewsResponse.pagination || {}
    const totalPages = pagination.totalPages || 1
    const currentPage = pagination.page || page

    setHasMore(currentPage < totalPages)

    setAccumulatedReviews((prev) => {
      if (currentPage === 1) {
        return incoming
      }
      const existingIds = new Set(prev.map((r) => r.reviewId))
      const fresh = incoming.filter((r) => !existingIds.has(r.reviewId))
      return [...prev, ...fresh]
    })
  }, [reviewsResponse, page])

  // ─── Infinite Scroll Sentinel ───
  const sentinelRef = useRef(null)

  useEffect(() => {
    if (!isOpen || !hasMore || isFetching) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isFetching) {
          setPage((p) => p + 1)
        }
      },
      { root: null, rootMargin: "150px", threshold: 0.1 }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [isOpen, hasMore, isFetching])

  // Summary numbers
  const ratingValue = formatRating(
    reviewsResponse?.rating != null ? reviewsResponse.rating : initialRating
  )
  const reviewCount =
    reviewsResponse?.reviewCount != null
      ? reviewsResponse.reviewCount
      : initialReviewCount
  const starDistribution =
    reviewsResponse?.starDistribution || initialStarDistribution || {}
  const totalReviewsCount = reviewCount || 1

  const modalTitle = (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-[#990011] shrink-0" />
      <span className="font-extrabold text-slate-900 text-lg sm:text-xl">
        {t.courses?.reviewsAboutTeacher
          ?.replace("{{name}}", teacherName)
          ?.replace("{{count}}", reviewCount) ||
          `Nhận xét về ${teacherName} (${reviewCount})`}
      </span>
    </div>
  )

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={modalTitle}
      fullScreenOnMobile={false}
      className="md:max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col"
      headerClassName="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white"
      bodyClassName="p-0 flex-1 overflow-y-auto bg-[#F8F9FA] flex flex-col"
    >
      {/* ─── Fixed Header Section: Rating Breakdown + Filters ─── */}
      <div className="p-5 sm:p-6 bg-white border-b border-slate-200/80 shrink-0 flex flex-col gap-5">
        {/* Rating Breakdown Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Big Score + Stars */}
          <div className="sm:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
              {ratingValue}
            </span>
            <div className="flex items-center gap-1 text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className="fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1">
              {t.courses?.basedOnReviews?.replace(
                "{{count}}",
                formatTeacherNumber(reviewCount)
              ) || `Dựa trên ${reviewCount} nhận xét`}
            </span>
          </div>

          {/* 5-Star Distribution Bars */}
          <div className="sm:col-span-8 flex flex-col gap-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starDistribution[star] || 0
              const pct =
                totalReviewsCount > 0
                  ? Math.round((count / totalReviewsCount) * 100)
                  : 0
              const isSelected = selectedStars === star
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    setSelectedStars((curr) => (curr === star ? 0 : star))
                  }
                  className={`flex items-center gap-2 text-xs font-semibold py-0.5 px-1.5 rounded-md transition-colors text-left cursor-pointer ${
                    isSelected ? "bg-amber-50 text-amber-900" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="w-10 shrink-0">{star} sao</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#FBBF24] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-400 font-medium shrink-0">
                    {pct}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filter Controls Row: Star Filter, Sort, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-3 border-t border-slate-100">
          {/* Stars Dropdown */}
          <div className="sm:col-span-4 relative">
            <select
              value={selectedStars}
              onChange={(e) => setSelectedStars(Number(e.target.value))}
              aria-label={t.courses?.filterByStars || "Lọc theo số sao"}
              className="w-full h-10 appearance-none pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] cursor-pointer"
            >
              <option value={0}>Tất cả sao</option>
              <option value={5}>5 sao</option>
              <option value={4}>4 sao</option>
              <option value={3}>3 sao</option>
              <option value={2}>2 sao</option>
              <option value={1}>1 sao</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="sm:col-span-4 relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              aria-label={t.courses?.sortReviews || "Sắp xếp nhận xét"}
              className="w-full h-10 appearance-none pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011] cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Đánh giá cao nhất</option>
              <option value="lowest">Đánh giá thấp nhất</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* Search Input (Debounced 300ms) */}
          <div className="sm:col-span-4 relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm trong nhận xét..."
              className="w-full h-10 pl-8 pr-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#990011] focus:border-[#990011]"
            />
          </div>
        </div>
      </div>

      {/* ─── Scrollable Reviews List ─── */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col gap-3.5">
        {/* Initial Loading Skeleton */}
        {isLoading && accumulatedReviews.length === 0 ? (
          <div className="flex flex-col gap-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-white rounded-2xl border border-slate-200"
              />
            ))}
          </div>
        ) : accumulatedReviews.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs sm:text-sm">
            {t.courses?.noMatchingReviews ||
              "Không tìm thấy nhận xét phù hợp với điều kiện lọc."}
          </div>
        ) : (
          <>
            {accumulatedReviews.map((rev) => {
              const revDate = rev.createdAt
                ? new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : ""
              return (
                <div
                  key={rev.reviewId}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    {/* Student Real Name (BR-EX-GV-09) */}
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {rev.studentName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {revDate}
                    </span>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= Math.round(rev.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }
                      />
                    ))}
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Class Link in Red */}
                  {rev.className && (
                    <div className="pt-1">
                      <Link
                        to={`/explore-courses/class/${rev.classId}`}
                        className="text-[11px] font-bold text-[#990011] hover:underline"
                      >
                        Lớp: {rev.className}
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Sentinel element for infinite scroll */}
            <div ref={sentinelRef} className="h-4" />

            {/* Fetching next page indicator */}
            {isFetching && (
              <div className="flex items-center justify-center py-4 text-xs font-semibold text-slate-400 gap-2">
                <Loader2 size={16} className="animate-spin text-[#990011]" />
                <span>Đang tải thêm nhận xét...</span>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

export default TeacherReviewsModal
