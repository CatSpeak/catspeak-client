import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";

const FormDatePicker = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  error,
  helperText,
  color = "#8e0000",
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("days"); // "days" | "years"
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);

  const [date, setDate] = useState(value ? dayjs(value) : null);
  const [currentViewDate, setCurrentViewDate] = useState(
    value ? dayjs(value).startOf("month") : dayjs().startOf("month"),
  );
  // Neo cho lưới năm (đầu mỗi khối 12 năm)
  const [yearBlockStart, setYearBlockStart] = useState(
    Math.floor((value ? dayjs(value).year() : dayjs().year()) / 12) * 12,
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        (!portalRef.current || !portalRef.current.contains(event.target))
      ) {
        setIsOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const newDate = dayjs(value);
      setDate(newDate);
      setCurrentViewDate(newDate.startOf("month"));
      setYearBlockStart(Math.floor(newDate.year() / 12) * 12);
    } else {
      setDate(null);
    }
  }, [value]);

  const [portalCoords, setPortalCoords] = useState(null);

  useEffect(() => {
    const handleClose = () => {
      setIsOpen(false);
      setView("days");
    };
    const handleScroll = (e) => {
      if (portalRef.current && portalRef.current.contains(e.target)) return;
      handleClose();
    };

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const flipUp = spaceBelow < 360 && spaceAbove > spaceBelow;
        const forceAlignRight = rect.left + 280 > window.innerWidth;

        setPortalCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
          flipUp,
          forceAlignRight,
        });
      }
    };

    if (isOpen) {
      updateCoords();
      window.addEventListener("resize", handleClose);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("resize", handleClose);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  const emitChange = (selectedDate) => {
    if (onChange) {
      onChange({
        target: {
          value: selectedDate.format("YYYY-MM-DD"),
          type: "text",
        },
      });
    }
  };

  const handleSelectDate = (dayNumber) => {
    const selectedDate = currentViewDate.date(dayNumber);
    setDate(selectedDate);
    setIsOpen(false);
    setView("days");
    emitChange(selectedDate);
  };

  const handlePreviousMonth = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.subtract(1, "month"));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.add(1, "month"));
  };

  // --- Chọn nhanh năm ---
  const openYearPicker = (e) => {
    e.stopPropagation();
    setYearBlockStart(Math.floor(currentViewDate.year() / 12) * 12);
    setView("years");
  };

  const handleSelectYear = (year) => {
    setCurrentViewDate(currentViewDate.year(year));
    setView("days");
  };

  const handlePreviousYearBlock = (e) => {
    e.stopPropagation();
    setYearBlockStart((prev) => prev - 12);
  };

  const handleNextYearBlock = (e) => {
    e.stopPropagation();
    setYearBlockStart((prev) => prev + 12);
  };

  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const formatVietnameseDate = (d) => {
    const dayOfWeek = d.day();
    const dayNames = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return `${dayNames[dayOfWeek]}, ${d.format("DD/MM/YYYY")}`;
  };

  const generateDays = () => {
    const days = [];
    const startDay = currentViewDate.startOf("month").day();
    const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
    const daysInMonth = currentViewDate.daysInMonth();

    for (let i = 0; i < adjustedStartDay; i++) {
      days.push({ isEmpty: true, key: `empty-${i}` });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ isEmpty: false, day: i, key: `day-${i}` });
    }
    return days;
  };

  const days = generateDays();
  const years = Array.from({ length: 12 }, (_, i) => yearBlockStart + i);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block w-full ${className}`}
    >
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`h-[56px] w-full flex items-center justify-between rounded-3xl border px-4 text-sm text-left outline-none transition-colors
        focus:border-[${color}] hover:border-[${color}]
        ${error ? "border-red-500 focus:border-red-500" : "border-[#e5e5e5]"}
        ${disabled ? "cursor-not-allowed opacity-80 bg-gray-50" : "bg-white"}`}
      >
        <span
          className={!date ? "text-[#9e9e9e] font-normal" : "text-gray-800"}
        >
          {date ? formatVietnameseDate(date) : placeholder}
        </span>
        <Calendar size={18} className="text-gray-400 shrink-0" />
      </button>
      {helperText && <p className="mt-1 text-xs text-red-600">{helperText}</p>}

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && portalCoords && (
              <div
                ref={portalRef}
                style={{
                  position: "absolute",
                  top: portalCoords.top,
                  left: portalCoords.left,
                  width: portalCoords.width,
                  height: portalCoords.height,
                  zIndex: 9999,
                  pointerEvents: "none",
                }}
              >
                <div className="relative w-full h-full">
                  <div
                    className={`absolute z-50 ${portalCoords.flipUp ? "bottom-full mb-4" : "top-full mt-4"} ${portalCoords.forceAlignRight ? "right-0 origin-top-right" : "left-0 origin-top-left"} w-[280px] pointer-events-none`}
                  >
                    <FluentAnimation
                      direction={portalCoords.flipUp ? "up" : "down"}
                      exit={true}
                      className="pointer-events-auto bg-white border border-[#E5E5E5] rounded-md shadow-lg p-4 flex flex-col"
                    >
                      {view === "days" ? (
                        <>
                          {/* Header tháng + năm (bấm vào năm để chọn nhanh) */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={handlePreviousMonth}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronLeft
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={openYearPicker}
                              className="font-bold text-gray-800 text-[14px] hover:underline"
                            >
                              Tháng {currentViewDate.format("M")},{" "}
                              {currentViewDate.format("YYYY")}
                            </button>
                            <button
                              type="button"
                              onClick={handleNextMonth}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronRight
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                          </div>

                          {/* Weekdays */}
                          <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
                            {weekDays.map((day) => (
                              <div
                                key={day}
                                className="text-center text-[12px] font-bold text-gray-400 pb-2 border-b border-gray-100"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                            {days.map((item) => {
                              if (item.isEmpty) return <div key={item.key} />;

                              const isSelected =
                                date &&
                                item.day === date.date() &&
                                currentViewDate.month() === date.month() &&
                                currentViewDate.year() === date.year();

                              const today = dayjs();
                              const isToday =
                                item.day === today.date() &&
                                currentViewDate.month() === today.month() &&
                                currentViewDate.year() === today.year();

                              return (
                                <button
                                  type="button"
                                  key={item.key}
                                  onClick={() => handleSelectDate(item.day)}
                                  className={`
                                    w-8 h-8 flex items-center justify-center text-[13px] rounded-md mx-auto transition-colors font-medium
                                    ${isSelected ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}
                                  `}
                                  style={{
                                    ...(isSelected
                                      ? { backgroundColor: color }
                                      : {}),
                                    ...(isToday && !isSelected
                                      ? {
                                          border: `1px solid ${color}`,
                                          color: color,
                                        }
                                      : {}),
                                  }}
                                >
                                  {item.day}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Lưới chọn nhanh năm */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={handlePreviousYearBlock}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronLeft
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                            <div className="font-bold text-gray-800 text-[14px]">
                              {yearBlockStart} - {yearBlockStart + 11}
                            </div>
                            <button
                              type="button"
                              onClick={handleNextYearBlock}
                              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <ChevronRight
                                size={18}
                                className="text-gray-600"
                              />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {years.map((year) => {
                              const isSelectedYear =
                                currentViewDate.year() === year;
                              return (
                                <button
                                  type="button"
                                  key={year}
                                  onClick={() => handleSelectYear(year)}
                                  className={`h-9 flex items-center justify-center text-[13px] rounded-md transition-colors font-medium
                                    ${isSelectedYear ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}`}
                                  style={
                                    isSelectedYear
                                      ? { backgroundColor: color }
                                      : {}
                                  }
                                >
                                  {year}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </FluentAnimation>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default FormDatePicker;
