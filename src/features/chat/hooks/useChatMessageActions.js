import { useState, useCallback } from "react"
import {
  useSendMessageMutation,
  useSendMediaMessageMutation,
  useDeleteMessageForMeMutation,
  useRecallMessageMutation,
} from "@/store/api/social/conversationsApi"

/**
 * useChatMessageActions — Custom hook for encapsulating chat message actions & mutations.
 *
 * Handles:
 * - Sending text and media messages (with optional parentMessageId for replies)
 * - Soft-deleting messages for current user (`deleteMessageForMe`)
 * - Recalling messages for everyone (`recallMessage`)
 * - Managing local `replyingTo` state
 *
 * Reusable across ChatPage.jsx and MessageWidget.jsx.
 *
 * @param {string|number} conversationId - Current active conversation ID
 */
export const useChatMessageActions = (conversationId) => {
  const [replyingTo, setReplyingTo] = useState(null)

  const [sendMessageMutation, { isLoading: isSendingText }] =
    useSendMessageMutation()
  const [sendMediaMessageMutation, { isLoading: isSendingMedia }] =
    useSendMediaMessageMutation()
  const [deleteMessageForMeMutation] = useDeleteMessageForMeMutation()
  const [recallMessageMutation] = useRecallMessageMutation()

  const handleReply = useCallback((message) => {
    setReplyingTo(message)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleSend = useCallback(
    async (text, file) => {
      if ((!text && !file) || !conversationId) return

      const parentId = replyingTo?.id || replyingTo?.messageId || null

      try {
        if (file) {
          const formData = new FormData()
          formData.append("MessageContent", text || "")
          formData.append("File", file)
          if (parentId) formData.append("ParentMessageId", parentId)

          await sendMediaMessageMutation({
            conversationId,
            formData,
          }).unwrap()
        } else {
          const messageData = {
            messageContent: text,
            messageType: "Text",
            parentMessageId: parentId,
          }

          await sendMessageMutation({
            conversationId,
            messageData,
          }).unwrap()
        }

        setReplyingTo(null)
      } catch (err) {
        console.error("Failed to send message:", err)
        throw err
      }
    },
    [conversationId, replyingTo, sendMessageMutation, sendMediaMessageMutation],
  )

  const handleDeleteForMe = useCallback(
    async (msg) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId) return
      try {
        await deleteMessageForMeMutation({
          conversationId,
          messageId: msgId,
        }).unwrap()
      } catch (err) {
        console.error("Failed to delete message for me:", err)
        throw err
      }
    },
    [conversationId, deleteMessageForMeMutation],
  )

  const handleRecall = useCallback(
    async (msg) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId) return
      try {
        await recallMessageMutation({
          conversationId,
          messageId: msgId,
        }).unwrap()
      } catch (err) {
        console.error("Failed to recall message:", err)
        throw err
      }
    },
    [conversationId, recallMessageMutation],
  )

  return {
    replyingTo,
    handleReply,
    handleCancelReply,
    handleSend,
    handleDeleteForMe,
    handleRecall,
    isSending: isSendingText || isSendingMedia,
  }
}

export default useChatMessageActions
