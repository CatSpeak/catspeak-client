import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  useGetConversationMessagesQuery,
  useLazyGetConversationMessagesQuery,
} from "@/store/api/social/conversationsApi"
import { useAuth } from "@/features/auth"
import { applyReactionToggle } from "../utils/reactionUtils"
import {
  normalizeMessageType,
  mapToChatMessageViewModel,
} from "../utils/messageMappingUtils"
import useChatMessagesRealtime from "./useChatMessagesRealtime"

export { normalizeMessageType }

const PAGE_SIZE = 30

/**
 * Custom hook for managing conversation messages with cursor pagination (beforeId/limit),
 * real-time SignalR updates (delegated to useChatMessagesRealtime),
 * and optimistic UI updates for editing and reactions.
 *
 * @param {string|number|null} selectedId - The currently selected conversation ID
 */
export default function useChatMessages(selectedId) {
  const { user } = useAuth()
  const currentUserId = user?.accountId ?? user?.id ?? user?.userId

  const [accumulatedMessages, setAccumulatedMessages] = useState([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [isFetchingOlder, setIsFetchingOlder] = useState(false)
  const prevSelectedIdRef = useRef(selectedId)

  // Reset pagination state on active conversation change
  useEffect(() => {
    if (selectedId !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedId
      setAccumulatedMessages([])
      setHasMoreMessages(true)
      setIsFetchingOlder(false)
    }
  }, [selectedId])

  // Initial fetch for the selected conversation (limit = 30)
  const {
    currentData: currentInitialMessages,
    isLoading: isLoadingQuery,
    isFetching: isFetchingInitial,
    isError: isMessagesError,
  } = useGetConversationMessagesQuery(
    selectedId ? { conversationId: selectedId, limit: PAGE_SIZE } : undefined,
    { skip: !selectedId },
  )

  // Immediate derivation of initial fetched items for the active conversation
  const initialFetchedItems = useMemo(() => {
    if (!currentInitialMessages) return null
    const rawItems = Array.isArray(currentInitialMessages)
      ? currentInitialMessages
      : currentInitialMessages?.data || currentInitialMessages?.items || []

    return rawItems.filter(
      (m) =>
        m.conversationId == null ||
        String(m.conversationId) === String(selectedId),
    )
  }, [currentInitialMessages, selectedId])

  // Lazy query trigger for cursor pagination (beforeId)
  const [triggerFetchMessages] = useLazyGetConversationMessagesQuery()

  // Handle initial fetch results
  useEffect(() => {
    if (!selectedId || !currentInitialMessages) return

    const rawItems = Array.isArray(currentInitialMessages)
      ? currentInitialMessages
      : currentInitialMessages?.data || currentInitialMessages?.items || []

    const fetchedItems = rawItems.filter(
      (m) =>
        m.conversationId == null ||
        String(m.conversationId) === String(selectedId),
    )

    const serverHasMore =
      typeof currentInitialMessages?.hasMore === "boolean"
        ? currentInitialMessages.hasMore
        : fetchedItems.length >= PAGE_SIZE

    setHasMoreMessages(serverHasMore)

    setAccumulatedMessages((prev) => {
      const validPrev = prev.filter(
        (m) =>
          m.conversationId == null ||
          String(m.conversationId) === String(selectedId),
      )

      if (validPrev.length === 0) {
        return fetchedItems
      }

      // Merge fetched items with validPrev, keeping newest instances
      const fetchedMap = new Map(
        fetchedItems.map((m) => [m.messageId ?? m.id, m]),
      )
      const updatedPrev = validPrev.map(
        (m) => fetchedMap.get(m.messageId ?? m.id) || m,
      )
      const prevIds = new Set(validPrev.map((m) => m.messageId ?? m.id))
      const newItems = fetchedItems.filter(
        (m) => !prevIds.has(m.messageId ?? m.id),
      )
      return [...updatedPrev, ...newItems]
    })
  }, [currentInitialMessages, selectedId])

  // Delegate real-time SignalR listeners and state patching to dedicated hook
  useChatMessagesRealtime({
    selectedId,
    currentUserId,
    setAccumulatedMessages,
  })

  // Cursor-based Load More (Older Messages)
  const handleLoadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isFetchingOlder || isFetchingInitial || !selectedId) {
      return
    }

    const validMessages = accumulatedMessages.filter(
      (m) =>
        m.conversationId == null ||
        String(m.conversationId) === String(selectedId),
    )

    if (validMessages.length === 0) return

    // Find the oldest message id to serve as cursor beforeId
    const oldestMsg = validMessages[0]
    const beforeId = oldestMsg.messageId ?? oldestMsg.id

    if (!beforeId) return

    setIsFetchingOlder(true)
    try {
      const res = await triggerFetchMessages({
        conversationId: selectedId,
        beforeId,
        limit: PAGE_SIZE,
      }).unwrap()

      const rawItems = Array.isArray(res) ? res : res?.data || res?.items || []
      const olderItems = rawItems.filter(
        (m) =>
          m.conversationId == null ||
          String(m.conversationId) === String(selectedId),
      )

      const serverHasMore =
        typeof res?.hasMore === "boolean"
          ? res.hasMore
          : olderItems.length >= PAGE_SIZE

      setHasMoreMessages(serverHasMore)

      setAccumulatedMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.messageId ?? m.id))
        const newOlderItems = olderItems.filter(
          (m) => !existingIds.has(m.messageId ?? m.id),
        )
        return [...newOlderItems, ...prev]
      })
    } catch (err) {
      console.error("Failed to load older messages via cursor:", err)
    } finally {
      setIsFetchingOlder(false)
    }
  }, [
    accumulatedMessages,
    hasMoreMessages,
    isFetchingOlder,
    isFetchingInitial,
    selectedId,
    triggerFetchMessages,
  ])

  // Optimistic UI Updaters
  const optimisticEditMessage = useCallback((messageId, newContent) => {
    setAccumulatedMessages((prev) =>
      prev.map((m) => {
        const currentId = m.messageId ?? m.id
        if (Number(currentId) === Number(messageId)) {
          return {
            ...m,
            messageContent: newContent,
            content: newContent,
            isEdited: true,
            lastEdited: new Date().toISOString(),
          }
        }
        return m
      }),
    )
  }, [])

  const optimisticToggleReaction = useCallback(
    (messageId, emoji) => {
      setAccumulatedMessages((prev) =>
        prev.map((m) => {
          const currentId = m.messageId ?? m.id
          if (Number(currentId) === Number(messageId)) {
            return {
              ...m,
              reactions: applyReactionToggle(m.reactions, emoji, currentUserId),
            }
          }
          return m
        }),
      )
    },
    [currentUserId],
  )

  // Map messages to consistent view models using pure transformer
  const activeMessages = useMemo(() => {
    const validAccumulated = accumulatedMessages.filter(
      (msg) =>
        msg.conversationId == null ||
        String(msg.conversationId) === String(selectedId),
    )

    const sourceMessages =
      validAccumulated.length > 0
        ? validAccumulated
        : initialFetchedItems || []

    return sourceMessages.map((msg) =>
      mapToChatMessageViewModel(msg, currentUserId),
    )
  }, [accumulatedMessages, initialFetchedItems, selectedId, currentUserId])

  const hasMessagesForCurrentConv = useMemo(() => {
    const hasInAccumulated = accumulatedMessages.some(
      (m) =>
        m.conversationId == null ||
        String(m.conversationId) === String(selectedId),
    )
    if (hasInAccumulated) return true
    return Boolean(initialFetchedItems && initialFetchedItems.length > 0)
  }, [accumulatedMessages, selectedId, initialFetchedItems])

  const isLoadingMessages = Boolean(
    selectedId &&
      !isMessagesError &&
      !hasMessagesForCurrentConv &&
      (isLoadingQuery || isFetchingInitial || currentInitialMessages === undefined),
  )

  return {
    activeMessages,
    accumulatedMessagesCount: accumulatedMessages.length,
    isLoadingMessages,
    isFetchingOlder,
    isFetchingMessages: isFetchingInitial || isFetchingOlder,
    hasMoreMessages,
    handleLoadMoreMessages,
    optimisticEditMessage,
    optimisticToggleReaction,
  }
}
