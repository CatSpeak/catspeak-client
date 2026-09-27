import { useEffect } from "react"
import { Phone, Video, PhoneOff } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * IncomingCallModal — Displays incoming call notification popup with ringing animation,
 * caller details, and Accept/Decline actions.
 */
const IncomingCallModal = ({
  open,
  callData,
  onAccept,
  onDecline,
}) => {
  const { t } = useLanguage()

  // Optional: Play ringing sound effect while modal is open
  useEffect(() => {
    if (!open) return
    // Browser audio context or audio element chime could be triggered here
  }, [open])

  if (!open || !callData) return null

  const isVideo =
    callData.callType === "video" ||
    callData.type === "video" ||
    callData.isVideo

  const theme = getParticipantTheme(
    callData.callerId || callData.callerName || "",
  )

  return (
    <Modal
      open={open}
      onClose={onDecline}
      maxWidth="max-w-sm"
      className="!p-0 overflow-hidden"
    >
      <div className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-neutral-50 to-white dark:from-zinc-900 dark:to-zinc-800">
        {/* Pulsing Avatar */}
        <div className="relative mb-5 mt-2">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000 scale-125" />
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse duration-700 scale-150" />
          <Avatar
            size={88}
            name={callData.callerName}
            src={callData.callerAvatar}
            className={`relative z-10 border-4 border-white dark:border-zinc-800 shadow-xl ${theme.avatarClass}`}
          />
          <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm">
            {isVideo ? <Video size={14} /> : <Phone size={14} />}
          </div>
        </div>

        {/* Caller Info */}
        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          {callData.callerName || "Unknown Caller"}
        </h3>
        <p className="text-xs text-neutral-500 mt-1">
          {isVideo
            ? t?.chat?.call?.incomingVideoCall || "Incoming Video Call..."
            : t?.chat?.call?.incomingVoiceCall || "Incoming Voice Call..."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-10 mt-8 w-full">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onDecline}
              aria-label="Decline call"
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <PhoneOff size={24} />
            </button>
            <span className="text-[11px] font-medium text-neutral-500">
              {t?.chat?.call?.decline || "Decline"}
            </span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onAccept(callData)}
              aria-label="Accept call"
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-transform active:scale-95 animate-bounce cursor-pointer"
            >
              {isVideo ? <Video size={24} /> : <Phone size={24} />}
            </button>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 font-semibold">
              {t?.chat?.call?.accept || "Accept"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default IncomingCallModal
