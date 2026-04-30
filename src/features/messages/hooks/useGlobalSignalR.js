import { useMemo, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { conversationsApi, useMarkConversationAsReadMutation } from "@/store/api/conversationsApi"
import {
  incrementUnread,
  setFriendOnlineStatus,
} from "@/store/slices/notificationSlice"
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

  // Ref to hold invoke so the NewConversation handler can call JoinConversation
  // without creating a circular dependency (invoke comes from useConversationSignalR
  // which needs handlers, but handlers need invoke).
  const invokeRef = useRef(null)

  const handlers = useMemo(
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

        if (conversationId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: conversationId },
            ]),
          )
        }

        const isViewingConversation =
          isWidgetOpen &&
          activeConversationId &&
          Number(conversationId) === Number(activeConversationId)

        if (!isViewingConversation) {
          dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
          if (conversationId) {
             dispatch(incrementUnread(conversationId))
             
             // Ensure the user is in the SignalR group for this conversation
             if (invokeRef.current) {
               invokeRef.current("JoinConversation", Number(conversationId)).catch(console.warn)
             }
          }
        } else {
          if (conversationId) {
            // Optimistically clear the unread count in Redux to prevent flickering
            dispatch(
              conversationsApi.util.updateQueryData(
                "getConversations",
                undefined,
                (draft) => {
                  const cachedConv = draft.find(
                    (c) => c.conversationId === Number(conversationId) || c.conversationId === String(conversationId)
                  )
                  if (cachedConv) {
                    cachedConv.unreadCount = 0
                  }
                }
              )
            )
            
            // Mark as read on the backend
            markConversationAsRead(conversationId)
              .unwrap()
              .then(() => {
                dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
              })
              .catch((err) => {
                console.error("Failed to mark conversation as read:", err)
                dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
              })
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

      FriendStatusChange: (data) => {
        if (data?.userId != null) {
          dispatch(
            setFriendOnlineStatus({
              userId: data.userId,
              isOnline: data.isOnline ?? data.status === "online",
            }),
          )
        }
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
    }),
    [dispatch, activeConversationId, isWidgetOpen],
  )

  // Define the helper here and assign it so we cover multiple possible event names 
  // the backend developer might have used. Delay reconnects so the DB commits.
  const handleNewConversationEvent = useMemo(() => (conversation) => {
    setTimeout(() => {
      dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
    }, 500)

    const convId = typeof conversation === 'object' 
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


  }, [dispatch])

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
}

export default useGlobalSignalR
