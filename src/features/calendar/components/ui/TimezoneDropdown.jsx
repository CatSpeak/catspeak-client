import React from "react"
import Dropdown from "@/shared/components/ui/Dropdown"


export const TIMEZONES = [
  { id: "Asia/Ho_Chi_Minh", label: "Hồ Chí Minh", offset: "UTC+07:00" },
  { id: "Asia/Shanghai", label: "Bắc Kinh / Thượng Hải", offset: "UTC+08:00" },
  { id: "America/New_York", label: "New York (EST)", offset: "UTC-05:00" },
  { id: "America/Chicago", label: "Chicago (CST)", offset: "UTC-06:00" },
  { id: "America/Denver", label: "Denver (MST)", offset: "UTC-07:00" },
  {
    id: "America/Los_Angeles",
    label: "Los Angeles (PST)",
    offset: "UTC-08:00",
  },
]

const TimezoneDropdown = ({ value, onChange, activeColor }) => {
  const selectedIdx = TIMEZONES.findIndex((tz) => tz.id === value?.id)
  const selectedTz = selectedIdx !== -1 ? TIMEZONES[selectedIdx] : TIMEZONES[0]

  const options = TIMEZONES.map((tz) => ({
    value: tz.id,
    label: `(${tz.offset}) ${tz.label}`,
  }))

  return (
    <Dropdown
      options={options}
      value={selectedTz.id}
      onChange={(val) => {
        const tz = TIMEZONES.find((t) => t.id === val)
        if (onChange) onChange(tz)
      }}

      activeColor={activeColor}
      className="h-full"
      dropdownClassName="w-full min-w-[180px]"
    />
  )
}

export default TimezoneDropdown
