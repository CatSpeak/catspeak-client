import { useState, useRef, useCallback } from "react"
import { Paperclip, Smile, Send } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"
import RepliedMessage from "@/shared/components/ui/RepliedMessage"
import ChatInputPreview from "./ChatInputPreview"
import useTypingDebounce from "../hooks/useTypingDebounce"

/**
 * ChatInput — message input bar with auto-resizing textarea, file attachments, and reply preview.
 */
const ChatInput = ({
  value = "",
  onChange,
  onSend,
  onStartTyping,
  onStopTyping,
  replyingTo = null,
  onCancelReply,
  disabled = false,
  showLeftIcon = true,
  showRightIcons = true,
}) => {
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isMultiline, setIsMultiline] = useState(false)

  const { insertEmoji, addRecent } = useEmojiPicker()
  const { handleTypingActivity, stopTypingImmediately } = useTypingDebounce({
    onStartTyping,
    onStopTyping,
  })

  const hasContent = value.trim().length > 0 || selectedFile !== null

  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === "") {
      setIsMultiline(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file)
      setFilePreviewUrl(url)
    } else {
      setFilePreviewUrl(null)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSend = useCallback(() => {
    if (!hasContent) return
    stopTypingImmediately()
    onSend(value.trim(), selectedFile)
    clearSelectedFile()
  }, [hasContent, value, selectedFile, onSend, stopTypingImmediately])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) {
          handleSend()
        }
      }
    },
    [hasContent, handleSend],
  )

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      onChange(val)

      if (val.trim().length > 0) {
        handleTypingActivity()
      } else {
        stopTypingImmediately()
      }

      if (!isMultiline) {
        const sh = e.target.scrollHeight
        if (sh > 36 || val.includes("\n")) {
          setIsMultiline(true)
        }
      }
    },
    [onChange, isMultiline, handleTypingActivity, stopTypingImmediately],
  )

  return (
    <div className="p-4 bg-transparent flex flex-col gap-4">
      {/* Replying banner */}
      {replyingTo && (
        <RepliedMessage
          senderName={
            replyingTo.sender?.name || replyingTo.sender?.username || "Someone"
          }
          content={replyingTo.content || replyingTo.messageContent || ""}
          onCancel={onCancelReply}
        />
      )}

      {/* Selected Attachment preview */}
      <ChatInputPreview
        selectedFile={selectedFile}
        filePreviewUrl={filePreviewUrl}
        onClear={clearSelectedFile}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,video/*,.pdf,.doc,.docx,.zip"
      />

      <div
        onClick={() => textareaRef.current?.focus()}
        className={`w-full grid grid-cols-[auto_1fr_auto] border border-[#e5e5e5] focus-within:border-cath-red-700 transition-colors bg-white cursor-text rounded-[28px] ${
          isMultiline
            ? "pb-[3px] pt-3 min-h-[110px] gap-y-2"
            : "items-center h-14"
        } ${showLeftIcon ? "pl-2" : "pl-6"} ${showRightIcons ? "pr-1" : "pr-6"}`}
      >
        {/* Attachment button */}
        {showLeftIcon && (
          <IconButton
            variant="ghost"
            aria-label="Attach file"
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            disabled={disabled}
            className={`shrink-0 ${
              isMultiline
                ? "col-start-1 row-start-2"
                : "col-start-1 row-start-1"
            }`}
          >
            <Paperclip />
          </IconButton>
        )}

        {/* Textarea Wrapper */}
        <div
          className={`h-full ${
            isMultiline
              ? "col-span-3 col-start-1 row-start-1 px-3"
              : "col-start-2 row-start-1 flex items-center px-1"
          }`}
        >
          <textarea
            ref={textareaRef}
            className={`bg-transparent placeholder-[#606060] resize-none focus:outline-none w-full ${
              isMultiline
                ? "overflow-y-auto pr-4 pt-1"
                : "overflow-y-hidden py-1"
            }`}
            placeholder="Type a message..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={isMultiline ? 5 : 1}
          />
        </div>

        {/* Right buttons */}
        {showRightIcons && (
          <div
            className={`flex items-center h-12 ${
              isMultiline
                ? "col-start-3 row-start-2"
                : "col-start-3 row-start-1"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Emoji button */}
            <Popover
              placement="top-right"
              trigger={
                <IconButton variant="ghost" aria-label="Emoji" type="button">
                  <Smile />
                </IconButton>
              }
              content={(close) => (
                <EmojiPickerWrapper
                  onSelect={(emoji) => {
                    insertEmoji(emoji, textareaRef, value, onChange)
                    addRecent(emoji)
                    close()
                  }}
                />
              )}
            />

            {/* Send button */}
            <IconButton
              onClick={handleSend}
              disabled={disabled || !hasContent}
              variant={hasContent ? "primary" : "ghost"}
              aria-label="Send message"
            >
              <Send className="-translate-x-[1px] translate-y-[1px]" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInput
