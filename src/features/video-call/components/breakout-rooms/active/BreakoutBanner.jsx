import React from "react"
import { Clock } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const BreakoutBanner = ({
  breakoutRoomName,
  breakoutStatus,
  countdownSeconds,
  formattedTime,
}) => {
  const { t } = useLanguage()

  return (
    <div className="px-2 pb-2 md:py-0 z-10 animate-fade-in shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-1 lg:py-2.5 text-xs font-bold shadow-md rounded-xl border border-orange-400">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span className="truncate">
            {breakoutRoomName && breakoutRoomName !== "Main Room"
              ? `${t.rooms.breakoutRooms.breakoutRoomPrefix}${breakoutRoomName}`
              : t.rooms.breakoutRooms.mainRoom}
          </span>
          {breakoutStatus && (
            <div className="ml-2 flex items-center justify-center bg-black/10 px-2.5 h-7 rounded-md border border-white/15 shadow-inner flex-shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                {breakoutStatus.allowSelfChangeRoom
                  ? t.rooms.breakoutRooms.freeToChange
                  : t.rooms.breakoutRooms.fixedRoom}
              </span>
            </div>
          )}
        </div>
        {countdownSeconds !== null && (
          <div className="flex items-center justify-center gap-1.5 bg-black/10 px-2.5 h-7 rounded-md border border-white/15 shadow-inner flex-shrink-0">
            <Clock className="h-3.5 w-3.5 opacity-90" />
            <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap font-mono">
              {formattedTime}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default BreakoutBanner
