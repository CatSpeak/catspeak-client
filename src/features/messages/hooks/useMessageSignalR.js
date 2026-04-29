import { useMemo } from "react"
import { useDispatch } from "react-redux"
import { conversationsApi } from "@/store/api/conversationsApi"
import { useConversationSignalRContext } from "../context/ConversationSignalRContext"
import useConversationSignalR from "./useConversationSignalR"

export const useMessageSignalR = ({ activeConversationId }) => {
  const dispatch = useDispatch()
  const context = useConversationSignalRContext()
  const invoke = context?.invoke

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
        }
      },
      NewConversation: (conversation) => {
        if (invoke && conversation?.conversationId) {
          invoke("JoinConversation", conversation.conversationId.toString()).catch(
            (err) => console.error("Failed to join new conversation", err)
          )
        }
      },
    }),
    [activeConversationId, dispatch, invoke],
  )

  const { sendMessage } = useConversationSignalR(signalRHandlers)

  return { sendSignalRMessage: sendMessage }
}

export default useMessageSignalR
