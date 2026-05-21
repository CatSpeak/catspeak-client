import React, { useState } from "react"
import { Menu } from "lucide-react"
import HeaderLogo from "./HeaderLogo"
import DesktopNav from "@/features/navigation/components/DesktopNav/DesktopNav"
import MobileDrawer from "@/features/navigation/components/MobileNav/MobileDrawer"
import HeaderUserControls from "./HeaderUserControls"
import HeaderGuestControls from "./HeaderGuestControls"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import { useAuth } from "@/features/auth"

const HeaderBar = ({ onGetStarted }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <header className="sticky top-0 z-50 pb-4">
      <div
        className="mx-auto flex w-full min-h-[60px] border items-center gap-3 bg-white/80 py-2 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 sm:gap-4 sm:px-4 lg:min-h-[64px] lg:py-2.5 lg:px-5"
      >
        {/* Left Section: Burger (Mobile) + Logo */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <button
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            className="lg:hidden p-2 -ml-1 shrink-0 text-gray-700 transition-colors hover:bg-black/[0.06] rounded-full"
          >
            <Menu />
          </button>
          <div className="flex min-w-0 shrink-0 items-center lg:w-[160px]">
            <HeaderLogo />
          </div>
        </div>

        {/* Center Section: Desktop Nav */}
        <div className="hidden shrink-0 lg:block">
          <DesktopNav />
        </div>

        {/* Right Section: Controls */}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <div className="flex items-center gap-2 sm:gap-3">
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
