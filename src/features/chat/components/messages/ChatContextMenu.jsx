import React, { useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Reply, Copy, Trash2, Undo2 } from "lucide-react"
import toast from "react-hot-toast"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import FluentAnimation from "@/shared/components/ui/animations/FluentAnimation"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ChatContextMenu — Context menu overlay with pixel-accurate positioning & avatar.
 * Uses Framer Motion AnimatePresence and FluentAnimation for direction-aware entrance/exit.
 */
const ChatContextMenu = ({
  isOpen,
  onClose,
  message,
  isOwn = false,
  targetRect,
  rowElement,
  onReply,
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

  const menuHeight = 205
  const gap = 8
  const padding = 16

  // Check if menu fits below message in its exact original spot
  const fitsBelow = vh - bottom >= menuHeight + gap + padding

  // Check if menu fits above message in its exact original spot
  const fitsAbove = top >= menuHeight + gap + padding

  let elevatedTop = top
  let menuTop

  if (fitsBelow) {
    // Fits below -> Message stays in exact spot, menu goes below
    menuTop = bottom + gap
  } else if (fitsAbove) {
    // Fits above -> Message stays in exact spot, menu goes above
    menuTop = top - gap - menuHeight
  } else {
    // Edge case: shift slightly to fit within screen padding
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

          {/* Elevated Message + Avatar Row (static placement) */}
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

          {/* Action MenuList with FluentAnimation */}
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
              <MenuList className="max-h-[calc(100vh-40px)] overflow-y-auto shadow-2xl">
                {onReply && (
                  <MenuItem
                    onClick={() => handleAction(onReply)}
                    icon={<Reply />}
                    label={t?.chat?.actions?.reply || "Reply"}
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
                        ? (t?.chat?.actions?.copyLink || "Copy link")
                        : (t?.chat?.actions?.copyText || "Copy text")
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
                    className="text-red-600"
                    icon={<Undo2 />}
                    label={t?.chat?.actions?.removeForEveryone || "Remove for everyone"}
                  />
                )}
              </MenuList>
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

export default ChatContextMenu
