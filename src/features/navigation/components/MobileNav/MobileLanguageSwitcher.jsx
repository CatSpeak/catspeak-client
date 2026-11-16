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
            className={`h-14 flex items-center gap-4 px-4 w-full transition-colors cursor-pointer text-gray-900 dark:text-white ${
              isSelected
                ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] font-medium"
                : "hover:bg-neutral-100 dark:hover:bg-[#272727]"
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-xs border border-border dark:border-[#3F3F3F]">
              <img
                src={option.flag}
                alt={label}
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <span className="text-base flex-1 text-left text-gray-900 dark:text-neutral-200">
              {label}
            </span>

            {/* Radio Button */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-700 dark:border-red-400 ml-auto">
              {isSelected && (
                <div className="h-3 w-3 rounded-full bg-cath-red-700 dark:bg-red-400" />
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
              <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border dark:border-[#3F3F3F]">
                <img
                  src={currentOption.flag}
                  alt={currentOption.label}
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </span>
            )}
            <ChevronRight className="shrink-0 text-gray-400 dark:text-neutral-500" />
          </div>
        }
        className="transition-all duration-200 w-full"
        contentClassName="transition-all duration-200 px-4 hover:bg-neutral-100 dark:hover:bg-[#272727]"
        title={t.header?.language || "Ngôn ngữ"}
      >
        <span className="text-base font-normal text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate text-gray-900 dark:text-neutral-200">
          {t.header?.language || "Ngôn ngữ"}
        </span>
      </ListItem>

      {/* Standalone fallback if not controlled by parent drawer */}
      {!isControlled && (
        <div
          className={`fixed inset-0 z-50 bg-white dark:bg-[#0F0F0F] flex flex-col transition-transform duration-300 ${
            internalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center px-3 shrink-0">
            <button
              type="button"
              onClick={() => setInternalOpen(false)}
              className="relative flex items-center justify-center w-full px-1 h-12 text-gray-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-neutral-200 dark:active:bg-[#333333] rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft
                size={20}
                strokeWidth={1.5}
                className="absolute left-1 text-gray-700 dark:text-neutral-300"
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
