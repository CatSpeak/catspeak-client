import React from "react"
import {
  Copy,
  Check,
  Eye,
  Users,
  Edit3,
  Calendar,
  Layers,
  Coins,
} from "lucide-react"
import { toast } from "react-hot-toast"
import VoucherStatusBadge from "./VoucherStatusBadge"
import {
  formatCurrency,
  formatDiscountBadgeText,
  formatScopeLabel,
  formatVoucherDate,
} from "../utils/voucherTransforms"
import { useLanguage } from "@/shared/context/LanguageContext"

const VoucherCard = ({
  voucher,
  onViewDetails,
  onEditDraft,
  onOpenTransfer,
  onOpenRejection,
  onOpenStop,
  onOpenCancel,
}) => {
  const { t } = useLanguage()
  const vt = t.vouchers || {}
  const [copied, setCopied] = React.useState(false)

  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    toast.success(vt.actions?.copied || "Đã sao chép mã voucher!")
    setTimeout(() => setCopied(false), 2000)
  }

  const used = voucher.usedCount || 0
  const limit = voucher.totalUsageLimit || 0
  const usagePercent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0
  const depositAmount = voucher.depositAmount ?? voucher.depositRequired ?? 0

  const status = voucher.status
  const isActive = status === "Active" || status === 2 || status === "HOẠT ĐỘNG"
  const isPendingDeposit =
    status === "PendingDeposit" ||
    status === "PendingApproval" ||
    status === 6 ||
    status === 7
  const isRejected = status === "Rejected" || status === 8
  const isDraft = status === "Draft" || status === 1

  return (
    <div
      onClick={() => onViewDetails(voucher)}
      className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-3"
    >
      {/* Header: Code & Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono font-bold text-xs text-slate-900 dark:text-zinc-100">
          <span>{voucher.code}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-700 p-0.5"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
        <VoucherStatusBadge status={voucher.status} />
      </div>

      {/* Title & Description */}
      <div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-1">
          {voucher.title}
        </h4>
        {voucher.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
            {voucher.description}
          </p>
        )}
      </div>

      {/* Discount & Scope Meta */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <div>
          <span className="text-[11px] text-slate-400 block">Mức giảm:</span>
          <span className="font-bold text-cath-red-700 dark:text-cath-red-400">
            {formatDiscountBadgeText(voucher)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Phạm vi:</span>
          <span className="font-medium text-slate-700 dark:text-zinc-300 line-clamp-1">
            {formatScopeLabel(voucher.scopeType)}
          </span>
        </div>
      </div>

      {/* Usage Progress & Deposit */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Lượt dùng:</span>
          <span className="font-semibold text-slate-700 dark:text-zinc-300">
            {used} / {limit > 0 ? limit : "∞"} ({usagePercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-cath-red-600 h-1.5 rounded-full"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-slate-400">Cọc yêu cầu:</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200">
            {formatCurrency(depositAmount)}
          </span>
        </div>
      </div>

      {/* Footer Actions according to status */}
      <div
        className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hoạt động */}
        {isActive && onOpenStop && (
          <button
            type="button"
            onClick={onOpenStop}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            Dừng sớm
          </button>
        )}

        {/* Chờ nạp cọc */}
        {isPendingDeposit && onOpenTransfer && (
          <button
            type="button"
            onClick={onOpenTransfer}
            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            Thông tin CK
          </button>
        )}
        {isPendingDeposit && onOpenCancel && (
          <button
            type="button"
            onClick={onOpenCancel}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            Hủy yêu cầu
          </button>
        )}

        {/* Bị từ chối */}
        {isRejected && onOpenRejection && (
          <button
            type="button"
            onClick={onOpenRejection}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            Lý do từ chối
          </button>
        )}

        {/* Bản nháp */}
        {isDraft && onEditDraft && (
          <button
            type="button"
            onClick={() => onEditDraft(voucher)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa nháp</span>
          </button>
        )}
        {isDraft && onOpenCancel && (
          <button
            type="button"
            onClick={onOpenCancel}
            className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            Xóa nháp
          </button>
        )}


        {/* Xem chi tiết */}
        {(!isPendingDeposit && !isRejected) && (
          <button
            type="button"
            onClick={() => onViewDetails(voucher)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Chi tiết</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default VoucherCard
