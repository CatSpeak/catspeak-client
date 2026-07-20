/**
 * Shared container classes for navigation items.
 * Used by both standard NavLinks (DesktopNavItem, DesktopNavSubItem)
 * and Dropdown triggers (DesktopNavDropdown).
 *
 * @param {boolean} isActive - Whether the item is currently active
 * @param {boolean} isSubItem - True if it's a nested sub-item (adds extra indentation)
 */
export const getNavItemClasses = (
  isActive,
  isSubItem = false,
  isDocked = false,
  isDeepSubItem = false,
) => {
  const baseClasses =
    "relative flex items-center shrink-0 h-11 rounded-lg transition-all duration-300 group overflow-hidden w-full"

  let spacingClasses = "px-4 gap-3"
  if (isDeepSubItem) {
    spacingClasses = "pl-11 pr-3 gap-2"
  } else if (isSubItem) {
    spacingClasses = "pl-8 pr-3 gap-3"
  }

  if (isDocked) {
    spacingClasses = "justify-center"
  }

  // When docked, sidebar is red. So hover/active should use a darker/lighter red or semi-transparent white.
  // Active in docked: white background with red text.
  // Inactive in docked: hover with white/20.
  // Active in expanded: gray background with red indicator.
  // Inactive in expanded: hover with gray background.

  let activeClasses =
    "bg-[#F2F2F2] before:absolute before:content-[''] before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-5 before:bg-cath-red-700 before:rounded-r-full"
  let inactiveClasses = "hover:bg-[#F2F2F2]"

  if (isDocked) {
    activeClasses = "bg-white text-cath-red-700"
    inactiveClasses = "text-white hover:bg-white/20"
  }

  return `${baseClasses} ${spacingClasses} ${
    isActive ? activeClasses : inactiveClasses
  }`
}

/**
 * Shared classes for the text span inside navigation items.
 *
 * @param {boolean} isDropdown - True ONLY for the dropdown trigger (DesktopNavDropdown),
 *                               adds flex-1 so the chevron is pushed to the right.
 */
export const getNavTextClasses = (isDropdown = false, isDocked = false) => {
  const baseClasses = "text-sm whitespace-nowrap transition-all duration-300"
  const dropdownClasses = isDropdown ? "flex-1 text-left" : ""

  // Hide text entirely if docked
  const expandedClasses = isDocked ? "opacity-0 w-0 hidden" : "opacity-100"

  return `${dropdownClasses} ${baseClasses} ${expandedClasses}`.trim()
}
