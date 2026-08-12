/**
 * Helpers to check feature support based on backend RoomType enum:
 *  - OneToOne = 1
 *  - Group = 2
 *  - Class = 3
 *  - Custom = 4
 */

export const isOneToOneOrGroup = (roomType) => {
  if (roomType === undefined || roomType === null) return false;
  const str = String(roomType).toLowerCase();
  return str === "onetoone" || str === "1" || str === "group" || str === "2";
};

export const isClassOrCustom = (roomType) => {
  if (roomType === undefined || roomType === null) return true; // Default fallback to custom
  const str = String(roomType).toLowerCase();
  return str === "class" || str === "3" || str === "custom" || str === "4";
};

export const isBeautyFilterSupported = (roomType) => {
  // Beauty filter is disabled for OneToOne and Group, enabled for Class and Custom
  if (isOneToOneOrGroup(roomType)) return false;
  return isClassOrCustom(roomType);
};

export const isBreakoutSupported = (roomType) => {
  // Breakout rooms are disabled for OneToOne and Group, enabled for Class and Custom
  if (isOneToOneOrGroup(roomType)) return false;
  return isClassOrCustom(roomType);
};

export const isCustomRoom = (roomType) => {
  if (roomType === undefined || roomType === null) return false;
  const str = String(roomType).toLowerCase();
  return str === "custom" || str === "4";
};

/**
 * Check if a given user/accountId is the host/creator of a room.
 * @param {object} room - Room object containing creatorId and roomType
 * @param {object|number|string} userOrAccountId - User object or account ID
 * @returns {boolean}
 */
export const isRoomHost = (room, userOrAccountId) => {
  if (!room?.creatorId || userOrAccountId == null) return false;
  const targetId =
    typeof userOrAccountId === "object"
      ? userOrAccountId?.accountId
      : userOrAccountId;
  if (targetId == null) return false;
  return String(room.creatorId) === String(targetId);
};


