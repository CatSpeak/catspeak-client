import React, { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Globe } from "lucide-react"
import { motion } from "framer-motion"

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
          `relative flex items-center shrink-0 h-11 rounded-xl group w-full ${
            isDocked ? "justify-center" : "px-3 gap-2"
          } ${
            isActive
              ? isDocked
                ? "bg-white text-cath-red-700"
                : "bg-[#F2F2F2] hover:bg-[#E6E6E6]"
              : isDocked
                ? "text-white hover:bg-white/20"
                : "hover:bg-[#F2F2F2]"
          }`
        }
        onClick={onClick}
        title={label}
      >
        {({ isActive }) => (
          <>
            {isActive && !isDocked && (
              <motion.div
                layoutId="desktopNavActiveIndicator"
                className="absolute left-0 top-3 w-[3px] h-4 bg-cath-red-700 rounded-r-full z-10"
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
              className={`text-sm whitespace-nowrap transition-all duration-300 truncate relative z-10 ${
                isDocked
                  ? "opacity-0 w-0 pointer-events-none hidden"
                  : "opacity-100 min-w-[180px] flex-1"
              }`}
              style={color ? { color } : undefined}
            >
              {label}
            </span>
          </>
        )}
      </NavLink>

      {/* Tooltip when docked */}
      {isDocked && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-150 whitespace-nowrap z-[100] shadow-md pointer-events-none">
          {label}
        </div>
      )}
    </div>
  )
}

export default DesktopNavItem
