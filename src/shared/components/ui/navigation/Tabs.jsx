import React, { memo } from "react"

/**
 * Reusable Tabs component that prevents layout shift on active bold states and supports optional icons.
 * 
 * @param {Array} tabs - Array of tab objects: { id: string, label: string, icon: ReactComponent }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onChange - Callback when a tab is clicked
 * @param {string} className - Optional extra class name for the tab container
 * @param {string} activeClassName - Optional custom active tab classes
 * @param {string} inactiveClassName - Optional custom inactive tab classes
 * @param {boolean} fullWidth - If true, tabs will divide space equally (flex-1)
 */
const Tabs = memo(({ 
  tabs, 
  activeTab, 
  onChange, 
  className = "",
  activeClassName = "border-[#990011] text-[#990011] font-bold",
  inactiveClassName = "border-transparent text-gray-500 hover:text-gray-700 font-medium",
  fullWidth = true
}) => {
  return (
    <div className={`flex items-center z-30 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center justify-center gap-2 py-4 text-sm sm:text-base border-b-2 transition-colors ${
              fullWidth ? "flex-1" : "px-4"
            } ${isActive ? activeClassName : inactiveClassName}`}
          >
            {Icon && <Icon size={18} className="hidden sm:block" />}
            <span className="relative flex flex-col items-center justify-center">
              {/* Invisible bold text to reserve space and prevent layout shift */}
              <span className="invisible h-0 overflow-hidden font-bold">{tab.label}</span>
              <span className="truncate">{tab.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
})

export default Tabs
