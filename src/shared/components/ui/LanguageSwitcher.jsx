import React, { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import LanguageMenuItem from "@/shared/components/Header/LanguageMenuItem"

/**
 * UI languages. Standard Vietnamese (`vi`) is fully enabled.
 * Nôm Vietnamese is not listed here — when you add it for development, use e.g.
 * `{ key: "viNom", label: "Tiếng Việt (Nôm)", flag: VietNam, disabled: true }`
 * and omit or comment that entry for production builds.
 */
const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: UK },
  { key: "ja", label: "日本語", flag: Japan },
]

const LanguageSwitcher = ({ className = "", align = "auto" }) => {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [dropdownAlign, setDropdownAlign] = useState(
    align === "auto" ? "right" : align,
  )
  const dropdownRef = useRef(null)

  useClickOutside(dropdownRef, () => setOpen(false))

  const updateAlignment = useCallback(() => {
    if (align !== "auto") {
      setDropdownAlign(align)
      return
    }
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const dropdownWidth = 220

      // Check if expanding to the left (right-0) would overflow the viewport's left edge
      const wouldOverflowLeft = rect.right - dropdownWidth < 16
      // Check if expanding to the right (left-0) would overflow the viewport's right edge
      const wouldOverflowRight = rect.left + dropdownWidth > screenWidth - 16

      if (wouldOverflowLeft && !wouldOverflowRight) {
        setDropdownAlign("left")
      } else if (wouldOverflowRight && !wouldOverflowLeft) {
        setDropdownAlign("right")
      } else {
        // If center fits or if on a narrow mobile viewport
        setDropdownAlign("center")
      }
    }
  }, [align])

  const handleToggle = () => {
    if (!open) {
      updateAlignment()
    }
    setOpen((prev) => !prev)
  }

  useEffect(() => {
    if (open) {
      updateAlignment()
      window.addEventListener("resize", updateAlignment)
      return () => window.removeEventListener("resize", updateAlignment)
    }
  }, [open, updateAlignment])

  const handleLanguageSelect = (lang) => {
    setLanguage(lang)
    setOpen(false)
  }

  const current = LANGUAGES.find((l) => l.key === language) || LANGUAGES[0]
  const displayLabel =
    t.header?.languages?.[language] || t.header?.languages?.en || current.label

  const alignClass =
    dropdownAlign === "left"
      ? "left-0 right-auto"
      : dropdownAlign === "center"
        ? "left-1/2 -translate-x-1/2 right-auto"
        : "right-0 left-auto"

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      ref={dropdownRef}
    >
      <IconButton
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={displayLabel}
        title={displayLabel}
        onClick={handleToggle}
        variant="ghost"
      >
        <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border shadow-xs">
          <img
            src={current.flag}
            alt=""
            className="pointer-events-none block h-full w-full object-cover rounded-full"
            draggable={false}
          />
        </span>
      </IconButton>

      <AnimatePresence>
        {open && (
          <div
            className={`absolute top-full z-50 mt-2 min-w-[220px] w-max max-w-[calc(100vw-2rem)] ${alignClass}`}
          >
            <FluentAnimation
              direction="down"
              exit
              className="overflow-hidden rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shadow-xl"
            >
              <div
                className="flex flex-col gap-1 p-1"
                role="listbox"
                aria-label="Language"
              >
                {LANGUAGES.map(({ key, label, flag, disabled, soonLabel }) => (
                  <LanguageMenuItem
                    key={key}
                    code={key}
                    label={t.header?.languages?.[key] || label}
                    flag={flag}
                    disabled={disabled}
                    soonLabel={soonLabel || t.header?.soon || "Soon"}
                    isActive={language === key}
                    onSelect={() => handleLanguageSelect(key)}
                    layoutId="lang-active-indicator"
                  />
                ))}
              </div>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
