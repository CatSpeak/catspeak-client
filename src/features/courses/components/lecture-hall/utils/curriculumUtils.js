import { formatFileSize } from "./fileUtils"

export const getDisplayData = (item) => {
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
  let title = "Không có tiêu đề"
  let meta = null
  let metaType = "none"

  if (item.itemType === "BulletinBoard" && item.bulletinBoard) {
    type = "bulletinBoard"
    title = item.bulletinBoard.title
    meta = item.bulletinBoard.postCount > 0 ? `${item.bulletinBoard.postCount} bài đăng` : null
    metaType = "none"
  } else if (item.itemType === "Assignment" && item.assignment) {
    type = "assignment"
    title = item.assignment.name
    if (item.assignment.dueDate) {
      meta = `Hạn: ${new Date(item.assignment.dueDate).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}`
      metaType = "time"
    }
  } else if (item.itemType === "Quiz" && item.quiz) {
    type = "assignment" // Map to assignment icon
    title = item.quiz.name
    if (item.quiz.closeTime) {
      meta = `Đóng: ${new Date(item.quiz.closeTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}`
      metaType = "time"
    }
  } else if (item.itemType === "Material" && item.material) {
    type = "material"
    title = item.material.title || item.material.fileName || "Tài liệu không tên"
    const ext = item.material.fileName ? item.material.fileName.split('.').pop().toUpperCase() : "FILE"
    const sizeBytes = item.material.fileSize || item.material.size || 0
    const sizeStr = sizeBytes > 0 ? formatFileSize(sizeBytes) : "Không rõ dung lượng"
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
