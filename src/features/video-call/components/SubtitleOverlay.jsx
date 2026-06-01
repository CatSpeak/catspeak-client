import React, { useState, useEffect } from "react"
import { RoomEvent } from "livekit-client"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"

const AI_SESSION_SPEECH_TOPIC = "ai-session-speech"

/**
 * In-call subtitle overlay for AI tutor sessions.
 * Listens directly on the LiveKit room for `ai-session-speech` data packets
 * published by the agent when it finishes speaking, and shows the latest
 * transcript as a bar pinned to the bottom of the video area.
 *
 * Must be rendered inside a `position: relative` container.
 */
const SubtitleOverlay = () => {
  const { lkRoom } = useGlobalVideoCall()
  const [latestText, setLatestText] = useState(null)

  useEffect(() => {
    if (!lkRoom) return

    const handleData = (payload, _participant, _kind, topic) => {
      if (topic !== AI_SESSION_SPEECH_TOPIC) return
      try {
        const { message } = JSON.parse(new TextDecoder().decode(payload))
        if (message) setLatestText(message)
      } catch {
        // ignore malformed packets
      }
    }

    lkRoom.on(RoomEvent.DataReceived, handleData)
    return () => lkRoom.off(RoomEvent.DataReceived, handleData)
  }, [lkRoom])

  if (!latestText) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
      <div className="max-w-[80%] rounded-lg bg-black/70 px-4 py-2 text-center text-sm leading-relaxed text-white shadow-lg sm:text-base">
        {latestText}
      </div>
    </div>
  )
}

export default SubtitleOverlay
