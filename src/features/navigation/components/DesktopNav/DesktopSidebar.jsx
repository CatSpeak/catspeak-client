import React, { useEffect, useRef, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion as Motion, AnimatePresence } from "framer-motion"
import { LandingPageIcon } from "@/features/landing/assets"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
import { useActiveLink } from "../../hooks/useActiveLink"
import { DEFAULT_COMMUNITY_LANG } from "@/shared/utils/navigation"
import {
  navSections,
  footerLinks,
  settingNavLinks,
  dockNavGroups,
  getActiveDockSection,
  isNavItemVisible,
} from "../../config/navigation"
import { Settings } from "lucide-react"
import DesktopNavItem from "./DesktopNavItem"
import ListItem from "@/shared/components/ui/ListItem"

const normalizePath = (path) => {
  if (!path) return path
  return path.replace(/^\/(?:zh|en|vi|ja)(?=\/|$)/, "")
}

const DockButton = ({ to, onClick, icon: Icon, label, isActive }) => (
  <div className="relative group/dock px-2 py-1">
    <Link
      to={to}
      onClick={onClick}
      className={`w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer outline-none transition-all duration-150 ${
        isActive
          ? "bg-white text-cath-red-700 shadow-md"
          : "text-white/80 hover:text-white hover:bg-white/15"
      }`}
    >
      {Icon && <Icon />}
    </Link>

    {/* Tooltip on Hover */}
    <div className="absolute left-full ml-6 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover/dock:opacity-100 group-hover/dock:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none drop-shadow-md flex items-center">
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-xs" />
      <span className="relative z-10">{label}</span>
    </div>
  </div>
)

