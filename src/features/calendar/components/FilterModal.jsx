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
      className="flex flex-col p-0 !max-w-[560px] w-full bg-white rounded-2xl overflow-hidden"
      bodyClassName="flex-1 flex flex-col"
    >
      <div className="flex flex-col p-8 gap-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">
            {cal.filterTitle || "Bộ lọc"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Event type */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-black">
            {cal.filterEventType || "Loại sự kiện"}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() =>
                setEventType((prev) => (prev === "online" ? null : "online"))
              }
              className={`flex items-center justify-center gap-2.5 h-14 rounded-xl border text-base font-medium transition-all ${
                eventType === "online"
                  ? "border-[#990011] bg-[#990011]/5 text-[#990011]"
                  : "border-[#E5E5E5] text-black hover:border-gray-400"
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
                  ? "border-[#990011] bg-[#990011]/5 text-[#990011]"
                  : "border-[#E5E5E5] text-black hover:border-gray-400"
              }`}
            >
              <MapPin size={18} />
              Offline
            </button>
          </div>
        </div>

        {/* Date filter */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-black">
            {cal.filterTime || "Thời gian"}
          </span>

          <div className="flex w-full gap-3">
            <div className="flex w-full flex-col gap-2">
              <label className="text-xs text-gray-500">{cal.from}</label>

              <div
                onClick={() => startTimeRef.current?.showPicker?.()}
                className="flex items-center w-full h-12 rounded-xl border border-[#E5E5E5] px-4 cursor-pointer hover:border-[#990011] focus-within:border-[#990011] transition-colors"
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
                  className="w-full bg-transparent outline-none cursor-pointer text-sm text-gray-700"
                />
              </div>
            </div>

            <div className="flex w-full flex-col gap-2">
              <label className="text-xs text-gray-500">{cal.to}</label>

              <div
                onClick={() => endTimeRef.current?.showPicker?.()}
                className="flex items-center w-full h-12 rounded-xl border border-[#E5E5E5] px-4 cursor-pointer hover:border-[#990011] focus-within:border-[#990011] transition-colors"
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
                  className="w-full bg-transparent outline-none cursor-pointer text-sm text-gray-700"
                />
              </div>
            </div>
          </div>
          {timeError && (
            <p className="text-sm text-[#990011] leading-snug">{timeError}</p>
          )}
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={!!timeError}
          className={`w-full h-12 rounded-xl text-white font-medium text-base transition-colors ${
            timeError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#3B3B3B] hover:bg-[#222]"
          }`}
        >
          {cal.filterApply || "Áp dụng"}
        </button>
      </div>
    </Modal>
  );
};

export default FilterModal;
