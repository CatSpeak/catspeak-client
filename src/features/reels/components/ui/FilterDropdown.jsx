import React from "react"
import { ChevronDown } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

export default function FilterDropdown({ options, value, onChange, align = "right", defaultLabel = "Chọn" }) {
  const selectedOptionObj = options.find((o) => o.value === value)

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      align={align}
      dropdownClassName="min-w-[150px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 rounded-2xl mt-1.5 p-1.5 z-50 bg-white"
      activeColor="#A20F27"
      renderOption={(option, isSelected) => (
        <div
          className={`w-full py-2.5 px-3 text-[13.5px] rounded-xl flex items-center justify-between transition-all duration-200 ${
            isSelected
              ? "bg-red-50 text-cath-red-700 font-bold"
              : "text-gray-700 hover:bg-gray-50 font-medium"
          }`}
        >
          <span>{option.label}</span>
          {isSelected && (
            <svg
              className="w-4 h-4 text-cath-red-700 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}
      trigger={(isOpen, _, toggle) => (
        <button
          onClick={toggle}
          className={`flex items-center justify-between gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[13px] sm:text-[14px] font-semibold transition-all duration-200 outline-none cursor-pointer border ${
            isOpen
              ? "border-gray-300 bg-gray-50 text-gray-900 shadow-inner"
              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm"
          }`}
        >
          <span>{selectedOptionObj?.label || defaultLabel}</span>
          <ChevronDown
            size={16}
            className={`text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    />
  )
}
