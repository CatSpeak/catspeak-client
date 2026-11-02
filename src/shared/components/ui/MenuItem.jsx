import React from "react"
import colors from "@/shared/utils/colors"

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
  hoverBg = "hover:bg-primaryBg group-hover:bg-primaryBg dark:hover:bg-[#272727] dark:group-hover:bg-[#272727]",
  className = "",
  onClick,
  ...props
}) => {
  const isPrimaryRed =
    activeColor === colors.primaryRed ||
    activeColor === "#990011" ||
    activeColor === "var(--cath-red-700)"

  const customTextColor = isSelected
    ? isPrimaryRed || activeColor === "inherit"
      ? undefined
      : activeColor
    : undefined
  const Wrapper = onClick ? "button" : "div"

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`group w-full min-h-[48px] h-auto py-0.5 px-1 flex items-center focus:outline-none ${className}`}
      title={typeof label === "string" ? label : undefined}
      {...props}
    >
      <div
        className={`w-full px-3 py-2 flex items-center justify-between transition-colors rounded-xl text-left text-sm ${hoverBg} ${
          isSelected
            ? `bg-[#F6F6F6] dark:bg-[#272727] ${
                isPrimaryRed
                  ? "text-cath-red-700 dark:text-red-400 font-medium"
                  : ""
              }`
            : "text-gray-800 dark:text-gray-200"
        } min-h-[44px]`}
        style={customTextColor ? { color: customTextColor } : {}}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {icon && (
            <div
              className={`shrink-0 flex items-center justify-center ${
                isSelected && isPrimaryRed
                  ? "text-cath-red-700 dark:text-red-400"
                  : ""
              }`}
              style={customTextColor ? { color: customTextColor } : {}}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon, {
                    size: icon.props.size || 20,
                  })
                : icon}
            </div>
          )}

          <div className="min-w-0 flex-1 leading-snug break-words">
            {label ? <span className="line-clamp-2">{label}</span> : children}
          </div>
        </div>

        {(rightText !== undefined || rightContent) && (
          <div className="flex items-center shrink-0 ml-2">
            {rightText !== undefined && (
              <span className="text-xs mr-2 text-secondary dark:text-[#AAAAAA]">
                {rightText}
              </span>
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
