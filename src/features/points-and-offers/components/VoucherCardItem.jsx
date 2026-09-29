import React from "react"
import { Coffee, BookOpen, Headphones, Sparkles, Gift, Star, AlertCircle } from "lucide-react"

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
  const isRedeemable = voucher.isRedeemable !== undefined
    ? voucher.isRedeemable
    : userPoints >= voucher.pointsRequired && (voucher.stock === undefined || voucher.stock > 0)

  const isOutOfStock = voucher.stock !== undefined ? voucher.stock <= 0 : voucher.status === "out_of_stock"
  const notRedeemableReason = voucher.notRedeemableReason || (isOutOfStock ? "Hết hàng" : userPoints < voucher.pointsRequired ? `Cần thêm ${voucher.pointsRequired - userPoints} điểm` : null)

  if (compact) {
    // Compact version for "Có thể đổi ngay" in Overview Tab
    return (
      <div
        onClick={() => isRedeemable && onRedeem?.(voucher)}
        className={`group relative bg-white border border-gray-200/90 hover:border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
          isRedeemable ? "cursor-pointer" : "opacity-80"
        }`}
      >
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#990011] transition-colors line-clamp-2">
              {voucher.title || voucher.name}
            </h4>
            <span className="shrink-0 text-[11px] font-semibold text-[#990011] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
              {voucher.badge}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3 font-normal">
            {voucher.expiryDate || (voucher.validityDays ? `Hạn ${voucher.validityDays} ngày` : "Hạn 30 ngày")}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm">
            <Star className="text-amber-500 fill-amber-500" size={16} />
            <span>{voucher.pointsRequired}</span>
          </div>

          <button
            type="button"
            className={`text-xs font-semibold ${
              isRedeemable ? "text-[#990011] group-hover:underline cursor-pointer" : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {isRedeemable ? "Đổi ngay →" : notRedeemableReason || "Chưa đủ điều kiện"}
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
                {voucher.title || voucher.name}
              </h4>
              <span className="shrink-0 text-[11px] font-bold text-[#990011] bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md">
                {voucher.badge}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {voucher.description || voucher.conditions}
            </p>
          </div>
        </div>

        {/* Expiry & Stock info */}
        <div className="flex items-center justify-between text-[11px] text-gray-400 mb-3.5 pl-0 sm:pl-14">
          <span>{voucher.expiryDate || (voucher.validityDays ? `Hạn sử dụng ${voucher.validityDays} ngày` : "HSD 30 ngày")}</span>
          {voucher.stock !== undefined && (
            <span className={voucher.stock <= 5 ? "text-amber-600 font-semibold" : "text-gray-400"}>
              Kho: {voucher.stock} lượt
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Points + Action Button */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-sm sm:text-base">
          <Star className="text-amber-500 fill-amber-500" size={17} />
          <span>{voucher.pointsRequired}</span>
        </div>

        <div className="flex flex-col items-end">
          {isRedeemable ? (
            <button
              type="button"
              onClick={() => onRedeem?.(voucher)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] shadow-xs transition cursor-pointer"
            >
              Đổi ngay
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              >
                {notRedeemableReason || "Không khả dụng"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VoucherCardItem
