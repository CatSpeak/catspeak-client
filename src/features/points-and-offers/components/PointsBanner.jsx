import React from "react"
import { Star, ArrowRight } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const PointsBanner = ({
  availablePoints = 0,
  expiringPoints = 0,
  expiryDate = "",
  onRedeemClick,
  isLoading = false,
}) => {
  const { t } = useLanguage()
  const pt = t.pointsAndOffers || {}

  const expiringText = pt.banner?.expiringNotice
    ? pt.banner.expiringNotice
        .replace("{{points}}", expiringPoints)
        .replace("{{date}}", expiryDate)
    : `${expiringPoints} điểm sẽ hết hạn vào ${expiryDate}`

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#990011] via-[#85000f] to-[#5e000a] text-white p-5 sm:p-7 shadow-md mb-6">
      {/* Decorative background glow / angled accent */}
      <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-20 w-56 h-56 rounded-full bg-black/10 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        {/* Left: Star Icon + Point Info */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Star className="text-white fill-white" size={28} />
          </div>

          <div>
            <span className="text-xs sm:text-sm font-medium text-white/80 tracking-wide block mb-0.5">
              {pt.banner?.currentPoints || "Số điểm hiện có"}
            </span>
            {isLoading ? (
              <div className="h-9 sm:h-12 w-32 bg-white/20 rounded-lg animate-pulse my-1" />
            ) : (
              <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-none">
                {availablePoints.toLocaleString("vi-VN")}
              </div>
            )}
            {expiringPoints > 0 && !isLoading && (
              <p className="text-xs text-white/75 mt-1.5 font-light">
                {expiringText}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="sm:self-center shrink-0">
          <button
            type="button"
            onClick={onRedeemClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#990011] font-semibold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-xl shadow-md hover:bg-rose-50 hover:shadow-lg active:scale-98 transition duration-150 group cursor-pointer"
          >
            <span>{pt.banner?.redeemNow || "Đổi Voucher ngay"}</span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PointsBanner
