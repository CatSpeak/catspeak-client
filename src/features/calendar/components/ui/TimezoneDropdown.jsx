import React from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { Globe } from "lucide-react"

const TIMEZONES = [
  { id: "Asia/Bangkok", label: "Bangkok", offset: "GMT +07:00" },
  { id: "Asia/Shanghai", label: "China", offset: "GMT +08:00" },
  { id: "America/Los_Angeles", label: "US (PST)", offset: "GMT -08:00" },
  { id: "America/New_York", label: "US (EST)", offset: "GMT -05:00" },
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
      className="border border-[#c6c6c6] flex flex-col justify-center items-start gap-1 p-3 shadow-sm w-full md:w-[130px] shrink-0 bg-white hover:bg-gray-50 transition-colors rounded-[8px] h-full min-h-[86px]"
    >
      <Globe size={20} className="text-gray-900" />
      <div className="text-sm mt-1 text-left line-clamp-2">
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
      dropdownClassName="w-full min-w-[160px]"
    />
  )
}

export default TimezoneDropdown
