import React from "react"
import { Link as LinkIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"

const RoomHeader = () => {
  const { t } = useLanguage()
  const { room } = useVideoCallContext()

  const rawRoomName = room?.name || "General"

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!")
  }

  return (
    <div className="flex items-center justify-between bg-[#FCFCFC] px-4 h-[56px] shrink-0">
      <div className="flex items-center gap-3 md:gap-5 h-full">
        <div className="hidden shrink-0 items-center md:flex h-full">
          <div className="flex items-center h-full">
            <img
              src={MainLogo}
              alt="Cat Speak logo"
              className="h-[47px] w-auto"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5 h-full">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="text-lg font-bold text-black leading-[1.4]">{rawRoomName}</div>
            {room?.requiredLevel && (
              <span className="rounded-md bg-cath-red-700 px-3.5 py-[5px] text-[14px] font-bold text-white leading-[normal]">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-md bg-cath-red-700 flex items-center justify-center w-8 h-8 text-[14px] font-bold text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        </div>
      </div>

      <div className="flex items-center">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center p-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors"
          title={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
        >
          <div className="-rotate-45">
            <LinkIcon size={24} className="text-[#1a1a1a]" />
          </div>
        </button>
      </div>
    </div>
  )
}

export default RoomHeader
