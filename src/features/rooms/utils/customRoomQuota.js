export const isCustomRoomQuotaFull = (customRoomsData) =>
  customRoomsData?.canCreateCustomRoom === false

export const buildCustomRoomQuota = ({
  customRoomsData,
  limits,
  fallbackUsed = 0,
} = {}) => ({
  used: customRoomsData?.currentCustomRoomsCount ?? fallbackUsed,
  max: limits?.maxActiveCustomRooms ?? 0,
})
