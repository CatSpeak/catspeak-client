import React from "react"
import { TrendingUp } from "lucide-react"
import { formatCurrency } from "../../utils/voucherTransforms"

/**
 * VoucherStatsCard - Khối Thống kê nhanh của voucher
 * Specification 4: Đã sử dụng (x/y lượt + progress bar), Tổng tiền đã giảm, Đơn thành công.
 */
const VoucherStatsCard = ({ voucher = {}, usages = [] }) => {
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
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-xs space-y-5">
      <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
        Thống kê nhanh
      </h3>

      {/* ─── Usage Count & Progress Bar ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-slate-600 dark:text-zinc-400 font-medium">
            Đã sử dụng
          </span>
          <span className="font-bold text-slate-900 dark:text-zinc-100">
            {usedCount}/{limitDisplay} lượt
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-[#e8eef8] dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-cath-red-700 dark:bg-cath-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      {/* ─── 3 Metric Cards ─── */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {/* Box 1: Tổng tiền đã giảm */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f0f4f9] dark:bg-zinc-800/60 border border-slate-200/40 dark:border-zinc-800/80 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 leading-tight block mb-1">
            Tổng tiền đã giảm
          </span>
          <span className="text-sm sm:text-base md:text-lg font-black text-cath-red-700 dark:text-cath-red-400 truncate">
            {formatCurrency(totalDiscountGiven)}
          </span>
        </div>

        {/* Box 2: Đơn thành công */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f0f4f9] dark:bg-zinc-800/60 border border-slate-200/40 dark:border-zinc-800/80 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 leading-tight block mb-1">
            Đơn thành công
          </span>
          <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-zinc-100">
            {successfulOrdersCount}
          </span>
        </div>

        {/* Box 3: Trending chart indicator */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f0f4f9] dark:bg-zinc-800/60 border border-slate-200/40 dark:border-zinc-800/80 flex items-center justify-center">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700/60 shadow-xs flex items-center justify-center text-cath-red-700 dark:text-cath-red-400">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoucherStatsCard
