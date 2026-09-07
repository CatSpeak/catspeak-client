import React, { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  UserPlus,
  Crown,
  Ellipsis,
} from "lucide-react"
import { useIsSpeaking } from "@livekit/components-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { ParticipantActionPopover } from "./ParticipantActionPopover"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"
import { safeSetLiveKitMetadata } from "@/features/video-call/utils/livekitMetadataUtils"
import InviteParticipantModal from "./InviteParticipantModal"
import { toast } from "react-hot-toast"
import ConfirmationModal from "@/shared/components/ui/ConfirmationModal"
import { useNavigate } from "react-router-dom"
import { getNavigate } from "@/features/video-call/hooks/useNavigateRef"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
  let navigate
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate()
  } catch {
    navigate = getNavigate()
  }
  const {
    micOn: localMicOn,
    cameraOn: localCameraOn,
    room,
    user,
  } = useVideoCallContext()
  const isSpeaking = useIsSpeaking(participant)
  const pl = t.rooms.videoCall.participantList

  const isLocal = participant.isLocal
  const isMicOn = isLocal
    ? localMicOn
    : (participant.isMicrophoneEnabled ?? false)
  const isCameraOn = isLocal
    ? localCameraOn
    : (participant.isCameraEnabled ?? false)

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }
  const meta = parseMetadata(participant.metadata)
  const accountId = meta.accountId || (isLocal ? user?.accountId : null)
  const isHandRaised = meta.handRaised === true
  const avatarUrl = sanitizeAvatarUrl(meta.avatarImageUrl)

  const isParticipantHost = isRoomHost(room, accountId)
  const isCurrentUserHost = isRoomHost(room, user?.accountId)

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  const theme = useMemo(
    () => getParticipantTheme(participant.identity || name),
    [participant.identity, name],
  )

  const leftContent = (
    <div className="relative shrink-0 p-1">
      <Avatar
        size={40}
        name={name}
        src={avatarUrl}
        speaking={isSpeaking}
        className={theme?.avatarClass || ""}
      />
    </div>
  )

  const rightContent = (
    <div className="flex items-center gap-2 shrink-0">
      {isHandRaised && (
        <motion.div
          animate={{ rotate: [0, 20, -10, 20, -10, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          style={{ originX: 0.7, originY: 0.7 }}
          className="flex flex-shrink-0 items-center justify-center"
        >
          <Hand size={18} className="text-amber-500" />
        </motion.div>
      )}
      {isMicOn ? (
        <Mic size={18} className="text-cath-red-700" />
      ) : (
        <MicOff size={18} className="text-[#8E8E93]" />
      )}
      {isCameraOn ? (
        <Video size={18} className="text-cath-red-700" />
      ) : (
        <VideoOff size={18} className="text-[#8E8E93]" />
      )}
      {!isLocal && isCurrentUserHost && (
        <div className="p-1 hover:bg-gray-200/60 rounded-lg text-gray-400 hover:text-gray-700 transition-colors ml-0.5">
          <Ellipsis size={18} />
        </div>
      )}
    </div>
  )

  return (
    <ListItem
      lines={1}
      hoverEffect={true}
      hoverBgColor="bg-gray-100"
      className="rounded-xl cursor-pointer"
      contentClassName="rounded-xl"
      leftContent={leftContent}
      rightContent={rightContent}
    >
      <div className="flex items-center gap-1.5 truncate">
        <span
          onClick={(e) => {
            if (accountId) {
              e.stopPropagation()
              window.open(
                `/profile/${accountId}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          }}
          className={`truncate ${accountId ? "cursor-pointer hover:underline hover:text-cath-red-700 transition-colors" : ""}`}
        >
          {name} {isLocal && pl.youSuffix}
        </span>
      </div>
    </ListItem>
  )
}

/**
 * Participant list panel.
 * Reads participants and local media state from VideoCallContext.
 */
const ParticipantList = ({ hideTitle }) => {
  const { t } = useLanguage()
  const {
    participants,
    id: roomId,
    room,
    user,
    lkRoom,
    isHost: isHostFromContext,
  } = useVideoCallContext()
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)
  const pl = t.rooms.videoCall.participantList

  const parseMetadata = (metadata) => {
    if (!metadata) return {}
    try {
      return JSON.parse(metadata)
    } catch {
      return {}
    }
  }

  const raisedHandParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised === true
  })

  const otherParticipants = participants.filter((p) => {
    const meta = parseMetadata(p.metadata)
    return meta.handRaised !== true
  })

  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)
  const [muteAllConfirmOpen, setMuteAllConfirmOpen] = React.useState(false)

  const handleMuteAll = () => {
    setMuteAllConfirmOpen(true)
  }

  const confirmMuteAll = () => {
    setMuteAllConfirmOpen(false)
    if (lkRoom?.localParticipant) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "MUTE_ALL" })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast MUTE_ALL:", e)
      }
    }
    toast.success(pl.successMuteAll || "Đã tắt mic tất cả mọi người")
  }

  const handleLowerAllHands = async () => {
    if (lkRoom?.localParticipant) {
      safeSetLiveKitMetadata(lkRoom.localParticipant, { handRaised: false, handRaisedAt: 0 })
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({ action: "LOWER_ALL_HANDS" })
        )
        lkRoom.localParticipant.publishData(payload, {
          topic: "moderation",
          reliable: true,
        })
      } catch (e) {
        console.error("Failed to broadcast LOWER_ALL_HANDS:", e)
      }
    }
    toast.success(pl.successLowerAllHands || "Đã hạ tất cả các tay xuống")
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <ListItem
          lines={1}
          className="border-b border-border shrink-0"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {pl.title} ({participants.length})
            </span>
            <div className="flex items-center gap-1">
              <IconButton
                variant="ghost"
                size="xs"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus size={22} />
              </IconButton>
            </div>
          </div>
        </ListItem>
      )}

      {/* Host Quick Moderation Actions */}
      {isHost && (
        <div className="p-2.5 border-b border-[#E5E5E5] flex items-center gap-2 bg-gray-50/90 shrink-0">
          <button
            onClick={handleMuteAll}

            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-red-700 bg-red-50/80 hover:bg-red-100 border border-red-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <MicOff size={15} className="text-red-500 shrink-0" />
            <span>{pl.muteAll || "Tắt tất cả mic"}</span>
          </button>

          <button
            onClick={handleLowerAllHands}

            className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 text-xs font-semibold text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
          >
            <Hand size={15} className="text-amber-500 shrink-0" />
            <span>{pl.lowerAllHands || "Hạ tất cả tay"}</span>
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-1">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {raisedHandParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantActionPopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantActionPopover>
              </li>
            ))}
          </ul>
        )}

        {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
          <div className="my-2 mx-1 border-t border-border" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {otherParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantActionPopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantActionPopover>
              </li>
            ))}
          </ul>
        )}
      </div>

      <InviteParticipantModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        roomId={roomId}
      />

      <ConfirmationModal
        open={muteAllConfirmOpen}
        onClose={() => setMuteAllConfirmOpen(false)}
        onConfirm={confirmMuteAll}
        title={pl.confirmMuteAllTitle || pl.muteAll || "Tắt tất cả mic"}
        message={pl.confirmMuteAll || "Bạn có chắc chắn muốn tắt tiếng tất cả thành viên trong phòng?"}
        confirmText={pl.muteAll || "Tắt tất cả mic"}
        confirmVariant="destructive"
      />
    </div>
  );
}

export default ParticipantList