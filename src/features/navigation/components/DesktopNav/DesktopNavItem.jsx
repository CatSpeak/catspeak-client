import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Globe } from "lucide-react"
import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const DesktopNavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  isDocked = false,
  color,
  img,
}) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [img])

  const IconComponent = Icon || Globe

  return (
    <div className="relative group/navitem w-full">
      <NavLink
        to={to}
        className={({ isActive }) =>
          getNavItemClasses(isActive, false, isDocked)
        }
        onClick={onClick}
      >
        {img && !imgError ? (
          <img
            src={img}
            alt=""
            onError={() => setImgError(true)}
            className="w-5 h-5 object-contain shrink-0 rounded-sm"
          />
        ) : (
          <IconComponent
            size={20}
            className="shrink-0"
            style={color ? { color } : undefined}
          />
        )}
        <span
          className={getNavTextClasses(false, isDocked)}
          style={color ? { color } : undefined}
        >
          {label}
        </span>
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
