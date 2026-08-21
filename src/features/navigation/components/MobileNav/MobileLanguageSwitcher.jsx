import React from "react"
import { Globe, ChevronDown } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, UK } from "@/shared/assets/icons/flags"
import Dropdown from "@/shared/components/ui/Dropdown"
import ListItem from "@/shared/components/ui/ListItem"

const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: UK },
]

const MobileLanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage()

  const handleLanguageSelect = (key) => {
    setLanguage(key)
  }

  const options = LANGUAGES.map((l) => ({ ...l, value: l.key }))

  return (
    <div className="relative w-full">
      <Dropdown
        options={options}
        value={language}
        onChange={handleLanguageSelect}
        dropdownClassName="!min-w-full w-full"
        trigger={(isOpen, selectedOption, toggle) => (
          <ListItem
            lines={1}
            onClick={toggle}
            leftContent={<Globe size={24} strokeWidth={1.5} className="shrink-0" />}
            rightContent={
              <ChevronDown
                size={24}
                strokeWidth={1.5}
                className={`shrink-0 transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            }
            className="rounded-xl transition-all duration-200 w-full"
            contentClassName={`rounded-xl transition-all duration-200 px-4 ${isOpen ? "bg-primaryBg" : "hover:bg-primaryBg"
              }`}
          >
            <span className="whitespace-nowrap transition-all duration-300 truncate min-w-[180px] flex-1 text-left font-normal text-base">
              {t.header?.language || "Ngôn ngữ"}
            </span>
          </ListItem>
        )}
        renderOption={(option, isSelected) => (
          <div
            className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors ${isSelected ? "bg-gray-50/80" : "hover:bg-gray-50"
              }`}
          >
            <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm">
              <img
                src={option.flag}
                alt={option.label}
                className="block h-full w-full object-cover"
                draggable={false}
              />
            </span>
            <span
              className={`text-[15px] flex-1 text-left ${isSelected ? "text-cath-red-800 font-medium" : "text-gray-700"
                }`}
            >
              {option.label}
            </span>

            {/* Radio Button */}
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-800 ml-auto">
              {isSelected && (
                <div className="h-2.5 w-2.5 rounded-full bg-cath-red-800" />
              )}
            </div>
          </div>
        )}
      />
    </div>
  )
}

export default MobileLanguageSwitcher

