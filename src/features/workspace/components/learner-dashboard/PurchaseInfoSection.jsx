import React from "react"
import { useNavigate } from "react-router-dom"
import { CreditCard, Crown, Gift, History, ChevronRight, CalendarClock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PurchaseInfoSection = ({ data }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isEn = language === "en"

  const sub = data?.subscription
  const rewards = data?.rewards
  const paymentHistory = data?.paymentHistory

  return (
    <section
      aria-labelledby="purchase-info-heading"
      className="bg-white dark:bg-[#1A1A1A] border border-[#DEE0E5] dark:border-[#3F3F3F] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#72000D] dark:text-red-400" />
            <h2 id="purchase-info-heading" className="text-base font-bold text-[#14171F] dark:text-white">
              {isEn ? "Purchases & Subscriptions" : "Thông tin mua hàng & Gói cước"}
            </h2>
          </div>
          <p className="text-xs text-[#6E788C] dark:text-neutral-400 mt-0.5">
            {isEn
              ? "Active plan status, payment records, and rewards"
              : "Tình trạng gói thành viên, ưu đãi điểm thưởng và lịch sử thanh toán"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(paymentHistory?.targetUrl || "/billing")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B80514] dark:text-red-400 hover:underline cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          <span>{isEn ? "Billing History" : "Lịch sử thanh toán"}</span>
        </button>
      </div>

      {/* 3 Main Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Subscription Status */}
        <div className="bg-gradient-to-br from-[#72000D]/5 via-white to-orange-50/20 dark:from-red-950/20 dark:via-[#202020] dark:to-[#202020] border border-[#DEE0E5] dark:border-[#333333] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#72000D]/10 dark:bg-red-950/40 text-[#72000D] dark:text-red-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            {sub?.isActive ? (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                {isEn ? "ACTIVE" : "ĐANG KÍCH HOẠT"}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-gray-500 dark:text-neutral-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                {isEn ? "NO SUBSCRIPTION" : "CHƯA ĐĂNG KÝ"}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#14171F] dark:text-white">
              {isEn ? sub?.planNameEn || "Free Tier" : sub?.planName || "Gói Cơ bản"}
            </h3>
            {sub?.isActive && sub.daysRemaining !== null && sub.daysRemaining !== undefined && (
              <p className="text-[11px] text-[#6E788C] dark:text-neutral-400 mt-1 flex items-center gap-1">
                <CalendarClock className="w-3 h-3 text-[#72000D] dark:text-red-400" />
                <span>
                  {isEn ? "Remaining: " : "Còn lại: "}
                  <strong className="text-[#14171F] dark:text-neutral-200 font-semibold">{sub.daysRemaining} {isEn ? "days" : "ngày"}</strong>
                </span>
              </p>
            )}
          </div>
        </div>

        {/* 2. VIP Packages count */}
        <div className="bg-[#FBFBFC] dark:bg-[#202020] border border-[#DEE0E5] dark:border-[#333333] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6E788C] dark:text-neutral-400">
              {isEn ? "VIP Packages Owned" : "Gói VIP đã mua"}
            </span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-1">
            <span className="text-xl font-bold text-[#14171F] dark:text-white tabular-nums">
              {data?.vipPackagesBought || 0}
            </span>
            <span className="text-xs text-[#6E788C] dark:text-neutral-400 ml-1">{isEn ? "packages" : "gói"}</span>
          </div>
          <p className="text-[10px] text-[#6E788C] dark:text-neutral-400 pt-1 border-t border-[#DEE0E5]/60 dark:border-[#2E2E2E]">
            {isEn ? "Lifetime learning entitlements" : "Quyền lợi phòng và bài giảng VIP"}
          </p>
        </div>

        {/* 3. Vouchers & Reward points */}
        <div className="bg-[#FBFBFC] dark:bg-[#202020] border border-[#DEE0E5] dark:border-[#333333] rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#6E788C] dark:text-neutral-400">
              {isEn ? "Rewards & Points" : "Voucher & Điểm thưởng"}
            </span>
            <Gift className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <div>
              <span className="text-xl font-bold text-[#14171F] dark:text-white tabular-nums">
                {rewards?.vouchersCount || 0}
              </span>
              <span className="text-xs text-[#6E788C] dark:text-neutral-400 ml-1">Vouchers</span>
            </div>
            <span className="text-gray-300 dark:text-neutral-600">•</span>
            <div>
              <span className="text-base font-bold text-[#72000D] dark:text-red-400 tabular-nums">
                {rewards?.rewardPoints?.toLocaleString() || 0}
              </span>
              <span className="text-xs text-[#6E788C] dark:text-neutral-400 ml-1">Pts</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/workspace/explore-courses")}
            className="text-[11px] font-semibold text-[#72000D] dark:text-red-400 hover:underline cursor-pointer flex items-center justify-between pt-1 border-t border-[#DEE0E5]/60 dark:border-[#2E2E2E]"
          >
            <span>{isEn ? "Redeem rewards" : "Đổi ưu đãi"}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default PurchaseInfoSection
