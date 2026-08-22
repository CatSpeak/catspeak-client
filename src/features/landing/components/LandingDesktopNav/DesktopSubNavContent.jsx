import React, { useMemo } from "react"
import { NavLink, useParams, useLocation, useNavigate } from "react-router-dom"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useActiveLink } from "@/features/navigation/hooks/useActiveLink"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { LANGUAGE_CONFIG } from "@/features/navigation/config/languages"
import { getSwitchCommunityPath } from "@/shared/utils/navigation"

export const DesktopSubNavContent = ({ item, onItemClick }) => {
  const { subItems = [], groups = [] } = item || {}
  const { t } = useLanguage()
  const { checkIsActive, resolvePath, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()
  const { isTeacher } = useRoleOverride()
  const { lang } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Community language switcher logic
  const supportedCodes = useMemo(() => LANGUAGE_CONFIG.map((c) => c.code), [])

  const currentCommunity = useMemo(() => {
    if (supportedCodes.includes(lang)) {
      localStorage.setItem("communityLanguage", lang)
      return lang
    }
    return localStorage.getItem("communityLanguage") || "zh"
  }, [lang, supportedCodes])

  const handleCommunitySelect = (newCode) => {
    localStorage.setItem("communityLanguage", newCode)
    onItemClick?.()
    navigate(`/${newCode}/community`)
  }

  // Filter groups for role visibility & active language
  const visibleGroups = useMemo(() => {
    if (!groups || groups.length === 0) return []
    return groups
      .filter((group) => {
        if (group.roles && group.roles.includes("Teacher") && !isTeacher) {
          return false
        }
        return true
      })
      .map((group) => ({
        ...group,
        items: group.items.filter((sub) => {
          if (sub.lang && sub.lang !== currentLang) return false
          if (sub.isPrivate && !isAuthenticated) return false
          return true
        }),
      }))
      .filter((group) => group.items.length > 0)
  }, [groups, isTeacher, currentLang, isAuthenticated])

  const renderNavLink = (sub) => {
    const Icon = sub.icon
    const href = resolvePath(sub.path) || sub.path
    const label = t.nav?.[sub.key] || sub.key

    return (
      <NavLink
        key={sub.key}
        to={href}
        onClick={onItemClick}
        className="h-9 flex items-center gap-3 px-3 rounded-xl text-sm hover:bg-primaryBg hover:text-[#990011] transition-colors duration-150 no-underline whitespace-nowrap"
      >
        {Icon && <Icon size={20} className="shrink-0 opacity-75" />}
        <span className="truncate">{label}</span>
      </NavLink>
    )
  }

  // Native landing community language dropdown view inside shared viewport
  if (item?.key === "community") {
    return (
      <div className="flex flex-col gap-1 p-1 min-w-[200px] whitespace-nowrap">
        {LANGUAGE_CONFIG.map((config) => {
          if (config.code === "vi") return null
          const label =
            t.header?.countries?.[config.labelKey] ||
            config.fallbackLabel

          return (
            <button
              key={config.code}
              type="button"
              onClick={() => handleCommunitySelect(config.code)}
              className="h-9 flex items-center gap-3 px-3 rounded-xl text-sm text-black hover:bg-primaryBg hover:text-[#990011] transition-colors duration-150 text-left whitespace-nowrap cursor-pointer"
            >
              <span className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full border border-border opacity-75">
                <img
                  src={config.flag}
                  alt={label}
                  className="block h-full w-full object-cover"
                  draggable={false}
                />
              </span>
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  if (visibleGroups.length > 0) {
    return (
      <div
        className={`p-3 flex gap-4 ${
          visibleGroups.length > 1 ? "min-w-[480px]" : "min-w-[420px]"
        }`}
      >
        {visibleGroups.map((group) => {
          const groupTitle =
            t.nav?.[group.key] ||
            (group.key === "teaching" ? "Giảng dạy" : "Không gian cá nhân")

          return (
            <div key={group.key} className="flex-1 flex flex-col gap-1 min-w-0">
              <div className="h-9 flex items-center px-3 text-xs font-bold uppercase text-secondary select-none">
                {groupTitle}
              </div>
              {group.items.length > 5 && visibleGroups.length === 1 ? (
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map(renderNavLink)}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {group.items.map(renderNavLink)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-1 min-w-[200px]">
      {subItems
        .filter((sub) => {
          if (sub.lang && sub.lang !== currentLang) return false
          if (sub.isPrivate && !isAuthenticated) return false

          const teacherTabs = [
            "dashboard",
            "myCourses",
            "myClass",
            "analytics",
            "schedule",
            "teachingTasks",
            "manageMaterials",
          ]
          if (teacherTabs.includes(sub.key) && !isTeacher) return false

          return true
        })
        .map(renderNavLink)}
    </div>
  )
}
