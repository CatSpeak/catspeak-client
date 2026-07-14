import React, { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"

const NumberStepper = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleDecrease = () => {
    const newValue = Math.max(min, Number(value) - step)
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleIncrease = () => {
    const newValue = Math.min(max, Number(value) + step)
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleInputChange = (e) => {
    setLocalValue(e.target.value)
  }

  const handleBlur = () => {
    let val = Number(localValue)
    if (isNaN(val)) {
      val = min !== -Infinity ? min : 0
    }
    val = Math.max(min, Math.min(max, val))
    setLocalValue(val)
    onChange(val)
  }

  return (
    <div
      className={`h-14 flex items-center gap-1 border border-[#e5e5e5] rounded-xl bg-white transition-colors hover:border-[#8e0000] focus-within:border-[#8e0000] ${className}`}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-[#606060] group disabled:opacity-30 outline-none"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full group-hover:bg-[#F2F2F2] transition group-disabled:group-hover:bg-transparent">
          <Minus />
        </div>
      </button>

      <input
        type="number"
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="flex-1 h-12 text-center outline-none bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full text-[#606060] group disabled:opacity-30 outline-none"
      >
        <div className="w-10 h-10 flex items-center justify-center rounded-full group-hover:bg-[#F2F2F2] transition group-disabled:group-hover:bg-transparent">
          <Plus />
        </div>
      </button>
    </div>
  )
}

export default NumberStepper
