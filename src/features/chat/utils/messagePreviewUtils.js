/**
 * Helper to compute a concise, user-friendly preview string for a message.
 * Handles text, voice recordings, photos, videos, files, and recalled messages.
 *
 * @param {object} msg - The message object (or reply target)
 * @param {object} t   - The translation object from useLanguage()
 * @returns {string} User-facing preview text
 */
export const getMessagePreview = (msg, t) => {
  if (!msg) return ""

  const isRecalled =
    msg.isRecalled ||
    msg.messageType === "Recalled" ||
    msg.messageType === 5 ||
    msg.content === "[Message Recalled]" ||
    msg.messageContent === "Tin nhắn đã bị thu hồi"

  if (isRecalled) {
    return t?.chat?.recalledMessage || "Tin nhắn đã bị thu hồi"
  }

  const rawText = msg.content || msg.messageContent
  if (rawText && typeof rawText === "string" && rawText.trim().length > 0) {
    return rawText.trim()
  }

  const msgType = String(msg.messageType || "").toLowerCase()
  const mediaUrl = msg.mediaUrl || msg.fileUrl || msg.attachmentUrl || ""

  const isAudio =
    ["audio", "voice", "4"].includes(msgType) ||
    msg.audioDuration != null ||
    Boolean(mediaUrl.match(/\.(weba|mp3|wav|m4a|aac|oga|opus)(\?.*)?$/i)) ||
    (Boolean(mediaUrl.match(/\.webm(\?.*)?$/i)) && (msgType === "audio" || !mediaUrl.match(/video/i)))

  if (isAudio) {
    return `🎤 ${t?.chat?.voiceMessage || "Voice message"}`
  }

  const isImage =
    ["image", "picture", "photo", "1"].includes(msgType) ||
    Boolean(mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i))

  if (isImage) {
    return `📷 ${t?.chat?.photo || t?.chat?.image || "Photo"}`
  }

  const isVideo =
    ["video", "2"].includes(msgType) ||
    Boolean(mediaUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i))

  if (isVideo) {
    return `🎥 ${t?.chat?.video || "Video"}`
  }

  const isFile =
    ["file", "document", "3"].includes(msgType) ||
    Boolean(msg.fileName) ||
    Boolean(mediaUrl)

  if (isFile) {
    return `📄 ${msg.fileName || t?.chat?.attachment || "Attachment"}`
  }

  return msg.parentMessageContent || t?.chat?.message || "Message"
}