const DesktopSidebar = () => {
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const { isStudent, isTeacher, activeRole } = useRoleOverride()
  const { resolvePath, currentLang } = useActiveLink()
  const {
    isDesktopExpanded,
    setIsDesktopExpanded,
    lastSublinks,
    setLastSublink,
  } = useSidebar()

  const activeDockSection = getActiveDockSection(pathname)

  const isSettingsPage =
    pathname.startsWith("/setting") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/refunds")

  // Record last selected sublink on route change (guarded to avoid redundant context re-renders)
  useEffect(() => {
    const cleanPath = normalizePath(pathname)
    let section = null
    if (
      pathname.startsWith("/setting") ||
      pathname.startsWith("/billing") ||
      pathname.startsWith("/refunds")
    ) {
      section = "settings"
    } else if (
      pathname.includes("/learning-path") ||
      pathname.includes("/placement-test")
    ) {
      section = "aiTutor"
    } else if (pathname.includes("/cat-speak")) {
      section = "catSpeak"
    } else if (pathname.includes("/workspace")) {
      section = "workspace"
    } else if (pathname.includes("/ai-tutor")) {
      section = "aiTutor"
    }

    if (section && lastSublinks?.[section] !== cleanPath) {
      setLastSublink(section, cleanPath)
    }
  }, [pathname, lastSublinks, setLastSublink])

  // Get current active section metadata
  const currentSectionData = navSections.find(
    (s) => s.key === activeDockSection,
  )
  const currentHasSublinks =
    activeDockSection === "settings" ||
    (Boolean(currentSectionData?.items?.length) &&
      (!currentSectionData?.excludeLangs ||
        !currentSectionData.excludeLangs.includes(currentLang)))

  // Auto-expand secondary sidebar panel when switching into a section with sublinks (guarded)
  const prevSectionRef = useRef(activeDockSection)
  useEffect(() => {
    if (prevSectionRef.current !== activeDockSection) {
      prevSectionRef.current = activeDockSection
      if (currentHasSublinks && !isDesktopExpanded) {
        setIsDesktopExpanded(true)
      }
    }
  }, [
    activeDockSection,
    currentHasSublinks,
    isDesktopExpanded,
    setIsDesktopExpanded,
  ])

  const handleDockClick = (item, e) => {
    if (activeDockSection === item.key) {
      if (item.hasSublinks) {
        e?.preventDefault()
        setIsDesktopExpanded((prev) => !prev)
      }
    } else {
      if (item.hasSublinks) {
        setIsDesktopExpanded(true)
      } else {
        setIsDesktopExpanded(false)
      }
    }
  }

  const getVisibleGroupsForSection = useCallback(
    (sectionKey) => {
      const sectionData = navSections.find((s) => s.key === sectionKey)
      if (!sectionData) return []
      if (
        sectionData.excludeLangs &&
        currentLang &&
        sectionData.excludeLangs.includes(currentLang)
      )
        return []

      const isSubVisible = (item) =>
        isNavItemVisible(item, {
          currentLang,
          isAuthenticated,
          activeRole,
          isTeacher,
        })

      if (sectionData.groups) {
        return sectionData.groups
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

      const legacyItems = (sectionData.items || []).filter(isSubVisible)

      return legacyItems.length > 0
        ? [{ key: "default", items: legacyItems }]
        : []
    },
    [currentLang, isAuthenticated, activeRole, isTeacher],
  )

  const getVisibleItemsForSection = useCallback(
    (sectionKey) => {
      return getVisibleGroupsForSection(sectionKey).flatMap((g) => g.items)
    },
    [getVisibleGroupsForSection],
  )

  const getDockItemPath = (item) => {
    const rememberedPath = lastSublinks?.[item.key]
    if (rememberedPath) {
      const visibleItems = getVisibleItemsForSection(item.key)
      const isRememberedPathValid = visibleItems.some((subItem) => {
        let subPath = subItem.path
        if (subItem.key === "profile" && user) {
          subPath = `/workspace/profile/${user.accountId || user.id || ""}`
        }
        return normalizePath(rememberedPath) === normalizePath(subPath)
      })

      if (isRememberedPathValid) {
        return resolvePath(rememberedPath)
      }
    }

    return resolvePath(item.path)
  }

  const getFooterLinkPath = (item) => {
    if (item.key === "settings" && lastSublinks?.settings) {
      const remembered = lastSublinks.settings
      if (
        remembered.startsWith("/setting") ||
        remembered.startsWith("/billing") ||
        remembered.startsWith("/refunds")
      ) {
        return resolvePath(remembered)
      }
    }
    return resolvePath(item.path)
  }

  // Determine if secondary sidebar panel should be open
  const isPanelOpen = isDesktopExpanded && currentHasSublinks
  const currentSectionKey = isSettingsPage ? "settings" : activeDockSection

  const renderDockItem = (item) => (
    <DockButton
      key={item.key}
      to={getDockItemPath(item)}
      onClick={(e) => handleDockClick(item, e)}
      icon={item.icon}
      label={t.nav?.[item.key] || item.key}
      isActive={activeDockSection === item.key}
    />
  )

  return (
    <aside
      className="hidden lg:flex sticky top-0 h-screen shrink-0 z-30 select-none"
      data-tour="main-sidebar"
    >
      {/* 1. PRIMARY SLIM DOCK (ALWAYS DOCKED - 72px) */}
      <div className="h-full bg-cath-red-700 text-white flex flex-col items-center shrink-0 shadow-lg relative z-20">
        {/* Brand Icon */}
        <Link
          to="/"
          className="flex items-center justify-center py-4"
          title="CatSpeak Home"
        >
          <img
            src={LandingPageIcon}
            alt="Cat Speak"
            className="w-10 h-10 object-contain drop-shadow-sm"
            draggable={false}
          />
        </Link>

        {/* Dock Section Icons */}
        <div className="flex-1 flex flex-col gap-1 items-center w-full">
          {dockNavGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) =>
              isNavItemVisible(item, { isStudent, currentLang }),
            )
            if (visibleItems.length === 0) return null

            return (
              <React.Fragment key={group.key}>
                {groupIdx > 0 && (
                  <div className="w-8 h-[1px] bg-white/20 shrink-0" />
                )}
                {visibleItems.map(renderDockItem)}
              </React.Fragment>
            )
          })}
        </div>

        {/* Bottom Dock Links (Settings / Footer) */}
        <div className="flex flex-col gap-1 items-center w-full">
          <div className="w-8 h-[1px] bg-white/20 shrink-0" />
          {footerLinks.map((item) => {
            const isSettingsItem = item.key === "settings"
            const isActive = isSettingsItem
              ? activeDockSection === "settings" || isSettingsPage
              : activeDockSection === item.key

            return (
              <DockButton
                key={item.key}
                to={getFooterLinkPath(item)}
                onClick={(e) => {
                  if (isSettingsItem) {
                    if (activeDockSection === "settings" || isSettingsPage) {
                      e.preventDefault()
                      setIsDesktopExpanded((prev) => !prev)
                    } else {
                      setIsDesktopExpanded(true)
                    }
                  }
                }}
                icon={item.icon || Settings}
                label={t.nav?.[item.key] || item.key}
                isActive={isActive}
              />
            )
          })}
        </div>
      </div>

      {/* 2. SECONDARY EXPANDABLE SIDEBAR PANEL */}
      <AnimatePresence initial={false}>
        {isPanelOpen && (
          <Motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{
              width: 0,
              opacity: 0,
              transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-white border-r border-border overflow-hidden relative z-10 shrink-0"
          >
            <div className="w-[280px] h-full flex flex-col">
              {/* Secondary Header */}
              <ListItem className="font-bold">
                <span className="truncate text-xl">
                  {isSettingsPage
                    ? t.nav?.settings || "Settings"
                    : t.nav?.[
                        currentSectionData?.labelKey || activeDockSection
                      ] ||
                      currentSectionData?.defaultLabel ||
                      "Navigation"}
                </span>
              </ListItem>

              {/* Content Sub-Links: Stable, instant list without stagger flicker or duplicate-key collisions */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col py-1">
                {isSettingsPage
                  ? settingNavLinks
                      .filter((item) =>
                        isNavItemVisible(item, {
                          currentLang,
                          isAuthenticated,
                          activeRole,
                        }),
                      )
                      .map((item) => {
                        const label =
                          t.nav?.[item.key] || item.label || item.key
                        return (
                          <DesktopNavItem
                            key={`settings-${item.key}`}
                            to={resolvePath(item.path)}
                            icon={item.icon}
                            label={label}
                            color={item.color}
                            img={item.img}
                            isDocked={false}
                            sectionId="settings"
                          />
                        )
                      })
                  : getVisibleGroupsForSection(currentSectionKey).map(
                      (group, groupIdx) => (
                        <React.Fragment
                          key={`${currentSectionKey}-${group.key}`}
                        >
                          {groupIdx > 0 && (
                            <div className="my-1 mx-2 h-px bg-border shrink-0" />
                          )}
                          {group.items.map((item) => {
                            const label =
                              t.nav?.[item.key] || item.label || item.key
                            let itemPath = item.path
                            if (item.key === "profile" && user) {
                              itemPath = `/workspace/profile/${user.accountId || user.id || ""}`
                            }
                            return (
                              <DesktopNavItem
                                key={`${currentSectionKey}-${item.key}`}
                                to={resolvePath(itemPath)}
                                icon={item.icon}
                                label={label}
                                color={item.color}
                                img={item.img}
                                isDocked={false}
                                sectionId={currentSectionKey}
                              />
                            )
                          })}
                        </React.Fragment>
                      ),
                    )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}

export default DesktopSidebar
