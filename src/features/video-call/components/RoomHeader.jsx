import React from "react"
import { useParams, Link } from "react-router-dom"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSessionTimer } from "@/features/video-call"
import { useParticipants, useLocalParticipant } from "@livekit/components-react"
import { toast } from "react-hot-toast"
import { IconButton } from "@/shared/components/ui/buttons"
import { Link2 } from 'lucide-react';
import RightSideControls from "./RightSideControls"

const RoomHeader = () => {
  const { t, language } = useLanguage()
  const { lang } = useParams()
  const { room, closingRemainingSeconds } = useVideoCallContext()
  const { formattedRemaining, formattedMax, hasDuration, formattedElapsed } = useSessionTimer(room?.createDate, room?.duration, closingRemainingSeconds)

  const rawRoomName = room?.name || "General"

  const allParticipants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Whoever joined first is the host
  const hostParticipant = [...allParticipants].sort((a, b) => {
    const timeA = a.joinedAt ? a.joinedAt.getTime() : Number.MAX_SAFE_INTEGER;
    const timeB = b.joinedAt ? b.joinedAt.getTime() : Number.MAX_SAFE_INTEGER;
    return timeA - timeB;
  })[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t?.rooms?.videoCall?.linkCopied || "Link copied!");
  };

  const isHost = hostParticipant && localParticipant && hostParticipant.identity === localParticipant.identity;

  return (
    <div className="flex items-center justify-between border-b border-[#E5E5E5] bg-white px-5 h-[56px] shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden w-40 shrink-0 items-center md:flex">
          <div className="flex items-center gap-4 p-0">
            <Link to={`/${lang || 'en'}/community`} target="_blank" rel="noopener noreferrer">
              <img
                src={MainLogo}
                alt="Cat Speak logo"
                className="h-10 w-auto"
              />
            </Link>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-base font-semibold">{rawRoomName}</div>
            {room?.requiredLevel && (
              <span className="rounded-full bg-cath-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {room.requiredLevel}
              </span>
            )}
            {room?.topic &&
              room.topic.split(",").map((t_topic) => {
                const trimmed = t_topic.trim()
                return (
                  <span
                    key={trimmed}
                    className="rounded-full bg-cath-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  >
                    {t.rooms.createRoom?.topics?.[trimmed.toLowerCase()] ||
                      trimmed}
                  </span>
                )
              })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {hasDuration && (
          <div className="flex items-center justify-center text-sm font-medium text-black md:text-base bg-[#F5F5F5] rounded-xl py-2 px-5 h-10 w-full">
            {formattedRemaining} / {formattedMax}
          </div>
        )}
        <IconButton
          title={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
          onClick={handleCopyLink}
          className="md:flex hidden"
        >
          <Link2 color="#F3B403" className="transform rotate-[135deg]" />
        </IconButton>
        <RightSideControls className="md:hidden" />
      </div>


    </div>
  )
}

export default RoomHeader
