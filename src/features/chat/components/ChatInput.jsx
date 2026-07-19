import { useState, useRef, useCallback } from "react"
import { Paperclip, Smile, Send } from "lucide-react"
import { IconButton } from "@/shared/components/ui/buttons"
import Popover from "@/shared/components/ui/Popover"
import EmojiPickerWrapper from "@/shared/components/ui/EmojiPickerWrapper"
import useEmojiPicker from "@/shared/hooks/useEmojiPicker"

/**
 * ChatInput — message input bar with auto-resizing textarea.
 *
 * Features:
 * - Auto-expanding textarea (up to 120px)
 * - Attachment, emoji, and send buttons
 * - Enter to send, Shift+Enter for newline
 * - Send button transforms to mic when empty (visual only)
 *
 * @param {string}   value    - Current input value
 * @param {function} onChange - Input change handler
 * @param {function} onSend  - Send handler
 * @param {boolean}  disabled - Whether input is disabled
 */
const ChatInput = ({
  value,
  onChange,
  onSend,
  disabled = false,
  showLeftIcon = false, // temporarily default to false since image sending is not supported in chat
  showRightIcons = true,
}) => {
  const textareaRef = useRef(null)
  const hasContent = value.trim().length > 0
  const [isMultiline, setIsMultiline] = useState(false)
  const { insertEmoji, addRecent } = useEmojiPicker()

  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    if (value === "") {
      setIsMultiline(false)
    }
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) onSend()
      }
    },
    [hasContent, onSend],
  )

  const handleChange = useCallback(
    (e) => {
      const val = e.target.value
      onChange(val)

      if (!isMultiline) {
        const sh = e.target.scrollHeight
        if (sh > 36 || val.includes("\n")) {
          setIsMultiline(true)
        }
      }
    },
    [onChange, isMultiline],
  )

  const handleSend = useCallback(() => {
    if (!hasContent) return
    onSend()
  }, [hasContent, onSend])

  return (
    <div className="px-4 py-2 bg-transparent">
      <div
        onClick={() => textareaRef.current?.focus()}
        className={`w-full grid grid-cols-[auto_1fr_auto] border border-[#e5e5e5] focus-within:border-cath-red-700 transition-colors bg-white cursor-text rounded-[28px] ${
          isMultiline
            ? "pb-[3px] pt-3 min-h-[110px] gap-y-2"
            : "items-center h-14"
        } ${showLeftIcon ? "pl-1" : "pl-6"} ${showRightIcons ? "pr-1" : "pr-6"}`}
      >
        {/* Attachment button */}
        {showLeftIcon && (
          <IconButton
            variant="ghost"
            aria-label="Attach file"
            onClick={(e) => {
              e.stopPropagation()
            }}
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
