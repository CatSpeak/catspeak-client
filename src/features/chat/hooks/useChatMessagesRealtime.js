import { useMemo } from "react"
import { useDispatch } from "react-redux"
import { conversationsApi } from "@/store/api/social/conversationsApi"
import useConversationSignalR from "./useConversationSignalR"
import { applyReactionSignalREvent } from "../utils/reactionUtils"
import { normalizeMessageType } from "../utils/messageMappingUtils"

/**
 * Custom hook to handle real-time SignalR socket events for chat messages:
 * - NewMessage: appends or deduplicates new incoming messages
 * - MessageEdited: updates message content, timestamp, and edit state
 * - MessageReactionChanged: updates reaction counts and user reaction status
 * - MessageRecalled: updates message state to recalled
 * - MessageRead: updates message read-receipt tracking
 *
 * @param {object} params
 * @param {string|number|null} params.selectedId - Currently active conversation ID
 * @param {string|number|null} params.currentUserId - Authenticated user account ID
 * @param {Function} params.setAccumulatedMessages - State updater for accumulated messages
 */
export default function useChatMessagesRealtime({
  selectedId,
  currentUserId,
  setAccumulatedMessages,
}) {
  const dispatch = useDispatch()

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

        const msgId = message?.messageId
        const clientMsgId = message?.clientMessageId

        setAccumulatedMessages((prev) => {
          // Prevent duplicates by messageId or clientMessageId
          const exists = prev.some(
            (m) =>
              (msgId != null && m.messageId === msgId) ||
              (clientMsgId && m.clientMessageId === clientMsgId),
          )
          if (exists) {
            return prev.map((m) =>
              (msgId != null && m.messageId === msgId) ||
              (clientMsgId && m.clientMessageId === clientMsgId)
                ? { ...m, ...message }
                : m,
            )
          }

          const normalized = {
            ...message,
            messageType: normalizeMessageType(message?.messageType),
            messageContent: message?.messageContent,
            sender: message.sender,
            mentionedAccountIds: message.mentionedAccountIds || [],
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
            if (Number(m.messageId) === Number(msgId)) {
              return {
                ...m,
                messageContent: newContent,
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
            if (Number(m.messageId) === Number(msgId)) {
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
            if (Number(m.messageId) === Number(msgId)) {
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
            const currentMsgId = Number(m.messageId)
            const currentReaders = Array.isArray(m.readByUsers)
              ? m.readByUsers
              : []
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

      MessagePinned: (payload) => {
        const convId =
          typeof payload === "object"
            ? payload?.conversationId ?? payload?.conversation_id
            : payload
        dispatch(
          conversationsApi.util.invalidateTags([
            ...(convId
              ? [
                  { type: "PinnedMessages", id: Number(convId) },
                  { type: "PinnedMessages", id: String(convId) },
                ]
              : ["PinnedMessages"]),
          ]),
        )
      },

      MessageUnpinned: (payload) => {
        const convId =
          typeof payload === "object"
            ? payload?.conversationId ?? payload?.conversation_id
            : payload
        dispatch(
          conversationsApi.util.invalidateTags([
            ...(convId
              ? [
                  { type: "PinnedMessages", id: Number(convId) },
                  { type: "PinnedMessages", id: String(convId) },
                ]
              : ["PinnedMessages"]),
          ]),
        )
      },
    }),
    [selectedId, currentUserId, setAccumulatedMessages, dispatch],
  )

  useConversationSignalR(signalRHandlers)
}
