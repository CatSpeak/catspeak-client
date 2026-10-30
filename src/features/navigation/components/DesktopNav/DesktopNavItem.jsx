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
                    ? "text-cath-red-700"
                    : "bg-itemActive hover:bg-itemActiveHover"
                  : isDocked
                    ? "text-white hover:bg-white/20"
                    : "hover:bg-itemHover"
              }`}
            >
              <span
                className={`whitespace-nowrap truncate relative z-10 ${
                  isDocked
                    ? "opacity-0 w-0 pointer-events-none hidden"
                    : "opacity-100 min-w-0 flex-1"
                }`}
                style={color ? { color } : undefined}
              >
                {label}
              </span>
            </ListItem>
        )}
      </NavLink>

      {/* Tooltip when docked */}
      {isDocked && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-150 whitespace-nowrap z-[100] shadow-md pointer-events-none">
          {label}
        </div>
      )}
    </div>
  )
}

export default DesktopNavItem
