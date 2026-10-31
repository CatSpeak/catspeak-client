import React from "react"
import { Link } from "react-router-dom"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"
import { X } from "lucide-react"
import IconButton from "@/shared/components/ui/buttons/IconButton"
import useScrollLock from "@/shared/hooks/useScrollLock"
import MobileNavItems from "./MobileNavItems"

const MobileSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  // Lock background body scroll while the mobile drawer is open
  useScrollLock(isMobileOpen)

  return (
    <>
      {/* Mobile overlay - z-50 to cover sticky header (z-40) and floating buttons */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 min-[1280px]:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 h-full h-[100dvh] max-h-[100dvh] w-[320px] bg-white shadow-[4px_0_24px_rgba(0,0,0,0.08)] flex flex-col transition-transform duration-300 z-50 min-[1280px]:hidden overflow-hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo section */}
        <div className="flex items-center justify-between h-14 mx-2 shrink-0">
          <div className="flex items-center w-full h-full relative overflow-hidden">
            <Link
              to="/"
              className="flex items-center h-full flex-1"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="flex items-center justify-center shrink-0 w-[64px]">
                <img
                  src={IconLogo}
                  alt="Cat Speak"
                  className="h-10 w-10 shrink-0"
                />
              </div>
              <img
                src={MainLogo}
                alt="Cat Speak"
                className="h-6 w-auto shrink-0"
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
}

export default MobileSidebar
