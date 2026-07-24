import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { RotateCcw, AlertCircle, Loader2 } from "lucide-react"

const BillingMobileCard = ({
  invoice,
  statusInfo,
  cols,
  actionsText = {},
  formatDate,
  formatAmount,
  onReport,
  onRepay,
  repayingId,
}) => {
  const isPending = invoice.status === 3 || invoice.status === "3" || String(invoice.status).toLowerCase() === "pending"
  const isRepayingThis = repayingId === invoice.paymentId

  return (
    <FluentCard padding="!p-4" className="!bg-gray-50/30 hover:!bg-gray-50 transition-colors shadow-none !border-gray-100">
      {/* Top row: order code + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">
          #{invoice.orderCode}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.styles}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Info rows */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
        <div>
          <span className="text-gray-400 text-xs">{cols.date || "Date"}</span>
          <p className="text-gray-600 mt-0.5">{formatDate(invoice.createDate)}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">{cols.amount || "Amount"}</span>
          <p className="text-gray-800 font-medium mt-0.5">
            {formatAmount(invoice.amount)}
          </p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">{cols.method || "Method"}</span>
          <p className="text-gray-600 mt-0.5">{invoice.method}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5 pt-3 mt-1 border-t border-gray-100">
        {isPending && (
          <button
            type="button"
            onClick={() => onRepay && onRepay(invoice)}
            disabled={isRepayingThis}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-cath-red-700 hover:bg-cath-red-800 transition-colors disabled:opacity-50 shadow-sm active:scale-[0.98]"
          >
            {isRepayingThis ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span>{actionsText.repay || "Thanh toán lại"}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onReport && onReport(invoice)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 hover:text-cath-red-700 bg-gray-50 hover:bg-red-50/60 transition-colors border border-gray-200 shadow-sm active:scale-[0.98]"
          title={actionsText.report || "Báo lỗi"}
        >
          <AlertCircle className="w-4 h-4 text-gray-500" />
          <span>{actionsText.report || "Báo lỗi"}</span>
        </button>
      </div>
    </FluentCard>
  )
}

export default BillingMobileCard
