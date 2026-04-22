import React, { useState } from "react"
import { colors } from "@/shared/utils/colors"
import { Eye, EyeOff } from "lucide-react"

const TextInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoFocus = false,
  type = "text",
  variant = "round",
  icon: Icon,
  color,
  className = "",
  containerClassName = "",
  showCount = false,
  error,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (isPasswordVisible ? "text" : "password") : type

  const variantClasses =
    variant === "square" ? "rounded-lg px-3" : "rounded-full px-4"

  const iconPadding = Icon ? "!pl-10" : ""
  const passwordPadding = isPassword ? "!pr-10" : ""

  const errorClass = error ? "!border-red-500 focus:!ring-red-500 hover:!border-red-500" : ""

  const finalClassName = `h-10 w-full border border-[#C6C6C6] text-sm outline-none transition-colors focus:border-[var(--focus-color)] focus:ring-1 focus:ring-[var(--focus-color)] hover:border-[var(--focus-color)] placeholder-[var(--placeholder-color)] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${variantClasses} ${iconPadding} ${passwordPadding} ${errorClass} ${className}`

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7574]" />
        )}
        <input
          id={id}
          type={inputType}
          autoFocus={autoFocus}
          style={{
            "--border-color": colors.border,
            "--placeholder-color": colors.subtext,
            "--focus-color": color || "var(--tw-colors-cath-red-700, #8e0000)",
          }}
          placeholder={placeholder}
          className={finalClassName}
          value={value}
          onChange={onChange}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7574] hover:text-[#333] transition-colors"
            tabIndex={-1}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {showCount && props.maxLength && (
        <span className="self-start px-2 text-xs text-[#7A7574]">
          {String(value || "").length} / {props.maxLength}
        </span>
      )}
      {error && <span className="text-xs text-red-500 px-1">{error}</span>}
    </div>
  )
}

export default TextInput
