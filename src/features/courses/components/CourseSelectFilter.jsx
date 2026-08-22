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
  variant = "pill",
  trigger: customTrigger,
  align = "right",
  dropdownClassName = "min-w-[200px] shadow-xl border border-border/80 rounded-2xl p-1.5 z-50 bg-white",
}) => {
  const selectedOptionObj = options.find((o) => o.value === value)

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={(val) => onChange(val)}
      disabled={disabled}
      align={align}
      activeColor="#990011"
      trigger={customTrigger || ((isOpen, _, toggle) => (
        <button
          type="button"
          onClick={toggle}
          disabled={disabled}
          title={title}
          className={`h-11 px-5 rounded-full border text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer shadow-2xs outline-none whitespace-nowrap shrink-0 ${isOpen
              ? "border-[#990011] bg-rose-50 text-[#990011] ring-2 ring-rose-100"
              : "border-border bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
            } ${className}`}
        >
          {Icon && <Icon size={14} className={isOpen ? "text-[#990011]" : "text-slate-400"} />}
          <span className="truncate max-w-[160px] sm:max-w-none">{selectedOptionObj?.label || "Select..."}</span>
          <ChevronDown
            size={13}
            className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#990011]" : "text-slate-400"
              }`}
            />
          </button>
        ))
      }
    />
  )
}

export default CourseSelectFilter
