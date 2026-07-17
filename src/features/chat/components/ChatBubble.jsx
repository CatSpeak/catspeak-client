import { memo } from "react"
import { Check, CheckCheck } from "lucide-react"
import { formatTime } from "@/shared/utils/dateFormatter"
import { getUserColor } from "../data/chatMockData"

/**
 * ChatBubble — individual message bubble.
 *
 * Supports 1:1 and group chats with message grouping,
 * avatars, sender names, timestamps, and read receipts.
 *
 * @param {object}  message       - Message object { id, senderId, content, timestamp, status }
 * @param {boolean} isOwn         - Whether the message was sent by the current user
 * @param {boolean} isFirstInGroup - First consecutive message from this sender
 * @param {boolean} isLastInGroup  - Last consecutive message from this sender
 * @param {object}  sender        - Sender user object
 * @param {boolean} isGroupChat   - Whether this is a group conversation
 */
const ChatBubble = ({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
  sender,
  isGroupChat,
}) => {
  const initial = sender?.name?.charAt(0)?.toUpperCase() || "?"

  // Bubble corner radius — mimics Messenger-style connected bubbles
  const ownCorners = isLastInGroup
    ? "rounded-2xl rounded-br-md"
    : "rounded-2xl rounded-r-md"

  const otherCorners = isLastInGroup
    ? "rounded-2xl rounded-bl-md"
    : "rounded-2xl rounded-l-md"

  const bubbleClasses = isOwn
    ? `${ownCorners} bg-[#990011] text-white`
    : `${otherCorners} bg-[#F2F2F2] text-[#1A1A1A]`

  // Spacing between groups
  const marginTop = isFirstInGroup ? "mt-3" : "mt-0.5"

  return (
    <div className={`chat-bubble-enter ${marginTop}`}>
      <div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end gap-2`}
      >
        {/* Avatar slot for received messages */}
        {!isOwn && (
          <div className="w-8 shrink-0">
            {isLastInGroup && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: getUserColor(sender?.id || "") }}
              >
                {initial}
              </div>
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={`max-w-[70%] min-w-[60px] ${bubbleClasses} px-3 py-2`}>
          {/* Sender name in group chats */}
          {isGroupChat && !isOwn && isFirstInGroup && (
            <p
              className="text-xs font-semibold mb-0.5"
              style={{ color: getUserColor(sender?.id || "") }}
            >
              {sender?.name}
            </p>
          )}

          {/* Content */}
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Timestamp + read receipts */}
          <div
            className={`flex items-center gap-1 mt-1 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`text-[10px] leading-none ${
                isOwn ? "text-white/60" : "text-[#9CA0AB]"
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
            {isOwn && (
              <span className="flex items-center">
                {message.status === "read" ? (
                  <CheckCheck
                    size={13}
                    className="text-white/70"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Check
                    size={13}
                    className="text-white/50"
                    strokeWidth={2.5}
                  />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(ChatBubble)
