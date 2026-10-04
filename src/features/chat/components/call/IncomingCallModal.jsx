import { useEffect, useMemo } from "react"
import { Phone, Video, PhoneOff } from "lucide-react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import { IconButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * IncomingCallModal — Displays incoming call notification popup with caller details
 * and Accept/Decline actions. Styled in clean dark obsidian mode.
 */
const IncomingCallModal = ({ open, callData, onAccept, onDecline }) => {
  const { t } = useLanguage()

  // Optional: Play ringing sound effect while modal is open
  useEffect(() => {
    if (!open) return
    // Browser audio context or audio element chime could be triggered here
  }, [open])

  const theme = useMemo(
    () => getParticipantTheme(callData?.callerId || callData?.callerName || ""),
    [callData?.callerId, callData?.callerName],
  )

  if (!open || !callData) return null

  const isVideo =
    callData.callType === "video" ||
    callData.type === "video" ||
    callData.isVideo

  const avatarUrl = sanitizeAvatarUrl(
    callData.callerAvatar || callData.avatarImageUrl || callData.avatar,
  )
  const callerName = callData.callerName || t?.chat?.unknownCaller || "Unknown Caller"

  return (
    <Modal
      open={open}
      onClose={() => {}}
      showCloseButton={false}
      fullScreenOnMobile={false}
      bodyClassName="!p-0 !m-0 overflow-hidden"
      footer={<></>}
      footerClassName="hidden"
      className="max-w-xs sm:max-w-sm rounded-xl bg-neutral-950 border border-white/10 shadow-2xl !p-0 overflow-hidden"
    >
      <div className="flex flex-col items-center text-center p-6 bg-neutral-950 text-white">
        {/* Clean Static Avatar */}
        <div className="mb-6 flex items-center justify-center">
          <Avatar
            size={88}
            name={callerName}
            src={avatarUrl}
            className={`shadow-2xl border-none ${theme.avatarClass}`}
          />
        </div>

        {/* Caller Info */}
        <h3 className="text-lg font-bold text-white">{callerName}</h3>
        <p className="text-sm text-[#AAAAAA] mt-1">
          {isVideo
            ? t?.chat?.call?.incomingVideoCall || "Incoming Video Call..."
            : t?.chat?.call?.incomingVoiceCall || "Incoming Voice Call..."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-10 mt-6 w-full">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-2">
            <IconButton
              size="md"
              variant="danger"
              onClick={onDecline}
              aria-label={t?.chat?.call?.decline || "Decline"}
              title={t?.chat?.call?.decline || "Decline"}
            >
              <PhoneOff />
            </IconButton>
            <span className="text-xs text-[#AAAAAA]">
              {t?.chat?.call?.decline || "Decline"}
            </span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-2">
            <IconButton
              size="md"
              variant="success"
              onClick={() => onAccept(callData)}
              aria-label={t?.chat?.call?.accept || "Accept"}
              title={t?.chat?.call?.accept || "Accept"}
            >
              {isVideo ? <Video /> : <Phone />}
            </IconButton>
            <span className="text-xs text-emerald-400">
              {t?.chat?.call?.accept || "Accept"}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default IncomingCallModal
