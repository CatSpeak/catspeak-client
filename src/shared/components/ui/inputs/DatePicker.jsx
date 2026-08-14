import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight, Calendar, Clock, Check, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { FluentAnimation } from "@/shared/components/ui/animations";
import { useLanguage } from "@/shared/context/LanguageContext";
import Dropdown from "@/shared/components/ui/Dropdown";

const normalizeFormat = (fmt) => {
  if (!fmt) return null;
  return fmt
    .replace(/yyyy/g, "YYYY")
    .replace(/dd/g, "DD")
    .replace(/aa/g, "A");
};

const DatePicker = ({
  value,
  onChange,
  mode = "date", // "date" | "time" | "datetime"
  color = "#B91264",
  className = "",
  disabled = false,
  placeholder,
  dateFormat,
  minDate,
  maxDate,
  showIcon = true,
  icon,
}) => {
  const { language } = useLanguage() || { language: "vi" };
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const portalRef = useRef(null);

  // Helper to parse value to dayjs object or time object
  const parseValue = (val) => {
    if (!val) return null;
    if (mode === "time" && typeof val === "string" && val.includes(":") && !val.includes("-") && !val.includes("T")) {
      const [h, m] = val.split(":").map(Number);
      return dayjs().hour(h || 0).minute(m || 0).second(0);
    }
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split("-").map(Number);
      return dayjs().year(y).month(m - 1).date(d).startOf("day");
    }
    const d = dayjs(val);
    return d.isValid() ? d : null;
  };

  const initialDate = parseValue(value);
  const [date, setDate] = useState(initialDate);
  const [currentViewDate, setCurrentViewDate] = useState(
    initialDate ? initialDate.startOf("month") : dayjs().startOf("month")
  );

  // Confirmed time state
  const [selectedHour, setSelectedHour] = useState(initialDate ? initialDate.hour() : 0);
  const [selectedMinute, setSelectedMinute] = useState(initialDate ? initialDate.minute() : 0);

  // Draft unconfirmed time/date state for popup interaction
  const [tempHour, setTempHour] = useState(selectedHour);
  const [tempMinute, setTempMinute] = useState(selectedMinute);
  const [tempDate, setTempDate] = useState(initialDate);

  const [viewMode, setViewMode] = useState("day"); // "day" | "year"
  const yearListRef = useRef(null);
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);

  useEffect(() => {
    if (viewMode === "year" && yearListRef.current) {
      const selectedYearButton = yearListRef.current.querySelector('[data-selected="true"]');
      if (selectedYearButton) {
        selectedYearButton.scrollIntoView({ block: "center" });
      }
    }
  }, [viewMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (!target) return;

      // 1. Clicked inside the main input field trigger
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      // 2. Clicked inside DatePicker popover card
      if (portalRef.current && portalRef.current.contains(target)) {
        return;
      }
      // 3. Clicked inside any child dropdown portal, menu item, or unmounted sub-component
      if (
        !document.body.contains(target) ||
        (target.closest && (
          target.closest('[data-dropdown-portal]') ||
          target.closest('.dropdown-portal') ||
          target.closest('[data-portal]') ||
          target.closest('[role="listbox"]')
        ))
      ) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update confirmed state when prop value changes
  useEffect(() => {
    const parsed = parseValue(value);
    if (parsed) {
      setDate(parsed);
      setCurrentViewDate(parsed.startOf("month"));
      setSelectedHour(parsed.hour());
      setSelectedMinute(parsed.minute());
    } else {
      setDate(null);
    }
  }, [value, mode]);

  // Sync draft state when popup opens
  useEffect(() => {
    if (isOpen) {
      const parsed = parseValue(value);
      const h = parsed ? parsed.hour() : selectedHour;
      const m = parsed ? parsed.minute() : selectedMinute;
      setTempHour(h);
      setTempMinute(m);
      setTempDate(parsed || date);

      // Scroll Apple Wheel to draft hour & minute
      const timer = setTimeout(() => {
        if (hourListRef.current) {
          hourListRef.current.scrollTop = h * 40;
        }
        if (minuteListRef.current) {
          minuteListRef.current.scrollTop = m * 40;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [portalCoords, setPortalCoords] = useState(null);

  useEffect(() => {
    const handleClose = () => setIsOpen(false);
    const handleScroll = (e) => {
      if (!isOpen) return;
      if (portalRef.current && (portalRef.current.contains(e.target) || e.target === portalRef.current)) return;
      if (
        e.target &&
        e.target !== window &&
        e.target !== document &&
        e.target !== document.body &&
        e.target !== document.documentElement
      ) {
        return;
      }
      if (typeof window !== "undefined" && window.innerWidth < 640) return;
      handleClose();
    };

    const updateCoords = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        const estimatedHeight = mode === "datetime" ? 440 : 320;
        const flipUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
        const forceAlignRight = rect.left + 300 > window.innerWidth;

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
  }, [isOpen, mode]);

  const emitChange = (newDateObj, hour = selectedHour, minute = selectedMinute) => {
    if (!onChange) return;

    if (mode === "time") {
      const formattedTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      onChange(formattedTime);
    } else if (mode === "datetime") {
      const finalDate = (newDateObj || date || dayjs()).hour(hour).minute(minute).second(0);
      setDate(finalDate);
      onChange(finalDate.toDate());
    } else {
      // mode === "date"
      setDate(newDateObj);
      onChange(newDateObj.toDate());
    }
  };

  const handleConfirmTime = () => {
    setSelectedHour(tempHour);
    setSelectedMinute(tempMinute);

    if (mode === "time") {
      const dummyDate = dayjs().hour(tempHour).minute(tempMinute);
      setDate(dummyDate);
      setIsOpen(false);
      emitChange(null, tempHour, tempMinute);
    } else if (mode === "datetime") {
      const baseDate = tempDate || date || dayjs();
      const updated = baseDate.hour(tempHour).minute(tempMinute);
      setDate(updated);
      setIsOpen(false);
      emitChange(updated, tempHour, tempMinute);
    }
  };

  const handleSelectDate = (dayNumber) => {
    const selectedDate = currentViewDate.date(dayNumber);
    if (mode === "date") {
      setDate(selectedDate);
      setIsOpen(false);
      emitChange(selectedDate);
    } else if (mode === "datetime") {
      const updated = selectedDate.hour(tempHour).minute(tempMinute);
      setTempDate(updated);
    }
  };

  const handleSelectHourItem = (h) => {
    setTempHour(h);
    if (hourListRef.current) {
      hourListRef.current.scrollTo({ top: h * 40, behavior: "smooth" });
    }
  };

  const handleSelectMinuteItem = (m) => {
    setTempMinute(m);
    if (minuteListRef.current) {
      minuteListRef.current.scrollTo({ top: m * 40, behavior: "smooth" });
    }
  };

  // Wheel scroll handlers (updates draft state only)
  const handleHourScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const h = Math.min(23, Math.max(0, Math.round(scrollTop / 40)));
    if (h !== tempHour) {
      setTempHour(h);
    }
  };

  const handleMinuteScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const m = Math.min(59, Math.max(0, Math.round(scrollTop / 40)));
    if (m !== tempMinute) {
      setTempMinute(m);
    }
  };

  const handlePreviousMonth = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.subtract(1, "month"));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.add(1, "month"));
  };

  const handlePreviousYear = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.subtract(1, "year"));
  };

  const handleNextYear = (e) => {
    e.stopPropagation();
    setCurrentViewDate(currentViewDate.add(1, "year"));
  };

  const weekDays =
    language === "en"
      ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
      : language === "zh"
        ? ["一", "二", "三", "四", "五", "六", "日"]
        : ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const formatDisplay = (d) => {
    if (!d && mode === "time" && value) {
      return typeof value === "string" ? value : dayjs(value).format("HH:mm");
    }
    if (!d) return "";

    const customNormFmt = normalizeFormat(dateFormat);

    if (mode === "time") {
      if (customNormFmt) return d.format(customNormFmt);
      return d.format("HH:mm");
    }

    if (mode === "datetime") {
      if (customNormFmt) return d.format(customNormFmt);
      return language === "en"
        ? d.format("MM/DD/YYYY, HH:mm")
        : language === "zh"
          ? d.format("YYYY年MM月DD日 HH:mm")
          : d.format("DD/MM/YYYY, HH:mm");
    }

    // mode === "date"
    if (customNormFmt) return d.format(customNormFmt);
    return language === "en"
      ? d.format("MM/DD/YYYY")
      : language === "zh"
        ? d.format("YYYY年MM月DD日")
        : d.format("DD/MM/YYYY");
  };

  const getDefaultPlaceholder = () => {
    if (placeholder) return placeholder;
    if (mode === "time") {
      return language === "en" ? "Select time" : language === "zh" ? "选择时间" : "Chọn giờ";
    }
    if (mode === "datetime") {
      return language === "en" ? "Select date & time" : language === "zh" ? "选择日期时间" : "Chọn ngày & giờ";
    }
    return language === "en" ? "Select date" : language === "zh" ? "选择日期" : "Chọn ngày";
  };

  const isDateDisabled = (targetDayNumber) => {
    const targetDate = currentViewDate.date(targetDayNumber).startOf("day");
    if (minDate && targetDate.isBefore(dayjs(minDate).startOf("day"))) return true;
    if (maxDate && targetDate.isAfter(dayjs(maxDate).endOf("day"))) return true;
    return false;
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

  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
        className={`flex items-center justify-between border rounded-xl whitespace-nowrap text-sm px-3.5 h-11 bg-white outline-none w-full transition-all duration-200 ${
          isOpen
            ? "border-[#990011] ring-2 ring-red-100"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/80"
        } ${disabled ? "cursor-not-allowed opacity-80 bg-gray-50" : ""}`}
      >
        <span className={!date && (!value || mode !== "time") ? "text-[#7A7574] font-normal" : ""}>
          {date || (mode === "time" && value)
            ? formatDisplay(date)
            : getDefaultPlaceholder()}
        </span>
        {showIcon && (
          <span className="ml-2 text-gray-400 shrink-0">
            {icon ? icon : mode === "time" ? <Clock size={18} /> : <Calendar size={18} />}
          </span>
        )}
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && portalCoords && (
              <>
                {/* Dark Backdrop Overlay on Mobile to isolate touch scrolling & modal */}
                <div
                  className="fixed inset-0 bg-black/40 z-[9998] sm:hidden pointer-events-auto transition-opacity"
                  onClick={() => setIsOpen(false)}
                />

                <div
                  ref={portalRef}
                  className="fixed sm:absolute z-[9999] inset-0 sm:inset-auto flex items-center justify-center sm:block pointer-events-none p-4 sm:p-0"
                  style={
                    typeof window !== "undefined" && window.innerWidth >= 640
                      ? {
                        top: portalCoords.top,
                        left: portalCoords.left,
                        width: portalCoords.width,
                        height: portalCoords.height,
                      }
                      : {}
                  }
                >
                  <div className="relative w-full sm:w-auto flex justify-center pointer-events-auto">
                    <div
                      className={`sm:absolute z-50 ${portalCoords.flipUp ? "sm:bottom-full sm:mb-4" : "sm:top-full sm:mt-4"} ${portalCoords.forceAlignRight ? "sm:right-0 sm:origin-top-right" : "sm:left-0 sm:origin-top-left"} ${mode === "time" ? "w-[260px]" : "w-[300px]"}`}
                    >
                      <FluentAnimation
                        direction={portalCoords.flipUp ? "up" : "down"}
                        exit={true}
                        className="bg-white/95 backdrop-blur-md border border-border rounded-2xl shadow-xl p-4 flex flex-col gap-3"
                      >
                        {/* TIME-ONLY MODE - APPLE WHEEL SCROLL UI */}
                        {mode === "time" ? (
                          <div className="flex flex-col gap-3">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border pb-2">
                              <span className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                                <Clock size={16} className="text-gray-500" />
                                {language === "en" ? "Select Time" : language === "zh" ? "选择时间" : "Chọn Giờ"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                                title="Close"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {/* Apple-style Tumbler Container */}
                            <div className="flex flex-col gap-1">
                              {/* Column Labels */}
                              <div className="flex items-center justify-between px-6 text-center text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                                <span className="flex-1">{language === "en" ? "Hour" : "Giờ"}</span>
                                <span className="w-4"></span>
                                <span className="flex-1">{language === "en" ? "Min" : "Phút"}</span>
                              </div>

                              {/* Wheel Tumbler */}
                              <div className="relative flex items-center justify-center h-[200px] select-none bg-gray-50/50 rounded-xl overflow-hidden touch-pan-y">
                                {/* Center highlight row banner */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-10 bg-white border-y border-border shadow-2xs rounded-lg pointer-events-none" />

                                <div className="flex items-center justify-center w-full z-10 px-4 h-[200px]">
                                  {/* Hours Wheel */}
                                  <div
                                    ref={hourListRef}
                                    onScroll={handleHourScroll}
                                    style={{ touchAction: "pan-y", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch" }}
                                    className="h-[200px] flex-1 overflow-y-auto py-[80px] snap-y snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                  >
                                    {hoursList.map((h) => {
                                      const isSelected = tempHour === h;
                                      return (
                                        <button
                                          key={h}
                                          type="button"
                                          onClick={() => handleSelectHourItem(h)}
                                          className={`h-10 w-full flex items-center justify-center snap-center text-center transition-all duration-150 cursor-pointer ${isSelected
                                            ? "text-gray-900 font-black text-base scale-105"
                                            : "text-gray-400 font-medium text-xs hover:text-gray-600 scale-95"
                                            }`}
                                        >
                                          {String(h).padStart(2, "0")}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <span className="w-4 h-10 flex items-center justify-center text-base font-black text-gray-400 pointer-events-none shrink-0">:</span>

                                  {/* Minutes Wheel */}
                                  <div
                                    ref={minuteListRef}
                                    onScroll={handleMinuteScroll}
                                    style={{ touchAction: "pan-y", overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch" }}
                                    className="h-[200px] flex-1 overflow-y-auto py-[80px] snap-y snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                                  >
                                    {minutesList.map((m) => {
                                      const isSelected = tempMinute === m;
                                      return (
                                        <button
                                          key={m}
                                          type="button"
                                          onClick={() => handleSelectMinuteItem(m)}
                                          className={`h-10 w-full flex items-center justify-center snap-center text-center transition-all duration-150 cursor-pointer ${isSelected
                                            ? "text-gray-900 font-black text-base scale-105"
                                            : "text-gray-400 font-medium text-xs hover:text-gray-600 scale-95"
                                            }`}
                                        >
                                          {String(m).padStart(2, "0")}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Confirm / Done Button */}
                            <button
                              type="button"
                              onClick={handleConfirmTime}
                              className="w-full py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              style={{ backgroundColor: color }}
                            >
                              <Check size={14} />
                              {language === "en" ? "Done" : "Xác nhận"}
                            </button>
                          </div>
                        ) : (
                          /* DATE or DATETIME MODE */
                          <>
                            {/* Header with Month/Year Selection */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={handlePreviousYear}
                                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <ChevronsLeft size={18} className="text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handlePreviousMonth}
                                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <ChevronLeft size={18} className="text-gray-600" />
                                </button>
                              </div>
                              <div
                                className="font-bold text-gray-800 text-[14px] cursor-pointer hover:text-[var(--focus-color)] transition-colors px-2 py-1 rounded-md hover:bg-gray-50"
                                style={{ "--focus-color": color }}
                                onClick={() => setViewMode(viewMode === "year" ? "day" : "year")}
                              >
                                {language === "en"
                                  ? currentViewDate.format("MMMM YYYY")
                                  : language === "zh"
                                    ? currentViewDate.format("YYYY年 M月")
                                    : `Tháng ${currentViewDate.format("M, YYYY")}`}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={handleNextMonth}
                                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <ChevronRight size={18} className="text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleNextYear}
                                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                  <ChevronsRight size={18} className="text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {viewMode === "day" ? (
                              <>
                                {/* Weekdays */}
                                <div className="grid grid-cols-7 gap-1 mb-2 shrink-0">
                                  {weekDays.map((day) => (
                                    <div
                                      key={day}
                                      className="text-center text-[12px] font-bold text-gray-400 pb-1 border-b border-border"
                                    >
                                      {day}
                                    </div>
                                  ))}
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 gap-y-1.5 gap-x-1">
                                  {days.map((item) => {
                                    if (item.isEmpty) {
                                      return <div key={item.key} />;
                                    }

                                    const isDisabled = isDateDisabled(item.day);
                                    const targetDateObj = tempDate || date;
                                    const isSelected =
                                      targetDateObj &&
                                      item.day === targetDateObj.date() &&
                                      currentViewDate.month() === targetDateObj.month() &&
                                      currentViewDate.year() === targetDateObj.year();

                                    const today = dayjs();
                                    const isToday =
                                      item.day === today.date() &&
                                      currentViewDate.month() === today.month() &&
                                      currentViewDate.year() === today.year();

                                    return (
                                      <button
                                        type="button"
                                        key={item.key}
                                        disabled={isDisabled}
                                        onClick={() => handleSelectDate(item.day)}
                                        className={`
                                          w-8 h-8 flex items-center justify-center text-[13px] rounded-md mx-auto transition-colors font-medium
                                          ${isDisabled ? "text-gray-300 cursor-not-allowed opacity-50" : isSelected ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}
                                        `}
                                        style={{
                                          ...(isSelected && !isDisabled ? { backgroundColor: color } : {}),
                                          ...(isToday && !isSelected && !isDisabled ? { border: `1px solid ${color}`, color: color } : {}),
                                        }}
                                      >
                                        {item.day}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <div ref={yearListRef} className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                                {Array.from({ length: 150 }, (_, i) => dayjs().year() - 100 + i).map((year) => (
                                  <button
                                    key={year}
                                    type="button"
                                    data-selected={currentViewDate.year() === year}
                                    onClick={() => {
                                      setCurrentViewDate(currentViewDate.year(year));
                                      setViewMode("day");
                                    }}
                                    className={`
                                      py-2 flex items-center justify-center text-[13px] rounded-md transition-colors font-medium
                                      ${currentViewDate.year() === year ? "text-white font-bold hover:brightness-90" : "text-gray-700 hover:bg-gray-100"}
                                    `}
                                    style={currentViewDate.year() === year ? { backgroundColor: color } : {}}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* INLINE TIME PICKER IN DATETIME MODE */}
                            {mode === "datetime" && viewMode === "day" && (
                              <div className="mt-2 pt-3 border-t border-border flex items-center justify-between gap-1.5">
                                <span className="text-xs font-bold text-gray-600 flex items-center gap-1 shrink-0">
                                  <Clock size={14} className="text-gray-400" />
                                  {language === "en" ? "Time:" : "Giờ:"}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Dropdown
                                    options={hoursList.map((h) => ({
                                      label: String(h).padStart(2, "0"),
                                      value: h,
                                    }))}
                                    value={tempHour}
                                    onChange={(opt) => handleSelectHourItem(typeof opt === "object" ? opt.value : opt)}
                                    dropdownClassName="w-[85px] min-w-[85px] max-h-[180px] p-1 shadow-xl"
                                    activeColor={color}
                                    trigger={
                                      <button
                                        type="button"
                                        className="h-8 w-[58px] px-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                                      >
                                        <span>{String(tempHour).padStart(2, "0")}</span>
                                        <ChevronDown size={12} className="text-gray-400 shrink-0" />
                                      </button>
                                    }
                                  />
                                  <span className="text-xs font-bold text-gray-400">:</span>
                                  <Dropdown
                                    options={minutesList.map((m) => ({
                                      label: String(m).padStart(2, "0"),
                                      value: m,
                                    }))}
                                    value={tempMinute}
                                    onChange={(opt) => handleSelectMinuteItem(typeof opt === "object" ? opt.value : opt)}
                                    dropdownClassName="w-[85px] min-w-[85px] max-h-[180px] p-1 shadow-xl"
                                    activeColor={color}
                                    trigger={
                                      <button
                                        type="button"
                                        className="h-8 w-[58px] px-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                                      >
                                        <span>{String(tempMinute).padStart(2, "0")}</span>
                                        <ChevronDown size={12} className="text-gray-400 shrink-0" />
                                      </button>
                                    }
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleConfirmTime}
                                  className="h-8 px-3 text-white text-xs font-bold rounded-lg shadow-2xs hover:brightness-95 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                                  style={{ backgroundColor: color }}
                                >
                                  {language === "en" ? "Confirm" : "Xác nhận"}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </FluentAnimation>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default DatePicker;
