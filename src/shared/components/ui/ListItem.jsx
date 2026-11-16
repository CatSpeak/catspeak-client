import React from "react"
import Radio from "./inputs/Radio"

/**
 * Shared reusable ListItem component.
 *
 * NOTE FOR DEVELOPERS & AI AGENTS:
 * - Do NOT manually pass light-only hover classes (e.g. `bg-gray-100` without dark variant) or
 *   construct dynamic hover string interpolations like `hover:${color}`.
 * - Setting `hoverEffect={true}` automatically provides full theme-aware hover tokens:
 *     Light mode: `hover:bg-neutral-100 group-hover:bg-neutral-100`
 *     Dark mode:  `dark:hover:bg-[#272727] dark:group-hover:bg-[#272727]` (matches `darkColors.itemHover` in @/shared/utils/colors.js)
 * - Only pass `hoverBgColor` when a special semantic state is required (e.g. destructive red: `hover:bg-red-50 dark:hover:bg-red-950/30`).
 *   Always provide full, explicit Tailwind class names for both light and dark modes.
 *
 * @param {boolean} hoverEffect - Choose whether to want list item hover effect. Default to false.
 * @param {string} [hoverBgColor] - Optional override. MUST be complete Tailwind classes for both themes (e.g. "hover:bg-red-50 dark:hover:bg-red-950/30").
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
  as,
  ...props
}) => {
  const isClickable = !!onClick

  const Wrapper = as || (isClickable ? "button" : "div")

  const linesClasses = {
    1: "h-14",
    2: "h-[72px]",
    3: "h-[88px]",
    auto: "min-h-[56px] py-2 h-auto",
  }
  const heightClass =
    linesClasses[lines] ||
    (lines === "auto" ? "min-h-[56px] py-3 h-auto" : "h-14")

  const effectiveRightContent =
    variant === "radio" ? <Radio checked={selected} /> : rightContent

  // Base background: itemActive token (#272727 in dark mode matching colors.js)
  const baseBgClass = selected ? "bg-itemActive dark:bg-[#272727]" : ""

  // NOTE: Keep full static Tailwind class strings here so the Tailwind compiler detects both themes.
  // Do NOT use runtime string interpolation (e.g. `hover:${...}`) as it breaks Tailwind's JIT scanner
  // and causes dark-mode hover contrast failures (e.g. white text on bright light hover background).
  const defaultHoverClasses = selected
    ? "hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D]"
    : "hover:bg-neutral-100 dark:hover:bg-[#272727]"

  const hoverClasses = hoverBgColor || defaultHoverClasses

  const shouldHover = hoverEffect || isClickable || selected
  const innerHoverClasses = shouldHover ? hoverClasses : ""

  return (
    <Wrapper
      type={Wrapper === "button" && isClickable ? "button" : undefined}
      role={Wrapper === "div" && isClickable ? "button" : undefined}
      tabIndex={Wrapper === "div" && isClickable ? 0 : undefined}
      onKeyDown={
        Wrapper === "div" && isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.(e)
              }
            }
          : undefined
      }
      onClick={onClick}
      className={`group relative outline-none flex w-full items-center text-left text-gray-900 dark:text-gray-100 ${heightClass} ${baseBgClass} ${className}`}
      disabled={Wrapper === "button" && isClickable ? false : undefined}
      {...props}
    >
      <div
        className={`w-full ${heightClass} px-4 flex items-center justify-between rounded-[inherit] ${baseBgClass} ${innerHoverClasses} ${contentClassName}`}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1 my-auto">
          {leftContent && (
            <div className="shrink-0 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
              {leftContent}
            </div>
          )}

          {children && (
            <div className="flex flex-col justify-center min-w-0 flex-1 text-base">
              {children}
            </div>
          )}

          {(rightText !== undefined || effectiveRightContent) && (
            <div className="flex items-center shrink-0 [&>svg]:w-6 [&>svg]:h-6">
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
