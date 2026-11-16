import React from "react"
import { Copy } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const VaultVoucherItem = ({
  voucher,
  onCopyCode,
  onUseNow,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const viItem = pt.vault?.item || {}

  const isUnused = voucher.status === "unused"
  const isUsed = voucher.status === "used"
  const isExpired = voucher.status === "expired"

  const description =
    voucher.description ||
    (voucher.discountType === "Percentage" && viItem.percentDiscountDesc
      ? viItem.percentDiscountDesc.replace(
          "{{percent}}",
          voucher.discountValue,
        )
      : voucher.discountType === "FixedAmount" && viItem.fixedDiscountDesc
        ? viItem.fixedDiscountDesc.replace(
            "{{amount}}",
            (voucher.discountValue || 0).toLocaleString("vi-VN"),
          )
        : voucher.description)

  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] border border-gray-200/90 dark:border-[#3F3F3F] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col md:flex-row items-stretch">
      {/* Left Discount Stub with Coupon Design */}
      <div className="w-full md:w-36 bg-gradient-to-br from-rose-50 via-rose-100/50 to-orange-50 dark:from-rose-950/30 dark:via-[#272727] dark:to-orange-950/20 border-b md:border-b-0 md:border-r border-dashed border-gray-200 dark:border-[#3F3F3F] p-4 sm:p-5 flex flex-col items-center justify-center text-center shrink-0 relative">
        <span className="text-2xl sm:text-3xl font-black text-[#990011] dark:text-red-400 tracking-tight">
          {voucher.discountTag}
        </span>
        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-neutral-400 tracking-wider mt-0.5">
          {viItem.voucherLabel || "Voucher"}
        </span>

        {/* Decorative Ticket Perforation Circles (on md screen) */}
        <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primaryBg dark:bg-[#0F0F0F] border border-gray-200/80 dark:border-[#3F3F3F]" />
        <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-primaryBg dark:bg-[#0F0F0F] border border-gray-200/80 dark:border-[#3F3F3F]" />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
              {voucher.title || voucher.name}
            </h4>

            {isUnused && (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                {voucher.badge || viItem.badgeUnused || "Chưa dùng"}
              </span>
            )}
            {isUsed && (
              <span className="text-[11px] font-semibold text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-[#272727] border border-gray-200 dark:border-[#3F3F3F] px-2 py-0.5 rounded-full">
                {viItem.badgeUsed || "Đã dùng"}
              </span>
            )}
            {isExpired && (
              <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 rounded-full">
                {viItem.badgeExpired || "Hết hạn"}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-gray-100 dark:border-[#272727] text-xs">
          <div className="flex items-center gap-1.5 font-mono font-bold bg-gray-50 dark:bg-[#242424] px-2.5 py-1 rounded-md text-gray-800 dark:text-neutral-200 border border-gray-200/70 dark:border-[#3F3F3F]">
            <span>{voucher.code}</span>
            <button
              type="button"
              onClick={() => onCopyCode?.(voucher.code)}
              className="text-gray-400 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-white transition ml-1 cursor-pointer"
              title={viItem.copyTooltip || "Sao chép mã"}
            >
              <Copy size={13} />
            </button>
          </div>

          <div className="text-gray-400 dark:text-neutral-400 text-[11px]">
            {isUsed ? (
              <span>
                {viItem.usedDate
                  ? viItem.usedDate.replace(
                      "{{date}}",
                      voucher.usedDate || voucher.expiryDate,
                    )
                  : `Thời gian sử dụng: ${voucher.usedDate || voucher.expiryDate}`}
              </span>
            ) : (
              <span>
                {viItem.expiryDate
                  ? viItem.expiryDate.replace(
                      "{{date}}",
                      voucher.expiryDate,
                    )
                  : `HSD: ${voucher.expiryDate}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="p-4 sm:p-5 flex md:flex-col justify-end md:justify-center items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-[#272727] bg-gray-50/40 dark:bg-[#242424]/50 shrink-0">
        {isUnused ? (
          <>
            <button
              type="button"
              onClick={() => onCopyCode?.(voucher.code)}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-neutral-200 bg-white dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#272727] border border-gray-200 dark:border-[#3F3F3F] rounded-lg transition cursor-pointer"
            >
              {viItem.copyCode || "Sao chép mã"}
            </button>
            <button
              type="button"
              onClick={() => onUseNow?.(voucher)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] rounded-lg shadow-xs transition cursor-pointer"
            >
              {viItem.useNow || "Dùng ngay"}
            </button>
          </>
        ) : isUsed ? (
          <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 px-3 py-1 bg-gray-100 dark:bg-[#272727] rounded-md">
            {viItem.badgeUsed || "Đã dùng"}
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-400 dark:text-neutral-500 px-3 py-1 bg-gray-100 dark:bg-[#272727] rounded-md">
            {viItem.badgeExpired || "Hết hạn"}
          </span>
        )}
      </div>
    </div>
  )
}

export default VaultVoucherItem
