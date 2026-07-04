import React from "react"
import { NavLink } from "react-router-dom"

import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const DesktopNavSubItem = ({ to, icon: Icon, label, onClick, isFlyout = false }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => getNavItemClasses(isActive, !isFlyout)}
      onClick={onClick}
    >
      <Icon size={20} className="shrink-0" />
      <span className={getNavTextClasses(false)}>{label}</span>
    </NavLink>
  )
}

export default DesktopNavSubItem
