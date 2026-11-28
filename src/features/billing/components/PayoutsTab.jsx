import React from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Building2,
  Landmark,
  Loader2,
  ReceiptText,
  RefreshCw,
  Wallet,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import useRoleOverride from "@/features/courses/components/RoleSwitcher"
import { useGetPayoutHistoryQuery } from "../api/payoutsApi"

const STATUS_STYLES = {
  PendingApproval:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50",
  Approved:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
  Processing:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/50",
  Succeeded:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  Failed:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50",
  Rejected:
    "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700",
}

const formatCurrency = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return "—"
  return `${amount.toLocaleString("vi-VN")} ₫`
}

const formatDateTime = (value) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("vi-VN")
}

const PayoutsTab = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { isTeacher } = useRoleOverride()
  const pt = t.billing?.payouts || {}

  const {
    data: payouts,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetPayoutHistoryQuery(undefined, { skip: !isTeacher })

  const rows = Array.isArray(payouts) ? payouts : []

  const statusLabel = (status) =>
    pt.statuses?.[status] || status || pt.statuses?.Unknown || "—"

  const statusBadge = (status) => (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || STATUS_STYLES.Rejected
      }`}
    >
      {statusLabel(status)}
    </span>
  )

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Quick actions overview */}
      <section className="rounded-xl border border-[#DEE0E5] bg-white p-4 shadow-2xs dark:border-[#3F3F3F] dark:bg-[#1A1A1A] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-[#14171F] dark:text-white">
              <Wallet className="h-4 w-4 text-[#72000D] dark:text-red-400" />
              {pt.overviewTitle || "Doanh thu & Rút tiền"}
            </h2>
            <p className="mt-1 text-sm text-[#6E788C] dark:text-neutral-400">
              {pt.overviewDesc ||
                "Theo dõi các yêu cầu rút tiền và quản lý tài khoản ngân hàng nhận chi trả của bạn."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/workspace/analytics?tab=revenue")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#990011] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#b20a1c] dark:bg-[#FF6B6B] dark:text-[#1A1A1A] dark:hover:bg-[#ff8585]"
            >
              <ReceiptText className="h-4 w-4" />
              {pt.viewRevenue || "Xem thống kê doanh thu"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/setting/instructor")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DEE0E5] bg-white px-4 py-2 text-xs font-bold text-[#14171F] transition-colors hover:bg-[#F7F7F8] dark:border-[#3F3F3F] dark:bg-[#202020] dark:text-white dark:hover:bg-[#2A2A2A]"
            >
              <Landmark className="h-4 w-4" />
              {pt.manageBankAccount || "Quản lý tài khoản ngân hàng"}
            </button>
          </div>
        </div>
      </section>

      {/* History */}
      <section className="rounded-xl border border-[#DEE0E5] bg-white p-4 shadow-2xs dark:border-[#3F3F3F] dark:bg-[#1A1A1A] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#14171F] dark:text-white">
            <Banknote className="h-4 w-4 text-[#72000D] dark:text-red-400" />
            {pt.historyTitle || "Lịch sử rút tiền"}
          </h2>
          {(isFetching || isLoading) && (
            <span
              role="status"
              aria-live="polite"
              className="inline-flex items-center gap-1 text-xs text-[#6E788C] dark:text-neutral-400"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {pt.loading || "Đang tải..."}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-hidden="true">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <span className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              {pt.errorTitle || "Không thể tải lịch sử rút tiền"}
            </span>
            <p>
              {pt.errorDesc ||
                "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full bg-[#990011] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#b20a1c] dark:bg-[#FF6B6B] dark:text-[#1A1A1A] dark:hover:bg-[#ff8585]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {pt.retry || "Thử lại"}
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#DEE0E5] px-4 py-10 text-center dark:border-[#3F3F3F]">
            <Building2 className="h-8 w-8 text-[#6E788C] dark:text-neutral-400" />
            <h3 className="text-sm font-bold text-[#14171F] dark:text-white">
              {pt.emptyTitle || "Chưa có yêu cầu rút tiền nào"}
            </h3>
            <p className="max-w-md text-xs text-[#6E788C] dark:text-neutral-400">
              {pt.emptyDesc ||
                "Khi bạn tạo yêu cầu rút tiền, lịch sử và trạng thái xử lý sẽ hiển thị tại đây."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/setting/instructor")}
              className="inline-flex items-center gap-2 rounded-full border border-[#DEE0E5] px-4 py-2 text-xs font-bold text-[#14171F] transition-colors hover:bg-[#F7F7F8] dark:border-[#3F3F3F] dark:text-white dark:hover:bg-[#2A2A2A]"
            >
              <Landmark className="h-3.5 w-3.5" />
              {pt.emptyCta || "Liên kết ngân hàng nhận chi trả"}
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#DEE0E5] text-xs uppercase tracking-wide text-[#6E788C] dark:border-[#3F3F3F] dark:text-neutral-400">
                    <th scope="col" className="px-2 py-2 font-semibold">
                      {pt.columns?.reference || "Mã tham chiếu"}
                    </th>
                    <th scope="col" className="px-2 py-2 font-semibold">
                      {pt.columns?.bank || "Ngân hàng & STK"}
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold">
                      {pt.columns?.requestedAmount || "Số tiền yêu cầu"}
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold">
                      {pt.columns?.platformFee || "Phí nền tảng"}
                    </th>
                    <th scope="col" className="px-2 py-2 text-right font-semibold">
                      {pt.columns?.netAmount || "Thực nhận"}
                    </th>
                    <th scope="col" className="px-2 py-2 font-semibold">
                      {pt.columns?.status || "Trạng thái"}
                    </th>
                    <th scope="col" className="px-2 py-2 font-semibold">
                      {pt.columns?.createdAt || "Ngày tạo"}
                    </th>
                    <th scope="col" className="px-2 py-2 font-semibold">
                      {pt.columns?.completedAt || "Ngày hoàn tất"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((payout, index) => (
                    <tr
                      key={payout.id || payout.referenceId || index}
                      className="border-b border-[#DEE0E5]/60 align-top last:border-0 dark:border-[#2E2E2E]"
                    >
                      <td className="px-2 py-3 font-mono text-xs font-semibold text-[#14171F] dark:text-white">
                        {payout.referenceId || "—"}
                        {payout.failureReason && (
                          <p className="mt-1 font-sans text-[11px] font-normal text-rose-600 dark:text-rose-400">
                            {payout.failureReason}
                          </p>
                        )}
                      </td>
                      <td className="px-2 py-3 text-xs text-[#14171F] dark:text-neutral-200">
                        <span className="font-semibold">
                          {payout.bankShortName || "—"}
                        </span>
                        <br />
                        {payout.accountNumber || "—"}
                        <br />
                        <span className="text-[#6E788C] dark:text-neutral-400">
                          {payout.accountHolderName || "—"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right text-xs font-semibold tabular-nums text-[#14171F] dark:text-white">
                        {formatCurrency(payout.requestedAmount)}
                      </td>
                      <td className="px-2 py-3 text-right text-xs tabular-nums text-[#6E788C] dark:text-neutral-400">
                        {formatCurrency(payout.platformFee)}
                      </td>
                      <td className="px-2 py-3 text-right text-xs font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(payout.netAmount)}
                      </td>
                      <td className="px-2 py-3">{statusBadge(payout.status)}</td>
                      <td className="px-2 py-3 text-xs text-[#6E788C] dark:text-neutral-400">
                        {formatDateTime(payout.createdAt)}
                      </td>
                      <td className="px-2 py-3 text-xs text-[#6E788C] dark:text-neutral-400">
                        {formatDateTime(payout.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {rows.map((payout, index) => (
                <article
                  key={payout.id || payout.referenceId || index}
                  className="rounded-xl border border-[#DEE0E5] p-3 dark:border-[#3F3F3F]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-[#14171F] dark:text-white">
                      {payout.referenceId || "—"}
                    </span>
                    {statusBadge(payout.status)}
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.bank || "Ngân hàng & STK"}
                    </dt>
                    <dd className="text-right text-[#14171F] dark:text-neutral-200">
                      {[payout.bankShortName, payout.accountNumber]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </dd>
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.requestedAmount || "Số tiền yêu cầu"}
                    </dt>
                    <dd className="text-right font-semibold tabular-nums text-[#14171F] dark:text-white">
                      {formatCurrency(payout.requestedAmount)}
                    </dd>
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.platformFee || "Phí nền tảng"}
                    </dt>
                    <dd className="text-right tabular-nums text-[#6E788C] dark:text-neutral-400">
                      {formatCurrency(payout.platformFee)}
                    </dd>
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.netAmount || "Thực nhận"}
                    </dt>
                    <dd className="text-right font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(payout.netAmount)}
                    </dd>
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.createdAt || "Ngày tạo"}
                    </dt>
                    <dd className="text-right text-[#6E788C] dark:text-neutral-400">
                      {formatDateTime(payout.createdAt)}
                    </dd>
                    <dt className="text-[#6E788C] dark:text-neutral-400">
                      {pt.columns?.completedAt || "Ngày hoàn tất"}
                    </dt>
                    <dd className="text-right text-[#6E788C] dark:text-neutral-400">
                      {formatDateTime(payout.completedAt)}
                    </dd>
                  </dl>
                  {payout.failureReason && (
                    <p className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                      {payout.failureReason}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default PayoutsTab
