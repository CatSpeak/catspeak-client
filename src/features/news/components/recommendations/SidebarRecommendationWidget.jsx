import React, { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Star, Users, ArrowRight, ShieldCheck } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetSidebarRecommendationsQuery } from "@/store/api/social/recommendationsApi"
import { useRecommendationTracking } from "../../hooks/useRecommendationTracking"

const SidebarItem = ({ item, languageCommunity, onNavigate }) => {
  const { t } = useLanguage()
  const { elementRef, trackCardClick } = useRecommendationTracking({
    itemType: item.type,
    targetId: item.id,
    placement: "sidebar",
    languageCommunity,
  })

  const handleClick = () => {
    trackCardClick()
    onNavigate(item)
  }

  const renderAvatar = () => {
    const isGroup = item.type === "group"
    const shapeCls = isGroup ? "rounded-xl" : "rounded-full"
    const initial = (item.name || "?").charAt(0).toUpperCase()

    if (item.avatarUrl || item.coverUrl) {
      return (
        <img
          src={item.avatarUrl || item.coverUrl}
          alt={item.name}
          className={`w-11 h-11 object-cover ${shapeCls} border border-slate-200 dark:border-neutral-700 shrink-0`}
        />
      )
    }

    return (
      <div
        className={`w-11 h-11 ${shapeCls} bg-rose-100 dark:bg-rose-950/40 text-cath-red-700 dark:text-rose-400 font-bold flex items-center justify-center shrink-0 text-sm`}
      >
        {initial}
      </div>
    )
  }

  return (
    <div
      ref={elementRef}
      onClick={handleClick}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800/60 cursor-pointer transition-colors group"
    >
      {renderAvatar()}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-800 dark:text-neutral-100 line-clamp-1 group-hover:text-cath-red-700 dark:group-hover:text-rose-400 transition-colors">
            {item.name}
          </span>
          {item.isVerified && (
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          )}
        </div>

        {/* Subtitle / Additional info based on tab */}
        {item.type === "teacher" && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            <span className="truncate">{item.subTitle || t.recommendations?.tabs?.teacher || "Giảng viên"}</span>
            <span className="flex items-center text-amber-500 font-medium shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              {item.rating?.toFixed(1) || "5.0"}
            </span>
          </div>
        )}

        {item.type === "group" && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            <Users className="w-3 h-3 shrink-0" />
            <span>
              {(t.recommendations?.counts?.members || "{{count}} thành viên").replace(
                "{{count}}",
                item.memberCount?.toLocaleString() || 0,
              )}
            </span>
          </div>
        )}

        {item.type === "user" && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            <span className="text-cath-red-600 dark:text-rose-400 font-medium">
              {item.tags?.[1] || t.recommendations?.tabs?.user || "Học viên"}
            </span>
            <span>•</span>
            <span className="truncate">{item.postCountInfo || t.recommendations?.engaged || "Tích cực"}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const SidebarRecommendationWidget = ({ languageCommunity = 0 }) => {
  const [activeTab, setActiveTab] = useState("teacher")
  const navigate = useNavigate()
  const { lang = "vi" } = useParams()
  const { t } = useLanguage()

  const tabConfigs = useMemo(
    () => [
      { key: "teacher", label: t.recommendations?.tabs?.teacher || "Giáo viên", dataKey: "teachers" },
      { key: "group", label: t.recommendations?.tabs?.group || "Nhóm học", dataKey: "groups" },
      { key: "user", label: t.recommendations?.tabs?.user || "Cá nhân", dataKey: "users" },
    ],
    [t],
  )

  // Single batch fetch for all 3 recommendation categories (teachers, groups, users)
  const { data, isError, isLoading } = useGetSidebarRecommendationsQuery({
    languageCommunity,
    limit: 3,
  })

  // Determine available tabs dynamically: only tabs with non-empty data will be shown
  const availableTabs = useMemo(() => {
    if (!data) return []
    return tabConfigs.filter((tab) => {
      const list = data[tab.dataKey] || data[tab.key] || []
      return Array.isArray(list) && list.length > 0
    })
  }, [data, tabConfigs])

  // Automatically select the first available tab if current activeTab has no data
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(availableTabs[0].key)
    }
  }, [availableTabs, activeTab])

  // Items for currently active tab
  const currentItems = useMemo(() => {
    if (!data) return []
    const currentTab = tabConfigs.find((tab) => tab.key === activeTab)
    const key = currentTab?.dataKey || activeTab
    return data[key] || data[activeTab] || []
  }, [data, activeTab, tabConfigs])

  // Sidebar is ONLY hidden if an actual error occurs
  if (isError) {
    return null
  }

  const handleNavigateItem = (item) => {
    if (item.type === "group") {
      navigate(`/chat/${item.id}`)
    } else {
      navigate(`/workspace/profile/${item.id}`)
    }
  }

  const handleViewAll = () => {
    navigate(`/${lang}/cat-speak/recommendations?tab=${activeTab}`)
  }

  return (
    <div className="flex flex-col bg-white dark:bg-[#1A1A1A] rounded-2xl border border-slate-200 dark:border-neutral-800 p-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300">
          {t.recommendations?.sidebarTitle || "GỢI Ý KẾT NỐI & HỌC TẬP"}
        </h3>
        <span className="text-[11px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
          {t.recommendations?.badge || "Đề xuất"}
        </span>
      </div>

      {/* Segmented Control Tabs - Only render tabs that have data */}
      {isLoading ? (
        <div className="flex bg-slate-100 dark:bg-neutral-800/80 p-1 rounded-xl mb-3 gap-1 animate-pulse">
          <div className="h-7 bg-slate-200 dark:bg-neutral-700 rounded-lg flex-1" />
          <div className="h-7 bg-slate-200 dark:bg-neutral-700 rounded-lg flex-1" />
          <div className="h-7 bg-slate-200 dark:bg-neutral-700 rounded-lg flex-1" />
        </div>
      ) : availableTabs.length > 1 ? (
        <div className="flex bg-slate-100 dark:bg-neutral-800/80 p-1 rounded-xl mb-3 gap-1">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all text-center ${
                  isActive
                    ? "bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {/* Items list or Loading skeleton */}
      <div className="flex flex-col gap-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-neutral-800 shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3.5 w-28 bg-slate-200 dark:bg-neutral-800 rounded-md" />
                <div className="h-2.5 w-20 bg-slate-200 dark:bg-neutral-800 rounded-md" />
              </div>
            </div>
          ))
        ) : currentItems.length > 0 ? (
          currentItems.map((item) => (
            <SidebarItem
              key={`${item.type}_${item.id}`}
              item={item}
              languageCommunity={languageCommunity}
              onNavigate={handleNavigateItem}
            />
          ))
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-neutral-500">
            {t.recommendations?.empty?.title || "Chưa có gợi ý phù hợp vào lúc này."}
          </div>
        )}
      </div>

      {/* View All link - Only shown if there are recommendations */}
      {!isLoading && availableTabs.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-neutral-800/80 flex justify-center">
          <button
            type="button"
            onClick={handleViewAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cath-red-600 dark:text-rose-400 hover:text-cath-red-700 hover:underline transition-colors"
          >
            <span>{t.recommendations?.viewAllRecommendations || "Xem tất cả gợi ý"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default SidebarRecommendationWidget
