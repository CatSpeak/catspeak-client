import React from "react"
import { ChevronDown, Check } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

const LevelSelectorDropdown = ({
  currentLevel,
  onSelectLevel,
  options = [],
}) => {
  const selectedValue =
    options.find((opt) => opt.label === currentLevel || opt.value === currentLevel)
      ?.value || options[0]?.value

  return (
    <Dropdown
      options={options}
      value={selectedValue}
      onChange={(val, opt) => {
        if (opt?.label) {
          onSelectLevel(opt.label)
        } else {
          onSelectLevel(val)
        }
      }}
      align="right"
      dropdownClassName="w-auto min-w-[170px] max-w-none p-1.5 shadow-xl border border-slate-200 rounded-xl bg-white"
      trigger={(isOpen, selectedOption, onClick) => (
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>
            Trình độ: <strong>{currentLevel}</strong>
          </span>
          <span className="text-[#990011] font-semibold ml-1 flex items-center">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
      )}
      renderOption={(option, isSelected) => (
        <div
          className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg flex items-center justify-between gap-4 whitespace-nowrap transition-colors ${
            isSelected
              ? "text-[#990011] font-semibold bg-rose-50/70"
              : "text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="whitespace-nowrap select-none">{option.label}</span>
          {isSelected && (
            <Check className="w-4 h-4 text-[#990011] shrink-0" />
          )}
        </div>
      )}
    />
  )
}

export default LevelSelectorDropdown
