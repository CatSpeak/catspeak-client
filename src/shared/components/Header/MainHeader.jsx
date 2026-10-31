import React, { useState, useEffect } from "react"
import { Menu, LayoutGrid } from "lucide-react"
import HeaderUserControls from "./HeaderUserControls"
import HeaderGuestControls from "./HeaderGuestControls"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"
import { useAuth } from "@/features/auth"

// Extracted Components
import CommunitySwitcher from "./CommunitySwitcher"
import OnlinePresence from "./OnlinePresence"
import HeaderSearchBar from "./HeaderSearchBar"
import { Link, useLocation } from "react-router-dom"
import { MainLogo, IconLogo } from "@/shared/assets/icons/logo"

const MainHeader = ({ onGetStarted, onMenuClick, showSidebar = true }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)

  const handleDrawerToggle = () => {
    if (onMenuClick) {
      onMenuClick()
    }
  }

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 h-14 transition-all duration-300 border-b border-border dark:border-[#3F3F3F] ${
        scrolled
          ? "bg-white/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-[#0F0F0F]"
      }`}
    >
      <div className="flex w-full h-full items-center justify-between px-4">
        {/* Left Section: Mobile Menu + Community Switcher + Online count */}
        <div className="flex items-center gap-2 shrink-0">
          {showSidebar && (
            <button
              onClick={handleDrawerToggle}
              className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-[#AAAAAA] hover:bg-gray-100 dark:hover:bg-[#272727] rounded-md shrink-0 cursor-pointer"
            >
              <Menu />
            </button>
          )}

          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-2 ${
              showSidebar ? "lg:hidden" : "flex"
            }`}
          >
            <img src={IconLogo} alt="Cat Speak" className="h-7 w-7" />
            <img
              src={MainLogo}
              alt="Cat Speak"
              className="h-6 w-auto hidden sm:block"
            />
          </Link>

          {/* Learning path title or Community Switcher */}
          {location.pathname.includes("/learning-path") ? (
            <div className="hidden lg:flex items-center gap-2.5">
              <LayoutGrid className="w-5 h-5 text-cath-red-700" />
              <span className="text-base font-bold text-gray-900 tracking-tight">
                Lộ trình 5 ngày
              </span>
            </div>
          ) : (
            <>
              {/* Community Switcher Dropdown (Desktop only, drawer handles mobile/tablet) */}
              {showSidebar && (
                <div className="hidden lg:block" data-tour="community-switcher">
                  <CommunitySwitcher />
                </div>
              )}

              {/* Online User Count */}
              <OnlinePresence />
            </>
          )}
        </div>

        {/* Right Section: Search + Filter + Lang + User */}
        {/* min-w-0 + flex-1: ô tìm kiếm co lại thay vì đẩy chuông/chat/avatar ra ngoài mép (BUG-PT-17) */}
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {/* Search */}
          <div data-tour="header-search-filter">
            <HeaderSearchBar />
          </div>

          {/* Language flag */}
          <div className="hidden lg:block" data-tour="language-switcher">
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

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
