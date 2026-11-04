import { useState } from "react"
import { Menu } from "lucide-react"

import { useAuth } from "@/features/auth"
import ThemeToggle from "@/shared/components/ui/ThemeToggle"
import { useLanguage } from "@/shared/context/LanguageContext"
import LandingHeaderLogo from "./LandingHeaderLogo"
import LandingHeaderGuestControls from "./LandingHeaderGuestControls"
import LandingHeaderUserControls from "./LandingHeaderUserControls"
import { MobileSidebar } from "@/features/navigation"

const LandingHeader = ({ onGetStarted }) => {
  const { isAuthenticated: isLoggedIn } = useAuth()
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const headerT = t?.landing?.header || {}
  const navItems = [
    { label: headerT.problem || "Vấn đề", href: "#problem" },
    { label: headerT.solution || "Giải pháp", href: "#solutions" },
    { label: headerT.features || "Tính năng", href: "#features" },
    { label: headerT.howItWorks || "Cách hoạt động", href: "#how-it-works" },
    { label: headerT.faq || "FAQ", href: "#faq" },
    { label: headerT.contact || "Liên hệ", href: "#contact" },
  ]

  return (
    <header className="sticky top-0 z-[60] h-[72px] w-full border-b border-gray-100 bg-white dark:border-[#272727] dark:bg-[#0F0F0F]">
      <div className="mx-auto grid h-full w-full max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            className="shrink-0 rounded-full p-2 text-gray-700 transition-colors hover:bg-black/[0.06] dark:text-gray-200 min-[1024px]:hidden"
          >
            <Menu />
          </button>
          <div className="flex min-w-0 shrink-0 items-center">
            <LandingHeaderLogo />
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 whitespace-nowrap text-sm text-[#292929] dark:text-gray-200 min-[1024px]:flex"
        >
          {navItems.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="transition-colors hover:text-[#990011] dark:hover:text-[#FF8599]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <ThemeToggle
            className="!h-[38px] !w-[38px] !rounded-xl border border-gray-200 dark:border-[#3F3F3F]"
            innerClassName="!h-[36px] !w-[36px] !rounded-[11px] [&>svg]:!h-4 [&>svg]:!w-4"
          />
          {isLoggedIn ? (
            <LandingHeaderUserControls />
          ) : (
            <LandingHeaderGuestControls
              onGetStarted={onGetStarted}
              label={headerT.joinNow || "Tham gia ngay"}
            />
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
