import React from "react"
import { useSidebar } from "@/shared/context/SidebarContext"

/**
 * Shared reusable FloatingActionDock component.
 * Automatically aligns with the dashboard layout and offsets from the desktop sidebar.
 *
 * @param {React.ReactNode} children - Direct children inside the dock.
 * @param {React.ReactNode} leftContent - Optional left-aligned content.
 * @param {React.ReactNode} rightContent - Optional right-aligned content.
 * @param {string} className - Optional outer wrapper styling overrides.
 * @param {string} innerClassName - Optional inner container styling overrides.
 */
const FloatingActionDock = ({
  children,
  leftContent,
  rightContent,
  className = "",
  innerClassName = "",
  ...props
}) => {
  const { isDesktopExpanded } = useSidebar()
  const sidebarOffset = isDesktopExpanded ? "lg:left-[352px]" : "lg:left-[72px]"

  return (
    <div
      className={`fixed bottom-6 right-0 z-40 px-4 sm:px-6 pointer-events-none transition-all duration-200 left-0 ${sidebarOffset} ${className}`}
      {...props}
    >
      <div
        className={`w-full pointer-events-auto bg-white/95 backdrop-blur-md border border-border rounded-xl p-4 flex items-center justify-between ${innerClassName}`}
      >
        {children ? (
          children
        ) : (
          <>
            <div>{leftContent || <div />}</div>
            <div>{rightContent}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default FloatingActionDock
