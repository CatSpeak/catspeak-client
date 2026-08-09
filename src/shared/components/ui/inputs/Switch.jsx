import React from "react"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * An Apple (iOS) style Switch component styled with Tailwind CSS.
 *
 * @param {Object} props
 * @param {boolean} props.checked - Whether the switch is on.
 * @param {function} props.onChange - Callback when the state changes.
 * @param {string} [props.className] - Optional container class.
 * @param {string} [props.colorClass] - Optional color for the checked state (default: peer-checked:bg-[#34C759]).
 * @param {boolean} [props.showLabel] - Whether to show text label (On/Off).
 * @param {string} [props.label] - Custom label text override.
 * @param {'sm' | 'md' | 'lg'} [props.size] - Switch size (default: 'md').
 * @param {boolean} [props.disabled] - Whether the switch is disabled.
 */
const Switch = ({
  checked,
  onChange,
  className = "",
  colorClass = "peer-checked:bg-[#34C759]",
  showLabel = false,
  label,
  size = "md",
  disabled = false,
  ...props
}) => {
  const { t } = useLanguage()

  const onText = t?.toggle?.on || "On"
  const offText = t?.toggle?.off || "Off"

  const sizeConfig = {
    sm: {
      track: "w-[36px] h-[20px]",
      thumb: "after:w-[16px] after:h-[16px] after:top-[2px] after:left-[2px]",
      translate: "peer-checked:after:translate-x-[16px]",
    },
    md: {
      track: "w-[44px] h-[24px]",
      thumb: "after:w-[20px] after:h-[20px] after:top-[2px] after:left-[2px]",
      translate: "peer-checked:after:translate-x-[20px]",
    },
    lg: {
      track: "w-[51px] h-[31px]",
      thumb: "after:w-[27px] after:h-[27px] after:top-[2px] after:left-[2px]",
      translate: "peer-checked:after:translate-x-[20px]",
    },
  }

  const currentSize = sizeConfig[size] || sizeConfig.md

  return (
    <label
      className={`relative inline-flex items-center select-none ${disabled
        ? "cursor-not-allowed opacity-50"
        : "cursor-pointer active:scale-[0.98] transition-transform duration-150"
        } ${className}`}
    >
      {showLabel && (
        <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-200 select-none">
          {label !== undefined ? label : checked ? onText : offText}
        </span>
      )}
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <div
        className={`relative shrink-0 rounded-full transition-colors duration-300 ease-in-out bg-[#E9E9EA] dark:bg-[#39393D] ${colorClass} ${currentSize.track} peer-focus-visible:ring-2 peer-focus-visible:ring-[#34C759] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-gray-900 after:content-[''] after:absolute after:rounded-full after:bg-white after:shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] after:border after:border-black/[0.04] after:transition-all after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] ${currentSize.thumb} ${currentSize.translate}`}
      ></div>
    </label>
  )
}

export default Switch

