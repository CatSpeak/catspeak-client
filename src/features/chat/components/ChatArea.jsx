import { memo, useEffect, useRef, useCallback, useMemo, useState } from "react"
import { ArrowDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { IconButton } from "@/shared/components/ui/buttons"
import ChatBubble from "./messages/ChatBubble"
import MediaUploadBubble from "./messages/MediaUploadBubble"
import ChatInput from "./ChatInput"
import ChatHeader from "./ChatHeader"
import PinnedMessageBar from "./PinnedMessageBar"
import ChatMessagesSkeleton from "./ChatMessagesSkeleton"
import DateSeparator from "./messages/DateSeparator"
import SystemMessage from "./messages/SystemMessage"
import StoryInterestMessage from "./messages/StoryInterestMessage"
import Skeleton from "@/shared/components/ui/indicators/Skeleton"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGroupedMessages } from "../hooks/useGroupedMessages"
import useInChatCall from "../hooks/useInChatCall"
import ActiveCallBanner from "./call/ActiveCallBanner"
import { useGetPinnedMessagesQuery } from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * ChatArea — main chat view orchestrator with header, in-chat search bar,
 * pinned message banner, messages list, typing indicators, and message input.
 */
const ChatArea = ({
  conversation,
  conversationId: propConversationId,
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
  isLoadingNewer = false,
  hasMoreMessages = false,
  hasMoreAfter = false,
  isViewingAroundWindow = false,
  onLoadMoreMessages,
  onLoadNewerMessages,
  onResetToLatest,
  targetHighlightId = null,
  clearTargetHighlight,
  onJumpToMessage,
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
  onToggleSearch,
  isSearchOpen = false,
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
  const shouldScrollBottomRef = useRef(false)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  // ── In-Chat LiveKit Calls ──────────────────────────────
  const { activeCallSession, isCallModalOpen, startCall, joinCall } =
    useInChatCall(conversation, currentUser)

  const effectiveConversationId =
    propConversationId ||
    conversation?.id ||
    conversation?.conversationId

  // Fetch pinned messages to determine which messages in timeline are pinned
  const { data: rawPins = [] } = useGetPinnedMessagesQuery(
    effectiveConversationId,
    {
      skip: !effectiveConversationId,
    },
  )

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

  // Trigger 2-directional scroll pagination (top = older, bottom = newer when viewing aroundId)
  const handleScroll = (e) => {
    const el = e.currentTarget
    if (!el || isLoading) return

    // Scroll near top: load older messages
    if (
      el.scrollTop < 80 &&
      !isLoadingMore &&
      hasMoreMessages &&
      onLoadMoreMessages
    ) {
      isPrependingRef.current = true
      prevScrollHeightRef.current = el.scrollHeight
      onLoadMoreMessages()
    }

    // Scroll near bottom: load newer messages when viewing aroundId window
    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (
      scrollBottom < 80 &&
      !isLoadingNewer &&
      hasMoreAfter &&
      onLoadNewerMessages
    ) {
      onLoadNewerMessages()
    }

    setShowScrollToBottom(
      scrollBottom > 220 || hasMoreAfter || isViewingAroundWindow,
    )
  }

  // Smart hybrid scroll: smooth glide when close to bottom; instant snap for large jumps / history resets
  const scrollToBottomOptimally = useCallback(
    (smooth = true) => {
      const el = scrollRef.current
      if (!el) return
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight

      if (smooth && distance < 800 && !hasMoreAfter && !isViewingAroundWindow) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      } else {
        el.scrollTop = el.scrollHeight
      }
    },
    [hasMoreAfter, isViewingAroundWindow],
  )

  // Auto-scroll to bottom on initial load / new bottom messages / pending uploads, preserve offset on prepending
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    if (isPrependingRef.current) {
      const newScrollHeight = el.scrollHeight
      const heightDiff = newScrollHeight - prevScrollHeightRef.current
      el.scrollTop = heightDiff
      isPrependingRef.current = false
    } else if (!hasMoreAfter) {
      const isInitial = prevMessagesLengthRef.current === 0
      const isNearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150
      if (
        isInitial ||
        isNearBottom ||
        pendingUpload ||
        shouldScrollBottomRef.current
      ) {
        scrollToBottomOptimally(!isInitial && !shouldScrollBottomRef.current)
        shouldScrollBottomRef.current = false
      }
    }
    prevMessagesLengthRef.current = messages.length
  }, [
    messages,
    typingUsers,
    pendingUpload,
    hasMoreAfter,
    scrollToBottomOptimally,
  ])

  // Scroll to and flash highlight target message when aroundId jump triggers
  useEffect(() => {
    if (!targetHighlightId) return

    const timer = setTimeout(() => {
      const element = document.getElementById(
        `chat-message-${targetHighlightId}`,
      )
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("chat-message-highlight")
        setTimeout(() => {
          element.classList.remove("chat-message-highlight")
          clearTargetHighlight?.()
        }, 2000)
      }
    }, 120)

    return () => clearTimeout(timer)
  }, [targetHighlightId, messages, clearTargetHighlight])

  // Smooth scroll and 2-second flash highlight for pinned messages / replies
  const handleJumpToMessage = useCallback(
    (messageId) => {
      const element = document.getElementById(`chat-message-${messageId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.classList.add("chat-message-highlight")
        setTimeout(() => {
          element.classList.remove("chat-message-highlight")
        }, 2000)
      } else if (onJumpToMessage) {
        onJumpToMessage(messageId)
      } else {
        toast(
          t?.chat?.olderMessagePrompt ||
            "The message is older. Scroll up to load older messages.",
          {
            icon: "📌",
          },
        )
      }
    },
    [onJumpToMessage, t],
  )

  const handleScrollToBottom = useCallback(() => {
    shouldScrollBottomRef.current = true
    if ((hasMoreAfter || isViewingAroundWindow) && onResetToLatest) {
      onResetToLatest()
    }
    scrollToBottomOptimally(true)
    setShowScrollToBottom(false)
  }, [
    hasMoreAfter,
    isViewingAroundWindow,
    onResetToLatest,
    scrollToBottomOptimally,
  ])

  const handleSendMessage = useCallback(
    (text, file, extraOptions) => {
      shouldScrollBottomRef.current = true
      scrollToBottomOptimally(true)
      setShowScrollToBottom(false)
      return onSend?.(text, file, extraOptions)
    },
    [onSend, scrollToBottomOptimally],
  )

  const handleSendVoiceMessage = useCallback(
    (file, duration) => {
      shouldScrollBottomRef.current = true
      scrollToBottomOptimally(true)
      setShowScrollToBottom(false)
      return onSendVoice?.(file, duration)
    },
    [onSendVoice, scrollToBottomOptimally],
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
          onJumpToMessage={handleJumpToMessage}
        />
      )
    })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white lg:border lg:border-border lg:rounded-xl">
      {/* ── Chat Header ────────────────────────────── */}
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onToggleInfo={onToggleInfo}
        onToggleSearch={onToggleSearch}
        onStartCall={startCall}
        isSearchOpen={isSearchOpen}
        friendOnlineStatus={friendOnlineStatus}
      />

      {/* ── Active Call Banner (Group Calls Only) ─── */}
      {conversation?.isGroup && (
        <ActiveCallBanner
          conversationId={effectiveConversationId}
          isGroup={conversation?.isGroup}
          onJoinCall={joinCall}
          isCallModalOpen={isCallModalOpen}
        />
      )}

      {/* ── Pinned Message Banner ──────────────────── */}
      <PinnedMessageBar
        conversationId={effectiveConversationId}
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

      {/* ── Floating Jump to Bottom / Latest Button ─ */}
      <div className="relative w-full flex justify-center pointer-events-none">
        <AnimatePresence>
          {(showScrollToBottom || hasMoreAfter || isViewingAroundWindow) && (
            <FluentAnimation
              direction="up"
              distance={16}
              exit="fade"
              duration={0.2}
              className="!absolute -top-12 z-20 pointer-events-auto"
            >
              <IconButton
                variant="secondary"
                size="sm"
                onClick={handleScrollToBottom}
                innerClassName="shadow-md"
                title={
                  hasMoreAfter || isViewingAroundWindow
                    ? t?.chat?.jumpToLatest || "Tin nhắn mới nhất"
                    : t?.chat?.scrollToBottom || "Cuộn xuống"
                }
              >
                <ArrowDown size={20} className="text-cath-red-700" />
              </IconButton>
            </FluentAnimation>
          )}
        </AnimatePresence>
      </div>

      {/* ── Input ──────────────────────────────────── */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={handleSendMessage}
        onSendVoice={handleSendVoiceMessage}
        onStartTyping={onStartTyping}
        onStopTyping={onStopTyping}
        replyingTo={replyingTo}
        onCancelReply={onCancelReply}
        disabled={isLoading}
        conversationId={conversation?.id}
        isGroup={conversation?.isGroup}
        participants={conversation?.participants || []}
      />
    </div>
  )
}

export default memo(ChatArea)
