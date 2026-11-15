export const sortTurns = (list) =>
  [...(Array.isArray(list) ? list : [])].sort((a, b) => a.order - b.order)

export const upsertTurn = (list, turn) =>
  sortTurns([
    ...(Array.isArray(list) ? list : []).filter(
      (entry) => entry.order !== turn.order,
    ),
    turn,
  ])

// Server only stamps `answered_at` on submit; a pending turn (asked_at set,
// answered_at NULL) is not an answer yet, even if a transcript exists.
export const isSubmittedTurn = (turn) =>
  Boolean(turn?.answeredAt || turn?.submittedAt)

export const countSubmittedTurns = (list, totalTurns = Infinity) =>
  Math.min(
    (Array.isArray(list) ? list : []).filter(isSubmittedTurn).length,
    totalTurns,
  )
