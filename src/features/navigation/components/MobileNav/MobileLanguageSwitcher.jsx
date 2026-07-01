import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import { VietNam, China, USA } from "@/shared/assets/icons/flags"
import useClickOutside from "@/shared/hooks/useClickOutside"

const LANGUAGES = [
  { key: "vi", label: "Tiếng Việt", flag: VietNam },
  { key: "zh", label: "中文", flag: China },
  { key: "en", label: "English", flag: USA },
]

const MobileLanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useClickOutside(containerRef, () => setOpen(false))

  const handleLanguageSelect = (key) => {
    setLanguage(key)
    setOpen(false)
  }

  const current = LANGUAGES.find((l) => l.key === language) || LANGUAGES[0]

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <div 
        className="relative flex items-center justify-between h-12 rounded-xl transition-colors group px-4 text-gray-800 hover:bg-gray-100 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <Globe size={24} className="shrink-0 text-gray-800" />
          <span className="text-[16px]">{t.header?.language || "Ngôn ngữ"}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full p-0 transition-transform active:scale-95 border border-gray-200"
          >
            <img
              src={current.flag}
              alt={current.label}
              className="block h-full w-full object-cover"
              draggable={false}
            />
          </button>
        </div>
      </div>

      {/* Dropdown Menu (Popping Upwards) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 p-2"
          >
            <div className="flex flex-col gap-1">
              {LANGUAGES.map(({ key, label, flag }) => {
                const isActive = language === key
                return (
                  <button
                    key={key}
                    onClick={() => handleLanguageSelect(key)}
                    className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-colors ${
                      isActive ? "bg-gray-50/80" : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm">
                      <img
                        src={flag}
                        alt={label}
                        className="block h-full w-full object-cover"
                        draggable={false}
                      />
                    </span>
                    <span className={`text-[15px] flex-1 text-left ${isActive ? "text-cath-red-800 font-medium" : "text-gray-700"}`}>
                      {label}
                    </span>
                    
                    {/* Radio Button */}
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-cath-red-800 ml-auto">
                      {isActive && <div className="h-2.5 w-2.5 rounded-full bg-cath-red-800" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MobileLanguageSwitcher
