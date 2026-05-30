import React, { useMemo } from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const RecurrenceDropdown = ({ value, onChange, activeColor }) => {
  const { t } = useLanguage()
  const cal = t.calendar

  const OPTIONS = useMemo(
    () => [
      { value: "NONE", label: cal.recurrence.noRepeat },
      // TODO: Re-enable after backend specs are finalized
      // { value: "DAILY", label: cal.recurrence.daily },
      { value: "WEEKLY", label: cal.recurrence.weekly },
      // { value: "MONTHLY", label: cal.recurrence.monthly },
      // { value: "YEARLY", label: cal.recurrence.yearly },
      // { value: "CUSTOM", label: cal.recurrence.custom },
    ],
    [cal],
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
