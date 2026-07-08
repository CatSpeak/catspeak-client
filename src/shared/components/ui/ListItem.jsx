import React from "react"

/**
 * Shared reusable ListItem component.
 *
 * @param {boolean} hoverEffect - Choose whether to want list item hover effect. Default to false.
 * @param {string} hoverBgColor - The background color when hovered. Default to "bg-[#F2F2F2]".
 * @param {React.ReactNode} leftContent - Left content (Avatar, icons, or no left content).
 * @param {React.ReactNode} rightContent - Right content (Switch, icon, etc.).
 * @param {string|number|React.ReactNode} rightText - Text for right content (e.g. unassignedStudents.length).
 */
const ListItem = ({
  children,
  onClick,
  hoverEffect = false,
  hoverBgColor = "bg-[#F2F2F2]",
  leftContent,
  rightContent,
  rightText,
  className = "",
  contentClassName = "",
}) => {
  const isClickable = !!onClick

  const Wrapper = isClickable ? "button" : "div"

  return (
    <Wrapper
      onClick={onClick}
      className={`group relative outline-none flex w-full items-center text-left ${className}`}
      disabled={isClickable ? false : undefined}
    >
      <div
        className={`w-full h-14 px-4 flex items-center justify-between transition ${
          hoverEffect
            ? `hover:${hoverBgColor} group-hover:${hoverBgColor}`
            : ""
        } ${contentClassName}`}
      >
        <div className="flex items-center gap-4 overflow-hidden flex-1">
          {leftContent && (
            <div className="shrink-0 flex items-center justify-center">
              {leftContent}
            </div>
          )}

          {children && (
            <div className="flex flex-col justify-center min-w-0 flex-1">
              {children}
            </div>
          )}
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

export default ListItem
