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
    <div className={`flex items-center bg-white p-1 rounded-full border-0 shadow-2xs gap-1 ${className}`}>
      {viewModes.map(({ value: mode, icon, label }) => {
        const isActive = value === mode
        return (
          <button
            key={mode}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onChange(mode)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive
                ? "bg-[#b20a1c] text-white shadow-xs"
                : "text-slate-400 hover:text-slate-700 bg-transparent hover:bg-slate-50"
            }`}
          >
            {React.createElement(icon, { size: 15 })}
          </button>
        )
      })}
    </div>
  )
}

export default ViewModeToggle
