import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

const WorkspaceRoomSortModal = ({
  open,
  onClose,
  selectedSortField = "createdAt",
  selectedSortOrder = "desc",
  onApply,
}) => {
  const { t } = useLanguage()

  const [localField, setLocalField] = useState(selectedSortField)
  const [localOrder, setLocalOrder] = useState(selectedSortOrder)

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setLocalField(selectedSortField || "createdAt")
        setLocalOrder(selectedSortOrder || "desc")
      })
    }
  }, [open, selectedSortField, selectedSortOrder])

  const handleReset = () => {
    setLocalField("createdAt")
    setLocalOrder("desc")
  }

  const handleApply = () => {
    onApply(localField, localOrder)
    onClose()
  }

  if (!open) return null

  const fieldOptions = [
    { value: "name", label: t.rooms?.sortOptions?.name || "Tên phòng" },
    { value: "createdAt", label: t.rooms?.sortOptions?.createdAt || "Ngày tạo" },
    { value: "currentParticipantCount", label: t.rooms?.sortOptions?.participants || "Số người tham gia" },
    { value: "duration", label: t.rooms?.sortOptions?.duration || "Thời lượng" },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full h-full max-h-full sm:h-auto sm:max-h-[85vh] sm:max-w-[480px] bg-white dark:bg-[#1A1A1A] sm:rounded-2xl shadow-2xl border border-border dark:border-[#3F3F3F] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF0F2] dark:bg-red-950/40 text-cath-red-700 dark:text-red-400">
              <ArrowUpDown size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">
              {t.rooms?.sortTitle || "Sắp xếp danh sách"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272727] hover:text-gray-700 dark:hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-app space-y-6">
          {/* Column Attribute Dropdown */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-gray-900 dark:text-white block">
              {t.rooms?.sortFieldLabel || "Thuộc tính sắp xếp"}
            </label>
            <div className="relative">
              <select
                value={localField}
                onChange={(e) => setLocalField(e.target.value)}
                className="w-full h-12 pl-4 pr-10 rounded-xl border border-border dark:border-[#3F3F3F] bg-white dark:bg-[#272727] text-gray-800 dark:text-white font-medium appearance-none focus:outline-none focus:border-cath-red-700 dark:focus:border-red-400 focus:ring-1 focus:ring-cath-red-700 transition-colors text-sm cursor-pointer"
              >
                {fieldOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-[#AAAAAA]">
                <ArrowUpDown size={16} />
              </div>
            </div>
          </div>

          {/* Sort Order Choice */}
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-gray-900 dark:text-white block">
              {t.rooms?.sortOrderLabel || "Thứ tự sắp xếp"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalOrder("asc")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border transition-all ${
                  localOrder === "asc"
                    ? "border-cath-red-700 dark:border-red-500 bg-[#FFF0F2] dark:bg-red-950/30 text-cath-red-700 dark:text-red-400 ring-1 ring-cath-red-700 dark:ring-red-500"
                    : "bg-white dark:bg-[#272727] border-border dark:border-[#3F3F3F] text-gray-600 dark:text-neutral-300 hover:border-cath-red-700 dark:hover:border-red-400 hover:text-cath-red-700 dark:hover:text-red-400"
                }`}
              >
                <ArrowUp size={16} />
                <span>{t.rooms?.sortAsc || "Tăng dần"}</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalOrder("desc")}
                className={`flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border transition-all ${
                  localOrder === "desc"
                    ? "border-cath-red-700 dark:border-red-500 bg-[#FFF0F2] dark:bg-red-950/30 text-cath-red-700 dark:text-red-400 ring-1 ring-cath-red-700 dark:ring-red-500"
                    : "bg-white dark:bg-[#272727] border-border dark:border-[#3F3F3F] text-gray-600 dark:text-neutral-300 hover:border-cath-red-700 dark:hover:border-red-400 hover:text-cath-red-700 dark:hover:text-red-400"
                }`}
              >
                <ArrowDown size={16} />
                <span>{t.rooms?.sortDesc || "Giảm dần"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 items-center justify-between p-4 sm:p-5 border-t border-border dark:border-[#3F3F3F] bg-gray-50/80 dark:bg-[#141414] shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 text-[14px] font-bold text-gray-600 dark:text-neutral-400 hover:text-cath-red-700 dark:hover:text-red-400 hover:bg-[#FFF0F2] dark:hover:bg-red-950/20 rounded-xl transition-all"
          >
            {t.rooms?.sortReset || "Đặt lại"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-cath-red-700 hover:bg-cath-red-800 text-white text-[14px] font-bold rounded-xl shadow-md shadow-cath-red-700/10 transition-all"
          >
            {t.rooms?.filters?.apply || "Áp dụng"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default WorkspaceRoomSortModal
