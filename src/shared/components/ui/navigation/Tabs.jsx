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
const Tabs = memo(
  ({
    tabs,
    activeTab,
    onChange,
    className = "",
    activeClassName = "text-[#990011]",
    inactiveClassName = "text-[#606060]",
    fullWidth = true,
  }) => {
    return (
      <div
        className={`flex items-center overflow-x-auto scrollbar-hidden z-30 border-b border-[#e5e5e5] ${!fullWidth ? 'gap-6' : ''} ${className}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`h-12 min-w-[120px] shrink-0 group relative flex items-center justify-center transition-colors ${
                fullWidth ? "flex-1" : "px-4"
              }`}
            >
              <div
                className={`relative h-full flex items-center gap-2 text-sm transition-colors ${
                  isActive ? activeClassName : inactiveClassName
                }`}
              >
                {Icon && <Icon size={18} className="hidden sm:block" />}

                <span className="relative flex flex-col items-center justify-center">
                  {/* Invisible bold text to reserve space and prevent layout shift */}
                  <span className="invisible h-0 overflow-hidden font-bold">
                    {tab.label}
                  </span>
                  <span className="truncate">{tab.label}</span>
                </span>

                {tab.badge && (
                  <span
                    className={`w-4 h-4 rounded-full text-xs flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-[#990011] text-white"
                        : "bg-[#F0F0F0] text-gray-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Underline Indicator */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#990011] scale-x-100"
                      : "bg-[#990011]/40 scale-x-0 group-hover:scale-x-100 origin-center"
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    )
  },
)

export default Tabs
