import React from "react"
import { useSelector } from "react-redux"
import Avatar from "@/shared/components/ui/Avatar"
import ListItem from "@/shared/components/ui/ListItem"
import GroupAvatar from "../GroupAvatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import { formatRelativeTime } from "@/shared/utils/dateFormatter"
import { useLanguage } from "@/shared/context/LanguageContext"
import { selectUnreadForConversation } from "@/store/slices/notificationSlice"
import { useAuth } from "@/features/auth"

const ConversationItem = ({
  conversation,
  currentUser,
  friendOnlineStatus,
  isSelected = false,
  onClick,
}) => {
  const { t } = useLanguage()
  const { user } = useAuth()

  const currentUserId = currentUser?.id || user?.accountId

  const isGroup = conversation?.isGroup
  const name = isGroup
    ? conversation.groupName || conversation.name
    : conversation?.friend?.username ||
      t?.messages?.unknownUser ||
      "Unknown User"

  const avatarSrc =
    conversation?.friend?.avatarImageUrl || conversation?.friend?.avatar || null

  const unreadCountRedux = useSelector(
    selectUnreadForConversation(conversation?.conversationId),
  )
  const unreadCount = conversation?.unreadCount ?? unreadCountRedux

  // Build last message preview string matching ChatSidebar
  let preview = ""
  if (conversation?.lastMessage) {
    let senderPrefix = ""
    const isSystemMessage =
      String(conversation?.lastMessageType || "").toLowerCase() === "system"

    if (!isSystemMessage) {
      if (conversation.lastMessageSenderId === currentUserId) {
        senderPrefix = `${t?.you || "You"}: `
      } else if (isGroup && conversation.participants) {
        const sender = conversation.participants.find(
          (p) => p.accountId === conversation.lastMessageSenderId,
        )
        if (sender) {
          senderPrefix = `${sender.username?.split(" ")[0] || "?"}: `
        }
      }
    }
    preview = senderPrefix + conversation.lastMessage
  }

  const reduxFriendOnlineStatus = useSelector(
    (state) => state.notification?.friendOnlineStatus || {},
  )
  const onlineStatusMap = friendOnlineStatus || reduxFriendOnlineStatus
  const friendId = conversation?.friend?.accountId
  const isOnline =
    !isGroup &&
    friendId &&
    (onlineStatusMap[friendId] ?? conversation?.friend?.isOnline ?? false)

  const friendTheme = getParticipantTheme(
    conversation?.friend?.accountId || conversation?.friend?.username || "",
  )

  const timestamp = conversation?.lastMessageTime || conversation?.createDate

  const leftContent = (
    <div className="relative shrink-0">
      {isGroup ? (
        <GroupAvatar conversation={conversation} size={40} />
      ) : (
        <>
          <Avatar
            size={40}
            src={avatarSrc}
            name={name}
            alt={name}
            className={friendTheme.avatarClass}
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </>
      )}
    </div>
  )

  const rightContent = (
    <div className="flex flex-col items-end gap-1 justify-center shrink-0">
      <span className="text-xs text-[#606060]">
        {formatRelativeTime(timestamp)}
      </span>
      {unreadCount > 0 ? (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#990011] px-1.5 text-xs text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : (
        <div className="h-5" />
      )}
    </div>
  )

  return (
    <ListItem
      onClick={onClick}
      hoverEffect={!isSelected}
      className={`rounded-xl ${isSelected ? "bg-primary2" : ""}`}
      contentClassName="rounded-xl"
      lines={2}
      leftContent={leftContent}
      rightContent={rightContent}
    >
      <span
        className={`truncate ${
          unreadCount > 0 ? "font-semibold text-black" : "font-medium text-gray-900"
        }`}
      >
        {name}
      </span>
      <span
        className={`text-sm truncate ${
          unreadCount > 0 ? "font-medium text-black" : "text-[#606060]"
        }`}
      >
        {preview || t?.messages?.noMessages || "No messages yet"}
      </span>
    </ListItem>
  )
}

ConversationItem.displayName = "ConversationItem"

export default React.memo(ConversationItem)

