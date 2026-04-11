import React from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { ChevronDown } from "lucide-react"
import { COLORS } from "@/shared/constants/constants"
import { useLanguage } from "@/shared/context/LanguageContext"

const ColorDropdown = ({ value, onChange }) => {
  const { t } = useLanguage()
  const cal = t.calendar
  const selectedColor = value || "transparent"

  const trigger = (isOpen, selectedOption, toggle) => (
    <button
      onClick={toggle}
      type="button"
      className="flex items-center gap-2 border border-white rounded-full px-3 py-1.5 bg-white text-black hover:bg-gray-50 transition-colors"
    >
      <div
        className="w-3 h-3 rounded-full border-[1.5px] border-white shadow-sm"
        style={{ backgroundColor: selectedColor }}
      />
      <span className="text-sm font-medium">{cal.color}</span>
      <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
    </button>
  )

  const options = COLORS.map((color) => ({
    value: color.value,
    label: cal.colorsList?.[color.value] || color.name,
    icon: (
      <div
        className={`w-5 h-5 rounded-full shrink-0 border border-gray-200 ${
          selectedColor === color.value ? "ring-2 ring-offset-1 ring-gray-400" : ""
        }`}
        style={{ backgroundColor: color.value }}
      />
    ),
  }))

  return (
    <Dropdown
      options={options}
      value={selectedColor}
      onChange={(val) => {
        if (onChange) onChange(val)
      }}
      trigger={trigger}
      activeColor={selectedColor}
      align="right"
      maxHeightClass="max-h-none"
      className="inline-block"
      dropdownClassName="min-w-[120px]"
    />
  )
}

export default ColorDropdown
