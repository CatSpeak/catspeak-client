import React from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/shared/context/LanguageContext"

/**
 * An Apple (iOS) style Switch component.
 * Features a silky smooth, zero-bounce cubic-bezier slide transition aligned
 * with SegmentedControl.
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
      thumbSize: "w-[16px] h-[16px]",
      thumbPosition: "top-[2px] left-[2px]",
      travel: 16,
    },
    md: {
      track: "w-[44px] h-[24px]",
      thumbSize: "w-[20px] h-[20px]",
      thumbPosition: "top-[2px] left-[2px]",
      travel: 20,
    },
    lg: {
      track: "w-[52px] h-[32px]",
      thumbSize: "w-[24px] h-[24px]",
      thumbPosition: "top-[4px] left-[4px]",
      travel: 20,
    },
  }

  const currentSize = sizeConfig[size] || sizeConfig.md

  return (
    <label
      className={`relative inline-flex items-center select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
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
        className={`relative shrink-0 rounded-full transition-colors duration-[220ms] ease-[cubic-bezier(0.25,1,0.5,1)] bg-[#E9E9EA] dark:bg-[#39393D] ${colorClass} ${currentSize.track} peer-focus-visible:ring-2 peer-focus-visible:ring-cath-red-700/50 dark:peer-focus-visible:ring-cath-red-1000/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-gray-900`}
      >
        <motion.span
          initial={false}
          className={`absolute rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] border border-black/[0.04] pointer-events-none ${currentSize.thumbSize} ${currentSize.thumbPosition}`}
          animate={{
            x: checked ? currentSize.travel : 0,
          }}
          transition={{
            type: "tween",
            ease: [0.25, 1, 0.5, 1],
            duration: 0.22,
          }}
        />
      </div>
    </label>
  )
}

export default Switch
