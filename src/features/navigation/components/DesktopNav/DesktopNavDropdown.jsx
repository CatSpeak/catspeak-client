import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { NavLink } from "react-router-dom"

import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const DesktopNavDropdown = ({
  icon: Icon,
  label,
  isOpen,
  onToggle,
  children,
  isDocked = false,
}) => {
  return (
    <div className="flex flex-col gap-1 shrink-0 relative group/dropdown w-full">
      <button
        onClick={(e) => {
          if (!isDocked) {
            onToggle()
          }
        }}
        className={getNavItemClasses(false, false, isDocked)}
      >
        <Icon size={20} className="shrink-0" />

        <span className={getNavTextClasses(true, isDocked)}>{label}</span>

        {!isDocked && (
          <ChevronDown
            size={18}
            className={`shrink-0 transition-all duration-300 opacity-100 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Expanded Inline Menu (Not Docked) */}
      {!isDocked && isOpen && (
        <div className="flex flex-col gap-1 w-full h-full overflow-hidden relative">
          {children}
        </div>
      )}

      {/* Floating Flyout Menu (Docked) */}
      {isDocked && (
        <div className="absolute left-full ml-2 top-0 bg-white border border-gray-200 rounded-lg shadow-lg w-56 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-[100] flex flex-col p-2 pointer-events-auto text-gray-900">
          <div className="px-3 pb-2 mb-2 border-b border-gray-100 text-sm font-medium text-gray-900">
            {label}
          </div>
          {/* Subitems container */}
          <div className="flex flex-col gap-1">{children}</div>
        </div>
      )}
    </div>
  )
}

export default DesktopNavDropdown
