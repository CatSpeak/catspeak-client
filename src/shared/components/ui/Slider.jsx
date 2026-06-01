import React from "react"
import colors from "@/shared/utils/colors"

const Slider = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className = "",
  thumbClassName = "accent-cath-red-700",
  ...props
}) => {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${thumbClassName} ${className}`}
      style={{
        background: `linear-gradient(to right, ${colors.primaryRed} ${percentage}%, #868686 ${percentage}%)`,
      }}
      {...props}
    />
  )
}

export default Slider
