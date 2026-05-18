import React, { useState, useRef, useEffect } from "react"
import { Check } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-colors hover:bg-[#FFB400]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB400]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
              className="overflow-hidden rounded-2xl border border-[#F0E4C4] bg-white/95 shadow-lg backdrop-blur-md"
            >
              <div className="p-1.5" role="listbox" aria-label="Language">
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
                      className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${disabled
                        ? "cursor-not-allowed text-lighttextGray"
                        : isActive
                          ? "bg-[#FFF4D6] text-[#9A7200] font-semibold"
                          : "text-headingColor hover:bg-[#FFFAED] hover:text-[#B8860B]"
                        }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                        <img
                          src={flag}
                          alt=""
                          className={`block h-full w-full object-cover ${disabled ? "grayscale opacity-50" : ""
                            }`}
                          draggable={false}
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {label}
                      </span>
                      {disabled ? (
                        <span className="shrink-0 rounded-full border border-[#E8D9B8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#8A7A60]">
                          {soonLabel || t.header?.soon || "Soon"}
                        </span>
                      ) : isActive ? (
                        <Check
                          className="h-4 w-4 shrink-0 text-[#FFB400]"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      ) : null}
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
