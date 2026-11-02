import React, { useRef, useEffect } from "react"
import { ChevronLeft } from "lucide-react"

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
 * @param {Record<string,string>} [languageNames] — localized display names per language code
 */
const SubtitleLanguagePicker = ({
  languages,
  selectedLanguage,
  onSelect,
  label = "Select language",
  onClose,
  onBack,
  backLabel = "Back",
  languageNames,
  className = "w-full rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-foreground dark:text-white shadow-lg",
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
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-[#F6F6F6] dark:hover:bg-[#272727]"
          >
            <ChevronLeft size={18} />
            {backLabel}
          </button>
        ) : label ? (
          <p className="px-2 py-2 text-xs font-medium text-gray-500 dark:text-[#AAAAAA]">{label}</p>
        ) : null}
        
        {(onBack || label) && <div className="mb-1 border-t border-border dark:border-[#3F3F3F]"></div>}
        <div className="flex flex-col gap-1">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => onSelect(lang)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 min-h-10 text-left text-sm hover:bg-[#F6F6F6] dark:hover:bg-[#272727] ${
                selectedLanguage === lang
                  ? "font-semibold text-cath-red-700 dark:text-red-400 bg-cath-red-700/10 dark:bg-red-950/40"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {languageNames?.[lang] ?? lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubtitleLanguagePicker
