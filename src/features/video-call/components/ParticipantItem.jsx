import React, { useMemo } from "react"
import { motion as Motion, useReducedMotion } from "framer-motion"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  Ellipsis,
  MessageSquareOff,
  ShieldAlert,
} from "lucide-react"
import { useIsSpeaking } from "@livekit/components-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import { ParticipantActionPopover } from "./ParticipantActionPopover"
import { useGlobalVideoCall as useVideoCallContext } from "@/features/video-call/context/GlobalVideoCallProvider"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { sanitizeAvatarUrl } from "@/features/video-call/utils/livekitMetadataUtils"

/**
 * A single row in the participant list.
 * Uses LiveKit Participant object properties directly.
 */
const ParticipantItem = ({ participant, hostAccountId, coHostAccountId }) => {
  const { t } = useLanguage()
  const {
    micOn: localMicOn,
    cameraOn: localCameraOn,
    user,
    restrictionByAccountId,
  } = useVideoCallContext()
  const isSpeaking = useIsSpeaking(participant)
  const prefersReducedMotion = useReducedMotion()
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

  // Ticket 02: live chat/voice restriction badges.
  const restriction =
    accountId != null ? restrictionByAccountId?.[String(accountId)] || {} : {}
  const isChatRestricted = restriction.isChatRestricted === true
  const isVoiceRestricted = restriction.isVoiceRestricted === true

  // Role chip: host wins over co-host; a participant can only be one of them.
  const isThisHost =
    accountId != null &&
    hostAccountId != null &&
    String(accountId) === String(hostAccountId)
  const isThisCoHost =
    !isThisHost &&
    accountId != null &&
    coHostAccountId != null &&
    String(accountId) === String(coHostAccountId)

  const name =
    participant.name || participant.identity || (isLocal ? pl.you : pl.guest)

  const theme = useMemo(
    () => getParticipantTheme(participant.identity || name),
    [participant.identity, name],
  )

  const leftContent = (
    <div className="relative shrink-0">
      <Avatar
        size={40}
        name={name}
        src={avatarUrl}
        speaking={isSpeaking}
        className={theme?.avatarClass || ""}
      />
    </div>
  )

  const statusChip = (on, onTitle, offTitle, onIcon, offIcon) => {
    const icon = on ? onIcon : offIcon
    return (
      <span
        title={on ? onTitle : offTitle}
        className={`flex items-center justify-center shrink-0 transition-colors ${
          on
            ? "text-cath-red-700 dark:text-red-400"
            : "text-neutral-400 dark:text-[#AAAAAA]"
        }`}
      >
        {React.isValidElement(icon)
          ? React.cloneElement(icon, { size: icon.props.size ?? 20 })
          : icon}
        <span className="sr-only">{on ? onTitle : offTitle}</span>
      </span>
    )
  }

  const rightContent = (
    <div className="flex items-center gap-2 shrink-0">
      {isChatRestricted && (
        <span
          title={pl.chatRestrictedBadge || "Chat restricted"}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 [&_svg]:!h-3.5 [&_svg]:!w-3.5"
        >
          <MessageSquareOff className="text-amber-600 dark:text-amber-400" />
        </span>
      )}
      {isVoiceRestricted && (
        <span
          title={pl.voiceRestrictedBadge || "Voice restricted"}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 [&_svg]:!h-3.5 [&_svg]:!w-3.5"
        >
          <ShieldAlert className="text-amber-600 dark:text-amber-400" />
        </span>
      )}
      {isHandRaised && (
        <Motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : { rotate: [0, 20, -10, 20, -10, 0] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }
          }
          style={{ originX: 0.7, originY: 0.7 }}
          className="flex flex-shrink-0 items-center justify-center"
        >
          <Hand
            size={20}
            className="text-amber-500 dark:text-amber-400"
            aria-hidden="true"
          />
        </Motion.div>
      )}
      {statusChip(
        isMicOn,
        pl.micOn,
        pl.micOff,
        <Mic size={20} />,
        <MicOff size={20} />,
      )}
      {statusChip(
        isCameraOn,
        pl.camOn,
        pl.camOff,
        <Video size={20} />,
        <VideoOff size={20} />,
      )}
      <ParticipantActionPopover participant={participant}>
        <IconButton
          variant="ghost"
          title={pl.actions || "Tùy chọn"}
          aria-label={pl.actions || "Tùy chọn"}
        >
          <Ellipsis />
        </IconButton>
      </ParticipantActionPopover>
    </div>
  )

  return (
    <ListItem
      contentClassName="!pr-1"
      lines={1}
      leftContent={leftContent}
      rightContent={rightContent}
    >
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 truncate text-neutral-900 dark:text-neutral-100 font-medium">
          {name} {isLocal && pl.youSuffix}
        </span>
        {isThisHost && (
          <span className="shrink-0 rounded-md bg-cath-red-700/10 dark:bg-red-500/20 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-cath-red-700 dark:text-red-400">
            {pl.hostBadge || "Chủ phòng"}
          </span>
        )}
        {isThisCoHost && (
          <span className="shrink-0 rounded-md bg-amber-100 dark:bg-amber-950/40 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {pl.coHostBadge || "Co-host"}
          </span>
        )}
      </div>
    </ListItem>
  )
}

export default ParticipantItem
