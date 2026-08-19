import React, { useState } from "react"
import {
  X,
  QrCode,
  Copy,
  Check,
  Landmark,
  Headphones,
  Info,
} from "lucide-react"
import { toast } from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import { formatCurrency } from "../../utils/voucherTransforms"

/**
 * TransferInfoModal - Modal hiển thị thông tin chuyển khoản cọc (BR-VC-GV-21)
 */
const TransferInfoModal = ({
  open = false,
  onClose,
  voucher = {},
}) => {
  const [copiedField, setCopiedField] = useState(null)

  const depositAmount = Number(
    voucher.depositRequired ?? voucher.depositAmount ?? 0
  )
  const voucherCode = voucher.code || ""

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${fieldName}!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  // VietQR QR URL
  const vietQrUrl = `https://api.vietqr.io/image/970436-0123456789-compact2.jpg?amount=${depositAmount}&addInfo=${encodeURIComponent(
    voucherCode
  )}&accountName=Cat%20Speak`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thông tin chuyển khoản đặt cọc"
      maxWidth="max-w-xl"
      bodyClassName="px-6 py-4 space-y-4"
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            Mã voucher <strong>{voucherCode}</strong> đang ở trạng thái{" "}
            <strong>Chờ nạp cọc</strong>. Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để Admin duyệt kích hoạt.
          </div>
        </div>

        {/* Bank details */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">NGÂN HÀNG</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              Vietcombank
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">CHỦ TÀI KHOẢN</span>
            <span className="font-bold text-slate-900 dark:text-zinc-100">
              Cat Speak
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">SỐ TÀI KHOẢN</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-sm">
                0123456789
              </span>
              <button
                type="button"
                onClick={() => handleCopy("0123456789", "Số tài khoản")}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                title="Sao chép số tài khoản"
              >
                {copiedField === "Số tài khoản" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 dark:border-zinc-700">
            <span className="text-slate-500 dark:text-zinc-400 font-medium">SỐ TIỀN CỌC</span>
            <span className="font-black text-cath-red-700 dark:text-cath-red-400 text-sm">
              {formatCurrency(depositAmount)}
            </span>
          </div>
        </div>

        {/* Nội dung CK Highlight */}
        <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-rose-800 dark:text-rose-300 block">
              NỘI DUNG CHUYỂN KHOẢN
            </span>
            <span className="text-base font-mono font-black text-rose-900 dark:text-rose-200">
              {voucherCode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(voucherCode, "Nội dung chuyển khoản")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 hover:bg-slate-50 text-rose-900 dark:text-rose-200 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-800 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            {copiedField === "Nội dung chuyển khoản" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-rose-700" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-zinc-800/60 rounded-2xl border border-slate-100 dark:border-zinc-700">
          <div className="p-2 bg-white rounded-xl border border-slate-200 max-w-[180px] shadow-xs">
            <img
              src={vietQrUrl}
              alt="QR Code"
              className="w-full aspect-square object-contain rounded-lg"
              onError={(e) => {
                e.target.onerror = null
                e.target.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 12h.01'/></svg>"
              }}
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 font-medium">
            Quét mã để tự động điền số tiền và nội dung
          </span>
        </div>

        {/* Support link */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => window.open("mailto:support@catspeak.edu.vn", "_blank")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-500" />
            <span>Cần trợ giúp? Liên hệ hỗ trợ</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TransferInfoModal
