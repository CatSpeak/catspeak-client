import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { useLocation } from "react-router-dom"

import { useAuth } from "@/features/auth"
import { useLanguage } from "@/shared/context/LanguageContext"
import { IconButton, PillButton } from "@/shared/components/ui/buttons"
import { ArrowRight } from "lucide-react"
import GuestSettingsControls from "@/shared/components/Header/GuestSettingsControls"
import LandingHeaderLogo from "./LandingHeaderLogo"
import LandingHeaderUserControls from "./LandingHeaderUserControls"
import { MobileSidebar } from "@/features/navigation"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"

const LandingHeader = ({ onGetStarted }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const { t } = useLanguage()
  const { pathname } = useLocation()
  const isContactPage = pathname === "/contact"
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
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

  const headerT = t?.landing?.header || {}
  const homePrefix = isContactPage ? "/" : ""
  const navItems = [
    {
      label: headerT.problem || "Vấn đề",
      href: `${homePrefix}#learning-barriers`,
    },
    {
      label: headerT.solution || "Giải pháp",
      href: `${homePrefix}#catspeak-solutions`,
    },
    {
      label: headerT.features || "Tính năng",
      href: `${homePrefix}#core-features`,
    },
    {
      label: headerT.howItWorks || "Cách hoạt động",
      href: `${homePrefix}#how-it-works`,
    },
    { label: headerT.faq || "FAQ", href: `${homePrefix}#faq` },
    { label: headerT.contact || "Liên hệ", href: "/contact", isContact: true },
  ]

  return (
    <header
      className={`sticky top-0 z-40 h-14 w-full transition-all duration-300 border-b border-border dark:border-darkBorder ${
        scrolled
          ? "bg-white/90 dark:bg-[#0F0F0F]/90 backdrop-blur-md shadow-sm"
          : "bg-white dark:bg-[#0F0F0F]"
      }`}
    >
      <div className="relative flex h-full w-full items-center justify-between px-1 xl:pl-4 xl:pr-1">
        <div className="flex items-center gap-2 shrink-0 z-10">
          <IconButton
            onClick={handleDrawerToggle}
            variant="ghost"
            className="xl:hidden"
            aria-label="open drawer"
          >
            <Menu />
          </IconButton>
          <div className="flex shrink-0 items-center">
            <LandingHeaderLogo />
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 -translate-x-1/2 hidden items-center gap-4 xl:gap-7 whitespace-nowrap text-sm text-[#292929] dark:text-gray-200 xl:flex"
        >
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              aria-current={
                isContactPage && href === "/contact" ? "page" : undefined
              }
              className={`transition-colors hover:text-[#990011] dark:hover:text-[#FF8599] ${
                isContactPage && href === "/contact"
                  ? "font-semibold text-[#A90016] underline underline-offset-8 dark:text-[#FF8599]"
                  : ""
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 z-10">
          {isLoggedIn ? (
            <>
              <ThemeToggle />
              <LandingHeaderUserControls />
            </>
          ) : (
            <>
              <GuestSettingsControls />
              <PillButton
                variant="primary"
                onClick={() => onGetStarted?.("register")}
                endIcon={<ArrowRight />}
              >
                {headerT.joinNow || "Tham gia ngay"}
              </PillButton>
            </>
          )}
        </div>
      </div>

      <MobileSidebar
        isMobileOpen={mobileOpen}
        setIsMobileOpen={setMobileOpen}
      />
    </header>
  )
}

export default LandingHeader
