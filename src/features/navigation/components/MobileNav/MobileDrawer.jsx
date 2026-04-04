import React from "react"
import { createPortal } from "react-dom"
import { NavLink, useParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import { FluentAnimation } from "@/shared/components/ui/animations"
import LanguageSwitcher from "@/shared/components/ui/LanguageSwitcher"
import SidebarCommunityDropdown from "@/layouts/MainLayout/SidebarCommunityDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"
import useScrollLock from "@/shared/hooks/useScrollLock"
import {
  X,
  Users,
  LayoutDashboard,
  Mail,
  Calendar,
  Home,
} from "lucide-react"

const MobileDrawer = ({ open, onClose }) => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const currentLang = lang || localStorage.getItem("communityLanguage") || "zh"

  useScrollLock(open)

  // Active style helper — matches MainSidebar
  const getLinkClasses = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 h-10 rounded-r-lg transition-colors mb-1 overflow-hidden ${
      isActive
        ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-[#990011] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-[#990011]"
        : "hover:bg-[#F2F2F2]"
    }`

  const handleNavClick = () => {
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[2000] lg:hidden pointer-events-none">
      {/* Backdrop - renders instantly and unmounts instantly */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer - animates in and out */}
      <AnimatePresence>
        {open && (
          <FluentAnimation
            direction="right"
            distance="100%"
            exit={true}
            className="fixed inset-y-0 left-0 z-[101] w-full min-[426px]:w-[320px] h-full pointer-events-auto"
          >
            <aside className="w-full h-full bg-white overflow-y-auto">
              <div className="flex flex-col p-5 text-gray-800">
                {/* Header: Close Button & Language Switcher */}
                <div className="flex justify-between items-center mb-5">
                  <button
                    onClick={onClose}
                    className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X />
                  </button>
                  <LanguageSwitcher />
                </div>

                {/* Community Switching Dropdown */}
                <SidebarCommunityDropdown />

                {/* Navigation Links — mirrors MainSidebar */}
                <nav className="flex flex-col">
                  <NavLink
                    to={`/${currentLang}/home`}
                    className={getLinkClasses}
                    onClick={handleNavClick}
                  >
                    <Home className="w-5 h-5" />
                    <span className="text-sm">{t.nav?.home || "Home"}</span>
                  </NavLink>

                  <NavLink
                    to={`/${currentLang}/community`}
                    className={getLinkClasses}
                    onClick={handleNavClick}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm">{t.nav?.rooms || "Rooms"}</span>
                  </NavLink>

                  <NavLink
                    to={`/${currentLang}/cat-speak/news`}
                    className={getLinkClasses}
                    onClick={handleNavClick}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="text-sm">
                      {t.catSpeak?.sidebar?.news || "News"}
                    </span>
                  </NavLink>

                  <NavLink
                    to={`/${currentLang}/cat-speak/mail`}
                    className={getLinkClasses}
                    onClick={handleNavClick}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">
                      {t.catSpeak?.sidebar?.mail || "Mail"}
                    </span>
                  </NavLink>

                  <NavLink
                    to={`/${currentLang}/cat-speak/schedules`}
                    className={getLinkClasses}
                    onClick={handleNavClick}
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">
                      {t.catSpeak?.sidebar?.schedules || "Schedules"}
                    </span>
                  </NavLink>
                </nav>
              </div>
            </aside>
          </FluentAnimation>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

export default MobileDrawer
