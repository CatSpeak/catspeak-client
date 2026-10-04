import React from "react"
import {
  Check,
  ArrowLeftRight,
  Trophy,
  Star,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PointsHistoryTab = ({
  pointHistory = [],
  historyFilter = "all",
  onFilterChange,
  historyPage = 1,
  onPageChange,
  historyPageSize = 10,
  isLoading = false,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const ht = pt.history || {}
  const ov = pt.overview || {}
  const hasItems = pointHistory.length > 0

  const getLocalizedHistoryTitle = (item) => {
    if (item.title === "Tích lũy điểm" || item.title === "Points Earned") {
      return ov.recentActivities?.earnedPoints || item.title
    }
    if (item.title === "Sử dụng điểm" || item.title === "Points Used") {
      return ov.recentActivities?.spentPoints || item.title
    }
    return item.title
  }

  const getLocalizedHistorySubtitle = (item) => {
    if (item.subtitle === "Tích lũy hoàn tất") {
      return ov.recentActivities?.earnCompleted || item.subtitle
    }
    if (
      item.subtitle === "Sử dụng điểm đổi voucher" ||
      item.subtitle === "Đổi voucher" ||
      item.subtitle === "Sử dụng điểm"
    ) {
      return ov.recentActivities?.redeemVoucher || item.subtitle
    }
    if (
      item.subtitle === "Điểm thưởng hết hạn" ||
      item.subtitle === "Điểm hết hạn"
    ) {
      return ov.recentActivities?.expiredPoints || item.subtitle
    }
    return item.subtitle
  }

  const paginationText = ht.pagination?.pageInfo
    ? ht.pagination.pageInfo
        .replace("{{page}}", historyPage)
        .replace("{{pageSize}}", historyPageSize)
    : `Trang ${historyPage} (Hiển thị tối đa ${historyPageSize} mục/trang)`

  return (
    <div className="space-y-6 pb-10">
      {/* Top Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              historyFilter === "all"
                ? "bg-[#990011] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {ht.filters?.all || "Tất cả"}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("earn")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              historyFilter === "earn"
                ? "bg-[#990011] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {ht.filters?.earn || "Nhận điểm (+)"}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange("spend")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              historyFilter === "spend"
                ? "bg-[#990011] text-white shadow-xs"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {ht.filters?.spend || "Sử dụng (-)"}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden animate-pulse">
          <div className="bg-[#990011]/80 h-10 w-full" />
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-5 py-4 grid grid-cols-12 items-center">
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-gray-200 rounded w-36" />
                    <div className="h-2.5 bg-gray-100 rounded w-20" />
                  </div>
                </div>
                <div className="col-span-4 text-center sm:text-left">
                  <div className="h-3 bg-gray-200 rounded w-24 mx-auto sm:mx-0" />
                </div>
                <div className="col-span-2 text-right">
                  <div className="h-4 bg-gray-200 rounded w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : hasItems ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="bg-[#990011] text-white px-5 py-3.5 grid grid-cols-12 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-6">
              {ht.table?.activity || "HOẠT ĐỘNG"}
            </div>
            <div className="col-span-4 sm:col-span-4 text-center sm:text-left">
              {ht.table?.time || "THỜI GIAN"}
            </div>
            <div className="col-span-2 sm:col-span-2 text-right">
              {ht.table?.points || "ĐIỂM"}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {pointHistory.map((item) => {
              const isSpend = item.type === "spend" || item.points < 0

              return (
                <div
                  key={item.id}
                  className="px-5 py-4 grid grid-cols-12 items-center hover:bg-gray-50/70 transition"
                >
                  {/* Activity with Icon */}
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isSpend
                          ? "bg-rose-50 text-rose-600"
                          : item.icon === "trophy"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.icon === "cap"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {isSpend ? (
                        <ArrowLeftRight size={17} />
                      ) : item.icon === "trophy" ? (
                        <Trophy size={17} />
                      ) : item.icon === "cap" ? (
                        <GraduationCap size={17} />
                      ) : (
                        <Check size={17} strokeWidth={2.5} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        {getLocalizedHistoryTitle(item)}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {getLocalizedHistorySubtitle(item)}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="col-span-4 sm:col-span-4 text-center sm:text-left text-xs text-gray-500">
                    {item.date}
                  </div>

                  {/* Points */}
                  <div className="col-span-2 sm:col-span-2 text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isSpend ? "text-[#990011]" : "text-emerald-600"
                      }`}
                    >
                      {item.points > 0 ? `+${item.points}` : item.points}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 bg-gray-50/50">
            <span>{paginationText}</span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={historyPage <= 1}
                onClick={() => onPageChange?.(Math.max(1, historyPage - 1))}
                className={`p-1.5 rounded-lg border flex items-center gap-1 transition ${
                  historyPage <= 1
                    ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 text-gray-700 hover:bg-white cursor-pointer shadow-2xs"
                }`}
              >
                <ChevronLeft size={14} />
                <span>{ht.pagination?.prev || "Trước"}</span>
              </button>

              <button
                type="button"
                disabled={pointHistory.length < historyPageSize}
                onClick={() => onPageChange?.(historyPage + 1)}
                className={`p-1.5 rounded-lg border flex items-center gap-1 transition ${
                  pointHistory.length < historyPageSize
                    ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                    : "border-gray-300 text-gray-700 hover:bg-white cursor-pointer shadow-2xs"
                }`}
              >
                <span>{ht.pagination?.next || "Sau"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-200/90 rounded-2xl p-16 sm:p-20 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <Star size={48} strokeWidth={1.2} />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5">
            {ht.empty?.title || "Không có lịch sử biến động điểm"}
          </h4>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            {ht.empty?.subtitle || "Hoàn thành các khóa học hoặc tham gia hoạt động để kiếm điểm thưởng nhé!"}
          </p>
        </div>
      )}
    </div>
  )
}

export default PointsHistoryTab
