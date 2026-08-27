import { useState } from "react"
import { Menu } from "lucide-react"

import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import { useAuth } from "@/features/auth"
import LandingHeaderLogo from "./LandingHeaderLogo"
import DesktopNav from "../LandingDesktopNav/DesktopNav"
import LandingHeaderGuestControls from "./LandingHeaderGuestControls"
import LandingHeaderUserControls from "./LandingHeaderUserControls"
import { MobileSidebar } from "@/features/navigation"

const LandingHeader = ({ onGetStarted }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <header className="sticky top-4 z-[60] flex justify-center w-full px-4">
      <div className="mx-auto flex w-full max-w-[1400px] min-h-[60px] min-[1280px]:min-h-[72px] items-center justify-between gap-3 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 py-2 px-4 min-[1280px]:px-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:gap-4 rounded-full border border-white/40">
        {/* Left Section: Burger (Mobile & Tablet < 1280px) + Logo */}
        <div className="flex min-w-0 flex-1 items-center justify-start gap-2">
          <button
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            className="min-[1280px]:hidden p-2 -ml-1 shrink-0 text-gray-700 transition-colors hover:bg-black/[0.06] rounded-full"
          >
            <Menu />
          </button>
          <div className="flex min-w-0 shrink-0 items-center min-[1280px]:w-[160px]">
            <LandingHeaderLogo />
          </div>
        </div>

        {/* Center Section: Desktop Nav (Screen >= 1280px) */}
        <div className="hidden shrink-0 min-[1280px]:block">
          <DesktopNav onRequestLogin={() => onGetStarted?.("login")} />
        </div>

        {/* Right Section: Controls */}
        <div className="flex min-w-0 flex-1 items-center justify-end">
          <div className="flex items-center gap-1">
            <div className="block">
              <LanguageSwitcher />
            </div>

            {isLoggedIn ? (
              <LandingHeaderUserControls />
            ) : (
              <LandingHeaderGuestControls onGetStarted={onGetStarted} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sidebar */}
      <MobileSidebar
        isMobileOpen={mobileOpen}
        setIsMobileOpen={setMobileOpen}
      />
    </header>
  )
}

export default LandingHeader
