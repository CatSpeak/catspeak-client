import React from "react"

/**
 * MessageReactionBadges — Displays reaction chips (e.g. ❤️ 3, 👍 1) under the message bubble.
 * Clicking a badge toggles the reaction for the user.
 * Clicking with Shift or clicking the details pill opens the user breakdown modal.
 *
 * @param {Array}    reactions - Grouped reactions [{ emoji, count, hasReacted, userIds }]
 * @param {function} onToggle - (emoji) => void
 * @param {function} onViewDetails - () => void
 * @param {boolean}  isOwn - whether current message belongs to current user
 */
const MessageReactionBadges = ({
  reactions = [],
  onToggle,
  onViewDetails,
  isOwn = false,
}) => {
  if (!Array.isArray(reactions) || reactions.length === 0) return null

  // Filter out any empty groups
  const activeGroups = reactions.filter((r) => (r.count || 0) > 0)
  if (activeGroups.length === 0) return null

  const totalCount = activeGroups.reduce((sum, g) => sum + (g.count || 0), 0)

  return (
    <div
      className={`flex flex-wrap items-center gap-1 mt-1 z-10 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {activeGroups.map((group) => {
        const hasReacted = Boolean(group.hasReacted)

        return (
          <button
            key={group.emoji}
            type="button"
            onClick={() => onToggle && onToggle(group.emoji)}
            title={
              hasReacted
                ? `You reacted with ${group.emoji} (click to remove)`
                : `React with ${group.emoji}`
            }
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-150 active:scale-95 shadow-2xs select-none ${
              hasReacted
                ? "border-primary/50 bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                : "border-border/60 bg-white/90 dark:bg-zinc-800/90 text-neutral-700 dark:text-neutral-300 hover:border-border hover:bg-neutral-50 dark:hover:bg-zinc-700/60"
            }`}
          >
            <span className="text-xs leading-none">{group.emoji}</span>
            <span className="text-[11px] leading-none font-semibold">{group.count}</span>
          </button>
        )
      })}

      {/* Details indicator pill if multiple reactions exist */}
      {totalCount > 1 && onViewDetails && (
        <button
          type="button"
          onClick={onViewDetails}
          title="View all reactions"
          className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-zinc-700/60 border border-border/40 transition-colors"
        >
          {totalCount}
        </button>
      )}
    </div>
  )
}

export default React.memo(MessageReactionBadges)
