import React from "react"
import { useNavigate } from "react-router-dom"
import { ClipboardList, Headphones, QrCode, ArrowLeft, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "../utils/voucherTransforms"

const PendingDepositConfirmation = ({
  code,
  depositAmount,
  onViewTransferInfo,
  onClose,
}) => {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-lg text-center animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      {/* Top Gold Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500"></div>

      {/* Circular Status Icon */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
        <ClipboardList className="w-8 h-8" />
      </div>

      {/* Status Title */}
      <h2 className="text-lg font-black text-slate-900 dark:text-zinc-100 flex items-center justify-center gap-2 tracking-tight">
        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
        <span>{code} — Đang chờ xác nhận cọc</span>
      </h2>

      {/* Description */}
      <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-zinc-400">
        <p>
          Bạn đã đăng ký đặt cọc <strong>{formatCurrency(depositAmount)}</strong>.
        </p>
        <p className="text-slate-500">
          Đang chờ Admin xác nhận khoản cọc (trong vòng <strong>24h</strong>).
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onViewTransferInfo && (
          <button
            type="button"
            onClick={onViewTransferInfo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-zinc-700 shadow-2xs transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            <span>Xem thông tin chuyển khoản</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            // Direct to support chat or modal
            window.open("mailto:support@catspeak.edu.vn", "_blank")
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-cath-red-700 dark:text-cath-red-400 hover:bg-cath-red-50 dark:hover:bg-cath-red-950/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          <Headphones className="w-4 h-4" />
          <span>Liên hệ hỗ trợ</span>
        </button>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => (onClose ? onClose() : navigate(-1))}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </button>
      </div>
    </div>
  )
}

export default PendingDepositConfirmation
