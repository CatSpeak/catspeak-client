import React, { useState } from "react"
import {
  Reply,
  MoreHorizontal,
  Trash2,
  Undo2,
  Copy,
  Pencil,
  Pin,
  PinOff,
  Forward,
  Smile,
} from "lucide-react"
import toast from "react-hot-toast"
import Popover from "@/shared/components/ui/Popover"
import { IconButton } from "@/shared/components/ui/buttons"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import { useLanguage } from "@/shared/context/LanguageContext"
import FloatingReactionsBar from "./FloatingReactionsBar"

/**
 * ChatBubbleActions — action bar & popover menu for chat message bubbles.
 *
 * Provides actions:
 * - React (Messenger style smile icon + emoji bar popover)
 * - Reply
 * - Edit (if allowed)
 * - Pin / Unpin (if authorized)
 * - Forward
 * - Copy
 * - Remove for me
 * - Remove for everyone (recalled, restricted to message owner)
 */
const ChatBubbleActions = ({
  isOwn = false,
  onReact,
  onReply,
  onEdit,
  onForward,
  onPin,
  onUnpin,
  isPinned = false,
  canPin = false,
  canEdit = false,
  onDeleteForMe,
  onRecall,
  message,
  onMenuOpenChange,
  isWidget = false,
}) => {
  const { t } = useLanguage()
  const [isReactionOpen, setIsReactionOpen] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  const handleMoreOpenChange = (open) => {
    setIsMoreOpen(open)
    onMenuOpenChange?.(open || isReactionOpen)
  }

  const handleReactionOpenChange = (open) => {
    setIsReactionOpen(open)
    onMenuOpenChange?.(open || isMoreOpen)
  }

  const isAnyMenuOpen = isReactionOpen || isMoreOpen
  const visibilityClass = isAnyMenuOpen
    ? "opacity-100"
    : "opacity-0 group-hover:opacity-100"

  const contentToCopy =
    message?.content ||
    message?.messageContent ||
    message?.mediaUrl ||
    message?.fileUrl ||
    message?.attachmentUrl

  const handleCopy = () => {
    if (!contentToCopy) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(contentToCopy)
        .then(() => toast.success(t?.chat?.actions?.copied || "Copied to clipboard"))
        .catch(() => toast.error(t?.chat?.actions?.failedCopy || "Failed to copy"))
    }
  }

  const renderMenuItems = (close) => (
    <MenuList className="min-w-[160px] z-50">
      {onReply && (
        <MenuItem
          onClick={() => {
            close()
            onReply(message)
          }}
          icon={<Reply />}
          label={t?.chat?.actions?.reply || "Reply"}
        />
      )}

      {canEdit && onEdit && (
        <MenuItem
          onClick={() => {
            close()
            onEdit(message)
          }}
          icon={<Pencil />}
          label={t?.chat?.actions?.edit || "Edit"}
        />
      )}

      {onForward && (
        <MenuItem
          onClick={() => {
            close()
            onForward(message)
          }}
          icon={<Forward />}
          label={t?.chat?.actions?.forward || "Forward"}
        />
      )}

      {canPin && (
        <MenuItem
          onClick={() => {
            close()
            if (isPinned) {
              onUnpin && onUnpin(message)
            } else {
              onPin && onPin(message)
            }
          }}
          icon={isPinned ? <PinOff /> : <Pin />}
          label={
            isPinned
              ? t?.chat?.actions?.unpin || "Unpin"
              : t?.chat?.actions?.pin || "Pin"
          }
        />
      )}

      {contentToCopy && (
        <MenuItem
          onClick={() => {
            close()
            handleCopy()
          }}
          icon={<Copy />}
          label={t?.chat?.actions?.copy || "Copy"}
        />
      )}

      {onDeleteForMe && (
        <MenuItem
          onClick={() => {
            close()
            onDeleteForMe(message)
          }}
          icon={<Trash2 />}
          label={t?.chat?.actions?.removeForMe || "Remove for me"}
        />
      )}

      {isOwn && onRecall && (
        <MenuItem
          onClick={() => {
            close()
            onRecall(message)
          }}
          className="text-red-600"
          icon={<Undo2 />}
          label={t?.chat?.actions?.removeForEveryone || "Remove for everyone"}
        />
      )}
    </MenuList>
  )

  if (isWidget) {
    return (
      <div
        className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center transition-opacity ${visibilityClass} ${
          isOwn ? "right-full mr-2 flex-row-reverse" : "left-full ml-2 flex-row"
        }`}
      >
        <Popover
          placement="top-right"
          onOpenChange={handleMoreOpenChange}
          trigger={
            <IconButton
              type="button"
              variant="ghost"
              title={t?.chat?.actions?.moreActions || "More actions"}
            >
              <MoreHorizontal />
            </IconButton>
          }
          content={(close) => renderMenuItems(close)}
        />
      </div>
    )
  }

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-10 flex items-center transition-opacity ${visibilityClass} ${
        isOwn ? "right-full mr-2 flex-row-reverse" : "left-full ml-2 flex-row"
      }`}
    >
      {onReact && (
        <Popover
          placement={isOwn ? "top-right" : "top-left"}
          onOpenChange={handleReactionOpenChange}
          trigger={
            <IconButton
              type="button"
              variant="ghost"
              title={t?.chat?.actions?.react || "React"}
            >
              <Smile />
            </IconButton>
          }
          content={(close) => (
            <FloatingReactionsBar
              onReact={onReact}
              onClose={close}
              isOwn={isOwn}
            />
          )}
        />
      )}

      {onReply && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={() => onReply(message)}
          title={t?.chat?.actions?.reply || "Reply"}
        >
          <Reply />
        </IconButton>
      )}

      {contentToCopy && (
        <IconButton
          type="button"
          variant="ghost"
          onClick={handleCopy}
          title={t?.chat?.actions?.copy || "Copy"}
        >
          <Copy />
        </IconButton>
      )}

      <Popover
        placement="top-right"
        onOpenChange={handleMoreOpenChange}
        trigger={
          <IconButton
            type="button"
            variant="ghost"
            title={t?.chat?.actions?.moreActions || "More actions"}
          >
            <MoreHorizontal />
          </IconButton>
        }
        content={(close) => renderMenuItems(close)}
      />
    </div>
  )
}

export default React.memo(ChatBubbleActions)
