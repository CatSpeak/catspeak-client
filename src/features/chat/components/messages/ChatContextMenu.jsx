import React, { useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence } from "framer-motion"
import {
  Reply,
  Copy,
  Trash2,
  Undo2,
  Pencil,
  Pin,
  PinOff,
  Forward,
} from "lucide-react"
import toast from "react-hot-toast"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { useLanguage } from "@/shared/context/LanguageContext"
import { QUICK_REACTIONS } from "../../utils/reactionUtils"

/**
 * ChatContextMenu — Context menu overlay with pixel-accurate positioning,
 * quick reaction emoji row, and full actions (Reply, Edit, Forward, Pin/Unpin, Copy, Delete, Recall).
 */
const ChatContextMenu = ({
  isOpen,
  onClose,
  message,
  isOwn = false,
  targetRect,
  rowElement,
  onReply,
  onEdit,
  onForward,
  onPin,
  onUnpin,
  onReact,
  canPin = false,
  canEdit = false,
  isPinned = false,
  onDeleteForMe,
  onRecall,
}) => {
  const { t } = useLanguage()

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose?.()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handleKeyDown])

  if (!targetRect || !message) return null

  const { top, left, width, bottom, right, height } = targetRect
  const vh = typeof window !== "undefined" ? window.innerHeight : 800
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200

  const menuHeight = 260
  const gap = 8
  const padding = 16

  const fitsBelow = vh - bottom >= menuHeight + gap + padding
  const fitsAbove = top >= menuHeight + gap + padding

  let elevatedTop = top
  let menuTop

  if (fitsBelow) {
    menuTop = bottom + gap
  } else if (fitsAbove) {
    menuTop = top - gap - menuHeight
  } else {
    const shiftY = bottom + gap + menuHeight - (vh - padding)
    elevatedTop = Math.max(padding, top - shiftY)
    menuTop = elevatedTop + height + gap
  }

  const menuStyle = isOwn
    ? { right: `${Math.max(padding, vw - right)}px` }
    : { left: `${Math.max(padding, left + 48)}px` }

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

  const handleAction = (actionFn) => {
    onClose?.()
    if (actionFn) actionFn(message)
  }

  const portalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999]">
          {/* Dark backdrop overlay with smooth fade in/out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Elevated Message + Avatar Row */}
          <div
            className="fixed z-[100000] pointer-events-none"
            style={{
              top: `${elevatedTop}px`,
              left: `${left}px`,
              width: `${width}px`,
            }}
          >
            {rowElement}
          </div>

          {/* Action MenuList */}
          <div
            className="fixed z-[100001]"
            style={{
              top: `${menuTop}px`,
              ...menuStyle,
            }}
          >
            <FluentAnimation
              direction={fitsBelow ? "down" : "up"}
              distance={12}
              duration={0.2}
              exit={true}
            >
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-border/80 overflow-hidden min-w-[200px] max-h-[calc(100vh-40px)] flex flex-col">
                {/* Quick Emoji Reaction Header */}
                {onReact && (
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-neutral-50/70 dark:bg-zinc-900/50">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onClose?.()
                          onReact(message, emoji)
                        }}
                        className="text-lg p-1 hover:scale-125 active:scale-95 transition-transform duration-150 leading-none select-none"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <MenuList className="overflow-y-auto p-1 border-0 shadow-none">
                  {onReply && (
                    <MenuItem
                      onClick={() => handleAction(onReply)}
                      icon={<Reply />}
                      label={t?.chat?.actions?.reply || "Reply"}
                    />
                  )}

                  {canEdit && onEdit && (
                    <MenuItem
                      onClick={() => handleAction(onEdit)}
                      icon={<Pencil />}
                      label={t?.chat?.actions?.edit || "Edit"}
                    />
                  )}

                  {onForward && (
                    <MenuItem
                      onClick={() => handleAction(onForward)}
                      icon={<Forward />}
                      label={t?.chat?.actions?.forward || "Forward"}
                    />
                  )}

                  {canPin && (
                    <MenuItem
                      onClick={() => {
                        onClose?.()
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
                        onClose?.()
                        handleCopy()
                      }}
                      icon={<Copy />}
                      label={
                        message?.mediaUrl || message?.fileUrl
                          ? t?.chat?.actions?.copyLink || "Copy link"
                          : t?.chat?.actions?.copyText || "Copy text"
                      }
                    />
                  )}

                  {onDeleteForMe && (
                    <MenuItem
                      onClick={() => handleAction(onDeleteForMe)}
                      icon={<Trash2 />}
                      label={t?.chat?.actions?.removeForMe || "Remove for me"}
                    />
                  )}

                  {isOwn && onRecall && (
                    <MenuItem
                      onClick={() => handleAction(onRecall)}
                      className="text-red-600 hover:text-red-700"
                      icon={<Undo2 />}
                      label={
                        t?.chat?.actions?.removeForEveryone ||
                        "Remove for everyone"
                      }
                    />
                  )}
                </MenuList>
              </div>
            </FluentAnimation>
          </div>
        </div>
      )}
    </AnimatePresence>
  )

  return typeof document !== "undefined"
    ? createPortal(portalContent, document.body)
    : null
}

export default React.memo(ChatContextMenu)
