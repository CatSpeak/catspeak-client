import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import ProgressBar from "@/shared/components/ui/ProgressBar"
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
    totalLimit > 0
      ? Math.min(100, Math.round((usedCount / totalLimit) * 100))
      : 0

  // Calculate successful orders count & total discount given
  const successfulOrdersCount = Number(
    voucher.successfulOrdersCount ??
      voucher.successOrders ??
      usages.filter(
        (u) =>
          u.status === "Success" ||
          u.status === 2 ||
          u.orderStatus === "Success",
      ).length,
  )

  const totalDiscountGiven = Number(
    voucher.totalDiscountGiven ??
      voucher.depositUsed ??
      usages
        .filter(
          (u) =>
            u.status === "Success" ||
            u.status === 2 ||
            u.orderStatus === "Success",
        )
        .reduce((sum, u) => sum + Number(u.discountAmount || 0), 0),
  )

  return (
    <FluentCard className="space-y-6">
      <h4 className="font-bold">{vd.statsTitle || "Thống kê nhanh"}</h4>

      {/* ─── Usage Count & Progress Bar ─── */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-secondary">{vd.usedCount || "Đã sử dụng"}</span>
          <span>
            {usedCount}/{limitDisplay} {dep.usagesUnit || "lượt"}
          </span>
        </div>

        {/* Progress Bar Container */}
        <ProgressBar progress={usagePercentage} heightClass="h-2" />
      </div>

      {/* ─── 2 Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Box 1: Tổng tiền đã giảm */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col gap-1">
          <span className="text-sm text-secondary">
            {vd.totalDiscountGiven || "Tổng tiền đã giảm"}
          </span>
          <span className="text-2xl font-bold text-cath-red-700">
            {formatCurrency(totalDiscountGiven)}
          </span>
        </div>

        {/* Box 2: Đơn thành công */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col gap-1">
          <span className="text-sm text-secondary">
            {vd.successOrders || "Đơn thành công"}
          </span>
          <span className="text-2xl font-bold">{successfulOrdersCount}</span>
        </div>
      </div>
    </FluentCard>
  )
}

export default VoucherStatsCard
