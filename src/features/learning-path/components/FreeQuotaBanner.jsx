import React from "react"
import { useNavigate } from "react-router-dom"

const FreeQuotaBanner = ({
  quota,
}) => {
  const navigate = useNavigate()

  // If user is premium, no quota banner needed
  if (quota?.isPremium) {
    return null
  }

  const usedToday = quota?.usedToday ?? 0
  const dailyLimit = quota?.dailyLimit ?? 2
  const remainingToday = Math.max(0, dailyLimit - usedToday)
  const isExhausted = remainingToday === 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate("/pricing")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          navigate("/pricing")
        }
      }}
      className={`w-full rounded-2xl py-3.5 px-4 text-center text-xs sm:text-sm font-medium my-6 transition-all cursor-pointer select-none ${
        isExhausted
          ? "bg-[#FEFDF0] border border-[#FEEA75] text-[#93370D] hover:bg-[#FDF9DB]"
          : "bg-[#FFF4F5] border border-[#FEE4E2] text-[#D92D20] hover:bg-[#FFEAEB]"
      }`}
    >
      {isExhausted ? (
        <span>
          Gói Free: đã dùng {dailyLimit}/{dailyLimit} lượt hôm nay · Nâng cấp Premium để luyện không giới hạn →
        </span>
      ) : (
        <span>
          Gói Free: còn {remainingToday}/{dailyLimit} lượt luyện nói hôm nay · Nâng cấp Premium để luyện không giới hạn →
        </span>
      )}
    </div>
  )
}

export default FreeQuotaBanner
