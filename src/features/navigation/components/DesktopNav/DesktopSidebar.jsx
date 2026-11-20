import React, { useEffect, useRef, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion as Motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { M3_MOTION } from "@/shared/constants/motion"
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
      className={`w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer outline-none transition-colors duration-150 relative ${
        isActive
          ? "text-cath-red-700 dark:text-white"
          : "text-white/80 hover:text-white hover:bg-white/15 active:bg-white/25 dark:text-[#AAAAAA] dark:hover:text-white dark:hover:bg-[#272727] dark:active:bg-[#3D3D3D]"
      }`}
    >
      {isActive && (
        <Motion.div
          layoutId="activeDockIndicator"
          className="absolute inset-0 rounded-2xl bg-white shadow-md dark:bg-cath-red-700 dark:shadow-md z-0"
          transition={M3_MOTION.standard.spatial.fast}
        />
      )}
      <span className="relative z-10 flex items-center justify-center">
        {Icon && <Icon />}
      </span>
    </Link>

    {/* Tooltip on Hover */}
    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 dark:bg-[#1A1A1A] dark:border dark:border-[#3F3F3F] text-white text-xs font-semibold rounded opacity-0 invisible group-hover/dock:opacity-100 group-hover/dock:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none drop-shadow-md flex items-center">
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 dark:bg-[#1A1A1A] dark:border-b dark:border-l dark:border-[#3F3F3F] rotate-45 rounded-xs" />
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

  // Record last selected sublink on route change (guarded to avoid redundant context re-renders)
  useEffect(() => {
    const cleanPath = normalizePath(pathname)
    let section = null
    if (
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
    Boolean(currentSectionData?.items?.length) &&
    (!currentSectionData?.excludeLangs ||
      !currentSectionData.excludeLangs.includes(currentLang))

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
    return resolvePath(item.path)
  }

  // Determine if secondary sidebar panel should be open
  const isPanelOpen = isDesktopExpanded && currentHasSublinks
  const currentSectionKey = activeDockSection

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
      <div className="h-full w-[72px] bg-cath-red-700 dark:bg-[#0F0F0F] text-white flex flex-col items-center shrink-0 shadow-lg relative z-20 transition-colors duration-200 border-r border-border dark:border-darkBorder">
        {/* Brand Icon */}
        <div className="py-4 flex items-center justify-center relative z-10">
          <Link
            to="/"
            className="w-12 h-12 rounded-2xl flex items-center justify-center outline-none select-none cursor-pointer transition-colors duration-150 hover:bg-white/15 active:bg-white/25 dark:hover:bg-[#272727] dark:active:bg-[#3D3D3D]"
            title="CatSpeak Home"
          >
            <img
              src={LandingPageIcon}
              alt="Cat Speak"
              className="w-10 h-10 object-contain drop-shadow-sm rounded-full"
              draggable={false}
            />
          </Link>
        </div>

        {/* Dock Section Icons */}
        <LayoutGroup id="dock-sidebar">
          <div className="flex-1 flex flex-col gap-1 items-center w-full">
            {dockNavGroups.map((group, groupIdx) => {
              const visibleItems = group.items.filter((item) =>
                isNavItemVisible(item, { isStudent, currentLang }),
              )
              if (visibleItems.length === 0) return null

              return (
                <React.Fragment key={group.key}>
                  {groupIdx > 0 && (
                    <div className="w-8 h-[1px] bg-white/20 dark:bg-darkBorder shrink-0" />
                  )}
                  {visibleItems.map(renderDockItem)}
                </React.Fragment>
              )
            })}
          </div>

          {/* Bottom Dock Links (Footer) */}
          <div className="flex flex-col gap-1 items-center w-full">
            <div className="w-8 h-[1px] bg-white/20 dark:bg-darkBorder shrink-0" />
            {footerLinks.map((item) => (
              <DockButton
                key={item.key}
                to={getFooterLinkPath(item)}
                icon={item.icon}
                label={t.nav?.[item.key] || item.key}
                isActive={activeDockSection === item.key}
              />
            ))}
          </div>
        </LayoutGroup>
      </div>

      {/* 2. SECONDARY EXPANDABLE SIDEBAR PANEL */}
      <AnimatePresence initial={false}>
        {isPanelOpen && (
          <Motion.div
            initial={{ width: 0, opacity: 0, borderRightWidth: 0 }}
            animate={{ width: 280, opacity: 1, borderRightWidth: 1 }}
            exit={{
              width: 0,
              opacity: 0,
              borderRightWidth: 0,
              transition: {
                width: M3_MOTION.standard.spatial.fast,
                opacity: M3_MOTION.standard.effects.fast,
                borderRightWidth: { duration: 0.05 },
              },
            }}
            transition={{
              width: M3_MOTION.standard.spatial.fast,
              opacity: M3_MOTION.standard.effects.fast,
              borderRightWidth: { duration: 0.05 },
            }}
            className="h-full bg-white dark:bg-[#0F0F0F] border-r border-border dark:border-darkBorder overflow-hidden relative z-10 shrink-0"
          >
            <div className="w-[280px] h-full flex flex-col">
              {/* Secondary Header */}
              <div className="h-[56px] px-4 flex items-center shrink-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {t.nav?.[currentSectionData?.labelKey || activeDockSection] ||
                    currentSectionData?.defaultLabel ||
                    "Navigation"}
                </h2>
              </div>

              {/* Content Sub-Links: Stable, instant list without stagger flicker or duplicate-key collisions */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                {getVisibleGroupsForSection(currentSectionKey).map(
                  (group, groupIdx) => (
                    <React.Fragment key={`${currentSectionKey}-${group.key}`}>
                      {groupIdx > 0 && (
                        <div className="my-1 mx-2 h-px bg-border dark:bg-darkBorder shrink-0" />
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
