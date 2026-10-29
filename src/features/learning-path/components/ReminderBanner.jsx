import React from "react"
import { AlarmClock } from "lucide-react"

const ReminderBanner = ({
  topicTitle = "Gọi món ăn",
  missedCount = 0,
  maxMissed = 3,
  onDismiss,
}) => {
  return (
    <div className="w-full bg-[#FEFDF0] border border-[#FEEA75] rounded-2xl p-4 flex items-center justify-between gap-3 mb-5 shadow-xs transition-all">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#713F12] font-medium leading-relaxed">
        <AlarmClock className="w-4 h-4 text-[#B45309] shrink-0" />
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
          className="text-xs sm:text-sm font-bold text-[#713F12] hover:text-[#532D0D] px-2 py-1 rounded-md transition-colors shrink-0"
        >
          Bỏ qua
        </button>
      )}
    </div>
  )
}

export default ReminderBanner
