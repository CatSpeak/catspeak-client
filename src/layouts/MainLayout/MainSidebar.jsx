import React from "react"
import { NavLink, useParams } from "react-router-dom"
import { Users, LayoutDashboard, Mail, Calendar, Home } from "lucide-react"
import MobileNavLinks from "@/features/navigation/components/MobileNav/MobileNavLinks"
import SidebarCommunityDropdown from "./SidebarCommunityDropdown"
import { useLanguage } from "@/shared/context/LanguageContext"

const MainSidebar = () => {
  const { t } = useLanguage()
  const { lang } = useParams()
  const currentLang = lang || localStorage.getItem("communityLanguage") || "zh"

  // Active style helper for independent links
  const getLinkClasses = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 h-10 rounded-r-lg transition-colors mb-1 overflow-hidden ${
      isActive
        ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-[#990011] hover:text-[#990011] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-[#990011]"
        : "hover:bg-[#F2F2F2] hover:text-gray-900"
    }`

  return (
    <aside className="hidden lg:block w-[320px] shrink-0 bg-white sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto z-40">
      <div className="flex flex-col h-full p-5 text-gray-800">
        <SidebarCommunityDropdown />

        <NavLink to={`/${currentLang}/home`} className={getLinkClasses}>
          <Home className="w-5 h-5" />
          <span className="text-sm">{t.nav?.home || "Home"}</span>
        </NavLink>

        <NavLink to={`/${currentLang}/community`} className={getLinkClasses}>
          <Users className="w-5 h-5" />
          <span className="text-sm">{t.nav?.rooms || "Rooms"}</span>
        </NavLink>

        <NavLink
          to={`/${currentLang}/cat-speak/news`}
          className={getLinkClasses}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm">{t.catSpeak?.sidebar?.news || "News"}</span>
        </NavLink>

        <NavLink
          to={`/${currentLang}/cat-speak/mail`}
          className={getLinkClasses}
        >
          <Mail className="w-5 h-5" />
          <span className="text-sm">{t.catSpeak?.sidebar?.mail || "Mail"}</span>
        </NavLink>

        <NavLink
          to={`/${currentLang}/cat-speak/schedules`}
          className={getLinkClasses}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm">
            {t.catSpeak?.sidebar?.schedules || "Schedules"}
          </span>
        </NavLink>
      </div>
    </aside>
  )
}

export default MainSidebar
