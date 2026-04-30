import { useCallback, useRef } from "react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

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

      const interactionId = `ai-opt-${Date.now()}`

      try {
        const isPublic = !isPrivateAi
        const formattedPrompt = `${isPublic ? "@AIPublic" : "@AIPrivate"} ${text}`
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
        })

        // 2. Track conversation thread
        if (replyTarget?.interactionId) {
          continueThread(replyTarget.interactionId, interactionId, text)
        } else {
          startNewThread(interactionId, text)
        }

        // 3. Broadcast public prompt via LiveKit
        if (isPublic && localParticipant) {
          try {
            const payload = JSON.stringify({
              message: formattedPrompt,
              questioner: currentUserId,
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

        const payload = { roomName, message: text, conversations }
        console.log("Sending AI payload:", payload)

        if (isPublic) {
          await chatPublicAi(payload).unwrap()
        } else {
          await chatPrivateAi(payload).unwrap()
        }
      } catch (error) {
        console.error("AI chat error", error)
        updateAiInteraction(interactionId, {
          status: "error",
          response: error?.data?.message || "All models are unavailable.",
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
    ],
  )

  return {
    sendAiMessage,
    /** True when the current user already has a pending AI prompt */
    isBlocked: isCurrentUserPrompting,
  }
}
