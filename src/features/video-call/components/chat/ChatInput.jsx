import React, { useState, useRef, useCallback } from "react"
import { Send, X } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { colors } from "@/shared/utils/colors"
import TextInput from "@/shared/components/ui/inputs/TextInput"
import Switch from "@/shared/components/ui/inputs/Switch"
import { useAiSend } from "@/features/video-call/hooks/useAiSend"

const ChatInput = ({
  onSendMessage,
  isConnected,
  onAiMessageSent,
  isAiInput,
  replyTarget,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("")
  const [isPrivateAi, setIsPrivateAi] = useState(false)
  const sendingRef = useRef(false)
  const { t } = useLanguage()
  const { sendAiMessage, isBlocked: isAiBlocked } = useAiSend()

  const handleSend = useCallback(async () => {
    if (sendingRef.current) return
    const text = message.trim()
    if (!text) return

    sendingRef.current = true

    if (isAiInput) {
      if (isAiBlocked) {
        sendingRef.current = false
        return
      }

      await sendAiMessage(text, { isPrivateAi, replyTarget })

      setMessage("")
      if (onCancelReply) onCancelReply()
      if (onAiMessageSent) onAiMessageSent()

      requestAnimationFrame(() => {
        sendingRef.current = false
      })
      return
    }

    // Normal chat message
    onSendMessage(text)
    setMessage("")

    requestAnimationFrame(() => {
      sendingRef.current = false
    })
  }, [
    message,
    onSendMessage,
    sendAiMessage,
    isAiBlocked,
    onAiMessageSent,
    onCancelReply,
    isAiInput,
    isPrivateAi,
    replyTarget,
  ])

  const handleKeyDown = (e) => {
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
    <div className="flex flex-col relative shrink-0 bg-white">
      {/* Reply preview banner */}
      {replyTarget && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-t border-amber-200 text-xs">
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-amber-800">
              {t.rooms?.chatBox?.replyingTo || "Replying to"}{" "}
              {replyTarget.from?.name || "Cat Speak"}
            </span>
            <p className="m-0 truncate text-amber-700 opacity-80">
              {replyTarget.message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 p-0.5 rounded hover:bg-amber-200/50 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className={`py-2 px-3 flex items-center gap-2 relative z-20 ${
          !isAiInput ? "border-t border-[#E5E5E5]" : ""
        }`}
      >
        <TextInput
          disabled={!isConnected}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isConnected
              ? isAiInput
                ? isPrivateAi
                  ? t.rooms?.chatBox?.privateAiPlaceholder ||
                    "Ask AI (Private)"
                  : t.rooms?.chatBox?.publicAiPlaceholder ||
                    "Ask AI (Public)"
                : t.rooms?.chatBox?.inputPlaceholder || "Type a message..."
              : t.rooms?.chatBox?.connectingPlaceholder || "Connecting..."
          }
          containerClassName="flex-1 min-w-0"
          className="disabled:opacity-50"
          leftContent={
            isAiInput ? (
              <div
                title={isPrivateAi ? "Private AI Prompt" : "Public AI Prompt"}
                className="flex items-center justify-center"
              >
                <Switch
                  checked={isPrivateAi}
                  onChange={() => setIsPrivateAi(!isPrivateAi)}
                  colorClass="peer-checked:bg-green-500"
                />
              </div>
            ) : undefined
          }
          leftContentWidthClass="!pl-[3.75rem]"
          rightContent={
            <button
              type="submit"
              disabled={!isConnected || !message.trim()}
              className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors disabled:bg-black/10 disabled:text-black/25 disabled:cursor-not-allowed hover:opacity-90"
              style={
                isConnected && message.trim()
                  ? { backgroundColor: colors.red[700], color: "white" }
                  : {}
              }
            >
              <Send size={16} className="ml-[-1px] mt-[1px]" />
            </button>
          }
        />
      </form>
    </div>
  )
}

export default ChatInput
