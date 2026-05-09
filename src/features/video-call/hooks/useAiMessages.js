import { useState, useEffect, useCallback, useRef } from "react"
import { RoomEvent } from "livekit-client"
import { useConversationThreads } from "./useConversationThreads"
import { flattenAiInteractions } from "../utils/flattenAiInteractions"

/**
 * Orchestrates AI interactions: optimistic messages, LiveKit data handling,
 * conversation threads, and flat message output for rendering.
 */
export const useAiMessages = (lkRoom, currentUserId, participants = []) => {
  const [aiInteractions, setAiInteractions] = useState([])
  const currentUserIdRef = useRef(currentUserId)

  // ── Sub-hooks ──
  const {
    startNewThread,
    continueThread,
    appendAssistantTurn,
    getConversationThread,
  } = useConversationThreads()

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  // ── Interaction mutators ──

  const addOptimisticAiMessage = useCallback((msg) => {
    setAiInteractions((prev) => [...prev, msg])
  }, [])

  const updateAiInteraction = useCallback((id, updates) => {
    setAiInteractions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  // ── LiveKit data handler ──

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, participant, kind, topic) => {
      // Handle incoming public AI prompt from another user
      if (topic === "public-ai-prompt") {
        try {
          const decoded = new TextDecoder().decode(payload)
          const json = JSON.parse(decoded)
          const questionerName = participant?.name || participant?.identity || "Someone"

          setAiInteractions(prev => [...prev, {
            id: `ai-prompt-${Date.now()}-${Math.random()}`,
            type: "interaction",
            timestamp: Date.now(),
            prompt: json.message,
            topic: "public-ai",
            questioner: json.questioner,
            response: null,
            status: "loading",
            from: { name: questionerName, isLocal: false, isAi: false },
          }])
        } catch (e) {
          console.warn("[LiveKit Debug] Failed to parse public-ai-prompt payload:", e)
        }
        return
      }

      // Only process AI response topics
      if (topic !== "public-ai" && topic !== "private-ai") return

      try {
        const decoded = new TextDecoder().decode(payload)
        const json = JSON.parse(decoded)

        // Filter private messages not meant for the current user
        if (topic === "private-ai" && json.questioner && String(json.questioner) !== String(currentUserIdRef.current)) {
          return
        }

        const fromName = topic === "public-ai" ? "Public AI" : "Private AI"

        setAiInteractions((prev) => {
          const newInteractions = [...prev]
          let found = false

          for (let i = newInteractions.length - 1; i >= 0; i--) {
            if (
              newInteractions[i].questioner === json.questioner &&
              newInteractions[i].status === "loading"
            ) {
              newInteractions[i] = {
                ...newInteractions[i],
                response: json.message,
                status: "done",
                responseTimestamp: json.timestamp || Date.now(),
                aiFrom: { name: fromName, isSystem: false, isAi: true },
              }
              // Append the assistant turn to the conversation thread
              appendAssistantTurn(newInteractions[i].id, json.message)
              found = true
              break
            }
          }

          if (!found) {
            newInteractions.push({
              id: json.id || `ai-${Date.now()}-${Math.random()}`,
              type: "interaction",
              timestamp: json.timestamp || Date.now(),
              prompt: "...",
              topic: topic,
              questioner: json.questioner,
              response: json.message,
              status: "done",
              from: { name: "Unknown", isLocal: false, isAi: false },
              aiFrom: { name: fromName, isSystem: false, isAi: true },
            })
          }
          return newInteractions
        })
      } catch (e) {
        console.warn("[LiveKit Debug] Failed to parse AI message payload:", e)
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom, appendAssistantTurn])

  // ── Derived state ──

  const isCurrentUserPrompting = aiInteractions.some(
    (interaction) =>
      String(interaction.questioner) === String(currentUserIdRef.current) &&
      interaction.status === "loading"
  )

  const flatAiMessages = flattenAiInteractions(aiInteractions)

  return {
    aiMessages: flatAiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
    startNewThread,
    continueThread,
    getConversationThread,
  }
}
