import React from "react"
import dayjs from "dayjs"
import {
  GraduationCap,
  Calendar,
  Sparkles,
  RotateCcw,
  Star,
  Clock,
  ShieldCheck,
  Flame,
} from "lucide-react"
import { getLevelName, formatResetsIn } from "../utils/learningPathUtils"

const CycleProgressBar = ({
  hskLevel = "HSK 2",
  startDate,
  endDate,
  completedSessions = 0,
  totalSessions = 5,
  averageScore = null,
  streak = 0,
  quota = null,
  onOpenLevelModal,
}) => {
  const percent = Math.min(
    100,
    Math.round(((completedSessions || 0) / (totalSessions || 5)) * 100),
  )

  const formattedStartDate = startDate
    ? dayjs(startDate).format("DD/MM")
    : dayjs().format("DD/MM")
  const formattedEndDate = endDate
    ? dayjs(endDate).format("DD/MM")
    : dayjs().add(4, "day").format("DD/MM")

  const isFree = quota ? !quota.isPremium : true
  const usedToday = quota?.usedToday ?? 0
  const dailyLimit = quota?.dailyLimit ?? 2
  const resetsIn = quota?.resetsInSeconds ?? 0

  return (
    <div className="w-full bg-white dark:bg-gray-800/90 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 dark:border-gray-700/60 transition-all">
      {/* Top Header: HSK Level & Level Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cath-red-600 to-cath-red-800 flex items-center justify-center text-white shadow-md shadow-cath-red-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
                {hskLevel}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cath-red-50 text-cath-red-700 dark:bg-cath-red-950/40 dark:text-cath-red-300 border border-cath-red-200 dark:border-cath-red-800">
                {getLevelName(hskLevel)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Chu kỳ 5 ngày: {formattedStartDate} – {formattedEndDate}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streak} ngày liên tiếp</span>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenLevelModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all active:scale-95"
            title="Đổi trình độ học tập"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>Đổi trình độ</span>
          </button>
        </div>
      </div>

      {/* Progress & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mt-5">
        {/* Progress bar container (col 8) */}
        <div className="md:col-span-8 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Tiến độ chu kỳ:{" "}
              <span className="text-cath-red-700 dark:text-cath-red-400 font-bold">
                {completedSessions}/{totalSessions} buổi
              </span>
            </span>
            <span className="text-gray-500">{percent}%</span>
          </div>

          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-cath-red-700 via-cath-red-500 to-amber-500 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Average Score Badge (col 4) */}
        <div className="md:col-span-4 flex items-center md:justify-end gap-3">
          {averageScore !== null && averageScore !== undefined ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 shadow-sm shadow-amber-500/5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider leading-none">
                  Điểm TB
                </span>
                <span className="text-sm font-extrabold leading-tight">
                  {Math.round(averageScore)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-gray-400" />
              <span>Chưa có điểm</span>
            </div>
          )}
        </div>
      </div>

      {/* Quota status banner */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        {isFree ? (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <span className="inline-block w-2 h-2 rounded-full bg-cath-red-600" />
            <span>
              Hôm nay:{" "}
              <strong className="text-gray-900 dark:text-white font-semibold">
                {usedToday}/{dailyLimit} buổi miễn phí
              </strong>
            </span>
            {usedToday >= dailyLimit && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium text-[11px] border border-rose-200 dark:border-rose-800">
                Đã đạt giới hạn hôm nay
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Premium: Luyện tập không giới hạn</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Làm mới lúc 00:00 (mỗi ngày)</span>
          {resetsIn > 0 && isFree && (
            <span className="ml-1 text-gray-400">
              (còn {formatResetsIn(resetsIn)})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CycleProgressBar
