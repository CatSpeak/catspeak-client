import React, { useMemo } from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import { getTimezoneOptions } from "@/shared/constants/timezones"

const TimezoneDropdown = ({ value, onChange, activeColor }) => {
  const { language } = useLanguage()
  const options = useMemo(() => getTimezoneOptions(language), [language])

  // `value` may be a string ("Asia/Ho_Chi_Minh") or an object ({ id, label }).
  const currentId =
    typeof value === "string" ? value : value?.id || options[0]?.value

  return (
    <Dropdown
      options={options}
      value={currentId}
      onChange={(val) => {
        if (onChange) onChange(val)
      }}
      activeColor={activeColor}
      className="w-full h-full"
      dropdownClassName="w-full min-w-[180px]"
    />
  )
}

export default TimezoneDropdown
