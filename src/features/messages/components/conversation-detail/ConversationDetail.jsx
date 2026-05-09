import React, { useEffect, useRef } from "react"
import { FiSend, FiPlus, FiPaperclip, FiImage } from "react-icons/fi"
import MessageBubble from "./MessageBubble"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import EmptyState from "@/shared/components/ui/indicators/EmptyState"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import { useLanguage } from "@/shared/context/LanguageContext"

const ConversationDetail = ({
  conversation,
  messages,
  isLoading,
  input,
  onInputChange,
  onSendMessage,
  onKeyPress,
  isSending,
}) => {
  const scrollContainerRef = useRef(null)
  const { t } = useLanguage()
  const messageList = messages || []
  const friendAccountId = conversation?.friend?.accountId

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!conversation) {
    return (
      <LoadingSpinner className="flex flex-1 items-center justify-center" />
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Message List */}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-3 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-[#990011]"
      >
        {isLoading ? (
          <LoadingSpinner className="flex items-center justify-center py-4" />
        ) : messageList.length === 0 ? (
          <EmptyState
            message={
              t.messages.noMessages ||
              "Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!"
            }
            className="py-4"
          />
        ) : (
          <>
            {/* Spacer pushes messages to the bottom when there are few messages */}
            <div className="flex-1" />
            <div className="space-y-1">
              {messageList.map((msg, idx) => {
                const isMyMessage = msg.sender.accountId !== friendAccountId
                return (
                  <MessageBubble
                    key={idx}
                    message={msg}
                    isMyMessage={isMyMessage}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="flex items-center gap-2 border-t px-3 py-2">
        {/* <PillButton
          variant="outline"
          className="h-10 w-10 !min-w-0 !px-0"
          aria-label={t.messages.add}
        >
          <FiPlus className="h-5 w-5" />
        </PillButton>
        <PillButton
          variant="outline"
          className="h-10 w-10 !min-w-0 !px-0"
          aria-label={t.messages.attach}
        >
          <FiPaperclip className="h-5 w-5" />
        </PillButton>
        <PillButton
          variant="outline"
          className="h-10 w-10 !min-w-0 !px-0"
          aria-label={t.messages.image}
        >
          <FiImage className="h-5 w-5" />
        </PillButton> */}
        <TextInput
          value={input}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          placeholder={t.messages.placeholder}
          disabled={isSending}
          containerClassName="flex-1"
        />
        <PillButton
          onClick={onSendMessage}
          disabled={isSending || !input.trim()}
          className="h-10 w-10 !min-w-0 !px-0"
          aria-label={t.messages.send}
        >
          <FiSend className="h-5 w-5" />
        </PillButton>
      </div>
    </div>
  )
}

export default ConversationDetail
