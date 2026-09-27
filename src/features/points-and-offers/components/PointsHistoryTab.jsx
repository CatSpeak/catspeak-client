import React from "react"
import {
  Check,
  ArrowLeftRight,
  Trophy,
  Star,
  GraduationCap,
  Eye,
  EyeOff,
} from "lucide-react"

const PointsHistoryTab = ({
  pointHistory = [],
  historyFilter = "all",
  onFilterChange,
  isEmptyPreview = false,
  onToggleEmptyPreview,
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Top Filter Chips & Empty State Preview Toggle */}
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
            Tất cả
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
            Nhận điểm (+)
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
            Sử dụng (-)
          </button>
        </div>

        {/* Toggle Empty Preview Button */}
        <button
          type="button"
          onClick={onToggleEmptyPreview}
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200/80 px-3 py-1.5 rounded-lg transition"
          title="Xem trạng thái rỗng"
        >
          {isEmptyPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{isEmptyPreview ? "Xem danh sách có dữ liệu" : "Xem giao diện rỗng"}</span>
        </button>
      </div>

      {/* Main Table or Empty State */}
      {pointHistory.length > 0 && !isEmptyPreview ? (
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header*/}
          <div className="bg-[#990011] text-white px-5 py-3.5 grid grid-cols-12 text-xs font-bold uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-6">HOẠT ĐỘNG</div>
            <div className="col-span-4 sm:col-span-4 text-center sm:text-left">THỜI GIAN</div>
            <div className="col-span-2 sm:col-span-2 text-right">ĐIỂM</div>
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
                  {/* Activity with Circle Icon */}
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
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {item.subtitle}
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

          {/* Footer note */}
          <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-100 bg-gray-50/50">
            Hiển thị {pointHistory.length} giao dịch gần nhất
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-200/90 rounded-2xl p-16 sm:p-20 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
            <Star size={48} strokeWidth={1.2} />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-1.5">
            Bạn chưa có điểm thưởng nào
          </h4>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Hoàn thành các khóa học hoặc tham gia thử thách để kiếm điểm thưởng nhé!
          </p>
        </div>
      )}
    </div>
  )
}

export default PointsHistoryTab
