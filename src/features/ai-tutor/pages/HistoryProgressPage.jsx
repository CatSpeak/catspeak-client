import React from "react"
import { Link, useParams } from "react-router-dom"
import { createElement } from "react"
import { CalendarDays, History, Layers, Mic } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import PageTitle from "@/shared/components/ui/PageTitle"

const HistoryProgressPage = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const baseLang = lang || "zh"
  const historyText = t?.aiTutor?.historyProgress || {}

  const ctas = [
    {
      to: `/${baseLang}/ai-tutor/learning-path`,
      label: historyText.learningPathCta || "Lộ trình 5 ngày",
      icon: CalendarDays,
    },
    {
      to: `/${baseLang}/ai-tutor/speaking-room`,
      label: historyText.speakingRoomCta || "Phòng luyện nói",
      icon: Mic,
    },
    {
      to: `/${baseLang}/ai-tutor/vocabulary-notebook`,
      label: historyText.vocabularyCta || "Sổ từ vựng",
      icon: Layers,
    },
  ]

  return (
    <div className="w-full flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#3F3F3F] shadow-sm p-8 sm:p-10 text-center flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] flex items-center justify-center">
            <History className="w-8 h-8 stroke-[1.5]" />
          </div>
          <span className="absolute -bottom-2 -right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap bg-rose-50 dark:bg-rose-950/40 text-[#990011] dark:text-[#FF7A8A] border border-rose-100 dark:border-rose-900/60">
            {historyText.badge || "Sắp ra mắt"}
          </span>
        </div>

        <PageTitle>
          {historyText.title || "Lịch sử & Tiến độ"}
        </PageTitle>

        <p className="text-gray-600 dark:text-neutral-300 max-w-md">
          {historyText.comingSoonDesc ||
            "Tính năng thống kê tiến độ chi tiết đang được hoàn thiện. Trong lúc chờ, bạn có thể tiếp tục luyện tập theo lộ trình 5 ngày, vào phòng luyện nói hoặc ôn lại sổ từ vựng."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {ctas.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#3F3F3F] bg-white dark:bg-[#242424] px-4 py-2.5 text-sm font-semibold text-gray-800 dark:text-neutral-100 transition-colors hover:bg-gray-50 dark:hover:bg-[#2c2c2c]"
            >
              {createElement(Icon, {
                className: "w-4 h-4 text-[#990011] dark:text-[#FF7A8A]",
              })}
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryProgressPage
