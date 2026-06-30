import React, { useState, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"
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
    t.header?.languages?.[language] || t.header?.languages?.en || current.label

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={dropdownRef}
    >
      <motion.button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
        title={displayLabel}
        onClick={handleToggle}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-0 bg-transparent p-0 transition-all hover:bg-[#FFB400]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB400]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <img
          src={current.flag}
          alt=""
          className="pointer-events-none block h-full w-full object-cover"
          draggable={false}
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] max-w-[min(280px,calc(100vw-2rem))]">
            <FluentAnimation
              direction="down"
              exit
              className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-lg"
            >
              <div
                className="p-1 flex flex-col gap-1"
                role="listbox"
                aria-label="Language"
              >
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
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors ${
                        disabled
                          ? "cursor-not-allowed"
                          : isActive
                            ? "bg-[#F6F6F6] text-[#990011]"
                            : "hover:bg-[#F6F6F6]"
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full">
                        <img
                          src={flag}
                          alt=""
                          className={`block h-full w-full object-cover ${
                            disabled ? "grayscale opacity-50" : ""
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
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-[#990011]">
                          <div className="h-2 w-2 rounded-full bg-[#990011]" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 shrink-0 rounded-full border-2 border-[#D9D9D9]" />
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
