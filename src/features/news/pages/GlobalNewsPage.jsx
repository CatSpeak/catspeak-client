import React, { useState, useRef, useEffect, useMemo } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import {
  Globe,
  Filter,
  Flame,
  Search,
  X,
  ChevronRight,
  SlidersHorizontal,
  Clock,
  Eye,
  Heart,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useGetPostsQuery } from "@/store/api/social/postsApi"
import PostFeedList from "@/features/profile/components/PostFeedList"
import CreatePostBox from "@/features/profile/components/CreatePostBox"
import SidebarRecommendationWidget from "../components/recommendations/SidebarRecommendationWidget"
import DailyVocabWidget from "../components/daily-vocab/DailyVocabWidget"
import CurrentTrendingWidget from "../components/recommendations/CurrentTrendingWidget"
import RecentSearchChips from "../components/RecentSearchChips"
import NewsAdvancedFilterModal from "../components/NewsAdvancedFilterModal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import {
  getCommunityName,
  getCommunityLanguageId,
  isPostInCommunity,
} from "../utils/newsUtils"

const GlobalNewsPage = () => {
  const { lang } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const currentLang = lang || language || "en"
  const { isDesktopExpanded } = useSidebar()

  const sortTabs = useMemo(() => [
    { id: "createDate", label: t.news?.filters?.newest || "Mới nhất", icon: Clock },
    { id: "viewCount", label: t.news?.filters?.mostViewed || "Xem nhiều nhất", icon: Eye },
    { id: "reactions", label: t.news?.filters?.mostReactions || "Tương tác nhiều", icon: Heart },
  ], [t])

  const searchKeyword = searchParams.get("search") || ""
  const trendKeyword = searchParams.get("trend") || ""
  const activeKeyword = trendKeyword || searchKeyword || ""

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [sortBy, setSortBy] = useState("createDate")
  const [advancedFilters, setAdvancedFilters] = useState({})
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const currentCommunity = useMemo(() => {
    return getCommunityName(
      lang || localStorage.getItem("communityLanguage") || language || "en",
    )
  }, [lang, language])

  const currentCommunityId = useMemo(() => {
    return getCommunityLanguageId(lang || currentCommunity)
  }, [lang, currentCommunity])

  // Synchronous filter key tracking and page reset (matching NewsPage)
  const filterKey = useMemo(() => {
    const mediaTypesKey = (advancedFilters.mediaTypes || []).slice().sort().join(",")
    return `${currentCommunityId}_${activeKeyword}_${sortBy}_${advancedFilters.fromDate || ""}_${advancedFilters.toDate || ""}_${advancedFilters.hasComments || ""}_${advancedFilters.hasMedia || ""}_${mediaTypesKey}`
  }, [currentCommunityId, activeKeyword, sortBy, advancedFilters])

  const [prevFilterKey, setPrevFilterKey] = useState(filterKey)

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  // Fetch social posts with searchKeyword & advanced filters
  const { data, error, isLoading, isFetching } = useGetPostsQuery({
    page,
    pageSize,
    postType: 2,
    languageCommunity: currentCommunityId,
    searchKeyword: activeKeyword || undefined,
    sortBy,
    fromDate: advancedFilters.fromDate,
    toDate: advancedFilters.toDate,
    hasComments: advancedFilters.hasComments,
    hasMedia: advancedFilters.hasMedia,
    mediaTypes: advancedFilters.mediaTypes,
  })

  // Filter loading state on page 1 (initial load, tab sort change, search, or modal filter apply)
  const isFilterLoading = (isLoading || isFetching) && page === 1

  // Filter public posts belonging to current community
  const posts = useMemo(() => {
    const rawList = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : []
    return rawList.filter(
      (post) =>
        (!post.privacy || String(post.privacy).toLowerCase() === "public") &&
        isPostInCommunity(post, currentCommunityId),
    )
  }, [data, currentCommunityId])

  const totalCount = data?.totalCount ?? posts.length

  // Infinite scroll observer for vertical social feed
  const lastPostRef = useRef(null)
  useEffect(() => {
    if (!lastPostRef.current || !data?.hasMore || isFetching) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(lastPostRef.current)
    return () => observer.disconnect()
  }, [posts, data?.hasMore, isFetching])

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("search")
    newParams.delete("trend")
    setSearchParams(newParams)
  }

  const handleSelectKeyword = (kw) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("search", kw)
    newParams.delete("trend")
    setSearchParams(newParams)
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (advancedFilters.fromDate || advancedFilters.toDate) count++
    if (advancedFilters.hasComments) count++
    if (advancedFilters.hasMedia) count++
    if (advancedFilters.mediaTypes?.length > 0) count++
    return count
  }, [advancedFilters])

  return (
    <div className="flex w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 gap-4 xl:gap-6 items-start justify-center min-w-0">
      {/* Main Feed Column */}
      <div className="flex flex-col w-full min-w-0 max-w-2xl gap-4 flex-1">
        {/* Trend Breadcrumb & Title (BA-TASK-05) */}
        {trendKeyword && (
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-neutral-900 dark:to-neutral-800 border border-cath-red-700/20 dark:border-neutral-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
              <span
                onClick={handleClearSearch}
                className="cursor-pointer hover:underline text-slate-700 dark:text-neutral-300"
              >
                {t.news?.globalNews || "Bản tin thế giới"}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-cath-red-700 dark:text-rose-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {t.news?.trendLabel || "Xu hướng"}: {trendKeyword}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-100">
                {(t.news?.trendFeedTitle || "Bản tin xu hướng {{community}}").replace("{{community}}", currentCommunity)}
              </h2>
              <button
                type="button"
                onClick={handleClearSearch}
                className="flex items-center gap-1 text-xs text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-white/60 dark:hover:bg-neutral-700/60 transition-colors"
                title={t.news?.clearTrendFilter || "Bỏ lọc xu hướng"}
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.news?.viewAll || "Xem tất cả"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Results Summary Header (BA-TASK-07) */}
        {searchKeyword && !trendKeyword && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cath-red-700 dark:text-rose-400" />
              <span className="text-sm text-slate-800 dark:text-neutral-200">
                {(t.news?.searchResultsFor || 'Khoảng {{count}} kết quả cho "{{keyword}}"')
                  .split(/\{\{count\}\}|\{\{keyword\}\}/)
                  .map((part, pIdx) => (
                    <React.Fragment key={pIdx}>
                      {part}
                      {pIdx === 0 && <strong className="text-slate-900 dark:text-white">{totalCount}</strong>}
                      {pIdx === 1 && <strong className="text-cath-red-700 dark:text-rose-400">{searchKeyword}</strong>}
                    </React.Fragment>
                  ))}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearch}
              className="flex items-center gap-1 text-xs text-slate-600 dark:text-neutral-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t.news?.clearSearch || "Xóa tìm kiếm"}</span>
            </button>
          </div>
        )}

        {/* Recent Search Chips (BA-TASK-07) */}
        <RecentSearchChips
          onSelectKeyword={handleSelectKeyword}
          activeKeyword={activeKeyword}
        />

        {/* Sort & Filter Controls Bar */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs">
          {/* Sorting Tabs */}
          <div className="flex items-center gap-1">
            {sortTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = sortBy === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSortBy(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    isActive
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Filter Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              activeFilterCount > 0
                ? "bg-rose-50 dark:bg-rose-950/40 border-cath-red-700 text-cath-red-700 font-semibold"
                : "border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t.news?.filtersButton || "Bộ lọc"}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-cath-red-700 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filter Modal */}
        <NewsAdvancedFilterModal
          open={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          initialFilters={{ ...advancedFilters, sortBy }}
          onApply={(filters) => {
            if (filters.sortBy) {
              setSortBy(filters.sortBy)
            }
            setAdvancedFilters(filters)
          }}
        />

        {/* Create Post Box (Only show when not actively searching/filtering trend for a cleaner feed) */}
        {!activeKeyword && <CreatePostBox defaultCommunity={currentCommunity} />}

        {/* Post Feed List */}
        <PostFeedList
          posts={posts}
          isLoading={isLoading && page === 1}
          isFetching={isFetching && page > 1}
          isFilterLoading={isFilterLoading}
          error={error && page === 1}
          errorMessage={t.news?.loadError || "Không thể tải tin tức thế giới"}
          emptyMessage={
            activeKeyword
              ? (t.news?.searchEmptyTitle || 'Không tìm thấy bài viết nào cho "{{keyword}}"').replace("{{keyword}}", activeKeyword)
              : t.news?.empty?.title || "Chưa có bài đăng nào"
          }
          emptyIcon={activeKeyword ? Search : Globe}
          emptyDescription={
            activeKeyword
              ? t.news?.searchEmptyDescription || "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc nâng cao."
              : t.news?.empty?.description ||
                "Hiện tại chưa có bài đăng nào trong bản tin thế giới. Hãy quay lại sau!"
          }
          emptyVariant="page"
          lastPostRef={lastPostRef}
          className="flex flex-col gap-2 w-full flex-1"
          showRecommendations={!activeKeyword}
          languageCommunity={currentCommunityId}
          searchKeyword={activeKeyword}
        />
      </div>

      {/* Right Sidebar - Desktop Only */}
      <aside
        className={`flex-col shrink-0 gap-4 sticky top-20 w-[280px] xl:w-[320px] 2xl:w-[350px] ${
          isDesktopExpanded ? "hidden xl:flex" : "hidden lg:flex"
        }`}
      >
        {/* Thẻ Từ vựng của ngày / Ôn tập từ vựng BR-VOCAB-01 */}
        <DailyVocabWidget lang={currentLang} />

        {/* Widget Đề xuất */}
        {/* Top 3 Current Trending Widget (BA-TASK-05) */}
        <CurrentTrendingWidget languageCommunity={currentCommunityId} />

        {/* Recommendations Widget (Teachers, Groups, Users) */}
        <SidebarRecommendationWidget languageCommunity={currentCommunityId} />
      </aside>
    </div>
  )
}

export default GlobalNewsPage
