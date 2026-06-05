import React from "react"
import { Clock, Calendar, MapPin } from "lucide-react"
import { parseTime } from "../utils/EventUtils"
import { formatLocation, formatTime } from "../utils/eventFormatters"
import { IconLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"

const EventBlock = ({
  event,
  hourHeight,
  ddMmYyyy,
  onClick,
  colWidth = 180,
}) => {
  const { t } = useLanguage()
  const start = parseTime(event.startTime)
  const end = parseTime(event.endTime)
  // Minimum height of 70px to fit contents neatly
  const blockHeight = Math.max((end - start) * hourHeight, 70)
  const topPos = start * hourHeight

  const GAP = 4
  const styleObj = {
    top: `${topPos}px`,
    height: `${blockHeight}px`,
    left: `${event.colIdx * colWidth}px`,
    width: `${colWidth - (event.groupCols > 1 ? GAP : 0)}px`,
    zIndex: 10 + event.colIdx,
  }

  let displayTimeText =
    event.startTime && event.endTime
      ? `${event.startTime} - ${event.endTime}`
      : null
  let displayTimeLines = null

  if (event.originalStartTime && event.originalEndTime) {
    const startDate = new Date(event.originalStartTime)
    const endDate = new Date(event.originalEndTime)
    const diffHours = (endDate - startDate) / (1000 * 60 * 60)

    if (diffHours > 24) {
      displayTimeLines = [
        formatTime(event.originalStartTime),
        formatTime(event.originalEndTime),
      ]
      displayTimeText = null
    }
  }

  return (
    <div
      onClick={onClick}
      className="absolute rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-start group text-white"
      style={{ ...styleObj, backgroundColor: event.color || "#B91264" }}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="p-1 rounded-md">
          <img src={IconLogo} alt="Logo" width={14} height={14} />
        </div>
        <span className="font-bold text-base truncate">{event.title}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm font-medium pl-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent group-hover:[&::-webkit-scrollbar-thumb]:bg-[#990011] hover:[&::-webkit-scrollbar-thumb]:bg-[#7a000e] [&::-webkit-scrollbar-thumb]:rounded-[2px] pb-1 pr-1">
        {displayTimeLines ? (
          <div className="flex items-start gap-2">
            <Clock size={12} className="shrink-0 mt-[3px]" />
            <div className="flex flex-col leading-tight">
              <span>
                {displayTimeLines[0]} {t.calendar?.to || "to"}
              </span>
              <span>{displayTimeLines[1]}</span>
            </div>
          </div>
        ) : displayTimeText ? (
          <div className="flex items-start gap-2">
            <Clock size={12} className="shrink-0 mt-[3px]" />
            <span className="leading-tight">{displayTimeText}</span>
          </div>
        ) : null}

        {ddMmYyyy && (
          <div className="flex items-center gap-2">
            <Calendar size={12} className="shrink-0" />
            <span className="truncate">{ddMmYyyy}</span>
          </div>
        )}

        {(event.location || event.cityName || event.countryName) && (
          <div className="flex items-center gap-2">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">
              {formatLocation(
                event.location,
                event.cityName,
                event.countryName,
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventBlock
