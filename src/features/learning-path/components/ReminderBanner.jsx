import React from "react"
import { AlarmClock } from "lucide-react"

const ReminderBanner = ({
  topicTitle = "Gọi món ăn",
  missedCount = 0,
  maxMissed = 3,
  onDismiss,
}) => {
  return (
    <div className="w-full bg-[#FEFDF0] dark:bg-amber-950/30 border border-[#FEEA75] dark:border-amber-800/40 rounded-2xl p-4 flex items-center justify-between gap-3 mb-5 shadow-xs transition-all">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#713F12] dark:text-amber-200 font-medium leading-relaxed">
        <AlarmClock className="w-4 h-4 text-[#B45309] dark:text-amber-400 shrink-0" />
        <span>
          Bạn chưa học hôm nay — buổi <strong>"{topicTitle}"</strong> đang chờ.{" "}
          {missedCount > 0 ? `Đã lỡ ${missedCount} buổi. ` : ""}
          Lỡ {maxMissed}/5 buổi sẽ đặt lại chu kỳ!
        </span>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs sm:text-sm font-bold text-[#713F12] dark:text-amber-200 hover:text-[#532D0D] dark:hover:text-amber-100 px-2 py-1 rounded-md transition-colors shrink-0"
        >
          Bỏ qua
        </button>
      )}
    </div>
  )
}

export default ReminderBanner
