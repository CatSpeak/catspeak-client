import { memo, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { ArrowLeft, PanelRight } from "lucide-react"
import ChatBubble from "./ChatBubble"
import ChatInput from "./ChatInput"
import DateSeparator from "./DateSeparator"
import SystemMessage from "./SystemMessage"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import FluentCard from "@/shared/components/ui/FluentCard"
import { IconButton } from "@/shared/components/ui/buttons"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useGroupedMessages } from "../hooks/useGroupedMessages"
import GroupAvatar from "./GroupAvatar"

import { formatLastSeen } from "@/shared/utils/dateFormatter"

/**
 * ChatArea — main chat view with header, messages, and input.
 */
const ChatArea = ({
  conversation,
  messages = [],
  currentUser,
  inputValue,
  onInputChange,
  onSend,
  onBack,
  onToggleInfo,
  friendOnlineStatus,
  isLoading,
  typingUsers = [],
  onStartTyping,
  onStopTyping,
}) => {
  const scrollRef = useRef(null)

  console.log(messages)

  const groupedItems = useGroupedMessages({
    messages,
    currentUser,
    conversation,
    isLoading,
  })

  // Auto-scroll to bottom on new messages or typing indicator changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typingUsers])

  if (!conversation) return null

  const isGroup = conversation.isGroup
  const otherUser = conversation.friend
  const name = conversation.name
  const memberCount = conversation.participants?.length || 0

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

  // ── Render message list from grouped items hook ──
  const renderMessages = () => {
    return groupedItems.map((item) => {
      if (item.type === "date") {
        return <DateSeparator key={item.id} timestamp={item.timestamp} />
      }
      if (item.type === "system") {
        return <SystemMessage key={item.id} content={item.message.content} />
      }
      return (
        <ChatBubble
          key={item.id}
          message={item.message}
          isOwn={item.isOwn}
          isFirstInGroup={item.isFirstInGroup}
          isLastInGroup={item.isLastInGroup}
          isLastMessageInChat={item.isLastMessageInChat}
          sender={item.sender}
          isGroupChat={item.isGroupChat}
          shouldAnimate={item.shouldAnimate}
          readByUsers={item.readByUsers}
        />
      )
    })
  }

  return (
    <FluentCard
      className="flex-1 overflow-hidden !border-0 !rounded-none lg:!border lg:!rounded-xl"
      padding="p-0"
    >
      {/* ── Chat Header ────────────────────────────── */}
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
            {statusText && (
              <p className="text-sm text-[#606060]">{statusText}</p>
            )}
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

      {/* ── Messages ───────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0"
      >
        {isLoading ? (
          <div className="flex flex-col gap-4 p-4 h-full justify-end">
            {/* Other User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%]">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-10 w-48 rounded-2xl rounded-bl-none" />
              </div>
            </div>

            {/* Current User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-10 w-36 rounded-2xl rounded-br-none" />
              </div>
            </div>

            {/* Other User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%]">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-14 w-64 rounded-2xl rounded-bl-none" />
              </div>
            </div>

            {/* Current User Message Skeleton */}
            <div className="flex items-end gap-2 max-w-[70%] self-end flex-row-reverse">
              <div className="flex flex-col items-end gap-1">
                <Skeleton className="h-10 w-52 rounded-2xl rounded-br-none" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            {renderMessages()}
            {typingUsers &&
              typingUsers.map((u) => {
                const participant = conversation?.participants?.find(
                  (p) => Number(p.accountId || p.id) === Number(u.userId),
                )
                const avatar =
                  participant?.avatarImageUrl ||
                  participant?.avatar ||
                  (conversation?.friend?.accountId === u.userId
                    ? conversation.friend.avatarImageUrl
                    : null)
                return (
                  <ChatBubble
                    key={`typing-${u.userId}`}
                    isTyping={true}
                    isOwn={false}
                    isFirstInGroup={true}
                    isLastInGroup={true}
                    sender={{
                      username: u.username,
                      accountId: u.userId,
                      avatarImageUrl: avatar,
                    }}
                  />
                )
              })}
          </>
        )}
      </div>

      {/* ── Input ──────────────────────────────────── */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        disabled={isLoading}
      />
    </FluentCard>
  )
}

export default memo(ChatArea)
