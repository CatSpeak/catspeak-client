import React from "react"
import { NavLink } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { User, GraduationCap, Building2, Settings } from "lucide-react"

const ProfileSidebar = () => {
  const { t } = useLanguage()

  const getLinkClasses = ({ isActive }) =>
    `relative flex w-full items-center gap-3 px-4 h-10 rounded-r-lg transition-colors mb-1 overflow-hidden ${
      isActive
        ? "bg-[#F2F2F2] hover:bg-[#E6E6E6] text-[#990011] hover:text-[#990011] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-[#990011]"
        : "text-gray-800 hover:text-gray-900 hover:bg-[#F2F2F2]"
    }`

  const menuItems = [
    {
      label: t.profile?.sidebar?.personalInfo,
      path: "/profile",
      end: true,
      icon: User,
    },
    {
      label: t.profile?.sidebar?.lecturer,
      path: "/lecturer",
      end: false,
      icon: GraduationCap,
      isHidden: true,
    },
    {
      label: t.profile?.sidebar?.organization,
      path: "/organization",
      end: false,
      icon: Building2,
      isHidden: true,
    },
    {
      label: t.profile?.sidebar?.setting,
      path: "/setting",
      end: false,
      icon: Settings,
      isHidden: true,
    },
  ].filter((item) => !item.isHidden)

  return (
    <div className="flex flex-col h-full text-gray-800">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={getLinkClasses}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-sm">{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default ProfileSidebar
