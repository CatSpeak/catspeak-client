import React, { useState, useEffect } from "react"
import { Settings, ChevronRight, ChevronLeft, Globe, Users } from "lucide-react"
import { useLanguage } from "@/shared/context/LanguageContext"
import DesktopNavItem from "../DesktopNav/DesktopNavItem"
import {
  navLinks,
  footerLinks,
  settingNavLinks,
  isNavItemVisible,
} from "../../config/navigation"
import { useActiveLink } from "../../hooks/useActiveLink"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useAuth } from "@/features/auth"
import ListItem from "@/shared/components/ui/ListItem"
import MobileCommunitySwitcher, {
  MobileCommunityContent,
} from "./MobileCommunitySwitcher"
import MobileLanguageSwitcher, {
  MobileLanguageContent,
} from "./MobileLanguageSwitcher"

const NavIcon = ({ img, icon: Icon, color, size = 24 }) => {
  const [imgError, setImgError] = useState(false)
  const [prevImg, setPrevImg] = useState(img)

  if (prevImg !== img) {
    setPrevImg(img)
    setImgError(false)
  }

  const IconComponent = Icon || Globe

  if (img && !imgError) {
    return (
      <img
        src={img}
        alt=""
        onError={() => setImgError(true)}
        className="w-6 h-6 object-contain shrink-0 rounded-sm"
      />
    )
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={1.5}
      className="shrink-0"
      style={color ? { color } : undefined}
    />
  )
}

