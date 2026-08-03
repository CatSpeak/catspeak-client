import { formatFileSize } from "./fileUtils"
import { formatDateTime } from "@/shared/utils/dateFormatter"

export const getDisplayData = (item, labels, locale) => {
  if (item.type) {
    let finalMeta = item.meta
    let finalMetaType = item.metaType

    if (item.type === "assignment" && item.dueDate) {
      const date = formatDateTime(item.dueDate, locale)
      finalMeta = labels.dueDateMeta?.replace("{{date}}", date) || `Hạn nộp: ${date}`
      finalMetaType = "time" // Using time maps to Clock icon
    } else if (item.type === "quiz" && (item.openTime || item.closeTime)) {
      const openStr = item.openTime ? `${labels.openTime || "Mở"}: ${formatDateTime(item.openTime, locale)}` : ""
      const closeStr = item.closeTime ? `${labels.closeTime || "Đóng"}: ${formatDateTime(item.closeTime, locale)}` : ""
      finalMeta = [openStr, closeStr].filter(Boolean).join(", ")
      finalMetaType = "time"
    }

    return {
      type: item.type,
      title: item.title,
      meta: finalMeta,
      metaType: finalMetaType,
      itemId: item.itemId,
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
      const date = formatDateTime(item.assignment.dueDate, locale)
      meta = labels.dueDateMeta.replace("{{date}}", date)
      metaType = "time"
    }
  } else if (item.itemType === "Quiz" && item.quiz) {
    type = "assignment" // Map to assignment icon
    title = item.quiz.name
    if (item.quiz.closeTime) {
      const date = formatDateTime(item.quiz.closeTime, locale)
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

  return { type, title, meta, metaType, itemId: item.itemId }
}
