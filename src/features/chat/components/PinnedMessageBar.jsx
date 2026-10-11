import React, { useState, useEffect } from "react"
import { Pin, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
  useGetPinnedMessagesQuery,
  useUnpinMessageMutation,
} from "@/store/api/social/conversationsApi"
import { IconButton } from "@/shared/components/ui/buttons"
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

  const { data: rawPins = [], error: pinsError } = useGetPinnedMessagesQuery(
    conversationId,
    {
      skip: !conversationId,
    },
  )

  useEffect(() => {
    if (pinsError) {
      console.error(
        "[PinnedMessageBar] Failed to load pinned messages for conversation",
        conversationId,
        pinsError,
      )
    }
  }, [pinsError, conversationId])

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
    setCurrentIndex(
      (prev) => (prev - 1 + pinnedList.length) % pinnedList.length,
    )
  }

  const handleUnpin = async (e) => {
    e.stopPropagation()
    const msgId =
      currentPin?.messageId ||
      currentPin?.id ||
      currentPin?.message?.messageId ||
      currentPin?.message?.id

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
    const msgId =
      currentPin?.messageId ||
      currentPin?.id ||
      currentPin?.message?.messageId ||
      currentPin?.message?.id

    if (msgId && onJumpToMessage) {
      onJumpToMessage(msgId)
    }
  }

  const senderName =
    currentPin?.pinnedByName ||
    currentPin?.pinnedBy?.username ||
    currentPin?.pinnedBy?.name ||
    currentPin?.sender?.username ||
    currentPin?.sender?.name ||
    currentPin?.senderName ||
    t?.chat?.someone ||
    "Someone"

  const previewContent =
    currentPin?.messageContent ||
    currentPin?.content ||
    currentPin?.message?.messageContent ||
    currentPin?.message?.content ||
    (currentPin?.mediaUrl ? `[${t?.chat?.media || "Media"}]` : "")

  return (
    <div
      onClick={handleClickBanner}
      className="flex items-center justify-between px-4 h-[72px] border-b border-border/70 transition-colors cursor-pointer select-none shrink-0"
    >
      <div className="flex items-center gap-4 min-w-0 flex-1 mr-2">
        <Pin className="rotate-45" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold truncate">{senderName}</span>
            <span className="text-secondary">
              {t?.chat?.pinnedMessageLabel || "pinned"}
              {pinnedList.length > 1 &&
                ` (${safeIndex + 1}/${pinnedList.length})`}
            </span>
          </div>
          <p className="text-sm text-secondary truncate">
            {previewContent || "..."}
          </p>
        </div>
      </div>

      {/* ── Controls (prev, next, unpin) ────────────────────────── */}
      <div className="flex items-center shrink-0">
        {pinnedList.length > 1 && (
          <div className="flex items-center">
            <IconButton
              variant="ghost"
              onClick={handlePrev}
              title={t?.chat?.prevPinnedMessage || "Previous pinned message"}
              aria-label={
                t?.chat?.prevPinnedMessage || "Previous pinned message"
              }
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              variant="ghost"
              onClick={handleNext}
              title={t?.chat?.nextPinnedMessage || "Next pinned message"}
              aria-label={t?.chat?.nextPinnedMessage || "Next pinned message"}
            >
              <ChevronRight />
            </IconButton>
          </div>
        )}

        {canUnpin && (
          <IconButton
            variant="ghost"
            onClick={handleUnpin}
            disabled={isUnpinning}
            title={t?.chat?.unpinMessage || "Unpin message"}
            aria-label={t?.chat?.unpinMessage || "Unpin message"}
          >
            <X />
          </IconButton>
        )}
      </div>
    </div>
  )
}

export default React.memo(PinnedMessageBar)
