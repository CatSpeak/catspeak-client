import { memo } from "react"
import { formatTime } from "@/shared/utils/dateFormatter"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

// Matches strings that contain ONLY 1 to 3 emoji characters (optionally separated by spaces)
const EMOJI_ONLY_REGEX = /^(?:(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\s*(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)){0,2})$/u

const isEmojiOnly = (text) => {
  if (!text) return false
  return EMOJI_ONLY_REGEX.test(text.trim())
}


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
  shouldAnimate = false,
}) => {
  const isEmoji = isEmojiOnly(message.content)

  const bubbleClasses = isEmoji
    ? "bg-transparent text-4xl min-h-0 min-w-0 flex items-center"
    : `${
        isOwn
          ? "rounded-2xl bg-[#990011] text-white"
          : "rounded-2xl bg-[#F2F2F2]"
      } px-4 py-3 min-h-[40px] flex items-center min-w-[60px]`


  // Spacing between groups
  const marginTop = isFirstInGroup ? "mt-3" : "mt-0.5"

  const animationClass = shouldAnimate ? "animate-chat-bubble-in" : ""

  return (
    <div
      className={`${marginTop} flex flex-col gap-1 ${
        isOwn ? "items-end" : "items-start"
      }`}
    >
      {/* Header with Sender Name + Timestamp */}
      {isFirstInGroup && (
        <div
          className={`flex items-baseline gap-1 text-sm ${isOwn ? "" : "pl-[44px]"}`}
        >
          <span className="font-semibold">{isOwn ? "You" : sender?.name}</span>

          <span className="text-xs text-[#606060]">
            {formatTime(message.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`${animationClass} flex ${
          isOwn ? "justify-end origin-bottom-right" : "justify-start origin-bottom-left"
        } items-end gap-2 w-full`}
      >
        {/* Avatar slot for received messages */}
        {!isOwn && (
          <div className="w-9 shrink-0">
            {isLastInGroup && (
              <Avatar
                size={36}
                name={sender?.name}
                src={sender?.avatar}
                className={
                  getParticipantTheme(sender?.id || sender?.name || "")
                    .avatarClass
                }
              />
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={`max-w-[70%] ${bubbleClasses}`}>
          {/* Content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

      </div>
    </div>
  )
}

export default memo(ChatBubble)
