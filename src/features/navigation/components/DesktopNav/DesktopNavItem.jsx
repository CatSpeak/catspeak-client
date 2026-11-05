import React, { useState } from "react"
import { NavLink } from "react-router-dom"
import { Globe } from "lucide-react"
import ListItem from "@/shared/components/ui/ListItem"

const DesktopNavItem = ({
  to,
  icon: Icon,
  label,
  onClick,
  isDocked = false,
  color,
  img,
  rightContent,
  rightText,
}) => {
  const [imgError, setImgError] = useState(false)

  const IconComponent = Icon || Globe

  const leftIcon =
    img && !imgError ? (
      <img
        key={img}
        src={img}
        alt=""
        onError={() => setImgError(true)}
        className="w-6 h-6 object-contain rounded-sm"
      />
    ) : (
      <IconComponent strokeWidth={1.5} style={color ? { color } : undefined} />
    )

  return (
    <div className="relative group/navitem w-full">
      <NavLink
        to={to}
        onClick={onClick}
        title={label}
        className="relative block w-full outline-none no-underline"
      >
        {({ isActive }) => (
          <ListItem
            lines={1}
            selected={isActive && !isDocked}
            leftContent={leftIcon}
            rightContent={rightContent}
            rightText={rightText}
            className={isDocked ? "justify-center rounded-xl" : ""}
            contentClassName={`relative transition-colors duration-150 ${
              isDocked ? "px-0 justify-center rounded-xl" : "px-4"
            } ${
              isActive
                ? isDocked
                  ? "text-cath-red-700 dark:text-white dark:bg-cath-red-700"
                  : "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] text-gray-900 dark:text-white"
                : isDocked
                  ? "text-white dark:text-[#AAAAAA] hover:bg-white/20 dark:hover:bg-[#272727] dark:hover:text-white"
                  : "text-gray-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#272727] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span
              className={`whitespace-nowrap truncate relative z-10 ${
                isDocked
                  ? "opacity-0 w-0 pointer-events-none hidden"
                  : "opacity-100 min-w-0 flex-1 text-gray-800 dark:text-neutral-200 group-hover/navitem:text-gray-900 dark:group-hover/navitem:text-white"
              } ${isActive && !isDocked ? "text-gray-900 dark:text-white" : ""}`}
              style={color ? { color } : undefined}
            >
              {label}
            </span>
          </ListItem>
        )}
      </NavLink>

      {/* Tooltip when docked */}
      {isDocked && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-[#1A1A1A] dark:border dark:border-[#3F3F3F] text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-150 whitespace-nowrap z-[100] shadow-md dark:shadow-2xl pointer-events-none">
          {label}
        </div>
      )}
    </div>
  )
}

export default DesktopNavItem