const MobileNavItems = ({
  isMobileOpen,
  setIsMobileOpen,
  isHorizontal = false,
}) => {
  const { t } = useLanguage()
  const { isTeacher, activeRole } = useRoleOverride()
  const { resolvePath, checkIsActive, pathname, currentLang } = useActiveLink()
  const { isAuthenticated } = useAuth()
  const [activeDrilldownItem, setActiveDrilldownItem] = useState(null)
  const { user } = useAuth()
  const userId = user?.accountId || user?.id || ""

  const communityNavItem = {
    key: "communitySwitcher",
    labelKey: "community",
    defaultLabel: "Community",
    label: t.header?.community || "Cộng đồng",
    icon: Users,
  }

  const languageNavItem = {
    key: "languageSwitcher",
    labelKey: "language",
    defaultLabel: "Language",
    label: t.header?.language || "Ngôn ngữ",
    icon: Globe,
  }

  const settingNavItem = {
    key: "settings",
    labelKey: "settings",
    defaultLabel: "Settings",
    icon: Settings,
    hasDropdown: true,
    subItems: settingNavLinks,
  }

  // Sync drilldown state when drawer opens or when navigating
  const isSettings =
    pathname.startsWith("/setting") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/refunds")

  useEffect(() => {
    if (isSettings) {
      if (isMobileOpen) {
        setActiveDrilldownItem(settingNavItem)
      } else {
        const timer = setTimeout(() => {
          setActiveDrilldownItem(settingNavItem)
        }, 300)
        return () => clearTimeout(timer)
      }
      return
    }

    const activeItem = navLinks.find(
      (item) =>
        item.hasDropdown &&
        (item.subItems?.length > 0 || item.groups?.length > 0) &&
        checkIsActive(item),
    )

    if (isMobileOpen) {
      setActiveDrilldownItem(activeItem || null)
    } else {
      const timer = setTimeout(() => {
        setActiveDrilldownItem(activeItem || null)
      }, 300)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileOpen, pathname])

  const getVisibleGroupsForDrilldown = (item) => {
    if (!item) return []

    const isSubVisible = (sub) =>
      isNavItemVisible(sub, {
        currentLang,
        isHorizontal,
        isAuthenticated,
        activeRole,
        isTeacher,
      })

    if (item.groups) {
      return item.groups
        .filter((group) => {
          if (group.roles && group.roles.includes("Teacher") && !isTeacher) {
            return false
          }
          return true
        })
        .map((group) => ({
          ...group,
          items: group.items.filter(isSubVisible),
        }))
        .filter((group) => group.items.length > 0)
    }

    const legacySubs = (item.subItems || []).filter(isSubVisible)

    return legacySubs.length > 0 ? [{ key: "default", items: legacySubs }] : []
  }

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col w-full h-full">
      {/* ============================================================ */}
      {/* DRAWER PAGE 1: MAIN ROOT VIEW                                */}
      {/* Initial menu page (Community Switcher, Nav Links, Footers).   */}
      {/* Slides left (-translate-x-full) when a subpage is opened.     */}
      {/* ============================================================ */}
      <div
        className={`absolute inset-0 w-full h-full bg-white dark:bg-[#0F0F0F] flex flex-col transition-transform duration-300 ${activeDrilldownItem ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="shrink-0 border-b border-border dark:border-[#3F3F3F]">
          <MobileCommunitySwitcher
            onOpen={() => setActiveDrilldownItem(communityNavItem)}
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-none scrollbar-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navLinks
            .filter((item) =>
              item.isHorizontalBar
                ? true
                : isNavItemVisible(item, {
                    currentLang,
                    isHorizontal,
                    isAuthenticated,
                    isTeacher,
                  }),
            )
            .map((item) => {
              if (item.isHorizontalBar) {
                return (
                  <div
                    key={item.key}
                    className="border-t border-border dark:border-[#3F3F3F]"
                  />
                )
              }
              const label = t.nav?.[item.key] || item.label || item.key
              const IconComponent = item.icon || Globe

              if (
                item.hasDropdown &&
                ((item.subItems && item.subItems.length > 0) ||
                  (item.groups && item.groups.length > 0))
              ) {
                return (
                  <ListItem
                    key={item.key}
                    selected={checkIsActive(item)}
                    onClick={() => setActiveDrilldownItem(item)}
                    leftContent={
                      <NavIcon
                        img={item.img}
                        icon={IconComponent}
                        color={item.color}
                      />
                    }
                    rightContent={
                      <ChevronRight className="shrink-0 text-gray-400 dark:text-neutral-500" />
                    }
                    className="transition-all duration-200 w-full"
                    contentClassName={`transition-all duration-200 px-4 ${
                      checkIsActive(item)
                        ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#272727] hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={label}
                  >
                    <span
                      className="text-base text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate text-gray-800 dark:text-neutral-200"
                      style={item.color ? { color: item.color } : undefined}
                    >
                      {label}
                    </span>
                  </ListItem>
                )
              }

              return (
                <DesktopNavItem
                  key={item.key}
                  to={resolvePath(item.path)}
                  icon={IconComponent}
                  label={label}
                  color={item.color}
                  img={item.img}
                  onClick={() => setIsMobileOpen?.(false)}
                />
              )
            })}
        </div>

        <div className="pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] flex flex-col mt-auto border-t border-border dark:border-[#3F3F3F] shrink-0">
          <MobileLanguageSwitcher
            onOpen={() => setActiveDrilldownItem(languageNavItem)}
          />
          {footerLinks.map((item) => {
            const label = t.nav?.[item.key] || item.label || item.key
            const IconComponent = item.icon || Settings

            if (item.key === "settings") {
              return (
                <ListItem
                  key={item.key}
                  selected={isSettings}
                  onClick={() => setActiveDrilldownItem(settingNavItem)}
                  leftContent={
                    <NavIcon
                      img={item.img}
                      icon={IconComponent}
                      color={item.color}
                    />
                  }
                  rightContent={
                    <ChevronRight className="shrink-0 text-gray-400 dark:text-neutral-500" />
                  }
                  className="transition-all duration-200 w-full"
                  contentClassName={`transition-all duration-200 px-4 ${
                    isSettings
                      ? "bg-itemActive dark:bg-[#272727] hover:bg-itemActiveHover dark:hover:bg-[#3D3D3D] text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#272727] hover:text-gray-900 dark:hover:text-white"
                  }`}
                  title={label}
                >
                  <span className="text-base text-left whitespace-nowrap transition-all duration-300 min-w-0 flex-1 truncate text-gray-800 dark:text-neutral-200">
                    {label}
                  </span>
                </ListItem>
              )
            }

            return (
              <DesktopNavItem
                key={item.key}
                to={resolvePath(item.path)}
                icon={IconComponent}
                label={label}
                color={item.color}
                img={item.img}
                onClick={() => setIsMobileOpen?.(false)}
              />
            )
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DRAWER PAGE 2: DRILLDOWN / SUBPAGE VIEW                      */}
      {/* Submenu page (Cat Speak, Community, Settings, AI Tutor, etc.)*/}
      {/* Slides in from right (translate-x-0) when item is opened.     */}
      {/* ============================================================ */}
      <div
        className={`absolute inset-0 w-full h-full bg-white dark:bg-[#0F0F0F] flex flex-col transition-transform duration-300 ${activeDrilldownItem ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drilldown Header */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setActiveDrilldownItem(null)}
            className="flex items-center w-full px-4 h-14 gap-4 text-gray-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-[#272727] active:bg-neutral-200 dark:active:bg-[#333333] transition-colors cursor-pointer"
            title={
              activeDrilldownItem
                ? t.nav?.[activeDrilldownItem.key] ||
                  activeDrilldownItem.label ||
                  activeDrilldownItem.key
                : undefined
            }
          >
            <ChevronLeft className="shrink-0 text-gray-700 dark:text-neutral-300" />
            {activeDrilldownItem && (
              <span
                className="font-bold text-xl text-gray-900 dark:text-white truncate max-w-[80%]"
                style={
                  activeDrilldownItem.color
                    ? { color: activeDrilldownItem.color }
                    : undefined
                }
              >
                {t.nav?.[activeDrilldownItem.key] ||
                  activeDrilldownItem.label ||
                  activeDrilldownItem.key}
              </span>
            )}
          </button>
        </div>

        {/* Drilldown Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(2rem+env(safe-area-inset-bottom,0px))] flex flex-col scrollbar-none scrollbar-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {activeDrilldownItem?.key === "communitySwitcher" ? (
            <MobileCommunityContent
              onSelect={() => {
                setActiveDrilldownItem(null)
                setIsMobileOpen?.(false)
              }}
            />
          ) : activeDrilldownItem?.key === "languageSwitcher" ? (
            <MobileLanguageContent
              onSelect={() => {
                setActiveDrilldownItem(null)
                setIsMobileOpen?.(false)
              }}
            />
          ) : (
            getVisibleGroupsForDrilldown(activeDrilldownItem).map(
              (group, groupIdx) => (
                <React.Fragment key={group.key}>
                  {groupIdx > 0 && (
                    <div className="my-1 mx-3 h-px bg-border dark:bg-[#3F3F3F] shrink-0" />
                  )}
                  {group.items.map((sub) => {
                    const subLabel = t.nav?.[sub.key] || sub.key || sub.label
                    const SubIconComponent = sub.icon || Globe
                    let subPath = sub.path
                    if (sub.key === "profile" && userId) {
                      subPath = `/workspace/profile/${userId}`
                    }

                    return (
                      <div key={sub.key} className="w-full">
                        <DesktopNavItem
                          to={resolvePath(subPath)}
                          icon={SubIconComponent}
                          label={subLabel}
                          color={sub.color}
                          img={sub.img}
                          onClick={() => setIsMobileOpen?.(false)}
                        />
                      </div>
                    )
                  })}
                </React.Fragment>
              ),
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileNavItems
