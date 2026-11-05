import React, { useState, useRef, useEffect, useCallback } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useTheme } from "@/shared/context/ThemeContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import useClickOutside from "@/shared/hooks/useClickOutside"
import IconButton from "./buttons/IconButton"
import MenuItem, { MenuList } from "./MenuItem"

const THEME_OPTIONS = [
  {
    key: "light",
    icon: Sun,
    iconColor: "text-amber-500",
    label: {
      vi: "Sáng",
      en: "Light",
      zh: "浅色",
      ja: "ライト",
    },
  },
  {
    key: "dark",
    icon: Moon,
    iconColor: "text-amber-400 dark:text-amber-400",
    label: {
      vi: "Tối",
      en: "Dark",
      zh: "深色",
      ja: "ダーク",
    },
  },
  {
    key: "system",
    icon: Monitor,
    iconColor: "text-slate-500 dark:text-neutral-400",
    label: {
      vi: "Hệ thống",
      en: "System",
      zh: "跟随系统",
      ja: "システム",
    },
  },
]

const ThemeToggle = ({
  className = "",
  align = "auto",
  variant = "dropdown",
  cycle = false,
}) => {
  const { theme, setTheme, toggleTheme } = useTheme()
  const { language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [dropdownAlign, setDropdownAlign] = useState(
    align === "auto" ? "right" : align,
  )
  const containerRef = useRef(null)

  useClickOutside(containerRef, () => setOpen(false))

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const updateAlignment = useCallback(() => {
    if (align !== "auto") {
      setDropdownAlign(align)
      return
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const screenWidth = window.innerWidth
      const dropdownWidth = 170

      const wouldOverflowLeft = rect.right - dropdownWidth < 16
      const wouldOverflowRight = rect.left + dropdownWidth > screenWidth - 16

      if (wouldOverflowLeft && !wouldOverflowRight) {
        setDropdownAlign("left")
      } else if (wouldOverflowRight && !wouldOverflowLeft) {
        setDropdownAlign("right")
      } else {
        setDropdownAlign("right")
      }
    }
  }, [align])

  const handleClick = () => {
    if (cycle || variant === "cycle") {
      toggleTheme()
      return
    }
    if (!open) {
      updateAlignment()
    }
    setOpen((prev) => !prev)
  }

  const handleSelect = (key) => {
    setTheme(key)
    setOpen(false)
  }

  const currentOption =
    THEME_OPTIONS.find((opt) => opt.key === theme) || THEME_OPTIONS[2]
  const currentLabel =
    currentOption.label[language] || currentOption.label.en || "Theme"

  const alignClass =
    dropdownAlign === "left"
      ? "left-0 right-auto"
      : dropdownAlign === "center"
        ? "left-1/2 -translate-x-1/2 right-auto"
        : "right-0 left-auto"

  // Render trigger icon based on current theme mode
  const renderTriggerIcon = () => {
    if (theme === "system") {
      return (
        <Monitor className="w-5 h-5 text-slate-600 dark:text-[#AAAAAA] transition-transform duration-200" />
      )
    }
    if (theme === "dark") {
      return (
        <Moon className="w-5 h-5 text-amber-400 transition-transform duration-200" />
      )
    }
    return (
      <Sun className="w-5 h-5 text-amber-500 transition-transform duration-200" />
    )
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      ref={containerRef}
    >
      <IconButton
        type="button"
        variant="ghost"
        onClick={handleClick}
        title={`Giao diện: ${currentLabel}`}
        aria-label={`Giao diện: ${currentLabel}`}
        aria-haspopup={cycle || variant === "cycle" ? undefined : "listbox"}
        aria-expanded={cycle || variant === "cycle" ? undefined : open}
        className="text-gray-600 dark:text-[#AAAAAA] hover:text-gray-900 dark:hover:text-white"
      >
        {renderTriggerIcon()}
      </IconButton>

      <AnimatePresence>
        {open && !(cycle || variant === "cycle") && (
          <div
            className={`absolute top-full z-50 mt-2 min-w-[170px] w-max max-w-[calc(100vw-2rem)] ${alignClass}`}
          >
            <FluentAnimation direction="down" exit>
              <MenuList className="py-1 min-w-[170px] shadow-xl">
                {THEME_OPTIONS.map(({ key, icon: Icon, iconColor, label }) => {
                  const isSelected = theme === key
                  const itemLabel = label[language] || label.en

                  return (
                    <MenuItem
                      key={key}
                      label={itemLabel}
                      icon={<Icon size={20} className={iconColor} />}
                      isSelected={isSelected}
                      onClick={() => handleSelect(key)}
                    />
                  )
                })}
              </MenuList>
            </FluentAnimation>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ThemeToggle
