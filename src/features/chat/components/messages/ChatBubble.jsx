import { memo, useState, useRef } from "react"
import { formatTime } from "@/shared/utils/dateFormatter"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import ChatContextMenu from "./ChatContextMenu"
import ChatBubbleActions from "./ChatBubbleActions"
import ChatBubbleTyping from "./ChatBubbleTyping"
import ChatBubbleContent from "./ChatBubbleContent"
import ChatBubbleReadStatus from "./ChatBubbleReadStatus"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ChatBubble — individual message bubble.
 *
 * Supports 1:1 and group chats with message grouping,
 * avatars, sender names, timestamps, read receipts, media display,
 * parent message quote (RepliedMessage), recalled state, and context menu overlay.
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
  onReply,
  onDeleteForMe,
  onRecall,
  isWidget = false,
}) => {
  const { t } = useLanguage()
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  const touchTimerRef = useRef(null)
  const rowRef = useRef(null)

  const maxWidthClass = isWidget ? "max-w-[65%]" : "max-w-[75%]"

  const isRecalled =
    message?.isRecalled ||
    message?.messageType === "Recalled" ||
    message?.content === "[Message Recalled]"

  const handleContextMenu = (e) => {
    if (isRecalled) return
    e.preventDefault()
    if (rowRef.current) {
      setTargetRect(rowRef.current.getBoundingClientRect())
    }
    setIsContextMenuOpen(true)
  }

  const handleTouchStart = () => {
    if (isRecalled) return
    touchTimerRef.current = setTimeout(() => {
      if (rowRef.current) {
        setTargetRect(rowRef.current.getBoundingClientRect())
      }
      setIsContextMenuOpen(true)
    }, 400)
  }

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current)
    }
  }

  if (isTyping) {
    return <ChatBubbleTyping sender={sender} />
  }

  // Fallback for System messages if passed directly
  if (
    message?.messageType != null &&
    String(message.messageType).toLowerCase() === "system"
  ) {
    return (
      <div className="flex justify-center my-3 px-4 w-full">
        <span className="bg-[#E5E5E5]/60 text-[#606060] dark:bg-zinc-800 dark:text-zinc-400 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-xs text-center border border-border/40 max-w-[85%] break-words">
          {message.content}
        </span>
      </div>
    )
  }

  // Spacing between groups
  const marginTop = isFirstInGroup ? "mt-3" : "mt-0.5"
  const avatarSrc = sender?.avatar || sender?.avatarImageUrl

  const readers = Array.isArray(readByUsers) ? readByUsers : []
  const hasBeenSeen =
    readers.length > 0 ||
    message?.isRead ||
    (Array.isArray(message?.readByAccountIds) &&
      message.readByAccountIds.length > 0) ||
    message?.status === "read"

  const bubbleNode = <ChatBubbleContent message={message} isOwn={isOwn} />

  const avatarNode =
    !isOwn && isLastInGroup ? (
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
    ) : null

  const rowNode = (
    <div
      className={`flex ${
        isOwn ? "flex-row-reverse" : "flex-row"
      } items-end gap-2 w-full`}
    >
      {!isOwn && <div className="w-10 shrink-0">{avatarNode}</div>}
      <div className={`relative ${maxWidthClass} w-fit`}>{bubbleNode}</div>
    </div>
  )

  return (
    <div
      className={`${marginTop} flex flex-col gap-1 ${
        isOwn ? "items-end" : "items-start"
      } group relative w-full`}
    >
      {/* Header with Sender Name + Timestamp */}
      {isFirstInGroup && (
        <div
          className={`flex items-baseline gap-1 text-sm ${
            isOwn ? "" : "pl-[48px]"
          }`}
        >
          <span className="font-semibold">
            {isOwn ? (t?.chat?.you || "You") : sender?.name || sender?.username}
          </span>

          <span className="text-xs text-[#606060]">
            {formatTime(message.timestamp)}
          </span>
        </div>
      )}

      <div
        ref={rowRef}
        className={`flex ${
          isOwn ? "flex-row-reverse" : "flex-row"
        } items-end gap-2 w-full select-none cursor-pointer`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
      >
        {/* Avatar slot for received messages */}
        {!isOwn && <div className="w-10 shrink-0">{avatarNode}</div>}

        {/* Message Bubble Container */}
        <div className={`relative ${maxWidthClass} w-fit`}>
          {shouldAnimate ? (
            <FluentAnimation
              direction={isOwn ? "left" : "right"}
              distance={24}
              duration={0.25}
              className="w-fit max-w-full"
            >
              {bubbleNode}
            </FluentAnimation>
          ) : (
            bubbleNode
          )}

          {!isRecalled && (
            <ChatBubbleActions
              isOwn={isOwn}
              onReply={onReply}
              onDeleteForMe={onDeleteForMe}
              onRecall={onRecall}
              message={message}
              isWidget={isWidget}
            />
          )}
        </div>
      </div>

      {/* Context Menu Overlay */}
      {!isRecalled && (
        <ChatContextMenu
          isOpen={isContextMenuOpen}
          onClose={() => setIsContextMenuOpen(false)}
          message={message}
          isOwn={isOwn}
          targetRect={targetRect}
          rowElement={rowNode}
          onReply={onReply}
          onDeleteForMe={onDeleteForMe}
          onRecall={onRecall}
        />
      )}

      {/* Read Status for latest message */}
      <ChatBubbleReadStatus
        isLastMessageInChat={isLastMessageInChat}
        hasBeenSeen={hasBeenSeen}
        readers={readers}
        isOwn={isOwn}
      />
    </div>
  )
}

export default memo(ChatBubble)
