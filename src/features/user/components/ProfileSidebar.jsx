import React from "react"
import { NavLink } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { User, GraduationCap, Building2, Settings } from "lucide-react"

const ProfileSidebar = ({ onClose, variant = "vertical" }) => {
  const { t } = useLanguage()

  const isHorizontal = variant === "horizontal"

  const getLinkClasses = ({ isActive }) => {
    if (isHorizontal) {
      return `relative flex items-center justify-center gap-2 p-3 mt-6 whitespace-nowrap transition-colors flex-1 min-w-fit ${
        isActive
          ? "font-medium text-cath-red-700 border-b-2 !border-b-cath-red-700"
          : "font-normal text-black hover:bg-gray-50 border-b-2"
      }`
    }

    return `relative flex w-full h-10 items-center gap-3 px-4 text-sm rounded-r-lg transition-colors mb-1 overflow-hidden ${
      isActive
        ? "font-medium bg-[#F2F2F2] hover:bg-[#E6E6E6] text-cath-red-700 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full before:w-[3px] before:bg-cath-red-700"
        : "font-normal text-black hover:bg-[#F2F2F2]"
    }`
  }

  const menuItems = [
    {
      label: t.profile?.sidebar?.personalInfo,
      path: "/profile",
      end: true,
      icon: User,
    },
    {
      label: t.profile?.sidebar?.instructor,
      path: "/instructor",
      end: false,
      icon: GraduationCap,
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
    },
  ].filter((item) => !item.isHidden)

  return (
    <div
      className={
        isHorizontal
          ? "flex overflow-x-auto hide-scrollbar"
          : "flex flex-col h-full text-gray-800"
      }
    >
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={getLinkClasses}
          onClick={onClose}
        >
          <item.icon size={isHorizontal ? 16 : 20} className="flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </div>
  )
}

export default ProfileSidebar
