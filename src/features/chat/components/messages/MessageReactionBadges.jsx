import React from "react"

/**
 * MessageReactionBadges — Clean, separated reaction badges row below the message bubble.
 * Displays individual interactive pill buttons with emoji and count.
 * Clicking any badge opens the ReactionDetailsModal focused on that emoji tab.
 *
 * @param {Array}    reactions - Grouped reactions [{ emoji, count, hasReacted, userIds }]
 * @param {function} onViewDetails - (emoji: string) => void
 * @param {boolean}  isOwn - whether current message belongs to current user
 */
const MessageReactionBadges = ({
  reactions = [],
  onViewDetails,
  isOwn = false,
}) => {
  if (!Array.isArray(reactions) || reactions.length === 0) return null

  // Filter out any empty groups
  const activeGroups = reactions.filter((r) => (r.count || 0) > 0)
  if (activeGroups.length === 0) return null

  return (
    <div
      className={`flex flex-wrap items-center gap-1 mt-1 z-10 select-none ${
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
            onClick={() => onViewDetails && onViewDetails(group.emoji)}
            title={
              hasReacted
                ? `You reacted with ${group.emoji} • Click to see who reacted`
                : `Click to see who reacted`
            }
            className={`h-8 inline-flex items-center gap-2 px-2.5 rounded-lg text-sm border transition-colors cursor-pointer ${
              hasReacted
                ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                : "border-border bg-white hover:bg-neutral-50 text-neutral-700"
            }`}
          >
            <span className="text-sm select-none">{group.emoji}</span>
            <span className="text-sm font-medium">{group.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default React.memo(MessageReactionBadges)
