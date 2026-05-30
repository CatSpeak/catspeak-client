import React from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { Globe } from "lucide-react"

export const TIMEZONES = [
  { id: "Asia/Ho_Chi_Minh", label: "Hồ Chí Minh", offset: "GMT +07:00" },
  { id: "Asia/Shanghai", label: "Bắc Kinh / Thượng Hải", offset: "GMT +08:00" },
  { id: "America/New_York", label: "New York (EST)", offset: "GMT -05:00" },
  { id: "America/Chicago", label: "Chicago (CST)", offset: "GMT -06:00" },
  { id: "America/Denver", label: "Denver (MST)", offset: "GMT -07:00" },
  {
    id: "America/Los_Angeles",
    label: "Los Angeles (PST)",
    offset: "GMT -08:00",
  },
]

const TimezoneDropdown = ({ value, onChange, activeColor }) => {
  const selectedIdx = TIMEZONES.findIndex((tz) => tz.id === value?.id)
  const selectedTz = selectedIdx !== -1 ? TIMEZONES[selectedIdx] : TIMEZONES[0]

  const options = TIMEZONES.map((tz) => ({
    value: tz.id,
    label: tz.label,
    subtitle: tz.offset,
  }))

  const trigger = (isOpen, selectedOption, toggle) => (
    <button
      type="button"
      onClick={toggle}
      className="hover:bg-[#f0f0f0] border border-[#e5e5e5] flex flex-col justify-center items-start gap-1 px-4 py-3 outline-none w-full md:w-[180px] shrink-0 bg-white rounded-2xl h-full min-h-[86px]"
    >
      <Globe size={20} />
      <div className="mt-1 text-left line-clamp-2">
        {selectedOption ? selectedOption.subtitle : selectedTz.offset}
        <br />
        {selectedOption ? selectedOption.label : selectedTz.label}
      </div>
    </button>
  )

  return (
    <Dropdown
      options={options}
      value={selectedTz.id}
      onChange={(val) => {
        const tz = TIMEZONES.find((t) => t.id === val)
        if (onChange) onChange(tz)
      }}
      trigger={trigger}
      activeColor={activeColor}
      className="h-full"
      dropdownClassName="w-full min-w-[180px]"
    />
  )
}

export default TimezoneDropdown
