import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { X, SlidersHorizontal, Sparkles, Activity, ChevronDown, Check } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

const ExploreCoursesFilterModal = ({
  open,
  onClose,
  initialEnrollmentStatus = "all",
  initialMinPrice = "",
  initialMaxPrice = "",
  onApply,
}) => {
  const { t } = useLanguage()
  const c = t.courses || {}
  const sc = c.student || {}

  const [localEnrollmentStatus, setLocalEnrollmentStatus] = useState(initialEnrollmentStatus)
  const [localMinPrice, setLocalMinPrice] = useState(initialMinPrice)
  const [localMaxPrice, setLocalMaxPrice] = useState(initialMaxPrice)

  useEffect(() => {
    if (open) {
      setLocalEnrollmentStatus(initialEnrollmentStatus)
      setLocalMinPrice(initialMinPrice)
      setLocalMaxPrice(initialMaxPrice)
    }
  }, [open, initialEnrollmentStatus, initialMinPrice, initialMaxPrice])

  if (!open) return null

  const enrollmentStatusOptions = [
    { value: "all", label: sc.enrollmentStatusAll || "Tất cả" },
    { value: "open", label: sc.enrollmentStatusOpen || "Đang mở đăng ký" },
    { value: "upcoming", label: sc.enrollmentStatusUpcoming || "Chưa mở đăng ký" },
    { value: "closed", label: sc.enrollmentStatusClosed || "Đã đóng đăng ký" },
  ]

  const selectedStatusObj = enrollmentStatusOptions.find((o) => o.value === localEnrollmentStatus) || enrollmentStatusOptions[0]

  const handlePricePreset = (minVal, maxVal) => {
    setLocalMinPrice(minVal)
    setLocalMaxPrice(maxVal)
  }

  const handleClear = () => {
    setLocalEnrollmentStatus("all")
    setLocalMinPrice("")
    setLocalMaxPrice("")
  }

  const handleApply = () => {
    onApply({
      enrollmentStatus: localEnrollmentStatus,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    })
    onClose()
  }

  const hasActiveFilters =
    localEnrollmentStatus !== "all"
    || localMinPrice !== ""
    || localMaxPrice !== ""

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[540px] max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/80 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FFF0F2] text-[#b20a1c]">
              <SlidersHorizontal size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950 tracking-tight">
                {sc.filterModalTitle || sc.filter || "Bộ lọc"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Enrollment Status Filter */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-[#b20a1c]" />
              <label className="text-sm font-bold text-slate-900">
                {sc.enrollmentStatusLabel || "Trạng thái lớp học / khóa học"}
              </label>
            </div>
            <Dropdown
              options={enrollmentStatusOptions}
              value={localEnrollmentStatus}
              onChange={(val) => setLocalEnrollmentStatus(val)}
              className="w-full"
              dropdownClassName="w-full min-w-full shadow-xl border border-border/80 rounded-2xl p-1.5 z-50 bg-white"
              activeColor="#b20a1c"
              renderOption={(option, isSelected) => (
                <div
                  className={`w-full py-2.5 px-3 text-xs rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-rose-50 text-[#b20a1c] font-semibold"
                      : "text-slate-700 hover:bg-slate-50 font-normal"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={14} className="text-[#b20a1c]" />}
                </div>
              )}
              trigger={(isOpen, _, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  className={`w-full h-11 px-4 rounded-2xl border text-sm font-normal flex items-center justify-between transition-all cursor-pointer outline-none ${
                    isOpen
                      ? "border-[#b20a1c] bg-rose-50/40 text-slate-900 ring-2 ring-rose-100"
                      : "border-border bg-slate-50 hover:bg-slate-100/80 text-slate-800"
                  }`}
                >
                  <span>{selectedStatusObj?.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 text-slate-400 ${
                      isOpen ? "rotate-180 text-[#b20a1c]" : ""
                    }`}
                  />
                </button>
              )}
            />
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#b20a1c]" />
              <label className="text-sm font-bold text-slate-900">
                {sc.priceRange || "Khoảng giá"}
              </label>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {sc.quickPresets || "Gợi ý nhanh"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePricePreset("", "")}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    localMinPrice === "" && localMaxPrice === ""
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/70"
                  }`}
                >
                  {sc.allPrices || "Tất cả giá"}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset("0", "500000")}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    localMinPrice === "0" && localMaxPrice === "500000"
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/70"
                  }`}
                >
                  {sc.under500k || "Dưới 500.000 đ"}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset("500000", "2000000")}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    localMinPrice === "500000" && localMaxPrice === "2000000"
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/70"
                  }`}
                >
                  {sc.range500kTo2M || "500k - 2 triệu"}
                </button>
                <button
                  type="button"
                  onClick={() => handlePricePreset("2000000", "")}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                    localMinPrice === "2000000" && localMaxPrice === ""
                      ? "bg-[#b20a1c] text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-border/70"
                  }`}
                >
                  {sc.above2M || "Trên 2 triệu"}
                </button>
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {sc.customPriceRange || "Tùy chỉnh khoảng giá"}
              </span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder={sc.priceFrom || "Từ (VNĐ)"}
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-border rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                  />
                </div>
                <span className="text-slate-400 font-bold text-xs shrink-0">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    placeholder={sc.priceTo || "Đến (VNĐ)"}
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-border rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#b20a1c] focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/80 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#b20a1c] hover:bg-[#FFF0F2] rounded-xl transition-all cursor-pointer"
          >
            {sc.clear || "Xóa"}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#b20a1c] hover:bg-[#960817] text-white text-sm font-bold rounded-xl shadow-md shadow-[#b20a1c]/15 transition-all cursor-pointer"
          >
            <span>{sc.apply || "Áp dụng"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ExploreCoursesFilterModal
