import React, { useState, useRef, useCallback } from "react"
import { Send, Smile, Sparkles, Plus, X, Check } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { AI_MODES, getAiModeConfig } from "@/features/video-call/config/aiModes"
import Switch from "@/shared/components/ui/inputs/Switch"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import MenuList from "@/shared/components/ui/MenuList"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
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
  const textareaRef = useRef(null)
  const { t } = useLanguage()
  const { aiMode, setAiMode } = useGlobalVideoCall()
  const { sendAiMessage, isBlocked: isAiBlocked } = useAiSend()
  const { insertEmoji, addRecent } = useEmojiPicker()

  const activeAmenityConfig = getAiModeConfig(aiMode)
  const ActiveAmenityIcon = activeAmenityConfig?.icon

  const amenitiesMenuPopover = (close) => (
    <MenuList className="w-[260px] p-1.5 flex flex-col gap-1">
      {AI_MODES.map((mode) => {
        const Icon = mode.icon
        const isSelected = aiMode === mode.id
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              setAiMode(isSelected ? "general" : mode.id)
              close()
            }}
            className={`w-full flex items-start justify-between p-2 rounded-lg text-left transition-all ${
              isSelected
                ? "bg-purple-50 text-purple-900 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Icon size={16} className={`mt-0.5 ${isSelected ? "text-purple-600" : "text-gray-400"}`} />
              <div>
                <div className="text-xs font-semibold">{mode.label}</div>
                <div className="text-[10px] text-gray-400 font-normal leading-tight mt-0.5">
                  {mode.description}
                </div>
              </div>
            </div>
            {isSelected && <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />}
          </button>
        )
      })}
    </MenuList>
  )

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

      {/* Active Amenity Tag Bar above input box (only when an amenity is selected) */}
      {isAiInput && activeAmenityConfig && (
        <div className="flex items-center gap-1.5 px-1 py-0.5 text-xs">
          <div className="group relative flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200 transition-all shadow-xs">
            <ActiveAmenityIcon size={12} className="text-purple-600 shrink-0" />
            <span>{activeAmenityConfig.label}</span>
            <button
              type="button"
              title="Remove amenity tag"
              onClick={(e) => {
                e.stopPropagation()
                setAiMode("general")
              }}
              className="max-w-0 opacity-0 overflow-hidden group-hover:max-w-6 group-hover:opacity-100 group-hover:ml-1 transition-all duration-200 p-0.5 rounded-full hover:bg-purple-200/80 text-purple-700 flex items-center justify-center cursor-pointer shrink-0"
            >
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Unified Input Box */}
      <div
        onClick={() => textareaRef.current?.focus()}
        className={`w-full flex items-center min-h-[56px] py-1.5 border focus-within:border-cath-red-700 transition-all cursor-text rounded-[28px] pl-3 pr-1 gap-2 ${
          isAiInput
            ? "border-red-200 bg-gradient-to-r from-red-50/40 via-white to-red-50/20 shadow-sm"
            : "border-[#E5E5E5] bg-gray-50/60"
        }`}
      >
        {/* Left AI Controls: Sparkles + Switch + (+) Button when no amenity selected */}
        {isAiInput && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkles size={16} className="text-cath-red-700 shrink-0" />
            <div className="origin-left flex items-center justify-center">
              <Switch
                checked={isPrivateAi}
                onChange={(e) => setIsPrivateAi(e.target.checked)}
                colorClass="peer-checked:bg-red-700"
              />
            </div>

            {/* When NO amenity selected → (+) Add Amenity button INSIDE input bar */}
            {!activeAmenityConfig && (
              <Popover
                trigger={
                  <button
                    type="button"
                    title="Add AI amenity or mode"
                    className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-all flex items-center justify-center cursor-pointer shadow-xs ml-0.5"
                  >
                    <Plus size={13} />
                  </button>
                }
                content={amenitiesMenuPopover}
                placement="top-start"
              />
            )}
          </div>
        )}

        {/* Text Input Area */}
        <div className="flex-1 flex items-center min-w-0">
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
          className="flex items-center gap-0.5 shrink-0"
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
