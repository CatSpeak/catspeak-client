import React from "react";
import DatePicker from "./DatePicker";
import { toLocalDateString } from "@/features/courses/utils/dateUtils";

const DateTimePicker = ({
  value,
  dateValue,
  timeValue,
  onChange,
  onDateChange,
  onTimeChange,
  color = "#990011",
  className = "",
  disabled = false,
  placeholder = "dd/MM/yyyy, --:--",
  minDate,
  maxDate,
  error = false,
  ...props
}) => {
  // Combine dateValue and timeValue if provided, or fallback to value
  let combinedValue = value;
  if (dateValue !== undefined) {
    if (dateValue) {
      const cleanDate = typeof dateValue === "string" ? dateValue.split("T")[0] : toLocalDateString(dateValue);
      const cleanTime = typeof timeValue === "string" && timeValue ? timeValue : "00:00";
      combinedValue = `${cleanDate}T${cleanTime}`;
    } else {
      combinedValue = "";
    }
  }

  const handleChange = (dateObj) => {
    let dateStr = "";
    let timeStr = "";

    if (dateObj && dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      dateStr = toLocalDateString(dateObj);
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const mm = String(dateObj.getMinutes()).padStart(2, "0");
      timeStr = `${hh}:${mm}`;
    }

    if (onDateChange) onDateChange(dateStr);
    if (onTimeChange) onTimeChange(timeStr);
    if (onChange) onChange(dateStr, timeStr, dateObj);
  };

  return (
    <DatePicker
      value={combinedValue}
      onChange={handleChange}
      mode="datetime"
      color={color}
      className={className}
      disabled={disabled}
      placeholder={placeholder}
      minDate={minDate}
      maxDate={maxDate}
      error={error}
      {...props}
    />
  );
};

export default DateTimePicker;
