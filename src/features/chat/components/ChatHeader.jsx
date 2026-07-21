import { useSelector } from "react-redux"
import { ArrowLeft, PanelRight } from "lucide-react"
import Avatar from "@/shared/components/ui/Avatar"
import GroupAvatar from "./GroupAvatar"
import { IconButton } from "@/shared/components/ui/buttons"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { formatLastSeen } from "@/shared/utils/dateFormatter"

/**
 * ChatHeader — top bar displaying active conversation name, avatar, online status, and panel actions.
 */
const ChatHeader = ({
  conversation,
  onBack,
  onToggleInfo,
  friendOnlineStatus,
}) => {
  const isGroup = conversation?.isGroup
  const otherUser = conversation?.friend
  const name = conversation?.name
  const memberCount = conversation?.participants?.length || 0

  const friendId = otherUser?.accountId || otherUser?.id
  const reduxFriendOnlineStatus = useSelector(
    (state) => state.notification?.friendOnlineStatus || {},
  )
  const reduxFriendLastSeen = useSelector(
    (state) => state.notification?.friendLastSeen || {},
  )
  const onlineStatusMap = friendOnlineStatus || reduxFriendOnlineStatus
  const isOnline =
    !isGroup &&
    friendId &&
    (onlineStatusMap[friendId] ?? otherUser?.isOnline ?? false)

  const lastSeenTime =
    (friendId && reduxFriendLastSeen[friendId]) || otherUser?.lastSeen

  const statusText = isGroup
    ? `${memberCount} members`
    : isOnline
      ? "Online"
      : formatLastSeen(lastSeenTime)

  return (
    <div className="flex items-center justify-between px-4 h-[72px] border-b border-[#E5E5E5] shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {/* Back button — visible on mobile only */}
        <IconButton
          onClick={onBack}
          size="sm"
          variant="ghost"
          className="flex lg:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft />
        </IconButton>

        {/* Avatar */}
        {isGroup ? (
          <GroupAvatar conversation={conversation} size={40} />
        ) : (
          <div className="relative shrink-0">
            <Avatar
              size={40}
              name={otherUser?.username}
              src={otherUser?.avatarImageUrl}
              className={
                getParticipantTheme(
                  otherUser?.accountId || otherUser?.username || "",
                ).avatarClass
              }
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-white" />
            )}
          </div>
        )}

        {/* Name + status */}
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{name}</h2>
          {statusText && <p className="text-sm text-[#606060]">{statusText}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5">
        <IconButton
          onClick={onToggleInfo}
          size="sm"
          variant="ghost"
          aria-label="Toggle info panel"
        >
          <PanelRight />
        </IconButton>
      </div>
    </div>
  )
}

export default ChatHeader
