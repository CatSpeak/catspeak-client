import React, { useRef, useEffect } from "react"
import { ChevronDown, ChevronLeft } from "lucide-react"

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
 * @param {string}         [label]          — header text inside the popover
 * @param {() => void}     [onClose]        — called when user clicks outside
 * @param {() => void}     [onBack]         — called when the back button is clicked (replaces label)
 * @param {string}         [backLabel]      — text for the back button
 */
const SubtitleLanguagePicker = ({
  languages,
  selectedLanguage,
  onSelect,
  label = "Select language",
  onClose,
  onBack,
  backLabel = "Back",
  className = "w-full rounded-lg border border-[#E5E5E5] bg-white shadow-lg",
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
    <div ref={ref} className={className}>
      <div className="p-1">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-gray-800 hover:bg-[#F6F6F6]"
          >
            <ChevronLeft size={18} />
            {backLabel}
          </button>
        ) : label ? (
          <p className="px-2 py-2 text-xs font-medium text-gray-500">{label}</p>
        ) : null}
        
        {(onBack || label) && <div className="mb-1 border-t border-[#E5E5E5]"></div>}
        <div className="flex flex-col gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => onSelect(lang)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 min-h-10 text-left text-sm hover:bg-[#F6F6F6] ${
                selectedLanguage === lang
                  ? "font-semibold text-[#d40018]"
                  : "text-gray-800"
              }`}
            >
              {DISPLAY_NAMES[lang] ?? lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubtitleLanguagePicker
