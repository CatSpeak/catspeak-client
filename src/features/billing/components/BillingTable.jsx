import React from "react";
import DataTable from "@/shared/components/ui/DataTable";
import { useTimezone } from "@/shared/hooks/useTimezone";
import BillingMobileCard from "./BillingMobileCard";
import { RotateCcw, AlertCircle, Loader2 } from "lucide-react";

const BillingTable = ({
  invoices,
  statusMap,
  onReport,
  onRepay,
  repayingId,
  t,
}) => {
  const { formatDateTime } = useTimezone();
  const hist = t.billing?.history || {};
  const cols = hist.columns || {};
  const actionsText = hist.actions || {};

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const columns = [
    {
      key: "createDate",
      label: cols.date || "Date",
      headerClassName: "w-[22%]",
      className: "w-[22%]",
      render: (row) => formatDateTime(row.createDate),
    },
    {
      key: "orderCode",
      label: cols.orderCode || "Order Code",
      headerClassName: "!py-2.5 !px-4 w-[16%]",
      className: "!py-2.5 !px-4 w-[16%] font-medium text-gray-800",
      render: (row) => `#${row.orderCode}`,
    },
    {
      key: "method",
      label: cols.method || "Method",
      headerClassName: "!py-2.5 !px-4 w-[15%]",
      className: "!py-2.5 !px-4 w-[15%]",
    },
    {
      key: "amount",
      label: cols.amount || "Amount",
      headerClassName: "!py-2.5 !px-4 w-[17%]",
      className: "!py-2.5 !px-4 w-[17%] font-medium text-gray-800",
      render: (row) => formatAmount(row.amount),
    },
    {
      key: "status",
      label: cols.status || "Status",
      headerClassName: "!py-2.5 !px-4 w-[15%]",
      className: "!py-2.5 !px-4 w-[15%]",
      render: (row) => {
        const statusInfo = statusMap[row.status] || {
          label: "Unknown",
          styles: "bg-gray-100 text-gray-700",
        };
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.styles}`}
          >
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: cols.actions || "Actions",
      headerClassName: "!py-2.5 !px-4 w-[15%]",
      className: "!py-2.5 !px-4 w-[15%] whitespace-nowrap",
      render: (row) => {
        const isPending =
          row.status === 3 ||
          row.status === "3" ||
          String(row.status).toLowerCase() === "pending";
        const isRepayingThis = repayingId === row.paymentId;

        return (
          <div className="flex items-center justify-end gap-2">
            {isPending && (
              <button
                type="button"
                onClick={() => onRepay && onRepay(row)}
                disabled={isRepayingThis}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cath-red-700 hover:bg-cath-red-800 transition-colors disabled:opacity-50"
              >
                {isRepayingThis ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>{actionsText.repay || "Thanh toán lại"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onReport && onReport(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-cath-red-700 hover:bg-red-50/60 transition-colors border border-gray-200"
              title={actionsText.report || "Báo lỗi"}
            >
              <AlertCircle className="w-3.5 h-3.5 text-gray-500" />
              <span>{actionsText.report || "Báo lỗi"}</span>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      rowKey={(row) => row.paymentId || row.orderCode}
      emptyTitle={hist.noResults || "No results found"}
      emptyDescription={
        hist.noResultsHint || "Try changing the filters or search keyword."
      }
      striped={true}
      renderMobileCard={(invoice) => {
        const statusInfo = statusMap[invoice.status] || {
          label: "Unknown",
          styles: "bg-gray-100 text-gray-700",
        };
        return (
          <BillingMobileCard
            invoice={invoice}
            statusInfo={statusInfo}
            cols={cols}
            actionsText={actionsText}
            formatDate={formatDateTime}
            formatAmount={formatAmount}
            onReport={onReport}
            onRepay={onRepay}
            repayingId={repayingId}
          />
        );
      }}
    />
  );
};

export default BillingTable;
