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
          { key: "dashboard", path: "/workspace/dashboard", icon: LayoutDashboard },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          { key: "teachingTasks", path: "/workspace/teaching-tasks", icon: Briefcase },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          { key: "myCalendar", path: "/workspace/my-calendar", icon: CalendarDays },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "workspaceReels", path: "/workspace/reels", icon: Film },
          { key: "manageMaterials", path: "/workspace/materials", icon: Folder },
        ],
      },
    ],
    get items() {
      return this.groups.flatMap((g) => g.items)
    },
  },
]

export const navLinks = [
  {
    key: "community",
    path: "/community",
    icon: Home,
  },
  {
    key: "catSpeak",
    hasDropdown: true,
    icon: LayoutDashboard,
    subItems: [
      { key: "globalNews", path: "/cat-speak/global-news", icon: Globe },
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "calendar", path: "/cat-speak/calendar", icon: Calendar },
    ],
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
          { key: "dashboard", path: "/workspace/dashboard", icon: LayoutDashboard },
          { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
          { key: "teachingTasks", path: "/workspace/teaching-tasks", icon: Briefcase },
          { key: "analytics", path: "/workspace/analytics", icon: BarChart },
        ],
      },
      {
        key: "general",
        items: [
          { key: "profile", path: "/workspace/profile", icon: User },
          { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
          { key: "myCalendar", path: "/workspace/my-calendar", icon: CalendarDays },
          { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
          { key: "recordings", path: "/workspace/recordings", icon: Mic },
          { key: "reels", path: "/workspace/reels", icon: Film },
          { key: "manageMaterials", path: "/workspace/materials", icon: Folder },
        ],
      },
    ],
    get subItems() {
      return this.groups.flatMap((g) => g.items)
    },
  },
  {
    key: "horizontalBar",
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
    icon: Globe,
    isPrivate: true,
  },
]

export const settingNavLinks = [
  { key: "accountInfo", path: "/setting/account", icon: User },
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "instructor", path: "/setting/instructor", icon: GraduationCap },
  { key: "billing", path: "/billing", icon: CreditCard },
  { key: "systemConfig", path: "/setting/system", icon: Settings },
]

export const footerLinks = [
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "settings", path: "/setting", icon: Settings },
]