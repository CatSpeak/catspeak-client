import { parseApiError, resolveLocalizedError } from "@/shared/utils/apiError"

/**
 * Machine-readable error codes returned by co-host APIs
 * (cath ErrorCodes.CoHost + instructor ErrorCode.CoHost*).
 * API trả code, client map code -> message localized (t.rooms.coHost.errors).
 */
export const COHOST_ERROR_CODES = {
  PERMISSION_REQUIRED: "COHOST_PERMISSION_REQUIRED",
  PERMISSION_INVALID: "COHOST_PERMISSION_INVALID",
  ROOM_TYPE_UNSUPPORTED: "COHOST_ROOM_TYPE_UNSUPPORTED",
  NOT_HOST: "COHOST_NOT_HOST",
  CANNOT_ASSIGN_OWNER: "COHOST_CANNOT_ASSIGN_OWNER",
  TARGET_NOT_ONLINE: "COHOST_TARGET_NOT_ONLINE",
  TARGET_BANNED: "COHOST_TARGET_BANNED",
  TARGET_NOT_CONFIRMED: "COHOST_TARGET_NOT_CONFIRMED",
  NO_ASSIGNMENT: "COHOST_NO_ASSIGNMENT",
}

const VI_FALLBACKS = {
  [COHOST_ERROR_CODES.PERMISSION_REQUIRED]:
    "Phải chọn ít nhất một quyền cho co-host.",
  [COHOST_ERROR_CODES.PERMISSION_INVALID]: "Quyền co-host không hợp lệ.",
  [COHOST_ERROR_CODES.ROOM_TYPE_UNSUPPORTED]:
    "Chỉ phòng Lớp học và phòng Pro/Custom mới hỗ trợ co-host.",
  [COHOST_ERROR_CODES.NOT_HOST]: "Chỉ chủ phòng mới được phân công co-host.",
  [COHOST_ERROR_CODES.CANNOT_ASSIGN_OWNER]:
    "Không thể phân công chủ phòng/lớp làm co-host.",
  [COHOST_ERROR_CODES.TARGET_NOT_ONLINE]:
    "Chỉ người đang online trong phòng mới được làm co-host.",
  [COHOST_ERROR_CODES.TARGET_BANNED]:
    "Người dùng đang bị cấm không thể làm co-host.",
  [COHOST_ERROR_CODES.TARGET_NOT_CONFIRMED]:
    "Chỉ học viên đã xác nhận (Confirmed) mới được làm co-host.",
  [COHOST_ERROR_CODES.NO_ASSIGNMENT]: "Chưa có co-host được phân công.",
}

/**
 * Map backend errorCode -> localized message.
 * @param {object} err RTK Query error
 * @param {object} t language object (useLanguage().t)
 * @param {string} fallback message khi không map được code
 */
export function resolveCoHostErrorMessage(err, t, fallback) {
  const messages = t?.rooms?.coHost?.errors || {}
  return resolveLocalizedError(
    err,
    (e, code) => messages[code] || VI_FALLBACKS[code],
    fallback,
  )
}

/**
 * Lấy errorCode thô từ lỗi API (để so sánh logic nếu cần).
 */
export function getCoHostErrorCode(err) {
  return parseApiError(err).errorCode
}
