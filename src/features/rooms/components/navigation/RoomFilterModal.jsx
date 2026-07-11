import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { X, SlidersHorizontal } from "lucide-react"
import { TOPICS, LEVELS } from "../../config/constants"

const RoomFilterModal = ({ open, onClose }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [localTopics, setLocalTopics] = useState([])
  const [localLevels, setLocalLevels] = useState([])

  // Sync state from URL when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTopics(searchParams.getAll("topics"))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalLevels(searchParams.getAll("requiredLevels"))
    }
  }, [open, searchParams])

  // Map levels based on current language
  const langMap = { en: "English", zh: "Chinese", vi: "Vietnamese" }
  const currentLanguage = lang ? langMap[lang] : "English"
  
  const baseLevels = LEVELS[currentLanguage] || LEVELS.English
  const additionalLevels = [
    { label: t.rooms?.filters?.levels?.beginner || "Beginner", value: "Beginner" },
    { label: t.rooms?.filters?.levels?.intermediate || "Intermediate", value: "Intermediate" },
    { label: t.rooms?.filters?.levels?.advanced || "Advanced", value: "Advanced" },
  ]
  const currentLevels = [
    ...baseLevels,
    ...additionalLevels.filter((level) => !baseLevels.some((bl) => bl.value === level.value)),
  ]

  const toggleTopic = (topic) => {
    setLocalTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])
  }

  const toggleLevel = (level) => {
    setLocalLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])
  }

  const handleApply = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("topics")
    newParams.delete("requiredLevels")
    
    localTopics.forEach(t => newParams.append("topics", t))
    localLevels.forEach(l => newParams.append("requiredLevels", l))
    
    if (localTopics.length > 0 || localLevels.length > 0) {
      newParams.set("page", "1")
    }
    
    const communityPath = `/${lang || "en"}/community`
    if (!location.pathname.startsWith(communityPath)) {
      navigate(`${communityPath}?${newParams.toString()}`)
    } else {
      setSearchParams(newParams, { preventScrollReset: true })
    }
    
    onClose()
  }

  const handleClear = () => {
    setLocalTopics([])
    setLocalLevels([])
  }

  const totalSelected = localTopics.length + localLevels.length

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full max-h-full rounded-none sm:h-auto sm:max-h-[85vh] sm:max-w-[640px] bg-white sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF0F2] text-cath-red-700">
              <SlidersHorizontal size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">{t.rooms?.filters?.title || "Bộ lọc"}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-app space-y-8">
          
          {/* Levels Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                {t.rooms?.filters?.levelsHeading || "Trình độ"}
              </h3>
              {localLevels.length > 0 && (
                <span className="text-xs font-bold text-cath-red-700 bg-[#FFF0F2] px-2 py-0.5 rounded-full">
                  {localLevels.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentLevels.map(level => {
                const isSelected = localLevels.includes(level.value)
                return (
                  <button
                    key={level.value}
                    onClick={() => toggleLevel(level.value)}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                      isSelected 
                        ? "border-cath-red-700 bg-[#FFF0F2] text-cath-red-700 ring-1 ring-cath-red-700" 
                        : "bg-white border-gray-200 text-gray-600 hover:border-cath-red-700 hover:text-cath-red-700"
                    }`}
                  >
                    {level.labelKey ? t.rooms?.filters?.levels?.[level.labelKey] || level.label : level.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Topics Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                {t.rooms?.filters?.topicsHeading || "Chủ đề"}
              </h3>
              {localTopics.length > 0 && (
                <span className="text-xs font-bold text-cath-red-700 bg-[#FFF0F2] px-2 py-0.5 rounded-full">
                  {localTopics.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TOPICS.map(topic => {
                const isSelected = localTopics.includes(topic)
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all duration-200 border ${
                      isSelected 
                        ? "border-cath-red-700 bg-[#FFF0F2] text-cath-red-700 ring-1 ring-cath-red-700" 
                        : "bg-white border-gray-200 text-gray-600 hover:border-cath-red-700 hover:text-cath-red-700"
                    }`}
                  >
                    {t.rooms?.filters?.topics?.[topic.toLowerCase()] || topic}
                  </button>
                )
              })}
            </div>
          </section>

        </div>

        <div className="flex gap-3 sm:gap-0 items-center sm:justify-between p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 shrink-0 mt-auto">
          <button 
            onClick={handleClear}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3.5 sm:py-2.5 text-[15px] sm:text-[14px] font-bold text-gray-700 bg-gray-200/70 sm:bg-transparent sm:text-gray-500 hover:text-cath-red-700 hover:bg-[#FFF0F2] rounded-xl transition-all"
          >
            {t.rooms?.filters?.clear || "Xóa tất cả"}
          </button>
          <button 
            onClick={handleApply}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 sm:py-3 bg-cath-red-700 hover:bg-cath-red-800 text-white text-[15px] font-bold rounded-xl shadow-md shadow-cath-red-700/10 transition-all hover:-translate-y-0.5"
          >
            <span>{t.rooms?.filters?.apply || "Áp dụng"}</span>
            {totalSelected > 0 && (
              <span className="flex items-center justify-center bg-white/20 px-2 py-0.5 rounded-md text-[12px]">
                {totalSelected}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default RoomFilterModal
