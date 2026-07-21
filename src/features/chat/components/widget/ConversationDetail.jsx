import React, { useEffect, useRef } from "react"
import ChatBubble from "../ChatBubble"
import ChatInput from "../ChatInput"
import DateSeparator from "../DateSeparator"
import SystemMessage from "../SystemMessage"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGroupedMessages } from "../../hooks/useGroupedMessages"

const ConversationDetail = ({
  conversation,
  messages = [],
  currentUser,
  isLoading,
  input,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isSending,
  typingUsers = [],
  onStartTyping,
  onStopTyping,
}) => {
  const scrollRef = useRef(null)
  const { t } = useLanguage()

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
        />
      )
    })
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* ── Messages List ──────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-cath-red-700"
      >
        {isLoading ? (
          <LoadingSpinner className="flex items-center justify-center py-4" />
        ) : groupedItems.length === 0 ? (
          <EmptyState
            message={
              t?.messages?.noMessages ||
              "No messages yet. Start a conversation!"
            }
            className="py-4"
          />
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

      {/* ── Chat Input ─────────────────────────────────── */}
      <div className="border-t border-[#e5e5e5]">
        <ChatInput
          value={input}
          onChange={(val) => {
            if (typeof val === "string") {
              onInputChange({ target: { value: val } })
            } else {
              onInputChange(val)
            }
          }}
          onSend={onSendMessage}
          onStartTyping={onStartTyping}
          onStopTyping={onStopTyping}
          disabled={isSending || isLoading}
        />
      </div>
    </div>
  )
}

export default ConversationDetail
