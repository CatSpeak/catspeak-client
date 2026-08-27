import React from "react"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PillButton } from "@/shared/components/ui/buttons"
import FluentCard from "@/shared/components/ui/FluentCard"
import { formatCurrency } from "../utils/voucherTransforms"

const PendingDepositConfirmation = ({
  code,
  depositAmount,
  onViewTransferInfo,
  onClose,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="flex-1 w-full flex items-center justify-center py-12 px-4 my-auto animate-in fade-in zoom-in-95 duration-200">
      <FluentCard className="w-full max-w-md text-center flex flex-col items-center justify-center">
        {/* Status Icon */}
        <Clock className="w-12 h-12 mb-4 text-amber-500" />

        {/* Title */}
        <h2 className="font-bold text-xl text-primary tracking-tight mb-4">
          {code} — {t?.vouchers?.status?.PendingApproval || "Chờ duyệt"}
        </h2>

        {/* Transfer & Waiting Info */}
        <div className="max-w-sm">
          <p>
            {t?.vouchers?.pendingConfirmation?.transferredPrefix ||
              "Bạn đã chuyển khoản"}{" "}
            <strong className="text-cath-red-700">
              {formatCurrency(depositAmount)}
            </strong>
            .
          </p>
          <p>
            {t?.vouchers?.pendingConfirmation?.waitingAdmin ||
              "Đang chờ Admin xác nhận (trong vòng 24h). Mã voucher sẽ kích hoạt ngay khi được duyệt."}
          </p>
        </div>

        {/* Action Buttons (no icons) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {onViewTransferInfo && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={onViewTransferInfo}
            >
              {t?.vouchers?.pendingConfirmation?.viewTransferInfo ||
                "Xem thông tin chuyển khoản"}
            </PillButton>
          )}

          <PillButton
            type="button"
            variant="primary"
            onClick={() => {
              if (onClose) {
                onClose()
              } else if (window.history.state && window.history.state.idx > 0) {
                navigate(-1)
              } else {
                navigate("/workspace/courses")
              }
            }}
          >
            {t?.vouchers?.pendingConfirmation?.backToList ||
              "Về danh sách voucher"}
          </PillButton>
        </div>
      </FluentCard>
    </div>
  )
}

export default PendingDepositConfirmation
