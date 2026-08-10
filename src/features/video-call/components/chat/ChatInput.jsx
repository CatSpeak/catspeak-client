import React, { useState, useRef, useCallback } from "react"
import { Send, Smile, Sparkles } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import Switch from "@/shared/components/ui/inputs/Switch"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import { toast } from "react-hot-toast"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { useAiSend } from "@/features/video-call/hooks/useAiSend"
import {
  getRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"

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
  const textareaRef = useRef(null)
  const { t } = useLanguage()
  const { sendAiMessage, isBlocked: isAiBlocked } = useAiSend()
  const { insertEmoji, addRecent } = useEmojiPicker()
  const { room, id: roomIdFromContext, user, isHost: isHostFromContext } = useGlobalVideoCall()
  const currentRoomId = room?.id || roomIdFromContext
  const isHost = isHostFromContext || isRoomHost(room, user?.accountId)

  const [isMemberPrivateAiAllowed, setIsMemberPrivateAiAllowed] = React.useState(() => {
    return getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
  })

  React.useEffect(() => {
    const handlePrivateAiChange = () => {
      const allowed = getRoomSetting(currentRoomId, ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI)
      setIsMemberPrivateAiAllowed(allowed)
      if (!isHost && !allowed) {
        setIsPrivateAi(false)
      }
    }
    handlePrivateAiChange()
    window.addEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    return () => {
      window.removeEventListener("catspeak_member_private_ai_allowed_changed", handlePrivateAiChange)
    }
  }, [isHost, currentRoomId])

  const hasContent = message.trim().length > 0

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

      if (!isHost && isPrivateAi && !isMemberPrivateAiAllowed) {
        toast.error(
          t.rooms?.general?.privateAiDisabledByHost ||
            "Host đã tắt quyền sử dụng AI Chat riêng tư đối với thành viên."
        )
        sendingRef.current = false
        return
      }

      setMessage("")
      if (onCancelReply) onCancelReply()
      if (onAiMessageSent) onAiMessageSent()

      await sendAiMessage(text, { isPrivateAi, replyTarget })

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

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (hasContent && isConnected && (!isAiInput || !isAiBlocked)) {
        handleSend()
      }
    }
  }

  const placeholderText = !isConnected
    ? t.rooms?.chatBox?.connectingPlaceholder || "Connecting..."
    : isAiInput
      ? isAiBlocked
        ? t.rooms?.chatBox?.aiGeneratingPlaceholder || "AI is typing..."
        : replyTarget?.from?.isSystem
          ? "Reply to system..."
          : isPrivateAi
            ? t.rooms?.chatBox?.privateAiPlaceholder || "Ask AI (Private)"
            : t.rooms?.chatBox?.publicAiPlaceholder || "Ask AI (Public)"
      : t.rooms?.chatBox?.inputPlaceholder || "Type a message..."

  const isInputDisabled = !isConnected || (isAiInput && isAiBlocked)

  return (
    <div className="p-3 bg-white flex flex-col gap-2 relative shrink-0 border-t border-[#E5E5E5]">
      {/* Replying banner */}
      {replyTarget && (
        <RepliedMessage
          senderName={replyTarget.from?.name || "Cat Speak"}
          content={replyTarget.message}
          onCancel={onCancelReply}
        />
      )}

      {/* Unified Input Box */}
      <div
        onClick={() => textareaRef.current?.focus()}
        className={`w-full grid grid-cols-[auto_1fr_auto] items-center h-14 border focus-within:border-cath-red-700 transition-all cursor-text rounded-[28px] pl-3 pr-1 ${
          isAiInput
            ? "border-red-200 bg-gradient-to-r from-red-50/40 via-white to-red-50/20 shadow-sm"
            : "border-[#E5E5E5] bg-gray-50/60"
        }`}
      >
        {/* Left AI Switch Control */}
        {isAiInput && (
          <div
            className="flex items-center gap-1.5 h-full pr-1 shrink-0 col-start-1 row-start-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkles size={16} className="text-cath-red-700 shrink-0" />
            <div className="origin-left flex items-center justify-center">
              <Switch
                checked={isPrivateAi}
                disabled={!isHost && !isMemberPrivateAiAllowed}
                onChange={(e) => {
                  if (!isHost && !isMemberPrivateAiAllowed && e.target.checked) {
                    toast.error(
                      t.rooms?.general?.privateAiDisabledByHost ||
                        "Host đã tắt quyền sử dụng AI Chat riêng tư đối với thành viên."
                    )
                    return
                  }
                  setIsPrivateAi(e.target.checked)
                }}
                colorClass="peer-checked:bg-red-700"
              />
            </div>
          </div>
        )}

        {/* Text Input Area */}
        <div className="h-full flex items-center px-1 min-w-0 col-start-2 row-start-1">
          <input
            ref={textareaRef}
            type="text"
            className="bg-transparent placeholder-[#606060] focus:outline-none w-full text-base disabled:opacity-50"
            placeholder={placeholderText}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
          />
        </div>

        {/* Right Actions: Emoji Picker + Send Button */}
        <div
          className="flex items-center gap-0.5 shrink-0 col-start-3 row-start-1"
          onClick={(e) => e.stopPropagation()}
        >
          {!isAiInput && (
            <Popover
              placement="top-right"
              trigger={
                <IconButton
                  variant="ghost"
                  aria-label="Emoji"
                  type="button"
                  disabled={isInputDisabled}
                >
                  <Smile size={18} />
                </IconButton>
              }
              content={() => (
                <EmojiPickerWrapper
                  onSelect={(emoji) => {
                    insertEmoji(emoji, textareaRef, message, setMessage)
                    addRecent(emoji)
                  }}
                />
              )}
            />
          )}

          <IconButton
            onClick={handleSend}
            disabled={isInputDisabled || !hasContent}
            variant={hasContent ? "primary" : "ghost"}
            aria-label="Send message"
          >
            <Send size={18} className="-translate-x-[1px] translate-y-[1px]" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default ChatInput
