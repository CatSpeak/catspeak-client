import { memo, useEffect, useRef, useCallback, useMemo, useState } from "react"
import ChatBubble from "./messages/ChatBubble"
import MediaUploadBubble from "./messages/MediaUploadBubble"
import ChatInput from "./ChatInput"
import ChatHeader from "./ChatHeader"
import InChatSearchBar from "./search/InChatSearchBar"
import PinnedMessageBar from "./PinnedMessageBar"
import ChatMessagesSkeleton from "./ChatMessagesSkeleton"
import DateSeparator from "./messages/DateSeparator"
import SystemMessage from "./messages/SystemMessage"
import StoryInterestMessage from "./messages/StoryInterestMessage"
import FluentCard from "@/shared/components/ui/FluentCard"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGroupedMessages } from "../hooks/useGroupedMessages"
import useInChatCall from "../hooks/useInChatCall"
import ActiveCallBanner from "./call/ActiveCallBanner"
import IncomingCallModal from "./call/IncomingCallModal"
import InChatCallModal from "./call/InChatCallModal"
import { useGetPinnedMessagesQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * ChatArea — main chat view orchestrator with header, in-chat search bar,
 * pinned message banner, messages list, typing indicators, and message input.
 */
const ChatArea = ({
  conversation,
  messages = [],
  currentUser,
  inputValue,
  onInputChange,
  onSend,
  onSendVoice,
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
  onEdit,
  onToggleReaction,
  onPin,
  onUnpin,
  pendingUpload = null,
  onRetryUpload,
  onCancelUpload,
}) => {
  const { t } = useLanguage()
  const { userTimeZone } = useTimezone()
  const scrollRef = useRef(null)
  const isPrependingRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevMessagesLengthRef = useRef(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // ── In-Chat LiveKit Calls ──────────────────────────────
  const {
    activeCallSession,
    incomingCallData,
    isCallModalOpen,
    startCall,
    joinCall,
    acceptIncomingCall,
    declineIncomingCall,
    endCall,
    closeCallModal,
  } = useInChatCall(conversation?.id, currentUser)


  // Fetch pinned messages to determine which messages in timeline are pinned
  const { data: rawPins = [] } = useGetPinnedMessagesQuery(conversation?.id, {
    skip: !conversation?.id,
  })

  const pinnedIds = useMemo(() => {
    const list = Array.isArray(rawPins)
      ? rawPins
      : rawPins?.data || rawPins?.items || []
    return new Set(list.map((p) => Number(p.messageId || p.id)))
  }, [rawPins])

  // Permissions: Anyone can pin in 1:1; Creator/Admin only in group chat
  const canPin = useMemo(() => {
    if (!conversation?.isGroup) return true
    return Number(conversation?.createdById) === Number(currentUser?.id)
  }, [conversation, currentUser])

  const groupedItems = useGroupedMessages({
    messages,
    currentUser,
    conversation,
    isLoading,
    userTimeZone,
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

  // Auto-scroll to bottom on initial load / new bottom messages / pending uploads, preserve offset on prepending
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
      if (isInitial || isNearBottom || pendingUpload) {
        el.scrollTop = el.scrollHeight
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [messages, typingUsers, pendingUpload])

  // Smooth scroll and 2-second flash highlight for pinned messages
  const handleJumpToMessage = useCallback(
    (messageId) => {
      const element = document.getElementById(`chat-message-${messageId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("ring-2", "ring-primary", "rounded-xl", "bg-primary/10")
        setTimeout(() => {
          element.classList.remove(
            "ring-2",
            "ring-primary",
            "rounded-xl",
            "bg-primary/10",
          )
        }, 2000)
      } else {
        toast(
          t?.chat?.olderMessagePrompt ||
            "The pinned message is older. Scroll up to load older messages.",
          {
            icon: "📌",
          },
        )
      }
    },
    [t],
  )

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
      if (item.type === "storyinterest") {
        return (
          <StoryInterestMessage
            key={item.id}
            message={item.message}
            sender={item.sender}
          />
        )
      }

      const msgId = Number(item.message.id || item.message.messageId)
      const isMsgPinned = pinnedIds.has(msgId)

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
          onEdit={onEdit}
          onToggleReaction={onToggleReaction}
          onPin={onPin}
          onUnpin={onUnpin}
          isPinned={isMsgPinned}
          canPin={canPin}
          conversationId={conversation?.id}
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
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        onStartCall={startCall}
        isSearchOpen={isSearchOpen}
        friendOnlineStatus={friendOnlineStatus}
      />

      {/* ── Active Call Banner ───────────────────────── */}
      <ActiveCallBanner
        conversationId={conversation?.id}
        onJoinCall={joinCall}
        isCallModalOpen={isCallModalOpen}
      />

      {/* ── In-Chat Search Bar ─────────────────────── */}
      <InChatSearchBar
        conversationId={conversation?.id}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onJumpToMessage={handleJumpToMessage}
      />

      {/* ── Pinned Message Banner ──────────────────── */}
      <PinnedMessageBar
        conversationId={conversation?.id}
        onJumpToMessage={handleJumpToMessage}
        canUnpin={canPin}
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

            {pendingUpload && (
              <MediaUploadBubble
                pendingUpload={pendingUpload}
                onRetry={onRetryUpload}
                onCancel={onCancelUpload}
              />
            )}

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
        onSendVoice={onSendVoice}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        disabled={isLoading}
        conversationId={conversation?.id}
        isGroup={conversation?.isGroup}
        participants={conversation?.participants || []}
      />

      {/* ── Incoming Call Modal ────────────────────── */}
      <IncomingCallModal
        open={Boolean(incomingCallData)}
        callData={incomingCallData}
        onAccept={acceptIncomingCall}
        onDecline={declineIncomingCall}
      />

      {/* ── In-Chat LiveKit Call Modal / Floating Window ── */}
      <InChatCallModal
        open={isCallModalOpen}
        onClose={closeCallModal}
        callSession={activeCallSession}
        onEndCall={endCall}
      />
    </FluentCard>
  )
}

export default memo(ChatArea)
