import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { Clock } from "lucide-react"
import payosLogo from "@/shared/assets/icons/logo/payos-logo.png"
import stripeLogo from "@/shared/assets/icons/logo/stripe-logo.png"
import { useLanguage } from "@/shared/context/LanguageContext"

const CheckoutModal = ({ open, onClose, plan, onConfirm, isProcessing }) => {
  const { t } = useLanguage()
  const [selectedMethod, setSelectedMethod] = useState("payos")

  if (!plan) return null

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)

  const handleConfirm = (e) => {
    e.preventDefault()
    onConfirm(plan)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t.billing.checkoutModal.title}
      className="max-w-md"
    >
      <form onSubmit={handleConfirm} className="pb-4">
        <div className="mb-6 bg-[#F8F8F8] p-4 rounded-xl border border-[#E5E5E5]">
          <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
          <p className="text-[#7A7574] text-sm mb-3">{t.billing.checkoutModal.subtitle.replace("{{planName}}", plan.name)}</p>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold text-cath-red-700">{formattedPrice}</span>
            <span className="text-[#7A7574] text-sm mb-1">/{plan.interval}</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block font-semibold mb-3">{t.billing.checkoutModal.paymentMethod}</label>
          
          <div className="space-y-3">
            {/* PayOS Method (Active) */}
            <button
              type="button"
              onClick={() => setSelectedMethod("payos")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                selectedMethod === "payos"
                  ? "border-cath-red-700 bg-[#FFF5F5]"
                  : "border-[#E5E5E5] bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ${selectedMethod === "payos" ? "bg-white" : "bg-gray-50 border border-gray-100"}`}>
                  <img src={payosLogo} alt="PayOS" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-semibold">PayOS</p>
                  <p className="text-xs text-[#7A7574]">{t.billing.checkoutModal.payosSub}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "payos" ? "border-cath-red-700" : "border-gray-300"
              }`}>
                {selectedMethod === "payos" && <div className="w-2.5 h-2.5 rounded-full bg-cath-red-700" />}
              </div>
            </button>

            {/* Stripe Method (Disabled) */}
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#E5E5E5] bg-[#FAFAFA] opacity-70 cursor-not-allowed text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                  <img src={stripeLogo} alt="Stripe" className="w-full h-full object-contain opacity-60 grayscale" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Stripe</p>
                  <p className="text-xs text-gray-400">{t.billing.checkoutModal.stripeSub}</p>
                </div>
              </div>
              <div className="absolute right-4 flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Clock size={10} />
                {t.billing.checkoutModal.comingSoon}
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <PillButton
            variant="secondary"
            className="flex-1"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
          >
            {t.billing.checkoutModal.cancel}
          </PillButton>
          <PillButton
            className="flex-1"
            type="submit"
            loading={isProcessing}
          >
            {t.billing.checkoutModal.confirm}
          </PillButton>
        </div>
      </form>
    </Modal>
  )
}

export default CheckoutModal
