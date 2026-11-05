import React from "react"
import { Layers, Clock, Flame } from "lucide-react"

/**
 * FlashcardStatCards component (fc01)
 *
 * @param {Object} props
 * @param {number} props.totalCards - Tổng số thẻ
 * @param {number} props.dueCount - Số thẻ đến hạn hôm nay
 * @param {number} [props.streakDays=0] - Số ngày học liên tiếp (FR-FC-019)
 */
const FlashcardStatCards = ({ totalCards = 0, dueCount = 0, streakDays = 0 }) => {
  const stats = [
    {
      id: "total",
      label: "Tổng thẻ",
      value: totalCards,
      unit: "",
      icon: Layers,
      valueColor: "text-slate-900 dark:text-white",
    },
    {
      id: "due",
      label: "Đến hạn hôm nay",
      value: dueCount,
      unit: "",
      icon: Clock,
      valueColor: "text-[#680411] dark:text-red-400", // Màu đỏ theo thiết kế fc01
    },
    {
      id: "streak",
      label: "Chuỗi ngày ôn",
      value: streakDays,
      unit: " ngày",
      icon: Flame,
      valueColor: "text-amber-600 dark:text-amber-400",
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
            className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-neutral-400">
                {stat.label}
              </span>
              {/* Icon background bo tròn góc (rounded-xl) thay vì hình tròn hoàn toàn */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50/90 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                <IconComponent className="h-5 w-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-3">
              <span className={`text-3xl sm:text-4xl font-black tracking-tight ${stat.valueColor}`}>
                {stat.value}
                <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-neutral-200">
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
