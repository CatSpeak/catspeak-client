import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, SlidersHorizontal } from "lucide-react"

const ROOM_TYPES = ["All", "Temporary", "Custom"]
const VISIBILITIES = ["All", "Public", "Private"]
const ACTIVITIES = ["All", "InUse", "Empty"]
const LANGUAGES = ["All", "English", "Chinese", "Japanese", "Vietnamese"]

const WorkspaceRoomFilterModal = ({
  open,
  onClose,
  activeTab = "created",
  selectedRoomType = "All",
  selectedVisibility = "All",
  selectedActivity = "All",
  selectedLanguage = "All",
  onApply,
  // legacy props for backward compat
  selectedLevels = [],
  selectedTopics = [],
}) => {
  const { t } = useLanguage()

  const [localRoomType, setLocalRoomType] = useState(selectedRoomType)
  const [localVisibility, setLocalVisibility] = useState(selectedVisibility)
  const [localActivity, setLocalActivity] = useState(selectedActivity)
  const [localLanguage, setLocalLanguage] = useState(selectedLanguage)

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setLocalRoomType(selectedRoomType || "All")
        setLocalVisibility(selectedVisibility || "All")
        setLocalActivity(selectedActivity || "All")
        setLocalLanguage(selectedLanguage || "All")
      })
    }
  }, [open, selectedRoomType, selectedVisibility, selectedActivity, selectedLanguage])

  const handleClear = () => {
    setLocalRoomType("All")
    setLocalVisibility("All")
    setLocalActivity("All")
    setLocalLanguage("All")
  }

  const handleApply = () => {
    // Support both new and legacy callers: if caller expects (levels, topics) it will still work via legacy check,
    // but we always send object for new code.
    if (typeof onApply === "function") {
      try {
        // Try new signature
        onApply({
          roomType: localRoomType,
          visibility: localVisibility,
          activity: localActivity,
          language: localLanguage,
        })
      } catch {
        // fallback legacy
        onApply([], [])
      }
    }
    onClose()
  }

  const totalSelected =
    (localRoomType !== "All" ? 1 : 0) +
    (activeTab !== "bookmark" && localVisibility !== "All" ? 1 : 0) +
    (localActivity !== "All" ? 1 : 0) +
    (localLanguage !== "All" ? 1 : 0)

  if (!open) return null

  const isBookmark = activeTab === "bookmark"

  const renderOptionGroup = (title, options, value, setter, labelMap) => (
    <section>
      <h3 className="text-[15px] font-bold text-gray-900 tracking-tight mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt
          const label = labelMap?.[opt] || opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setter(opt)}
              className={`flex items-center justify-center px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all border ${
                isSelected
                  ? "border-cath-red-700 bg-[#FFF0F2] text-cath-red-700 ring-1 ring-cath-red-700"
                  : "bg-white border-border text-gray-600 hover:border-cath-red-700 hover:text-cath-red-700"
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </section>
  )

  const roomTypeLabels = {
    All: t.rooms?.filters?.roomTypes?.All || "Tất cả",
    Temporary: t.rooms?.filters?.roomTypes?.Temporary || "Temporary",
    Custom: t.rooms?.filters?.roomTypes?.Custom || "Custom",
  }
  const visibilityLabels = {
    All: t.rooms?.filters?.visibilities?.All || "Tất cả",
    Public: t.rooms?.filters?.visibilities?.Public || "Public",
    Private: t.rooms?.filters?.visibilities?.Private || "Private",
  }
  const activityLabels = {
    All: t.rooms?.filters?.activities?.All || "Tất cả",
    InUse: t.rooms?.filters?.activities?.InUse || "In Use",
    Empty: t.rooms?.filters?.activities?.Empty || "Empty",
  }
  const languageLabels = {
    All: t.rooms?.filters?.languages?.All || "Tất cả",
    English: "English",
    Chinese: "Chinese",
    Japanese: "Japanese",
    Vietnamese: "Vietnamese",
  }

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 md:p-6">
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
      <div className="relative w-full h-full max-h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[560px] bg-white sm:rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-border bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF0F2] text-cath-red-700">
              <SlidersHorizontal size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">
              {t.rooms?.filters?.title || "Bộ lọc phòng"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-app space-y-6">
          {!isBookmark && renderOptionGroup(t.rooms?.filters?.roomTypeLabel || "Loại phòng", ROOM_TYPES, localRoomType, setLocalRoomType, roomTypeLabels)}
          {!isBookmark && renderOptionGroup(t.rooms?.filters?.visibilityLabel || "Hiển thị", VISIBILITIES, localVisibility, setLocalVisibility, visibilityLabels)}
          {renderOptionGroup(t.rooms?.filters?.activityLabel || "Hoạt động", ACTIVITIES, localActivity, setLocalActivity, activityLabels)}
          {renderOptionGroup(t.rooms?.filters?.languageLabel || "Ngôn ngữ", LANGUAGES, localLanguage, setLocalLanguage, languageLabels)}
        </div>

        <div className="flex gap-3 items-center justify-between p-4 sm:p-5 border-t border-border bg-gray-50/80 shrink-0">
          <button type="button" onClick={handleClear} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-[14px] font-bold text-gray-600 hover:text-cath-red-700 hover:bg-[#FFF0F2] rounded-xl transition-all">
            {t.rooms?.filters?.clear || "Xóa tất cả"}
          </button>
          <button type="button" onClick={handleApply} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-cath-red-700 hover:bg-cath-red-800 text-white text-[14px] font-bold rounded-xl shadow-md shadow-cath-red-700/10 transition-all">
            <span>{t.rooms?.filters?.apply || "Áp dụng"}</span>
            {totalSelected > 0 && (
              <span className="flex items-center justify-center bg-white/20 px-2 py-0.5 rounded-md text-[12px]">{totalSelected}</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default WorkspaceRoomFilterModal
