import React, { useMemo, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import toast from "react-hot-toast"
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
import {
  friendshipApi,
  useRespondFriendRequestMutation,
} from "@/store/api/social/friendshipApi"
import FriendRequestToast from "@/features/profile/components/FriendRequestToast"
import { useLanguage } from "@/shared/context/LanguageContext"
import useConversationSignalR from "./useConversationSignalR"

/**
 * Global SignalR event handler — mounted once at the app level.
 * Handles toast notifications, unread badge tracking, and cache invalidation
 * for ALL hub events regardless of which page/widget the user is on.
 */
export const useGlobalSignalR = () => {
  const dispatch = useDispatch()
  const { t: tLanguage } = useLanguage()
  const [respondFriendRequest] = useRespondFriendRequestMutation()
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
  const activeFriendToastIdsRef = useRef([])

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

  // Helper for real-time friend request response (accept / decline)
  const handleFriendResponse = (data, isAccepted = true) => {
    const userObj =
      data?.user ||
      data?.responder ||
      data?.addressee ||
      data?.friend ||
      data?.requester ||
      data?.sender ||
      (typeof data === "object" ? data : null)

    const displayName =
      userObj?.nickname ||
      userObj?.username ||
      userObj?.displayName ||
      userObj?.name ||
      "Người dùng"

    const targetId =
      userObj?.accountId ??
      userObj?.userId ??
      userObj?.id ??
      data?.targetAccountId ??
      data?.addresseeId ??
      data?.requesterId

    // Invalidate RTK Query cache tags so Profile button and Friends lists auto-update
    dispatch(
      friendshipApi.util.invalidateTags([
        ...(targetId
          ? [
              { type: "Friendship", id: targetId },
              { type: "Friend", id: `LIST-${targetId}` },
            ]
          : []),
        "Friendship",
        "Friend",
        "FriendRequest",
        "Recommendation",
      ]),
    )

    // Show toast with i18n
    const acceptedText =
      tLanguage.profile?.social?.friendRequestAccepted ||
      "đã chấp nhận lời mời kết bạn của bạn"
    const declinedText =
      tLanguage.profile?.social?.friendRequestDeclined ||
      "đã từ chối lời mời kết bạn của bạn"

    if (isAccepted) {
      toast.success(`${displayName} ${acceptedText}`)
    } else {
      toast(`${displayName} ${declinedText}`, {
        icon: "ℹ️",
      })
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

      FriendStatusChange: (data) => {
        if (
          data &&
          typeof data === "object" &&
          (data.isFriend !== undefined ||
            data.action !== undefined ||
            data.friendshipStatus !== undefined ||
            data.friendshipId !== undefined)
        ) {
          const isAccepted =
            data.isFriend === true ||
            data.action === "accept" ||
            data.action === "accepted" ||
            data.friendshipStatus === 2 ||
            data.friendshipStatus === "Accepted"
          handleFriendResponse(data, isAccepted)
        } else {
          handleStatusUpdate(data)
        }
      },
      FriendRequestAccepted: (data) => handleFriendResponse(data, true),
      FriendRequestDeclined: (data) => handleFriendResponse(data, false),
      FriendRequestRejected: (data) => handleFriendResponse(data, false),
      FriendRequestResponded: (data) => {
        const isAccepted =
          data?.action === "accept" ||
          data?.action === "accepted" ||
          data?.isAccepted === true ||
          data?.status === "accepted" ||
          data?.isFriend === true
        handleFriendResponse(data, isAccepted)
      },
      FriendshipUpdated: (data) => {
        const isAccepted =
          data?.isFriend === true ||
          data?.action === "accept" ||
          data?.status === "accepted" ||
          data?.friendshipStatus === 2
        handleFriendResponse(data, isAccepted)
      },
      FriendshipStatusChanged: (data) => {
        const isAccepted =
          data?.isFriend === true ||
          data?.action === "accept" ||
          data?.status === "accepted" ||
          data?.friendshipStatus === 2
        handleFriendResponse(data, isAccepted)
      },
      UserStatusChanged: (data) => handleStatusUpdate(data),
      UserOnline: (data) => handleStatusUpdate(data, true),
      UserOffline: (data) => handleStatusUpdate(data, false),

      NewFriendRequest: async (data) => {
        dispatch(friendshipApi.util.invalidateTags(["FriendRequest"]))

        let friendshipId = data?.friendshipId || data?.id
        let sender =
          data?.requester ||
          data?.sender ||
          data?.user ||
          (typeof data === "object" ? data : null)

        // If payload lacks details, fetch latest pending request from API
        if (!sender?.nickname && !sender?.username && !friendshipId) {
          try {
            const result = await dispatch(
              friendshipApi.endpoints.getPendingFriendRequests.initiate(
                undefined,
                { forceRefetch: true },
              ),
            ).unwrap()
            const list = Array.isArray(result) ? result : result?.data || []
            if (list.length > 0) {
              const latest = list[list.length - 1] || list[0]
              friendshipId = latest.friendshipId
              sender = latest.requester || latest.user || latest
            }
          } catch (err) {
            console.warn(
              "[GlobalSignalR] Could not fetch latest pending friend request:",
              err,
            )
          }
        }

        const toastId = `friend-request-${friendshipId || Date.now()}`

        // Track and limit active friend request toasts to maximum 3 (FIFO)
        activeFriendToastIdsRef.current = activeFriendToastIdsRef.current.filter(
          (id) => id !== toastId,
        )
        activeFriendToastIdsRef.current.push(toastId)

        // Dismiss oldest if more than 3
        while (activeFriendToastIdsRef.current.length > 3) {
          const oldestToastId = activeFriendToastIdsRef.current.shift()
          if (oldestToastId) {
            toast.dismiss(oldestToastId)
          }
        }

        const handleRemoveToast = (id) => {
          activeFriendToastIdsRef.current = activeFriendToastIdsRef.current.filter(
            (tId) => tId !== id,
          )
          toast.dismiss(id)
        }

        toast.custom(
          (t) =>
            React.createElement(FriendRequestToast, {
              toastInstance: t,
              friendshipId: friendshipId,
              sender: sender,
              onClose: () => handleRemoveToast(t.id),
              onRespond: async (action) => {
                handleRemoveToast(t.id)
                try {
                  await respondFriendRequest({ friendshipId, action }).unwrap()
                  toast.success(
                    action === "accept"
                      ? tLanguage.profile?.friends?.actions?.acceptSuccess ||
                          "Đã chấp nhận kết bạn!"
                      : tLanguage.profile?.friends?.actions?.declineSuccess ||
                          "Đã từ chối kết bạn",
                  )
                } catch (err) {
                  toast.error(
                    tLanguage.profile?.friends?.actions?.error ||
                      "Có lỗi xảy ra",
                  )
                  console.error(err)
                }
              },
            }),
          {
            id: toastId,
            duration: 10000,
            position: "top-right",
          },
        )
      },
    }),
    [dispatch, activeConversationId, isWidgetOpen, respondFriendRequest, tLanguage],
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

  const { isConnected, invoke, reconnect } = useConversationSignalR(handlers)

  // Keep invokeRef and reconnectRef in sync
  const reconnectRef = useRef(null)
  useEffect(() => {
    invokeRef.current = invoke
    reconnectRef.current = reconnect
  }, [invoke, reconnect])

  // Automatically join SignalR groups for ALL of the user's conversations as soon as SignalR connects
  useEffect(() => {
    if (isConnected && invoke && conversations.length > 0) {
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
  }, [isConnected, invoke, conversations])
}

export default useGlobalSignalR
