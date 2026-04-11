import React, { useMemo } from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceDropdown = ({ value, onChange, activeColor }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  const OPTIONS = useMemo(
    () => [
      { value: cal.recurrence.noRepeat, label: cal.recurrence.noRepeat },
      { value: cal.recurrence.daily, label: cal.recurrence.daily },
      { value: cal.recurrence.weekly, label: cal.recurrence.weekly },
      { value: cal.recurrence.monthly, label: cal.recurrence.monthly },
      { value: cal.recurrence.yearly, label: cal.recurrence.yearly },
    ],
    [cal]
  )

  return (
    <Dropdown
      options={OPTIONS}
      value={value || OPTIONS[0].value}
      onChange={(val) => {
        if (onChange) onChange(val)
      }}
      activeColor={activeColor}
      className="w-full"
      dropdownClassName="left-0 right-0 w-full"
    />
  )
}

export default RecurrenceDropdown
