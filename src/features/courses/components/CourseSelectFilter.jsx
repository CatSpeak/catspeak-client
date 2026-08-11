import React from "react"
import { ChevronDown } from "lucide-react"
import Dropdown from "@/shared/components/ui/Dropdown"

const CourseSelectFilter = ({
  value,
  onChange,
  options = [],
  className = "",
  disabled = false,
  title,
  icon: Icon,
}) => {
  const selectedOptionObj = options.find((o) => o.value === value)

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={(val) => onChange(val)}
      disabled={disabled}
      dropdownClassName="min-w-[170px] shadow-xl border border-border/80 rounded-2xl p-1.5 z-50 bg-white"
      activeColor="#b20a1c"
      renderOption={(option, isSelected) => (
        <div
          className={`w-full py-2 px-3 text-xs rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer ${isSelected
              ? "bg-rose-50 text-[#b20a1c] font-black"
              : "text-slate-700 hover:bg-slate-50 font-bold"
            }`}
        >
          <span>{option.label}</span>
          {isSelected && (
            <span className="w-2 h-2 rounded-full bg-[#b20a1c] shrink-0" />
          )}
        </div>
      )}
      trigger={(isOpen, _, toggle) => (
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          title={title}
          className={`h-9 px-3.5 rounded-full border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs outline-none ${isOpen
              ? "border-[#b20a1c] bg-rose-50 text-[#b20a1c] ring-2 ring-rose-100"
              : "border-border bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
            } ${className}`}
        >
          {Icon && <Icon size={14} className={isOpen ? "text-[#b20a1c]" : "text-slate-400"} />}
          <span>{selectedOptionObj?.label || "Select..."}</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#b20a1c]" : "text-slate-400"
              }`}
          />
        </button>
      )}
    />
  )
}

export default CourseSelectFilter
