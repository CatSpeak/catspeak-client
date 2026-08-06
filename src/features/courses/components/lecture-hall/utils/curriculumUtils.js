import { formatFileSize } from "./fileUtils"

/**
 * getDisplayData — returns display info for a curriculum item.
 * @param {object} item
 * @param {object} labels - i18n labels
 * @param {string} locale  - BCP-47 locale string (kept for non-date use)
 * @param {function} formatDate - date formatter from useTimezone()
 */
export const getDisplayData = (item, labels, locale, formatDate) => {
  if (item.type) {
    return {
      type: item.type,
      title: item.title,
      meta: item.meta,
      metaType: item.metaType,
      realItemId: item.itemId,
    }
  }

  // Process new format from backend
  let type = "assignment"
  let title = labels.noTitle
  let meta = null
  let metaType = "none"

  if (item.itemType === "BulletinBoard" && item.bulletinBoard) {
    type = "bulletinBoard"
    title = item.bulletinBoard.title
    meta = item.bulletinBoard.postCount > 0
      ? labels.postCount.replace("{{count}}", String(item.bulletinBoard.postCount))
      : null
    metaType = "none"
  } else if (item.itemType === "Assignment" && item.assignment) {
    type = "assignment"
    title = item.assignment.name
    if (item.assignment.dueDate) {
      const date = formatDate ? formatDate(item.assignment.dueDate) : item.assignment.dueDate
      meta = labels.dueDateMeta.replace("{{date}}", date)
      metaType = "time"
    }
  } else if (item.itemType === "Quiz" && item.quiz) {
    type = "assignment" // Map to assignment icon
    title = item.quiz.name
    if (item.quiz.closeTime) {
      const date = formatDate ? formatDate(item.quiz.closeTime) : item.quiz.closeTime
      meta = labels.closesAtMeta.replace("{{date}}", date)
      metaType = "time"
    }
  } else if (item.itemType === "Material" && item.material) {
    type = "material"
    title = item.material.title || item.material.fileName || labels.unnamedMaterial
    const ext = item.material.fileName
      ? item.material.fileName.split(".").pop().toUpperCase()
      : labels.fileTypeFallback
    const sizeBytes = item.material.fileSize || item.material.size || 0
    const sizeStr = sizeBytes > 0 ? formatFileSize(sizeBytes) : labels.unknownFileSize
    meta = `${ext} • ${sizeStr}`
    metaType = "file"
  } else if (item.itemType === "Link" && item.link) {
    type = "link"
    title = item.link.title
    meta = item.link.url
    metaType = "none"
  }

  return { type, title, meta, metaType, realItemId: item.itemId }
}
