import React, { useState } from "react"
import dayjs from "dayjs"
import { Check } from "lucide-react"
import { parseTopic, getDayOfWeekLabel } from "../utils/learningPathUtils"
import CompletedCardPopover from "./CompletedCardPopover"

const CalendarCardItem = ({
  card,
  isToday: isTodayProp,
  onSelectCard,
  onLaunchCard,
  onSkipCard,
  isLaunching = false,
  startsTomorrow = false,
}) => {
  const [showPopover, setShowPopover] = useState(false)

  if (!card) return null

  const isToday = isTodayProp ?? card.isToday ?? false
  const status = card.status || "Upcoming"
  const formattedDate = card.scheduledDate
    ? dayjs(card.scheduledDate).format("DD/MM")
    : ""
  const dayOfWeek = getDayOfWeekLabel(card.scheduledDate)

  const { hanzi, pinyin, vietnamese } = parseTopic(
    card.topicTitle,
    card.topicDescription,
  )

  // Status flags
  const isScheduled = status === "Scheduled" || (isToday && status !== "Completed" && status !== "Missed")
  const isCompleted = status === "Completed"
  const isMissed = status === "Missed"
  const isUpcoming = status === "Upcoming"
  const isQuotaLocked = status === "QuotaLocked" || card.isQuotaLocked
  const isSkipped = status === "Skipped"
  const isInProgress = status === "InProgress"

  // Base card container styling based on Figma screens
  let borderClass = "border border-gray-200"
  if (isScheduled && !isQuotaLocked) {
    borderClass = "border-2 border-[#980019] shadow-sm"
  }

  const handleCardClick = () => {
    if (isCompleted) {
      setShowPopover((prev) => !prev)
      return
    }
    onSelectCard?.(card)
  }

  const handlePrimaryBtnClick = (e) => {
    e.stopPropagation()
    if (isQuotaLocked) {
      onSelectCard?.(card)
      return
    }
    if (isScheduled || isInProgress) {
      onLaunchCard?.(card)
    } else {
      onSelectCard?.(card)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white p-5 transition-all duration-200 cursor-pointer min-h-[220px] ${borderClass}`}
    >
      {/* Popover for completed card (Figma screen 13 lp01c) */}
      {isCompleted && showPopover && (
        <CompletedCardPopover
          dayIndex={card.dayIndex}
          topicTitle={vietnamese || card.topicTitle}
          score={card.score !== null ? Math.round(card.score) : 82}
          onClose={() => setShowPopover(false)}
        />
      )}

      {/* Top Header: Day & Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-gray-900 leading-tight">
              Ngày {card.dayIndex}{dayOfWeek ? ` · ${dayOfWeek}` : ""}
            </span>
            {formattedDate && (
              <span className="text-[11px] text-gray-400 font-normal mt-0.5">
                {formattedDate}
              </span>
            )}
          </div>

          {/* Right Badge matching Figma 100% */}
          <div>
            {isCompleted && (
              <div className="w-5 h-5 rounded-full bg-[#12B76A] flex items-center justify-center text-white shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}

            {isMissed && (
              <div className="w-5 h-5 rounded-full bg-[#FDB022] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                !
              </div>
            )}

            {isScheduled && !isQuotaLocked && (
              <span className="inline-block bg-[#980019] text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                Hôm nay
              </span>
            )}

            {isQuotaLocked && (
              <span className="inline-block bg-gray-100 text-gray-500 text-[11px] font-medium px-2 py-0.5 rounded-md">
                Khóa
              </span>
            )}

            {isSkipped && (
              <span className="inline-block bg-gray-100 text-gray-500 text-[11px] font-medium px-2 py-0.5 rounded-md">
                Đã bỏ qua
              </span>
            )}

            {isUpcoming && !isQuotaLocked && !isSkipped && (
              <span className="inline-block bg-gray-100 text-gray-400 text-[11px] font-medium px-2 py-0.5 rounded-md">
                Sắp tới
              </span>
            )}
          </div>
        </div>

        {/* Card Body: Title (Vietnamese) & Subtitle (Hanzi / Pinyin / Desc) */}
        <div className="my-3 text-left">
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-[#980019] transition-colors">
            {vietnamese || card.topicTitle}
          </h3>

          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
            {hanzi && <span>{hanzi}</span>}
            {hanzi && (pinyin || card.topicDescription) && <span> · </span>}
            <span>{card.topicDescription || pinyin}</span>
          </p>
        </div>
      </div>

      {/* Card Bottom Actions */}
      <div className="mt-4 flex flex-col justify-end">
        {/* Completed: Green Score Pill */}
        {isCompleted && (
          <div className="text-left">
            <span
              onClick={(e) => {
                e.stopPropagation()
                setShowPopover((prev) => !prev)
              }}
              className="inline-block bg-[#E6F8EB] text-[#12B76A] font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-[#D5F4DE] transition-colors"
            >
              {card.score !== null ? Math.round(card.score) : 82} điểm
            </span>
          </div>
        )}

        {/* Missed: Yellow "Học bù →" Button */}
        {isMissed && (
          <button
            type="button"
            onClick={handlePrimaryBtnClick}
            className="w-full bg-[#FEF6EE] text-[#D97706] hover:bg-[#FDE8D0] font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            <span>Học bù</span>
            <span>→</span>
          </button>
        )}

        {/* Scheduled / InProgress (Today Active) */}
        {(isScheduled || isInProgress) && !isQuotaLocked && (
          <div className="flex flex-col gap-1.5">
            {/* Small skip button (Figma screen 14) */}
            {onSkipCard && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSkipCard?.(card)
                }}
                className="self-end text-[11px] text-gray-400 hover:text-gray-600 transition-colors pr-1"
              >
                Bỏ qua
              </button>
            )}

            <button
              type="button"
              disabled={isLaunching}
              onClick={handlePrimaryBtnClick}
              className="w-full bg-[#980019] text-white hover:bg-[#800014] font-medium text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors disabled:opacity-50"
            >
              <span>{isLaunching ? "Đang kết nối..." : "Vào học"}</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* QuotaLocked: Gray "Cần Premium" Button (Figma screen 11) */}
        {isQuotaLocked && (
          <button
            type="button"
            onClick={handlePrimaryBtnClick}
            className="w-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium text-xs py-2 px-3 rounded-xl text-center transition-colors"
          >
            Cần Premium
          </button>
        )}

        {/* Upcoming (Figma screen 01 & screen 12) */}
        {isUpcoming && !isQuotaLocked && !isSkipped && (
          startsTomorrow ? (
            <button
              type="button"
              onClick={handlePrimaryBtnClick}
              className="w-full bg-[#FEF6EE] text-[#D97706] hover:bg-[#FDE8D0] font-semibold text-xs py-2 px-3 rounded-xl text-center transition-colors"
            >
              Học sớm
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full bg-gray-50 text-gray-400 text-xs py-2 px-3 rounded-xl text-center cursor-not-allowed"
            >
              Chưa tới
            </button>
          )
        )}

        {/* Skipped */}
        {isSkipped && (
          <button
            type="button"
            disabled
            className="w-full bg-gray-50 text-gray-400 text-xs py-2 px-3 rounded-xl text-center cursor-not-allowed"
          >
            Đã bỏ qua
          </button>
        )}
      </div>
    </div>
  )
}

export default CalendarCardItem
