import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Globe } from "lucide-react"
import { getNavItemClasses, getNavTextClasses } from "../../utils/navStyles"

const DesktopNavSubItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  isFlyout = false,
  color,
  img,
}) => {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [img])

  const IconComponent = Icon || Globe

  return (
    <NavLink
      to={to}
      className={({ isActive }) => getNavItemClasses(isActive, !isFlyout)}
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
        className={getNavTextClasses(false)}
        style={color ? { color } : undefined}
      >
        {label}
      </span>
    </NavLink>
  )
}

export default DesktopNavSubItem
