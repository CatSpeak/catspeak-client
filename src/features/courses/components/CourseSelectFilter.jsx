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
  dropdownClassName = "min-w-[200px] shadow-xl border border-border/80 dark:border-[#3F3F3F] rounded-2xl p-1.5 z-50 bg-white dark:bg-[#1E1E1E]",
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
                ? `h-11 px-4 rounded-full border border-border dark:border-[#3F3F3F] text-sm font-normal flex items-center gap-2 transition-all cursor-pointer outline-none bg-transparent text-slate-700 dark:text-gray-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-950 dark:hover:text-white box-border leading-none ${
                    isOpen
                      ? "border-[#b20a1c] dark:border-[#FF6B6B] text-[#b20a1c] dark:text-[#FF6B6B] ring-2 ring-rose-100 dark:ring-rose-950/40"
                      : ""
                  } ${className}`
                : `h-9 px-3.5 rounded-full border text-xs font-normal flex items-center gap-2 transition-all cursor-pointer shadow-2xs outline-none box-border leading-none ${
                    isOpen
                      ? "border-[#b20a1c] dark:border-[#FF6B6B] bg-rose-50 dark:bg-rose-950/40 text-[#b20a1c] dark:text-[#FF6B6B] ring-2 ring-rose-100 dark:ring-rose-950/40"
                      : "border-border dark:border-[#3F3F3F] bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-gray-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#242424]"
                  } ${className}`
            }
          >
            {Icon && (
              <Icon
                size={14}
                className={
                  isOpen
                    ? "text-[#b20a1c] dark:text-[#FF6B6B]"
                    : variant === "ghost"
                      ? "text-slate-500 dark:text-gray-400"
                      : "text-slate-400 dark:text-gray-500"
                }
              />
            )}
            <span>{selectedOptionObj?.label || "Select..."}</span>
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#b20a1c] dark:text-[#FF6B6B]" : "text-slate-400 dark:text-gray-500"
              }`}
            />
          </button>
        ))
      }
    />
  )
}

export default CourseSelectFilter
