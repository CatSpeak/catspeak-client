import {
  Home,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Briefcase,
  User,
  CreditCard,
  Newspaper,
  Calendar,
  Mic,
  Film,
  Mail,
  BookOpen,
  DoorOpen,
  Globe,
  BarChart,
  CalendarDays,
  Compass,
  Folder,
  Ticket,
  Gift,
  Bookmark,
} from "lucide-react"

export const navSections = [
  {
    key: "main",
    labelKey: null,
    items: [
      { key: "community", path: "/community", icon: Home },
      {
        key: "exploreCourses",
        label: "Explore Courses",
        path: "/explore-courses",
        icon: Compass,
      },
      {
        key: "learningResources",
        label: "Resource Hub",
        path: "/resources",
        icon: Globe,
      },
    ],
  },
  {
    key: "catSpeak",
    labelKey: "catSpeak",
    defaultLabel: "Cat Speak",
    maxInitial: 5,
    items: [
      { key: "learningPath", label: "Lộ trình học", path: "/learning-path", icon: CalendarDays },
      { key: "globalNews", path: "/cat-speak/global-news", icon: Globe },
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "events", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "workspace",
    labelKey: "workspace",
    defaultLabel: "My Workspace",
    maxInitial: 5,
    groups: [
      {
        key: "teaching",
        roles: ["Teacher"],
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
          },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          // {
          //   key: "teachingTasks",
          //   path: "/workspace/teaching-tasks",
          //   icon: Briefcase,
          // },
          {
            key: "manageMaterials",
            path: "/workspace/materials",
            icon: Folder,
          },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
            roles: ["Student"],
          },
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          { key: "vocabularyNotebook", label: "Sổ từ vựng", path: "/workspace/vocabulary", icon: Bookmark },
          {
            key: "myCalendar",
            path: "/workspace/my-calendar",
            icon: CalendarDays,
          },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "workspaceReels", path: "/workspace/reels", icon: Film },
          {
            key: "pointsAndOffers",
            path: "/workspace/points-and-offers",
            icon: Gift,
          },
        ],
      },
    ],
    get items() {
      return this.groups.flatMap((g) => g.items)
    },
  },
]

export const dockNavGroups = [
  {
    key: "main",
    items: [
      { key: "community", icon: Home, path: "/community", hasSublinks: false },
      {
        key: "catSpeak",
        icon: Globe,
        path: "/cat-speak/global-news",
        hasSublinks: true,
      },
    ],
  },
  {
    key: "secondary",
    items: [
      {
        key: "exploreCourses",
        icon: Compass,
        path: "/explore-courses",
        hasSublinks: false,
      },
      {
        key: "learningResources",
        icon: LayoutDashboard,
        path: "/resources",
        hasSublinks: false,
      },
    ],
  },
  {
    key: "workspace",
    items: [
      {
        key: "workspace",
        icon: Briefcase,
        path: "/workspace",
        hasSublinks: true,
      },
    ],
  },
]

export const TEACHER_ONLY_TABS = [
  "dashboard",
  "myCourses",
  "myClass",
  "analytics",
  "schedule",
  "teachingTasks",
  "manageMaterials",
]

export const isNavItemVisible = (
  item,
  {
    currentLang,
    isAuthenticated,
    activeRole,
    isTeacher,
    isStudent,
    isHorizontal = false,
  } = {},
) => {
  if (!item) return false
  if (item.hideInSidebar) return false
  if (item.lang && currentLang && item.lang !== currentLang) return false
  if (isHorizontal && item.showOnHorizontalBar === false) return false
  if (item.isPrivate && !isAuthenticated) return false
  if (item.roles && activeRole && !item.roles.includes(activeRole)) return false
  if (TEACHER_ONLY_TABS.includes(item.key)) {
    if (isStudent) return false
    if (isTeacher === false) return false
  }
  return true
}

export const getActiveDockSection = (pathname) => {
  if (!pathname) return "community"
  if (
    pathname.startsWith("/setting") ||
    pathname.startsWith("/pricing") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/refunds")
  ) {
    return "settings"
  }
  if (pathname.includes("/cat-speak")) return "catSpeak"
  if (pathname.includes("/profile")) return "profile"
  if (pathname.includes("/explore-courses")) return "exploreCourses"
  if (pathname.includes("/resources")) return "learningResources"
  if (pathname.includes("/workspace")) return "workspace"
  if (pathname.includes("/community")) return "community"
  return "community"
}

export const navLinks = [
  {
    key: "community",
    path: "/community",
    icon: Home,
  },
  {
    key: "catSpeak",
    hasDropdown: true,
    icon: Globe,
    subItems: [
      { key: "globalNews", path: "/cat-speak/global-news", icon: Globe },
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "events", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "horizontalBar-secondary",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
  {
    key: "exploreCourses",
    label: "Explore Courses",
    path: "/explore-courses",
    icon: Compass,
  },
  {
    key: "learningResources",
    label: "Resource Hub",
    path: "/resources",
    icon: LayoutDashboard,
    isPrivate: true,
  },
  {
    key: "horizontalBar-workspace",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
  {
    key: "workspace",
    hasDropdown: true,
    icon: Briefcase,
    requiresAuth: true,
    groups: [
      {
        key: "teaching",
        roles: ["Teacher"],
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
          },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          // { key: "teachingTasks", path: "/workspace/teaching-tasks", icon: Briefcase },
          {
            key: "manageMaterials",
            path: "/workspace/materials",
            icon: Folder,
          },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          {
            key: "dashboard",
            path: "/workspace/dashboard",
            icon: LayoutDashboard,
            roles: ["Student"],
          },
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          { key: "vocabularyNotebook", label: "Sổ từ vựng", path: "/workspace/vocabulary", icon: Bookmark },
          {
            key: "myCalendar",
            path: "/workspace/my-calendar",
            icon: CalendarDays,
          },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "reels", path: "/workspace/reels", icon: Film },
          {
            key: "pointsAndOffers",
            path: "/workspace/points-and-offers",
            icon: Gift,
          },
        ],
      },
    ],
    get subItems() {
      return this.groups.flatMap((g) => g.items)
    },
  },
]

export const settingNavLinks = [
  { key: "accountInfo", path: "/setting/account", icon: User, roles: ["Student", "Admin"] },
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "instructor", path: "/setting/instructor", icon: GraduationCap },
  { key: "billing", path: "/billing", icon: CreditCard },
  { key: "systemConfig", path: "/setting/system", icon: Settings },
]

export const footerLinks = [
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "settings", path: "/setting", icon: Settings },
]
