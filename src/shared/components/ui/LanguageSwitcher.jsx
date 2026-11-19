import React, { useState, useRef, useEffect, useCallback } from "react"
import { AnimatePresence, motion as Motion } from "framer-motion"
import { dropdownVariants } from "@/shared/constants/motion"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import MenuItem, { MenuList } from "@/shared/components/ui/MenuItem"
import Radio from "@/shared/components/ui/inputs/Radio"

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
      const dropdownWidth = 220

      // Check if expanding to the left (right-0) would overflow the viewport's left edge
      const wouldOverflowLeft = rect.right - dropdownWidth < 16

      if (wouldOverflowLeft) {
        setDropdownAlign("left")
      } else {
        setDropdownAlign("right")
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
    if (!open) return
    const handleResize = () => updateAlignment()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
      ? "left-0 right-auto origin-top-left"
      : "right-0 left-auto origin-top-right"

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
          <Motion.div
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`absolute top-full z-50 mt-2 min-w-[200px] w-max max-w-[calc(100vw-2rem)] ${alignClass}`}
          >
            <MenuList className="py-1 min-w-[200px] shadow-xl">
              {LANGUAGES.map(({ key, label, flag, disabled, soonLabel }, index) => {
                const isSelected = language === key
                const itemLabel = t.header?.languages?.[key] || label

                return (
                  <MenuItem
                    key={key}
                    icon={
                      <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
                        <img
                          src={flag}
                          alt={itemLabel}
                          className={`block h-full w-full object-cover ${
                            disabled ? "grayscale opacity-50" : ""
                          }`}
                          draggable={false}
                        />
                      </span>
                    }
                    label={itemLabel}
                    isSelected={isSelected}
                    disabled={disabled}
                    rightContent={
                      disabled ? (
                        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          {soonLabel || t.header?.soon || "Soon"}
                        </span>
                      ) : (
                        <Radio checked={isSelected} />
                      )
                    }
                    onClick={() => handleLanguageSelect(key)}
                    isFirst={index === 0}
                    isLast={index === LANGUAGES.length - 1}
                  />
                )
              })}
            </MenuList>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
