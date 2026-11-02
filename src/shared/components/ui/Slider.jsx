import React from "react"

/**
 * Reusable Slider component with classic YouTube player aesthetic
 * (slim continuous track, circular scrubber handle with hover/active scale expansion,
 * and WCAG 48x48px touch target for mobile usability).
 */
const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onValueChange,
  className = "",
  trackColor = "bg-gray-200 dark:bg-neutral-700",
  activeColor = "bg-cath-red-700 dark:bg-cath-red-1000",
  thumbColor = "bg-cath-red-700 dark:bg-cath-red-1000",
  ...props
}) => {
  const numericValue = Array.isArray(value) ? (value[0] ?? min) : (value ?? min)
  const percentage =
    max > min
      ? Math.max(0, Math.min(100, ((numericValue - min) / (max - min)) * 100))
      : 0

  const handleChange = (e) => {
    if (props.disabled) return
    if (typeof onChange === "function") {
      onChange(e)
    }
    if (typeof onValueChange === "function") {
      onValueChange(Number(e.target.value))
    }
  }

  const hasCustomHeight = /(^|\s)(!?)h-/.test(className)
  const heightClass = hasCustomHeight ? "" : "h-12 min-h-[48px]"

  const isInteractive = !props.disabled
  // GPU compositor-driven scale expansion (resting: scale-y-50 = 4px; hover/active: scale-y-100 = 8px)
  const trackHoverClass = isInteractive
    ? "group-hover/slider:scale-y-100 peer-active:scale-y-100"
    : ""
  const thumbHoverClass = isInteractive
    ? "group-hover/slider:scale-125 peer-active:scale-125"
    : ""

  return (
    <div
      className={`group/slider relative flex items-center w-full select-none ${heightClass} ${
        props.disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Accessible native range input handling interaction, keyboard, drag & screen readers */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={handleChange}
        disabled={props.disabled}
        className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        {...props}
      />

      {/* Track Container: 100% full width, constant 8px (h-2) box scaled via GPU transform */}
      <div
        className={`relative w-full h-2 rounded-full origin-center scale-y-50 ${trackHoverClass} transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none overflow-hidden will-change-transform`}
      >
        {/* Inactive Track (Full-width continuous background) */}
        <div className={`absolute inset-0 rounded-full ${trackColor}`} />

        {/* Active Track (Progress bar up to scrubber handle) */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${activeColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Classic YouTube Circular Scrubber Handle (Centered on progress point with symmetrical -translate-x-1/2 overhang) */}
      <div
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full shadow-sm origin-center scale-100 ${thumbHoverClass} peer-focus-visible:ring-4 peer-focus-visible:ring-cath-red-700/30 dark:peer-focus-visible:ring-cath-red-1000/30 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${thumbColor}`}
        style={{ left: `${percentage}%` }}
      />
    </div>
  )
}

export default Slider
