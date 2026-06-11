import React, { useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const DISPLAY_NAMES = {
  en: "English",
  vi: "Tiếng Việt",
  zh: "中文",
}

/**
 * Language selection popover.
 *
 * @param {string[]}       languages        — ordered list of supported language codes
 * @param {string|null}    selectedLanguage — currently highlighted language (null = none)
 * @param {(lang) => void} onSelect         — called with the chosen language code
 * @param {string}         label            — header text inside the popover
 * @param {() => void}     [onClose]        — called when user clicks outside
 */
const SubtitleLanguagePicker = ({
  languages,
  selectedLanguage,
  onSelect,
  label = "Select language",
  onClose,
}) => {
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!onClose) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[#E5E5E5] bg-white p-3 shadow-lg"
      style={{ minWidth: 180 }}
    >
      <p className="mb-2 text-xs font-medium text-gray-500">{label}</p>
      <div className="flex flex-col gap-1">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onSelect(lang)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
              selectedLanguage === lang ? "font-semibold text-primary" : "text-gray-800"
            }`}
          >
            {DISPLAY_NAMES[lang] ?? lang}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SubtitleLanguagePicker
