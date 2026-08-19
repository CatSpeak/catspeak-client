import React, { useState, useEffect } from "react"
import {
  Copy,
  Check,
  Clock,
  Info,
  ShieldCheck,
  Landmark,
} from "lucide-react"
import { toast } from "react-hot-toast"
import FluentCard from "@/shared/components/ui/FluentCard"
import { TextInput } from "@/shared/components/ui/inputs"
import { PillButton } from "@/shared/components/ui/buttons"
import { formatCurrency } from "../../utils/voucherTransforms"
import { DISCOUNT_TYPES } from "../../constants/voucherConstants"

const Step2TeacherDeposit = ({
  form,
  estimatedDeposit,
  isSubmitting,
  onConfirmAndCreate,
  userProfile = {},
}) => {
  const [copiedField, setCopiedField] = useState(null)
  const [agreedTerms, setAgreedTerms] = useState(false)

  // Payer info state (prefilled from teacher profile)
  const [payerInfo, setPayerInfo] = useState({
    fullName: userProfile?.fullName || userProfile?.name || "Nguyễn Văn A",
    phone: userProfile?.phoneNumber || userProfile?.phone || "0901234567",
    email: userProfile?.email || "nguyenvana@example.com",
  })

  // 15-minute countdown timer (BR-VC-GV-13)
  const [timeLeft, setTimeLeft] = useState(15 * 60)

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`Đã sao chép ${fieldName}!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE
  const maxDiscountPerUsage = isPercent
    ? Number(form.maxDiscountAmount) || 0
    : Number(form.discountValue) || 0

  // Standard VietQR URL format
  const vietQrUrl = `https://api.vietqr.io/image/970436-0123456789-compact2.jpg?amount=${estimatedDeposit}&addInfo=${encodeURIComponent(
    form.code,
  )}&accountName=Cat%20Speak`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* LEFT COLUMN (7 cols): Thông tin chuyển khoản, Thông tin người chuyển, Quét mã QR */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Thông tin chuyển khoản */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">
            Thông tin chuyển khoản
          </h4>

          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-3">
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
          </div>

          {/* Highlighted Nội dung CK box */}
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-rose-800 dark:text-rose-300 block">
                NỘI DUNG CK
              </span>
              <span className="text-base font-mono font-black text-rose-900 dark:text-rose-200">
                {form.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(form.code, "Nội dung chuyển khoản")}
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
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </FluentCard>

        {/* Card 2: Thông tin người chuyển */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">
            Thông tin người chuyển
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Họ và tên"
              value={payerInfo.fullName}
              onChange={(e) =>
                setPayerInfo((p) => ({ ...p, fullName: e.target.value }))
              }
            />

            <TextInput
              label="Số điện thoại"
              value={payerInfo.phone}
              onChange={(e) =>
                setPayerInfo((p) => ({ ...p, phone: e.target.value }))
              }
            />
          </div>

          <TextInput
            type="email"
            label="Email"
            value={payerInfo.email}
            onChange={(e) =>
              setPayerInfo((p) => ({ ...p, email: e.target.value }))
            }
          />
        </FluentCard>

        {/* Card 3: Quét mã QR để thanh toán */}
        <FluentCard className="flex flex-col items-center justify-center space-y-4">
          <h4 className="font-bold">
            Quét mã QR để thanh toán
          </h4>

          {/* QR Image Box */}
          <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 dark:border-zinc-800 shadow-sm max-w-[220px]">
            <img
              src={vietQrUrl}
              alt="QR Đặt cọc CatSpeak"
              className="w-full aspect-square object-contain rounded-xl"
              onError={(e) => {
                // Fallback if network blocks external QR API
                e.target.onerror = null
                e.target.src =
                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 12h.01'/></svg>"
              }}
            />
          </div>

          {/* Countdown Timer Box */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900 text-xs font-bold text-rose-700 dark:text-rose-300">
            <Clock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
            <span>Thời gian còn lại: {formatTimer(timeLeft)}</span>
          </div>
        </FluentCard>
      </div>

      {/* RIGHT COLUMN (5 cols): Tóm tắt Voucher & Tính toán cọc */}
      <div className="lg:col-span-5 space-y-6">
        {/* Card 1: Tóm tắt Voucher */}
        <FluentCard className="space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h4 className="font-bold">
              Tóm tắt Voucher
            </h4>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
              Mã: {form.code}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Tên chương trình</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 text-right truncate max-w-[180px]">
                {form.title}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Loại giảm giá</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {isPercent ? "Phần trăm" : "Số tiền cố định"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Mức giảm</span>
              <span className="font-bold text-cath-red-700 dark:text-cath-red-400">
                {isPercent ? `${form.discountValue}%` : formatCurrency(form.discountValue)}
              </span>
            </div>

            {isPercent && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Giảm tối đa</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">
                  {formatCurrency(form.maxDiscountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Số lượt sử dụng</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {form.totalUsageLimit || 1} lượt
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-zinc-400">Thời hạn</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {form.isNeverExpired
                  ? "Không giới hạn"
                  : `${form.validFrom || "..."} - ${form.validTo || "..."}`}
              </span>
            </div>
          </div>
        </FluentCard>

        {/* Card 2: Tính toán cọc */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">
            Tính toán cọc
          </h4>

          {/* Breakdown box */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Giá trị giảm tối đa/lượt:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {formatCurrency(maxDiscountPerUsage)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Tổng lượt:</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                x {form.totalUsageLimit || 1}
              </span>
            </div>

            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/60 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 dark:text-zinc-100">
                Cọc bắt buộc:
              </span>
              <span className="text-xl font-black text-cath-red-700 dark:text-cath-red-400">
                {formatCurrency(estimatedDeposit)}
              </span>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-cath-red-700 focus:ring-cath-red-500 cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-snug">
              Tôi đồng ý với{" "}
              <strong className="text-cath-red-700 dark:text-cath-red-400 hover:underline">
                Điều khoản cọc và hoàn tiền
              </strong>{" "}
              của Cat Speak.
            </span>
          </label>

          {/* Submit Action Button */}
          <PillButton
            type="button"
            variant="primary"
            disabled={!agreedTerms || isSubmitting}
            loading={isSubmitting}
            loadingText="Đang xử lý..."
            onClick={onConfirmAndCreate}
            startIcon={<ShieldCheck className="w-4 h-4" />}
            className="w-full"
          >
            Xác nhận & Tạo Voucher
          </PillButton>

          {/* Admin 24h approval note */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-300">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Sau khi xác nhận chuyển khoản, Admin sẽ duyệt trong 24h. Mã voucher sẽ kích hoạt ngay khi được duyệt.
            </span>
          </div>
        </FluentCard>
      </div>
    </div>
  )
}

export default Step2TeacherDeposit
