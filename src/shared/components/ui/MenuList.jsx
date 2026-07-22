import React from "react"

/**
 * Shared reusable MenuList container component for dropdowns and popover menus.
 *
 * @param {React.ReactNode} children - Menu items (e.g. MenuItem).
 * @param {string} className - Additional CSS classes.
 */
const MenuList = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`bg-white border border-[#e5e5e5] rounded-xl shadow-lg py-[2px] min-w-[140px] w-max max-w-xs flex flex-col ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default MenuList
