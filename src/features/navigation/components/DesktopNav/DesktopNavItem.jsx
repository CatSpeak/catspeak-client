import React from "react"
import { NavLink } from "react-router-dom"

const DesktopNavItem = ({ to, icon: Icon, label, isExpanded, onMouseEnter, onMouseLeave,  }) => {
  const getLinkClasses = ({ isActive }) =>
    `relative flex items-center h-11 rounded-lg transition-all duration-300 group overflow-hidden w-full ${
      isActive
        ? "bg-cath-red-700/10 text-cath-red-700 font-medium"
        : "text-gray-800 hover:bg-primary2 hover:text-gray-900"
    }`

  return (
    <NavLink 
      to={to} 
      className={getLinkClasses} 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={`flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded ? "w-[64px]" : "w-[44px]"}`}>
        <Icon size={22} className="shrink-0" />
      </div>
      <span 
        className={`text-[15px] whitespace-nowrap transition-all duration-300 ${
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 w-0"
        }`}
      >
        {label}
      </span>
    </NavLink>
  )
}

export default DesktopNavItem
