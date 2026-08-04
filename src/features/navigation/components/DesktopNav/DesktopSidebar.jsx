import React, { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { LayoutGroup, motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import { LandingPageIcon } from "@/features/landing/assets"
import { useSidebar } from "@/shared/context/SidebarContext"
import { useLanguage } from "@/shared/context/LanguageContext"
import { useAuth } from "@/features/auth"
import { useRoleOverride } from "@/features/courses/components/RoleSwitcher"
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
  GraduationCap,
  Users,
  Calendar,
  BarChart,
} from "lucide-react"
import DesktopNavItem from "./DesktopNavItem"
import ListItem from "@/shared/components/ui/ListItem"

// Primary Dock Navigation Items
const mainDockItems = [
  { key: "community", icon: Home, path: "/community", hasSublinks: false },
  {
    key: "catSpeak",
    icon: Globe,
    path: "/cat-speak/global-news",
    hasSublinks: true,
  },
  {
    key: "messages",
    icon: MessageCircle,
    path: "/chat",
    hasSublinks: false,
  },
  {
    key: "workspace",
    icon: Briefcase,
    path: "/workspace",
    hasSublinks: true,
  },
]

const secondaryDockItems = [
  {
    key: "learningResources",
    icon: LayoutDashboard,
    path: "/resources",
    hasSublinks: false,
  },
]

const normalizePath = (path) => {
  if (!path) return path
  return path.replace(/^\/(?:zh|en|vi)(?=\/|$)/, "")
}

const getActiveDockSection = (pathname) => {
  if (pathname.startsWith("/setting") || pathname.startsWith("/pricing") || pathname.startsWith("/billing")) return "settings"
  if (pathname.includes("/cat-speak")) return "catSpeak"
  if (pathname.includes("/workspace")) return "workspace"
  if (pathname.includes("/profile")) return "profile"
  if (pathname.includes("/chat")) return "messages"
  if (pathname.includes("/resources")) return "learningResources"
  if (pathname.includes("/community")) return "community"
  return "community"
}

const listContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.14,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const DesktopSidebar = () => {
  const { pathname } = useLocation()
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const { isStudent, isTeacher } = useRoleOverride()
  const { resolvePath, currentLang } = useActiveLink()
  const {
    isDesktopExpanded,
    setIsDesktopExpanded,
    lastSublinks,
    setLastSublink,
  } = useSidebar()

  const activeDockSection = getActiveDockSection(pathname)

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

  const isSettingsPage = pathname.startsWith("/setting") || pathname.startsWith("/pricing") || pathname.startsWith("/billing")

  // Record last selected sublink on route change
  useEffect(() => {
    const cleanPath = normalizePath(pathname)
    if (pathname.startsWith("/setting") || pathname.startsWith("/pricing") || pathname.startsWith("/billing")) {
      setLastSublink("settings", cleanPath)
    } else if (pathname.includes("/cat-speak")) {
      setLastSublink("catSpeak", cleanPath)
    } else if (pathname.includes("/workspace")) {
      setLastSublink("workspace", cleanPath)
    }
  }, [pathname, setLastSublink])

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
        setIsDesktopExpanded(true)
      }
    } else {
      setIsDesktopExpanded(false)
    }
  }

  const getDockItemPath = (item) => {
    return resolvePath(item.path)
  }

  const getFooterLinkPath = (item) => {
    if (item.key === "settings" && lastSublinks?.settings) {
      return resolvePath(lastSublinks.settings)
    }
    return resolvePath(item.path)
  }

  // Determine if secondary sidebar panel should be open
  const isPanelOpen = isDesktopExpanded && currentHasSublinks
  const currentSectionKey = isSettingsPage ? "settings" : activeDockSection

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
          {mainDockItems
            .filter((item) => {
              const teacherTabs = [
                "myCourses",
                "myClass",
                "analytics",
                "schedule",
                "teachingTasks",
              ]
              if (teacherTabs.includes(item.key) && isStudent) return false
              return true
            })
            .map((item) => {
              const Icon = item.icon
              const isActive = activeDockSection === item.key
              const label = t.nav?.[item.key] || item.key
              const targetPath = getDockItemPath(item)

              return (
                <div key={item.key} className="relative group/dock">
                  <Link
                    to={targetPath}
                    onClick={() => handleDockClick(item)}
                    className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${isActive
                      ? "bg-white text-cath-red-700 shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/15"
                      }`}
                  >
                    <Icon />
                    {item.key === "messages" && unreadChatCount > 0 && (
                      <span className="absolute -top-1 -right-1 z-20 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md border-2 border-cath-red-700">
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

          {/* 1 dòng kẻ mờ (Subtle divider line) */}
          <div className="w-8 h-[1px] bg-white/20 my-1 mx-auto shrink-0" />

          {secondaryDockItems.map((item) => {
            const Icon = item.icon
            const isActive = activeDockSection === item.key
            const label = t.nav?.[item.key] || item.key
            const targetPath = getDockItemPath(item)

            return (
              <div key={item.key} className="relative group/dock">
                <Link
                  to={targetPath}
                  onClick={() => handleDockClick(item)}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer ${isActive
                    ? "bg-white text-cath-red-700 shadow-md"
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

        {/* Bottom Dock Links (Settings / Footer) */}
        <div className="flex flex-col gap-3 w-full px-3 pt-4 border-t border-white/20">
          {footerLinks.map((item) => {
            const Icon = item.icon || Settings
            const isActive =
              activeDockSection === item.key ||
              (item.key === "settings" && isSettingsPage)
            const label = t.nav?.[item.key] || item.key
            const targetPath = getFooterLinkPath(item)

            return (
              <div key={item.key} className="relative group/dock">
                <Link
                  to={targetPath}
                  onClick={() => {
                    if (activeDockSection === item.key && isDesktopExpanded) {
                      setIsDesktopExpanded(false)
                    } else {
                      setIsDesktopExpanded(true)
                    }
                  }}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer ${isActive
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

      {/* 2. SECONDARY EXPANDABLE SIDEBAR PANEL */}
      <AnimatePresence initial={false}>
        {isPanelOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 250, opacity: 1 }}
            exit={{
              width: 0,
              opacity: 0,
              transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ type: "spring", stiffness: 580, damping: 38 }}
            className="h-full bg-white border-r border-border overflow-hidden relative z-10 shrink-0"
          >
            <div className="w-[250px] h-full flex flex-col gap-1 px-4">
              {/* Secondary Header */}
              <ListItem className="font-bold">
                <span className="truncate text-lg">
                  {isSettingsPage
                    ? t.nav?.settings || "Settings"
                    : t.nav?.[currentSectionData?.labelKey || activeDockSection] ||
                    currentSectionData?.defaultLabel ||
                    "Navigation"}
                </span>
              </ListItem>

              {/* Content Sub-Links */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`section-${currentSectionKey}`}
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.07 } }}
                  className="flex-1 overflow-y-auto flex flex-col gap-1"
                >
                  <LayoutGroup id={`secondaryNav-${currentSectionKey}`}>
                    {isSettingsPage
                      ? settingNavLinks
                        .filter((item) => {
                          if (item.hideInSidebar) return false
                          if (item.lang && item.lang !== currentLang)
                            return false
                          if (item.isPrivate && !isAuthenticated) return false
                          return true
                        })
                        .map((item) => {
                          const label =
                            t.nav?.[item.key] || item.label || item.key
                          return (
                            <motion.div
                              layout
                              key={item.key}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              className="w-full"
                            >
                              <DesktopNavItem
                                to={resolvePath(item.path)}
                                icon={item.icon}
                                label={label}
                                color={item.color}
                                img={item.img}
                                isDocked={false}
                                sectionId={currentSectionKey}
                              />
                            </motion.div>
                          )
                        })
                      : (currentSectionData?.items || [])
                        .filter((item) => {
                          if (item.hideInSidebar) return false
                          if (item.lang && item.lang !== currentLang)
                            return false
                          if (item.isPrivate && !isAuthenticated) return false

                          const teacherTabs = [
                            "myCourses",
                            "myClass",
                            "analytics",
                            "schedule",
                            "teachingTasks",
                          ]
                          if (teacherTabs.includes(item.key) && isStudent)
                            return false

                          return true
                        })
                        .map((item) => {
                          const label =
                            t.nav?.[item.key] || item.label || item.key
                          let itemPath = item.path
                          if (item.key === "profile" && user) {
                            itemPath = `/workspace/profile/${user.accountId || user.id || ""}`
                          }
                          return (
                            <motion.div
                              layout
                              key={item.key}
                              variants={itemVariants}
                              initial="hidden"
                              animate="visible"
                              className="w-full"
                            >
                              <DesktopNavItem
                                to={resolvePath(itemPath)}
                                icon={item.icon}
                                label={label}
                                color={item.color}
                                img={item.img}
                                isDocked={false}
                                sectionId={currentSectionKey}
                              />
                              {item.key === "analytics" && (
                                <div className="my-1.5 mx-3 border-b border-black" />
                              )}
                            </motion.div>
                          )
                        })}
                  </LayoutGroup>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}

export default DesktopSidebar