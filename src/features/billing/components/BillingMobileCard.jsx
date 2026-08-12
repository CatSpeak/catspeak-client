import React from "react"
import FluentCard from "@/shared/components/ui/FluentCard"
import Popover from "@/shared/components/ui/Popover"
import MenuItem from "@/shared/components/ui/MenuItem"
import MenuList from "@/shared/components/ui/MenuList"
import { IconButton } from "@/shared/components/ui/buttons"
import { RotateCcw, AlertCircle, Loader2, Undo2, MoreVertical } from "lucide-react"

const BillingMobileCard = ({
  invoice,
  statusInfo,
  cols,
  actionsText = {},
  formatDate,
  formatAmount,
  onReport,
  onRepay,
  onRefund,
  repayingId,
}) => {
  const isPending = invoice.status === 3 || invoice.status === "3" || String(invoice.status).toLowerCase() === "pending"
  const isSuccess = invoice.status === 1 || invoice.status === "1" || String(invoice.status).toLowerCase() === "success"
  const isRepayingThis = repayingId === invoice.paymentId

  return (
    <FluentCard padding="p-4">
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
      <div className="flex items-center justify-end pt-3 mt-1 border-t border-border">
        <Popover
          placement="bottom-right"
          trigger={
            <IconButton size="xs" variant="ghost" title={actionsText.title || "Tùy chọn"}>
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
                    close()
                    onRepay && onRepay(invoice)
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
                    close()
                    onRefund && onRefund(invoice)
                  }}
                />
              )}

              <MenuItem
                label={actionsText.report || "Báo lỗi"}
                icon={<AlertCircle className="w-4 h-4 text-gray-500" />}
                onClick={() => {
                  close()
                  onReport && onReport(invoice)
                }}
              />
            </MenuList>
          )}
        />
      </div>
    </FluentCard>
  )
}

export default BillingMobileCard
