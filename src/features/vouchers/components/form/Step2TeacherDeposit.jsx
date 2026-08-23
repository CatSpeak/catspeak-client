import React, { useState, useEffect } from "react"
import { Copy, Check, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import Banner from "@/shared/components/ui/Banner"
import { TextInput, Checkbox } from "@/shared/components/ui/inputs"
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
      {/* LEFT COLUMN (7 cols): Thanh toán chuyển khoản, Thông tin người chuyển */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Thanh toán chuyển khoản (Unified QR + Bank Details) */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">Thanh toán chuyển khoản</h4>

          {/* QR Code & Timer Section */}
          <div className="flex flex-col items-center justify-center space-y-3 py-1">
            <div className="p-3 bg-white rounded-2xl border border-border shadow-sm max-w-[200px]">
              <img
                src={vietQrUrl}
                alt="QR Đặt cọc CatSpeak"
                className="w-full aspect-square object-contain rounded-xl"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 12h.01'/></svg>"
                }}
              />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2F2F2] border border-border text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-cath-red-700 animate-pulse" />
              <span>Thời gian còn lại: {formatTimer(timeLeft)}</span>
            </div>
          </div>

          <Divider />

          {/* Bank Transfer Details */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Ngân hàng:</span>
              <span>Vietcombank</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Chủ tài khoản:</span>
              <span>Cat Speak</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">0123456789</span>
                <button
                  type="button"
                  onClick={() => handleCopy("0123456789", "Số tài khoản")}
                  className="p-1 text-secondary hover:text-black cursor-pointer transition-colors"
                  title="Sao chép số tài khoản"
                >
                  {copiedField === "Số tài khoản" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-cath-red-700">
              <span className="font-medium">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{form.code}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(form.code, "Nội dung chuyển khoản")}
                  className="p-1 hover:text-black cursor-pointer transition-colors"
                  title="Sao chép nội dung"
                >
                  {copiedField === "Nội dung chuyển khoản" ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </FluentCard>

        {/* Card 2: Thông tin người chuyển */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">Thông tin người chuyển</h4>

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
      </div>

      {/* RIGHT COLUMN (5 cols): Tóm tắt Voucher & Tính toán cọc */}
      <div className="lg:col-span-5 space-y-6">
        {/* Card 1: Tóm tắt Voucher */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">Tóm tắt Voucher</h4>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mã voucher:</span>
              <span className="font-mono">{form.code}</span>
            </div>

            <div className="flex justify-between">
              <span>Tên chương trình:</span>
              <span className="truncate max-w-[200px] text-right">
                {form.title}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Loại giảm giá:</span>
              <span>{isPercent ? "Phần trăm" : "Số tiền cố định"}</span>
            </div>

            <div className="flex justify-between text-cath-red-700">
              <span>Mức giảm:</span>
              <span>
                {isPercent
                  ? `${form.discountValue}%`
                  : formatCurrency(form.discountValue)}
              </span>
            </div>

            {isPercent && (
              <div className="flex justify-between">
                <span>Giảm tối đa:</span>
                <span>{formatCurrency(form.maxDiscountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Số lượt sử dụng:</span>
              <span>{form.totalUsageLimit || 1} lượt</span>
            </div>

            <div className="flex justify-between">
              <span>Thời hạn:</span>
              <span>
                {form.isNeverExpired
                  ? "Không giới hạn"
                  : `${form.validFrom || "..."} - ${form.validTo || "..."}`}
              </span>
            </div>
          </div>
        </FluentCard>

        {/* Card 2: Tính toán cọc */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">Tính toán cọc</h4>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Giá trị giảm tối đa/lượt:</span>
              <span>{formatCurrency(maxDiscountPerUsage)}</span>
            </div>

            <div className="flex justify-between">
              <span>Tổng lượt:</span>
              <span>x {form.totalUsageLimit || 1}</span>
            </div>

            <Divider />

            <div className="flex justify-between items-baseline">
              <span className="font-bold">Cọc bắt buộc:</span>
              <span className="font-bold text-lg text-cath-red-700">
                {formatCurrency(estimatedDeposit)}
              </span>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="group flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              as="div"
              withWrapper
              checked={agreedTerms}
              onChange={() => setAgreedTerms(!agreedTerms)}
            />
            <span className="text-sm">
              Tôi đồng ý với{" "}
              <strong className="text-cath-red-700 hover:underline">
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
            className="w-full"
          >
            Xác nhận đặt cọc
          </PillButton>

          {/* Admin 24h approval note */}
          <Banner variant="neutral">
            Sau khi xác nhận chuyển khoản, Admin sẽ duyệt trong 24h. Mã voucher
            sẽ kích hoạt ngay khi được duyệt.
          </Banner>
        </FluentCard>
      </div>
    </div>
  )
}

export default Step2TeacherDeposit
