import React from "react"
import { RotateCcw } from "lucide-react"

const CycleProgressBar = ({
  cycleNumber = 1,
  hskLevel = "HSK 2",
  completedSessions = 0,
  totalSessions = 5,
  averageScore = null,
  streak = 0,
  startsTomorrow = false,
  onOpenLevelModal,
}) => {
  const percent = Math.min(
    100,
    Math.round(((completedSessions || 0) / (totalSessions || 5)) * 100),
  )

  const normalizedLevel = String(hskLevel).replace(/HSK\s*/i, "HSK ")
  const remainingSessions = Math.max(0, (totalSessions || 5) - completedSessions)

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Main Crimson Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-[#980019] via-[#880016] to-[#6E0011] p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        {/* Decorative subtle background circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left Text & Capsule */}
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Chu kỳ {cycleNumber} · Lộ trình {normalizedLevel}
              </h1>
              {onOpenLevelModal && (
                <button
                  type="button"
                  onClick={onOpenLevelModal}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-white/80 bg-white/10 hover:bg-white/20 transition-all border border-white/15"
                  title="Đổi trình độ học tập"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đổi trình độ</span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-white/85 font-normal">
              {startsTomorrow
                ? "Chu kỳ mới bắt đầu ngày mai — bấm buổi để học sớm trước kế hoạch"
                : `${completedSessions}/${totalSessions} buổi đã hoàn thành — tiếp tục phát huy!`}
            </p>

            <div className="mt-2">
              <span className="inline-block bg-white text-[#980019] text-xs font-bold px-3.5 py-1 rounded-full shadow-xs">
                {startsTomorrow ? "Bắt đầu mai" : `Còn ${remainingSessions} buổi`}
              </span>
            </div>
          </div>

          {/* Right Progress Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[280px]">
            <div className="w-full h-2 bg-white/25 rounded-full overflow-hidden p-0 relative">
              <div
                className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white min-w-[38px] text-right">
              {percent}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Three Metric Cards Row (Figma: Buổi hoàn thành, Điểm TB chu kỳ, Streak) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Buổi hoàn thành */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
            Buổi hoàn thành
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {completedSessions}/{totalSessions}
          </div>
        </div>

        {/* Card 2: Điểm TB chu kỳ */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
            Điểm TB chu kỳ
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#980019] tracking-tight">
            {averageScore !== null && averageScore !== undefined
              ? Math.round(averageScore)
              : "--"}
          </div>
        </div>

        {/* Card 3: Streak */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between">
          <span className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
            Streak
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {streak ?? 0} ngày
          </div>
        </div>
      </div>
    </div>
  )
}

export default CycleProgressBar
