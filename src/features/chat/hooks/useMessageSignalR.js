import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import { useDispatch } from "react-redux"
import { conversationsApi } from "@/store/api/social/conversationsApi"
import { useConversationSignalRContext } from "../../chat/context/ConversationSignalRContext"
import useConversationSignalR from "./useConversationSignalR"

export const useMessageSignalR = ({ activeConversationId }) => {
  const dispatch = useDispatch()
  const context = useConversationSignalRContext()
  const {
    sendMessage,
    joinConversation,
    leaveConversation,
    startTyping: contextStartTyping,
    stopTyping: contextStopTyping,
  } = context || {}

  const [typingUsersMap, setTypingUsersMap] = useState({})
  const typingTimersRef = useRef({})

  // Reset typing state when active conversation changes
  useEffect(() => {
    setTypingUsersMap({})
    // Clear all existing timeouts
    Object.values(typingTimersRef.current).forEach((timer) =>
      clearTimeout(timer),
    )
    typingTimersRef.current = {}
  }, [activeConversationId])

  // Join conversation on select
  useEffect(() => {
    if (activeConversationId && joinConversation) {
      joinConversation(activeConversationId).catch(console.warn)
    }
  }, [activeConversationId, joinConversation])

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
          activeConversationId &&
          conversationId &&
          Number(conversationId) === Number(activeConversationId)
        ) {
          dispatch(
            conversationsApi.util.updateQueryData(
              "getConversationMessages",
              activeConversationId,
              (draft) => {
                const exists = draft.find(
                  (m) => m.messageId === message.messageId,
                )
                if (!exists) {
                  const normalized = {
                    ...message,
                    sender: message.sender || { accountId: message.senderId },
                  }
                  draft.push(normalized)
                }
              },
            ),
          )
        }
      },

      UserTyping: (payload) => {
        const convId = payload?.conversationId
        const userId = payload?.userId
        const username = payload?.username || "Someone"

        if (
          activeConversationId &&
          convId &&
          Number(convId) === Number(activeConversationId) &&
          userId
        ) {
          setTypingUsersMap((prev) => ({
            ...prev,
            [userId]: username,
          }))

          // Clear existing timer if any
          if (typingTimersRef.current[userId]) {
            clearTimeout(typingTimersRef.current[userId])
          }

          // Auto expire after 4 seconds of no typing event
          typingTimersRef.current[userId] = setTimeout(() => {
            setTypingUsersMap((prev) => {
              const next = { ...prev }
              delete next[userId]
              return next
            })
            delete typingTimersRef.current[userId]
          }, 4000)
        }
      },

      UserStoppedTyping: (payload) => {
        const convId = payload?.conversationId
        const userId = payload?.userId

        if (
          activeConversationId &&
          convId &&
          Number(convId) === Number(activeConversationId) &&
          userId
        ) {
          if (typingTimersRef.current[userId]) {
            clearTimeout(typingTimersRef.current[userId])
            delete typingTimersRef.current[userId]
          }
          setTypingUsersMap((prev) => {
            const next = { ...prev }
            delete next[userId]
            return next
          })
        }
      },

      NewConversation: (conversation) => {
        const convId =
          conversation?.conversationId ?? conversation?.ConversationId
        if (joinConversation && convId) {
          joinConversation(convId).catch(console.warn)
        }
      },

      ConversationRead: (...args) => {
        const convId =
          typeof args[0] === "object" ? args[0]?.conversationId : args[0]
        if (
          convId &&
          activeConversationId &&
          Number(convId) === Number(activeConversationId)
        ) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: Number(activeConversationId) },
              { type: "Messages", id: String(activeConversationId) },
            ]),
          )
        }
      },

      MessageRead: (...args) => {
        const convId =
          typeof args[0] === "object" ? args[0]?.conversationId : args[0]
        if (
          convId &&
          activeConversationId &&
          Number(convId) === Number(activeConversationId)
        ) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: Number(activeConversationId) },
              { type: "Messages", id: String(activeConversationId) },
            ]),
          )
        }
      },

      ReadReceipt: (...args) => {
        const convId =
          typeof args[0] === "object" ? args[0]?.conversationId : args[0]
        if (
          convId &&
          activeConversationId &&
          Number(convId) === Number(activeConversationId)
        ) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: Number(activeConversationId) },
              { type: "Messages", id: String(activeConversationId) },
            ]),
          )
        }
      },
    }),
    [activeConversationId, dispatch, joinConversation],
  )

  useConversationSignalR(signalRHandlers)

  const startTyping = useCallback(() => {
    if (activeConversationId && contextStartTyping) {
      contextStartTyping(activeConversationId)
    }
  }, [activeConversationId, contextStartTyping])

  const stopTyping = useCallback(() => {
    if (activeConversationId && contextStopTyping) {
      contextStopTyping(activeConversationId)
    }
  }, [activeConversationId, contextStopTyping])

  const typingUsers = useMemo(() => {
    return Object.entries(typingUsersMap).map(([userId, username]) => ({
      userId,
      username,
    }))
  }, [typingUsersMap])

  return {
    sendSignalRMessage: sendMessage,
    startTyping,
    stopTyping,
    typingUsers,
    joinConversation,
    leaveConversation,
  }
}

export default useMessageSignalR
