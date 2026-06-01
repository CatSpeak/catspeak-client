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
    `relative flex items-center gap-3 px-4 h-10 rounded-r-lg transition-colors mb-1 overflow-hidden ${isActive
      ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-cath-red-700 hover:text-cath-red-700 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-cath-red-700"
      : "hover:bg-[#F2F2F2] hover:text-gray-900"
    }`

  return (
    <aside className="hidden lg:block w-[320px] shrink-0 bg-white sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto z-40">
      <div className="flex flex-col h-full p-5 text-gray-800">
        <SidebarCommunityDropdown />

        <NavLink to={`/${currentLang}/home`} className={getLinkClasses}>
          <Home size={20} />
          <span className="text-sm">{t.nav?.home || "Home"}</span>
        </NavLink>

        <NavLink to={`/${currentLang}/community`} className={getLinkClasses}>
          <Users size={20} />
          <span className="text-sm">{t.nav?.rooms || "Rooms"}</span>
        </NavLink>

        <NavLink
          to={`/${currentLang}/cat-speak/news`}
          className={getLinkClasses}
        >
          <LayoutDashboard size={20} />
          <span className="text-sm">{t.catSpeak?.sidebar?.news || "News"}</span>
        </NavLink>

        <NavLink
          to={`/${currentLang}/cat-speak/mail`}
          className={getLinkClasses}
        >
          <Mail size={20} />
          <span className="text-sm">{t.catSpeak?.sidebar?.mail || "Mail"}</span>
        </NavLink>

        {/* <NavLink
          to={`/${currentLang}/cat-speak/calendar`}
          className={getLinkClasses}
        >
          <Calendar size={20} />
          <span className="text-sm">
            {t.catSpeak?.sidebar?.calendar || "Calendar"}
          </span>
        </NavLink> */}
      </div>
    </aside>
  )
}

export default MainSidebar
