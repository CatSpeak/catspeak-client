import {
  Home,
  LayoutDashboard,
  GraduationCap,
  Settings,
  HelpCircle,
  Briefcase,
  User,
  CreditCard,
  Newspaper,
  Calendar,
  Mic,
  Film,
  Mail,
  BookOpen,
  Video,
  MessageCircle,
  DoorOpen,
  Globe,
} from "lucide-react"

export const navSections = [
  {
    key: "main",
    labelKey: null,
    items: [
      { key: "community", path: "/community", icon: Home },
      {
        key: "learningResources",
        label: "Resource Hub",
        path: "/resources",
        icon: Globe,
      },
      {
        key: "messages",
        label: "Chat",
        path: "/chat",
        icon: MessageCircle,
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
      { key: "calendar", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "workspace",
    labelKey: "workspace",
    defaultLabel: "My Workspace",
    maxInitial: 5,
    items: [
      { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
      { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
      { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
      { key: "recordings", path: "/workspace/recordings", icon: Mic },
      { key: "workspaceReels", path: "/workspace/reels", icon: Film },
      { key: "events", path: "/workspace/events", icon: Calendar },
    ],
  },
]

export const navLinks = [
  { key: "community", path: "/community", hasDropdown: true, icon: Home },
  {
    key: "learningResources",
    label: "Resource Hub",
    path: "/resources",
    icon: Globe,
    isPrivate: true,
  },
  {
    key: "messages",
    label: "Chat",
    path: "/chat",
    icon: MessageCircle,
    isPrivate: true,
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
    subItems: [
      { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
      { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
      { key: "myRooms", path: "/workspace/rooms", icon: DoorOpen },
      { key: "recordings", path: "/workspace/recordings", icon: Mic },
      { key: "reels", path: "/workspace/reels", icon: Film },
      { key: "events", path: "/workspace/events", icon: Calendar },
    ],
  },
  {
    key: "horizontalBar",
    label: "Horizontal bar",
    isHorizontalBar: true,
    showOnHorizontalBar: false,
  },
]

export const settingNavLinks = [
  { key: "accountInfo", path: "/setting/account", icon: User },
  { key: "instructor", path: "/setting/instructor", icon: GraduationCap },
  { key: "systemConfig", path: "/setting/system", icon: Settings },
]

export const footerLinks = [
  { key: "pricing", path: "/pricing", icon: CreditCard },
  { key: "settings", path: "/setting", icon: Settings },
]
