import React from "react"
import { Lock } from "lucide-react"

const ClassDetailTabs = ({ tabs, activeTab, onChange, onLockedSelect }) => (
  <div
    role="tablist"
    className="flex border-b border-border dark:border-[#3F3F3F] pb-px gap-8 text-sm font-bold text-gray-400 dark:text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none"
  >
    {tabs.map(({ value, label, locked = false }) => {
      const isActive = activeTab === value

      return (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => locked ? onLockedSelect?.(value) : onChange(value)}
          className={`pb-3 transition-all relative flex items-center gap-1.5 ${isActive
            ? "text-[#990011] dark:text-[#FF6B6B] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011] dark:after:bg-[#FF6B6B]"
            : "hover:text-gray-600 dark:hover:text-gray-300"
            }`}
        >
          {locked && <Lock size={12} className="text-gray-400 dark:text-gray-500" />}
          <span>{label}</span>
        </button>
      )
    })}
  </div>
)

export default ClassDetailTabs
