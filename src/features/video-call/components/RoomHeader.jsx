import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSessionTimer } from "@/features/video-call"
import { useParticipants, useLocalParticipant } from "@livekit/components-react"
import { toast } from "react-hot-toast"
import { IconButton } from "@/shared/components/ui/buttons"
import { Link2, Clock, HelpCircle, RefreshCcw } from "lucide-react"
import { copyRoomLink } from "@/shared/utils/shareUtils"
import BugReportModal from "@/features/bug-report/components/BugReportModal"

const RoomHeader = () => {
  const { t, language } = useLanguage()
  const { lang, id: routeRoomId } = useParams()
  const {
    room,
    closingRemainingSeconds,
    showTroubleshoot,
    setShowTroubleshoot,
  } = useVideoCallContext()
  const [isReportOpen, setIsReportOpen] = useState(false)
  const { formattedRemaining, formattedMax, hasDuration, remainingSeconds } =
    useSessionTimer(room?.createDate, room?.duration, closingRemainingSeconds)

  const effectiveRemaining = closingRemainingSeconds ?? remainingSeconds

  const rawRoomName = room?.name || "General"

  const allParticipants = useParticipants()
  const { localParticipant } = useLocalParticipant()

  // Whoever joined first is the host
  const hostParticipant = [...allParticipants].sort((a, b) => {
    const timeA = a.joinedAt ? a.joinedAt.getTime() : Number.MAX_SAFE_INTEGER
    const timeB = b.joinedAt ? b.joinedAt.getTime() : Number.MAX_SAFE_INTEGER
    return timeA - timeB
  })[0]

  const handleCopyLink = () => {
    copyRoomLink({
      baseUrl: window.location.href,
      room,
      successMessage: t?.rooms?.videoCall?.linkCopied,
    })
  }

  const isHost =
    hostParticipant &&
    localParticipant &&
    hostParticipant.identity === localParticipant.identity

  return (
    <div className="flex items-center justify-between bg-white px-4 h-[56px] shrink-0 border-b border-border">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden w-40 shrink-0 items-center md:flex">
          <div className="flex items-center gap-4 p-0">
            <Link
              to={`/${lang || "en"}/community`}
              target="_blank"
              rel="noopener noreferrer"
            >
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
            <IconButton
              variant="ghost"
              innerClassName="!bg-transparent group-hover/icon:!bg-[#D9D9D9]"
              title={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
              onClick={handleCopyLink}
            >
              <Link2 color="#F3B403" className="transform rotate-[135deg]" />
            </IconButton>
            {room?.requiredLevel && (
              <span className="rounded-full bg-cath-red-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {t?.rooms?.filters?.levels?.[
                  room.requiredLevel?.toLowerCase()
                ] || room.requiredLevel}
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

      <div className="flex items-center gap-1">
        {hasDuration && (
          <div
            className={`hidden md:flex items-center justify-center gap-2 text-xs md:text-sm font-semibold rounded-full py-1.5 px-4 h-9 transition-all select-none ${
              effectiveRemaining !== null && effectiveRemaining <= 60
                ? "bg-red-50 text-red-600 border border-red-200 shadow-2xs animate-pulse"
                : effectiveRemaining !== null && effectiveRemaining <= 300
                ? "bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs"
                : "bg-neutral-100/80 text-neutral-600 border border-neutral-200/60"
            }`}
          >
            <Clock
              size={15}
              className={
                effectiveRemaining !== null && effectiveRemaining <= 60
                  ? "text-red-500"
                  : effectiveRemaining !== null && effectiveRemaining <= 300
                  ? "text-amber-500"
                  : "text-neutral-400"
              }
            />
            <span>
              {formattedRemaining} <span className="opacity-40 font-normal">/ {formattedMax}</span>
            </span>
          </div>
        )}
        {/* Q2/Q9: [counter] [?] [troubleshoot] — cụm phải header, luôn hiện cả mobile */}
        <button
          type="button"
          onClick={() => setIsReportOpen(true)}
          title={t?.bugReport?.buttonTooltip || t?.helpBox?.helpTooltip || "Báo cáo sự cố"}
          aria-label={t?.bugReport?.buttonTooltip || t?.helpBox?.helpTooltip || "Báo cáo sự cố"}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
        >
          <HelpCircle size={20} />
        </button>
        <button
          type="button"
          onClick={() => setShowTroubleshoot?.(!showTroubleshoot)}
          title={t?.rooms?.videoCall?.reconnect || "Khắc phục sự cố kết nối"}
          aria-label={t?.rooms?.videoCall?.reconnect || "Khắc phục sự cố kết nối"}
          aria-pressed={Boolean(showTroubleshoot)}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
            showTroubleshoot
              ? "bg-red-100 text-red-600"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          }`}
        >
          <RefreshCcw size={18} />
        </button>
      </div>
      <BugReportModal
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        roomContext={{
            roomId: room?.id || routeRoomId || "",
            roomName: room?.name || routeRoomId || rawRoomName,
          }}
      />
    </div>
  )
}

export default RoomHeader
