import React from "react"
import { useParams } from "react-router-dom"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSessionTimer } from "@/features/video-call"

const RoomHeader = () => {
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const { session, room, enterPiP } = useVideoCallContext()
  const { formattedElapsed, formattedMax } = useSessionTimer(session)

  const rawRoomName = room?.name || "General"

  const handleLogoClick = (e) => {
    e.preventDefault()
    const homePath = `/${lang || language || "en"}/community`
    enterPiP(homePath)
  }

  return (
    <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-white px-5 h-[56px] shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden w-40 shrink-0 items-center md:flex">
          {/* Logo: clicking enters PiP mode instead of navigating away */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-4 cursor-pointer bg-transparent border-none p-0"
            aria-label="Minimize to Picture-in-Picture"
            title="Continue browsing (call stays active)"
          >
            <img
              src={MainLogo}
              alt="Cat Speak logo"
              className="h-10 w-auto"
            />
          </button>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-base font-semibold">{rawRoomName}</div>
            {room?.requiredLevel && (
              <span className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-[#990011] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        </div>
      </div>
      {formattedElapsed && formattedElapsed !== "00:00" && (
        <div className="text-xs font-medium text-[#7A7574] md:text-sm">
          {formattedElapsed}
          {formattedMax ? ` / ${formattedMax}` : ""}
        </div>
      )}
    </div>
  )
}

export default RoomHeader
