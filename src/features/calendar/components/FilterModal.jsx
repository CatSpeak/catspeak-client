import React, { useState } from "react"
import Modal from "@/shared/components/ui/Modal"
import PillButton from "@/shared/components/ui/buttons/PillButton"
import Label from "@/shared/components/ui/Label"
import Radio from "@/shared/components/ui/inputs/Radio"
import TimeDropdown from "./ui/TimeDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const FilterModal = ({ open, onClose, onApply, initialFilters = {} }) => {
  const { t, language } = useLanguage()
  const cal = t.calendar || {}

  const [eventType, setEventType] = useState(initialFilters.eventType || null) // "online" | "offline" | null
  const [startTime, setStartTime] = useState(initialFilters.startTime || "")
  const [endTime, setEndTime] = useState(initialFilters.endTime || "")
  const [timeError, setTimeError] = useState("")

  // Price range state (0 - 1,000,000 VND)
  const PRICE_MAX = 1000000
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin ?? 0)
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax ?? PRICE_MAX)
  const [activeThumb, setActiveThumb] = useState(null)

  const formatPrice = (val) => {
    if (val >= PRICE_MAX) return "1.000k"
    if (val === 0) return "0"
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
    return String(val)
  }

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), priceMax)
    setPriceMin(val)
  }

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), priceMin)
    setPriceMax(val)
  }

  // Compute fill percentages for slider track
  const minPct = (priceMin / PRICE_MAX) * 100
  const maxPct = (priceMax / PRICE_MAX) * 100

  const validateTimeRange = (nextStartTime, nextEndTime) => {
    if (!nextStartTime || !nextEndTime) {
      setTimeError("")
      return true
    }

    if (nextEndTime < nextStartTime) {
      setTimeError(
        cal.endTimeBeforeStartTime ||
          "Thời gian kết thúc phải sau thời gian bắt đầu",
      )
      return false
    }

    setTimeError("")
    return true
  }

  const handleApply = () => {
    if (!validateTimeRange(startTime, endTime)) return

    onApply({
      eventType,
      startTime: startTime || null,
      endTime: endTime || null,
      priceMin: priceMin > 0 ? priceMin : null,
      priceMax: priceMax < PRICE_MAX ? priceMax : null,
    })

    setStartTime("")
    setEndTime("")

    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={cal.filterTitle || "Bộ lọc"}
      variant="basic"
      showCloseButton={true}
      className="flex flex-col p-0 w-[92vw] max-w-[560px] max-h-[85vh] bg-white dark:bg-[#1A1A1A] overflow-hidden mx-auto my-auto"
      bodyClassName="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden"
      footer={
        <PillButton
          onClick={handleApply}
          disabled={!!timeError}
          className="w-full"
        >
          {cal.filterApply || "Áp dụng"}
        </PillButton>
      }
    >
      <div className="flex flex-col gap-4 shrink-0">
        {/* Event type */}
        <div className="flex flex-col gap-1">
          <Label>{cal.filterEventType || "Loại sự kiện"}</Label>

          <div
            role="group"
            aria-label={cal.filterEventType || "Loại sự kiện"}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            <button
              type="button"
              aria-pressed={eventType === "online"}
              onClick={() =>
                setEventType((prev) => (prev === "online" ? null : "online"))
              }
              className={`group relative flex w-full items-center gap-4 rounded border border-border dark:border-[#3F3F3F] px-4 h-[56px] text-left outline-none transition-colors duration-150 cursor-pointer ${
                eventType === "online"
                  ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D]"
                  : "bg-white dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#272727]"
              } active:bg-itemActiveHover dark:active:bg-[#3D3D3D]`}
            >
              <div className="shrink-0 flex items-center justify-center pointer-events-none">
                <Radio checked={eventType === "online"} />
              </div>

              <span className="text-gray-900 dark:text-white text-sm">
                {cal.online || (language === "vi" ? "Trực tuyến" : "Online")}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={eventType === "offline"}
              onClick={() =>
                setEventType((prev) => (prev === "offline" ? null : "offline"))
              }
              className={`group relative flex w-full items-center gap-4 rounded border border-border dark:border-[#3F3F3F] px-4 h-[56px] text-left outline-none transition-colors duration-150 cursor-pointer ${
                eventType === "offline"
                  ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D]"
                  : "bg-white dark:bg-[#1A1A1A] hover:bg-neutral-100 dark:hover:bg-[#272727]"
              } active:bg-itemActiveHover dark:active:bg-[#3D3D3D]`}
            >
              <div className="shrink-0 flex items-center justify-center pointer-events-none">
                <Radio checked={eventType === "offline"} />
              </div>

              <span className="text-gray-900 dark:text-white text-sm">
                {cal.offline && cal.offline !== "OFFLINE"
                  ? cal.offline
                  : cal.offlineDesc ||
                    (language === "vi" ? "Trực tiếp" : "Offline")}
              </span>
            </button>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <Label>{cal.filterPrice || "Giá cả"}</Label>
            <span className="text-xs text-secondary dark:text-[#AAAAAA]">
              {formatPrice(priceMin)} – {formatPrice(priceMax)}
            </span>
          </div>

          <div className="relative h-8 flex items-center group/slider select-none">
            {/* Inactive Track */}
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 pointer-events-none" />
            {/* Active Track */}
            <div
              className="absolute h-1.5 rounded-full bg-cath-red-700 dark:bg-cath-red-1000 pointer-events-none"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
            />

            {/* Min slider */}
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={10000}
              value={priceMin}
              onChange={handleMinChange}
              onMouseDown={() => setActiveThumb("min")}
              onTouchStart={() => setActiveThumb("min")}
              className="pointer-events-none absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cath-red-700 dark:[&::-webkit-slider-thumb]:bg-cath-red-1000 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125 active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-cath-red-700 dark:[&::-moz-range-thumb]:bg-cath-red-1000 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150 hover:[&::-moz-range-thumb]:scale-125 active:[&::-moz-range-thumb]:scale-125"
              style={{
                zIndex:
                  activeThumb === "min" || priceMin > PRICE_MAX - 100000
                    ? 5
                    : 3,
              }}
            />

            {/* Max slider */}
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={10000}
              value={priceMax}
              onChange={handleMaxChange}
              onMouseDown={() => setActiveThumb("max")}
              onTouchStart={() => setActiveThumb("max")}
              className="pointer-events-none absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cath-red-700 dark:[&::-webkit-slider-thumb]:bg-cath-red-1000 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 hover:[&::-webkit-slider-thumb]:scale-125 active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-cath-red-700 dark:[&::-moz-range-thumb]:bg-cath-red-1000 [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:duration-150 hover:[&::-moz-range-thumb]:scale-125 active:[&::-moz-range-thumb]:scale-125"
              style={{ zIndex: activeThumb === "max" ? 5 : 4 }}
            />
          </div>
        </div>

        {/* Time range filter */}
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label>{cal.from || "Từ"}</Label>
              <TimeDropdown
                value={startTime}
                onChange={(val) => {
                  setStartTime(val)
                  validateTimeRange(val, endTime)
                  if (endTime && endTime < val) setEndTime("")
                }}
                color="#990011"
                className="w-full [&>button]:w-full [&>button]:rounded"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>{cal.to || "Đến"}</Label>
              <TimeDropdown
                value={endTime}
                onChange={(val) => {
                  if (startTime && val < startTime) {
                    setTimeError(
                      cal.endTimeBeforeStartTime ||
                        "Thời gian kết thúc phải sau thời gian bắt đầu",
                    )
                    setEndTime("")
                    return
                  }
                  setTimeError("")
                  setEndTime(val)
                }}
                color="#990011"
                className="w-full [&>button]:w-full [&>button]:rounded"
              />
            </div>
          </div>

          {timeError && (
            <p className="text-sm text-[#990011] dark:text-red-400 leading-snug mt-1">
              {timeError}
            </p>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default FilterModal
