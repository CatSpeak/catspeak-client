import React from "react"
import { Coffee, BookOpen, Headphones, Sparkles, Gift, Star } from "lucide-react"

const getCategoryIcon = (iconType) => {
  switch (iconType) {
    case "coffee":
      return <Coffee size={20} className="text-gray-600" />
    case "book":
      return <BookOpen size={20} className="text-gray-600" />
    case "headphones":
      return <Headphones size={20} className="text-gray-600" />
    case "sparkles":
      return <Sparkles size={20} className="text-gray-600" />
    default:
      return <Gift size={20} className="text-gray-600" />
  }
}

const VoucherCardItem = ({
  voucher,
  userPoints = 0,
  onRedeem,
  compact = false,
}) => {
  const isOutOfStock = voucher.status === "out_of_stock" || voucher.percentRedeemed >= 100
  const isExpired = voucher.status === "expired"
  const isNotEnoughPoints = userPoints < voucher.pointsRequired

  if (compact) {
    // Compact version for "Có thể đổi ngay" in Overview Tab
    return (
      <div
        onClick={() => !isOutOfStock && !isExpired && onRedeem?.(voucher)}
        className="group relative bg-white border border-gray-200/90 hover:border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#990011] transition-colors line-clamp-2">
              {voucher.title}
            </h4>
            <span className="shrink-0 text-[11px] font-semibold text-[#990011] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
              {voucher.badge}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3 font-normal">
            HSD: {voucher.expiryDate}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
            <Star className="text-amber-500 fill-amber-500" size={16} />
            <span>{voucher.pointsRequired}</span>
          </div>

          <button
            type="button"
            className="text-xs font-semibold text-[#990011] group-hover:underline"
          >
            Đổi ngay →
          </button>
        </div>
      </div>
    )
  }

  // Full catalog card version for "Đổi Voucher" tab
  return (
    <div className="bg-white border border-gray-200/90 hover:border-gray-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Icon, Title, Badge */}
        <div className="flex items-start gap-3.5 mb-2.5">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            {getCategoryIcon(voucher.iconType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
                {voucher.title}
              </h4>
              <span className="shrink-0 text-[11px] font-bold text-[#990011] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
                {voucher.badge}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {voucher.description}
            </p>
          </div>
        </div>

        {/* Expiry Date */}
        <div className="text-[11px] text-gray-400 mb-3.5 pl-0 sm:pl-14">
          HSD: {voucher.expiryDate}
        </div>

        {/* Progress Bar */}
        <div className="mb-4 pl-0 sm:pl-14">
          <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1 font-medium">
            <span>Đã đổi: {voucher.percentRedeemed}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                voucher.percentRedeemed >= 100
                  ? "bg-gray-400"
                  : "bg-gradient-to-r from-amber-500 to-[#990011]"
              }`}
              style={{ width: `${Math.min(100, voucher.percentRedeemed)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Row: Points + Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm sm:text-base">
          <Star className="text-amber-500 fill-amber-500" size={17} />
          <span>{voucher.pointsRequired}</span>
        </div>

        <div>
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            >
              Hết lượt
            </button>
          ) : isExpired ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
            >
              Hết hạn
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRedeem?.(voucher)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isNotEnoughPoints
                  ? "bg-rose-50 text-[#990011] border border-rose-200 hover:bg-rose-100"
                  : "bg-[#990011] text-white hover:bg-[#85000f] active:bg-[#72000d] shadow-xs"
              }`}
            >
              Đổi ngay
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoucherCardItem
