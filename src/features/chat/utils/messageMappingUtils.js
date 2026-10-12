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
export const mapToChatMessageViewModel = (msg, currentUserId, sourceAccountId) => {
  const myId = currentUserId != null ? Number(currentUserId) : null
  const sourceId = sourceAccountId != null ? Number(sourceAccountId) : null

  return {
    id: msg.messageId,
    messageId: msg.messageId,
    conversationId: msg.conversationId,
    senderId: msg.sender?.accountId,
    sender: msg.sender,
    content: msg.messageContent,
    messageContent: msg.messageContent,
    timestamp: msg.createDate,
    createDate: msg.createDate,
    messageType: normalizeMessageType(msg.messageType),
    isRead: Boolean(msg.isRead),
    status: msg.isRead ? "read" : "delivered",
    readByAccountIds: msg.readByAccountIds || [],
    readByUsers: msg.readByUsers || [],
    mentionedAccountIds: msg.mentionedAccountIds || [],
    parentMessageId: msg.parentMessageId,
    parentMessage: msg.replyToMessage,
    replyToMessage: msg.replyToMessage,
    mediaUrl: msg.mediaUrl,
    fileName: msg.fileName,
    fileSize: msg.fileSize,
    audioDuration: msg.audioDuration,
    isRecalled: Boolean(msg.isRecalled),
    recalledAt: msg.recalledAt,
    reactions: (msg.reactions || []).map((group) => {
      const userIds = (group.userIds || []).map(Number)
      const hasReacted =
        Boolean(group.hasReacted) ||
        (myId != null && userIds.includes(myId)) ||
        (sourceId != null && userIds.includes(sourceId))
      return {
        ...group,
        userIds,
        hasReacted,
      }
    }),
    isEdited: Boolean(msg.isEdited),
    forwardedFromSenderName: msg.forwardedFromSenderName,
    clientMessageId: msg.clientMessageId,
  }
}
