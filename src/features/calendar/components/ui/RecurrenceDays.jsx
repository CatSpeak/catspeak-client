import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceDays = ({ eventColor = "#B91264", value = [], onChange, disabled }) => {
  const { t } = useLanguage()
  const cal = t.calendar
  const days = cal.weekDaysShort || ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

  const toggleDay = (index) => {
    if (!onChange) return

    if (value.includes(index)) {
      onChange(value.filter((i) => i !== index))
    } else {
      onChange([...value, index].sort((a, b) => a - b))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-[6px]">
      {days.map((day, i) => {
        const isSelected = value.includes(i)

        return (
          <button
            key={i}
            type="button"
            onClick={() => { if (!disabled) toggleDay(i) }}
            disabled={disabled}
            className={`border border-[#e5e5e5] w-12 h-12 rounded-full text flex items-center justify-center transition-colors duration-200 ${
              isSelected ? "text-white" : disabled ? "" : "hover:bg-[#f0f0f0]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            style={isSelected ? { backgroundColor: eventColor } : {}}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}

export default RecurrenceDays
