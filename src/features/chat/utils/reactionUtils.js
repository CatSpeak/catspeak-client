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

  const myId = currentUserId != null ? Number(currentUserId) : null

  // If server provided precomputed reactionsSummary, strictly evaluate hasReacted against myId
  const reactionsSummary = event.reactionsSummary || event.ReactionsSummary
  if (Array.isArray(reactionsSummary)) {
    return reactionsSummary.map((group) => {
      const userIds = group.userIds || group.UserIds || []
      const hasMyId =
        myId != null &&
        Array.isArray(userIds) &&
        userIds.some((id) => Number(id) === myId)

      return {
        ...group,
        emoji: group.emoji || group.Emoji,
        count: group.count ?? group.Count ?? 0,
        userIds,
        hasReacted: hasMyId,
      }
    })
  }

  const emoji = event.emoji || event.Emoji
  const action = (event.action || event.Action || "").toLowerCase()
  const accountId =
    event.accountId ?? event.AccountId ?? event.userId ?? event.UserId

  if (!emoji || accountId == null) return currentReactions

  const eventAccountId = Number(accountId)
  const isMyReaction = myId != null && eventAccountId === myId
  const list = Array.isArray(currentReactions)
    ? [...currentReactions.map((r) => ({ ...r, userIds: [...(r.userIds || [])] }))]
    : []

  if (action === "removed") {
    const idx = list.findIndex((g) => g.emoji === emoji)
    if (idx !== -1) {
      const g = list[idx]
      const newIds = g.userIds.filter((id) => Number(id) !== eventAccountId)
      const newCount = Math.max(0, (g.count || 1) - 1)
      if (newCount <= 0) {
        list.splice(idx, 1)
      } else {
        list[idx] = {
          ...g,
          count: newCount,
          userIds: newIds,
          hasReacted: isMyReaction
            ? false
            : myId != null && newIds.some((id) => Number(id) === myId),
        }
      }
    }
  } else if (action === "added" || action === "updated") {
    // If this actor previously had another emoji, clean it up from that group
    list.forEach((g, idx) => {
      if (
        g.emoji !== emoji &&
        g.userIds.some((id) => Number(id) === eventAccountId)
      ) {
        const newIds = g.userIds.filter((id) => Number(id) !== eventAccountId)
        const newCount = Math.max(0, (g.count || 1) - 1)
        if (newCount <= 0) {
          list.splice(idx, 1)
        } else {
          list[idx] = {
            ...g,
            count: newCount,
            userIds: newIds,
            hasReacted: isMyReaction
              ? false
              : myId != null && newIds.some((id) => Number(id) === myId),
          }
        }
      }
    })

    const idx = list.findIndex((g) => g.emoji === emoji)
    if (idx !== -1) {
      const g = list[idx]
      const alreadyHasActor = g.userIds.some((id) => Number(id) === eventAccountId)
      const userIds = alreadyHasActor
        ? g.userIds
        : [...g.userIds, eventAccountId]

      list[idx] = {
        ...g,
        count: alreadyHasActor ? g.count : (g.count || 0) + 1,
        userIds,
        hasReacted: isMyReaction
          ? true
          : myId != null && userIds.some((id) => Number(id) === myId),
      }
    } else {
      list.push({
        emoji,
        count: 1,
        userIds: [eventAccountId],
        hasReacted: isMyReaction,
      })
    }
  }

  return list
}
