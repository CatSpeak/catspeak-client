import React from "react"
import { NavLink } from "react-router-dom"
import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const DesktopNavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  isDocked = false,
}) => {
  return (
    <div className="relative group/navitem w-full">
      <NavLink
        to={to}
        className={({ isActive }) =>
          getNavItemClasses(isActive, false, isDocked)
        }
        onClick={onClick}
      >
        <Icon size={20} className="shrink-0" />
        <span className={getNavTextClasses(false, isDocked)}>{label}</span>
      </NavLink>

      {/* Tooltip when docked */}
      {isDocked && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-lg opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-200 whitespace-nowrap z-[100] shadow-lg pointer-events-none">
          {label}
        </div>
      )}
    </div>
  )
}

export default DesktopNavItem
