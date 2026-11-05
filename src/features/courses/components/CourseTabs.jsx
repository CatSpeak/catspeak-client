import React from "react"

const CourseTabs = ({
  tabs,
  activeTab,
  onChange,
  className = "",
  buttonClassName = "",
}) => {
  return (
    <div
      className={`flex gap-6 text-sm font-bold text-gray-400 dark:text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-none ${className}`}
    >
      {tabs.map(({ value, label, icon: Icon, badge }) => {
        const isActive = activeTab === value

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={`pb-3 transition-all relative flex items-center gap-1.5 ${
              isActive
                ? "text-[#990011] dark:text-[#FF6B6B] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011] dark:after:bg-[#FF6B6B] font-bold"
                : "text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold"
            } ${buttonClassName}`}
          >
            {Icon && <Icon size={15} />}
            <span>{label}</span>
            {badge !== undefined && badge !== null && (
              <span className="ml-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FEF2F2] dark:bg-rose-950/40 text-[#990011] dark:text-[#FF6B6B] border border-[#FEE2E2] dark:border-rose-900/50 leading-none">
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default CourseTabs
