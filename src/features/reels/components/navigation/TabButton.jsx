import React, { memo } from "react"

const TabButton = memo(({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm sm:text-base border-b-2 transition-colors ${
      isActive
        ? "border-[#990011] text-[#990011] font-bold"
        : "border-transparent text-gray-500 hover:text-gray-700 font-medium"
    }`}
  >
    {Icon && <Icon size={18} className="hidden sm:block" />}
    <span className="relative flex flex-col items-center justify-center">
      {/* Invisible bold text to reserve space and prevent layout shift */}
      <span className="invisible h-0 overflow-hidden font-bold">{label}</span>
      <span className="truncate">{label}</span>
    </span>
  </button>
))

export default TabButton
