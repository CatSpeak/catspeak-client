/**
 * Translates special room names based on pre-defined mappings.
 *
 * @param {string} name - The original room name.
 * @param {object} t - The translation object (usually from useLanguage hook).
 * @returns {string} - The translated room name or original name if no mapping found.
 */
export const getTranslatedRoomName = (name, t) => {
  if (!name || !t?.rooms?.specialNames) return name

  if (
    name === "你喜欢出去玩玛" ||
    name === "你喜欢出去玩吗" ||
    name === "你喜欢出去斑聘"
  ) {
    return t.rooms.specialNames.doYouLikeToGoOut || name
  }

  if (name === "HSK备考室") {
    return t.rooms.specialNames.hskExamPrep || name
  }

  if (name === "你有养宠物吗?" || name === "你有养宠物吗？") {
    return t.rooms.specialNames.doYouHavePets || name
  }

  if (name === "学校生活") {
    return t.rooms.specialNames.schoolLife || name
  }

  if (name === "我喜欢什么") {
    return t.rooms.specialNames.whatILike || name
  }

  if (
    name === "你喜欢读书吗?" ||
    name === "你喜欢读书吗？" ||
    name === "Bạn có thích đọc sách?"
  ) {
    return t.rooms.specialNames.doYouLikeReading || name
  }

  if (name === "爱情的事情" || name === "Chuyện về tình yêu") {
    return t.rooms.specialNames.aboutLove || name
  }

  return name
}
