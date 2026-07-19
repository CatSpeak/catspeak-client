import { useMemo, useRef } from "react"

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
  const initialMessageIdsRef = useRef(new Set())
  const prevConversationIdRef = useRef(null)

  // Reset and initialize during render when conversation changes or initially loads
  if (conversation && conversation.id !== prevConversationIdRef.current) {
    prevConversationIdRef.current = conversation.id
    initialMessageIdsRef.current = new Set(
      isLoading ? [] : messages.map((m) => m.id)
    )
  } else if (!isLoading && initialMessageIdsRef.current.size === 0 && messages.length > 0) {
    initialMessageIdsRef.current = new Set(messages.map((m) => m.id))
  }

  return useMemo(() => {
    if (!conversation) return []

    const groupedItems = []
    let prevDate = null
    const isGroup = conversation.isGroup
    const otherUser = conversation.friend
    const FIVE_MIN = 5 * 60 * 1000

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

      // Grouping: same sender within 5 minutes
      const isSameSenderAsPrev =
        prevMsg &&
        prevMsg.senderId === msg.senderId &&
        new Date(msg.timestamp) - new Date(prevMsg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(prevMsg.timestamp).toDateString()

      const isSameSenderAsNext =
        nextMsg &&
        nextMsg.senderId === msg.senderId &&
        new Date(nextMsg.timestamp) - new Date(msg.timestamp) < FIVE_MIN &&
        new Date(msg.timestamp).toDateString() ===
          new Date(nextMsg.timestamp).toDateString()

      const isFirstInGroup = !isSameSenderAsPrev
      const isLastInGroup = !isSameSenderAsNext
      const isOwn = msg.senderId === currentUser.id

      // Resolve sender info
      const sender = isOwn
        ? currentUser
        : !isGroup && otherUser && otherUser.accountId === msg.senderId
          ? {
              id: otherUser.accountId,
              name: otherUser.username,
              avatar: otherUser.avatarImageUrl,
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
                  }
                : {
                    id: msg.sender?.accountId || msg.senderId,
                    name: msg.sender?.username || "User",
                    avatar: msg.sender?.avatarImageUrl,
                  }
            })()

      const shouldAnimate =
        !initialMessageIdsRef.current.has(msg.id) &&
        new Date() - new Date(msg.timestamp) < 15000

      groupedItems.push({
        type: "message",
        id: msg.id,
        message: msg,
        isOwn,
        isFirstInGroup,
        isLastInGroup,
        sender,
        isGroupChat: isGroup,
        shouldAnimate,
      })
    }

    return groupedItems
  }, [messages, currentUser, conversation, isLoading])
}
