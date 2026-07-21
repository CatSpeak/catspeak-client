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
      t?.chat?.unknownUser ||
      t?.messages?.unknownUser ||
      "Unknown User"

  const avatarSrc =
    conversation?.friend?.avatarImageUrl || conversation?.friend?.avatar || null

  const unreadCountRedux = useSelector(
    selectUnreadForConversation(conversation?.conversationId),
  )
  const unreadCount = conversation?.unreadCount ?? unreadCountRedux

  // Build last message preview string matching backend MessageType spec
  let preview = ""
  if (
    conversation?.lastMessage !== undefined ||
    conversation?.lastMessageType !== undefined ||
    conversation?.lastMessageTime !== undefined
  ) {
    const typeVal = conversation?.lastMessageType
    const typeStr = String(typeVal ?? "").toLowerCase()
    const isSystemMessage = typeStr === "system" || typeVal === 4
    const rawMsg = conversation?.lastMessage || ""

    const senderId = conversation?.lastMessageSenderId != null ? Number(conversation.lastMessageSenderId) : null
    const myId = currentUserId != null ? Number(currentUserId) : null
    const isOwn = senderId != null && myId != null && senderId === myId

    let senderName = ""
    if (isGroup && conversation?.participants && senderId != null && !isOwn) {
      const sender = conversation.participants.find(
        (p) => Number(p.accountId || p.id) === senderId,
      )
      if (sender) {
        senderName = sender.username || sender.name || ""
      }
    }

    const hasText = rawMsg.trim().length > 0
    const textPrefix = isOwn
      ? `${t?.chat?.you || t?.you || "You"}: `
      : senderName
        ? `${senderName}: `
        : ""

    if (isSystemMessage) {
      preview = rawMsg
    } else if (
      typeStr === "recalled" ||
      typeVal === 5 ||
      rawMsg === "Tin nhắn đã bị thu hồi" ||
      rawMsg === "[Message Recalled]"
    ) {
      preview = isOwn
        ? t?.chat?.youRecalledMessage || "Bạn đã thu hồi một tin nhắn"
        : senderName
          ? (t?.chat?.userRecalledMessage
              ? t.chat.userRecalledMessage.replace("{{name}}", senderName)
              : `${senderName} đã thu hồi một tin nhắn`)
          : t?.chat?.recalledMessage || "Tin nhắn đã bị thu hồi"
    } else if (hasText) {
      // If there is text attached with media/file or plain text, prioritize the text
      preview = textPrefix + rawMsg
    } else if (typeStr === "picture" || typeStr === "image" || typeVal === 1) {
      preview = isOwn
        ? t?.chat?.youSentImage || "Bạn đã gửi một hình ảnh"
        : senderName
          ? (t?.chat?.userSentImage
              ? t.chat.userSentImage.replace("{{name}}", senderName)
              : `${senderName} đã gửi một hình ảnh`)
          : t?.chat?.sentImage || "Đã gửi một hình ảnh"
    } else if (typeStr === "video" || typeVal === 2) {
      preview = isOwn
        ? t?.chat?.youSentVideo || "Bạn đã gửi một video"
        : senderName
          ? (t?.chat?.userSentVideo
              ? t.chat.userSentVideo.replace("{{name}}", senderName)
              : `${senderName} đã gửi một video`)
          : t?.chat?.sentVideo || "Đã gửi một video"
    } else if (typeStr === "file" || typeStr === "document" || typeVal === 3) {
      preview = isOwn
        ? t?.chat?.youSentFile || "Bạn đã gửi một tệp"
        : senderName
          ? (t?.chat?.userSentFile
              ? t.chat.userSentFile.replace("{{name}}", senderName)
              : `${senderName} đã gửi một tệp`)
          : t?.chat?.sentFile || "Đã gửi một tệp"
    } else {
      preview = textPrefix + rawMsg
    }
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
        {preview || t?.chat?.noMessages || t?.messages?.noMessages || "No messages yet"}
      </span>
    </ListItem>
  )
}

ConversationItem.displayName = "ConversationItem"

export default React.memo(ConversationItem)

