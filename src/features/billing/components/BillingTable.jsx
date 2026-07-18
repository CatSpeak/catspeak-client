import React from "react"
import DataTable from "@/shared/components/ui/DataTable"
import { formatDateTime12Hour } from "@/shared/utils/dateFormatter"
import BillingMobileCard from "./BillingMobileCard"

const BillingTable = ({
  invoices,
  statusMap,
  t,
}) => {
  const hist = t.billing?.history || {}
  const cols = hist.columns || {}

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)

  const columns = [
    {
      key: "createDate",
      label: cols.date || "Date",
      render: (row) => formatDateTime12Hour(row.createDate),
    },
    {
      key: "orderCode",
      label: cols.orderCode || "Order Code",
      className: "font-medium text-gray-800",
      render: (row) => `#${row.orderCode}`,
    },
    {
      key: "method",
      label: cols.method || "Method",
    },
    {
      key: "amount",
      label: cols.amount || "Amount",
      className: "font-medium text-gray-800",
      render: (row) => formatAmount(row.amount),
    },
    {
      key: "status",
      label: cols.status || "Status",
      render: (row) => {
        const statusInfo = statusMap[row.status] || {
          label: "Unknown",
          styles: "bg-gray-100 text-gray-700",
        }
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.styles}`}
          >
            {statusInfo.label}
          </span>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={invoices}
      rowKey={(row) => row.paymentId}
      emptyTitle={hist.noResults || "No results found"}
      emptyDescription={hist.noResultsHint || "Try changing the filters or search keyword."}
      renderMobileCard={(invoice) => {
        const statusInfo = statusMap[invoice.status] || {
          label: "Unknown",
          styles: "bg-gray-100 text-gray-700",
        }
        return (
          <BillingMobileCard
            invoice={invoice}
            statusInfo={statusInfo}
            cols={cols}
            formatDate={formatDateTime12Hour}
            formatAmount={formatAmount}
          />
        )
      }}
    />
  )
}

export default BillingTable
