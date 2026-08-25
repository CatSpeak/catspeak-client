import React, { useRef, useEffect, useState, useMemo } from "react"
import { Globe, ChevronDown, X } from "lucide-react"
import { useSubtitles } from "@/features/video-call/hooks/useSubtitles"
import { useGlobalVideoCall } from "@/features/video-call/context/GlobalVideoCallProvider"
import { useLanguage } from "@/shared/context/LanguageContext"
import Modal from "@/shared/components/ui/Modal"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import ListItem from "@/shared/components/ui/ListItem"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"

const LANG_MAP = {
  English: "en",
  Chinese: "zh",
  Vietnamese: "vi",
  Japanese: "ja",
}
const LANG_FLAGS = { en: UK, vi: VietNam, zh: China, ja: Japan }

/**
 * In-call subtitle overlay for non-AI rooms.
 * Displays subtitles filtered by the viewer's selected display language.
 * Includes an inline language switcher for changing the display language.
 */
const SubtitleOverlayNonAI = ({ showRoomSubtitles }) => {
  const { subtitles } = useSubtitles()
  const {
    room,
    subtitleSelectedLanguage,
    setSubtitleSelectedLanguage,
    stopSubtitles,
  } = useGlobalVideoCall()
  const { t } = useLanguage()

  const [showLangPicker, setShowLangPicker] = useState(false)
  const scrollRef = useRef(null)

  // Group consecutive subtitles from the same speaker
  const groupedSubtitles = useMemo(() => {
    const groups = []
    for (const item of subtitles) {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.speaker === item.speaker) {
        lastGroup.items.push(item)
      } else {
        groups.push({
          speaker: item.speaker,
          timestamp: item.timestamp,
          items: [item],
        })
      }
    }
    return groups
  }, [subtitles])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [subtitles])

  if (!showRoomSubtitles) return null

  const roomLangCode = LANG_MAP[room?.languageType] ?? "en"
  const supportedLangs = roomLangCode === "vi" ? ["vi"] : [roomLangCode, "vi"]

  return (
    <div className="w-full shrink-0 flex flex-col items-center mt-1 z-20 relative">
      <div className="w-full flex flex-col h-40 bg-white rounded-xl border border-border overflow-hidden group/subtitles relative">
        {/* Header bar with Language switcher and Close button - absolute UI overlay on hover */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between border-b border-border/80 px-4 h-[56px] opacity-0 group-hover/subtitles:opacity-100 pointer-events-none group-hover/subtitles:pointer-events-auto transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm">
          <span className="font-semibold">
            {t.rooms?.videoCall?.subtitles || "Subtitles"}
          </span>
          <div className="flex items-center gap-2">
            <PillButton
              variant="secondary"
              onClick={() => setShowLangPicker(true)}
              startIcon={
                LANG_FLAGS[subtitleSelectedLanguage] ? (
                  <img
                    src={LANG_FLAGS[subtitleSelectedLanguage]}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <Globe className="text-gray-500" />
                )
              }
            >
              {t.rooms?.videoCall?.subtitleLanguages?.[
                subtitleSelectedLanguage
              ] ??
                subtitleSelectedLanguage ??
                t.rooms?.videoCall?.displayLanguage ??
                "Language"}
            </PillButton>

            <IconButton
              onClick={stopSubtitles}
              title={
                t.rooms?.videoCall?.controls?.captionsOff ||
                "Turn off subtitles"
              }
              variant="ghost"
            >
              <X />
            </IconButton>
          </div>
        </div>

        <Modal
          open={showLangPicker}
          onClose={() => setShowLangPicker(false)}
          title={t.rooms?.videoCall?.displayLanguage || "Display language"}
          bodyClassName="pt-0 px-4 pb-4 sm:px-6 sm:pb-6 flex-1 overflow-y-auto"
        >
          <div className="flex flex-col gap-1">
            {supportedLangs.map((lang) => (
              <ListItem
                key={lang}
                onClick={() => {
                  setSubtitleSelectedLanguage(lang)
                  setShowLangPicker(false)
                }}
                hoverEffect={true}
                className="rounded-xl overflow-hidden"
                contentClassName={`rounded-xl ${
                  subtitleSelectedLanguage === lang
                    ? "bg-primaryBg font-semibold text-[#d40018]"
                    : ""
                }`}
                leftContent={
                  <img
                    src={LANG_FLAGS[lang]}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover shadow-sm"
                  />
                }
              >
                <span>
                  {t.rooms?.videoCall?.subtitleLanguages?.[lang] ?? lang}
                </span>
              </ListItem>
            ))}
          </div>
        </Modal>

        {/* Scrollable subtitle list */}
        <div
          ref={scrollRef}
          className="p-4 flex-1 overflow-y-auto overscroll-contain"
        >
          {subtitles.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-gray-400 italic text-sm">
                {t.rooms?.videoCall?.subtitleWaiting ||
                  "Waiting for subtitles..."}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              {groupedSubtitles.map((group, groupIdx) => (
                <p
                  key={`${group.timestamp}-${groupIdx}`}
                  className="text-sm leading-relaxed text-gray-900 w-full break-words text-left"
                >
                  <span className="font-semibold text-[#d40018] mr-1.5 shrink-0">
                    {group.speaker}:
                  </span>
                  {group.items.map((item, itemIdx) => (
                    <span key={`${item.timestamp}-${itemIdx}`}>
                      {item.text}{" "}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubtitleOverlayNonAI
