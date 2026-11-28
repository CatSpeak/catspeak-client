import React, { useEffect } from "react"
import { createPortal } from "react-dom"
import { Link } from "react-router-dom"
import { MainLogo, MainLogoDark, IconLogo } from "@/shared/assets/icons/logo"
import { X } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import useScrollLock from "@/shared/hooks/useScrollLock"
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"
import MobileNavItems from "./MobileNavItems"

// Literal class maps so Tailwind can detect every variant at build time.
const HIDE_CLASS_BY_BREAKPOINT = {
  lg: "lg:hidden",
  xl: "xl:hidden",
}

const DESKTOP_QUERY_BY_BREAKPOINT = {
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
}

const MobileSidebar = ({ isMobileOpen, setIsMobileOpen, hideBreakpoint = "lg" }) => {
  const hideClass = HIDE_CLASS_BY_BREAKPOINT[hideBreakpoint] || "lg:hidden"
  const isDesktop = useMediaQuery(
    DESKTOP_QUERY_BY_BREAKPOINT[hideBreakpoint] || "(min-width: 1024px)",
  )

  // Auto-close the drawer when the viewport crosses into desktop layout.
  useEffect(() => {
    if (isDesktop && isMobileOpen) {
      setIsMobileOpen?.(false)
    }
  }, [isDesktop, isMobileOpen, setIsMobileOpen])

  // Lock background body scroll only while the drawer is actually visible.
  useScrollLock(isMobileOpen && !isDesktop)

  const content = (
    <>
      {/* Mobile overlay - z-[1300] to cover sticky header and all page sections */}
      {isMobileOpen && (
        <div
          className={`fixed inset-0 bg-black/50 z-[1300] ${hideClass} transition-opacity`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-full h-[100dvh] max-h-[100dvh] w-[320px] bg-white dark:bg-[#0F0F0F] border-r border-border dark:border-darkBorder shadow-[4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 z-[1300] ${hideClass} overflow-hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo section */}
        <div className="flex items-center justify-between h-14 px-1 shrink-0">
          <div className="flex items-center w-full h-full relative">
            <Link
              to="/"
              className="flex items-center gap-2 h-full flex-1 min-w-0 overflow-hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="flex items-center justify-center shrink-0 w-12 h-12">
                <img
                  src={IconLogo}
                  alt="Cat Speak"
                  className="h-10 w-10 shrink-0"
                />
              </div>

              <img
                src={MainLogo}
                alt="Cat Speak"
                className="h-6 w-auto shrink-0 dark:hidden"
              />
              <img
                src={MainLogoDark}
                alt="Cat Speak"
                className="h-6 w-auto shrink-0 hidden dark:block"
              />
            </Link>

            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setIsMobileOpen(false)}
              title="Close menu"
            >
              <X />
            </IconButton>
          </div>
        </div>

        {/* Navigation Items */}
        <MobileNavItems
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </aside>
    </>
  )

  if (typeof document !== "undefined") {
    return createPortal(content, document.body)
  }

  return content
}

export default MobileSidebar
