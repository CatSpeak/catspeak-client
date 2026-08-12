import React from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"
import { ShieldCheck } from "lucide-react"

export default function RefundEligibleModal({
  isOpen,
  onClose,
  onContinue,
  eligibility,
  orderCode,
}) {
  const { t } = useLanguage()
  const refundT = t.refunds || {}

  const formatAmount = (val) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0)

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={
        (refundT.requestRefundTitle || "Yêu cầu hoàn tiền") +
        (orderCode ? ` #${orderCode}` : "")
      }
      showCloseButton={true}
      bodyClassName="px-6 pt-1 pb-5 flex-1 overflow-y-auto !mb-0"
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Shield Icon, API Reason & Hero Amount */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/80 mb-3">
            <ShieldCheck size={26} />
          </div>

          {eligibility?.reason && (
            <p className="text-xs text-gray-600 max-w-xs mx-auto mb-3 leading-relaxed">
              {eligibility.reason}
            </p>
          )}

          {eligibility?.maxRefundAmount !== undefined && (
            <>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-0.5">
                {refundT.maxRefundAmount || "Số tiền hoàn tối đa"}
              </p>
              <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {formatAmount(eligibility.maxRefundAmount)}
              </p>
            </>
          )}
        </div>

        {/* Transaction Details (strictly from API data) */}
        {(orderCode || eligibility?.paymentType) && (
          <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-4 space-y-2.5 text-xs text-gray-600">
            {orderCode && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Mã đơn hàng</span>
                <span className="font-mono font-medium text-gray-800">
                  #{orderCode}
                </span>
              </div>
            )}
            {eligibility?.paymentType && (
              <div
                className={`flex justify-between items-center ${
                  orderCode ? "pt-2 border-t border-gray-200/60" : ""
                }`}
              >
                <span className="text-gray-500">
                  {refundT.paymentType || "Loại giao dịch"}
                </span>
                <span className="font-semibold text-gray-800">
                  {eligibility.paymentType}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-1 flex gap-3">
          <PillButton
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            {refundT.btnCancel || "Hủy"}
          </PillButton>
          <PillButton className="flex-1" onClick={onContinue}>
            {refundT.btnSubmitRequest || "Tiếp tục nhập thông tin"}
          </PillButton>
        </div>
      </div>
    </Modal>
  )
}
