import React, { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useSearchParams, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Sparkles,
  Star,
  Users,
  ShieldCheck,
  BookOpen,
  ChevronDown,
} from "lucide-react"
import { useGetAllRecommendationsQuery } from "@/store/api/social/recommendationsApi"
import { getCommunityLanguageId } from "../utils/newsUtils"
import { useRecommendationTracking } from "../hooks/useRecommendationTracking"

const TABS = [
  { key: "teacher", label: "Giảng viên" },
  { key: "group", label: "Nhóm" },
  { key: "user", label: "Cá nhân" },
]

const LANG_OPTIONS = [
  { id: 0, label: "Tất cả" },
  { id: 3, label: "Tiếng Nhật" },
  { id: 1, label: "Tiếng Anh" },
  { id: 2, label: "Tiếng Trung" },
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Độ phù hợp cao nhất" },
  { value: "popular", label: "Nhiều người quan tâm nhất" },
  { value: "newest", label: "Mới nhất" },
]

// ── Detail Card for Grid (No action button as per spec page 13, 14) ───────────
const DetailGridCard = ({ item, languageCommunity, onNavigate }) => {
  const { elementRef, trackCardClick } = useRecommendationTracking({
    itemType: item.type,
    targetId: item.id,
    placement: "all",
    languageCommunity,
  })

  const handleClick = () => {
    trackCardClick()
    onNavigate(item)
  }

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      className="flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer group"
    >
      {/* Visual Header */}
      {item.type === "group" ? (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-neutral-800 relative">
          {item.coverUrl || item.avatarUrl ? (
            <img
              src={item.coverUrl || item.avatarUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
              {item.name?.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center mb-3">
          <div className="relative">
            {item.avatarUrl ? (
              <img
                src={item.avatarUrl}
                alt={item.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-rose-100 dark:bg-rose-950/50 text-cath-red-700 dark:text-rose-400 font-bold text-2xl flex items-center justify-center">
                {(item.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
            {item.isVerified && (
              <ShieldCheck className="w-6 h-6 text-blue-500 absolute bottom-0 right-0 bg-white dark:bg-neutral-900 rounded-full" />
            )}
          </div>
        </div>
      )}

      {/* Title & Subtitle */}
      <div className="text-center">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-cath-red-700 dark:group-hover:text-rose-400 transition-colors">
          {item.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 mt-1">
          {item.subTitle}
        </p>
        {item.description && (
          <p className="text-xs text-slate-400 dark:text-neutral-500 line-clamp-2 mt-1.5 italic">
            "{item.description}"
          </p>
        )}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {item.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta Stats Row */}
      <div className="flex items-center justify-around mt-4 pt-3 border-t border-slate-100 dark:border-neutral-800/80 text-xs text-slate-500 dark:text-neutral-400">
        {item.type === "teacher" && (
          <>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating?.toFixed(1) || "5.0"}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                ({item.reviewCount || 10})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{item.memberCount?.toLocaleString() || 0} học viên</span>
            </div>
          </>
        )}

        {item.type === "group" && (
          <>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{item.memberCount?.toLocaleString() || 0} thành viên</span>
            </div>
            <div className="flex items-center gap-1 text-cath-red-600 dark:text-rose-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{item.postCountInfo || "Hoạt động"}</span>
            </div>
          </>
        )}

        {item.type === "user" && (
          <>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{item.mutualFriendCount || 0} bạn chung</span>
            </div>
            <div>
              <span>{item.postCountInfo || "Tích cực"}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────────
const RecommendationAllPage = () => {
  const navigate = useNavigate()
  const { lang = "vi" } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const defaultTab = searchParams.get("tab") || "teacher"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedLang, setSelectedLang] = useState(0)
  const [sortBy, setSortBy] = useState("relevance")
  const [page, setPage] = useState(1)

  // Reset page when tab/filters change
  useEffect(() => {
    setPage(1)
  }, [activeTab, selectedLang, sortBy])

  const communityId = useMemo(() => {
    return selectedLang !== 0 ? selectedLang : getCommunityLanguageId(lang)
  }, [selectedLang, lang])

  const { data, isFetching, isLoading } = useGetAllRecommendationsQuery({
    type: activeTab,
    languageCommunity: communityId,
    page,
    pageSize: 20,
    sortBy,
  })

  const items = Array.isArray(data?.data) ? data.data : []
  const hasMore = data?.hasMore ?? items.length >= 20

  // Infinite Scroll Observer (BR-DX-05)
  const loadMoreRef = useRef(null)
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isFetching) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && hasMore) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: "250px" },
    )
    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isFetching, items.length])

  const handleNavigateItem = (item) => {
    if (item.type === "group") {
      navigate(`/chat/${item.id}`)
    } else {
      navigate(`/workspace/profile/${item.id}`)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 sm:p-6 gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-neutral-300 hover:text-cath-red-600 dark:hover:text-rose-400 transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bản tin</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Đề xuất dành cho bạn
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-cath-red-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Match</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
              Khám phá danh sách đối tượng phù hợp nhất dựa trên mục tiêu học tập và thói quen luyện phát âm của bạn.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-neutral-800 pb-2">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key)
                setSearchParams({ tab: tab.key })
              }}
              className={`px-4 py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all cursor-pointer ${
                isSelected
                  ? "bg-cath-red-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Language Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedLang(opt.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer ${
                selectedLang === opt.id
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-neutral-400">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-cath-red-600"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid List */}
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-neutral-800 p-4 animate-pulse flex flex-col justify-between"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-neutral-800" />
                <div className="w-28 h-4 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                <div className="w-20 h-3 bg-slate-200 dark:bg-neutral-800 rounded-md" />
              </div>
              <div className="w-full h-8 bg-slate-200 dark:bg-neutral-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-semibold text-slate-700 dark:text-neutral-300">
            Chưa có gợi ý phù hợp cho bộ lọc hiện tại.
          </p>
          <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
            Hãy thử chọn ngôn ngữ khác hoặc quay lại sau nhé!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <DetailGridCard
                key={`${item.type}_${item.id}`}
                item={item}
                languageCommunity={communityId}
                onNavigate={handleNavigateItem}
              />
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="py-6 flex justify-center">
            {isFetching && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                <div className="w-5 h-5 border-2 border-cath-red-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang tự động tải thêm đề xuất...</span>
              </div>
            )}
            {!hasMore && items.length > 0 && (
              <span className="text-xs text-slate-400 dark:text-neutral-500">
                Đã hiển thị tất cả đề xuất phù hợp.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default RecommendationAllPage
