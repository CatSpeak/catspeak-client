/**
 * Default quick reactions shown in the floating reaction bar
 */
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"]

/**
 * Optimistically toggles or updates a reaction for a user.
 * 
 * Rules:
 * - If user clicked the same emoji they previously reacted with -> Remove reaction (toggle off).
 * - If user had reacted with a different emoji -> Remove old reaction, add new emoji reaction.
 * - If user had not reacted yet -> Add new emoji reaction.
 *
 * @param {Array} reactions - Current list of MessageReactionGroupDto
 * @param {string} emoji - Clicked emoji
 * @param {number|string} currentUserId - ID of current user
 * @returns {Array} Updated reactions array
 */
export function applyReactionToggle(reactions = [], emoji, currentUserId) {
  if (!emoji || currentUserId == null) return reactions
  const userIdNum = Number(currentUserId)
  const list = Array.isArray(reactions) ? [...reactions.map((r) => ({ ...r, userIds: [...(r.userIds || [])] }))] : []

  // Check if user already reacted to this exact emoji
  const existingGroupIndex = list.findIndex((g) => g.emoji === emoji)
  const userHadReactedSame =
    existingGroupIndex !== -1 &&
    (list[existingGroupIndex].hasReacted || list[existingGroupIndex].userIds.some((id) => Number(id) === userIdNum))

  // Find if user previously reacted to another emoji
  let oldGroupIndex = -1
  list.forEach((g, idx) => {
    if (g.emoji !== emoji && (g.hasReacted || g.userIds.some((id) => Number(id) === userIdNum))) {
      oldGroupIndex = idx
    }
  })

  // If user had reacted to another emoji, remove their reaction from that group
  if (oldGroupIndex !== -1) {
    const oldGroup = list[oldGroupIndex]
    const updatedUserIds = oldGroup.userIds.filter((id) => Number(id) !== userIdNum)
    const newCount = Math.max(0, (oldGroup.count || 1) - 1)
    if (newCount <= 0) {
      list.splice(oldGroupIndex, 1)
    } else {
      list[oldGroupIndex] = {
        ...oldGroup,
        count: newCount,
        userIds: updatedUserIds,
        hasReacted: false,
      }
    }
  }

  // Now handle the clicked emoji group
  // Re-find in case index shifted
  const currentGroupIndex = list.findIndex((g) => g.emoji === emoji)

  if (userHadReactedSame) {
    // Toggle OFF
    if (currentGroupIndex !== -1) {
      const g = list[currentGroupIndex]
      const updatedUserIds = g.userIds.filter((id) => Number(id) !== userIdNum)
      const newCount = Math.max(0, (g.count || 1) - 1)
      if (newCount <= 0) {
        list.splice(currentGroupIndex, 1)
      } else {
        list[currentGroupIndex] = {
          ...g,
          count: newCount,
          userIds: updatedUserIds,
          hasReacted: false,
        }
      }
    }
  } else {
    // Toggle ON or ADD
    if (currentGroupIndex !== -1) {
      const g = list[currentGroupIndex]
      const userIds = g.userIds.some((id) => Number(id) === userIdNum)
        ? g.userIds
        : [...g.userIds, userIdNum]
      list[currentGroupIndex] = {
        ...g,
        count: g.count + 1,
        userIds,
        hasReacted: true,
      }
    } else {
      list.push({
        emoji,
        count: 1,
        userIds: [userIdNum],
        hasReacted: true,
      })
    }
  }

  return list
}

/**
 * Updates message reactions given a SignalR MessageReactionChanged event payload.
 *
 * @param {Array} currentReactions - Existing reactions list
 * @param {object} event - SignalR payload { emoji, action, accountId, reactionsSummary }
 * @param {number|string} currentUserId - Local user account ID
 * @returns {Array} Updated reactions list
 */
export function applyReactionSignalREvent(currentReactions = [], event, currentUserId) {
  if (!event) return currentReactions

  // If server provided precomputed reactionsSummary, map hasReacted and return
  if (Array.isArray(event.reactionsSummary)) {
    const myId = Number(currentUserId)
    return event.reactionsSummary.map((group) => ({
      ...group,
      hasReacted:
        Boolean(group.hasReacted) ||
        (Array.isArray(group.userIds) && group.userIds.some((id) => Number(id) === myId)),
    }))
  }

  const { emoji, action, accountId } = event
  if (!emoji || accountId == null) return currentReactions

  const isMyReaction = Number(accountId) === Number(currentUserId)
  const list = Array.isArray(currentReactions)
    ? [...currentReactions.map((r) => ({ ...r, userIds: [...(r.userIds || [])] }))]
    : []

  if (action === "removed") {
    const idx = list.findIndex((g) => g.emoji === emoji)
    if (idx !== -1) {
      const g = list[idx]
      const newIds = g.userIds.filter((id) => Number(id) !== Number(accountId))
      const newCount = Math.max(0, (g.count || 1) - 1)
      if (newCount <= 0) {
        list.splice(idx, 1)
      } else {
        list[idx] = {
          ...g,
          count: newCount,
          userIds: newIds,
          hasReacted: isMyReaction ? false : g.hasReacted,
        }
      }
    }
  } else if (action === "added" || action === "updated") {
    // If user previously had another emoji, clean it up
    list.forEach((g, idx) => {
      if (g.emoji !== emoji && g.userIds.some((id) => Number(id) === Number(accountId))) {
        const newIds = g.userIds.filter((id) => Number(id) !== Number(accountId))
        const newCount = Math.max(0, (g.count || 1) - 1)
        if (newCount <= 0) {
          list.splice(idx, 1)
        } else {
          list[idx] = {
            ...g,
            count: newCount,
            userIds: newIds,
            hasReacted: isMyReaction ? false : g.hasReacted,
          }
        }
      }
    })

    const idx = list.findIndex((g) => g.emoji === emoji)
    if (idx !== -1) {
      const g = list[idx]
      const userIds = g.userIds.some((id) => Number(id) === Number(accountId))
        ? g.userIds
        : [...g.userIds, Number(accountId)]
      list[idx] = {
        ...g,
        count: (g.count || 0) + 1,
        userIds,
        hasReacted: isMyReaction ? true : g.hasReacted,
      }
    } else {
      list.push({
        emoji,
        count: 1,
        userIds: [Number(accountId)],
        hasReacted: isMyReaction,
      })
    }
  }

  return list
}
