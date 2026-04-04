import React, { useState } from "react"
import { Menu } from "lucide-react"
import HeaderLogo from "./HeaderLogo"
import DesktopNav from "@/features/navigation/components/DesktopNav/DesktopNav"
import MobileDrawer from "@/features/navigation/components/MobileNav/MobileDrawer"
import HeaderUserControls from "./HeaderUserControls"
import HeaderGuestControls from "./HeaderGuestControls"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import { useAuth } from "@/features/auth"

const HeaderBar = ({ onGetStarted, hideDesktopNav }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between w-full px-5 py-3 h-[72px]">
        {/* Left Section: Burger (Mobile) + Logo */}
        <div className="flex-1 flex justify-start items-center gap-2">
          <button
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            className="lg:hidden p-2 -ml-2 text-gray-700 hover:bg-black/5 rounded-full transition-colors"
          >
            <Menu />
          </button>
          {/* Logo with fixed width to prevent shrinking */}
          <div className="shrink-0 w-[160px] flex items-center">
            <HeaderLogo />
          </div>
        </div>

        {/* Center Section: Desktop Nav */}
        {!hideDesktopNav && (
          <div className="hidden lg:block">
            <DesktopNav />
          </div>
        )}

        {/* Right Section: Controls */}
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>

            {isLoggedIn ? (
              <HeaderUserControls />
            ) : (
              <HeaderGuestControls onGetStarted={onGetStarted} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer open={mobileOpen} onClose={handleDrawerToggle} />
    </header>
  )
}

export default HeaderBar
