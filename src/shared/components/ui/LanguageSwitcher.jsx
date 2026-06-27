import React, { useState, useRef } from "react"
import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"

const MotionButton = motion.button

/**
 * UI languages. Standard Vietnamese (`vi`) is fully enabled.
 * Nôm Vietnamese is not listed here — when you add it for development, use e.g.
 * `{ key: "viNom", label: "Tiếng Việt (Nôm)", flag: VietNam, disabled: true }`
 * and omit or comment that entry for production builds.
 */
const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: USA },
]

const LanguageSwitcher = ({ className = "" }) => {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setOpen(false))

  const handleToggle = () => setOpen((prev) => !prev)

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    setOpen(false)
  }

  const current = LANGUAGES.find((l) => l.key === language) || LANGUAGES[0]
  const displayLabel =
    t.header?.languages?.[language] ||
    t.header?.languages?.en ||
    current.label

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={dropdownRef}
    >
      <MotionButton
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
        title={displayLabel}
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-colors hover:ring-4 hover:ring-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cath-red-800/40"
      >
        <img
          src={current.flag}
          alt=""
          className="pointer-events-none block h-full w-full object-cover"
          draggable={false}
        />
      </MotionButton>

      <AnimatePresence>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] max-w-[min(280px,calc(100vw-2rem))]">
            <FluentAnimation
              direction="down"
              exit
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
            >
              <div className="p-2 flex flex-col gap-1" role="listbox" aria-label="Language">
                {LANGUAGES.map(({ key, label, flag, disabled, soonLabel }) => {
                  const isActive = language === key

                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      disabled={disabled}
                      onClick={() => !disabled && handleLanguageSelect(key)}
                      className={`relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${disabled
                        ? "cursor-not-allowed text-gray-400"
                        : isActive
                          ? "text-cath-red-800 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="lang-active-indicator"
                          className="absolute inset-0 rounded-xl bg-gray-500/5 pointer-events-none"
                        />
                      )}
                      <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-100">
                        <img
                          src={flag}
                          alt=""
                          className={`block h-full w-full object-cover ${disabled ? "grayscale opacity-50" : ""
                            }`}
                          draggable={false}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px]">
                        {label}
                      </span>
                      {disabled ? (
                        <span className="shrink-0 ml-auto rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {soonLabel || t.header?.soon || "Soon"}
                        </span>
                      ) : isActive ? (
                        <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-cath-red-800">
                          <div className="h-2 w-2 rounded-full bg-cath-red-800" />
                        </div>
                      ) : (
                        <div className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[2px] border-gray-200" />
                      )}
                    </button>
                  )
                })}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
