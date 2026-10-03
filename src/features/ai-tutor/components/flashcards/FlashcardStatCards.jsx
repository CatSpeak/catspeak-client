import React from "react"
import { Layers, Clock, Flame } from "lucide-react"

/**
 * FlashcardStatCards component (fc01)
 *
 * @param {Object} props
 * @param {number} props.totalCards - Tổng số thẻ
 * @param {number} props.dueCount - Số thẻ đến hạn hôm nay
 * @param {number} [props.streakDays=5] - Số ngày streak
 */
const FlashcardStatCards = ({ totalCards = 0, dueCount = 0, streakDays = 5 }) => {
  const stats = [
    {
      id: "total",
      label: "Tổng thẻ",
      value: totalCards,
      unit: "",
      icon: Layers,
      valueColor: "text-slate-900",
    },
    {
      id: "due",
      label: "Đến hạn hôm nay",
      value: dueCount,
      unit: "",
      icon: Clock,
      valueColor: "text-[#680411]", // Màu đỏ theo thiết kế fc01
    },
    {
      id: "streak",
      label: "Streak",
      value: totalCards === 0 ? 0 : streakDays,
      unit: " ngày",
      icon: Flame,
      valueColor: "text-slate-900",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <div
            key={stat.id}
            data-testid={`stat-card-${stat.id}`}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500">
                {stat.label}
              </span>
              {/* Icon background bo tròn góc (rounded-xl) thay vì hình tròn hoàn toàn */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50/90 text-rose-800">
                <IconComponent className="h-5 w-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.valueColor}`}>
                {stat.value}
                <span className="text-xl sm:text-2xl font-bold text-slate-800">
                  {stat.unit}
                </span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default FlashcardStatCards
