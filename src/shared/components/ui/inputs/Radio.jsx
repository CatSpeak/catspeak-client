import React from "react"

/**
 * Shared reusable Radio input component.
 *
 * @param {boolean} checked - Whether the radio is checked/selected.
 * @param {function} onChange - Change or click handler.
 * @param {string} id - Optional element id.
 * @param {boolean} disabled - Disabled state.
 * @param {string} className - Optional styling overrides.
 */
const Radio = ({
  checked = false,
  onChange,
  id,
  disabled = false,
  className = "",
  ...props
}) => {
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
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 ${
          checked
            ? "border-[#990011] dark:border-red-500"
            : "border-black/50 dark:border-white/50 group-hover:border-black dark:group-hover:border-white"
        }`}
      >
        {checked && (
          <div className="h-2.5 w-2.5 rounded-full bg-[#990011] dark:bg-red-500 transition-transform duration-150 scale-100" />
        )}
      </div>
    </div>
  )
}

export default Radio
