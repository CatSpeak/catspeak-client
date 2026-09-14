// Ticket 03 — waiting-queue shared vocabulary (statuses + payload normalizers).
// Kept in a component-free module so react-refresh stays happy.

// Room-scoped status strings (mirror backend WaitingEntryStatus).
export const WAITING_STATUS = {
  PENDING: "pending",
  ADMITTED: "admitted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
}

export const normalizeWaitingQueue = (payload) => {
  if (!payload || typeof payload !== "object") return null
  const dto = payload.data ?? payload.result ?? payload
  if (!dto || typeof dto !== "object" || !Array.isArray(dto.pending)) return null
  return dto
}

export const normalizeWaitingEntry = (payload) => {
  if (!payload || typeof payload !== "object") return null
  const dto = payload.data ?? payload.result ?? payload
  if (!dto || typeof dto !== "object" || dto.accountId == null) return null
  // Backend returns null-data (ApiResponse.Ok(null)) when there is no request.
  return dto.status ? dto : null
}
