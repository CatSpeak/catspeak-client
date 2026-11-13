import React, { useState, forwardRef, useRef, useEffect } from "react"
import { colors } from "@/shared/utils/colors"
import { Eye, EyeOff } from "lucide-react"

/**
 * TextInput component.
 *
 * ARCHITECTURAL RULE:
 * This component uses the Flexbox Container pattern. The outer <div> acts as the visual box
 * (border, background, border-radius, focus-within ring), and the inner <input>/<textarea>
 * is unstyled with `flex-1 bg-transparent`.
 *
 * DO NOT re-introduce `position: absolute` for icons, buttons, or prefix/suffix content.
 * All adornments must remain natural flex siblings to avoid text-clipping and manual padding hacks.
 */
const TextInput = forwardRef(
  (
    {
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
      leftContentWidthClass, // deprecated: retained for backward compatibility
      rightContent,
      rightContentWidthClass, // deprecated: retained for backward compatibility
      rightContentClassName, // deprecated: retained for backward compatibility
      multiline = false,
      floatingLabel = false,
      required = false,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword
      ? isPasswordVisible
        ? "text"
        : "password"
      : type

    const variantClasses =
      variant === "rounded-full"
        ? multiline
          ? "rounded-2xl"
          : "rounded-full"
        : variant === "square"
          ? "rounded-md"
          : variant === "rounded-2xl" || variant === "round"
            ? "rounded-2xl"
            : variant === "rounded-lg"
              ? "rounded-lg"
              : "rounded-xl"

    const errorClass = error
      ? "!border-red-500 focus-within:!border-red-500 hover:!border-red-500 animate-shake"
      : ""
    const errorId = id ? `${id}-error` : undefined
    const errorAriaProps = error
      ? {
          "aria-invalid": true,
          "aria-describedby": errorId,
        }
      : {}

    const hasCustomHeight = className
      .split(" ")
      .some((c) => c.startsWith("h-") || c.startsWith("!h-"))
    const heightClass = multiline
      ? "min-h-14 min-h-[56px]"
      : hasCustomHeight
        ? ""
        : "h-14 min-h-[56px]"

    const hasDarkBg = className
      .split(" ")
      .some((c) => /(^|\s)(!?)dark:bg-/.test(c))
    const hasLightBg = className
      .split(" ")
      .some((c) => /(^|\s)(!?)bg-/.test(c) && !/(^|\s)(!?)dark:bg-/.test(c))
    const bgClass = `${hasLightBg ? "" : "bg-white"} ${hasDarkBg ? "" : "dark:bg-[#272727]"}`

    const hasAdornmentLeft = Boolean(leftContent || Icon)
    const hasAdornmentRight = Boolean(rightContent || RightIcon || isPassword)

    const isPill = variant === "rounded-full"

    // Padding & Gap specifications:
    // - Without icons/content: 16dp (pl-4 / pr-4)
    // - With content / icon button: pl-0 / pr-0 (or pl-1 / pr-1 when rounded-full)
    // - With standalone icon: pl-3 / pr-3
    // - Gap between left, input, and right: gap-1
    const containerPaddingLeft = leftContent
      ? isPill
        ? "pl-1"
        : "pl-0"
      : Icon
        ? "pl-3"
        : "pl-4"

    const containerPaddingRight =
      rightContent || isPassword
        ? isPill
          ? "pr-1"
          : "pr-0"
        : RightIcon
          ? "pr-3"
          : "pr-4"

    const containerClassNameCompiled = `group/input relative flex w-full ${
      multiline ? "items-start" : "items-center"
    } py-1 ${containerPaddingLeft} ${containerPaddingRight} gap-1 ${bgClass} text-gray-900 dark:text-white border border-border dark:border-[#3F3F3F] transition-all duration-200 focus-within:border-[var(--focus-color)] hover:border-[var(--focus-color)] has-[:disabled]:opacity-60 has-[:disabled]:cursor-not-allowed has-[:disabled]:hover:border-border ${variantClasses} ${errorClass} ${heightClass} ${className}`

    const inputClassesCompiled = `flex-1 min-w-0 bg-transparent p-0 text-gray-900 dark:text-white placeholder-[var(--placeholder-color)] dark:placeholder-[#AAAAAA] outline-none border-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden ${
      multiline ? "resize-none overflow-y-auto max-h-[140px]" : "h-full"
    } ${floatingLabel ? "peer placeholder-transparent" : ""}`

    const internalRef = useRef(null)
    const setRefs = (node) => {
      internalRef.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    }

    useEffect(() => {
      if (multiline && internalRef.current) {
        internalRef.current.style.height = "auto"
        if (value) {
          internalRef.current.style.height = `${internalRef.current.scrollHeight}px`
        }
      }
    }, [value, multiline])

    const handleInput = (e) => {
      if (multiline) {
        e.target.style.height = "auto"
        e.target.style.height = `${e.target.scrollHeight}px`
      }
    }

    const handleContainerClick = (e) => {
      if (
        e.target.tagName !== "BUTTON" &&
        !e.target.closest("button") &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        internalRef.current?.focus()
      }
    }

    return (
      <div className={`flex flex-col gap-1 ${containerClassName}`}>
        {label && !floatingLabel && (
          <span
            className={`text-xs text-secondary dark:text-[#AAAAAA] ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        )}

        {/* Visual Flex Container Box */}
        <div
          className={containerClassNameCompiled}
          style={{
            "--border-color": colors.border,
            "--placeholder-color": colors.placeholder || "#9CA3AF",
            "--focus-color": color || colors.primaryRed || "#990011",
          }}
          onClick={handleContainerClick}
        >
          {/* Left Adornment */}
          {leftContent && (
            <div className="shrink-0 flex items-center justify-center">
              {leftContent}
            </div>
          )}
          {Icon && !leftContent && (
            <div className="shrink-0 flex items-center justify-center text-secondary dark:text-[#AAAAAA] pointer-events-none">
              <Icon className="h-5 w-5" />
            </div>
          )}

          {/* Input / Textarea */}
          {multiline ? (
            <textarea
              ref={setRefs}
              id={id}
              autoFocus={autoFocus}
              required={required}
              disabled={disabled}
              placeholder={floatingLabel ? placeholder || " " : placeholder}
              className={inputClassesCompiled}
              value={value}
              onChange={onChange}
              onInput={handleInput}
              rows={1}
              {...errorAriaProps}
              {...props}
            />
          ) : (
            <input
              ref={setRefs}
              id={id}
              type={inputType}
              autoFocus={autoFocus}
              required={required}
              disabled={disabled}
              placeholder={floatingLabel ? placeholder || " " : placeholder}
              className={inputClassesCompiled}
              value={value}
              onChange={onChange}
              {...errorAriaProps}
              {...props}
            />
          )}

          {/* Right Adornments */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="shrink-0 flex items-center justify-center p-2 rounded-full text-secondary dark:text-[#AAAAAA] hover:text-[#333] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#3D3D3D] transition-colors"
              tabIndex={-1}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {RightIcon && !rightContent && !isPassword && (
            <div className="shrink-0 flex items-center justify-center text-secondary dark:text-[#AAAAAA] pointer-events-none">
              {React.isValidElement(RightIcon) ? (
                RightIcon
              ) : (
                <RightIcon className="h-5 w-5" />
              )}
            </div>
          )}

          {rightContent && (
            <div className="shrink-0 flex items-center justify-center">
              {rightContent}
            </div>
          )}

          {/* Floating Label (retains absolute positioning relative to container for animation) */}
          {label && floatingLabel && (
            <label
              htmlFor={id}
              style={{
                "--focus-color":
                  color || "var(--tw-colors-cath-red-700, #8e0000)",
              }}
              className={`absolute transition-all duration-200 pointer-events-none origin-left scale-100
              top-1/2 -translate-y-1/2 text-secondary dark:text-[#AAAAAA]
              peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 peer-focus:text-[var(--focus-color)] peer-focus:bg-white dark:peer-focus:bg-[#272727] peer-focus:px-1
              peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:bg-white dark:peer-[:not(:placeholder-shown)]:bg-[#272727] peer-[:not(:placeholder-shown)]:px-1
              ${hasAdornmentLeft ? "left-12" : "left-4"}
              peer-focus:left-3 peer-[:not(:placeholder-shown)]:left-3
              ${labelClassName}
            `}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
        </div>

        {/* Helper text, Character count, or Error message below the input */}
        {(showCount && props.maxLength) || error || helperText ? (
          <div className="flex justify-between items-start gap-4 px-4 w-full">
            <div className="flex-1 min-w-0">
              {error ? (
                <span
                  id={errorId}
                  role="alert"
                  className="text-xs text-red-500 block"
                >
                  {error}
                </span>
              ) : helperText ? (
                <span
                  className={`text-xs block ${
                    helperTextClassName || "text-secondary dark:text-[#AAAAAA]"
                  }`}
                >
                  {helperText}
                </span>
              ) : null}
            </div>
            {showCount && props.maxLength && (
              <span className="text-xs text-secondary dark:text-[#AAAAAA] shrink-0 whitespace-nowrap">
                {String(value || "").length} / {props.maxLength}
              </span>
            )}
          </div>
        ) : null}
      </div>
    )
  },
)

TextInput.displayName = "TextInput"

export default TextInput
