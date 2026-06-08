import React, { useRef, useEffect, useState } from "react"
import { ArrowDown } from "lucide-react"
import MessageBubble from "./MessageBubble"

const MessageList = ({ messages, t, emptyText, onReplyTo }) => {
  const scrollRef = useRef(null)
  const prevMessagesLength = useRef(0)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const isNearBottomRef = useRef(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isScrolledNearBottom = scrollHeight - scrollTop - clientHeight < 50
    isNearBottomRef.current = isScrolledNearBottom
    setShowScrollBottom(!isScrolledNearBottom)
  }

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollHeight } = scrollRef.current
      // If user was near bottom before this update, or this is the first render with messages
      if (isNearBottomRef.current || prevMessagesLength.current === 0) {
        scrollRef.current.scrollTop = scrollHeight
      }
      prevMessagesLength.current = messages.length
      checkScroll()
    }
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="relative flex flex-1 flex-col min-h-0 bg-white">
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#606060] shadow-md border border-[#E5E5E5] hover:bg-gray-50 hover:text-[#990011] transition-colors"
        >
          <ArrowDown size={16} />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex flex-1 flex-col overflow-y-auto p-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#990011] [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px] bg-white min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-center text-[#606060]">{emptyText}</p>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <MessageBubble
                  key={msg.id || `msg-${index}`}
                  msg={msg}
                  index={index}
                  t={t}
                  onReplyTo={onReplyTo}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MessageList
