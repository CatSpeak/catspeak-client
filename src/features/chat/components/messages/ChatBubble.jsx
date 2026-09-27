import { memo, useState, useRef, useCallback, useMemo } from "react"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useAuth } from "@/features/auth"
import Avatar from "@/shared/components/ui/Avatar"
import { getParticipantTheme } from "@/features/video-call/utils/participantTheme"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import ChatContextMenu from "./ChatContextMenu"
import ChatBubbleActions from "./ChatBubbleActions"
import ChatBubbleTyping from "./ChatBubbleTyping"
import ChatBubbleContent from "./ChatBubbleContent"
import ChatBubbleReadStatus from "./ChatBubbleReadStatus"
import FloatingReactionsBar from "./FloatingReactionsBar"
import MessageReactionBadges from "./MessageReactionBadges"
import ReactionDetailsModal from "../modals/ReactionDetailsModal"
import ForwardMessageModal from "../modals/ForwardMessageModal"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * ChatBubble — enhanced message bubble with reactions, inline editing, pin actions, and forward support.
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
  onEdit,
  onToggleReaction,
  onPin,
  onUnpin,
  isPinned = false,
  canPin = false,
  conversationId,
  isWidget = false,
}) => {
  const { t } = useLanguage()
  const { formatTime } = useTimezone()

  // Context menu & Popover states
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [targetRect, setTargetRect] = useState(null)
  const [isReactionDetailsOpen, setIsReactionDetailsOpen] = useState(false)
  const [isForwardOpen, setIsForwardOpen] = useState(false)

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const { user: currentUser } = useAuth()

  const isCurrentUserMentioned = useMemo(() => {
    if (isOwn) return false
    const myId = Number(currentUser?.id || currentUser?.accountId)
    const mentionedIds = (
      message?.mentionedAccountIds ||
      message?.MentionedAccountIds ||
      []
    ).map(Number)
    if (myId && mentionedIds.includes(myId)) return true

    const text = message?.content || message?.messageContent || ""
    if (/@all\b|@tatca\b/i.test(text)) return true
    if (
      currentUser?.username &&
      new RegExp(`@${currentUser.username}\\b`, "i").test(text)
    ) {
      return true
    }

    return false
  }, [isOwn, currentUser, message])

  const touchTimerRef = useRef(null)
  const rowRef = useRef(null)

  const maxWidthClass = isWidget ? "max-w-[70%]" : "max-w-[75%]"

  const isRecalled =
    message?.isRecalled ||
    message?.messageType === "Recalled" ||
    message?.content === "[Message Recalled]" ||
    message?.messageContent === "Tin nhắn đã bị thu hồi"

  // Check 30-minute window for editing text messages
  const msgTime = message?.timestamp ? new Date(message.timestamp).getTime() : 0
  const isWithinEditWindow = Date.now() - msgTime < 30 * 60 * 1000
  const canEdit =
    isOwn &&
    !isRecalled &&
    !message?.mediaUrl &&
    isWithinEditWindow &&
    Boolean(onEdit)

  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    setEditValue(message?.content || message?.messageContent || "")
  }, [message])

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false)
    setEditValue("")
  }, [])

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === (message?.content || message?.messageContent)) {
      setIsEditing(false)
      return
    }

    setIsSavingEdit(true)
    try {
      if (onEdit) {
        await onEdit(message, trimmed)
      }
      setIsEditing(false)
      toast.success(t?.chat?.editedSuccess || "Message edited")
    } catch (err) {
      console.error("Failed to edit message:", err)
      toast.error(t?.chat?.editFailed || "Failed to edit message")
    } finally {
      setIsSavingEdit(false)
    }
  }, [editValue, message, onEdit, t])

  const handleContextMenu = (e) => {
    if (isRecalled || isEditing) return
    e.preventDefault()
    if (rowRef.current) {
      setTargetRect(rowRef.current.getBoundingClientRect())
    }
    setIsContextMenuOpen(true)
  }

  const handleTouchStart = () => {
    if (isRecalled || isEditing) return
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

  // System message fallback
  if (
    message?.messageType != null &&
    String(message.messageType).toLowerCase() === "system"
  ) {
    return (
      <div className="flex justify-center my-3 px-4 w-full">
        <span className="bg-[#E5E5E5]/60 text-[#606060] dark:bg-zinc-800 dark:text-zinc-400 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-xs text-center border border-border/40 max-w-[85%] break-words">
          {message.content || message.messageContent}
        </span>
      </div>
    )
  }

  const marginTop = isFirstInGroup ? "mt-3" : "mt-0.5"
  const avatarSrc = sender?.avatar || sender?.avatarImageUrl

  const readers = Array.isArray(readByUsers) ? readByUsers : []

  const bubbleNode = (
    <div
      className={
        isCurrentUserMentioned
          ? "ring-2 ring-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)] rounded-2xl transition-all"
          : ""
      }
    >
      <ChatBubbleContent
        message={message}
        isOwn={isOwn}
        currentUserName={currentUser?.username}
        isEditing={isEditing}
        editValue={editValue}
        onEditChange={setEditValue}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        isSavingEdit={isSavingEdit}
      />
    </div>
  )

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

  const messageId = message?.id || message?.messageId

  return (
    <div
      id={messageId ? `chat-message-${messageId}` : undefined}
      className={`${marginTop} flex flex-col gap-0.5 ${
        isOwn ? "items-end" : "items-start"
      } group relative w-full scroll-mt-24 transition-all duration-300`}
    >
      {/* Header with Sender Name + Timestamp */}
      {isFirstInGroup && (
        <div
          className={`flex items-baseline gap-1 text-sm ${
            isOwn ? "" : "pl-[48px]"
          }`}
        >
          <span className="font-semibold">
            {isOwn ? t?.chat?.you || "You" : sender?.name || sender?.username}
          </span>

          <span className="text-xs text-[#606060]">
            {formatTime(message.timestamp || message.createDate)}
          </span>
        </div>
      )}

      {/* Row with Avatar & Message Bubble */}
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
        {!isOwn && <div className="w-10 shrink-0">{avatarNode}</div>}

        <div className={`relative ${maxWidthClass} w-fit`}>
          {/* Floating Reaction Bar on Hover (desktop only) */}
          {!isRecalled && !isEditing && !isWidget && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto">
              <FloatingReactionsBar
                isOwn={isOwn}
                onReact={(emoji) => onToggleReaction && onToggleReaction(message, emoji)}
              />
            </div>
          )}

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

          {/* Action Popover Icons */}
          {!isRecalled && !isEditing && (
            <ChatBubbleActions
              isOwn={isOwn}
              onReply={onReply}
              onEdit={handleStartEdit}
              canEdit={canEdit}
              onForward={() => setIsForwardOpen(true)}
              onPin={onPin}
              onUnpin={onUnpin}
              isPinned={isPinned}
              canPin={canPin}
              onDeleteForMe={onDeleteForMe}
              onRecall={onRecall}
              message={message}
              isWidget={isWidget}
            />
          )}

          {/* Reaction Badges */}
          {!isRecalled && (
            <MessageReactionBadges
              reactions={message?.reactions}
              onToggle={(emoji) => onToggleReaction && onToggleReaction(message, emoji)}
              onViewDetails={() => setIsReactionDetailsOpen(true)}
              isOwn={isOwn}
            />
          )}
        </div>
      </div>

      {/* Context Menu Overlay */}
      {!isRecalled && !isEditing && (
        <ChatContextMenu
          isOpen={isContextMenuOpen}
          onClose={() => setIsContextMenuOpen(false)}
          message={message}
          isOwn={isOwn}
          targetRect={targetRect}
          rowElement={rowNode}
          onReply={onReply}
          onEdit={handleStartEdit}
          canEdit={canEdit}
          onForward={() => setIsForwardOpen(true)}
          onPin={onPin}
          onUnpin={onUnpin}
          isPinned={isPinned}
          canPin={canPin}
          onReact={onToggleReaction}
          onDeleteForMe={onDeleteForMe}
          onRecall={onRecall}
        />
      )}

      {/* Read Status for latest message */}
      <ChatBubbleReadStatus
        isLastMessageInChat={isLastMessageInChat}
        readers={readers}
        isOwn={isOwn}
      />

      {/* ── Reaction Details Modal ─────────────────── */}
      <ReactionDetailsModal
        open={isReactionDetailsOpen}
        onClose={() => setIsReactionDetailsOpen(false)}
        message={message}
        conversationId={conversationId || message?.conversationId}
      />

      {/* ── Forward Message Modal ──────────────────── */}
      <ForwardMessageModal
        open={isForwardOpen}
        onClose={() => setIsForwardOpen(false)}
        message={message}
      />
    </div>
  )
}

export default memo(ChatBubble)
