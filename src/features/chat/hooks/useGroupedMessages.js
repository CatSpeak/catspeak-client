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

    let lastNonSystemMsgIndex = -1
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].messageType?.toLowerCase() !== "system") {
        lastNonSystemMsgIndex = i
        break
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      const msgDate = new Date(msg.timestamp).toDateString()
      const prevMsg = i > 0 ? messages[i - 1] : null
      const nextMsg = i < messages.length - 1 ? messages[i + 1] : null

      // Date separator
      if (msgDate !== prevDate) {
        groupedItems.push({
          type: "date",
          id: `date-${msgDate}`,
          timestamp: msg.timestamp,
        })
        prevDate = msgDate
      }

      // System messages handling
      if (msg.messageType?.toLowerCase() === "system") {
        groupedItems.push({
          type: "system",
          id: msg.id,
          message: msg,
          timestamp: msg.timestamp,
        })
        continue
      }

      // Grouping: same sender within 5 minutes
      const isSameSenderAsPrev =
        prevMsg &&
        prevMsg.messageType?.toLowerCase() !== "system" &&
        prevMsg.senderId === msg.senderId &&
        new Date(msg.timestamp) - new Date(prevMsg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(prevMsg.timestamp).toDateString()

      const isSameSenderAsNext =
        nextMsg &&
        nextMsg.messageType?.toLowerCase() !== "system" &&
        nextMsg.senderId === msg.senderId &&
        new Date(nextMsg.timestamp) - new Date(msg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(nextMsg.timestamp).toDateString()

      const isFirstInGroup = !isSameSenderAsPrev
      const isLastInGroup = !isSameSenderAsNext
      const isOwn = msg.senderId === currentUser.id
      const isLastMessageInChat = i === lastNonSystemMsgIndex

      // Resolve sender info
      const sender = isOwn
        ? {
            id: currentUser.id,
            name: currentUser.name,
            avatar: currentUser.avatar || msg.sender?.avatarImageUrl,
            ...msg.sender,
          }
        : !isGroup && otherUser && otherUser.accountId === msg.senderId
          ? {
              id: otherUser.accountId,
              name: otherUser.username,
              avatar: otherUser.avatarImageUrl,
              ...msg.sender,
            }
          : (() => {
              const p = conversation.participants?.find(
                (part) => part.accountId === msg.senderId,
              )
              return p
                ? {
                    id: p.accountId,
                    name: p.username,
                    avatar: p.avatarImageUrl,
                    ...msg.sender,
                  }
                : {
                    id: msg.sender?.accountId || msg.senderId,
                    name: msg.sender?.username || "User",
                    avatar: msg.sender?.avatarImageUrl,
                    ...msg.sender,
                  }
            })()

      const shouldAnimate =
        !initialMessageIds.has(msg.id) &&
        new Date() - new Date(msg.timestamp) < 15000

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
