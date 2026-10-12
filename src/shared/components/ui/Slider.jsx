import React from "react"

const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onValueChange,
  className = "",
  trackColor = "bg-gray-200",
  activeColor = "bg-cath-red-700",
  thumbColor = "bg-cath-red-700",
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

  // Handle position clamped so the 4px pill remains flush within the [0, 100%] bounds
  // At 0% -> left edge is exactly 0px; at 100% -> right edge is exactly 100%
  const handleLeft = `calc(2px + (${percentage} / 100) * (100% - 4px))`

  // Material Design 3 track gaps:
  // 6px gap between handle edges and the active/inactive tracks
  // Handle occupies [handleLeft - 2px, handleLeft + 2px]
  // Active track ends at handleLeft - 8px; inactive track starts at handleLeft + 8px
  const hasActiveTrack = percentage > 2.5
  const hasInactiveTrack = percentage < 97.5

  return (
    <div
      className={`relative flex items-center w-full h-11 select-none ${
        props.disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {/* Material Design 3 Visual Track & Handle Layer */}
      <div className="relative w-full h-4 flex items-center pointer-events-none">
        {/* Active Track (Left) */}
        {hasActiveTrack && (
          <div
            className={`absolute left-0 top-0 h-full rounded-full ${activeColor}`}
            style={{
              width: `calc(${handleLeft} - 8px)`,
            }}
          />
        )}

        {/* Inactive Track (Right) */}
        {hasInactiveTrack && (
          <div
            className={`absolute right-0 top-0 h-full rounded-full ${trackColor}`}
            style={{
              left: `calc(${handleLeft} + 8px)`,
            }}
          />
        )}

        {/* M3 Vertical Pill Handle (4px wide × 40px tall) */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-10 rounded-full shadow-sm peer-focus-visible:ring-4 peer-focus-visible:ring-cath-red-700/30 ${thumbColor}`}
          style={{
            left: handleLeft,
          }}
        />
      </div>

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
    </div>
  )
}

export default Slider
