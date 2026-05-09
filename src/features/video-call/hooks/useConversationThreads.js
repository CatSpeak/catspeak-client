import { useCallback, useRef } from "react"

/**
 * Manages multi-turn conversation threads for AI interactions.
 *
 * Each thread is an array of { role: "user" | "assistant", content } entries
 * keyed by interactionId. When users reply to an AI response, the parent
 * thread is copied and extended so the backend receives full context.
 */
export const useConversationThreads = () => {
  // Maps interactionId → Array<{ role: "user" | "assistant", content: string }>
  const threadsRef = useRef({})

  /**
   * Start a brand-new conversation thread for a fresh prompt.
   * @param {string} interactionId - The optimistic interaction ID
   * @param {string} prompt - The user's message text
   */
  const startNewThread = useCallback((interactionId, prompt) => {
    threadsRef.current[interactionId] = [
      { role: "user", content: prompt },
    ]
  }, [])

  /**
   * Continue an existing conversation thread (reply to an AI response).
   * Copies the parent thread and appends the new user prompt.
   * @param {string} replyToInteractionId - The interaction being replied to
   * @param {string} newInteractionId - The new optimistic interaction ID
   * @param {string} prompt - The user's new message text
   */
  const continueThread = useCallback((replyToInteractionId, newInteractionId, prompt) => {
    const parentThread = threadsRef.current[replyToInteractionId] || []
    threadsRef.current[newInteractionId] = [
      ...parentThread,
      { role: "user", content: prompt },
    ]
  }, [])

  /**
   * Append an assistant response to an existing thread.
   * Called automatically when an AI response arrives.
   * @param {string} interactionId
   * @param {string} content - The AI response text
   */
  const appendAssistantTurn = useCallback((interactionId, content) => {
    if (threadsRef.current[interactionId]) {
      threadsRef.current[interactionId].push({
        role: "assistant",
        content,
      })
    }
  }, [])

  /**
   * Get the conversation history for a given interaction.
   * Returns the array that should be sent to the backend as `conversations`.
   * @param {string} interactionId
   * @returns {Array<{ role: string, content: string }>}
   */
  const getConversationThread = useCallback((interactionId) => {
    return threadsRef.current[interactionId] || []
  }, [])

  return {
    startNewThread,
    continueThread,
    appendAssistantTurn,
    getConversationThread,
  }
}
