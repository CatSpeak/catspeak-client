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
  labelClassName = "",
  showCount = false,
  error,
  leftContent,
  leftContentWidthClass = "pl-14",
  rightContent,
  rightContentWidthClass = "!pr-12",
  multiline = false,
  floatingLabel = false,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword
    ? isPasswordVisible
      ? "text"
      : "password"
    : type

  const variantClasses =
    variant === "square"
      ? "rounded-md"
      : variant === "rounded-xl" || variant === "semi-round"
        ? "rounded-xl"
        : variant === "rounded-2xl"
          ? "rounded-2xl"
          : "rounded-3xl"

  const iconPadding = Icon ? "!pl-10" : ""
  const passwordPadding = isPassword ? "!pr-10" : ""

  const errorClass = error
    ? "!border-red-500 focus:!ring-red-500 hover:!border-red-500"
    : ""
  const leftContentPadding = leftContent ? leftContentWidthClass : ""
  const rightContentPadding = rightContent ? rightContentWidthClass : ""
  const heightClass = multiline ? "min-h-[56px] px-4" : "h-[56px] px-4"
  const finalClassName = `w-full border border-[#e5e5e5] outline-none transition-all duration-200 focus:border-[var(--focus-color)] hover:border-[var(--focus-color)] disabled:hover:border-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 placeholder-[var(--placeholder-color)] [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${variantClasses} ${iconPadding} ${passwordPadding} ${errorClass} ${leftContentPadding} ${rightContentPadding} ${heightClass} ${floatingLabel ? "peer placeholder-transparent" : ""} ${className}`

  const handleInput = (e) => {
    if (multiline) {
      e.target.style.height = "auto"
      e.target.style.height = `${e.target.scrollHeight}px`
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && !floatingLabel && (
        <span className={labelClassName}>{label}</span>
      )}
      <div className="relative">
        {leftContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {leftContent}
          </div>
        )}
        {Icon && !leftContent && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7574]" />
        )}
        {multiline ? (
          <textarea
            id={id}
            autoFocus={autoFocus}
            style={{
              "--border-color": colors.border,
              "--placeholder-color": colors.subtext,
              "--focus-color":
                color || "var(--tw-colors-cath-red-700, #8e0000)",
            }}
            placeholder={floatingLabel ? placeholder || " " : placeholder}
            className={`${finalClassName} resize-none overflow-hidden scrollbar-hide`}
            value={value}
            onChange={onChange}
            onInput={handleInput}
            rows={1}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={inputType}
            autoFocus={autoFocus}
            style={{
              "--border-color": colors.border,
              "--placeholder-color": colors.subtext,
              "--focus-color":
                color || "var(--tw-colors-cath-red-700, #8e0000)",
            }}
            placeholder={floatingLabel ? placeholder || " " : placeholder}
            className={finalClassName}
            value={value}
            onChange={onChange}
            {...props}
          />
        )}
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
        {rightContent && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {rightContent}
          </div>
        )}

        {label && floatingLabel && (
          <label
            htmlFor={id}
            style={{
              "--focus-color":
                color || "var(--tw-colors-cath-red-700, #8e0000)",
            }}
            className={`absolute transition-all duration-200 pointer-events-none origin-left scale-100
              top-1/2 -translate-y-1/2 text-[#7A7574]
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-[var(--focus-color)] peer-focus:bg-white peer-focus:px-1
              peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1
              ${Icon || leftContent ? "left-10" : "left-4"}
              peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3
              ${labelClassName}
            `}
          >
            {label}
          </label>
        )}
      </div>
      {(showCount && props.maxLength) || error ? (
        <div className="flex justify-between items-start px-1">
          <div className="flex-1">
            {error && (
              <span className="text-xs text-red-500 block">{error}</span>
            )}
          </div>
          {showCount && props.maxLength && (
            <span className="text-xs text-[#7A7574] ml-2 whitespace-nowrap">
              {String(value || "").length} / {props.maxLength}
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default TextInput
