/**
 * Nơi phát sinh nội dung, gửi kèm mỗi lần che ★ (POST /moderation/text).
 *
 * Trang "Kiểm duyệt AI" bên admin dựa vào đây để biết ca vi phạm là công khai (admin
 * xem nguyên văn) hay riêng tư (chỉ xem bản che). Tên phải khớp danh sách bên
 * catspeak-api (ModerationContexts.ClientAllowed); tên lạ bị coi là "unknown".
 */
export const MODERATION_CONTEXT = Object.freeze({
  MEET_CHAT: "meet-chat",
  DIRECT_CHAT: "chat-1-1",
  POST_TITLE: "post-title",
  POST_CONTENT: "post-content",
  POST_COMMENT: "post-comment",
  STORY: "story",
})

/** Bài viết có cả tiêu đề lẫn nội dung: tiêu đề một context, các trường còn lại một context. */
export const POST_FIELD_CONTEXTS = Object.freeze({
  title: MODERATION_CONTEXT.POST_TITLE,
  "*": MODERATION_CONTEXT.POST_CONTENT,
})

/**
 * Context cho một trường của body. `context` là chuỗi (mọi trường chung một nơi) hoặc
 * object { tênTrường: context, "*": mặc định }. Tên trường so không phân biệt hoa thường.
 */
export function contextForKey(context, key) {
  if (!context) return undefined
  if (typeof context === "string") return context
  const k = String(key).toLowerCase()
  return context[k] ?? context["*"]
}
