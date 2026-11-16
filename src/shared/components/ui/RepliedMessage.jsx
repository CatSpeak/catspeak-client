import React from "react"
import { X, Reply } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const normalizeAiMention = (str) =>
  (str || "").replace(
    /^((@(AIPublic|AIPrivate|public-ai|private-ai|AISystem))\s*)+/gi,
    (m) => `${m.trim().split(/\s+/)[0]} `
  )

/**
 * RepliedMessage — generic reusable component for displaying a quoted/replied message.
 *
 * Supports two main modes:
 * 1. Bubble mode (default or when onCancel is omitted): Renders a quoted block inside or above a chat bubble.
 * 2. Preview mode (when onCancel is provided): Renders a preview banner with a dismiss (X) button above a chat input.
 *
 * @param {string}   senderName - Sender's name of the message being replied to
 * @param {string}   content    - Content preview of the message being replied to
 * @param {boolean}  isOwn      - Whether the current bubble containing this block belongs to the local user
 * @param {boolean}  standalone - Whether the quote sits outside a colored bubble (e.g. above voice/media)
 * @param {function} onCancel   - Optional cancel handler (enables preview mode with X button)
 * @param {string}   title      - Optional title for preview mode (defaults to "Replying to")
 * @param {string}   className  - Additional CSS classes
 * @param {function} onClick   - Optional click handler (e.g., jump to original message)
 */
const RepliedMessage = ({
  senderName = "Someone",
  content = "",
  isOwn = false,
  standalone = false,
  variant = "default",
  onCancel,
  title,
  className = "",
  onClick,
}) => {
  // Input Preview Mode with cancel button
  if (onCancel) {
    return (
      <div
        className={`flex items-center justify-between gap-2 h-[72px] pl-4 pr-1 bg-primaryBg dark:bg-[#272727] rounded-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${className}`}
      >
        <div className="flex-1 min-w-0">
          <span className="truncate text-base">
            {title || "Replying to"} {senderName}
          </span>

          <p className="text-sm truncate text-neutral-600 dark:text-[#AAAAAA]">
            {normalizeAiMention(content).trim()}
          </p>
        </div>

        <IconButton
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
          aria-label="Cancel reply"
          className="shrink-0"
        >
          <X size={16} />
        </IconButton>
      </div>
    )
  }

  // Quoted block inside Chat Bubble
  const isLight = variant === "light"
  const isDarkBubble = isOwn && !isLight

  let colorClasses
  let layoutClasses
  if (standalone) {
    layoutClasses = "w-full min-w-[200px] max-w-[340px] rounded-xl shadow-xs"
    colorClasses = isDarkBubble
      ? "border-l-[3px] border-white/90 bg-[#990011] text-white"
      : "border-l-[3px] border-gray-400 dark:border-neutral-500 bg-primaryBg dark:bg-[#272727] text-neutral-900 dark:text-neutral-100"
  } else {
    layoutClasses = "w-full rounded-r-lg"
    colorClasses = isDarkBubble
      ? "border-l-[3px] border-white/70 bg-white/15 text-white"
      : "border-l-[3px] border-gray-400 dark:border-neutral-500 bg-black/5 dark:bg-white/10 text-neutral-900 dark:text-neutral-100"
  }

  return (
    <div
      onClick={onClick}
      className={`flex flex-col justify-center px-3 py-1.5 min-h-[38px] mb-1.5 transition-opacity ${layoutClasses} ${
        onClick
          ? "cursor-pointer hover:opacity-90 active:opacity-75"
          : "cursor-default"
      } ${colorClasses} ${className}`}
    >
      {senderName && (
        <span
          className={`font-semibold text-xs shrink-0 truncate leading-tight ${
            isDarkBubble ? "text-white" : "text-gray-800 dark:text-neutral-200"
          }`}
        >
          {senderName}
        </span>
      )}
      {content && (
        <span
          className={`truncate text-xs break-words leading-tight mt-0.5 ${
            isDarkBubble
              ? "text-white/85"
              : "text-neutral-600 dark:text-[#AAAAAA]"
          }`}
        >
          {normalizeAiMention(content).trim()}
        </span>
      )}
    </div>
  )
}

export default RepliedMessage
