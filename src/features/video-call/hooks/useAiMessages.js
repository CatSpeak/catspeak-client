import { useState, useEffect, useCallback, useRef } from "react"
import { RoomEvent } from "livekit-client"

export const useAiMessages = (lkRoom, currentUserId, participants = []) => {
  const [aiInteractions, setAiInteractions] = useState([])
  const participantsRef = useRef(participants)
  const currentUserIdRef = useRef(currentUserId)

  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  // Allow the frontend to optimistically inject messages (e.g., user prompts)
  const addOptimisticAiMessage = useCallback((msg) => {
    setAiInteractions((prev) => [...prev, msg])
  }, [])

  const updateAiInteraction = useCallback((id, updates) => {
    setAiInteractions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, participant, kind, topic) => {
      // Handle incoming public AI prompt from another user
      if (topic === "public-ai-prompt") {
        try {
          const decoded = new TextDecoder().decode(payload)
          const json = JSON.parse(decoded)
          const questionerName = participant?.name || participant?.identity || "Someone"
          
          const promptInteraction = {
            id: `ai-prompt-${Date.now()}-${Math.random()}`,
            type: "interaction",
            timestamp: Date.now(),
            prompt: json.message,
            topic: "public-ai",
            questioner: json.questioner,
            response: null,
            status: "loading",
            from: { name: questionerName, isLocal: false, isAi: false }
          }
          
          setAiInteractions(prev => [...prev, promptInteraction])
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
          // Find the last interaction for this questioner that is loading
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
              found = true
              break
            }
          }

          if (!found) {
            // Fallback: create an interaction with just the response
            newInteractions.push({
              id: json.id || `ai-${Date.now()}-${Math.random()}`,
              type: "interaction",
              timestamp: json.timestamp || Date.now(),
              prompt: "...", // Unknown
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
  }, [lkRoom])

  const isCurrentUserPrompting = aiInteractions.some(
    (interaction) =>
      String(interaction.questioner) === String(currentUserIdRef.current) &&
      interaction.status === "loading"
  )

  const flatAiMessages = aiInteractions.flatMap((interaction) => {
    const msgs = []

    // 1. The Prompt
    msgs.push({
      id: interaction.id + "-prompt",
      timestamp: interaction.timestamp,
      message: interaction.prompt,
      topic: interaction.topic,
      questioner: interaction.questioner,
      from: interaction.from,
    })

    // 2. The Response (or Loading)
    if (interaction.status === "loading") {
      msgs.push({
        id: interaction.id + "-response",
        timestamp: interaction.timestamp + 1,
        message: null,
        status: "loading",
        replyTo: {
          message: interaction.prompt,
          name: interaction.from?.name || "User",
        },
        topic: interaction.topic,
        questioner: interaction.questioner,
        from: { name: "Cat Speak", isSystem: false, isAi: true },
      })
    } else if (
      interaction.status === "done" ||
      interaction.status === "error"
    ) {
      msgs.push({
        id: interaction.id + "-response",
        timestamp: interaction.timestamp + 1,
        message: interaction.response,
        status: interaction.status,
        replyTo: {
          message: interaction.prompt,
          name: interaction.from?.name || "User",
        },
        topic: interaction.topic,
        questioner: interaction.questioner,
        from: interaction.aiFrom || {
          name: "Cat Speak",
          isSystem: false,
          isAi: true,
        },
      })
    }

    return msgs
  })

  return {
    aiMessages: flatAiMessages,
    addOptimisticAiMessage,
    updateAiInteraction,
    isCurrentUserPrompting,
  }
}
