import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"

const BillingMobileCard = ({
  invoice,
  statusInfo,
  cols,
  formatDate,
  formatAmount,
}) => {
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
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
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
    </FluentCard>
  )
}

export default BillingMobileCard
