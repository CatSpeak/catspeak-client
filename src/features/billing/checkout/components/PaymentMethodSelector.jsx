import React from "react"
import { Clock } from "lucide-react"
import payosLogo from "@/shared/assets/icons/logo/payos-logo.svg"
import momoLogo from "@/shared/assets/icons/logo/momo-logo.svg"
import stripeLogo from "@/shared/assets/icons/logo/stripe-logo.svg"

const PaymentMethodSelector = ({ t, selectedMethod, onMethodChange }) => {
  const isPayosSelected = selectedMethod === "payos"

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {t.billing?.checkoutModal?.paymentMethod || "Phương thức thanh toán"}
      </h2>

      <div className="flex flex-col gap-4">
        {/* PayOS Method (Active) */}
        <button
          type="button"
          onClick={() => onMethodChange("payos")}
          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer ${isPayosSelected
            ? "border-[#BE0015] bg-[#FFF5F5]"
            : "border-gray-200 bg-white hover:border-gray-300"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-10 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white border border-gray-100`}>
              <img src={payosLogo} alt="PayOS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">PayOS</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{t.billing?.checkoutModal?.payosSub || "Chuyển khoản ngân hàng / QR Code"}</p>
            </div>
          </div>

          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isPayosSelected ? "border-[#BE0015]" : "border-gray-300"
              }`}
          >
            {isPayosSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#BE0015]" />
            )}
          </div>
        </button>

        {/* Stripe Method (Disabled) */}
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] opacity-75 cursor-not-allowed text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white border border-gray-100">
              <img src={momoLogo} alt="Momo" className="w-full h-full object-contain opacity-50 grayscale" />
            </div>
            <div>
              <p className="font-bold text-gray-400 text-sm leading-tight">MoMo</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{t.billing?.checkoutModal?.momoSub || "Thanh toán bằng ví điện tử MoMo"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border border-amber-100 leading-none">
            <Clock size={10} className="shrink-0 mt-[0.5px]" />
            <span className="leading-none">{t.billing?.checkoutModal?.comingSoon || "Sắp ra mắt"}</span>
          </div>
        </button>

        {/* Stripe Method (Disabled) */}
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] opacity-75 cursor-not-allowed text-left relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white border border-gray-100">
              <img src={stripeLogo} alt="Stripe" className="w-full h-full object-contain opacity-50 grayscale" />
            </div>
            <div>
              <p className="font-bold text-gray-400 text-sm leading-tight">Stripe</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{t.billing?.checkoutModal?.stripeSub || "Thẻ Tín Dụng / Thẻ Ghi Nợ"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border border-amber-100 leading-none">
            <Clock size={10} className="shrink-0 mt-[0.5px]" />
            <span className="leading-none">{t.billing?.checkoutModal?.comingSoon || "Sắp ra mắt"}</span>
          </div>
        </button>
      </div>
    </div>
  )
}

export default PaymentMethodSelector
