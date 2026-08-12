import React from "react";
import DataTable from "@/shared/components/ui/DataTable";
import Popover from "@/shared/components/ui/Popover";
import MenuItem from "@/shared/components/ui/MenuItem";
import MenuList from "@/shared/components/ui/MenuList";
import { IconButton } from "@/shared/components/ui/buttons";
import { useTimezone } from "@/shared/hooks/useTimezone";
import BillingMobileCard from "./BillingMobileCard";
import { RotateCcw, AlertCircle, Loader2, Undo2, MoreVertical } from "lucide-react";

const BillingTable = ({
  invoices,
  statusMap,
  onReport,
  onRepay,
  onRefund,
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
          label: hist.statuses?.unknown || "Unknown",
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
      headerClassName: "!py-2.5 !px-4 w-[10%] text-right",
      className: "!py-2.5 !px-4 w-[10%] whitespace-nowrap text-right",
      render: (row) => {
        const isPending =
          row.status === 3 ||
          row.status === "3" ||
          String(row.status).toLowerCase() === "pending";
        const isSuccess =
          row.status === 1 ||
          row.status === "1" ||
          String(row.status).toLowerCase() === "success";
        const isRepayingThis = repayingId === row.paymentId;

        return (
          <div className="flex items-center justify-end">
            <Popover
              placement="bottom-right"
              trigger={
                <IconButton size="xs" variant="ghost" title={actionsText.title || "Thao tác"}>
                  <MoreVertical />
                </IconButton>
              }
              content={(close) => (
                <MenuList className="!border-border shadow-lg min-w-[150px]">
                  {isPending && (
                    <MenuItem
                      label={actionsText.repay || "Thanh toán lại"}
                      icon={
                        isRepayingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin text-cath-red-700" />
                        ) : (
                          <RotateCcw className="w-4 h-4 text-cath-red-700" />
                        )
                      }
                      hoverBg="hover:bg-red-50"
                      className="font-semibold text-cath-red-700"
                      onClick={() => {
                        close();
                        onRepay && onRepay(row);
                      }}
                    />
                  )}

                  {isSuccess && (
                    <MenuItem
                      label={actionsText.refund || "Hoàn tiền"}
                      icon={<Undo2 className="w-4 h-4 text-amber-700" />}
                      hoverBg="hover:bg-amber-50"
                      className="font-medium text-amber-900"
                      onClick={() => {
                        close();
                        onRefund && onRefund(row);
                      }}
                    />
                  )}

                  <MenuItem
                    label={actionsText.report || "Báo lỗi"}
                    icon={<AlertCircle className="w-4 h-4 text-gray-500" />}
                    onClick={() => {
                      close();
                      onReport && onReport(row);
                    }}
                  />
                </MenuList>
              )}
            />
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
            onRefund={onRefund}
            repayingId={repayingId}
          />
        );
      }}
    />
  );
};

export default BillingTable;
