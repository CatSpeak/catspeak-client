import { memo, useEffect, useRef } from "react"
import ChatBubble from "./messages/ChatBubble"
import ChatInput from "./ChatInput"
import ChatHeader from "./ChatHeader"
import ChatMessagesSkeleton from "./ChatMessagesSkeleton"
import DateSeparator from "./messages/DateSeparator"
import SystemMessage from "./messages/SystemMessage"
import FluentCard from "@/shared/components/ui/FluentCard"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useGroupedMessages } from "../hooks/useGroupedMessages"

/**
 * ChatArea — main chat view orchestrator with header, messages, typing indicators, and input.
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
  isLoadingMore = false,
  hasMoreMessages = false,
  onLoadMoreMessages,
  typingUsers = [],
  onStartTyping,
  onStopTyping,
  replyingTo = null,
  onReply,
  onCancelReply,
  onDeleteForMe,
  onRecall,
}) => {
  const scrollRef = useRef(null)
  const isPrependingRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevMessagesLengthRef = useRef(0)

  const groupedItems = useGroupedMessages({
    messages,
    currentUser,
    conversation,
    isLoading,
  })

  // Trigger top scroll load more
  const handleScroll = (e) => {
    const el = e.currentTarget
    if (
      !el ||
      isLoading ||
      isLoadingMore ||
      !hasMoreMessages ||
      !onLoadMoreMessages
    ) {
      return
    }

    if (el.scrollTop < 80) {
      isPrependingRef.current = true
      prevScrollHeightRef.current = el.scrollHeight
      onLoadMoreMessages()
    }
  }

  // Auto-scroll to bottom on initial load / new bottom messages, preserve offset on prepending
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (isPrependingRef.current) {
      const newScrollHeight = el.scrollHeight
      const heightDiff = newScrollHeight - prevScrollHeightRef.current
      el.scrollTop = heightDiff
      isPrependingRef.current = false
    } else {
      const isInitial = prevMessagesLengthRef.current === 0
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150
      if (isInitial || isNearBottom) {
        el.scrollTop = el.scrollHeight
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages, typingUsers])

  if (!conversation) return null

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
          onReply={onReply}
          onDeleteForMe={onDeleteForMe}
          onRecall={onRecall}
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
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onToggleInfo={onToggleInfo}
        friendOnlineStatus={friendOnlineStatus}
      />

      {/* ── Messages ───────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 min-h-0"
      >
        {isLoading ? (
          <ChatMessagesSkeleton />
        ) : (
          <>
            <div className="flex-1" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-2 shrink-0">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
            )}
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
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        disabled={isLoading}
      />
    </FluentCard>
  )
}

export default memo(ChatArea)
