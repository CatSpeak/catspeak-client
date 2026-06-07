import React, { useRef, useEffect } from "react"
import { useSubtitles } from "@/features/video-call/hooks/useSubtitles"

/**
 * In-call subtitle overlay for non-AI rooms.
 * Displays multiple subtitles in a scrollable panel at the bottom of the video area.
 * Each subtitle shows the speaker name, timestamp, and text.
 *
 * Must be rendered inside a `position: relative` container.
 *
 * @param {boolean} showRoomSubtitles - Whether the user has enabled subtitles
 */
const SubtitleOverlayNonAI = ({ showRoomSubtitles }) => {
  const { subtitles } = useSubtitles()
  const scrollRef = useRef(null)

  // Auto-scroll to bottom when new subtitles arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [subtitles])

  if (!showRoomSubtitles || subtitles.length === 0) return null

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-4">
      <div className="w-full max-w-[80%] rounded-lg bg-black/70 backdrop-blur-sm px-4 py-3 text-white shadow-lg">
        {/* Scrollable subtitle list */}
        <div
          ref={scrollRef}
          className="max-h-48 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent"
        >
          <div className="flex flex-col gap-2">
            {subtitles.map((subtitle, index) => (
              <div
                key={`${subtitle.timestamp}-${index}`}
                className="rounded bg-white/10 px-3 py-2 text-left"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-300">
                    {subtitle.speaker}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(subtitle.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-white sm:text-base">
                  {subtitle.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubtitleOverlayNonAI
