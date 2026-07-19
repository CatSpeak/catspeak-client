import React from "react"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

/**
 * GroupAvatar — displays initials or double overlapping avatars for a group conversation.
 */
const GroupAvatar = ({ conversation, size = 48 }) => {
  const participants = conversation.participants || []

  if (participants.length === 0) {
    const initial = (conversation.groupName || conversation.name || "G").charAt(0).toUpperCase()
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
      member?.accountId || member?.username || "",
    )
    return (
      <Avatar
        size={size}
        name={member?.username}
        src={member?.avatarImageUrl}
        className={theme.avatarClass}
      />
    )
  }

  // Show initials/avatars of up to 2 other participants
  const first = participants[0]
  const second = participants[1]
  const smallSize = Math.round(size * 0.62)

  const themeFirst = getParticipantTheme(
    first?.accountId || first?.username || "",
  )
  const themeSecond = getParticipantTheme(
    second?.accountId || second?.username || "",
  )

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Avatar
        size={smallSize}
        name={first?.username}
        src={first?.avatarImageUrl}
        className={`absolute top-0 left-0 z-[1] border-2 border-white ${themeFirst.avatarClass}`}
      />
      <Avatar
        size={smallSize}
        name={second?.username}
        src={second?.avatarImageUrl}
        className={`absolute bottom-0 right-0 z-[2] border-2 border-white ${themeSecond.avatarClass}`}
      />
    </div>
  )
}

export default GroupAvatar
