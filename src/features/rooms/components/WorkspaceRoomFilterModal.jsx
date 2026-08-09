import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, SlidersHorizontal } from "lucide-react"
import { TOPICS, LEVELS } from "../config/constants"

const WorkspaceRoomFilterModal = ({
  open,
  onClose,
  selectedLevels = [],
  selectedTopics = [],
  onApply,
}) => {
  const { t } = useLanguage()

  const [localLevels, setLocalLevels] = useState(selectedLevels)
  const [localTopics, setLocalTopics] = useState(selectedTopics)

  useEffect(() => {
    if (open) {
      setLocalLevels(selectedLevels)
      setLocalTopics(selectedTopics)
    }
  }, [open, selectedLevels, selectedTopics])

  const toggleLevel = (levelVal) => {
    setLocalLevels((prev) =>
      prev.includes(levelVal)
        ? prev.filter((l) => l !== levelVal)
        : [...prev, levelVal]
    )
  }

  const toggleTopic = (topicVal) => {
    setLocalTopics((prev) =>
      prev.includes(topicVal)
        ? prev.filter((tp) => tp !== topicVal)
        : [...prev, topicVal]
    )
  }

  const handleClear = () => {
    setLocalLevels([])
    setLocalTopics([])
  }

  const handleApply = () => {
    onApply(localLevels, localTopics)
    onClose()
  }

  const totalSelected = localLevels.length + localTopics.length

  if (!open) return null

  const levelOptions = LEVELS?.English || [
    { label: "Beginner", value: "Beginner" },
    { label: "Intermediate", value: "Intermediate" },
    { label: "Advanced", value: "Advanced" },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[560px] bg-white sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF0F2] text-cath-red-700">
              <SlidersHorizontal size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">
              {t.rooms?.filters?.title || "Bộ lọc phòng"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-app space-y-6">
          {/* Levels Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                {t.rooms?.filters?.levelsHeading || "Trình độ"}
              </h3>
              {localLevels.length > 0 && (
                <span className="text-xs font-bold text-cath-red-700 bg-[#FFF0F2] px-2 py-0.5 rounded-full">
                  {localLevels.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {levelOptions.map((level) => {
                const isSelected = localLevels.includes(level.value)
                return (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => toggleLevel(level.value)}
                    className={`flex items-center justify-center px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
                      isSelected
                        ? "border-cath-red-700 bg-[#FFF0F2] text-cath-red-700 ring-1 ring-cath-red-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-cath-red-700 hover:text-cath-red-700"
                    }`}
                  >
                    {level.label}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Topics Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-gray-900 tracking-tight">
                {t.rooms?.filters?.topicsHeading || "Chủ đề"}
              </h3>
              {localTopics.length > 0 && (
                <span className="text-xs font-bold text-cath-red-700 bg-[#FFF0F2] px-2 py-0.5 rounded-full">
                  {localTopics.length}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TOPICS.map((topic) => {
                const isSelected = localTopics.includes(topic)
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center justify-center px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
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

        {/* Footer */}
        <div className="flex gap-3 items-center justify-between p-4 sm:p-5 border-t border-gray-100 bg-gray-50/80 shrink-0">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-[14px] font-bold text-gray-600 hover:text-cath-red-700 hover:bg-[#FFF0F2] rounded-xl transition-all"
          >
            {t.rooms?.filters?.clear || "Xóa tất cả"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-cath-red-700 hover:bg-cath-red-800 text-white text-[14px] font-bold rounded-xl shadow-md shadow-cath-red-700/10 transition-all"
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

export default WorkspaceRoomFilterModal
