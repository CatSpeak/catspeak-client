import React, { useState, useEffect } from "react"
import { RoomEvent } from "livekit-client"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"

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
  const { t } = useLanguage()
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

  return (
    <div className="w-full shrink-0 flex justify-center p-2 md:pt-0 z-20 relative">
      <div className="w-full max-w-4xl bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200 px-6 py-4 min-h-[100px] flex items-center justify-center text-center text-sm leading-relaxed sm:text-base md:text-lg">
        {latestText ? (
          latestText
        ) : (
          <span className="text-gray-400 italic">
            {t.rooms?.videoCall?.speechWaiting || "Waiting for speech..."}
          </span>
        )}
      </div>
    </div>
  )
}

export default SubtitleOverlay
