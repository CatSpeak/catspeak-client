import React from "react"
import { Link as LinkIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { IconLogo, MainLogo } from "@/shared/assets/icons/logo"
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
      {/* Left: Logo + Room Info */}
      <div className="flex items-center gap-[21px] h-full">
        {/* Logo: icon + wordmark + tagline */}
        <div className="hidden shrink-0 items-center md:flex h-full">
          <div className="flex items-center gap-2 h-full">
            {/* Cat head icon — height matches logo + tagline combined */}
            <img
              src={IconLogo}
              alt=""
              className="h-[47px] w-auto"
            />
            {/* Wordmark + Tagline stacked */}
            <div className="flex flex-col justify-center gap-[3px]">
              <img
                src={MainLogo}
                alt="Cat Speak"
                className="h-[18px] w-auto"
              />
              <p className="text-[7px] font-medium text-black leading-none tracking-wider m-0 whitespace-nowrap">
                I SPEAK{' · '}YOU SPEAK{' · '}WE SPEAK
              </p>
            </div>
          </div>
        </div>

        {/* Room Name + Badges */}
        <div className="flex items-center gap-[11px] h-full">
          <p className="text-[18px] font-bold text-black leading-[1.4] whitespace-nowrap m-0">
            {rawRoomName}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-[11px]">
            {room?.requiredLevel && (
              <span className="bg-[#901] flex items-center justify-center h-[27px] px-[15px] rounded-[6px] text-[14px] font-bold text-white leading-[normal]">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="bg-[#901] flex items-center justify-center size-[32px] rounded-full text-[14px] font-bold text-white"
                  >
                    {(
                      t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed
                    ).substring(0, 2)}
                  </span>
                )
              })}
          </div>
        </div>
      </div>

      {/* Right: Link Button */}
      <div className="flex items-center">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center size-[51px] rounded-full"
          title={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
        >
          <div className="bg-[#F5F5F5] flex items-center p-[6px] rounded-full">
            <LinkIcon size={24} className="text-[#1a1a1a]" />
          </div>
        </button>
      </div>
    </div>
  )
}

export default RoomHeader
