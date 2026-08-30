import React from "react";
import { Check } from "lucide-react";

/**
 * Shared reusable Checkbox input component.
 *
 * @param {boolean} checked - Whether the checkbox is checked.
 * @param {function} onChange - Change or click handler.
 * @param {string} id - Optional element id.
 * @param {boolean} disabled - Disabled state.
 * @param {"default" | "white" | "large"} variant - Styling variant.
 * @param {boolean} withWrapper - Optional 48px touch target with 40px hover circle.
 * @param {"button" | "div"} as - Element type when withWrapper/large is used.
 * @param {string} className - Optional styling overrides for outer wrapper.
 * @param {string} innerClassName - Optional styling overrides for indicator.
 */
const Checkbox = ({
  checked = false,
  onChange,
  id,
  disabled = false,
  variant = "default",
  withWrapper = false,
  as = "button",
  className = "",
  innerClassName = "",
  ...props
}) => {
  const isWhite = variant === "white"
  const isLarge = variant === "large" || withWrapper

  const outerBorderClass = isWhite
    ? checked
      ? "bg-white border-white text-[#990011]"
      : "bg-transparent border-white/60 group-hover:border-white text-transparent"
    : checked
      ? "bg-[#990011] border-[#990011] text-white"
      : "bg-white border-black/50 group-hover:border-black text-transparent"

  const handleClick = (e) => {
    if (disabled) return
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e?.target,
          checked: !checked,
          type: "checkbox",
          id,
        },
      }
      onChange(syntheticEvent)
    }
  }

  const checkboxIndicator = (
    <div
      className={`flex w-[18px] h-[18px] items-center justify-center rounded-[2px] border-2 transition-all duration-200 select-none ${outerBorderClass} ${innerClassName}`}
    >
      {checked && (
        <Check
          size={12}
          strokeWidth={3}
          className={isWhite ? "text-[#990011]" : "text-white"}
        />
      )}
    </div>
  )

  if (isLarge) {
    const Component = as === "div" ? "div" : "button"
    return (
      <Component
        type={Component === "button" ? "button" : undefined}
        id={id}
        onClick={handleClick}
        disabled={disabled}
        className={`group/cb inline-flex items-center justify-center w-12 h-12 rounded-full shrink-0 focus:outline-none transition-all duration-200 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
        {...props}
      >
        <span
          className={`w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors ${
            disabled
              ? ""
              : "group-hover/cb:bg-primaryBg hover:bg-primaryBg active:bg-[#E6E6E6]"
          }`}
        >
          {checkboxIndicator}
        </span>
      </Component>
    );
  }

  return (
    <div
      id={id}
      onClick={handleClick}
      className={`inline-flex items-center justify-center shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      {checkboxIndicator}
    </div>
  )
}

export default Checkbox;
