import { useState, useEffect, useRef } from "react"
import { parseMetadata } from "./useParticipantList"

/**
 * Tracks unread counts for room chat and AI chat, and plays
 * a notification sound when a participant raises their hand.
 *
 * @param {object} options
 * @param {Array}   options.chatMessages       - Parsed room chat messages
 * @param {Array}   options.combinedAiMessages - Merged AI + system messages
 * @param {boolean} options.showChat           - Whether the chat panel is open
 * @param {boolean} options.isChatCollapsed    - Whether the room-chat tab is collapsed
 * @param {boolean} options.isAiCollapsed      - Whether the AI-chat tab is collapsed
 * @param {Array}   options.participants       - Sorted participant list
 */
export const useUnreadTracking = ({
  chatMessages,
  combinedAiMessages,
  showChat,
  isChatCollapsed,
  isAiCollapsed,
  participants,
}) => {
  const [unreadRoomChat, setUnreadRoomChat] = useState(0)
  const [unreadAiChat, setUnreadAiChat] = useState(0)

  // ── Room chat unread ──
  const prevChatMessagesLength = useRef(chatMessages.length)
  useEffect(() => {
    if (chatMessages.length > prevChatMessagesLength.current) {
      if (!showChat || isChatCollapsed) {
        let newUnread = 0
        for (
          let i = prevChatMessagesLength.current;
          i < chatMessages.length;
          i++
        ) {
          if (!chatMessages[i].from?.isLocal) newUnread++
        }
        setUnreadRoomChat((prev) => prev + newUnread)
      }
    }
    prevChatMessagesLength.current = chatMessages.length
  }, [chatMessages, showChat, isChatCollapsed])

  // ── AI chat unread ──
  const prevAiMessagesRef = useRef(combinedAiMessages)
  useEffect(() => {
    if (combinedAiMessages === prevAiMessagesRef.current) return

    if (!showChat || isAiCollapsed) {
      let newUnread = 0
      const prevStatuses = new Map(
        prevAiMessagesRef.current.map((m) => [m.id, m.status]),
      )

      for (const msg of combinedAiMessages) {
        if (msg.from?.isLocal) continue

        const hasPrev = prevStatuses.has(msg.id)

        if (!hasPrev) {
          if (msg.status !== "loading") {
            newUnread++
          }
        } else {
          const prevStatus = prevStatuses.get(msg.id)
          if (
            prevStatus === "loading" &&
            (msg.status === "done" || msg.status === "error")
          ) {
            newUnread++
          }
        }
      }

      if (newUnread > 0) {
        setUnreadAiChat((prev) => prev + newUnread)
      }
    }

    prevAiMessagesRef.current = combinedAiMessages
  }, [combinedAiMessages, showChat, isAiCollapsed])

  // ── Reset unread when chat becomes visible ──
  useEffect(() => {
    if (showChat) {
      if (!isChatCollapsed) setUnreadRoomChat(0)
      if (!isAiCollapsed) setUnreadAiChat(0)
    }
  }, [showChat, isChatCollapsed, isAiCollapsed])

  // ── Hand-raise audio notification ──
  const prevRaisedHandsRef = useRef(new Set())
  useEffect(() => {
    const currentRaisedHands = new Set()
    let newHandRaised = false

    participants.forEach((p) => {
      const meta = parseMetadata(p.metadata)
      if (meta.handRaised === true) {
        currentRaisedHands.add(p.identity)
        if (!prevRaisedHandsRef.current.has(p.identity)) {
          newHandRaised = true
        }
      }
    })

    if (newHandRaised) {
      const audio = new Audio('/sounds/hand-raise.mp3')
      audio.volume = 0.5
      audio.play().catch(err => {
        console.warn("Hand raise audio blocked by browser autoplay policy:", err)
      })
    }

    prevRaisedHandsRef.current = currentRaisedHands
  }, [participants])

  return {
    unreadRoomChat,
    setUnreadRoomChat,
    unreadAiChat,
    setUnreadAiChat,
  }
}
