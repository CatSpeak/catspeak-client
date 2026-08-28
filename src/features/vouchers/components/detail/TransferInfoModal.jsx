import React, { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "react-hot-toast"
import Modal from "@/shared/components/ui/Modal"
import Divider from "@/shared/components/ui/Divider"
import { Skeleton } from "@/shared/components/ui/indicators"
import { IconButton } from "@/shared/components/ui/buttons"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGetVoucherDepositInfoQuery } from "../../api/vouchersApi"
import { formatCurrency } from "../../utils/voucherTransforms"

/**
 * TransferInfoModal - Modal hiển thị thông tin chuyển khoản cọc (BR-VC-GV-21)
 * Styled identically to Step2TeacherDeposit for UI consistency.
 */
const TransferInfoModal = ({ open = false, onClose, voucher = {} }) => {
  const { t } = useLanguage()
  const [copiedField, setCopiedField] = useState(null)

  // 1. Fetch deposit info from GET /api/vouchers/{id}/deposit-info
  const { data: depositInfoData, isLoading: isLoadingDepositInfo } =
    useGetVoucherDepositInfoQuery(voucher?.id, {
      skip: !open || !voucher?.id,
    })

  const depositInfo = depositInfoData?.data || depositInfoData || {}

  const depositAmount = Number(
    depositInfo.amount ?? voucher.depositRequired ?? voucher.depositAmount ?? 0,
  )

  const transactionContent =
    depositInfo.transactionContent || voucher.code || ""

  const bankName = depositInfo.bankName || "ACB"
  const bankAccountName =
    depositInfo.bankAccountName || "NGUYEN PHAM DANG QUANG"
  const bankAccountNumber = depositInfo.bankAccountNumber || "30218037"

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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        t?.vouchers?.modals?.transferInfoTitle ||
        "Thông tin chuyển khoản đặt cọc"
      }
      className="md:max-w-2xl lg:max-w-4xl"
      bodyClassName="px-4 sm:px-6 overflow-y-auto min-h-0 flex-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left Column: QR Code Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="max-w-[200px] sm:max-w-[220px] md:max-w-[240px] w-full relative aspect-square flex items-center justify-center">
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
          <span className="text-sm text-secondary text-center">
            {t?.vouchers?.deposit?.qrInstruction ||
              "Quét mã QR bằng ứng dụng ngân hàng để tự động điền số tiền và nội dung"}
          </span>
        </div>

        {/* Right Column: Bank Transfer Details (Always Stacked UI) */}
        <div>
          {/* Ngân hàng */}
          <div className="h-[72px] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-secondary">
                {t?.vouchers?.deposit?.bankName || "Ngân hàng"}
              </span>
              <span>{bankName}</span>
            </div>
          </div>

          {/* Chủ tài khoản */}
          <div className="h-[72px] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-secondary">
                {t?.vouchers?.deposit?.accountName || "Chủ tài khoản"}
              </span>
              <span>{bankAccountName}</span>
            </div>
          </div>

          {/* Số tài khoản */}
          <div className="h-[72px] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-secondary">
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
          <div className="h-[72px] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-secondary">
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
          <div className="px-4 h-[72px] rounded-xl bg-rose-50 border border-rose-200 text-cath-red-700 flex items-center justify-between gap-2 mt-4">
            <div className="min-w-0 flex-1">
              <span className="text-sm text-cath-red-700/80 block">
                {t?.vouchers?.deposit?.transactionContent ||
                  "Nội dung chuyển khoản"}
              </span>
              <span className="font-bold break-all">{transactionContent}</span>
            </div>

            <IconButton
              size="sm"
              variant="ghost"
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
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransferInfoModal
