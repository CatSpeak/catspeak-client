import React from "react"

/**
 * Reusable Tabs component
 * @param {Array} tabs - Array of tab objects: { id: string, label: string }
 * @param {string} activeTab - Currently active tab id
 * @param {function} onChange - Callback when a tab is clicked
 * @param {string} className - Optional extra class name for the tab container
 */
const Tabs = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div className={`flex border-b border-[#E5E5E5] shrink-0 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 min-[426px]:py-2 text-base min-[426px]:text-sm font-medium transition-colors border-b-2 -mb-px flex-1 text-center min-[426px]:flex-none ${
            activeTab === tab.id
              ? "border-cath-red-600 text-cath-red-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default Tabs
