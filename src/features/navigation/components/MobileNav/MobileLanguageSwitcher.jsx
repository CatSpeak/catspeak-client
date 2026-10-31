import React, { useState, useMemo } from "react"
import { Globe, ChevronRight, ChevronLeft } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, UK, Japan } from "@/shared/assets/icons/flags"
import ListItem from "@/shared/components/ui/ListItem"

export const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: UK },
  { key: "ja", label: "日本語", flag: Japan },
]

export const MobileLanguageContent = ({ onSelect }) => {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageSelect = (key) => {
    setLanguage(key)
    onSelect?.()
  }

  return (
    <div className="flex flex-col w-full">
      {LANGUAGES.map((option) => {
        const isSelected = option.key === language
        const label = t.header?.languages?.[option.key] || option.label

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => handleLanguageSelect(option.key)}
            className={`h-14 flex items-center gap-4 px-4 w-full transition-colors cursor-pointer ${
              isSelected
                ? "bg-itemActive hover:bg-itemActiveHover"
                : "hover:bg-itemHover"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs border border-border">
              <img
                src={option.flag}
                alt={label}
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <span className="text-base flex-1 text-left">
              {label}
            </span>

            {/* Radio Button */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-800 ml-auto">
              {isSelected && (
                <div className="h-3 w-3 rounded-full bg-cath-red-800" />
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

const MobileLanguageSwitcher = ({ onOpen }) => {
  const { language, t } = useLanguage()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = typeof onOpen === "function"

  const currentOption = useMemo(
    () => LANGUAGES.find((l) => l.key === language),
    [language],
  )

  const handleOpen = () => {
    if (isControlled) {
      onOpen()
    } else {
      setInternalOpen(true)
    }
  }

  return (
    <div className="relative w-full">
      <ListItem
        onClick={handleOpen}
        leftContent={<Globe size={24} strokeWidth={1.5} className="shrink-0" />}
        rightContent={
          <div className="flex items-center gap-2">
            {currentOption && (
              <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border">
                <img
                  src={currentOption.flag}
                  alt={currentOption.label}
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </span>
            )}
            <ChevronRight className="shrink-0 text-gray-500" />
          </div>
        }
        className="transition-all duration-200 w-full"
        contentClassName="transition-all duration-200 px-4 hover:bg-itemHover"
        title={t.header?.language || "Ngôn ngữ"}
      >
        <span className="text-base font-normal text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate">
          {t.header?.language || "Ngôn ngữ"}
        </span>
      </ListItem>

      {/* Standalone fallback if not controlled by parent drawer */}
      {!isControlled && (
        <div
          className={`fixed inset-0 z-50 bg-white flex flex-col transition-transform duration-300 ${
            internalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center px-3 shrink-0">
            <button
              type="button"
              onClick={() => setInternalOpen(false)}
              className="relative flex items-center justify-center w-full px-1 h-12 hover:bg-itemHover active:bg-itemActiveHover rounded-lg transition-colors"
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.5}
                className="absolute left-1"
              />
              <span className="font-semibold truncate max-w-[80%]">
                {t.header?.language || "Ngôn ngữ"}
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <MobileLanguageContent onSelect={() => setInternalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

MobileLanguageSwitcher.Content = MobileLanguageContent

export default MobileLanguageSwitcher
