import React from "react"
import { Check } from "lucide-react"

const Checkbox = ({
  checked,
  onChange,
  id,
  variant = "standard", // "standard" | "large"
  disabled = false,
  className = "",
  as = "button",
  ...props
}) => {
  if (variant === "large") {
    const Component = as === "div" ? "div" : "button"
    return (
      <Component
        type={Component === "button" ? "button" : undefined}
        id={id}
        onClick={onChange}
        disabled={disabled}
        className={`group/cb inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-[#F2F2F2] active:bg-[#E6E6E6] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <div
          className={`flex items-center justify-center w-6 h-6 rounded-[6px] border-2 transition-all duration-200 ${
            checked
              ? "bg-[#990011] border-[#990011] group-hover/cb:bg-[#80000e] group-hover/cb:border-[#80000e] text-white"
              : "bg-white border-[#C6C6C6] group-hover/cb:border-[#990011]"
          }`}
        >
          {checked && (
            <Check size={14} strokeWidth={3} className="text-white" />
          )}
        </div>
      </Component>
    )
  }

  // Standard checkbox
  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      className={`h-4 w-4 cursor-pointer rounded border-gray-300 text-cath-red-700 accent-cath-red-700 focus:ring-cath-red-700 ${className}`}
      disabled={disabled}
      {...props}
    />
  )
}

export default Checkbox
