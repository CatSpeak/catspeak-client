import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Globe } from "lucide-react"
import { motion } from "framer-motion"

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
      className={({ isActive }) =>
        `relative flex items-center shrink-0 h-11 rounded-xl group w-full ${
          isFlyout ? "px-3 gap-3" : "pl-7 pr-3 gap-3"
        } ${
          isActive
            ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#272727] hover:text-gray-900 dark:hover:text-white"
        }`
      }
      onClick={onClick}
      title={label}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="desktopNavActiveIndicator"
              className="absolute left-0 top-3 w-1 h-5 bg-cath-red-700 dark:bg-red-400 rounded-r-full z-10"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}

          {img && !imgError ? (
            <img
              src={img}
              alt=""
              onError={() => setImgError(true)}
              className="w-5 h-5 object-contain shrink-0 rounded-sm relative z-10"
            />
          ) : (
            <IconComponent
              size={20}
              className="shrink-0 relative z-10"
              style={color ? { color } : undefined}
            />
          )}
          <span
            className="text-sm font-medium whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate relative z-10"
            style={color ? { color } : undefined}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export default DesktopNavSubItem
