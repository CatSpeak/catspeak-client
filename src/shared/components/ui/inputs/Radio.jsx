import React from "react"

/**
 * Shared reusable Radio input component.
 *
 * @param {boolean} checked - Whether the radio is checked/selected.
 * @param {function} onChange - Change or click handler.
 * @param {string} id - Optional element id.
 * @param {boolean} disabled - Disabled state.
 * @param {"default" | "white"} variant - Styling variant ("default" or "white").
 * @param {string} className - Optional styling overrides.
 */
const Radio = ({
  checked = false,
  onChange,
  id,
  disabled = false,
  variant = "default",
  className = "",
  ...props
}) => {
  const isWhite = variant === "white"

  const outerBorderClass = isWhite
    ? checked
      ? "border-white"
      : "border-white/60 group-hover:border-white"
    : checked
      ? "border-[#990011] dark:border-red-500"
      : "border-black/50 dark:border-white/50 group-hover:border-black dark:group-hover:border-white"

  const innerDotClass = isWhite
    ? "bg-white"
    : "bg-[#990011] dark:bg-red-500"

  return (
    <div
      id={id}
      onClick={disabled ? undefined : onChange}
      className={`inline-flex items-center justify-center shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      {...props}
    >
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${outerBorderClass}`}
      >
        {checked && (
          <div
            className={`h-3 w-3 rounded-full transition-transform duration-150 scale-100 ${innerDotClass}`}
          />
        )}
      </div>
    </div>
  )
}

export default Radio
