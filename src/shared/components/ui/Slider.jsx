import React from "react"
import colors from "@/shared/utils/colors"

const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  onValueChange,
  className = "",
  ...props
}) => {
  const numericValue = Array.isArray(value) ? (value[0] ?? min) : (value ?? min)
  const percentage = ((numericValue - min) / (max - min)) * 100

  const handleChange = (e) => {
    if (typeof onChange === "function") {
      onChange(e)
    }
    if (typeof onValueChange === "function") {
      onValueChange(Number(e.target.value))
    }
  }

  return (
    <div className={`relative flex items-center w-full h-8 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={numericValue}
        onChange={handleChange}
        className="absolute w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none z-10 bg-transparent
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:bg-cath-red-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-cath-red-600 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:box-border"
        style={{
          background: `linear-gradient(to right, ${colors?.primaryRed || '#b91c1c'} ${percentage}%, #e5e7eb ${percentage}%)`,
        }}
        {...props}
      />
    </div>
  )
}

export default Slider
