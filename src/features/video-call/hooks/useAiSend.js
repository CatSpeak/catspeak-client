import { useCallback, useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { isRoomHost } from "@/features/video-call/utils/roomTypeHelpers"
import { parseApiError } from "@/shared/utils/apiError"
import { toast } from "react-hot-toast"
import {
  getRoomSetting,
  ROOM_SETTING_KEYS,
} from "@/features/video-call/utils/roomSettingHelpers"

/**
 * Encapsulates the entire AI send flow:
 *  1. Guard against duplicate sends / concurrent prompts
 *  2. Create an optimistic interaction
 *  3. Track conversation thread (new or continued)
 *  4. Broadcast public prompts via LiveKit
 *  5. Call the backend API
 *  6. Handle errors
 *
 * Returns `sendAiMessage(text, { isPrivateAi, replyTarget })` and `isBlocked`.
 */
export const useAiSend = () => {
  const sendingRef = useRef(false)
  const { t } = useLanguage()
  const {
    addOptimisticAiMessage,
    chatPublicAi,
    chatPrivateAi,
    currentUserId,
    lkRoomName,
    localParticipant,
    isCurrentUserPrompting,
    updateAiInteraction,
    startNewThread,
    continueThread,
    getConversationThread,
    room,
    id: roomIdFromContext,
    user,
    isHost: isHostFromContext,
  } = useGlobalVideoCall()

  /**
   * @param {string} text - The user's raw message (already trimmed)
   * @param {object} options
   * @param {boolean} options.isPrivateAi
   * @param {object|null} options.replyTarget - The AI message being replied to (or null)
   */
  const sendAiMessage = useCallback(
    async (text, { isPrivateAi, replyTarget }) => {
      if (sendingRef.current || isCurrentUserPrompting) return
      sendingRef.current = true

      const currentRoomId = room?.id || roomIdFromContext
      const isHost = isHostFromContext || isRoomHost(room, user?.accountId)
      const isMemberPrivateAiAllowed = getRoomSetting(
        currentRoomId,
        ROOM_SETTING_KEYS.MEMBER_PRIVATE_AI
      )

      if (!isHost && isPrivateAi && !isMemberPrivateAiAllowed) {
        toast.error(
          t.rooms?.general?.privateAiDisabledByHost ||
            "Host đã tắt quyền sử dụng AI Chat riêng tư đối với thành viên."
        )
        sendingRef.current = false
        return
      }

      const interactionId = `ai-opt-${Date.now()}`

      try {
        const isPublic = !isPrivateAi
        const isSystemReply = replyTarget?.from?.isSystem
        const prefix = isSystemReply
          ? "@AISystem"
          : isPublic
            ? "@AIPublic"
            : "@AIPrivate"
        const formattedPrompt = `${prefix} ${text}`
        const roomName = lkRoomName || "General"

        // 1. Optimistic UI update
        addOptimisticAiMessage({
          id: interactionId,
          type: "interaction",
          timestamp: Date.now(),
          prompt: formattedPrompt,
          topic: isPublic ? "public-ai" : "private-ai",
          questioner: currentUserId,
          response: null,
          status: "loading",
          from: {
            name: t?.rooms?.chatBox?.you || "You",
            isLocal: true,
            isAi: false,
          },
          replyTo: replyTarget ? { message: replyTarget.message, name: replyTarget.from?.name || "Cat Speak" } : undefined,
        })

        // 2. Track conversation thread
        if (replyTarget) {
          const parentHistory = replyTarget.interactionId
            ? getConversationThread(replyTarget.interactionId)
            : []

          if (parentHistory.length > 0) {
            continueThread(replyTarget.interactionId, interactionId, text)
          } else {
            // Reconstruct a minimal context from the replyTarget UI state
            const initialContext = []
            if (replyTarget.replyTo?.message) {
              initialContext.push({
                role: "user",
                content: replyTarget.replyTo.message,
              })
            }
            if (replyTarget.message) {
              initialContext.push({
                role: "assistant",
                content: replyTarget.message,
              })
            }
            startNewThread(interactionId, text, initialContext)
          }
        } else {
          startNewThread(interactionId, text)
        }

        // 3. Broadcast public prompt via LiveKit
        if (isPublic && localParticipant) {
          try {
            const payload = JSON.stringify({
              message: formattedPrompt,
              questioner: currentUserId,
              replyTo: replyTarget ? { message: replyTarget.message, name: replyTarget.from?.name || "Cat Speak" } : undefined,
            })
            const encoded = new TextEncoder().encode(payload)
            localParticipant.publishData(encoded, {
              reliable: true,
              topic: "public-ai-prompt",
            })
          } catch (e) {
            console.warn("Failed to broadcast public AI prompt", e)
          }
        }

        // 4. Call the backend API
        const threadHistory = getConversationThread(interactionId)
        // Remove the last entry (current user prompt) — it goes as `message`
        const conversations = threadHistory.slice(0, -1)
        const roomLanguage = room?.languageType || room?.language || "en"
        const userTier = user?.tier || user?.Tier || "Free"

        const payload = {
          roomName,
          message: text,
          conversations,
          language: roomLanguage,
          tier: userTier,
        }

        let res
        if (isPublic) {
          res = await chatPublicAi(payload).unwrap()
        } else {
          res = await chatPrivateAi(payload).unwrap()
        }

        if (res && res.answer) {
          updateAiInteraction(interactionId, {
            status: "done",
            response: res.answer,
            followUpSuggestions: res.follow_up_questions || [],
            aiFrom: {
              name: isPublic ? "Public AI" : "Private AI",
              isSystem: false,
              isAi: true,
            },
          })
        }
      } catch (error) {
        console.error("AI chat error", error)
        const { statusCode, errorCode } = parseApiError(error)
        const isQuotaExceeded =
          statusCode === 429 ||
          errorCode === "AI_DAILY_TOKEN_LIMIT_EXCEEDED" ||
          errorCode === "AI_QUOTA_EXCEEDED"

        const errorMsg = isQuotaExceeded
          ? t?.rooms?.chatBox?.aiQuotaExceeded || "Daily AI token limit exceeded."
          : t?.rooms?.chatBox?.aiErrorResponse || "All models are unavailable."

        updateAiInteraction(interactionId, {
          status: "error",
          response: errorMsg,
          errorCode: errorCode || (isQuotaExceeded ? "AI_DAILY_TOKEN_LIMIT_EXCEEDED" : "AI_SERVICE_ERROR"),
          aiFrom: { name: "Cat Speak", isSystem: true, isAi: true },
        })
      } finally {
        requestAnimationFrame(() => {
          sendingRef.current = false
        })
      }
    },
    [
      addOptimisticAiMessage,
      chatPublicAi,
      chatPrivateAi,
      currentUserId,
      t,
      isCurrentUserPrompting,
      lkRoomName,
      localParticipant,
      updateAiInteraction,
      startNewThread,
      continueThread,
      getConversationThread,
      room,
      roomIdFromContext,
      user,
      isHostFromContext,
    ],
  )

  return {
    sendAiMessage,
    /** True when the current user already has a pending AI prompt */
    isBlocked: isCurrentUserPrompting,
  }
}
