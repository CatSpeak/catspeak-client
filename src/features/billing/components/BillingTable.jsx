import React from "react"
import { FileText } from "lucide-react"
import FluentCard from "@/shared/components/ui/FluentCard"
import { formatDateTime12Hour } from "@/shared/utils/dateFormatter"
import BillingTableRow from "./BillingTableRow"
import BillingMobileCard from "./BillingMobileCard"

const BillingTable = ({
  invoices,
  statusMap,
  t,
}) => {
  const hist = t.billing?.history || {}
  const cols = hist.columns || {}

  // Empty state
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 flex-1">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-800 font-medium mb-1">
          {hist.noResults || "No results found"}
        </p>
        <p className="text-gray-400 text-sm">
          {hist.noResultsHint || "Try changing the filters or search keyword."}
        </p>
      </div>
    )
  }

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  return (
    <>
      {/* Desktop table — hidden on mobile */}
      <FluentCard padding="!p-0" className="overflow-hidden flex-1 hidden md:block !border-gray-200 !rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-50/50 text-cath-red-800 border-b border-red-100">
              <th className="py-4 px-6 font-semibold text-[13px]">
                {cols.date || "Date"}
              </th>
              <th className="py-4 px-6 font-semibold text-[13px]">
                {cols.orderCode || "Order Code"}
              </th>
              <th className="py-4 px-6 font-semibold text-[13px]">
                {cols.method || "Method"}
              </th>
              <th className="py-4 px-6 font-semibold text-[13px]">
                {cols.amount || "Amount"}
              </th>
              <th className="py-4 px-6 font-semibold text-[13px]">
                {cols.status || "Status"}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {invoices.map((invoice) => {
              const statusInfo = statusMap[invoice.status] || {
                label: "Unknown",
                styles: "bg-gray-100 text-gray-700",
              }

              return (
                <BillingTableRow
                  key={invoice.paymentId}
                  invoice={invoice}
                  statusInfo={statusInfo}
                  formatDate={formatDateTime12Hour}
                  formatAmount={formatAmount}
                />
              )
            })}
          </tbody>
        </table>
      </FluentCard>

      {/* Mobile card layout — visible only on mobile */}
      <div className="flex flex-col gap-3 flex-1 md:hidden">
        {invoices.map((invoice) => {
          const statusInfo = statusMap[invoice.status] || {
            label: "Unknown",
            styles: "bg-gray-100 text-gray-700",
          }

          return (
            <BillingMobileCard
              key={invoice.paymentId}
              invoice={invoice}
              statusInfo={statusInfo}
              cols={cols}
              formatDate={formatDateTime12Hour}
              formatAmount={formatAmount}
            />
          )
        })}
      </div>
    </>
  )
}

export default BillingTable
