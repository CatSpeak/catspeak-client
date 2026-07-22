import { useState, useEffect, useCallback, useMemo } from "react"
import { useGetConversationMessagesQuery } from "@/store/api/social/conversationsApi"

const PAGE_SIZE = 30

/**
 * Custom hook for managing conversation messages, pagination, deduplication, and formatting.
 *
 * @param {string|number|null} selectedId - The currently selected conversation ID
 */
export default function useChatMessages(selectedId) {
  const [page, setPage] = useState(1)
  const [accumulatedMessages, setAccumulatedMessages] = useState([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  // Reset pagination state on active conversation change
  useEffect(() => {
    setPage(1)
    setAccumulatedMessages([])
    setHasMoreMessages(true)
  }, [selectedId])

  // Fetch messages for selected conversation (paginated)
  const {
    data: activeMessagesResponse = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetConversationMessagesQuery(
    selectedId ? { conversationId: selectedId, page, pageSize: PAGE_SIZE } : undefined,
    { skip: !selectedId },
  )

  useEffect(() => {
    if (!selectedId || !activeMessagesResponse) return

    const fetchedItems = Array.isArray(activeMessagesResponse)
      ? activeMessagesResponse
      : activeMessagesResponse?.data || activeMessagesResponse?.items || []

    const totalPages =
      activeMessagesResponse?.totalPages ||
      activeMessagesResponse?.totalPage ||
      activeMessagesResponse?.pageCount

    const hasMore = totalPages
      ? page < totalPages
      : fetchedItems.length >= PAGE_SIZE

    setHasMoreMessages(hasMore)

    setAccumulatedMessages((prev) => {
      if (page === 1) {
        if (prev.length > 0) {
          const fetchedMap = new Map(
            fetchedItems.map((m) => [m.messageId ?? m.id, m]),
          )
          const updatedPrev = prev.map(
            (m) => fetchedMap.get(m.messageId ?? m.id) || m,
          )
          const prevIds = new Set(prev.map((m) => m.messageId ?? m.id))
          const newItems = fetchedItems.filter(
            (m) => !prevIds.has(m.messageId ?? m.id),
          )
          return [...updatedPrev, ...newItems]
        }
        return fetchedItems
      }

      const existingIds = new Set(prev.map((m) => m.messageId ?? m.id))
      const newOlderItems = fetchedItems.filter(
        (m) => !existingIds.has(m.messageId ?? m.id),
      )
      return [...newOlderItems, ...prev]
    })
  }, [activeMessagesResponse, page, selectedId])

  const handleLoadMoreMessages = useCallback(() => {
    if (hasMoreMessages && !isFetchingMessages) {
      setPage((prev) => prev + 1)
    }
  }, [hasMoreMessages, isFetchingMessages])

  const activeMessages = useMemo(() => {
    return accumulatedMessages.map((msg) => ({
      id: msg.messageId ?? msg.id,
      conversationId: msg.conversationId,
      senderId: msg.sender?.accountId,
      content: msg.messageContent,
      timestamp: msg.createDate,
      messageType: msg.messageType || "Text",
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
    }))
  }, [accumulatedMessages])

  return {
    activeMessages,
    accumulatedMessagesCount: accumulatedMessages.length,
    isLoadingMessages,
    isFetchingMessages,
    hasMoreMessages,
    handleLoadMoreMessages,
    page,
  }
}
