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
      className={`flex gap-6 text-sm font-bold text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-none ${className}`}
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
                ? "text-[#990011] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#990011] font-bold"
                : "hover:text-gray-600 font-bold"
            } ${buttonClassName}`}
          >
            {Icon && <Icon size={15} />}
            <span>{label}</span>
            {badge !== undefined && badge !== null && (
              <span className="ml-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FEF2F2] text-[#990011] border border-[#FEE2E2] leading-none">
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
