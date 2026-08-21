import React from "react"
import DataTable from "@/shared/components/ui/DataTable"
import { useTimezone } from "@/shared/hooks/useTimezone"
import RefundStatusBadge from "./RefundStatusBadge"
import RefundMobileCard from "./RefundMobileCard"

export default function RefundHistoryTable({ refunds = [], t }) {
  const { formatDateTime } = useTimezone()
  const refundT = t.refunds || {}
  const cols = refundT.columns || {}

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0)

  const columns = [
    {
      key: "createDate",
      label: cols.date || "Date",
      headerClassName: "w-[22%]",
      className: "w-[22%]",
      render: (row) => formatDateTime(row.createDate || row.createdAt),
    },
    {
      key: "paymentId",
      label: cols.paymentId || "Payment ID",
      headerClassName: "!py-2.5 !px-4 w-[16%]",
      className: "!py-2.5 !px-4 w-[16%] font-medium text-gray-800",
      render: (row) => `#${row.paymentId || row.refundId}`,
    },
    {
      key: "amountVnd",
      label: cols.amount || "Amount",
      headerClassName: "!py-2.5 !px-4 w-[18%]",
      className: "!py-2.5 !px-4 w-[18%] font-medium text-gray-800",
      render: (row) => formatAmount(row.amountVnd || row.amount),
    },
    {
      key: "status",
      label: cols.status || "Status",
      headerClassName: "!py-2.5 !px-4 w-[16%]",
      className: "!py-2.5 !px-4 w-[16%]",
      render: (row) => <RefundStatusBadge status={row.status} t={t} />,
    },
    {
      key: "reason",
      label: cols.reason || "Reason",
      headerClassName: "!py-2.5 !px-4 w-[28%]",
      className: "!py-2.5 !px-4 w-[28%] text-xs text-gray-600 truncate max-w-[280px]",
      render: (row) => row.message || row.reason || "—",
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={refunds}
      rowKey={(row) => row.refundId || row.id || row.paymentId}
      emptyTitle={refundT.noHistoryTitle || "Chưa có yêu cầu hoàn tiền nào"}
      emptyDescription={
        refundT.noHistorySubtitle ||
        "Khi bạn gửi yêu cầu hoàn tiền cho đơn hàng, các thông tin sẽ xuất hiện ở đây."
      }
      striped={true}
      renderMobileCard={(refund) => (
        <RefundMobileCard
          refund={refund}
          cols={cols}
          formatDate={formatDateTime}
          formatAmount={formatAmount}
          t={t}
        />
      )}
    />
  )
}
