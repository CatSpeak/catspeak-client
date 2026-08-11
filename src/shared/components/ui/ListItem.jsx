import React from "react"
import Radio from "./inputs/Radio"

/**
 * Shared reusable ListItem component.
 *
 * @param {boolean} hoverEffect - Choose whether to want list item hover effect. Default to false.
 * @param {string} hoverBgColor - The background color when hovered. Default to "bg-primaryBg".
 * @param {React.ReactNode} leftContent - Left content (Avatar, icons, or no left content).
 * @param {React.ReactNode} rightContent - Right content (Switch, icon, etc.).
 * @param {string|number|React.ReactNode} rightText - Text for right content (e.g. unassignedStudents.length).
 * @param {1|2|3} lines - Determines the height based on expected number of text lines: 1 (h-12), 2 (h-[72px]), 3 (h-[88px]).
 * @param {boolean} selected - Choose whether the list item is currently selected.
 * @param {"radio"|"checkbox"|string} variant - Built-in selection variants like "radio".
 */
const ListItem = ({
  children,
  onClick,
  hoverEffect = false,
  hoverBgColor,
  leftContent,
  rightContent,
  rightText,
  lines = 1,
  selected = false,
  variant,
  className = "",
  contentClassName = "",
  ...props
}) => {
  const isClickable = !!onClick

  const Wrapper = isClickable ? "button" : "div"

  const linesClasses = {
    1: "h-14",
    2: "h-[72px]",
    3: "h-[88px]",
  }
  const heightClass = linesClasses[lines] || "h-14"

  const effectiveRightContent =
    variant === "radio" ? (
      <Radio checked={selected} />
    ) : (
      rightContent
    )

  const baseBgClass = selected ? "bg-primaryBg dark:bg-neutral-800" : ""

  const defaultHoverClasses = selected
    ? "hover:bg-[#E6E6E6] group-hover:bg-[#E6E6E6] dark:hover:bg-neutral-700 dark:group-hover:bg-neutral-700"
    : "hover:bg-primaryBg group-hover:bg-primaryBg dark:hover:bg-neutral-800 dark:group-hover:bg-neutral-800"

  const hoverClasses = hoverBgColor
    ? `hover:${hoverBgColor} group-hover:${hoverBgColor}`
    : defaultHoverClasses

  return (
    <Wrapper
      type={isClickable ? "button" : undefined}
      onClick={onClick}
      className={`group relative outline-none flex w-full items-center text-left ${heightClass} ${baseBgClass} ${className}`}
      disabled={isClickable ? false : undefined}
      {...props}
    >
      <div
        className={`w-full ${heightClass} px-4 flex items-center justify-between transition-colors rounded-[inherit] ${
          hoverEffect || selected ? hoverClasses : ""
        } ${contentClassName}`}
      >
        <div className="flex items-center gap-4 overflow-hidden flex-1">
          {leftContent && (
            <div className="shrink-0 flex items-center justify-center [&_svg]:w-6 [&_svg]:h-6 [&_img]:w-[56px] [&_img]:h-[56px] [&_img]:object-contain">
              {leftContent}
            </div>
          )}

          {children && (
            <div className="flex flex-col justify-center min-w-0 flex-1 text-base [&>*:first-child]:text-base [&>*:nth-child(2)]:text-sm [&>*:nth-child(2)]:text-[#606060]">
              {children}
            </div>
          )}

          {(rightText !== undefined || effectiveRightContent) && (
            <div className="flex items-center shrink-0 [&_svg]:w-6 [&_svg]:h-6">
              {rightText !== undefined && (
                <span className="text-xs mr-2">{rightText}</span>
              )}
              {effectiveRightContent}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  )
}

export default ListItem
