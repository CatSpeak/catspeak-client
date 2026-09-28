import React, { useState, useMemo, useEffect } from "react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useGetMessageReactionsQuery } from "@/store/api/social/conversationsApi"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"
import Tabs from "@/shared/components/ui/navigation/Tabs"

/**
 * ReactionDetailsModal — Modal displaying the detailed list of users who reacted to a message.
 * Supports filtering by specific emoji tabs and displays user avatars, names, and reaction timestamps.
 */
const ReactionDetailsModal = ({
  open,
  onClose,
  message,
  conversationId,
  initialEmoji = "all",
}) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()
  const [selectedEmoji, setSelectedEmoji] = useState(initialEmoji || "all")

  useEffect(() => {
    if (open) {
      setSelectedEmoji(initialEmoji || "all")
    }
  }, [open, initialEmoji])

  const messageId = message?.id || message?.messageId

  const { data: reactionDetails = [], isLoading } = useGetMessageReactionsQuery(
    conversationId && messageId ? { conversationId, messageId } : undefined,
    { skip: !open || !conversationId || !messageId },
  )

  // Compute unique emoji groups with counts
  const emojiTabs = useMemo(() => {
    if (!Array.isArray(reactionDetails)) return []
    const counts = {}
    reactionDetails.forEach((r) => {
      if (r.emoji) {
        counts[r.emoji] = (counts[r.emoji] || 0) + 1
      }
    })
    return Object.entries(counts).map(([emoji, count]) => ({
      emoji,
      count,
    }))
  }, [reactionDetails])

  // Compute tabs for the Tabs navigation component
  const reactionTabs = useMemo(() => {
    if (emojiTabs.length === 0) return []
    return [
      {
        id: "all",
        label: t?.chat?.allReactions || "All",
        badge: reactionDetails.length > 0 ? reactionDetails.length : undefined,
      },
      ...emojiTabs.map(({ emoji, count }) => ({
        id: emoji,
        label: emoji,
        badge: count > 0 ? count : undefined,
      })),
    ]
  }, [emojiTabs, reactionDetails.length, t?.chat?.allReactions])

  // Filtered reaction list based on active tab
  const filteredReactions = useMemo(() => {
    if (!Array.isArray(reactionDetails)) return []
    if (selectedEmoji === "all") return reactionDetails
    return reactionDetails.filter((r) => r.emoji === selectedEmoji)
  }, [reactionDetails, selectedEmoji])

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="md:max-w-md w-full h-[500px] max-h-[85vh]"
      showCloseButton={true}
      title={t?.chat?.reactionsTitle || "Message Reactions"}
      bodyClassName="p-0 flex-1 overflow-hidden flex flex-col"
    >
      {/* ── Tabs header ───────────────────────────── */}
      {reactionTabs.length > 0 && (
        <Tabs
          tabs={reactionTabs}
          activeTab={selectedEmoji}
          onChange={setSelectedEmoji}
        />
      )}

      {/* ── User List ─────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredReactions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8 text-center text-sm text-neutral-500">
            {t?.chat?.noReactions || "No reactions yet"}
          </div>
        ) : (
          filteredReactions.map((item, idx) => (
            <div
              key={item.messageReactionId || `${item.accountId}-${idx}`}
              className="h-[72px] flex items-center justify-between px-4 hover:bg-[#f2f2f2] transition-colors shrink-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <Avatar
                  size={40}
                  src={item.avatarImageUrl}
                  name={item.username || "User"}
                />
                <div className="min-w-0">
                  <p className="truncate">
                    {item.username || t?.chat?.someone || "User"}
                  </p>
                  {item.createdAt && (
                    <p className="text-sm text-secondary">
                      {formatRelative(item.createdAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xl shrink-0 select-none">{item.emoji}</div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}

export default React.memo(ReactionDetailsModal)
