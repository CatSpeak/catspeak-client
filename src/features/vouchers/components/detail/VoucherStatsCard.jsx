import React from "react"
import { TrendingUp } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { formatCurrency } from "../../utils/voucherTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * VoucherStatsCard - Khối Thống kê nhanh của voucher
 * Specification 4: Đã sử dụng (x/y lượt + progress bar), Tổng tiền đã giảm, Đơn thành công.
 */
const VoucherStatsCard = ({ voucher = {}, usages = [] }) => {
  const { t } = useLanguage()
  const vd = t?.vouchers?.detail || {}
  const dep = t?.vouchers?.deposit || {}

  const usedCount = Number(voucher.usedCount || 0)
  const totalLimit = Number(voucher.totalUsageLimit || 0)
  const limitDisplay = totalLimit > 0 ? `${totalLimit}` : "∞"

  // Calculate usage percentage
  const usagePercentage =
    totalLimit > 0 ? Math.min(100, Math.round((usedCount / totalLimit) * 100)) : 0

  // Calculate successful orders count & total discount given
  const successfulOrdersCount = Number(
    voucher.successfulOrdersCount ??
      voucher.successOrders ??
      usages.filter(
        (u) =>
          u.status === "Success" ||
          u.status === 2 ||
          u.orderStatus === "Success"
      ).length
  )

  const totalDiscountGiven = Number(
    voucher.totalDiscountGiven ??
      voucher.depositUsed ??
      usages
        .filter(
          (u) =>
            u.status === "Success" ||
            u.status === 2 ||
            u.orderStatus === "Success"
        )
        .reduce((sum, u) => sum + Number(u.discountAmount || 0), 0)
  )

  return (
    <FluentCard className="space-y-5">
      <h4 className="font-bold text-primary">
        {vd.statsTitle || "Thống kê nhanh"}
      </h4>

      {/* ─── Usage Count & Progress Bar ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-secondary font-medium">
            {vd.usedCount || "Đã sử dụng"}
          </span>
          <span className="font-bold text-primary">
            {usedCount}/{limitDisplay} {dep.usagesUnit || "lượt"}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-cath-red-700 h-2 rounded-full transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* ─── 3 Metric Cards ─── */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {/* Box 1: Tổng tiền đã giảm */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary leading-tight block mb-1">
            {vd.totalDiscountGiven || "Tổng tiền đã giảm"}
          </span>
          <span className="text-sm sm:text-base md:text-lg font-black text-cath-red-700 truncate">
            {formatCurrency(totalDiscountGiven)}
          </span>
        </div>

        {/* Box 2: Đơn thành công */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary leading-tight block mb-1">
            {vd.successOrders || "Đơn thành công"}
          </span>
          <span className="text-sm sm:text-base md:text-lg font-black text-primary">
            {successfulOrdersCount}
          </span>
        </div>

        {/* Box 3: Trending chart indicator */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-cath-red-700">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </FluentCard>
  )
}

export default VoucherStatsCard
