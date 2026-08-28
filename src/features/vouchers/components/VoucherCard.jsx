import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import VoucherStatusBadge from "./VoucherStatusBadge"
import Divider from "@/shared/components/ui/Divider"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import { formatDiscountBadgeText } from "../utils/voucherTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"

const VoucherCard = ({
  voucher = {},
  onViewDetails,
  onEditDraft,
  onOpenTransfer,
  onOpenRejection,
  onOpenStop,
}) => {
  const { t } = useLanguage()
  const vt = t.vouchers || {}
  const { formatDate } = useTimezone()
  const [copied, setCopied] = useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    if (!voucher.code) return
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    toast.success(vt.actions?.copied || "Đã sao chép mã voucher!")
    setTimeout(() => setCopied(false), 2000)
  }

  const used = voucher.usedCount || 0
  const limit = voucher.totalUsageLimit || 0

  const status = voucher.status
  const isActive = status === "Active" || status === 2 || status === "HOẠT ĐỘNG"
  const isPendingDeposit =
    status === "PendingDeposit" ||
    status === "PendingApproval" ||
    status === 6 ||
    status === 7
  const isRejected = status === "Rejected" || status === 8
  const isDraft = status === "Draft" || status === 1

  // Format validity matching VoucherTable
  const renderValidity = () => {
    if (voucher.isNeverExpired) {
      return vt.table?.neverExpired || "Không giới hạn"
    }
    const from = voucher.validFrom ? formatDate(voucher.validFrom) : null
    const to = voucher.validTo ? formatDate(voucher.validTo) : null

    if (from && to) {
      return `${from} - ${to}`
    }
    if (from) {
      return `${vt.table?.from || "Từ"} ${from}`
    }
    if (to) {
      return `${vt.table?.to || "Đến"} ${to}`
    }
    return "-"
  }

  const hasActions =
    (isActive && onOpenStop) ||
    (isPendingDeposit && onOpenTransfer) ||
    (isRejected && onOpenRejection) ||
    (isDraft && onEditDraft)

  return (
    <div
      onClick={() => onViewDetails?.(voucher)}
      className="rounded-xl bg-white border border-border cursor-pointer"
    >
      {/* Header: Code & Status Badge */}
      <div className="h-[56px] px-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">{voucher.code || "-"}</span>
          <IconButton
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            title={vt.actions?.copy || "Sao chép"}
          >
            {copied ? <Check className="text-emerald-600" /> : <Copy />}
          </IconButton>
        </div>

        <VoucherStatusBadge status={voucher.status} />
      </div>

      {/* Stacked Key-Value List matching Table columns */}
      <div className="px-4 flex flex-col gap-1">
        {/* Tên voucher */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vt.table?.title || "Tên voucher"}
          </span>
          <span className="text-right truncate">{voucher.title}</span>
        </div>

        {/* Mức giảm */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vt.table?.discount || "Mức giảm"}
          </span>
          <span className="text-cath-red-700 text-right truncate">
            {formatDiscountBadgeText(voucher)}
          </span>
        </div>

        {/* Hiệu lực */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vt.table?.validity || "Hiệu lực"}
          </span>
          <span className="text-right truncate">{renderValidity()}</span>
        </div>

        {/* Đã dùng */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-secondary shrink-0">
            {vt.table?.usage || "Đã dùng"}
          </span>
          <span className="text-right truncate">
            {used} / {limit > 0 ? limit : "∞"}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      {hasActions && (
        <div
          className="p-4 flex items-center justify-end gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Active: Dừng sớm */}
          {isActive && onOpenStop && (
            <PillButton
              type="button"
              variant="secondary"
              textColor="#dc2626"
              onClick={(e) => {
                e.stopPropagation()
                onOpenStop(voucher)
              }}
            >
              {vt.actions?.stopEarly || "Dừng sớm"}
            </PillButton>
          )}

          {/* Chờ nạp cọc: Xem thông tin chuyển khoản */}
          {isPendingDeposit && onOpenTransfer && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onOpenTransfer(voucher)
              }}
            >
              {vt.actions?.viewTransferInfo || "Thông tin CK"}
            </PillButton>
          )}

          {/* Bị từ chối: Xem lý do từ chối */}
          {isRejected && onOpenRejection && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onOpenRejection(voucher)
              }}
            >
              {vt.actions?.viewRejectionReason || "Lý do từ chối"}
            </PillButton>
          )}

          {/* Bản nháp: Chỉnh sửa */}
          {isDraft && onEditDraft && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                onEditDraft(voucher)
              }}
            >
              {vt.actions?.edit || "Chỉnh sửa"}
            </PillButton>
          )}
        </div>
      )}
    </div>
  )
}

export default VoucherCard
