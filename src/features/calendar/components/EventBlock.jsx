import React from "react"
import { Clock, Calendar, MapPin } from "lucide-react"
import { parseTime } from "../utils/EventUtils"
import { IconLogo } from "@/shared/assets/icons/logo"

const EventBlock = ({
  event,
  hourHeight,
  ddMmYyyy,
  onClick,
  colWidth = 180,
}) => {
  const start = parseTime(event.startTime)
  const end = parseTime(event.endTime)
  // Minimum height of 70px to fit contents neatly
  const blockHeight = Math.max((end - start) * hourHeight, 70)
  const topPos = start * hourHeight

  // Fixed pixel-based positioning so events never squish
  const GAP = 4
  const styleObj = {
    top: `${topPos}px`,
    height: `${blockHeight}px`,
    left: `${event.colIdx * colWidth + (event.colIdx > 0 ? GAP : 0)}px`,
    width: `${colWidth - (event.groupCols > 1 ? GAP : 0)}px`,
    zIndex: 10 + event.colIdx,
  }

  return (
    <div
      onClick={onClick}
      className="absolute rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-start group text-white"
      style={{ ...styleObj, backgroundColor: event.color || "#B91264" }}
    >
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div className="p-1 rounded-md">
          <img src={IconLogo} alt="Logo" width={14} height={14} />
        </div>
        <span className="font-bold text-base truncate">{event.title}</span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm font-medium pl-1 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#990011] hover:[&::-webkit-scrollbar-thumb]:bg-[#7a000e] [&::-webkit-scrollbar-thumb]:rounded-[2px] pb-1 pr-1">
        <div className="flex items-center gap-2">
          <Clock size={12} className="shrink-0" />
          <span className="truncate">
            {event.startTime} - {event.endTime}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={12} className="shrink-0" />
          <span className="truncate">{ddMmYyyy}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
    </div>
  )
}

export default EventBlock
