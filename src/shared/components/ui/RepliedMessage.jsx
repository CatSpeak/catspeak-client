import React from "react"
import { X } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

/**
 * RepliedMessage — generic reusable component for displaying a quoted/replied message.
 *
 * Supports two main modes:
 * 1. Bubble mode (default or when onCancel is omitted): Renders a Zalo-style left-bordered quoted block inside a chat bubble.
 * 2. Preview mode (when onCancel is provided): Renders a preview banner with a dismiss (X) button above a chat input.
 *
 * @param {string}   senderName - Sender's name of the message being replied to
 * @param {string}   content    - Content preview of the message being replied to
 * @param {boolean}  isOwn      - Whether the current bubble containing this block belongs to the local user
 * @param {function} onCancel   - Optional cancel handler (enables preview mode with X button)
 * @param {string}   title      - Optional title for preview mode (defaults to "Replying to")
 * @param {string}   className  - Additional CSS classes
 * @param {function} onClick   - Optional click handler (e.g., jump to original message)
 */
const RepliedMessage = ({
  senderName = "Someone",
  content = "",
  isOwn = false,
  onCancel,
  title,
  className = "",
  onClick,
}) => {
  // Input Preview Mode with cancel button
  if (onCancel) {
    return (
      <div
        className={`flex items-center gap-2 pl-3 bg-[#990011]/10 border-l-[3px] border-[#990011] rounded-r-md text-xs ${className}`}
      >
        <div className="flex-1 min-w-0">
          <span className="block font-semibold text-[#990011] mb-1">
            {title || "Replying to"} {senderName}
          </span>
          <p className="m-0 truncate text-[#606060]">{content}</p>
        </div>

        <IconButton
          type="button"
          size="sm"
          variant="transparent"
          onClick={onCancel}
          aria-label="Cancel reply"
        >
          <X />
        </IconButton>
      </div>
    )
  }

  // Quoted block inside Chat Bubble (Zalo Style)
  const colorClasses = isOwn
    ? "border-white/60 bg-white/10 text-white/90"
    : "border-[#990011]/60 bg-[#990011]/10 text-black/80 dark:text-white/80"

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-center border-l-[3px] px-3 h-12 mb-1 rounded-r-md cursor-default ${colorClasses} ${className}`}
    >
      {senderName && (
        <span className="font-semibold text-xs shrink-0 truncate mb-1">
          {senderName}
        </span>
      )}
      <span className="truncate opacity-80 text-xs break-words">{content}</span>
    </div>
  )
}

export default RepliedMessage
