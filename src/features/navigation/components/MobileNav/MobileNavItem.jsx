import React from "react"
import { NavLink } from "react-router-dom"

const MobileNavItem = ({ to, icon: Icon, label, setIsMobileOpen }) => {
  const getLinkClasses = ({ isActive }) =>
    `relative flex items-center h-12 rounded-xl transition-colors group px-4 gap-3 ${
      isActive
        ? "bg-cath-red-700/10 text-cath-red-700 font-medium"
        : "text-gray-800 hover:bg-primary2 hover:text-gray-900"
    }`

  return (
    <NavLink 
      to={to} 
      className={getLinkClasses} 
      onClick={() => setIsMobileOpen(false)}
    >
      <Icon size={24} className="shrink-0" />
      <span className="text-[16px]">{label}</span>
    </NavLink>
  )
}

export default MobileNavItem
