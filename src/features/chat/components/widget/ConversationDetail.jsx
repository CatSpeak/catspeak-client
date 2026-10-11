import React, { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import ChatBubble from "../messages/ChatBubble"
import MediaUploadBubble from "../messages/MediaUploadBubble"
import ChatInput from "../ChatInput"
import DateSeparator from "../messages/DateSeparator"
import SystemMessage from "../messages/SystemMessage"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useGroupedMessages } from "../../hooks/useGroupedMessages"

const ConversationDetail = ({
  conversation,
  messages = [],
  currentUser,
  isLoading,
  hasMoreMessages = false,
  isLoadingMore = false,
  onLoadMoreMessages,
  input,
  onInputChange,
  onSendMessage,
  onSendVoice,
  isSending,
  typingUsers = [],
  onStartTyping,
  onStopTyping,
  replyingTo = null,
  onReply,
  onCancelReply,
  onDeleteForMe,
  onRecall,
  pendingUpload = null,
  onRetryUpload,
  onCancelUpload,
  onEdit,
  onToggleReaction,
}) => {
  const scrollRef = useRef(null)
  const isPrependingRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevMessagesLengthRef = useRef(0)
  const { t } = useLanguage()
  const { userTimeZone } = useTimezone()

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

  // Auto-scroll to bottom on new messages/typing, preserve offset on prepending older messages
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

  if (!conversation) {
    return (
      <LoadingSpinner className="flex flex-1 items-center justify-center" />
    )
  }

  // Render message list from grouped items hook
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
          onEdit={onEdit}
          onToggleReaction={onToggleReaction}
          conversationId={conversation?.id}
          isWidget={true}
        />
      )
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* ── Messages List ──────────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-cath-red-700"
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="flex h-full items-center justify-center py-4">
            <EmptyState
              message={
                t?.chat?.noMessagesStart ||
                t?.messages?.noMessages ||
                "No messages yet. Start a conversation!"
              }
              className="py-4"
            />
          </div>
        ) : (
          <>
            <div className="flex-1" />
            {isLoadingMore && (
              <div className="flex items-center justify-center py-2 shrink-0">
                <Loader2 className="h-5 w-5 animate-spin text-cath-red-700" />
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
                    isWidget={true}
                  />
                )
              })}
          </>
        )}
      </div>

      {/* ── Chat Input ─────────────────────────────────── */}
      <div className="border-t border-border">
        <ChatInput
          value={input}
          compact={true}
          onChange={(val) => {
            if (typeof val === "string") {
              onInputChange(val)
            } else {
              onInputChange(val?.target?.value ?? "")
            }
          }}
          onSend={onSendMessage}
          onSendVoice={onSendVoice}
          onStartTyping={onStartTyping}
          onStopTyping={onStopTyping}
          replyingTo={replyingTo}
          onCancelReply={onCancelReply}
          disabled={isSending || isLoading}
          conversationId={conversation?.id}
          isGroup={conversation?.isGroup}
        />
      </div>
    </div>
  )
}

export default ConversationDetail
