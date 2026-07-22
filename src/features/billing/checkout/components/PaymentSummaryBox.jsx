import React, { useState } from "react"
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"

const getLocalizedInterval = (interval, lang) => {
  const isMonthly = String(interval || "").toLowerCase().includes("month")
  if (lang === "vi") {
    return isMonthly ? "1 tháng" : "1 năm"
  } else if (lang === "zh") {
    return isMonthly ? "1 个月" : "1 年"
  } else {
    return isMonthly ? "1 month" : "1 year"
  }
}

const hexToRgbA = (hex, alpha = 0.15) => {
  if (!hex || typeof hex !== 'string') return `rgba(255, 255, 255, ${alpha})`;
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  if (c.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const PaymentSummaryBox = ({
  t,
  language,
  plan,
  isProcessing,
  onSubmit,
}) => {
  const [agreed, setAgreed] = useState(false)

  const cardColor = plan.brandColor || "#7C3AED"
  const formattedPrice = `${new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US").format(plan.price)}₫`

  const formattedTotal = `${new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US").format(plan.price)}₫` // VAT 0% makes total equal to price

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm sticky top-24 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        {t.billing?.checkout?.paymentDetails || "Thông tin thanh toán"}
      </h2>

      {/* Package Banner */}
      <div 
        className="rounded-2xl p-4 flex items-center justify-between font-nunito"
        style={{
          backgroundColor: hexToRgbA(cardColor, 0.1),
          color: cardColor,
        }}
      >
        <span className="font-bold text-sm md:text-base">{plan.name}</span>
        <span className="text-xs md:text-sm font-semibold bg-white/60 px-2.5 py-1 rounded-lg">
          {getLocalizedInterval(plan.interval, language)}
        </span>
      </div>

      {/* Price Calculation Table */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-500">
          <span>{t.billing?.checkout?.price || "Giá"}</span>
          <span className="text-gray-900">{formattedPrice}</span>
        </div>

        <div className="flex justify-between items-center text-sm font-medium text-gray-500">
          <span>{t.billing?.checkout?.vat || "VAT (0%)"}</span>
          <span className="text-gray-900">0₫</span>
        </div>

        <hr className="border-gray-100 my-2" />

        <div className="flex justify-between items-baseline">
          <span className="text-sm font-bold text-gray-900">{t.billing?.checkout?.total || "Tổng thanh toán"}</span>
          <span className="text-xl font-extrabold text-[#BE0015]">{formattedTotal}</span>
        </div>
      </div>

      {/* Terms & Privacy Agreement */}
      <div className="flex items-start gap-2.5 pt-4">
        <input
          type="checkbox"
          id="agree-checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-[#BE0015] focus:ring-[#BE0015] shrink-0 mt-[1px] cursor-pointer"
        />
        <label htmlFor="agree-checkbox" className="text-xs text-gray-500 leading-normal select-none cursor-pointer">
          {language === "vi" ? (
            <>
              Tôi đồng ý với{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.termsOfService || "Điều khoản dịch vụ"}
              </a>{" "}
              và{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.privacyPolicy || "Chính sách bảo mật"}
              </a>
            </>
          ) : language === "zh" ? (
            <>
              我同意{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.termsOfService || "服务条款"}
              </a>{" "}
              和{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.privacyPolicy || "隐私政策"}
              </a>
            </>
          ) : (
            <>
              I agree to the{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.termsOfService || "Terms of Service"}
              </a>{" "}
              and{" "}
              <a href="/policy" target="_blank" rel="noreferrer" className="text-[#BE0015] font-semibold hover:underline">
                {t.billing?.checkout?.privacyPolicy || "Privacy Policy"}
              </a>
            </>
          )}
        </label>
      </div>

      {/* Checkout Submit Button */}
      <div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!agreed || isProcessing}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.99] ${!agreed || isProcessing
            ? "bg-[#7A7574] text-white cursor-not-allowed"
            : "bg-[#BE0015] hover:bg-[#980013] text-white shadow-md shadow-gray-200 cursor-pointer"
            }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.billing?.pricing?.processing || "Đang xử lý..."}
            </>
          ) : (
            <>
              {t.billing?.checkout?.submit || "Thanh toán"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Security Shield Subtext */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t.billing?.checkout?.secure || "Thông tin của bạn được bảo mật tuyệt đối"}</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentSummaryBox
