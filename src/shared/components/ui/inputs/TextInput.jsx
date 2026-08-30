import React, { useState, forwardRef } from "react"
import { colors } from "@/shared/utils/colors"
import { Eye, EyeOff } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"

const TextInput = forwardRef(({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoFocus = false,
  type = "text",
  variant = "rounded-xl",
  icon: Icon,
  rightIcon: RightIcon,
  color,
  className = "",
  containerClassName = "",
  labelClassName = "",
  showCount = false,
  error,
  helperText,
  helperTextClassName = "",
  leftContent,
  leftContentWidthClass = "pl-14",
  rightContent,
  rightContentWidthClass = "!pr-12",
  rightContentClassName = "right-4",
  multiline = false,
  floatingLabel = false,
  required = false,
  ...props
}, ref) => {
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
      : variant === "rounded-2xl" || variant === "round"
        ? "rounded-2xl"
        : variant === "rounded-lg"
          ? "rounded-lg"
          : "rounded-xl"

  const iconPadding = Icon ? "!pl-10" : ""
  const rightIconPadding = RightIcon ? "!pr-12" : ""
  const passwordPadding = isPassword ? "!pr-10" : ""

  const errorClass = error
    ? "!border-red-500 focus:!ring-red-500 hover:!border-red-500 animate-shake"
    : ""
  const leftContentPadding = leftContent ? leftContentWidthClass : ""
  const rightContentPadding = rightContent ? rightContentWidthClass : ""
  const hasCustomHeight = className
    .split(" ")
    .some((c) => c.startsWith("h-") || c.startsWith("!h-"))
  const hasCustomPadding = className
    .split(" ")
    .some((c) => c.startsWith("px-") || c.startsWith("!px-") || c.startsWith("p-") || c.startsWith("!p-"))
  const heightClass = multiline
    ? "min-h-14"
    : hasCustomHeight
      ? ""
      : "h-14"
  const paddingClass = multiline
    ? hasCustomPadding ? "" : "px-4 py-[15px]"
    : hasCustomPadding
      ? ""
      : "px-4"
  const finalClassName = `w-full border border-border outline-none transition-all duration-200 focus:border-[var(--focus-color)] hover:border-[var(--focus-color)] disabled:hover:border-border disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 placeholder-[var(--placeholder-color)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${variantClasses} ${iconPadding} ${rightIconPadding} ${passwordPadding} ${errorClass} ${leftContentPadding} ${rightContentPadding} ${heightClass} ${paddingClass} ${floatingLabel ? "peer placeholder-transparent" : ""} ${className}`

  const handleInput = (e) => {
    if (multiline) {
      e.target.style.height = "auto"
      e.target.style.height = `${e.target.scrollHeight}px`
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`}>
      {label && !floatingLabel && (
        <span className={`text-xs ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      )}
      <div className="relative">
        {leftContent && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {leftContent}
          </div>
        )}
        {Icon && !leftContent && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        )}
        {multiline ? (
          <textarea
            ref={ref}
            id={id}
            autoFocus={autoFocus}
            required={required}
            style={{
              "--border-color": colors.border,
              "--placeholder-color": colors.placeholder || "#9CA3AF",
              "--focus-color": color || colors.primaryRed || "#990011",
            }}
            placeholder={floatingLabel ? placeholder || " " : placeholder}
            className={`${finalClassName} resize-none overflow-y-auto`}
            value={value}
            onChange={onChange}
            onInput={handleInput}
            rows={1}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            type={inputType}
            autoFocus={autoFocus}
            required={required}
            style={{
              "--border-color": colors.border,
              "--placeholder-color": colors.placeholder || "#9CA3AF",
              "--focus-color": color || colors.primaryRed || "#990011",
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-[#333] transition-colors"
            tabIndex={-1}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {RightIcon && !rightContent && !isPassword && (
          <IconButton
            as="div"
            variant="iconOnly"
            size="sm"
            className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 z-10"
          >
            {React.isValidElement(RightIcon) ? RightIcon : <RightIcon />}
          </IconButton>
        )}
        {rightContent && (
          <div
            className={`absolute ${rightContentClassName} top-1/2 -translate-y-1/2 z-10 flex items-center select-none text-slate-500 font-medium text-xs`}
          >
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
              top-1/2 -translate-y-1/2 text-secondary
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-[var(--focus-color)] peer-focus:bg-white peer-focus:px-1
              peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1
              ${Icon || leftContent ? "left-10" : "left-4"}
              peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3
              ${labelClassName}
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
      </div>
      {(showCount && props.maxLength) || error || helperText ? (
        <div className="flex justify-between items-start px-4 w-full">
          <div className="flex-1">
            {error ? (
              <span className="text-xs text-red-500 block">{error}</span>
            ) : helperText ? (
              <span
                className={`text-xs block ${
                  helperTextClassName || "text-secondary"
                }`}
              >
                {helperText}
              </span>
            ) : null}
          </div>
          {showCount && props.maxLength && (
            <span className="text-xs text-secondary ml-2 whitespace-nowrap">
              {String(value || "").length} / {props.maxLength}
            </span>
          )}
        </div>
      ) : null}
    </div>
  )
})

TextInput.displayName = "TextInput"

export default TextInput
