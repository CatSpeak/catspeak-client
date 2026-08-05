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
import { ParticipantVolumePopover } from "./ParticipantVolumePopover"
import { IconButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"
import InviteParticipantModal from "./InviteParticipantModal"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant }) => {
  const { t } = useLanguage()
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
        <Mic size={20} className="text-cath-red-700" />
      ) : (
        <MicOff size={20} className="text-[#8E8E93]" />
      )}
      {isCameraOn ? (
        <Video size={20} className="text-cath-red-700" />
      ) : (
        <VideoOff size={20} className="text-[#8E8E93]" />
      )}
    </div>
  )

  return (
    <ListItem
      lines={1}
      hoverEffect={true}
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
        {isParticipantHost && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">
            <Crown size={11} className="text-amber-500 fill-amber-400" />
            Host
          </span>
        )}
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
  const { participants, id: roomId } = useVideoCallContext()
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

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {!hideTitle && (
        <ListItem
          lines={1}
          className="border-b border-[#E5E5E5] shrink-0"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {pl.title} ({participants.length})
            </span>
            <IconButton
              variant="ghost"
              size="xs"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus size={22} />
            </IconButton>
            {/* <IconButton variant="ghost" size="xs"><Ellipsis size={22} /></IconButton> */}
          </div>
        </ListItem>
      )}
      <div className="flex-1 overflow-y-auto p-1">
        {raisedHandParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {raisedHandParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
              </li>
            ))}
          </ul>
        )}

        {raisedHandParticipants.length > 0 && otherParticipants.length > 0 && (
          <div className="my-2 mx-1 border-t border-[#E5E5E5]" />
        )}

        {otherParticipants.length > 0 && (
          <ul className="flex flex-col gap-1">
            {otherParticipants.map((participant) => (
              <li key={participant.identity} className="w-full">
                <ParticipantVolumePopover participant={participant}>
                  <ParticipantItem participant={participant} />
                </ParticipantVolumePopover>
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
    </div>
  );
}

export default ParticipantList
