import React from "react"
/**
 * ChipFilter — A reusable, horizontally scrollable filter chip list (similar to YouTube's category filters).
 *
 * @param {Array} options - Array of objects: { value: string, label: string }
 * @param {string} value - The currently active value
 * @param {function} onChange - Callback when a chip is clicked: (newValue) => void
 * @param {string} className - Optional extra wrapper classes
 */
const ChipFilter = ({ options, value, onChange, className = "" }) => {
  return (
    <div
      className={`flex overflow-x-auto gap-3 scrollbar-hide ${className}`}
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}</style>

      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex-shrink-0 text-sm px-4 py-3 rounded-full transition-colors
              ${
                isActive
                  ? "bg-[#990011] text-white"
                  : "bg-[#F2F2F2] hover:bg-[#E6E6E6]"
              }
            `}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default ChipFilter
