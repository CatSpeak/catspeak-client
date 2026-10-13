import React from "react"
import {
  Clock,
  Video,
  Flame,
  Award,
  Sparkles,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const KPI_CONFIG = {
  totalLearningHours: {
    icon: Clock,
    color: "#72000D",
    bgLight: "bg-[#72000D]/5",
    titleVi: "Tổng số giờ học",
    titleEn: "Total Learning Hours",
  },
  roomsJoined: {
    icon: Video,
    color: "#2563EB",
    bgLight: "bg-blue-50",
    titleVi: "Số room đã tham gia",
    titleEn: "Rooms Joined",
  },
  speakingStreak: {
    icon: Flame,
    color: "#EA580C",
    bgLight: "bg-orange-50",
    titleVi: "Speaking Streak",
    titleEn: "Speaking Streak",
  },
  totalPoints: {
    icon: Award,
    color: "#7C3AED",
    bgLight: "bg-purple-50",
    titleVi: "Tổng điểm tích lũy",
    titleEn: "Reward Points",
  },
  aiSpeakingScore: {
    icon: Sparkles,
    color: "#059669",
    bgLight: "bg-emerald-50",
    titleVi: "AI Speaking Score",
    titleEn: "AI Speaking Score",
  },
  averageRating: {
    icon: Star,
    color: "#D97706",
    bgLight: "bg-amber-50",
    titleVi: "Đánh giá trung bình",
    titleEn: "Average Rating",
  },
}

export const LearnerKpiCard = ({ kpiKey, data }) => {
  const { language } = useLanguage()
  const isEn = language === "en"

  const config = KPI_CONFIG[kpiKey] || {
    icon: Clock,
    color: "#72000D",
    bgLight: "bg-gray-50",
    titleVi: kpiKey,
    titleEn: kpiKey,
  }

  const Icon = config.icon
  const title = isEn ? config.titleEn : config.titleVi
  const value = data?.value !== undefined && data?.value !== null ? data.value : "N/A"
  const unit = (isEn ? data?.unitEn : data?.unit) || ""
  const delta = data?.deltaPercent
  const badgeText = isEn ? data?.badgeTextEn : data?.badgeText

  return (
    <article
      className="bg-white border border-[#DEE0E5] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between min-w-0"
      aria-label={title}
    >
      {/* Top Header inside card */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-[#6E788C] truncate" title={title}>
          {title}
        </span>
        <div
          className={`w-7 h-7 rounded-lg ${config.bgLight} flex items-center justify-center shrink-0`}
          style={{ color: config.color }}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1 my-1">
        <span className="text-xl sm:text-2xl font-bold text-[#14171F] tabular-nums tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-[11px] font-medium text-[#6E788C]">{unit}</span>}
      </div>

      {/* Bottom Growth / Delta Indicator */}
      <div className="mt-2 pt-2 border-t border-[#DEE0E5]/60 flex items-center justify-between text-[11px]">
        {delta !== undefined && delta !== null ? (
          <div
            className={`inline-flex items-center gap-0.5 font-semibold ${
              delta > 0
                ? "text-emerald-600"
                : delta < 0
                ? "text-rose-600"
                : "text-gray-500"
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : delta < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </span>
            <span className="text-gray-400 font-normal ml-0.5 hidden xs:inline">
              {isEn ? "vs prev" : "so kỳ trước"}
            </span>
          </div>
        ) : badgeText ? (
          <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
            <Flame className="w-3 h-3" />
            <span>{badgeText}</span>
          </span>
        ) : (
          <span className="text-gray-400 font-medium">N/A</span>
        )}

        {data?.tier && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
            {data.tier}
          </span>
        )}
      </div>
    </article>
  )
}

const LearnerKpiGrid = ({ kpis }) => {
  return (
    <section aria-label="KPI Summary" className="mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <LearnerKpiCard kpiKey="totalLearningHours" data={kpis?.totalLearningHours} />
        <LearnerKpiCard kpiKey="roomsJoined" data={kpis?.roomsJoined} />
        <LearnerKpiCard kpiKey="speakingStreak" data={kpis?.speakingStreak} />
        <LearnerKpiCard kpiKey="totalPoints" data={kpis?.totalPoints} />
        <LearnerKpiCard kpiKey="aiSpeakingScore" data={kpis?.aiSpeakingScore} />
        <LearnerKpiCard kpiKey="averageRating" data={kpis?.averageRating} />
      </div>
    </section>
  )
}

export default LearnerKpiGrid
