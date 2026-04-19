import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { conversationsApi } from "@/store/api/conversationsApi"
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

        // Invalidate conversation list to update order & snippets
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))

        if (conversationId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: conversationId },
            ]),
          )
        }

        // Only show toast + increment unread if user is NOT viewing that conversation
        const isViewingConversation =
          isWidgetOpen &&
          activeConversationId &&
          Number(conversationId) === Number(activeConversationId)

        if (!isViewingConversation && conversationId) {
          dispatch(incrementUnread(conversationId))
        }
      },

      ChatUpdated: () => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
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
        // Refresh conversation list to reflect status
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
    }),
    [dispatch, activeConversationId, isWidgetOpen],
  )

  useConversationSignalR(handlers)
}

export default useGlobalSignalR
