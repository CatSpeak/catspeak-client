/**
 * Canonical normalizer for backend MessageType enum (handles integers, strings, PascalCase).
 * Maps enum: 0 -> Text, 1 -> Image, 2 -> Video, 3 -> Audio, 4 -> System, 5 -> Recalled, 6 -> StoryInterest.
 */
export const normalizeMessageType = (rawType) => {
  if (rawType == null) return "Text"
  if (rawType === 4 || rawType === "4") return "System"
  if (rawType === 5 || rawType === "5") return "Recalled"
  if (rawType === 6 || rawType === "6") return "StoryInterest"
  if (typeof rawType === "string" && rawType.trim().length > 0) {
    const lower = rawType.toLowerCase()
    if (lower === "system") return "System"
    if (lower === "recalled") return "Recalled"
    if (lower === "storyinterest") return "StoryInterest"
    return rawType
  }
  return "Text"
}

/**
 * Maps a raw/accumulated message object to the standardized UI view model.
 * Handles reaction status calculation for current user and field normalization.
 *
 * @param {object} msg - The source message item
 * @param {number|string|null} currentUserId - The authenticated user's ID
 * @returns {object} Formatted UI message view model
 */
export const mapToChatMessageViewModel = (msg, currentUserId) => {
  const myId = currentUserId != null ? Number(currentUserId) : null

  return {
    id: msg.messageId ?? msg.id,
    conversationId: msg.conversationId,
    senderId: msg.sender?.accountId ?? msg.senderId,
    content: msg.messageContent ?? msg.content,
    timestamp: msg.createDate ?? msg.timestamp,
    messageType: normalizeMessageType(msg.messageType ?? msg.MessageType),
    isRead: msg.isRead ?? false,
    status: msg.isRead ? "read" : "delivered",
    readByAccountIds: msg.readByAccountIds || [],
    sender: msg.sender,
    parentMessageId: msg.parentMessageId,
    parentMessage: msg.parentMessage || msg.replyToMessage,
    mediaUrl: msg.mediaUrl || msg.fileUrl || msg.attachmentUrl,
    fileName: msg.fileName,
    fileSize: msg.fileSize,
    isRecalled: msg.isRecalled,
    isDeleted: msg.isDeleted,
    readByUsers: msg.readByUsers,
    reactions: (msg.reactions || []).map((group) => {
      const userIds = group.userIds || group.UserIds || []
      const hasReacted =
        myId != null && Array.isArray(userIds) && userIds.length > 0
          ? userIds.some((id) => Number(id) === myId)
          : Boolean(group.hasReacted)
      return {
        ...group,
        hasReacted,
      }
    }),
    isEdited: msg.isEdited ?? false,
    lastEdited: msg.lastEdited,
    forwardedFromSenderName: msg.forwardedFromSenderName,
    clientMessageId: msg.clientMessageId,
  }
}
