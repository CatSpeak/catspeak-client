import React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Flame, TrendingUp, RefreshCw, Hash } from "lucide-react"
import { useGetTrendingTopicsQuery } from "@/store/api/social/searchApi"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"

const formatCount = (count) => {
  if (!count || count < 0) return "0"
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return count.toLocaleString()
}

const RANK_STYLES = {
  1: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold",
  2: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20 font-semibold",
  3: "bg-amber-700/10 text-amber-700 dark:text-amber-500 border border-amber-700/20 font-semibold",
}

const CurrentTrendingWidget = ({ languageCommunity = 0 }) => {
  const navigate = useNavigate()
  const { lang } = useParams()
  const [searchParams] = useSearchParams()
  const currentTrend = searchParams.get("trend")
  const currentLang = lang || "en"
  const { formatTimeAgo } = useTimezone()
  const { t } = useLanguage()

  const {
    data: trends = [],
    isLoading,
    isError,
    refetch,
  } = useGetTrendingTopicsQuery(languageCommunity)

  const handleSelectTrend = (keyword) => {
    navigate(`/${currentLang}/cat-speak/global-news?trend=${encodeURIComponent(keyword)}`)
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-cath-red-700 dark:text-rose-400">
            <Flame className="w-4 h-4 fill-current" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-neutral-100">
            {t.news?.trendingTitle || "Xu hướng hiện tại"}
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-600 dark:text-neutral-400 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {t.news?.trendingPast24h || "24h qua"}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-3 py-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-neutral-800 shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="h-3.5 bg-slate-200 dark:bg-neutral-800 rounded-sm w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-neutral-800 rounded-sm w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="py-4 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-xs text-slate-600 dark:text-neutral-400">
            {t.news?.trendingLoadError || "Không thể tải xu hướng lúc này"}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-cath-red-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            {t.news?.retry || t.common?.retry || "Thử lại"}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && trends.length === 0 && (
        <div className="py-5 flex flex-col items-center justify-center text-center gap-1.5 text-slate-600 dark:text-neutral-400">
          <Hash className="w-6 h-6 stroke-1 text-slate-300 dark:text-neutral-600" />
          <p className="text-xs font-medium">{t.news?.trendingEmptyTitle || "Chưa có xu hướng nổi bật"}</p>
          <p className="text-[11px] text-slate-600 dark:text-neutral-400">
            {t.news?.trendingEmptyDesc || "Hãy tham gia thảo luận và chia sẻ bài viết đầu tiên!"}
          </p>
        </div>
      )}

      {/* Trends List (Top 3) */}
      {!isLoading && !isError && trends.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {trends.slice(0, 3).map((item, idx) => {
            const rank = idx + 1
            const isSelected =
              currentTrend &&
              currentTrend.toLowerCase() === item.keyword.toLowerCase()

            return (
              <div
                key={item.keyword || idx}
                onClick={() => handleSelectTrend(item.keyword)}
                className={`flex items-start gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-rose-50 dark:bg-rose-950/30 border border-cath-red-700/30 dark:border-rose-500/30"
                    : "hover:bg-slate-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    RANK_STYLES[rank] || "bg-slate-100 dark:bg-neutral-800 text-slate-600"
                  }`}
                >
                  #{rank}
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-slate-900 dark:text-neutral-100 line-clamp-1 group-hover:text-cath-red-700 transition-colors">
                      {item.keyword}
                    </span>
                    {/* Time ago */}
                    {item.trendingSince && (
                      <span className="text-[10px] text-slate-600 dark:text-neutral-400 shrink-0">
                        {formatTimeAgo(item.trendingSince)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-neutral-400 line-clamp-1">
                      {item.category || t.news?.trendingFeaturedTopic || "Chủ đề nổi bật"} ·{" "}
                      <span className="font-medium text-slate-700 dark:text-neutral-300">
                        {(t.news?.postsCount || "{{count}} bài viết").replace("{{count}}", formatCount(item.postCount))}
                      </span>
                    </span>

                    {/* Stacked Avatars */}
                    {Array.isArray(item.topAvatars) && item.topAvatars.length > 0 && (
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        {item.topAvatars.slice(0, 3).map((avatarUrl, aIdx) => (
                          <img
                            key={aIdx}
                            src={avatarUrl}
                            alt="author avatar"
                            className="w-4 h-4 rounded-full border border-white dark:border-neutral-900 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CurrentTrendingWidget
