import { useMemo, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  conversationsApi,
  useGetConversationsQuery,
  useMarkConversationAsReadMutation,
} from "@/store/api/social/conversationsApi"
import {
  clearUnread,
  incrementUnread,
  setFriendOnlineStatus,
} from "@/store/slices/notificationSlice"
import { friendshipApi } from "@/store/api/social/friendshipApi"
import useConversationSignalR from "./useConversationSignalR"

/**
 * Global SignalR event handler — mounted once at the app level.
 * Handles toast notifications, unread badge tracking, and cache invalidation
 * for ALL hub events regardless of which page/widget the user is on.
 */
export const useGlobalSignalR = () => {
  const dispatch = useDispatch()
  const activeConversationId = useSelector(
    (state) => state.messageWidget.activeConversationId,
  )
  const isWidgetOpen = useSelector((state) => state.messageWidget.isOpen)
  const [markConversationAsRead] = useMarkConversationAsReadMutation()

  // Fetch user conversations to auto-join SignalR groups on load
  const { data: conversationsResponse } = useGetConversationsQuery(undefined, {
    pollingInterval: 0,
  })

  const conversations = useMemo(() => {
    return Array.isArray(conversationsResponse)
      ? conversationsResponse
      : conversationsResponse?.data || []
  }, [conversationsResponse])

  // Ref to hold invoke so the NewConversation handler can call JoinConversation
  // without creating a circular dependency (invoke comes from useConversationSignalR
  // which needs handlers, but handlers need invoke).
  const invokeRef = useRef(null)

  // Single internal helper for presence updates
  const handleStatusUpdate = (data, forcedStatus = null) => {
    const userId =
      typeof data === "object"
        ? (data?.userId ?? data?.accountId ?? data?.id)
        : data
    if (userId == null) return

    const isOnline =
      forcedStatus !== null
        ? forcedStatus
        : typeof data === "object"
        ? (data?.isOnline ??
          data?.status === "online" ??
          data?.status === 1)
        : true

    const lastSeen =
      (typeof data === "object" &&
        (data?.lastSeen || data?.lastOnline || data?.timestamp)) ||
      (!isOnline ? new Date().toISOString() : null)

    dispatch(setFriendOnlineStatus({ userId, isOnline, lastSeen }))

    dispatch(
      conversationsApi.util.updateQueryData(
        "getConversations",
        undefined,
        (draft) => {
          const list = Array.isArray(draft) ? draft : draft?.data || []
          list.forEach((conv) => {
            if (
              conv.friend &&
              Number(conv.friend.accountId || conv.friend.id) === Number(userId)
            ) {
              conv.friend.isOnline = isOnline
              if (lastSeen) {
                conv.friend.lastSeen = lastSeen
              }
            }
            if (Array.isArray(conv.participants)) {
              conv.participants.forEach((p) => {
                if (Number(p.accountId || p.id) === Number(userId)) {
                  p.isOnline = isOnline
                  if (lastSeen) {
                    p.lastSeen = lastSeen
                  }
                }
              })
            }
          })
        },
      ),
    )
  }

  // Single internal helper for read receipts
  const handleReadReceipt = (...args) => {
    const convId =
      typeof args[0] === "object" ? args[0]?.conversationId : args[0]
    if (convId) {
      dispatch(
        conversationsApi.util.invalidateTags([
          { type: "Messages", id: Number(convId) },
          { type: "Messages", id: String(convId) },
        ]),
      )
    }
  }

  const handlers = useMemo(
    () => ({
      NewMessage: (...args) => {
        let conversationId, message
        if (args.length >= 2) {
          conversationId = args[0]
          message = args[1]
        } else {
          message = args[0]
          conversationId = message?.conversationId || message?.ConversationId
        }

        if (conversationId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: conversationId },
            ]),
          )
        }

        const isChatPageOpen =
          window.location.pathname.startsWith("/chat") ||
          window.location.pathname.includes("/chat")
        const isViewingConversation =
          (isWidgetOpen || isChatPageOpen) &&
          activeConversationId &&
          Number(conversationId) === Number(activeConversationId)

        if (!isViewingConversation) {
          dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
          if (conversationId) {
            dispatch(incrementUnread(conversationId))

            // Ensure the user is in the SignalR group for this conversation
            if (invokeRef.current) {
              invokeRef
                .current("JoinConversation", Number(conversationId))
                .catch(console.warn)
            }
          }
        } else {
          if (conversationId) {
            dispatch(clearUnread(conversationId))

            // Optimistically update conversation in cache: set unreadCount = 0 & update preview
            dispatch(
              conversationsApi.util.updateQueryData(
                "getConversations",
                undefined,
                (draft) => {
                  const cachedConv = draft.find(
                    (c) =>
                      Number(c.conversationId) === Number(conversationId) ||
                      String(c.conversationId) === String(conversationId),
                  )
                  if (cachedConv) {
                    cachedConv.unreadCount = 0
                    if (message) {
                      cachedConv.lastMessage =
                        message.messageContent ||
                        message.content ||
                        cachedConv.lastMessage
                      cachedConv.lastMessageTime =
                        message.createDate ||
                        message.timestamp ||
                        new Date().toISOString()
                      cachedConv.lastMessageSenderId =
                        message.senderId || message.sender?.accountId
                      cachedConv.lastMessageType =
                        message.messageType ||
                        message.type ||
                        message.lastMessageType ||
                        cachedConv.lastMessageType
                    }
                  }
                },
              ),
            )

            // Silently mark as read on backend without triggering server refetch
            markConversationAsRead(conversationId).catch(() => {})
          } else {
            dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
          }
        }
      },

      ChatUpdated: () => {
        setTimeout(() => {
          dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
        }, 500)
      },

      ConversationUpdated: (data) => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
        const convId =
          typeof data === "object"
            ? (data?.conversationId ?? data?.ConversationId)
            : data
        if (convId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: Number(convId) },
              { type: "Messages", id: String(convId) },
            ]),
          )
        }
      },

      ConversationRead: handleReadReceipt,
      MessageRead: handleReadReceipt,
      ReadReceipt: handleReadReceipt,

      FriendStatusChange: (data) => handleStatusUpdate(data),
      UserStatusChanged: (data) => handleStatusUpdate(data),
      UserOnline: (data) => handleStatusUpdate(data, true),
      UserOffline: (data) => handleStatusUpdate(data, false),

      NewFriendRequest: () => {
        dispatch(friendshipApi.util.invalidateTags(["FriendRequest"]))
      },
    }),
    [dispatch, activeConversationId, isWidgetOpen],
  )

  // Define the helper here and assign it so we cover multiple possible event names
  // the backend developer might have used. Delay reconnects so the DB commits.
  const handleNewConversationEvent = useMemo(
    () => (conversation) => {
      setTimeout(() => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      }, 500)

      const convId =
        typeof conversation === "object"
          ? (conversation?.conversationId ?? conversation?.ConversationId)
          : conversation

      if (convId && invokeRef.current) {
        invokeRef.current("JoinConversation", Number(convId)).catch((err) => {
          console.warn(
            "[GlobalSignalR] Failed to join conversation group, falling back to reconnect:",
            err,
          )
          if (reconnectRef.current) {
            setTimeout(() => reconnectRef.current(), 500)
          }
        })
      } else if (reconnectRef.current) {
        setTimeout(() => reconnectRef.current(), 500)
      }
    },
    [dispatch],
  )

  // Attach to handlers object
  useEffect(() => {
    handlers.NewConversation = handleNewConversationEvent
    handlers.ConversationCreated = handleNewConversationEvent
  }, [handlers, handleNewConversationEvent])

  const { invoke, reconnect } = useConversationSignalR(handlers)

  // Keep invokeRef and reconnectRef in sync
  const reconnectRef = useRef(null)
  useEffect(() => {
    invokeRef.current = invoke
    reconnectRef.current = reconnect
  }, [invoke, reconnect])

  // Automatically join SignalR groups for ALL of the user's conversations as soon as SignalR connects
  useEffect(() => {
    if (invoke && conversations.length > 0) {
      conversations.forEach((c) => {
        const convId = c.conversationId || c.id
        if (convId) {
          invoke("JoinConversation", Number(convId)).catch((err) => {
            console.warn(
              `[GlobalSignalR] Auto-join failed for conversation ${convId}:`,
              err,
            )
          })
        }
      })
    }
  }, [invoke, conversations])
}

export default useGlobalSignalR
