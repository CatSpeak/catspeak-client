import React, { useRef, useEffect, useState } from "react"
import { useSubtitles } from "@/features/video-call/hooks/useSubtitles"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import SubtitleLanguagePicker from "./SubtitleLanguagePicker"

const LANG_MAP  = { English: "en", Chinese: "zh", Vietnamese: "vi" }
const LANG_NAMES = { en: "EN", vi: "VI", zh: "ZH" }

/**
 * In-call subtitle overlay for non-AI rooms.
 * Displays subtitles filtered by the viewer's selected display language.
 * Includes an inline language switcher for changing the display language.
 */
const SubtitleOverlayNonAI = ({ showRoomSubtitles }) => {
  const { subtitles } = useSubtitles()
  const { room, subtitleSelectedLanguage, setSubtitleSelectedLanguage } =
    useGlobalVideoCall()

  const [showLangPicker, setShowLangPicker] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [subtitles])

  if (!showRoomSubtitles || subtitles.length === 0) return null

  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const supportedLangs = roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center pb-4">
      <div className="w-full max-w-[80%] rounded-lg bg-black/70 px-4 py-3 text-white shadow-lg backdrop-blur-sm">

        {/* Language switcher — pointer-events-auto so it's clickable */}
        <div className="pointer-events-auto relative mb-2 flex justify-end">
          <button
            onClick={() => setShowLangPicker((v) => !v)}
            className="flex items-center gap-1 rounded bg-white/20 px-2 py-0.5 text-xs font-medium text-white hover:bg-white/30"
          >
            {LANG_NAMES[subtitleSelectedLanguage] ?? subtitleSelectedLanguage ?? "—"}
          </button>

          {showLangPicker && (
            <SubtitleLanguagePicker
              languages={supportedLangs}
              selectedLanguage={subtitleSelectedLanguage}
              onSelect={(lang) => {
                setSubtitleSelectedLanguage(lang)
                setShowLangPicker(false)
              }}
              label="Display language"
              onClose={() => setShowLangPicker(false)}
            />
          )}
        </div>

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
