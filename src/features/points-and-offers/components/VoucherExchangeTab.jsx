import React from "react"
import { Search, SlidersHorizontal, Sparkles } from "lucide-react"
import VoucherCardItem from "./VoucherCardItem"

const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "course", label: "Khóa học" },
  { key: "ielts", label: "Luyện thi IELTS" },
  { key: "test", label: "Test trình độ" },
  { key: "trial", label: "Học thử 1-1" },
  { key: "package", label: "Gói VIP" },
]

const VoucherExchangeTab = ({
  vouchers = [],
  userPoints = 0,
  searchQuery = "",
  onSearchChange,
  categoryFilter = "all",
  onCategoryChange,
  onRedeemVoucher,
  isLoading = false,
}) => {
  return (
    <div className="space-y-6 pb-10">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Tìm kiếm voucher ưu đãi..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#990011]/20 focus:border-[#990011] transition"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 px-1 font-medium">
            <SlidersHorizontal size={14} />
            <span>Lọc:</span>
          </div>

          {CATEGORIES.map((cat) => {
            const isActive = categoryFilter === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onCategoryChange?.(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-[#990011] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 h-44"
            />
          ))}
        </div>
      ) : vouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {vouchers.map((voucher) => (
            <VoucherCardItem
              key={voucher.id}
              voucher={voucher}
              userPoints={userPoints}
              onRedeem={onRedeemVoucher}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
            <Sparkles size={24} />
          </div>
          <h4 className="text-base font-bold text-gray-800 mb-1">
            Không tìm thấy voucher phù hợp
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Hãy thử tìm kiếm với từ khóa khác hoặc chuyển danh mục bộ lọc.
          </p>
        </div>
      )}
    </div>
  )
}

export default VoucherExchangeTab
