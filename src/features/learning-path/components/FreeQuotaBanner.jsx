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
          ? "bg-[#FEFDF0] dark:bg-amber-950/30 border border-[#FEEA75] dark:border-amber-800/40 text-[#93370D] dark:text-amber-300 hover:bg-[#FDF9DB] dark:hover:bg-amber-900/40"
          : "bg-[#FFF4F5] dark:bg-rose-950/30 border border-[#FEE4E2] dark:border-rose-800/40 text-[#D92D20] dark:text-rose-300 hover:bg-[#FFEAEB] dark:hover:bg-rose-900/40"
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
