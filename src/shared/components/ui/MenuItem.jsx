import React from "react"

/**
 * Shared reusable MenuItem component for select menus, dropdowns, and popovers.
 *
 * @param {string|React.ReactNode} label - The main label text or node.
 * @param {React.ReactNode} icon - Left content icon/avatar.
 * @param {string|number|React.ReactNode} rightText - Optional right-aligned text.
 * @param {React.ReactNode} rightContent - Optional right-aligned interactive elements.
 * @param {boolean} isSelected - Highlights the item if selected.
 * @param {string} activeColor - The color to highlight text/icon when selected.
 * @param {string} className - Additional CSS classes.
 */
const MenuItem = ({
  children,
  label,
  icon,
  rightText,
  rightContent,
  isSelected = false,
  activeColor = "inherit",
  hoverBg = "hover:bg-[#F2F2F2] group-hover:bg-[#F2F2F2]",
  className = "",
  onClick,
  ...props
}) => {
  const textColor = isSelected ? activeColor : "inherit"
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group w-full h-12 px-1 flex items-center focus:outline-none ${className}`}
      {...props}
    >
      <div
        className={`w-full px-3 flex items-center justify-between transition-colors rounded-xl text-left text-sm ${hoverBg} ${
          isSelected ? "bg-[#F6F6F6]" : ""
        } h-11`}
        style={isSelected ? { color: textColor } : {}}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {icon && (
            <div
              className="shrink-0 flex items-center justify-center"
              style={isSelected ? { color: textColor } : {}}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, {
                    size: icon.props.size || 20,
                  })
                : icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {label ? <span className="truncate">{label}</span> : children}
          </div>
        </div>

        {(rightText !== undefined || rightContent) && (
          <div className="flex items-center shrink-0 ml-2">
            {rightText !== undefined && (
              <span className="text-xs mr-2">{rightText}</span>
            )}
            {rightContent}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export { default as MenuList } from "./MenuList"
export default MenuItem
