import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ban } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { PillButton } from "@/shared/components/ui/buttons"
import FluentCard from "@/shared/components/ui/FluentCard"
import TransferInfoModal from "./detail/TransferInfoModal"

const CannotEditVoucher = ({
  voucher,
  returnUrl,
  onBack,
}) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const isPending =
    voucher?.status === "PendingApproval" ||
    voucher?.status === "PendingDeposit" ||
    voucher?.status === 6 ||
    voucher?.status === 7

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate("/workspace/courses")
    }
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center py-12 px-4 my-auto animate-in fade-in zoom-in-95 duration-200">
      <FluentCard className="w-full max-w-md text-center flex flex-col items-center justify-center shadow-xs">
        {/* Status Icon */}
        <Ban className="w-12 h-12 mb-4 text-amber-500" />

        {/* Title */}
        <h2 className="font-bold text-xl text-primary tracking-tight mb-4">
          {voucher?.code ? `${voucher.code} — ` : ""}
          {t?.vouchers?.cannotEdit || "Không thể chỉnh sửa voucher"}
        </h2>

        {/* Explanation */}
        <div className="max-w-sm text-sm text-secondary">
          <p>
            {t?.vouchers?.editDraftOnly ||
              "Voucher này đã được gửi hoặc đang hoạt động nên không thể chỉnh sửa. Bạn chỉ có thể chỉnh sửa voucher ở trạng thái Bản nháp."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {isPending && (
            <PillButton
              type="button"
              variant="secondary"
              onClick={() => setIsTransferModalOpen(true)}
            >
              {t?.vouchers?.pendingConfirmation?.viewTransferInfo ||
                "Xem thông tin chuyển khoản"}
            </PillButton>
          )}

          <PillButton
            type="button"
            variant="primary"
            onClick={handleBack}
          >
            {t?.vouchers?.back || "Quay lại"}
          </PillButton>
        </div>
      </FluentCard>

      {isPending && (
        <TransferInfoModal
          open={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          voucher={voucher}
        />
      )}
    </div>
  )
}

export default CannotEditVoucher
