import { useMemo } from "react"
import { useDispatch } from "react-redux"
import { conversationsApi } from "@/store/api/conversationsApi"
import useConversationSignalR from "./useConversationSignalR"

export const useMessageSignalR = ({ activeConversationId, onUnreadCountIncrement }) => {
  const dispatch = useDispatch()

  const signalRHandlers = useMemo(
    () => ({
      NewMessage: (...args) => {
        let conversationId, message
        if (args.length >= 2) {
          conversationId = args[0]
          message = args[1]
        } else {
          // If only 1 arg, assume it's the message object and ID is inside
          message = args[0]
          conversationId = message?.conversationId
        }

        // Always force refetch of messages to guarantee consistency
        if (conversationId) {
          dispatch(
            conversationsApi.util.invalidateTags([
              { type: "Messages", id: conversationId },
              "Conversations",
            ]),
          )
        }

        // Optimistically update the messages cache (if matches active conversation)
        // Ensure strictly converted to numbers for comparison
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
                // Prevent duplicates
                const exists = draft.find(
                  (m) => m.messageId === message.messageId,
                )
                if (!exists) {
                  // Ensure sender exists for MessageList safety
                  const normalized = {
                    ...message,
                    sender: message.sender || { accountId: message.senderId },
                  }
                  draft.push(normalized)
                }
              },
            ),
          )
        } else {
          // Message belongs to another conversation or widget is closed
          if (onUnreadCountIncrement) {
             onUnreadCountIncrement()
          }
        }

        // Always invalidate conversations list to update snippets/unread counts
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      NewConversation: (data) => {
        // Refresh conversation list
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      FriendStatusChange: (data) => {
        // Refresh conversation list (to show online status)
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
      ChatUpdated: (data) => {
        dispatch(conversationsApi.util.invalidateTags(["Conversations"]))
      },
    }),
    [activeConversationId, dispatch, onUnreadCountIncrement],
  )

  const { sendMessage } = useConversationSignalR(signalRHandlers)

  return { sendSignalRMessage: sendMessage }
}

export default useMessageSignalR
