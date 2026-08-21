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
  trigger: customTrigger,
  align = "right",
  dropdownClassName = "min-w-[200px]",
}) => {
  const selectedOptionObj = options.find((o) => o.value === value)

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={(val) => onChange(val)}
      disabled={disabled}
      dropdownClassName={dropdownClassName}
      align={align}
      activeColor="#990011"
      trigger={customTrigger || ((isOpen, _, toggle) => (
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          title={title}
          className={`h-9 px-3.5 rounded-full border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-2xs outline-none ${isOpen
              ? "border-[#990011] bg-rose-50 text-[#990011] ring-2 ring-rose-100"
              : "border-border bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
            } ${className}`}
        >
          {Icon && <Icon size={14} className={isOpen ? "text-[#990011]" : "text-slate-400"} />}
          <span>{selectedOptionObj?.label || "Select..."}</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#990011]" : "text-slate-400"
              }`}
          />
        </button>
      ))}
    />
  )
}

export default CourseSelectFilter
