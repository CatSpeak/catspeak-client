import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { MainLogo } from "@/shared/assets/icons/logo"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useSessionTimer } from "@/features/video-call"
import { useParticipants, useLocalParticipant } from "@livekit/components-react"
import { toast } from "react-hot-toast"
import { IconButton } from "@/shared/components/ui/buttons"
import { Copy, HelpCircle, RefreshCcw } from "lucide-react"
import { copyRoomLink } from "@/shared/utils/shareUtils"
import BugReportModal from "@/features/bug-report/components/BugReportModal"
import { RoomBadges } from "@/features/rooms"

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
    <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1A] px-4 h-14 shrink-0 border-b border-border dark:border-[#3F3F3F]">
      <div className="flex items-center gap-4">
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

        <div className="flex gap-2 items-center flex-wrap">
          <div className="font-bold text-foreground dark:text-white">
            {rawRoomName}
          </div>
          <IconButton
            variant="ghost"
            title={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
            aria-label={t?.rooms?.videoCall?.copyLink || "Copy meeting link"}
            onClick={handleCopyLink}
          >
            <Copy />
          </IconButton>
          <RoomBadges room={room} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {hasDuration && (
          <div
            className={`hidden md:flex items-center justify-center text-xs md:text-sm font-semibold rounded-full py-1.5 px-3.5 h-9 transition-all select-none ${
              effectiveRemaining !== null && effectiveRemaining <= 60
                ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 shadow-2xs animate-pulse"
                : effectiveRemaining !== null && effectiveRemaining <= 300
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/90 dark:border-amber-900/40 shadow-2xs"
                  : "bg-neutral-100/80 dark:bg-[#272727] text-neutral-600 dark:text-[#AAAAAA] border border-neutral-200/60 dark:border-[#3F3F3F]"
            }`}
          >
            <span>
              {formattedRemaining}{" "}
              <span className="opacity-40 font-normal">/ {formattedMax}</span>
            </span>
          </div>
        )}
        {/* Q2/Q9: [counter] [?] [troubleshoot] — cụm phải header, luôn hiện cả mobile */}
        <IconButton
          variant="ghost"
          onClick={() => setIsReportOpen(true)}
          title={
            t?.bugReport?.buttonTooltip ||
            t?.helpBox?.helpTooltip ||
            "Báo cáo sự cố"
          }
          aria-label={
            t?.bugReport?.buttonTooltip ||
            t?.helpBox?.helpTooltip ||
            "Báo cáo sự cố"
          }
        >
          <HelpCircle />
        </IconButton>
        <IconButton
          variant="ghost"
          onClick={() => setShowTroubleshoot?.(!showTroubleshoot)}
          title={t?.rooms?.videoCall?.reconnect || "Khắc phục sự cố kết nối"}
          aria-label={
            t?.rooms?.videoCall?.reconnect || "Khắc phục sự cố kết nối"
          }
          aria-pressed={Boolean(showTroubleshoot)}
        >
          <RefreshCcw />
        </IconButton>
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
