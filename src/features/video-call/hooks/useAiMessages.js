import { useState, useEffect, useCallback, useRef } from "react"
import { RoomEvent } from "livekit-client"
import { useConversationThreads } from "./useConversationThreads"
import { flattenAiInteractions } from "../utils/flattenAiInteractions"
import {
  getInitialMeetingSuggestions,
  getMoreMeetingSuggestions,
} from "../utils/meetingSuggestionHelpers"

/**
 * Orchestrates AI interactions: optimistic messages, LiveKit data handling,
 * conversation threads, meeting starter greeting, and flat message output.
 */
export const useAiMessages = (lkRoom, currentUserId, participants = []) => {
  const [aiInteractions, setAiInteractions] = useState([])
  const currentUserIdRef = useRef(currentUserId)
  const hasSentGreetingRef = useRef(false)
  const usedSuggestionIdsRef = useRef(new Set())
  const chatCountRef = useRef(0)

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
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    )
  }, [])

  // ── Starter Greeting (FR-001, BR-004) ──
  const triggerStarterGreeting = useCallback(
    (roomTopic = null, targetLanguage = "en") => {
      if (hasSentGreetingRef.current) return

      try {
        const { topicKey, topicNameVi, topicNameEn, topicIcon, suggestions } =
          getInitialMeetingSuggestions({
            roomTopic,
            targetLanguage,
            usedIds: usedSuggestionIdsRef.current,
            chatCount: chatCountRef.current,
          })

        suggestions.forEach((s) => usedSuggestionIdsRef.current.add(s.id))
        hasSentGreetingRef.current = true

        setAiInteractions((prev) => [
          {
            id: "ai-starter-greeting",
            type: "starter-greeting",
            timestamp: Date.now(),
            topicInfo: {
              topicKey,
              topicNameVi,
              topicNameEn,
              topicIcon,
            },
            suggestions,
            status: "done",
            aiFrom: { name: "Cat Speak", isSystem: false, isAi: true },
          },
          ...prev,
        ])
      } catch (err) {
        console.warn("[useAiMessages] Failed to generate starter greeting:", err)
        // E-001: silent fail — do not block the chat flow
      }
    },
    [],
  )

  // ── Load More Meeting Suggestions (FR-007) ──
  const loadMoreMeetingSuggestions = useCallback(
    (roomTopic = null, targetLanguage = "en") => {
      try {
        const moreItems = getMoreMeetingSuggestions({
          roomTopic,
          targetLanguage,
          usedIds: usedSuggestionIdsRef.current,
          chatCount: chatCountRef.current,
          count: 3,
        })

        moreItems.forEach((s) => usedSuggestionIdsRef.current.add(s.id))

        setAiInteractions((prev) =>
          prev.map((item) => {
            if (item.type === "starter-greeting") {
              return {
                ...item,
                suggestions: [...(item.suggestions || []), ...moreItems],
              }
            }
            return item
          }),
        )
      } catch (err) {
        console.warn("[useAiMessages] Failed to load more suggestions:", err)
      }
    },
    [],
  )

  // ── LiveKit data handler ──

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, participant, kind, topic) => {
      // Handle incoming public AI prompt from another user
      if (topic === "public-ai-prompt") {
        try {
          const decoded = new TextDecoder().decode(payload)
          const json = JSON.parse(decoded)
          const questionerName =
            participant?.name || participant?.identity || "Someone"

          setAiInteractions((prev) => [
            ...prev,
            {
              id: `ai-prompt-${Date.now()}-${Math.random()}`,
              type: "interaction",
              timestamp: Date.now(),
              prompt: json.message,
              promptRaw: json.message,
              topic: "public-ai",
              questioner: json.questioner,
              response: null,
              status: "loading",
              from: { name: questionerName, isLocal: false, isAi: false },
              replyTo: json.replyTo,
            },
          ])
        } catch (e) {
          console.warn(
            "[LiveKit Debug] Failed to parse public-ai-prompt payload:",
            e,
          )
        }
        return
      }

      // Only process AI response topics
      if (topic !== "public-ai" && topic !== "private-ai") return

      try {
        const decoded = new TextDecoder().decode(payload)
        const json = JSON.parse(decoded)

        // Filter private messages not meant for the current user
        if (
          topic === "private-ai" &&
          json.questioner &&
          String(json.questioner) !== String(currentUserIdRef.current)
        ) {
          return
        }

        const fromName = topic === "public-ai" ? "Public AI" : "Private AI"

        let answerText = json.answer || json.message || ""
        let followUps = Array.isArray(json.follow_up_questions)
          ? json.follow_up_questions
          : Array.isArray(json.followUpSuggestions)
            ? json.followUpSuggestions
            : []

        // Parse structured JSON inside message if present (fallback)
        if (typeof answerText === "string" && answerText.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(answerText)
            if (parsed.answer) {
              answerText = parsed.answer
              if (Array.isArray(parsed.follow_up_questions)) {
                followUps = parsed.follow_up_questions
              }
            }
          } catch {
            // E-002: silent fail for follow-up parsing
          }
        }

        chatCountRef.current += 1

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
                response: answerText,
                followUpSuggestions: followUps,
                status: "done",
                responseTimestamp: json.timestamp || Date.now(),
                aiFrom: { name: fromName, isSystem: false, isAi: true },
              }
              // Append the assistant turn to the conversation thread
              appendAssistantTurn(newInteractions[i].id, answerText)
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
              response: answerText,
              followUpSuggestions: followUps,
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
      interaction.status === "loading",
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
    triggerStarterGreeting,
    loadMoreMeetingSuggestions,
  }
}
