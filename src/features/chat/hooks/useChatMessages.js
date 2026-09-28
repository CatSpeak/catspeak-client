import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import {
  useGetConversationMessagesQuery,
  useLazyGetConversationMessagesQuery,
} from "@/store/api/social/conversationsApi"
import { useAuth } from "@/features/auth"
import useConversationSignalR from "./useConversationSignalR"
import {
  applyReactionToggle,
  applyReactionSignalREvent,
} from "../utils/reactionUtils"

const PAGE_SIZE = 30
const EMPTY_ARRAY = []

/**
 * Custom hook for managing conversation messages with cursor pagination (beforeId/limit),
 * real-time SignalR updates (NewMessage, MessageEdited, MessageReactionChanged, MessageRecalled),
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
    data: initialMessagesResponse = EMPTY_ARRAY,
    isLoading: isLoadingMessages,
    isFetching: isFetchingInitial,
  } = useGetConversationMessagesQuery(
    selectedId ? { conversationId: selectedId, limit: PAGE_SIZE } : undefined,
    { skip: !selectedId },
  )

  // Lazy query trigger for cursor pagination (beforeId)
  const [triggerFetchMessages] = useLazyGetConversationMessagesQuery()

  // Handle initial fetch results
  useEffect(() => {
    if (!selectedId || !initialMessagesResponse) return

    const rawItems = Array.isArray(initialMessagesResponse)
      ? initialMessagesResponse
      : initialMessagesResponse?.data || initialMessagesResponse?.items || []

    const fetchedItems = rawItems.filter(
      (m) =>
        m.conversationId == null ||
        String(m.conversationId) === String(selectedId),
    )

    const serverHasMore =
      typeof initialMessagesResponse?.hasMore === "boolean"
        ? initialMessagesResponse.hasMore
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
  }, [initialMessagesResponse, selectedId])

  // Real-time SignalR Event Handlers
  const signalRHandlers = useMemo(
    () => ({
      NewMessage: (...args) => {
        let conversationId, message
        if (args.length >= 2) {
          conversationId = args[0]
          message = args[1]
        } else {
          message = args[0]
          conversationId = message?.conversationId
        }

        if (
          !selectedId ||
          !conversationId ||
          Number(conversationId) !== Number(selectedId)
        ) {
          return
        }

        const msgId = message?.messageId ?? message?.id
        const clientMsgId = message?.clientMessageId

        setAccumulatedMessages((prev) => {
          // Prevent duplicates by messageId or clientMessageId
          const exists = prev.some(
            (m) =>
              (msgId != null && (m.messageId ?? m.id) === msgId) ||
              (clientMsgId && m.clientMessageId === clientMsgId),
          )
          if (exists) {
            return prev.map((m) =>
              (msgId != null && (m.messageId ?? m.id) === msgId) ||
              (clientMsgId && m.clientMessageId === clientMsgId)
                ? { ...m, ...message }
                : m,
            )
          }

          const normalized = {
            ...message,
            sender: message.sender || { accountId: message.senderId },
            mentionedAccountIds:
              message.mentionedAccountIds || message.MentionedAccountIds || [],
          }
          return [...prev, normalized]
        })
      },

      MessageEdited: (payload) => {
        const convId = payload?.conversationId
        const msgId = payload?.messageId
        const newContent = payload?.messageContent ?? payload?.newContent
        const lastEdited = payload?.lastEdited

        if (
          !selectedId ||
          !convId ||
          Number(convId) !== Number(selectedId) ||
          !msgId
        ) {
          return
        }

        setAccumulatedMessages((prev) =>
          prev.map((m) => {
            const currentId = m.messageId ?? m.id
            if (Number(currentId) === Number(msgId)) {
              return {
                ...m,
                messageContent: newContent,
                content: newContent,
                isEdited: true,
                lastEdited: lastEdited || new Date().toISOString(),
              }
            }
            return m
          }),
        )
      },

      MessageReactionChanged: (payload) => {
        const convId = payload?.conversationId
        const msgId = payload?.messageId

        if (
          !selectedId ||
          !convId ||
          Number(convId) !== Number(selectedId) ||
          !msgId
        ) {
          return
        }

        setAccumulatedMessages((prev) =>
          prev.map((m) => {
            const currentId = m.messageId ?? m.id
            if (Number(currentId) === Number(msgId)) {
              return {
                ...m,
                reactions: applyReactionSignalREvent(
                  m.reactions,
                  payload,
                  currentUserId,
                ),
              }
            }
            return m
          }),
        )
      },

      MessageRecalled: (payload) => {
        const convId = payload?.conversationId
        const msgId = payload?.messageId

        if (
          !selectedId ||
          !convId ||
          Number(convId) !== Number(selectedId) ||
          !msgId
        ) {
          return
        }

        setAccumulatedMessages((prev) =>
          prev.map((m) => {
            const currentId = m.messageId ?? m.id
            if (Number(currentId) === Number(msgId)) {
              return {
                ...m,
                isRecalled: true,
                messageType: "Recalled",
                messageContent: "[Message Recalled]",
              }
            }
            return m
          }),
        )
      },

      MessageRead: (payload) => {
        const convId = payload?.conversationId
        const readerAccountId = Number(payload?.accountId)
        const lastReadMsgId = Number(payload?.lastReadMessageId)
        if (
          !selectedId ||
          !convId ||
          Number(convId) !== Number(selectedId) ||
          !readerAccountId ||
          !lastReadMsgId
        ) {
          return
        }

        setAccumulatedMessages((prev) => {
          return prev.map((m) => {
            const currentMsgId = Number(m.messageId ?? m.id)
            const currentReaders = Array.isArray(m.readByUsers) ? m.readByUsers : []
            const filteredReaders = currentReaders.filter(
              (r) => Number(r.accountId || r.id) !== readerAccountId,
            )

            if (currentMsgId === lastReadMsgId) {
              const newReader = {
                accountId: readerAccountId,
                id: readerAccountId,
                username: payload.username,
                name: payload.username,
                avatarImageUrl: payload.avatarImageUrl,
                avatar: payload.avatarImageUrl,
              }
              return {
                ...m,
                readByUsers: [...filteredReaders, newReader],
              }
            }

            return {
              ...m,
              readByUsers: filteredReaders,
            }
          })
        })
      },
    }),
    [selectedId, currentUserId],
  )

  useConversationSignalR(signalRHandlers)

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

  // Map messages to consistent view models with new Phase 1 properties
  const activeMessages = useMemo(() => {
    return accumulatedMessages
      .filter(
        (msg) =>
          msg.conversationId == null ||
          String(msg.conversationId) === String(selectedId),
      )
      .map((msg) => ({
        id: msg.messageId ?? msg.id,
        conversationId: msg.conversationId,
        senderId: msg.sender?.accountId ?? msg.senderId,
        content: msg.messageContent ?? msg.content,
        timestamp: msg.createDate ?? msg.timestamp,
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
        // Phase 1 enhancements
        reactions: (msg.reactions || []).map((group) => {
          const myId = currentUserId != null ? Number(currentUserId) : null
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
      }))
  }, [accumulatedMessages, selectedId])

  return {
    activeMessages,
    accumulatedMessagesCount: accumulatedMessages.length,
    isLoadingMessages: isLoadingMessages && accumulatedMessages.length === 0,
    isFetchingMessages: isFetchingInitial || isFetchingOlder,
    hasMoreMessages,
    handleLoadMoreMessages,
    optimisticEditMessage,
    optimisticToggleReaction,
  }
}
