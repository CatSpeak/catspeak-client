import { useRef, useCallback } from "react"
import { Paperclip, Smile, Send, Mic } from "lucide-react"

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
const ChatInput = ({ value, onChange, onSend, disabled = false }) => {
  const textareaRef = useRef(null)
  const hasContent = value.trim().length > 0

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) onSend()
      }
    },
    [hasContent, onSend],
  )

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 120) + "px"
  }, [])

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value)
      handleInput()
    },
    [onChange, handleInput],
  )

  const handleSend = useCallback(() => {
    if (!hasContent) return
    onSend()
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [hasContent, onSend])

  return (
    <div className="px-4 py-3 border-t border-[#E5E5E5] bg-white">
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Input container */}
        <div className="flex-1 flex items-end bg-[#F2F2F2] rounded-2xl px-4 py-2 min-h-[40px] transition-colors focus-within:bg-[#EBEBEB]">
          <textarea
            ref={textareaRef}
            className="chat-textarea flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder-[#9CA0AB]"
            placeholder="Type a message..."
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />
        </div>

        {/* Emoji button */}
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#606060] hover:bg-[#F2F2F2] transition-colors"
          aria-label="Emoji"
        >
          <Smile size={20} />
        </button>

        {/* Send / Mic button */}
        <button
          onClick={handleSend}
          disabled={disabled}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
            hasContent
              ? "bg-[#990011] text-white hover:brightness-90 shadow-sm"
              : "text-[#606060] hover:bg-[#F2F2F2]"
          }`}
          aria-label={hasContent ? "Send message" : "Voice message"}
        >
          {hasContent ? (
            <Send size={17} className="translate-x-[1px]" />
          ) : (
            <Mic size={20} />
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatInput
