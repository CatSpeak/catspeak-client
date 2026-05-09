import { useState, useEffect, useRef } from "react"
import { RoomEvent } from "livekit-client"

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
        } catch (e) {
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
        let isJson = false
        let translatedMessage = null

        try {
          const json = JSON.parse(decoded)
          // If it's a standard user chat message that `useChat` will naturally handle, ignore it here
          if (participant && topic === "lk-chat") return

          isJson = true
          if (json.message !== undefined && json.message !== null) {
            messageText = json.message
          } else {
            // It's a JSON payload but has no 'message' field; skip displaying raw JSON
            messageText = ""
          }
          if (json.id) messageId = json.id
          if (json.timestamp) timestamp = json.timestamp
          if (json.translatedMessage) translatedMessage = json.translatedMessage
        } catch {
          // It's a string payload, we just use decoded
        }

        // Do not display empty messages
        if (!messageText || messageText.trim() === "") return

        const newSysMsg = {
          id: messageId,
          timestamp,
          message: messageText,
          translatedMessage,
          from: { name: "Cat Speak gợi ý", isSystem: true },
        }

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
