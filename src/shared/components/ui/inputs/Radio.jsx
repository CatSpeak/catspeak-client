import React from "react"

/**
 * Shared reusable Radio input component.
 *
 * @param {boolean} checked - Whether the radio is checked/selected.
 * @param {function} onChange - Change or click handler.
 * @param {string} id - Optional element id.
 * @param {boolean} disabled - Disabled state.
 * @param {"default" | "white"} variant - Styling variant ("default" or "white").
 * @param {boolean} withWrapper - Optional 48px click target with 40px hover circle.
 * @param {number} [size] - Ignored: Radio indicator size is always 20x20.
 * @param {string} className - Optional styling overrides.
 */
const Radio = ({
  checked = false,
  onChange,
  id,
  disabled = false,
  variant = "default",
  withWrapper = false,
  size = 20,
  className = "",
  ...props
}) => {
  const isWhite = variant === "white"

  const outerBorderClass = isWhite
    ? checked
      ? "border-white"
      : "border-white/60 group-hover:border-white"
    : checked
      ? "border-[#990011] dark:border-cath-red-1000"
      : "border-black/50 group-hover:border-black dark:border-neutral-400 dark:group-hover:border-white"

  const innerDotClass = isWhite
    ? "bg-white"
    : "bg-[#990011] dark:bg-cath-red-1000"

  const radioIndicator = (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${outerBorderClass}`}
    >
      {checked && (
        <div
          className={`h-2.5 w-2.5 rounded-full transition-transform duration-150 scale-100 ${innerDotClass}`}
        />
      )}
    </div>
  )

  if (withWrapper) {
    return (
      <div
        id={id}
        onClick={disabled ? undefined : onChange}
        className={`w-12 h-12 inline-flex items-center justify-center rounded-full shrink-0 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        } ${className}`}
        {...props}
      >
        <span
          className={`w-10 h-10 inline-flex items-center justify-center rounded-full transition-colors ${
            disabled
              ? ""
              : "group-hover:bg-primaryBg hover:bg-primaryBg dark:group-hover:bg-[#272727] dark:hover:bg-[#272727]"
          }`}
        >
          {radioIndicator}
        </span>
      </div>
    )
  }

  return (
    <div
      id={id}
      onClick={disabled ? undefined : onChange}
      className={`inline-flex items-center justify-center shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      {radioIndicator}
    </div>
  )
}

export default Radio
