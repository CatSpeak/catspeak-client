import React, { useRef, useEffect, useState, useMemo } from "react"
import { Globe, ChevronDown, X, Check } from "lucide-react"
import { useSubtitles } from "@/features/video-call/hooks/useSubtitles"
import { useSubtitleControls } from "@/features/video-call/hooks/useSubtitleControls"
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

const FONT_SIZES = [
  { id: "default", className: "text-base sm:text-lg" },
  { id: "xs", className: "text-sm" },
  { id: "sm", className: "text-[15px]" },
  { id: "md", className: "text-lg" },
  { id: "lg", className: "text-xl" },
  { id: "xl", className: "text-2xl" },
  { id: "2xl", className: "text-3xl" },
]

const TextSizeIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9.96973134,16.1676988 L14.5597933,3.65629281 C14.8658898,2.82190042 16.0062636,2.7839735 16.3882035,3.54251203 L16.4374349,3.65629281 L21.9389727,18.6530071 C22.1291829,19.1715035 21.8630543,19.7460237 21.3445578,19.9362339 C20.8630969,20.1128576 20.3333297,19.8960056 20.1078122,19.4489883 L20.0613311,19.3418191 L18.6507313,15.4986988 L12.3457313,15.4986988 L10.9040947,19.4185072 L10.9040947,19.4185072 L10.8631472,19.4974307 L10.8631472,19.4974307 L10.7910689,19.6055793 L10.7910689,19.6055793 L10.7134865,19.6954421 L10.7134865,19.6954421 L10.6286155,19.7731048 L10.6286155,19.7731048 L10.5461422,19.8334381 L10.5461422,19.8334381 L10.4957113,19.8642525 L10.4957113,19.8642525 L10.411619,19.9074431 L10.411619,19.9074431 L10.3076065,19.9480193 L10.3076065,19.9480193 L10.2029659,19.9761277 L10.2029659,19.9761277 L10.0696716,19.9950212 L10.0696716,19.9950212 L9.96236211,19.997081 L9.96236211,19.997081 L9.89175982,19.9920615 L9.89175982,19.9920615 L9.78921006,19.9756858 L9.78921006,19.9756858 L9.63922865,19.9311953 L9.63922865,19.9311953 L9.56990029,19.901584 L9.56990029,19.901584 L9.46987671,19.8472224 L9.46987671,19.8472224 L9.35831456,19.7671539 L9.35831456,19.7671539 L9.26665026,19.680721 L9.26665026,19.680721 L9.20269015,19.6050585 L9.20269015,19.6050585 L9.14144021,19.5150962 L9.14144021,19.5150962 L9.08735353,19.4126293 L9.08735353,19.4126293 L8.34173134,17.4996988 L4.65473134,17.4996988 L3.93200399,19.3598611 C3.74612765,19.8378261 3.23314027,20.091838 2.74868178,19.9654159 L2.63755197,19.9294171 C2.15958693,19.7435407 1.90557508,19.2305533 2.03199719,18.7460949 L2.06799601,18.634965 L5.56653421,9.63877441 C5.88137646,8.82918461 6.9873796,8.79063271 7.37757051,9.52311873 L7.43054218,9.63877441 L9.96973134,16.1676988 L14.5597933,3.65629281 L9.96973134,16.1676988 Z M6.49853819,12.7602387 L5.43273134,15.4996988 L7.56373134,15.4996988 L6.49853819,12.7602387 Z M15.4986141,6.90424881 L13.0787313,13.4986988 L17.9167313,13.4986988 L15.4986141,6.90424881 Z" />
  </svg>
)

/**
 * In-call subtitle overlay for non-AI rooms.
 * Displays subtitles filtered by the viewer's selected display language.
 * Includes an inline language switcher that invokes changeSubtitleLanguage to trigger backend API sessions.
 */
const SubtitleOverlayNonAI = ({ showRoomSubtitles }) => {
  const {
    room,
    subtitleSelectedLanguage,
    stopSubtitles,
    changeSubtitleLanguage,
  } = useGlobalVideoCall()
  const { subtitles } = useSubtitles()
  const { t } = useLanguage()

  const [showLangPicker, setShowLangPicker] = useState(false)
  const [showSizePicker, setShowSizePicker] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("catspeak_subtitle_font_size") || "default"
  })

  const scrollRef = useRef(null)
  const sizePickerRef = useRef(null)

  // Close size picker on outside click
  useEffect(() => {
    if (!showSizePicker) return
    const handleClickOutside = (e) => {
      if (sizePickerRef.current && !sizePickerRef.current.contains(e.target)) {
        setShowSizePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showSizePicker])

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
  const currentFontClass =
    FONT_SIZES.find((s) => s.id === fontSize)?.className || "text-sm"

  return (
    <div className="w-full shrink-0 flex flex-col items-center mt-1 z-20 relative">
      <div className="w-full flex flex-col h-52 bg-white rounded-xl border border-border group/subtitles relative">
        {/* Header bar with Language switcher, Font size button and Close button - absolute UI overlay on hover */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between border-b border-border/80 px-4 h-[56px] rounded-t-xl opacity-0 group-hover/subtitles:opacity-100 pointer-events-none group-hover/subtitles:pointer-events-auto transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm">
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

            {/* Font Size Selector */}
            <div className="relative" ref={sizePickerRef}>
              <IconButton
                onClick={() => setShowSizePicker((prev) => !prev)}
                title={t.rooms?.videoCall?.fontSize || "Cỡ chữ"}
                variant={showSizePicker ? "filled" : "ghost"}
              >
                <TextSizeIcon className="w-5 h-5" />
              </IconButton>

              {showSizePicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50 min-w-[170px] bg-white text-gray-800 rounded-2xl shadow-xl border border-border py-1.5 flex flex-col overflow-hidden pointer-events-auto">
                  {FONT_SIZES.map((size) => {
                    const isSelected = fontSize === size.id
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => {
                          setFontSize(size.id)
                          localStorage.setItem(
                            "catspeak_subtitle_font_size",
                            size.id,
                          )
                          setShowSizePicker(false)
                        }}
                        className={`flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-primaryBg text-[#d40018] font-semibold"
                            : "text-gray-700 hover:bg-primaryBg hover:text-gray-900"
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          {isSelected && (
                            <Check className="w-4 h-4 text-[#d40018]" />
                          )}
                        </div>
                        <span>
                          {t.rooms?.videoCall?.fontSizes?.[size.id] || size.id}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

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
                  changeSubtitleLanguage(lang)
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
                  className={`${currentFontClass} leading-relaxed text-gray-900 w-full break-words text-left`}
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
