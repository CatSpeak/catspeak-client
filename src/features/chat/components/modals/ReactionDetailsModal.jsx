import React, { useState, useMemo } from "react"
import Modal from "@/shared/components/ui/Modal"
import Avatar from "@/shared/components/ui/Avatar"
import LoadingSpinner from "@/shared/components/ui/indicators/LoadingSpinner"
import { useGetMessageReactionsQuery } from "@/store/api/social/conversationsApi"
import { useTimezone } from "@/shared/hooks/useTimezone"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * ReactionDetailsModal — Modal displaying the detailed list of users who reacted to a message.
 * Supports filtering by specific emoji tabs and displays user avatars, names, and reaction timestamps.
 */
const ReactionDetailsModal = ({ open, onClose, message, conversationId }) => {
  const { t } = useLanguage()
  const { formatRelative } = useTimezone()
  const [selectedEmoji, setSelectedEmoji] = useState("all")

  const messageId = message?.id || message?.messageId

  const { data: reactionDetails = [], isLoading } =
    useGetMessageReactionsQuery(
      conversationId && messageId
        ? { conversationId, messageId }
        : undefined,
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
      className="md:max-w-md w-full"
      showCloseButton={true}
      title={t?.chat?.reactionsTitle || "Message Reactions"}
      bodyClassName="p-0 flex-1 overflow-hidden flex flex-col"
    >
      {/* ── Tabs header ───────────────────────────── */}
      {emojiTabs.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-border overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedEmoji("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              selectedEmoji === "all"
                ? "bg-primary text-white"
                : "bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <span>{t?.chat?.allReactions || "All"}</span>
            <span className="opacity-80">({reactionDetails.length})</span>
          </button>

          {emojiTabs.map(({ emoji, count }) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                selectedEmoji === emoji
                  ? "bg-primary text-white"
                  : "bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <span className="text-sm leading-none">{emoji}</span>
              <span className="opacity-80">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── User List ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto max-h-[360px] p-2 divide-y divide-border/30">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredReactions.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            {t?.chat?.noReactions || "No reactions yet"}
          </div>
        ) : (
          filteredReactions.map((item, idx) => (
            <div
              key={item.messageReactionId || `${item.accountId}-${idx}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  size={36}
                  src={item.avatarImageUrl}
                  name={item.username || "User"}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {item.username || t?.chat?.someone || "User"}
                  </p>
                  {item.createdAt && (
                    <p className="text-xs text-neutral-400">
                      {formatRelative(item.createdAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xl pl-2 shrink-0 select-none">
                {item.emoji}
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}

export default React.memo(ReactionDetailsModal)
