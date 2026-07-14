import { useState, useEffect, useRef } from "react"
import { RoomEvent } from "livekit-client"

const VOCAB_MESSAGES = [
  "Need a little help with words? Try some of these friendly suggestions:",
  "Here are some simple and useful words to keep your chat going:",
  "Here is a list of friendly words that might help you express yourself:",
  "Want to try some new words? Here are a few simple choices:",
  "Here are some easy and helpful words you can use in your conversation:"
]

export const useSystemMessages = (lkRoom, receiveSystemMessages = true) => {
  const [systemMessages, setSystemMessages] = useState([])
  const receiveRef = useRef(receiveSystemMessages)

  useEffect(() => {
    receiveRef.current = receiveSystemMessages
  }, [receiveSystemMessages])

  useEffect(() => {
    if (!lkRoom) {
      console.warn(
        "[LiveKit Debug] lkRoom is null, cannot attach DataReceived listener.",
      )
      return
    }

    console.log(
      `[LiveKit Debug] DataReceived listener actively attached to room: ${lkRoom.name || "Unknown"}`,
    )

    const handleData = (payload, participant, kind, topic) => {
      const decoded = new TextDecoder().decode(payload)
      console.log(
        `[LiveKit Debug] Packet Received! Topic:`,
        topic,
        `| Participant:`,
        participant?.identity,
        `| Content:`,
        decoded,
      )

      if (!participant) {
        console.log("🚀 [BACKEND PAYLOAD RECEIVED] Topic:", topic)
        console.log("Raw decoded:", decoded)
        try {
          const parsed = JSON.parse(decoded)
          console.log("Parsed JSON:", parsed)
        } catch {
          // Not a JSON payload, ignore
        }
      }

      // Ignore AI messages, they are handled separately by useAiMessages
      if (topic === "public-ai" || topic === "private-ai") {
        return
      }

      // We accept any packet without a source participant (likely server-sent API),
      // OR specifically packets on 'lk-chat'/'system' topics.
      if (!participant || topic === "lk-chat" || topic === "system") {
        let messageText = decoded
        let messageId = `sys-${Date.now()}-${Math.random()}`
        let timestamp = Date.now()
        let translatedMessage = null
        let vocabulary = null
        let suggestedSentences = null

        try {
          const json = JSON.parse(decoded)
          // If it's a standard user chat message that `useChat` will naturally handle, ignore it here
          if (participant && topic === "lk-chat") return

          if (json.vocabulary || json.suggested_sentences) {
            vocabulary = json.vocabulary || null
            suggestedSentences = json.suggested_sentences || null
          }

          if (json.message !== undefined && json.message !== null) {
            messageText = json.message
          } else {
            messageText = ""
          }
          if (json.id) messageId = json.id
          if (json.timestamp) timestamp = json.timestamp
          if (json.translatedMessage) translatedMessage = json.translatedMessage
        } catch {
          // It's a string payload, we just use decoded
        }

        // Do not display empty messages unless there is suggestion data
        if (!vocabulary && !suggestedSentences && (!messageText || messageText.trim() === "")) return

        const newSysMsg = {
          id: messageId,
          timestamp,
          message: messageText,
          from: { name: "Cat Speak gợi ý", isSystem: true },
        }

        let introMessage = null
        if (vocabulary) {
          introMessage = VOCAB_MESSAGES[Math.floor(Math.random() * VOCAB_MESSAGES.length)]
        }

        if (introMessage) newSysMsg.introMessage = introMessage
        if (translatedMessage) newSysMsg.translatedMessage = translatedMessage
        if (vocabulary) newSysMsg.vocabulary = vocabulary
        if (suggestedSentences) newSysMsg.suggestedSentences = suggestedSentences

        if (receiveRef.current) {
          setSystemMessages((prev) => [...prev, newSysMsg])
        }
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => {
      lkRoom.off(RoomEvent.DataReceived, handleData)
    }
  }, [lkRoom])

  return systemMessages
}
