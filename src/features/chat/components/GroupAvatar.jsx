import React from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * GroupAvatar — displays initials or double overlapping avatars for a group conversation.
 */
const GroupAvatar = ({ conversation, size = 48 }) => {
  const groupAvatarUrl =
    conversation?.avatarImageUrl ||
    conversation?.groupAvatar ||
    conversation?.avatar

  if (groupAvatarUrl) {
    return (
      <Avatar
        size={size}
        name={conversation?.groupName || conversation?.name || "G"}
        src={groupAvatarUrl}
      />
    )
  }

  const participants = conversation?.participants || []

  if (participants.length === 0) {
    const initial = (
      conversation?.groupName ||
      conversation?.name ||
      "G"
    )
      .charAt(0)
      .toUpperCase()
    return (
      <div
        className="rounded-full bg-gradient-to-br from-[#990011] to-[#c00015] flex items-center justify-center shrink-0 text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initial}
      </div>
    )
  }

  if (participants.length === 1) {
    const member = participants[0]
    const theme = getParticipantTheme(
      member?.accountId || member?.id || member?.username || "",
    )
    return (
      <Avatar
        size={size}
        name={member?.username || member?.name}
        src={member?.avatarImageUrl || member?.avatar || member?.avatarUrl}
        className={theme.avatarClass}
      />
    )
  }

  // Show initials/avatars of up to 2 other participants
  const first = participants[0]
  const second = participants[1]
  const smallSize = Math.round(size * 0.62)

  const themeFirst = getParticipantTheme(
    first?.accountId || first?.id || first?.username || "",
  )
  const themeSecond = getParticipantTheme(
    second?.accountId || second?.id || second?.username || "",
  )

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="absolute top-0 left-0 z-[1] rounded-full">
        <Avatar
          size={smallSize}
          name={first?.username || first?.name}
          src={first?.avatarImageUrl || first?.avatar || first?.avatarUrl}
          className={`border-2 border-white ${themeFirst.avatarClass}`}
        />
      </div>
      <div className="absolute bottom-0 right-0 z-[2] rounded-full">
        <Avatar
          size={smallSize}
          name={second?.username || second?.name}
          src={second?.avatarImageUrl || second?.avatar || second?.avatarUrl}
          className={`border-2 border-white ${themeSecond.avatarClass}`}
        />
      </div>
    </div>
  )
}

export default GroupAvatar
