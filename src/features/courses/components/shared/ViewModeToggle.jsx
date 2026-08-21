import React from "react"
import { LayoutGrid, List } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"

const ViewModeToggle = ({ value, onChange, className = "" }) => {
  const { t } = useLanguage()
  const ui = t.courses?.workspaceUi || {}
  const viewModes = [
    { value: "grid", icon: LayoutGrid, label: ui.gridView || "Grid view" },
    { value: "list", icon: List, label: ui.listView || "List view" },
  ]

  return (
    <div className={`flex items-center h-10 bg-gray-50/90 p-1 rounded-xl border border-border ${className}`}>
      {viewModes.map(({ value: mode, icon, label }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={`h-8 w-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
            value === mode
              ? "bg-white text-[#990011] shadow-xs"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {React.createElement(icon, { size: 15 })}
        </button>
      ))}
    </div>
  )
}

export default ViewModeToggle
