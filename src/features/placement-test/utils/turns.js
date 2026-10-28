export const sortTurns = (list) =>
  [...(Array.isArray(list) ? list : [])].sort((a, b) => a.order - b.order)

export const upsertTurn = (list, turn) =>
  sortTurns([
    ...(Array.isArray(list) ? list : []).filter(
      (entry) => entry.order !== turn.order,
    ),
    turn,
  ])
