import React, { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import HeaderUserControls from "./HeaderUserControls"
import HeaderGuestControls from "./HeaderGuestControls"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import { useAuth } from "@/features/auth"

// Extracted Components
import CommunitySwitcher from "./CommunitySwitcher"
import OnlinePresence from "./OnlinePresence"
import HeaderSearchBar from "./HeaderSearchBar"
import HeaderFilter from "./HeaderFilter"
import { Link } from "react-router-dom"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"

const MainHeader = ({ onGetStarted, onMenuClick }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    if (onMenuClick) {
      onMenuClick()
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="flex w-full h-[64px] items-center justify-between px-4 lg:px-6">
        
        {/* Left Section: Mobile Menu + Community Switcher + Online count */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          <button
            onClick={handleDrawerToggle}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md shrink-0"
          >
            <Menu size={24} />
          </button>
          
          {/* Logo (Mobile Only) */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img src={IconLogo} alt="Cat Speak" className="h-7 w-7" />
            <img src={MainLogo} alt="Cat Speak" className="h-6 w-auto hidden sm:block" />
          </Link>

          {/* Community Switcher Dropdown */}
          <CommunitySwitcher />

          {/* Online User Count */}
          <OnlinePresence />
        </div>

        {/* Right Section: Search + Filter + Lang + User */}
        <div className="flex items-center justify-end gap-3 shrink-0">

          {/* Search */}
          <HeaderSearchBar />

          {/* Filter */}
          <HeaderFilter />

          {/* Language flag */}
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

    </header>
  )
}

export default MainHeader
