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
  const primaryUserId =
    user?.sourceAccountId ??
    user?.primaryAccountId ??
    user?.primaryUserId ??
    currentUserId

  const [accumulatedMessages, setAccumulatedMessages] = useState([])
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [hasMoreAfter, setHasMoreAfter] = useState(false)
  const [isFetchingOlder, setIsFetchingOlder] = useState(false)
  const [isFetchingNewer, setIsFetchingNewer] = useState(false)
  const [isViewingAroundWindow, setIsViewingAroundWindow] = useState(false)
  const [targetHighlightId, setTargetHighlightId] = useState(null)
  const [isJumpingToMessage, setIsJumpingToMessage] = useState(false)
  const prevSelectedIdRef = useRef(selectedId)

  // Reset pagination state on active conversation change
  useEffect(() => {
    if (selectedId !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = selectedId
      setAccumulatedMessages([])
      setHasMoreMessages(true)
      setHasMoreAfter(false)
      setIsFetchingOlder(false)
      setIsFetchingNewer(false)
      setIsViewingAroundWindow(false)
      setTargetHighlightId(null)
    }
  }, [selectedId])

  // Initial fetch for the selected conversation (limit = 30)
  const {
    currentData: currentInitialMessages,
    isLoading: isLoadingQuery,
    isFetching: isFetchingInitial,
    isError: isMessagesError,
    refetch: refetchInitial,
  } = useGetConversationMessagesQuery(
    selectedId ? { conversationId: selectedId, limit: PAGE_SIZE } : undefined,
    { skip: !selectedId },
  )

  // Immediate derivation of initial fetched items for the active conversation
  const initialFetchedItems = useMemo(() => {
    if (!currentInitialMessages?.items) return null
    return currentInitialMessages.items.filter(
      (m) =>
        m.conversationId == null ||
        Number(m.conversationId) === Number(selectedId),
    )
  }, [currentInitialMessages, selectedId])

  // Lazy query trigger for cursor pagination (beforeId, aroundId, afterId)
  const [triggerFetchMessages] = useLazyGetConversationMessagesQuery()

  // Handle initial fetch results (skip if currently browsing an aroundId window)
  useEffect(() => {
    if (!selectedId || !currentInitialMessages?.items || isViewingAroundWindow) return

    const fetchedItems = currentInitialMessages.items.filter(
      (m) =>
        m.conversationId == null ||
        Number(m.conversationId) === Number(selectedId),
    )

    setHasMoreMessages(currentInitialMessages.hasMoreBefore)

    setAccumulatedMessages((prev) => {
      const validPrev = prev.filter(
        (m) =>
          m.conversationId == null ||
          Number(m.conversationId) === Number(selectedId),
      )

      if (validPrev.length === 0) {
        return fetchedItems
      }

      // Merge fetched items with validPrev, keeping newest instances
      const fetchedMap = new Map(fetchedItems.map((m) => [m.messageId, m]))
      const updatedPrev = validPrev.map((m) => fetchedMap.get(m.messageId) || m)
      const prevIds = new Set(validPrev.map((m) => m.messageId))
      const newItems = fetchedItems.filter((m) => !prevIds.has(m.messageId))
      return [...updatedPrev, ...newItems]
    })
  }, [currentInitialMessages, selectedId, isViewingAroundWindow])

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
        Number(m.conversationId) === Number(selectedId),
    )

    if (validMessages.length === 0) return

    // Find the oldest message id to serve as cursor beforeId
    const oldestMsg = validMessages[0]
    const beforeId = oldestMsg.messageId

    if (!beforeId) return

    setIsFetchingOlder(true)
    try {
      const res = await triggerFetchMessages({
        conversationId: selectedId,
        beforeId,
        limit: PAGE_SIZE,
      }).unwrap()

      const olderItems = (res?.items || []).filter(
        (m) =>
          m.conversationId == null ||
          Number(m.conversationId) === Number(selectedId),
      )

      setHasMoreMessages(res?.hasMoreBefore ?? false)

      if (olderItems.length > 0) {
        setAccumulatedMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.messageId))
          const newOlderItems = olderItems.filter((m) => !existingIds.has(m.messageId))
          return [...newOlderItems, ...prev]
        })
      }
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

  // Cursor-based Load Newer Messages (When viewing aroundId window)
  const handleLoadNewerMessages = useCallback(async () => {
    if (!hasMoreAfter || isFetchingNewer || !selectedId) {
      return
    }

    const validMessages = accumulatedMessages.filter(
      (m) =>
        m.conversationId == null ||
        Number(m.conversationId) === Number(selectedId),
    )

    if (validMessages.length === 0) return

    const newestMsg = validMessages[validMessages.length - 1]
    const newestId = newestMsg.messageId

    if (!newestId) return

    setIsFetchingNewer(true)
    try {
      const res = await triggerFetchMessages({
        conversationId: selectedId,
        afterId: newestId,
        limit: PAGE_SIZE,
      }).unwrap()

      const newerItems = (res?.items || []).filter(
        (m) =>
          m.conversationId == null ||
          Number(m.conversationId) === Number(selectedId),
      )

      setHasMoreAfter(res?.hasMoreAfter ?? false)

      if (newerItems.length > 0) {
        setAccumulatedMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.messageId))
          const newItems = newerItems.filter((m) => !existingIds.has(m.messageId))
          return [...prev, ...newItems]
        })
      }
    } catch (err) {
      console.error("Failed to load newer messages:", err)
    } finally {
      setIsFetchingNewer(false)
    }
  }, [
    accumulatedMessages,
    hasMoreAfter,
    isFetchingNewer,
    selectedId,
    triggerFetchMessages,
  ])

  // Section 3.2: Jump to message with aroundId two-directional pagination
  const jumpToMessage = useCallback(
    async (targetMessageId) => {
      if (!targetMessageId || !selectedId) return

      // 1. If already present in current accumulated messages
      const existingMsg = accumulatedMessages.find(
        (m) => Number(m.messageId) === Number(targetMessageId),
      )
      if (existingMsg) {
        setTargetHighlightId(targetMessageId)
        return
      }

      // 2. Not in current window -> fetch aroundId with window limit 50
      setIsJumpingToMessage(true)
      try {
        const res = await triggerFetchMessages({
          conversationId: selectedId,
          aroundId: Number(targetMessageId),
          limit: 50,
        }).unwrap()

        const fetchedItems = (res?.items || []).filter(
          (m) =>
            m.conversationId == null ||
            Number(m.conversationId) === Number(selectedId),
        )

        if (fetchedItems.length > 0) {
          setAccumulatedMessages(fetchedItems)
          setHasMoreMessages(res?.hasMoreBefore ?? false)
          setHasMoreAfter(res?.hasMoreAfter ?? false)
          setIsViewingAroundWindow(true)
          setTargetHighlightId(targetMessageId)
        }
      } catch (err) {
        console.error("Failed to fetch messages around target ID:", err)
      } finally {
        setIsJumpingToMessage(false)
      }
    },
    [accumulatedMessages, selectedId, triggerFetchMessages],
  )

  // Reset from historical aroundId window back to real-time present (non-blocking)
  const resetToLatest = useCallback(() => {
    setIsViewingAroundWindow(false)
    setHasMoreAfter(false)
    setTargetHighlightId(null)
    if (initialFetchedItems && initialFetchedItems.length > 0) {
      setAccumulatedMessages(initialFetchedItems)
    }
    // Revalidate in background without blocking the caller
    refetchInitial()
      .then((res) => {
        if (res?.data?.items) {
          const fetchedItems = res.data.items.filter(
            (m) =>
              m.conversationId == null ||
              Number(m.conversationId) === Number(selectedId),
          )
          setAccumulatedMessages(fetchedItems)
          setHasMoreMessages(res.data.hasMoreBefore ?? false)
        }
      })
      .catch((err) => {
        console.warn("refetchInitial background error:", err)
      })
  }, [initialFetchedItems, refetchInitial, selectedId])

  const clearTargetHighlight = useCallback(() => {
    setTargetHighlightId(null)
  }, [])

  // Optimistic UI Updaters
  const optimisticEditMessage = useCallback((messageId, newContent) => {
    setAccumulatedMessages((prev) =>
      prev.map((m) => {
        if (Number(m.messageId) === Number(messageId)) {
          return {
            ...m,
            messageContent: newContent,
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
          if (Number(m.messageId) === Number(messageId)) {
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
      mapToChatMessageViewModel(msg, currentUserId, primaryUserId),
    )
  }, [accumulatedMessages, initialFetchedItems, selectedId, currentUserId, primaryUserId])

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
    isFetchingNewer,
    isFetchingMessages: isFetchingInitial || isFetchingOlder || isFetchingNewer,
    hasMoreMessages,
    hasMoreAfter,
    isViewingAroundWindow,
    targetHighlightId,
    isJumpingToMessage,
    jumpToMessage,
    clearTargetHighlight,
    handleLoadMoreMessages,
    handleLoadNewerMessages,
    resetToLatest,
    optimisticEditMessage,
    optimisticToggleReaction,
  }
}
