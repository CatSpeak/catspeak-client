import React, { useRef, useEffect, useState } from "react"
import { Globe, ChevronDown } from "lucide-react"
import { useSubtitles } from "@/features/video-call/hooks/useSubtitles"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"

const LANG_MAP = { English: "en", Chinese: "zh", Vietnamese: "vi" }
const DISPLAY_NAMES = { en: "English", vi: "Tiếng Việt", zh: "中文" }
const LANG_FLAGS = { en: USA, vi: VietNam, zh: China }

/**
 * In-call subtitle overlay for non-AI rooms.
 * Displays subtitles filtered by the viewer's selected display language.
 * Includes an inline language switcher for changing the display language.
 */
const SubtitleOverlayNonAI = ({ showRoomSubtitles }) => {
  const { subtitles } = useSubtitles()
  const { room, subtitleSelectedLanguage, setSubtitleSelectedLanguage } =
    useGlobalVideoCall()
  const { t } = useLanguage()

  const [showLangPicker, setShowLangPicker] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [subtitles])

  if (!showRoomSubtitles) return null

  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const supportedLangs = roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="w-full shrink-0 flex flex-col items-center p-6 pt-0 z-20 relative">
      <div className="w-full flex flex-col h-40 bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
        {/* Language switcher */}
        <div className="relative flex justify-end shrink-0 border-b border-[#e5e5e5] p-2">
          <button
            className="flex h-9 items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100"
            onClick={() => setShowLangPicker(true)}
          >
            {LANG_FLAGS[subtitleSelectedLanguage] ? (
              <img
                src={LANG_FLAGS[subtitleSelectedLanguage]}
                alt=""
                className="w-5 h-5 rounded-full object-cover shadow-sm"
              />
            ) : (
              <Globe className="w-4 h-4 text-gray-500" />
            )}
            {DISPLAY_NAMES[subtitleSelectedLanguage] ??
              subtitleSelectedLanguage ??
              "Language"}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <Modal
          open={showLangPicker}
          onClose={() => setShowLangPicker(false)}
          title={t.rooms?.videoCall?.displayLanguage || "Display language"}
        >
          <div className="flex flex-col gap-1 pb-6">
            {supportedLangs.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSubtitleSelectedLanguage(lang)
                  setShowLangPicker(false)
                }}
                className={`text-base flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                  subtitleSelectedLanguage === lang
                    ? "bg-[#f2f2f2] font-semibold text-[#d40018]"
                    : "hover:bg-[#f2f2f2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={LANG_FLAGS[lang]}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover shadow-sm"
                  />
                  <span>{DISPLAY_NAMES[lang] ?? lang}</span>
                </div>
              </button>
            ))}
          </div>
        </Modal>

        {/* Scrollable subtitle list */}
        <div
          ref={scrollRef}
          className="p-3 flex-1 overflow-y-auto overscroll-contain pr-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cath-red-700 [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb:hover]:border-0 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]"
        >
          {subtitles.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-gray-400 italic text-sm">
                {t.rooms?.videoCall?.subtitleWaiting ||
                  "Waiting for subtitles..."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {subtitles.map((subtitle, index) => (
                <div
                  key={`${subtitle.timestamp}-${index}`}
                  className="text-left"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#d40018]">
                      {subtitle.speaker}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(subtitle.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700 sm:text-base">
                    {subtitle.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubtitleOverlayNonAI
