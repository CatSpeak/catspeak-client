import React from "react"
import dayjs from "dayjs"
import {
  CheckCircle2,
  Clock,
  Lock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  ChevronRight,
  Eye,
} from "lucide-react"
import { parseTopic, getCategoryBadgeInfo } from "../utils/learningPathUtils"

const CalendarCardItem = ({
  card,
  isToday: isTodayProp,
  onSelectCard,
  onLaunchCard,
  isLaunching = false,
}) => {
  if (!card) return null

  const isToday = isTodayProp ?? card.isToday ?? false
  const status = card.status || "Upcoming"
  const formattedDate = card.scheduledDate
    ? dayjs(card.scheduledDate).format("DD/MM")
    : ""

  const { hanzi, pinyin, vietnamese } = parseTopic(
    card.topicTitle,
    card.topicDescription,
  )

  const catBadge = getCategoryBadgeInfo(card.category)

  // Status flags
  const isScheduled = status === "Scheduled"
  const isCompleted = status === "Completed"
  const isMissed = status === "Missed"
  const isUpcoming = status === "Upcoming"
  const isQuotaLocked = status === "QuotaLocked" || card.isQuotaLocked
  const isInProgress = status === "InProgress"

  // Base card container styling based on status
  let containerStyles =
    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"

  if (isScheduled) {
    containerStyles =
      "bg-gradient-to-b from-white via-white to-cath-red-50/20 dark:from-gray-800 dark:via-gray-800 dark:to-cath-red-950/20 border-2 border-cath-red-600 ring-4 ring-cath-red-500/15 shadow-xl shadow-cath-red-500/10 scale-[1.01] z-10"
  } else if (isCompleted) {
    containerStyles =
      "bg-white dark:bg-gray-800 border-emerald-300/80 dark:border-emerald-800/80 shadow-sm hover:shadow-md"
  } else if (isMissed) {
    containerStyles =
      "bg-amber-50/30 dark:bg-amber-950/15 border-amber-300 dark:border-amber-700/70 shadow-sm"
  } else if (isInProgress) {
    containerStyles =
      "bg-orange-50/20 dark:bg-orange-950/10 border-orange-400 dark:border-orange-600 ring-2 ring-orange-400/20 shadow-md"
  } else if (isQuotaLocked) {
    containerStyles =
      "bg-gray-50/80 dark:bg-gray-850/60 border-gray-200 dark:border-gray-700/80 opacity-75"
  } else if (isUpcoming) {
    containerStyles =
      "bg-gray-50/60 dark:bg-gray-850/40 border-gray-200/80 dark:border-gray-700/60 opacity-90 hover:opacity-100"
  }

  const handlePrimaryAction = (e) => {
    e.stopPropagation()
    if (isQuotaLocked) {
      onSelectCard?.(card)
      return
    }

    if (isScheduled || isInProgress) {
      onLaunchCard?.(card)
    } else {
      // Upcoming, Missed, Completed all open preview / review modal first
      onSelectCard?.(card)
    }
  }

  return (
    <div
      onClick={() => onSelectCard?.(card)}
      className={`group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${containerStyles}`}
    >
      {/* Top Header: Day & Category */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Ngày {card.dayIndex}
            </span>
            {formattedDate && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                ({formattedDate})
              </span>
            )}
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cath-red-600 text-white shadow-xs">
                Hôm nay
              </span>
            )}
          </div>

          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${catBadge.bgColor} ${catBadge.textColor} ${catBadge.borderColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${catBadge.dotColor}`} />
            {catBadge.label}
          </span>
        </div>

        {/* Hanzi / Chinese Title */}
        <div className="my-2">
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white tracking-wide leading-tight group-hover:text-cath-red-700 dark:group-hover:text-cath-red-400 transition-colors">
            {hanzi}
          </h3>

          {/* Pinyin Subtitle */}
          {pinyin && (
            <p className="text-xs sm:text-sm font-medium text-cath-red-600 dark:text-cath-red-400 mt-0.5">
              {pinyin}
            </p>
          )}

          {/* Vietnamese translation */}
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
            {vietnamese}
          </p>
        </div>
      </div>

      {/* Middle Status Indicator */}
      <div className="my-3 pt-3 border-t border-gray-100 dark:border-gray-700/40">
        {isCompleted && (
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Đã hoàn thành
            </span>
            {card.score !== null && card.score !== undefined && (
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                ⭐ {Math.round(card.score)}%
              </span>
            )}
          </div>
        )}

        {isMissed && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Đã lỡ buổi học</span>
          </div>
        )}

        {isUpcoming && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Chưa đến lịch</span>
          </div>
        )}

        {isQuotaLocked && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <Lock className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              Đã khóa hôm nay
            </span>
          </div>
        )}

        {isInProgress && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>Đang làm dở</span>
          </div>
        )}

        {isScheduled && (
          <div className="flex items-center gap-1 text-xs font-bold text-cath-red-700 dark:text-cath-red-400">
            <Sparkles className="w-3.5 h-3.5 text-cath-red-600" />
            <span>Mục tiêu chính hôm nay</span>
          </div>
        )}
      </div>

      {/* Bottom CTA Button */}
      <div className="mt-2">
        {isScheduled && (
          <button
            type="button"
            disabled={isLaunching}
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cath-red-700 via-cath-red-600 to-cath-red-700 hover:brightness-110 shadow-md shadow-cath-red-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLaunching ? "Đang chuẩn bị..." : "Vào học ngay"}</span>
          </button>
        )}

        {isInProgress && (
          <button
            type="button"
            disabled={isLaunching}
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isLaunching ? "Đang kết nối..." : "Tiếp tục"}</span>
          </button>
        )}

        {isCompleted && (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem lại</span>
          </button>
        )}

        {isMissed && (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Học bù</span>
          </button>
        )}

        {isUpcoming && (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/60 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all"
          >
            <span>Học sớm</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}

        {isQuotaLocked && (
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 hover:bg-gray-200 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-600 transition-all"
          >
            <Lock className="w-3 h-3 text-gray-400" />
            <span>Chi tiết</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default CalendarCardItem
