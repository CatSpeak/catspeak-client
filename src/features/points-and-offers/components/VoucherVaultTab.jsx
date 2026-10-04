import React from "react"
import { Ticket, ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import VaultVoucherItem from "./VaultVoucherItem"

const VoucherVaultTab = ({
  vaultVouchers = [],
  vaultCounts = { unused: 0, used: 0, expired: 0 },
  activeSubTab = "unused",
  onSubTabChange,
  onCopyCode,
  onUseNow,
  onGoToExchange,
  isLoading = false,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}
  const vt = pt.vault || {}

  return (
    <div className="space-y-6 pb-10">
      {/* Sub-tab pills */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
        <button
          type="button"
          onClick={() => onSubTabChange("unused")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === "unused"
              ? "bg-[#990011] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
          }`}
        >
          {vt.subTabs?.unused || "Chưa dùng"} {vaultCounts?.unused !== undefined ? `(${vaultCounts.unused})` : ""}
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("used")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === "used"
              ? "bg-[#990011] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
          }`}
        >
          {vt.subTabs?.used || "Đã dùng"} {vaultCounts?.used !== undefined ? `(${vaultCounts.used})` : ""}
        </button>

        <button
          type="button"
          onClick={() => onSubTabChange("expired")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeSubTab === "expired"
              ? "bg-[#990011] text-white shadow-xs"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70"
          }`}
        >
          {vt.subTabs?.expired || "Hết hạn"} {vaultCounts?.expired !== undefined ? `(${vaultCounts.expired})` : ""}
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200/90 rounded-2xl p-5 h-28 flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 bg-gray-200 rounded-xl" />
                <div className="h-9 w-20 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : vaultVouchers.length > 0 ? (
        <div className="space-y-4">
          {vaultVouchers.map((voucher) => (
            <VaultVoucherItem
              key={voucher.id}
              voucher={voucher}
              onCopyCode={onCopyCode}
              onUseNow={onUseNow}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-[#990011] mx-auto mb-3">
            <Ticket size={28} />
          </div>
          <h4 className="text-base font-bold text-gray-800 mb-1">
            {vt.empty?.title || "Chưa có voucher nào trong mục này"}
          </h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">
            {vt.empty?.subtitle || "Bạn có thể tích lũy điểm thưởng qua các hoạt động học tập và đổi ngay những ưu đãi hấp dẫn."}
          </p>
          <button
            type="button"
            onClick={onGoToExchange}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#990011] hover:bg-[#85000f] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <span>{vt.empty?.exploreAction || "Khám phá kho ưu đãi"}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

export default VoucherVaultTab
