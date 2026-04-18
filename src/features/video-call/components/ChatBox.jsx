import React, { useState, useRef, useEffect, useCallback } from "react"
import { Send } from "lucide-react"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { colors } from "@/shared/utils/colors"
import { formatTime } from "@/shared/utils/dateFormatter"
import TextInput from "@/shared/components/ui/inputs/TextInput"

const ChatBox = ({
  messages,
  currentUser,
  onSendMessage,
  isConnected,
  className = "",
  hideTitle,
}) => {
  const [message, setMessage] = useState("")
  const scrollContainerRef = useRef(null)
  const sendingRef = useRef(false)
  const { t } = useLanguage()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(() => {
    // Guard against rapid double-fires (mobile keyboards)
    if (sendingRef.current) return
    const text = message.trim()
    if (!text) return

    sendingRef.current = true
    onSendMessage(text)
    setMessage("")

    // Reset guard after a short delay
    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [message, onSendMessage])

  const handleKeyDown = (e) => {
    // Ignore Enter during IME composition (e.g. CJK input, some mobile keyboards)
    if (e.nativeEvent?.isComposing || e.keyCode === 229) return
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <div className={`flex h-full flex-col bg-white ${className}`}>
      {!hideTitle && (
        <div className="border-b border-[#C6C6C6] px-4 py-3">
          <h3 className="text-black text-sm font-bold m-0">
            {t.rooms.chatBox.title}
          </h3>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-[#C6C6C6] scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-center text-[#7A7574] m-0">
              {t.rooms.chatBox.empty}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1" />
            <div className="space-y-2">
              {messages.map((msg, index) => {
                // LiveKit useChat message format:
                // { id, timestamp, message, from?: Participant }
                const isMe = msg.from?.isLocal ?? false
                const senderName = isMe
                  ? t.rooms.chatBox.you
                  : msg.from?.name || msg.from?.identity || `User`

                const isSystem = msg.from?.isSystem ?? false

                return (
                  <motion.div
                    key={msg.id || `msg-${index}`}
                    initial={{ opacity: 0, x: isMe ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1 max-w-full">
                      <span
                        className="text-xs font-bold truncate shrink"
                        title={senderName}
                      >
                        {senderName}
                      </span>
                      <span className="text-xs text-[#606060] shrink-0">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words ${
                        isMe
                          ? "bg-[#990011] text-white"
                          : isSystem 
                            ? "bg-[#FFE0B2] text-black border border-[#FF9800]"
                            : "bg-[#F0F0F0] text-black"
                      }`}
                    >
                      <p className="m-0">{msg.message}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#C6C6C6] p-4 flex items-center gap-2"
      >
        <TextInput
          disabled={!isConnected}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? t.rooms.chatBox.inputPlaceholder
              : t.rooms.chatBox.connectingPlaceholder
          }
          containerClassName="flex-1 min-w-0"
          className="disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!isConnected || !message.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-colors disabled:bg-black/10 disabled:text-black/25 disabled:cursor-not-allowed hover:opacity-90"
          style={
            isConnected && message.trim()
              ? { backgroundColor: colors.red[700], color: "white" }
              : {}
          }
        >
          <Send className="ml-[-2px] mt-[1px]" />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
