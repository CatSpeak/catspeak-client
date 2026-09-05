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
      trigger={
        customTrigger ||
        ((isOpen, _, toggle) => (
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            title={title}
            className={
              variant === "ghost"
                ? `h-11 px-4 rounded-full border border-border text-sm font-normal flex items-center gap-2 transition-all cursor-pointer outline-none bg-transparent text-slate-700 hover:border-slate-400 hover:text-slate-950 box-border leading-none ${
                    isOpen
                      ? "border-[#b20a1c] text-[#b20a1c] ring-2 ring-rose-100"
                      : ""
                  } ${className}`
                : `h-9 px-3.5 rounded-full border text-xs font-normal flex items-center gap-2 transition-all cursor-pointer shadow-2xs outline-none box-border leading-none ${
                    isOpen
                      ? "border-[#b20a1c] bg-rose-50 text-[#b20a1c] ring-2 ring-rose-100"
                      : "border-border bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                  } ${className}`
            }
          >
            {Icon && (
              <Icon
                size={14}
                className={
                  isOpen
                    ? "text-[#b20a1c]"
                    : variant === "ghost"
                      ? "text-slate-500"
                      : "text-slate-400"
                }
              />
            )}
            <span>{selectedOptionObj?.label || "Select..."}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#b20a1c]" : "text-slate-400"
              }`}
            />
          </button>
        ))
      }
    />
  )
}

export default CourseSelectFilter
