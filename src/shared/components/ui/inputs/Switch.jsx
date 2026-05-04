import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * A reusable Switch component styled with Tailwind CSS.
 *
 * @param {Object} props
 * @param {boolean} props.checked - Whether the switch is on.
 * @param {function} props.onChange - Callback when the state changes.
 * @param {string} [props.className] - Optional container class.
 * @param {string} [props.colorClass] - Optional color for the checked state (default: bg-[#eab308]).
 */
const Switch = ({
  checked,
  onChange,
  className = "",
  colorClass = "peer-checked:bg-[#eab308]",
  showLabel = false,
}) => {
  const { t } = useLanguage()

  const onText = t.toggle?.on || "On"
  const offText = t.toggle?.off || "Off"

  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${className}`}
    >
      {showLabel && (
        <span className="mr-3 text-sm select-none">
          {checked ? onText : offText}
        </span>
      )}
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`relative w-10 h-5 shrink-0 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:shadow-sm after:rounded-full after:h-3 after:w-3 after:transition-all ${colorClass}`}
      ></div>
    </label>
  )
}

export default Switch
