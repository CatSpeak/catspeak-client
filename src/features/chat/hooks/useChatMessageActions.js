import { useState, useCallback } from "react"
import {
  useSendMessageMutation,
  useSendMediaMessageMutation,
  useDeleteMessageForMeMutation,
  useRecallMessageMutation,
  useEditMessageMutation,
  useToggleReactionMutation,
  usePinMessageMutation,
  useUnpinMessageMutation,
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
  const [pendingUpload, setPendingUpload] = useState(null)
  const [isFileSizeModalOpen, setIsFileSizeModalOpen] = useState(false)

  const closeFileSizeModal = useCallback(() => {
    setIsFileSizeModalOpen(false)
  }, [])

  const [sendMessageMutation, { isLoading: isSendingText }] =
    useSendMessageMutation()
  const [sendMediaMessageMutation, { isLoading: isSendingMedia }] =
    useSendMediaMessageMutation()
  const [deleteMessageForMeMutation] = useDeleteMessageForMeMutation()
  const [recallMessageMutation] = useRecallMessageMutation()
  const [editMessageMutation] = useEditMessageMutation()
  const [toggleReactionMutation] = useToggleReactionMutation()
  const [pinMessageMutation] = usePinMessageMutation()
  const [unpinMessageMutation] = useUnpinMessageMutation()

  const handleReply = useCallback((message) => {
    setReplyingTo(message)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleCancelUpload = useCallback(() => {
    setPendingUpload(null)
  }, [])

  const handleSend = useCallback(
    async (text, file, extraOptions = {}) => {
      if ((!text && !file) || !conversationId) return

      const parentId = replyingTo?.id || replyingTo?.messageId || null

      if (file) {
        const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
        if (file.size > MAX_FILE_SIZE) {
          setIsFileSizeModalOpen(true)
          return
        }

        setPendingUpload({
          conversationId,
          file,
          fileName: file.name,
          fileSize: file.size,
          text: text || "",
          status: "uploading",
          errorMsg: null,
        })
      }

      try {
        if (file) {
          const formData = new FormData()
          formData.append("MessageContent", text || "")
          formData.append("File", file)
          formData.append("file", file)
          if (extraOptions.audioDuration != null) {
            formData.append("audioDuration", Math.round(extraOptions.audioDuration))
          }
          if (extraOptions.messageType) {
            formData.append("messageType", extraOptions.messageType)
          }
          const clientMsgId =
            extraOptions.clientMessageId ||
            (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `msg-${Date.now()}`)
          formData.append("clientMessageId", clientMsgId)

          if (parentId) {
            formData.append("ParentMessageId", parentId)
            formData.append("parentMessageId", parentId)
          }

          if (
            Array.isArray(extraOptions.mentionedAccountIds) &&
            extraOptions.mentionedAccountIds.length > 0
          ) {
            extraOptions.mentionedAccountIds.forEach((id) => {
              formData.append("mentionedAccountIds", id)
            })
          }

          await sendMediaMessageMutation({
            conversationId,
            formData,
          }).unwrap()
          setPendingUpload(null)
        } else {
          const messageData = {
            messageContent: text,
            messageType: extraOptions.messageType || "Text",
            parentMessageId: parentId,
            ...(Array.isArray(extraOptions.mentionedAccountIds) &&
            extraOptions.mentionedAccountIds.length > 0
              ? { mentionedAccountIds: extraOptions.mentionedAccountIds }
              : {}),
          }

          await sendMessageMutation({
            conversationId,
            messageData,
          }).unwrap()
        }

        setReplyingTo(null)
      } catch (err) {
        console.error("Failed to send message:", err)

        const errPayload =
          typeof err?.data === "string"
            ? err.data
            : JSON.stringify(err?.data || err || {})

        const isFileSizeExceeded =
          errPayload.includes("25MB") ||
          errPayload.includes("dung lượng") ||
          errPayload.includes("vượt quá") ||
          errPayload.includes("ArgumentException") ||
          err?.status === 413 ||
          err?.originalStatus === 413

        if (isFileSizeExceeded) {
          setIsFileSizeModalOpen(true)
          setPendingUpload(null)
        } else if (file) {
          const errorMsg =
            err?.data?.message || err?.message || "Tải lên thất bại."
          setPendingUpload((prev) =>
            prev ? { ...prev, status: "error", errorMsg } : null,
          )
        }
        throw err
      }
    },
    [conversationId, replyingTo, sendMessageMutation, sendMediaMessageMutation],
  )

  const handleRetryUpload = useCallback(async () => {
    if (!pendingUpload || !pendingUpload.file) return
    const { text, file } = pendingUpload
    try {
      await handleSend(text, file)
    } catch {
      // Error handled inside handleSend
    }
  }, [pendingUpload, handleSend])

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

  const handleEditMessage = useCallback(
    async (msg, newContent) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId || !newContent?.trim()) return
      try {
        await editMessageMutation({
          conversationId,
          messageId: msgId,
          messageContent: newContent.trim(),
        }).unwrap()
      } catch (err) {
        console.error("Failed to edit message:", err)
        throw err
      }
    },
    [conversationId, editMessageMutation],
  )

  const handleToggleReaction = useCallback(
    async (msg, emoji) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId || !emoji) return
      try {
        await toggleReactionMutation({
          conversationId,
          messageId: msgId,
          emoji,
        }).unwrap()
      } catch (err) {
        console.error("Failed to toggle reaction:", err)
        throw err
      }
    },
    [conversationId, toggleReactionMutation],
  )

  const handlePinMessage = useCallback(
    async (msg) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId) return
      try {
        await pinMessageMutation({
          conversationId,
          messageId: msgId,
        }).unwrap()
      } catch (err) {
        console.error("Failed to pin message:", err)
        throw err
      }
    },
    [conversationId, pinMessageMutation],
  )

  const handleUnpinMessage = useCallback(
    async (msg) => {
      const msgId = msg?.id || msg?.messageId
      if (!conversationId || !msgId) return
      try {
        await unpinMessageMutation({
          conversationId,
          messageId: msgId,
        }).unwrap()
      } catch (err) {
        console.error("Failed to unpin message:", err)
        throw err
      }
    },
    [conversationId, unpinMessageMutation],
  )

  const handleSendVoice = useCallback(
    async (audioBlob, duration) => {
      if (!audioBlob || !conversationId) return
      const fileName = `voice_${Date.now()}.webm`
      const file = new File([audioBlob], fileName, {
        type: audioBlob.type || "audio/webm",
      })
      return handleSend("", file, {
        audioDuration: duration,
        messageType: "Audio",
      })
    },
    [conversationId, handleSend],
  )

  return {
    replyingTo,
    pendingUpload:
      pendingUpload && String(pendingUpload.conversationId) === String(conversationId)
        ? pendingUpload
        : null,
    isFileSizeModalOpen,
    closeFileSizeModal,
    handleReply,
    handleCancelReply,
    handleSend,
    handleSendVoice,
    handleRetryUpload,
    handleCancelUpload,
    handleDeleteForMe,
    handleRecall,
    handleEditMessage,
    handleToggleReaction,
    handlePinMessage,
    handleUnpinMessage,
    isSending: isSendingText || isSendingMedia,
  }
}

export default useChatMessageActions
