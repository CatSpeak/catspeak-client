import React from "react"
import { ChevronRight } from "lucide-react"
import colors from "@/shared/utils/colors"

/**
 * Shared reusable MenuItem component for select menus, dropdowns, and popovers.
 *
 * @param {string|React.ReactNode} label - The main label text or node.
 * @param {React.ReactNode} icon - Left content icon/avatar.
 * @param {string|number|React.ReactNode} rightText - Optional right-aligned text.
 * @param {React.ReactNode} rightContent - Optional right-aligned interactive elements.
 * @param {boolean} hasSubmenu - Optional boolean indicating if this item opens a 2nd layer / submenu.
 * @param {boolean} isSelected - Highlights the item if selected.
 * @param {boolean} disabled - Disables interactive states and click handler.
 * @param {string} activeColor - The color to highlight text/icon when selected.
 * @param {string} className - Additional CSS classes.
 */
const MenuItem = ({
  children,
  label,
  icon,
  rightText,
  rightContent,
  hasSubmenu = false,
  isSelected = false,
  disabled = false,
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
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`group w-full min-h-[48px] h-auto py-0.5 px-1 flex items-center focus:outline-none ${
        disabled ? "cursor-not-allowed" : ""
      } ${className}`}
      title={typeof label === "string" ? label : undefined}
      {...props}
    >
      <div
        className={`w-full px-3 py-2 flex items-center justify-between transition-colors rounded-xl text-left text-sm ${
          disabled ? "opacity-50" : hoverBg
        } ${
          isSelected
            ? `bg-primaryBg dark:bg-[#272727] ${
                isPrimaryRed
                  ? "text-cath-red-700 dark:text-red-400 font-medium"
                  : ""
              }`
            : "text-gray-900 dark:text-white"
        } min-h-[44px]`}
        style={customTextColor ? { color: customTextColor } : {}}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {icon && (
            <div
              className={`shrink-0 flex items-center justify-center ${
                isSelected && isPrimaryRed
                  ? "text-cath-red-700 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-200"
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

        {(rightText !== undefined || rightContent || hasSubmenu) && (
          <div className="flex items-center shrink-0 ml-2">
            {rightText !== undefined && (
              <span className="text-xs mr-1.5 text-secondary dark:text-[#AAAAAA]">
                {rightText}
              </span>
            )}
            {rightContent}
            {hasSubmenu && (
              <ChevronRight
                size={20}
                className="text-secondary dark:text-[#AAAAAA] shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            )}
          </div>
        )}
      </div>
    </Wrapper>
  )
}

export { default as MenuList } from "./MenuList"
export default MenuItem
