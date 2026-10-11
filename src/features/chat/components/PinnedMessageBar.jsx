import React, { useState } from "react"
import { Pin, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  useGetPinnedMessagesQuery,
  useUnpinMessageMutation,
} from "@/store/api/social/conversationsApi"
import { useLanguage } from "@/shared/context/LanguageContext"
import toast from "react-hot-toast"

/**
 * PinnedMessageBar — Displays pinned message banner directly beneath ChatHeader.
 *
 * Provides:
 * - 📌 Pin indicator and counter (e.g. 1/3)
 * - Sender name and truncated message content preview
 * - Navigation between multiple pinned messages
 * - Smooth scroll jump to target message with highlight
 * - Quick unpin action for authorized users
 */
const PinnedMessageBar = ({
  conversationId,
  onJumpToMessage,
  canUnpin = true,
}) => {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data: rawPins = [] } = useGetPinnedMessagesQuery(conversationId, {
    skip: !conversationId,
  })

  const [unpinMessageMutation, { isLoading: isUnpinning }] =
    useUnpinMessageMutation()

  const pinnedList = Array.isArray(rawPins)
    ? rawPins
    : rawPins?.data || rawPins?.items || []

  if (pinnedList.length === 0) return null

  // Ensure currentIndex stays within bounds
  const safeIndex = Math.min(currentIndex, pinnedList.length - 1)
  const currentPin = pinnedList[safeIndex] || pinnedList[0]

  const handleNext = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % pinnedList.length)
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + pinnedList.length) % pinnedList.length)
  }

  const handleUnpin = async (e) => {
    e.stopPropagation()
    const msgId = currentPin?.messageId || currentPin?.id
    if (!conversationId || !msgId || isUnpinning) return

    try {
      await unpinMessageMutation({
        conversationId,
        messageId: msgId,
      }).unwrap()
      toast.success(t?.chat?.unpinnedSuccess || "Message unpinned")
      if (safeIndex > 0 && safeIndex === pinnedList.length - 1) {
        setCurrentIndex((prev) => prev - 1)
      }
    } catch (err) {
      console.error("Failed to unpin message:", err)
      toast.error(t?.chat?.unpinnedFailed || "Failed to unpin message")
    }
  }

  const handleClickBanner = () => {
    const msgId = currentPin?.messageId || currentPin?.id
    if (msgId && onJumpToMessage) {
      onJumpToMessage(msgId)
    }
  }

  const senderName =
    currentPin?.pinnedByName ||
    currentPin?.sender?.username ||
    currentPin?.sender?.name ||
    t?.chat?.someone ||
    "Someone"

  const previewContent =
    currentPin?.messageContent ||
    currentPin?.content ||
    (currentPin?.mediaUrl ? `[${t?.chat?.media || "Media"}]` : "")

  return (
    <div
      onClick={handleClickBanner}
      className="flex items-center justify-between px-4 py-2 bg-neutral-50 dark:bg-zinc-800/80 hover:bg-neutral-100/90 dark:hover:bg-zinc-800 border-b border-border/70 transition-colors cursor-pointer select-none shrink-0"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary shrink-0">
          <Pin size={15} className="rotate-45" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-primary truncate max-w-[140px]">
              {senderName}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500 font-medium">
              {t?.chat?.pinnedMessageLabel || "Pinned message"}
              {pinnedList.length > 1 && ` (${safeIndex + 1}/${pinnedList.length})`}
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
            {previewContent || "..."}
          </p>
        </div>
      </div>

      {/* ── Controls (prev, next, unpin) ────────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">
        {pinnedList.length > 1 && (
          <div className="flex items-center text-neutral-500 mr-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-zinc-700 hover:text-neutral-900 transition-colors"
              title={t?.chat?.prevPinnedMessage || "Previous pinned message"}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-zinc-700 hover:text-neutral-900 transition-colors"
              title={t?.chat?.nextPinnedMessage || "Next pinned message"}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {canUnpin && (
          <button
            type="button"
            onClick={handleUnpin}
            disabled={isUnpinning}
            className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
            title={t?.chat?.unpinMessage || "Unpin message"}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export default React.memo(PinnedMessageBar)
