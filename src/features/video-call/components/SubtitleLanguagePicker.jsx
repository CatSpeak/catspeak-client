import React, { useRef, useEffect } from "react"
import { ChevronLeft, Check } from "lucide-react"
import { VietNam, China, UK, Japan, USA } from "@/shared/assets/icons/flags"

export const LANGUAGE_FLAGS = {
  vi: VietNam,
  zh: China,
  en: UK,
  ja: Japan,
  "en-US": USA,
  "en-GB": UK,
  "zh-CN": China,
}

export const getLanguageFlag = (lang) => {
  if (!lang) return null
  if (LANGUAGE_FLAGS[lang]) return LANGUAGE_FLAGS[lang]
  const prefix = lang.split("-")[0]?.toLowerCase()
  return LANGUAGE_FLAGS[prefix] || null
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
      <div className="p-1 flex flex-col">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center gap-2 rounded-xl p-3 text-sm text-gray-900 dark:text-white hover:bg-primaryBg dark:hover:bg-[#272727] transition-colors"
          >
            <ChevronLeft
              size={20}
              className="text-secondary dark:text-[#AAAAAA] shrink-0"
            />
            <span>{backLabel}</span>
          </button>
        ) : label ? (
          <p className="p-3 text-xs text-secondary dark:text-[#AAAAAA] uppercase tracking-wider">
            {label}
          </p>
        ) : null}

        {(onBack || label) && (
          <div className="my-1 border-t border-border dark:border-[#3F3F3F]"></div>
        )}

        <div className="flex flex-col gap-1">
          {languages?.map((lang) => {
            const isSelected = selectedLanguage === lang
            const flag = getLanguageFlag(lang)
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onSelect(lang)}
                className={`flex w-full items-center justify-between rounded-xl p-3 min-h-10 text-left text-sm transition-colors ${
                  isSelected
                    ? "text-cath-red-700 dark:text-red-400 bg-cath-red-700/10 dark:bg-red-950/40"
                    : "text-gray-900 dark:text-white hover:bg-primaryBg dark:hover:bg-[#272727]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {flag && (
                    <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border dark:border-[#3F3F3F]">
                      <img
                        src={flag}
                        alt=""
                        className="block h-full w-full object-cover"
                        draggable={false}
                      />
                    </span>
                  )}
                  <span className="truncate">
                    {languageNames?.[lang] ?? lang}
                  </span>
                </div>

                {isSelected && (
                  <Check
                    size={16}
                    className="text-cath-red-700 dark:text-red-400 shrink-0 ml-2"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SubtitleLanguagePicker
