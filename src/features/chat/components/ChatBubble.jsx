import { memo } from "react"
import { Check } from "lucide-react"
import { formatTime } from "@/shared/utils/dateFormatter"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"

// Matches strings that contain ONLY 1 to 3 emoji characters (optionally separated by spaces)
const EMOJI_ONLY_REGEX =
  /^(?:(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)(?:\s*(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F)){0,2})$/u

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
 * @param {object}  message       - Message object { id, senderId, content, timestamp, status, isRead, readByAccountIds }
 * @param {boolean} isOwn         - Whether the message was sent by the current user
 * @param {boolean} isFirstInGroup - First consecutive message from this sender
 * @param {boolean} isLastInGroup  - Last consecutive message from this sender
 * @param {object}  sender        - Sender user object
 * @param {boolean} isGroupChat   - Whether this is a group conversation
 * @param {array}   readByUsers   - List of user objects who have read this message
 */
const ChatBubble = ({
  message,
  isOwn,
  isFirstInGroup,
  isLastInGroup,
  isLastMessageInChat = false,
  sender,
  isTyping = false,
  shouldAnimate = false,
  readByUsers = [],
}) => {
  if (isTyping) {
    const avatarSrc = sender?.avatar || sender?.avatarImageUrl
    const name = sender?.username || sender?.name || "Someone"

    return (
      <div className="mt-3 flex flex-col gap-1 items-start">
        <div className="flex items-baseline gap-1 text-sm pl-[48px]">
          <span className="font-semibold">{name}</span>
        </div>
        <div className="flex items-end gap-2 w-full justify-start">
          <div className="w-10 shrink-0">
            <Avatar
              size={40}
              name={name}
              src={avatarSrc}
              className={
                getParticipantTheme(sender?.id || sender?.accountId || name)
                  .avatarClass
              }
            />
          </div>
          <div className="rounded-2xl bg-[#F2F2F2] dark:bg-zinc-800 px-4 py-3 min-h-[40px] flex items-center gap-1.5 shadow-xs">
            <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-[6px] h-[6px] bg-[#606060] rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    )
  }

  // Fallback for System messages if passed directly
  if (message?.messageType?.toLowerCase() === "system") {
    return (
      <div className="flex justify-center my-3 px-4 w-full">
        <span className="bg-[#E5E5E5]/60 text-[#606060] dark:bg-zinc-800 dark:text-zinc-400 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-xs text-center border border-border/40 max-w-[85%] break-words">
          {message.content}
        </span>
      </div>
    )
  }

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
  const avatarSrc = sender?.avatar || sender?.avatarImageUrl

  const readers = Array.isArray(readByUsers) ? readByUsers : []
  const hasBeenSeen =
    readers.length > 0 ||
    message?.isRead ||
    (Array.isArray(message?.readByAccountIds) &&
      message.readByAccountIds.length > 0) ||
    message?.status === "read"

  return (
    <div
      className={`${marginTop} flex flex-col gap-1 ${
        isOwn ? "items-end" : "items-start"
      }`}
    >
      {/* Header with Sender Name + Timestamp */}
      {isFirstInGroup && (
        <div
          className={`flex items-baseline gap-1 text-sm ${isOwn ? "" : "pl-[48px]"}`}
        >
          <span className="font-semibold">
            {isOwn ? "You" : sender?.name || sender?.username}
          </span>

          <span className="text-xs text-[#606060]">
            {formatTime(message.timestamp)}
          </span>
        </div>
      )}

      <div
        className={`flex ${
          isOwn ? "justify-end" : "justify-start"
        } items-end gap-2 w-full`}
      >
        {/* Avatar slot for received messages */}
        {!isOwn && (
          <div className="w-10 shrink-0">
            {isLastInGroup && (
              <Avatar
                size={40}
                name={sender?.name || sender?.username}
                src={avatarSrc}
                className={
                  getParticipantTheme(
                    sender?.id || sender?.accountId || sender?.name || "",
                  ).avatarClass
                }
              />
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`max-w-[70%] ${bubbleClasses} ${animationClass} ${
            isOwn ? "origin-bottom-right" : "origin-bottom-left"
          }`}
        >
          {/* Content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>

      {/* Read Status for latest message */}
      {isLastMessageInChat && ((hasBeenSeen && readers.length > 0) || isOwn) && (
        <div
          className={`flex items-center gap-1 select-none pr-1 mt-0.5 ${
            isOwn ? "justify-end" : "justify-start pl-[48px]"
          }`}
        >
          {hasBeenSeen && readers.length > 0 ? (
            <div className="flex items-center -space-x-1 justify-end">
              {readers.map((u) => {
                const theme = getParticipantTheme(u.id || u.name || "")
                return (
                  <Avatar
                    key={u.id}
                    size={16}
                    name={u.name}
                    src={u.avatar}
                    title={`Seen by ${u.name}`}
                    className={`border border-white dark:border-zinc-900 shadow-xs ${theme.avatarClass}`}
                  />
                )
              })}
            </div>
          ) : (
            <span
              className="flex items-center gap-1 text-[#888888]"
              title="Sent"
            >
              <Check size={14} />
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default memo(ChatBubble)
