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

/**
 * STB (Speaking Time Balance) is only available and visible for classes room
 * (both dependent and independent classes) and their breakout rooms,
 * NOT in normal (OneToOne, Group) or custom rooms.
 * @param {object} room - Room object containing roomType, id, isClassRoom, etc.
 * @param {string|number} [roomType] - Optional explicit roomType if room object is not provided
 * @returns {boolean}
 */
export const isSpeakingTimeBalanceSupported = (room, roomType) => {
  if (!room && roomType == null) return false;

  // Direct boolean flag set for class rooms
  if (room?.isClassRoom === true) return true;

  // If roomId starts with "class-"
  if (typeof room?.id === "string" && room.id.startsWith("class-")) return true;

  // If room has classId property
  if (room?.classId != null) return true;

  // Check explicit roomType (Class = 3)
  const targetType = room?.roomType !== undefined ? room.roomType : roomType;
  if (targetType !== undefined && targetType !== null) {
    const str = String(targetType).toLowerCase();
    return str === "class" || str === "3";
  }

  return false;
};


