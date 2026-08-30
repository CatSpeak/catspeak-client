import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import FluentCard from "@/shared/components/ui/FluentCard"
import Divider from "@/shared/components/ui/Divider"
import Banner from "@/shared/components/ui/Banner"
import { Checkbox } from "@/shared/components/ui/inputs"
import { PillButton, IconButton } from "@/shared/components/ui/buttons"
import { LoadingSpinner, Skeleton } from "@/shared/components/ui/indicators"
import { useLanguage } from "@/shared/context/LanguageContext"
import {
  useGetVoucherDepositInfoQuery,
  useSubmitVoucherDepositMutation,
} from "../../api/vouchersApi"
import { formatCurrency } from "../../utils/voucherTransforms"
import { DISCOUNT_TYPES } from "../../constants/voucherConstants"

const Step2TeacherDeposit = ({
  voucherId,
  form = {},
  estimatedDeposit = 0,
  onConfirmSuccess,
  onConfirmAndCreate,
  saveVoucher,
  isSubmitting = false,
  isSavingDraft = false,
}) => {
  const { t } = useLanguage()
  const [copiedField, setCopiedField] = useState(null)
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  // 1. Fetch official bank details & VietQR image URL from backend
  const { data: depositInfoData, isLoading: isLoadingDepositInfo } =
    useGetVoucherDepositInfoQuery(voucherId, {
      skip: !voucherId,
    })

  // 2. Mutation to submit deposit confirmation (PendingDeposit -> PendingApproval)
  const [submitDepositMutation, { isLoading: isSubmittingDeposit }] =
    useSubmitVoucherDepositMutation()

  const depositInfo = depositInfoData?.data || depositInfoData || {}

  // Deposit amount (prefer backend amount, fallback to live estimatedDeposit)
  const depositAmount =
    depositInfo.amount !== undefined && depositInfo.amount !== null
      ? Number(depositInfo.amount)
      : estimatedDeposit

  // Bank transfer content (prefer backend transactionContent, fallback to form code)
  const transactionContent = depositInfo.transactionContent || form.code || ""

  // Bank details with backend fallback defaults (ACB)
  const bankName = depositInfo.bankName || "ACB"
  const bankAccountName =
    depositInfo.bankAccountName || "NGUYEN PHAM DANG QUANG"
  const bankAccountNumber = depositInfo.bankAccountNumber || "30218037"

  // VietQR direct image URL (prefer backend direct URL)
  const vietQrUrl =
    depositInfo.vietQrUrl ||
    `https://img.vietqr.io/image/${bankName}-${bankAccountNumber}-compact2.jpg?amount=${depositAmount}&addInfo=${encodeURIComponent(
      transactionContent,
    )}&accountName=${encodeURIComponent(bankAccountName)}`

  const handleCopy = (text, fieldName) => {
    if (!text) return
    navigator.clipboard.writeText(String(text))
    setCopiedField(fieldName)
    const successMsg = t?.vouchers?.deposit?.copySuccess
      ? t.vouchers.deposit.copySuccess.replace("{{field}}", fieldName)
      : `Đã sao chép ${fieldName}!`
    toast.success(successMsg)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleConfirmDeposit = async () => {
    let targetVoucherId = voucherId
    setIsConfirming(true)

    try {
      // Save or create voucher with isDraft: false (creates directly in PendingApproval status)
      if (saveVoucher) {
        const savedId = await saveVoucher(false)
        if (savedId) {
          targetVoucherId = savedId
        } else {
          return
        }
      }

      if (!targetVoucherId && onConfirmAndCreate) {
        await onConfirmAndCreate()
        return
      }

      toast.success(
        t?.vouchers?.deposit?.submitSuccess ||
          "Xác nhận đặt cọc thành công! Admin sẽ duyệt kích hoạt voucher trong 24h.",
      )

      if (onConfirmSuccess) {
        onConfirmSuccess({
          code: form.code || transactionContent,
          depositAmount,
        })
      } else if (onConfirmAndCreate) {
        onConfirmAndCreate()
      }
    } catch (err) {
      console.error("[Step2TeacherDeposit] Submit deposit failed:", err)
      const rawMsg = err?.data?.message || err?.data?.data?.message
      const msg =
        rawMsg ||
        t?.vouchers?.deposit?.submitError ||
        "Có lỗi xảy ra khi xác nhận đặt cọc. Vui lòng thử lại."
      toast.error(msg)
    } finally {
      setIsConfirming(false)
    }
  }

  const isPercent = form.discountType === DISCOUNT_TYPES.PERCENTAGE
  const maxDiscountPerUsage = isPercent
    ? Number(form.maxDiscountAmount) || 0
    : Number(form.discountValue) || 0

  const isActionLoading = isConfirming || isSubmittingDeposit

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* LEFT COLUMN (8 cols): Thanh toán chuyển khoản (Bank Details & VietQR) */}
      <div className="lg:col-span-8 space-y-6">
        <FluentCard className="space-y-4">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="max-w-[240px] sm:max-w-[320px] w-full relative aspect-square flex items-center justify-center">
              {isLoadingDepositInfo ? (
                <Skeleton className="w-full aspect-square rounded-xl" />
              ) : (
                <img
                  src={vietQrUrl}
                  alt="VietQR CatSpeak"
                  className="w-full aspect-square object-contain rounded-2xl"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src =
                      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='1.5'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='M7 7h.01M7 17h.01M17 7h.01M17 17h.01M12 12h.01'/></svg>"
                  }}
                />
              )}
            </div>
            <span className="text-sm text-secondary text-center font-medium">
              {t?.vouchers?.deposit?.qrInstruction ||
                "Quét mã QR bằng ứng dụng ngân hàng để tự động điền số tiền và nội dung"}
            </span>
          </div>

          <Divider />

          {/* Bank Transfer Details */}
          <div>
            {/* Ngân hàng */}
            <div className="h-[72px] sm:h-[56px] flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <span className="text-sm sm:text-base text-secondary">
                  {t?.vouchers?.deposit?.bankName || "Ngân hàng"}
                </span>
                <span>{bankName}</span>
              </div>
            </div>

            {/* Chủ tài khoản */}
            <div className="h-[72px] sm:h-[56px] flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                <span className="text-sm sm:text-base text-secondary">
                  {t?.vouchers?.deposit?.accountName || "Chủ tài khoản"}
                </span>
                <span>{bankAccountName}</span>
              </div>
            </div>

            {/* Số tài khoản */}
            <div className="h-[72px] sm:h-[56px] flex items-center justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 min-w-0">
                <span className="text-sm sm:text-base text-secondary">
                  {t?.vouchers?.deposit?.accountNumber || "Số tài khoản"}
                </span>
                <span>{bankAccountNumber}</span>
              </div>

              <IconButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleCopy(
                    bankAccountNumber,
                    t?.vouchers?.deposit?.accountNumber || "Số tài khoản",
                  )
                }
                title="Sao chép"
              >
                {copiedField ===
                (t?.vouchers?.deposit?.accountNumber || "Số tài khoản") ? (
                  <Check className="text-emerald-600" />
                ) : (
                  <Copy className="text-secondary" />
                )}
              </IconButton>
            </div>

            {/* Số tiền cọc */}
            <div className="h-[72px] sm:h-[56px] flex items-center justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 min-w-0">
                <span className="text-sm sm:text-base text-secondary">
                  {t?.vouchers?.deposit?.depositAmount || "Số tiền cọc"}
                </span>
                <span>{formatCurrency(depositAmount)}</span>
              </div>

              <IconButton
                size="sm"
                variant="ghost"
                onClick={() =>
                  handleCopy(
                    depositAmount,
                    t?.vouchers?.deposit?.depositAmount || "Số tiền cọc",
                  )
                }
                title="Sao chép"
              >
                {copiedField ===
                (t?.vouchers?.deposit?.depositAmount || "Số tiền cọc") ? (
                  <Check className="text-emerald-600" />
                ) : (
                  <Copy className="text-secondary" />
                )}
              </IconButton>
            </div>

            {/* Highlighted Transaction Content */}
            <div className="p-4 sm:px-4 sm:py-0 sm:h-[56px] rounded-xl bg-rose-50 border border-rose-200 text-cath-red-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4">
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="text-sm sm:text-base text-cath-red-700/80 shrink-0">
                  {t?.vouchers?.deposit?.transactionContent ||
                    "Nội dung chuyển khoản"}
                </span>
                <span className="font-bold break-all sm:text-right">
                  {transactionContent}
                </span>
              </div>

              {/* Desktop Copy Button (>= sm) */}
              <IconButton
                size="sm"
                variant="ghost"
                className="hidden sm:inline-flex"
                onClick={() =>
                  handleCopy(
                    transactionContent,
                    t?.vouchers?.deposit?.transactionContent ||
                      "Nội dung chuyển khoản",
                  )
                }
                title="Sao chép"
              >
                {copiedField ===
                (t?.vouchers?.deposit?.transactionContent ||
                  "Nội dung chuyển khoản") ? (
                  <Check className="text-emerald-600" />
                ) : (
                  <Copy className="text-cath-red-700" />
                )}
              </IconButton>

              {/* Mobile Full-width Copy Button (< sm) */}
              <PillButton
                type="button"
                variant="secondary"
                onClick={() =>
                  handleCopy(
                    transactionContent,
                    t?.vouchers?.deposit?.transactionContent ||
                      "Nội dung chuyển khoản",
                  )
                }
                startIcon={<Copy className="w-4 h-4" />}
                className="w-full sm:hidden"
              >
                {t?.vouchers?.deposit?.copyContent ||
                  t?.vouchers?.modals?.copy ||
                  "Sao chép nội dung chuyển khoản"}
              </PillButton>
            </div>
          </div>
        </FluentCard>
      </div>

      {/* RIGHT COLUMN (4 cols): Tóm tắt Voucher & Tính toán cọc */}
      <div className="lg:col-span-4 space-y-6">
        {/* Card 1: Tóm tắt Voucher */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">
            {t?.vouchers?.deposit?.summaryTitle || "Tóm tắt Voucher"}
          </h4>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.code || "Mã voucher:"}
              </span>
              <span className="font-mono font-bold">
                {form.code || transactionContent}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.title || "Tên chương trình:"}
              </span>
              <span className="truncate max-w-[200px] text-right">
                {form.title}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.discountType || "Loại giảm giá:"}
              </span>
              <span>
                {isPercent
                  ? t?.vouchers?.deposit?.percent || "Phần trăm (%)"
                  : t?.vouchers?.deposit?.fixed || "Số tiền cố định (₫)"}
              </span>
            </div>

            <div className="flex justify-between text-cath-red-700">
              <span>{t?.vouchers?.deposit?.discountValue || "Mức giảm:"}</span>
              <span>
                {isPercent
                  ? `${form.discountValue}%`
                  : formatCurrency(form.discountValue)}
              </span>
            </div>

            {isPercent && form.maxDiscountAmount && (
              <div className="flex justify-between">
                <span className="text-secondary">
                  {t?.vouchers?.deposit?.maxDiscount || "Giảm tối đa:"}
                </span>
                <span>{formatCurrency(form.maxDiscountAmount)}</span>
              </div>
            )}

            {Number(form.maxBudget) > 0 && (
              <div className="flex justify-between">
                <span className="text-secondary">
                  {t?.vouchers?.deposit?.maxBudget || "Ngân sách tối đa:"}
                </span>
                <span>{formatCurrency(form.maxBudget)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.usageLimit || "Số lượt sử dụng:"}
              </span>
              <span>
                {form.totalUsageLimit || 1}{" "}
                {t?.vouchers?.deposit?.usagesUnit || "lượt"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.validity || "Thời hạn:"}
              </span>
              <span>
                {form.isNeverExpired
                  ? t?.vouchers?.deposit?.neverExpired || "Không giới hạn"
                  : `${form.validFrom || "..."} - ${form.validTo || "..."}`}
              </span>
            </div>
          </div>
        </FluentCard>

        {/* Card 2: Tính toán cọc & Xác nhận */}
        <FluentCard className="space-y-4">
          <h4 className="font-bold">
            {t?.vouchers?.deposit?.calculationTitle || "Tính toán cọc"}
          </h4>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.maxDiscountPerUsage ||
                  "Giá trị giảm tối đa/lượt:"}
              </span>
              <span>{formatCurrency(maxDiscountPerUsage)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-secondary">
                {t?.vouchers?.deposit?.totalUsages || "Tổng lượt:"}
              </span>
              <span>x {form.totalUsageLimit || 1}</span>
            </div>

            {Number(form.maxBudget) > 0 && (
              <div className="flex justify-between">
                <span className="text-secondary">
                  {t?.vouchers?.deposit?.budgetLimit || "Giới hạn ngân sách:"}
                </span>
                <span>{formatCurrency(form.maxBudget)}</span>
              </div>
            )}

            <Divider />

            <div className="flex justify-between items-baseline">
              <span className="font-bold">
                {t?.vouchers?.deposit?.depositRequired || "Cọc bắt buộc:"}
              </span>
              <span className="font-bold text-xl text-cath-red-700">
                {formatCurrency(depositAmount)}
              </span>
            </div>
          </div>

          {/* Terms checkbox */}
          <div
            onClick={() => setAgreedTerms(!agreedTerms)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <Checkbox
              checked={agreedTerms}
              onChange={() => setAgreedTerms(!agreedTerms)}
            />
            <span className="text-sm">
              {t?.vouchers?.deposit?.termsPrefix || "Tôi đồng ý với"}{" "}
              <strong className="text-cath-red-700 hover:underline">
                {t?.vouchers?.deposit?.termsLink ||
                  "Điều khoản cọc và hoàn tiền"}
              </strong>{" "}
              {t?.vouchers?.deposit?.termsSuffix || "của Cat Speak."}
            </span>
          </div>

          {/* Submit Action Button */}
          <PillButton
            type="button"
            variant="primary"
            disabled={!agreedTerms || isActionLoading || isSavingDraft || isSubmitting}
            loading={isActionLoading}
            loadingText={t?.vouchers?.deposit?.submitting || "Đang xử lý"}
            onClick={handleConfirmDeposit}
            className="w-full"
          >
            {t?.vouchers?.deposit?.confirmDeposit || "Xác nhận đặt cọc"}
          </PillButton>

          {/* Admin 24h approval note */}
          <Banner variant="neutral">
            {t?.vouchers?.deposit?.adminNotice ||
              "Sau khi xác nhận chuyển khoản, Admin sẽ duyệt trong 24h. Mã voucher sẽ kích hoạt ngay khi được duyệt."}
          </Banner>
        </FluentCard>
      </div>
    </div>
  )
}

export default Step2TeacherDeposit
