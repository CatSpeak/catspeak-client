import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import RefundStatusBadge from "./RefundStatusBadge"

export default function RefundMobileCard({ refund, cols, formatDate, formatAmount, t }) {
  return (
    <FluentCard padding="p-4">
      {/* Top row: payment id + status badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-800">
          #{refund.paymentId || refund.refundId}
        </span>
        <RefundStatusBadge status={refund.status} t={t} />
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-3">
        <div>
          <span className="text-gray-400 text-xs">{cols.date || "Date"}</span>
          <p className="text-gray-600 mt-0.5">{formatDate(refund.createDate || refund.createdAt)}</p>
        </div>
        <div>
          <span className="text-gray-400 text-xs">{cols.amount || "Amount"}</span>
          <p className="text-gray-800 font-medium mt-0.5">
            {formatAmount(refund.amountVnd || refund.amount)}
          </p>
        </div>
        {(refund.bankBin || refund.accountNumber) && (
          <div className="col-span-2">
            <span className="text-gray-400 text-xs">{cols.bankInfo || "Bank Info"}</span>
            <p className="text-gray-700 mt-0.5 text-xs font-mono">
              BIN: {refund.bankBin} - STK: {refund.accountNumber} ({refund.accountHolderName})
            </p>
          </div>
        )}
      </div>

      {/* Reason / Message */}
      {(refund.message || refund.reason) && (
        <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 italic">
          "{refund.message || refund.reason}"
        </div>
      )}
    </FluentCard>
  )
}
