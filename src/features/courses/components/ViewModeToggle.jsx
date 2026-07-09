import React from "react"
import { LayoutGrid, List } from "lucide-react"

const VIEW_MODES = [
  { value: "grid", icon: LayoutGrid, label: "Grid view" },
  { value: "list", icon: List, label: "List view" },
]

const ViewModeToggle = ({ value, onChange, className = "" }) => {
  return (
    <div className={`flex bg-gray-50 p-0.5 rounded-lg border border-gray-100 ${className}`}>
      {VIEW_MODES.map(({ value: mode, icon, label }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={`p-1.5 rounded-md transition-all ${value === mode ? "bg-white text-[#990011] shadow-xs" : "text-gray-400 hover:text-gray-600"}`}
        >
          {React.createElement(icon, { size: 13 })}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
