import { useMemo, useState } from "react"

/**
 * useGroupedMessages — processes messages and groups them with date separators
 * and metadata (isFirstInGroup, isLastInGroup, shouldAnimate, resolved sender).
 *
 * Returns a structured list of date separators and message item objects.
 */
export const useGroupedMessages = ({
  messages = [],
  currentUser,
  conversation,
  isLoading,
}) => {
  const [initialMessageIds, setInitialMessageIds] = useState(() => new Set())
  const [prevConversationId, setPrevConversationId] = useState(null)

  const currentConvId = conversation?.id || null
  if (currentConvId !== prevConversationId) {
    setPrevConversationId(currentConvId)
    setInitialMessageIds(new Set(isLoading ? [] : messages.map((m) => m.id)))
  } else if (!isLoading && initialMessageIds.size === 0 && messages.length > 0) {
    setInitialMessageIds(new Set(messages.map((m) => m.id)))
  }

  return useMemo(() => {
    if (!conversation) return []

    const groupedItems = []
    let prevDate = null
    const isGroup = conversation.isGroup
    const otherUser = conversation.friend
    const FIVE_MIN = 5 * 60 * 1000

    const getMessageTypeStr = (m) =>
      m && m.messageType != null ? String(m.messageType).toLowerCase() : ""

    let lastNonSystemMsgIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (getMessageTypeStr(messages[i]) !== "system") {
        lastNonSystemMsgIndex = i
        break
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const msgTimestamp = msg.timestamp || msg.createDate
      const msgSenderId = msg.senderId ?? msg.sender?.accountId
      const msgId = msg.id || msg.messageId
      const msgDate = new Date(msgTimestamp).toDateString()

      const prevMsg = i > 0 ? messages[i - 1] : null
      const nextMsg = i < messages.length - 1 ? messages[i + 1] : null

      const prevTimestamp = prevMsg?.timestamp || prevMsg?.createDate
      const nextTimestamp = nextMsg?.timestamp || nextMsg?.createDate
      const prevSenderId = prevMsg?.senderId ?? prevMsg?.sender?.accountId
      const nextSenderId = nextMsg?.senderId ?? nextMsg?.sender?.accountId

      // Date separator
      if (msgDate !== prevDate) {
        groupedItems.push({
          type: "date",
          id: `date-${msgDate}`,
          timestamp: msgTimestamp,
        })
        prevDate = msgDate
      }

      // System messages handling
      if (getMessageTypeStr(msg) === "system") {
        groupedItems.push({
          type: "system",
          id: msgId,
          message: msg,
          timestamp: msgTimestamp,
        })
        continue
      }

      // Grouping: same sender within 5 minutes
      const isSameSenderAsPrev =
        prevMsg &&
        getMessageTypeStr(prevMsg) !== "system" &&
        prevSenderId === msgSenderId &&
        new Date(msgTimestamp) - new Date(prevTimestamp) < FIVE_MIN &&
        new Date(msgTimestamp).toDateString() ===
          new Date(prevTimestamp).toDateString()

      const isSameSenderAsNext =
        nextMsg &&
        getMessageTypeStr(nextMsg) !== "system" &&
        nextSenderId === msgSenderId &&
        new Date(nextTimestamp) - new Date(msgTimestamp) < FIVE_MIN &&
        new Date(msgTimestamp).toDateString() ===
          new Date(nextTimestamp).toDateString()

      const isFirstInGroup = !isSameSenderAsPrev
      const isLastInGroup = !isSameSenderAsNext
      const isOwn = Number(msgSenderId) === Number(currentUser?.id || currentUser?.accountId)
      const isLastMessageInChat = i === lastNonSystemMsgIndex

      // Resolve sender info
      const sender = isOwn
        ? {
            id: currentUser?.id || currentUser?.accountId,
            name: currentUser?.name || currentUser?.username,
            avatar: currentUser?.avatar || currentUser?.avatarImageUrl || msg.sender?.avatarImageUrl,
            ...msg.sender,
          }
        : !isGroup && otherUser && otherUser.accountId === msgSenderId
          ? {
              id: otherUser.accountId,
              name: otherUser.username,
              avatar: otherUser.avatarImageUrl,
              ...msg.sender,
            }
          : (() => {
              const p = conversation.participants?.find(
                (part) => Number(part.accountId || part.id) === Number(msgSenderId),
              )
              return p
                ? {
                    id: p.accountId || p.id,
                    name: p.username || p.name,
                    avatar: p.avatarImageUrl || p.avatar,
                    ...msg.sender,
                  }
                : {
                    id: msg.sender?.accountId || msgSenderId,
                    name: msg.sender?.username || msg.sender?.name || "User",
                    avatar: msg.sender?.avatarImageUrl || msg.sender?.avatar,
                    ...msg.sender,
                  }
            })()

      const shouldAnimate = !initialMessageIds.has(msgId)

      // Resolve users who have read this message (only evaluated for the latest message in chat)
      let readByUsers = []
      if (isLastMessageInChat) {
        if (isGroup) {
          const participants = conversation.participants || []
          const readIds = Array.isArray(msg.readByAccountIds)
            ? msg.readByAccountIds.map(Number)
            : []
          readByUsers = participants
            .filter((p) => {
              const pId = Number(p.accountId || p.id)
              return (
                pId !== Number(currentUser.id) &&
                pId !== Number(msg.senderId) &&
                readIds.includes(pId)
              )
            })
            .map((p) => ({
              id: p.accountId || p.id,
              name: p.username || p.name || "User",
              avatar: p.avatarImageUrl || p.avatar || null,
            }))
        } else if (isOwn && otherUser) {
          const isRead =
            msg.isRead ||
            (Array.isArray(msg.readByAccountIds) &&
              msg.readByAccountIds
                .map(Number)
                .includes(Number(otherUser.accountId))) ||
            msg.status === "read"

          if (isRead) {
            readByUsers = [
              {
                id: otherUser.accountId,
                name: otherUser.username || otherUser.name || "User",
                avatar: otherUser.avatarImageUrl || otherUser.avatar || null,
              },
            ]
          }
        }
      }

      groupedItems.push({
        type: "message",
        id: msg.id,
        message: msg,
        isOwn,
        isFirstInGroup,
        isLastInGroup,
        isLastMessageInChat,
        sender,
        isGroupChat: isGroup,
        shouldAnimate,
        readByUsers,
      })
    }

    return groupedItems
  }, [messages, currentUser, conversation, initialMessageIds])
}
