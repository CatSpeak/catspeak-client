export const isCustomRoomQuotaFull = (customRoomsData) =>
  customRoomsData?.canCreateCustomRoom === false

export const buildCustomRoomQuota = ({
  customRoomsData,
  limits,
  fallbackUsed = 0,
} = {}) => {
  const max = limits?.maxActiveCustomRooms ?? 0
  return {
    used: customRoomsData?.currentCustomRoomsCount ?? fallbackUsed,
    max,
    hasCustomQuota: max > 0,
  }
}

/**
 * ISS-14: the created-rooms header always reports the active room count and
 * only mentions the fixed-room quota when the plan actually has one (Free
 * accounts have `maxActiveCustomRooms = 0`, so they must never see "0/0").
 */
export const formatWorkspaceRoomsSummary = ({
  totalActiveRooms = 0,
  customQuota = {},
  ct = {},
} = {}) => {
  const total = Number(totalActiveRooms) || 0
  const activeSummary = (
    ct.activeRoomsSummary || "{{count}} phòng đang hoạt động"
  ).replace("{{count}}", total)

  const max = Number(customQuota?.max) || 0
  if (max <= 0) return activeSummary

  const used = Number(customQuota?.used) || 0
  const quotaSummary = (
    ct.customRoomQuotaLabel || "Phòng cố định (Pro): {{used}}/{{max}} đã dùng"
  )
    .replace("{{used}}", used)
    .replace("{{max}}", max)

  return `${activeSummary} · ${quotaSummary}`
}
