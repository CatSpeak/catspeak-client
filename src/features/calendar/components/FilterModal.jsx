import React, { useRef, useState } from "react";
import { X, Link2, MapPin } from "lucide-react";
import Modal from "@/shared/components/ui/Modal";
import { useLanguage } from "@/shared/context/LanguageContext";

const FilterModal = ({ open, onClose, onApply, initialFilters = {} }) => {
  const { t } = useLanguage();
  const cal = t.calendar || {};
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);

  const [eventType, setEventType] = useState(initialFilters.eventType || null); // "online" | "offline" | null
  const [startTime, setStartTime] = useState(initialFilters.startTime || "");
  const [endTime, setEndTime] = useState(initialFilters.endTime || "");
  const [timeError, setTimeError] = useState("");

  // Price range state (0 - 1,000,000 VND)
  const PRICE_MAX = 1000000;
  const [priceMin, setPriceMin] = useState(initialFilters.priceMin ?? 0);
  const [priceMax, setPriceMax] = useState(initialFilters.priceMax ?? PRICE_MAX);

  const formatPrice = (val) => {
    if (val >= PRICE_MAX) return "1.000k";
    if (val === 0) return "0";
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return String(val);
  };

  const handleMinChange = (e) => {
    const val = Number(e.target.value);
    if (val <= priceMax) setPriceMin(val);
  };

  const handleMaxChange = (e) => {
    const val = Number(e.target.value);
    if (val >= priceMin) setPriceMax(val);
  };

  // Compute fill percentages for slider track
  const minPct = (priceMin / PRICE_MAX) * 100;
  const maxPct = (priceMax / PRICE_MAX) * 100;

  const validateTimeRange = (nextStartTime, nextEndTime) => {
    if (!nextStartTime || !nextEndTime) {
      setTimeError("");
      return true;
    }

    if (nextEndTime < nextStartTime) {
      setTimeError(
        cal.endTimeBeforeStartTime ||
          "Thời gian kết thúc phải sau thời gian bắt đầu",
      );
      return false;
    }

    setTimeError("");
    return true;
  };

  const handleApply = () => {
    if (!validateTimeRange(startTime, endTime)) return;

    onApply({
      eventType,
      startTime: startTime || null,
      endTime: endTime || null,
      priceMin: priceMin > 0 ? priceMin : null,
      priceMax: priceMax < PRICE_MAX ? priceMax : null,
    });

    setStartTime("");
    setEndTime("");

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="flex flex-col p-0 w-[92vw] max-w-[560px] max-h-[85vh] bg-white dark:bg-[#1A1A1A] rounded-[32px] lg:rounded-2xl overflow-hidden shadow-2xl mx-auto my-auto"
      bodyClassName="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex flex-col p-6 lg:p-8 gap-7 shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {cal.filterTitle || "Bộ lọc"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#272727] transition-colors"
          >
            <X size={18} className="text-gray-600 dark:text-[#AAAAAA]" />
          </button>
        </div>

        {/* Event type */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-black dark:text-white">
            {cal.filterEventType || "Loại sự kiện"}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setEventType((prev) => (prev === "online" ? null : "online"))
              }
              className={`flex items-center justify-center gap-2.5 h-14 rounded-xl border text-base font-medium transition-all ${
                eventType === "online"
                  ? "border-[#990011] dark:border-red-400 bg-[#990011]/5 dark:bg-red-950/20 text-[#990011] dark:text-red-400"
                  : "border-border dark:border-[#3F3F3F] text-black dark:text-white hover:border-gray-400 dark:hover:border-neutral-500"
              }`}
            >
              <Link2 size={18} />
              Online
            </button>
            <button
              onClick={() =>
                setEventType((prev) => (prev === "offline" ? null : "offline"))
              }
              className={`flex items-center justify-center gap-2.5 h-14 rounded-xl border text-base font-medium transition-all ${
                eventType === "offline"
                  ? "border-[#990011] dark:border-red-400 bg-[#990011]/5 dark:bg-red-950/20 text-[#990011] dark:text-red-400"
                  : "border-border dark:border-[#3F3F3F] text-black dark:text-white hover:border-gray-400 dark:hover:border-neutral-500"
              }`}
            >
              <MapPin size={18} />
              Offline
            </button>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-black dark:text-white">
            {cal.filterPrice || "Giá cả"}
          </span>
          <div className="relative h-5 flex items-center">
            {/* Track background */}
            <div className="absolute w-full h-1 bg-gray-200 dark:bg-[#272727] rounded-full" />
            {/* Active track */}
            <div
              className="absolute h-1 rounded-full bg-[#990011] dark:bg-red-500"
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
              className="absolute w-full appearance-none bg-transparent cursor-pointer price-slider"
              style={{ zIndex: priceMin > PRICE_MAX - 100000 ? 5 : 3 }}
            />
            {/* Max slider */}
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              step={10000}
              value={priceMax}
              onChange={handleMaxChange}
              className="absolute w-full appearance-none bg-transparent cursor-pointer price-slider"
              style={{ zIndex: 4 }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-black/70 dark:text-[#AAAAAA] font-medium">
            <span>{formatPrice(priceMin)}</span>
            <span>{formatPrice(priceMax)}</span>
          </div>
          <style>{`
            .price-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 18px;
              width: 18px;
              border-radius: 50%;
              background: #990011;
              border: 2px solid #fff;
              box-shadow: 0 1px 4px rgba(153,0,17,0.4);
              cursor: pointer;
            }
            .price-slider::-moz-range-thumb {
              height: 18px;
              width: 18px;
              border-radius: 50%;
              background: #990011;
              border: 2px solid #fff;
              box-shadow: 0 1px 4px rgba(153,0,17,0.4);
              cursor: pointer;
            }
          `}</style>
        </div>

        {/* Date filter */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-black dark:text-white">
            {cal.filterTime || cal.filterDate || "Thời gian"}
          </span>

          <div className="flex w-full gap-3">
            <div className="flex w-full flex-col gap-2">
              <label className="text-xs text-gray-500 dark:text-[#AAAAAA]">{cal.from}</label>

              <div
                onClick={() => startTimeRef.current?.showPicker?.()}
                className="flex items-center w-full h-12 rounded-xl border border-border dark:border-[#3F3F3F] px-4 cursor-pointer hover:border-[#990011] dark:hover:border-red-400 focus-within:border-[#990011] dark:focus-within:border-red-400 transition-colors bg-white dark:bg-[#272727]"
              >
                <input
                  ref={startTimeRef}
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartTime(value);

                    validateTimeRange(value, endTime);
                    if (endTime && endTime < value) setEndTime("");
                  }}
                  className="w-full bg-transparent outline-none cursor-pointer text-sm text-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <label className="text-xs text-gray-500 dark:text-[#AAAAAA]">{cal.to}</label>

              <div
                onClick={() => endTimeRef.current?.showPicker?.()}
                className="flex items-center w-full h-12 rounded-xl border border-border dark:border-[#3F3F3F] px-4 cursor-pointer hover:border-[#990011] dark:hover:border-red-400 focus-within:border-[#990011] dark:focus-within:border-red-400 transition-colors bg-white dark:bg-[#272727]"
              >
                <input
                  ref={endTimeRef}
                  type="time"
                  value={endTime}
                  min={startTime}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (startTime && value < startTime) {
                      setTimeError(
                        cal.endTimeBeforeStartTime ||
                          "Thời gian kết thúc phải sau thời gian bắt đầu",
                      );
                      setEndTime("");
                      return;
                    }

                    setTimeError("");
                    setEndTime(value);
                  }}
                  className="w-full bg-transparent outline-none cursor-pointer text-sm text-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
          {timeError && (
            <p className="text-sm text-[#990011] dark:text-red-400 leading-snug">{timeError}</p>
          )}
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={!!timeError}
          className={`w-full h-12 rounded-xl text-white font-medium text-base transition-colors ${
            timeError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3B3B3B] dark:bg-white dark:text-black hover:bg-[#222] dark:hover:bg-neutral-200"
          }`}
        >
          {cal.filterApply || "Áp dụng"}
        </button>
      </div>
    </Modal>
  );
};

export default FilterModal;
