// Ticket 03 — waiting-queue shared vocabulary (statuses + payload normalizers).
// Kept in a component-free module so react-refresh stays happy.
import { toast } from "react-hot-toast"

// Room-scoped status strings (mirror backend WaitingEntryStatus).
export const WAITING_STATUS = {
  PENDING: "pending",
  ADMITTED: "admitted",
  REJECTED: "rejected",
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

/**
 * Shared knock flow (ParticipantList banner + WaitingScreen CTA):
 * same API call, same localized error mapping.
 */
export const knockWithToast = async ({ roomId, knockWaiting, t }) => {
  const wq = t?.rooms?.videoCall?.waitingQueue || {}
  if (!roomId) return
  try {
    await knockWaiting(roomId).unwrap()
    toast.success(wq.knockSuccess || "Đã gửi yêu cầu vào phòng. Vui lòng chờ duyệt.")
  } catch (err) {
    const code = err?.data?.errorCode
    toast.error(
      err?.data?.message ||
        (code === "ROOM_WAITING_REJECTED"
          ? (wq.rejectedHint || "Bạn đã bị từ chối. Vui lòng chờ được mời lại.")
          : code === "ROOM_LOCKED"
            ? (wq.lockedHint || "Phòng đã bị khóa. Người mới không thể tham gia lúc này.")
            : (wq.knockFailed || "Không thể gửi yêu cầu. Vui lòng thử lại."))
    )
  }
}
