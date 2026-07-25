import React, { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { LandingPageIcon } from "@/features/landing/assets"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useGetConversationsQuery } from "@/store/api/social/conversationsApi"
import { selectTotalUnread } from "@/store/slices/notificationSlice"
import { useActiveLink } from "../../hooks/useActiveLink"
import {
  navSections,
  footerLinks,
  settingNavLinks,
} from "../../config/navigation"
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Globe,
  Settings,
  MessageCircle,
} from "lucide-react"
import DesktopNavItem from "./DesktopNavItem"

// Primary Dock Navigation Items
const dockItems = [
  { key: "community", icon: Home, path: "/community", hasSublinks: false },
  {
    key: "learningResources",
    icon: Globe,
    path: "/resources",
    hasSublinks: false,
  },
  {
    key: "messages",
    icon: MessageCircle,
    path: "/chat",
    hasSublinks: false,
  },
  {
    key: "catSpeak",
    icon: LayoutDashboard,
    path: "/cat-speak/news",
    hasSublinks: true,
  },
  {
    key: "workspace",
    icon: Briefcase,
    path: "/workspace/courses",
    hasSublinks: true,
  },
]

const DesktopSidebar = () => {
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { resolvePath, currentLang } = useActiveLink()
  const {
    activeDockSection,
    setActiveDockSection,
    isDesktopExpanded,
    setIsDesktopExpanded,
  } = useSidebar()

  // Unread chat messages counter
  const { data: conversations = [] } = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
  })
  const totalUnreadCountRedux = useSelector(selectTotalUnread)
  const totalUnreadCountServer = conversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0,
  )
  const unreadChatCount = totalUnreadCountServer || totalUnreadCountRedux || 0

  const isSettingsPage = pathname.includes("/setting")

  // Auto-sync active dock item with current route
  useEffect(() => {
    if (pathname.includes("/setting")) {
      setActiveDockSection("settings")
    } else if (
      pathname.includes("/cat-speak/news") ||
      pathname.includes("/cat-speak/reels") ||
      pathname.includes("/cat-speak/letters") ||
      pathname.includes("/cat-speak/calendar")
    ) {
      setActiveDockSection("catSpeak")
    } else if (
      pathname.includes("/workspace") ||
      pathname.includes("/profile")
    ) {
      setActiveDockSection("workspace")
    } else if (pathname.includes("/chat")) {
      setActiveDockSection("messages")
    } else if (pathname.includes("/resources")) {
      setActiveDockSection("learningResources")
    } else if (pathname.includes("/community")) {
      setActiveDockSection("community")
    }
  }, [pathname, setActiveDockSection])

  // Get current active section metadata
  const currentSectionData = navSections.find(
    (s) => s.key === activeDockSection,
  )
  const currentHasSublinks =
    activeDockSection === "settings" ||
    Boolean(currentSectionData?.items?.length)

  const handleDockClick = (item) => {
    if (item.hasSublinks) {
      if (activeDockSection === item.key && isDesktopExpanded) {
        setIsDesktopExpanded(false)
      } else {
        setActiveDockSection(item.key)
        setIsDesktopExpanded(true)
      }
    } else {
      setActiveDockSection(item.key)
      setIsDesktopExpanded(false)
    }
  }

  // Determine if secondary sidebar panel should be open
  const isPanelOpen = isDesktopExpanded && currentHasSublinks

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen shrink-0 z-30 select-none">
      {/* 1. PRIMARY SLIM DOCK (ALWAYS DOCKED - 72px) */}
      <div className="w-[72px] h-full bg-cath-red-700 text-white flex flex-col items-center py-4 shrink-0 shadow-lg relative z-20">
        {/* Brand Icon */}
        <Link
          to="/"
          className="mb-6 flex items-center justify-center"
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
        <div className="flex-1 flex flex-col gap-3 w-full px-3">
          {dockItems.map((item) => {
            const Icon = item.icon
            const isActive = activeDockSection === item.key
            const label = t.nav?.[item.key] || item.key
            const targetPath = resolvePath(item.path)

            return (
              <div key={item.key} className="relative group/dock">
                <Link
                  to={targetPath}
                  onClick={() => handleDockClick(item)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-cath-red-700 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  }`}
                >
                  <Icon />
                  {item.key === "messages" && unreadChatCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border-2 border-cath-red-700">
                      {unreadChatCount > 99 ? "99+" : unreadChatCount}
                    </span>
                  )}
                </Link>

                {/* Tooltip on Hover */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover/dock:opacity-100 group-hover/dock:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Dock Links (Settings / Footer) */}
        <div className="flex flex-col gap-3 w-full px-3 pt-4 border-t border-white/20">
          {footerLinks.map((item) => {
            const Icon = item.icon || Settings
            const isActive =
              activeDockSection === item.key ||
              (item.key === "settings" && isSettingsPage)
            const label = t.nav?.[item.key] || item.key
            const targetPath = resolvePath(item.path)

            return (
              <div key={item.key} className="relative group/dock">
                <Link
                  to={targetPath}
                  onClick={() => {
                    if (activeDockSection === item.key && isDesktopExpanded) {
                      setIsDesktopExpanded(false)
                    } else {
                      setActiveDockSection(item.key)
                      setIsDesktopExpanded(true)
                    }
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-cath-red-700 shadow-md scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                  }`}
                >
                  <Icon />
                </Link>

                {/* Tooltip on Hover */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-md opacity-0 invisible group-hover/dock:opacity-100 group-hover/dock:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none shadow-lg">
                  {label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. SECONDARY EXPANDABLE SIDEBAR PANEL (256px) */}
      <div
        className={`h-full bg-white border-r border-border flex flex-col gap-1 transition-all duration-300 overflow-hidden relative z-10 ${
          isPanelOpen
            ? "w-[256px] px-4 opacity-100"
            : "w-0 px-0 opacity-0 border-none"
        }`}
      >
        {/* Secondary Header */}
        <div className="h-[64px] flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-bold truncate">
              {isSettingsPage
                ? t.nav?.settings || "Settings"
                : currentSectionData?.defaultLabel ||
                  t.nav?.[activeDockSection] ||
                  "Navigation"}
            </span>
          </div>
        </div>

        {/* Content Sub-Links */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
          {isSettingsPage
            ? settingNavLinks
                .filter((item) => {
                  if (item.hideInSidebar) return false
                  if (item.lang && item.lang !== currentLang) return false
                  if (item.isPrivate && !isAuthenticated) return false
                  return true
                })
                .map((item) => {
                  const label = t.nav?.[item.key] || item.label || item.key
                  return (
                    <DesktopNavItem
                      key={item.key}
                      to={resolvePath(item.path)}
                      icon={item.icon}
                      label={label}
                      color={item.color}
                      img={item.img}
                      isDocked={false}
                    />
                  )
                })
            : (currentSectionData?.items || [])
                .filter((item) => {
                  if (item.hideInSidebar) return false
                  if (item.lang && item.lang !== currentLang) return false
                  if (item.isPrivate && !isAuthenticated) return false
                  return true
                })
                .map((item) => {
                  const label = t.nav?.[item.key] || item.label || item.key
                  return (
                    <DesktopNavItem
                      key={item.key}
                      to={resolvePath(item.path)}
                      icon={item.icon}
                      label={label}
                      color={item.color}
                      img={item.img}
                      isDocked={false}
                    />
                  )
                })}
        </div>
      </div>
    </aside>
  )
}

export default DesktopSidebar
