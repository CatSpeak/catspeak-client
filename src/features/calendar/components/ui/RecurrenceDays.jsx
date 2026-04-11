import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceDays = ({ eventColor = "#B91264", value = [], onChange }) => {
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
            onClick={() => toggleDay(i)}
            className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center transition-colors duration-200 ${
              isSelected
                ? "text-white shadow-sm"
                : "bg-[#F2F2F2] text-gray-600 hover:bg-[#D9D9D9] hover:text-gray-900 shadow-sm"
            }`}
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
