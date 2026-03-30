import React, { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import { useLanguage } from "@/shared/context/LanguageContext"
import colors from "@/shared/utils/colors"

const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt (Quốc Ngữ)" },
  // { key: "viNom", label: "Tiếng Việt (Nôm)", disabled: true },
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
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

  const getDisplayLabel = () => {
    return (
      t.header?.languages?.[language] || t.header?.languages?.en || "English"
    )
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div
        onClick={handleToggle}
        className="hover:bg-[#E5E5E5] rounded-full h-10 flex items-center px-4 cursor-pointer"
      >
        <div className="flex items-center gap-3 text-sm font-bold text-[#FFB400] justify-between w-full">
          <span className="truncate">{getDisplayLabel()}</span>

          <ChevronDown
            size={20}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <div className="absolute top-full right-0 mt-2 min-w-[200px] max-w-[280px] z-50">
            <FluentAnimation
              direction="down"
              exit
              className="rounded-lg shadow-lg bg-white overflow-hidden"
            >
              <div className="flex flex-col whitespace-nowrap">
                {LANGUAGES.map(({ key, label, disabled }) => {
                  const isActive = language === key

                  return (
                    <button
                      key={key}
                      disabled={disabled}
                      onClick={() => !disabled && handleLanguageSelect(key)}
                      className={`w-full text-left px-4 h-10 text-sm transition-colors
                        ${
                          disabled
                            ? "text-[#7A7574] cursor-default"
                            : "hover:bg-[#E5E5E5]"
                        }`}
                      style={{
                        backgroundColor: isActive ? "#E5E5E5" : undefined,
                      }}
                    >
                      {label}
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
