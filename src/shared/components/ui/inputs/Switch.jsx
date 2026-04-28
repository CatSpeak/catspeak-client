import React from "react"

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
}) => {
  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${className}`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 ${colorClass}`}
      ></div>
    </label>
  )
}

export default Switch
