import {
  CO_HOST_PERMISSIONS,
  hasCoHostPermission,
} from "@/features/co-host/constants"

/** A room without a settings row (or an older payload) allows annotation. */
export const DEFAULT_ALLOW_ANNOTATION = true

/**
 * Reads the annotation policy from a RoomState response. The API wraps it in
 * an `ApiResponse` envelope; tests/fixtures sometimes pass the raw payload.
 */
export const resolveAllowAnnotation = (
  roomState,
  fallback = DEFAULT_ALLOW_ANNOTATION,
) => {
  const payload = roomState?.data ?? roomState
  const value = payload?.settings?.allowAnnotation
  return typeof value === "boolean" ? value : fallback
}

/**
 * Pure patch used by the SignalR `RoomSettingsChanged` handler. It returns a
 * new cache entry so RTK Query/Immer can replace the cached RoomState in place
 * (no refetch delay) while keeping the previous object untouched.
 */
export const applyRoomSettingsChanged = (roomState, settings) => {
  if (!roomState || !settings || typeof settings !== "object") return roomState

  const payload =
    roomState.data && typeof roomState.data === "object"
      ? roomState.data
      : roomState
  const nextPayload = {
    ...payload,
    settings: { ...(payload.settings ?? {}), ...settings },
  }

  return roomState.data ? { ...roomState, data: nextPayload } : nextPayload
}

/** Host, or a co-host holding `manage_student_share`, may manage the policy. */
export const canManageAnnotationPolicy = ({
  isHost = false,
  coHost = null,
  accountId = null,
} = {}) =>
  Boolean(
    isHost ||
      hasCoHostPermission(
        coHost,
        accountId,
        CO_HOST_PERMISSIONS.MANAGE_STUDENT_SHARE,
      ),
  )
