import React from "react"
import { Copy } from "lucide-react"

const VaultVoucherItem = ({
  voucher,
  onCopyCode,
  onUseNow,
}) => {
  const isUnused = voucher.status === "unused"
  const isUsed = voucher.status === "used"
  const isExpired = voucher.status === "expired"

  return (
    <div className="relative bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition duration-200 flex flex-col md:flex-row items-stretch">
      {/* Left Discount Stub with Coupon Design */}
      <div className="w-full md:w-36 bg-gradient-to-br from-rose-50 via-rose-100/50 to-orange-50 border-b md:border-b-0 md:border-r border-dashed border-gray-200 p-4 sm:p-5 flex flex-col items-center justify-center text-center shrink-0 relative">
        <span className="text-2xl sm:text-3xl font-black text-[#990011] tracking-tight">
          {voucher.discountTag}
        </span>
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">
          Voucher
        </span>

        {/* Decorative Ticket Perforation Circles (on md screen) */}
        <div className="hidden md:block absolute -top-3 -right-3 w-6 h-6 rounded-full bg-primaryBg border border-gray-200/80" />
        <div className="hidden md:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-primaryBg border border-gray-200/80" />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">
              {voucher.title || voucher.name}
            </h4>

            {isUnused && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {voucher.badge || "Chưa dùng"}
              </span>
            )}
            {isUsed && (
              <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                Đã dùng
              </span>
            )}
            {isExpired && (
              <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                Hết hạn
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            {voucher.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 font-mono font-bold bg-gray-50 px-2.5 py-1 rounded-md text-gray-800 border border-gray-200/70">
            <span>{voucher.code}</span>
            <button
              type="button"
              onClick={() => onCopyCode?.(voucher.code)}
              className="text-gray-400 hover:text-gray-700 transition ml-1 cursor-pointer"
              title="Sao chép mã"
            >
              <Copy size={13} />
            </button>
          </div>

          <div className="text-gray-400 text-[11px]">
            {isUsed ? (
              <span>Thời gian sử dụng: {voucher.usedDate || voucher.expiryDate}</span>
            ) : (
              <span>HSD: {voucher.expiryDate}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="p-4 sm:p-5 flex md:flex-col justify-end md:justify-center items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 bg-gray-50/40 shrink-0">
        {isUnused ? (
          <>
            <button
              type="button"
              onClick={() => onCopyCode?.(voucher.code)}
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition cursor-pointer"
            >
              Sao chép mã
            </button>
            <button
              type="button"
              onClick={() => onUseNow?.(voucher)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#990011] hover:bg-[#85000f] active:bg-[#72000d] rounded-lg shadow-xs transition cursor-pointer"
            >
              Dùng ngay
            </button>
          </>
        ) : isUsed ? (
          <span className="text-xs font-semibold text-gray-400 px-3 py-1 bg-gray-100 rounded-md">
            Đã dùng
          </span>
        ) : (
          <span className="text-xs font-semibold text-gray-400 px-3 py-1 bg-gray-100 rounded-md">
            Hết hạn
          </span>
        )}
      </div>
    </div>
  )
}

export default VaultVoucherItem
