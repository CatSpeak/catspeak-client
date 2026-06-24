import React from "react"
import { NavLink } from "react-router-dom"

/**
 * SharedSidebar
 * @param {Array} items - Array of { key, label, path, icon: Icon, end, onClick }
 * @param {string} variant - "vertical" | "horizontal"
 * @param {Function} onClose - Optional callback when an item is clicked
 * @param {Function} customActive - Optional function(item) to determine if active
 */
const SharedSidebar = ({
  items,
  variant = "vertical",
  onClose,
  customActive,
}) => {
  const isHorizontal = variant === "horizontal"

  const getLinkClasses = ({ isActive }) => {
    if (isHorizontal) {
      return `relative flex items-center justify-center gap-3 px-4 h-12 whitespace-nowrap transition-colors flex-1 min-w-fit ${
        isActive
          ? "text-cath-red-700 border-b-2 !border-b-cath-red-700"
          : "border-b-2 border-b-transparent"
      }`
    }

    return `relative flex w-full h-12 items-center gap-3 pl-8 rounded-r-full transition-colors mb-1 overflow-hidden ${
      isActive
        ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-cath-red-700 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-cath-red-700"
        : "hover:bg-[#F2F2F2]"
    }`
  }

  return (
    <div
      className={
        isHorizontal
          ? "flex overflow-x-auto scrollbar-hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
          : "flex flex-col h-full w-full p-6 pl-0"
      }
    >
      {items.map((item) => {
        const Icon = item.icon

        // Use button if there's no path but an onClick
        if (!item.path && item.onClick) {
          return (
            <button
              key={item.key || item.label}
              onClick={(e) => {
                if (onClose) onClose()
                item.onClick(e)
              }}
              className={getLinkClasses({
                isActive: customActive ? customActive(item) : false,
              })}
            >
              {Icon && <Icon className="flex-shrink-0" />}
              <span className="truncate">{item.label}</span>
            </button>
          )
        }

        // Use NavLink
        return (
          <NavLink
            key={item.path || item.key}
            to={item.path}
            end={item.end}
            className={(navData) => {
              const active = customActive
                ? customActive(item)
                : navData.isActive
              return getLinkClasses({ isActive: active })
            }}
            onClick={() => {
              if (onClose) onClose()
              if (item.onClick) item.onClick()
            }}
          >
            {Icon && <Icon className="flex-shrink-0" />}
            <span className="truncate">{item.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}

export default SharedSidebar
