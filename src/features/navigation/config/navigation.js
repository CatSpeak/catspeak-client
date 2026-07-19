import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  MessageCircle,
  GraduationCap,
  Settings,
  HelpCircle,
  Briefcase,
  User,
  CreditCard,
  Newspaper,
  Video,
  Calendar,
  Mic,
  Film,
  Mail,
  BookOpen
} from "lucide-react"

export const navLinks = [
  { key: "community", path: "/community", hasDropdown: true, icon: Home },
  {
    key: "catSpeak",
    hasDropdown: true,
    icon: LayoutDashboard,
    subItems: [
      { key: "catSpeakNews", path: "/cat-speak/news", icon: Newspaper },
      // { key: "worldNews", path: "/cat-speak/discover" },
      { key: "reels", path: "/cat-speak/reels", icon: Film },
      // { key: "video", path: "/cat-speak/video" },
      { key: "letters", path: "/cat-speak/letters", icon: Mail },
      { key: "calendar", path: "/cat-speak/calendar", icon: Calendar },
    ],
  },
  {
    key: "workspace",
    hasDropdown: true,
    icon: Briefcase,
    subItems: [
      { key: "myCourses", path: "/workspace/courses", icon: GraduationCap },
      { key: "myLearning", path: "/workspace/learning", icon: BookOpen },
      { key: "recordings", path: "/workspace/recordings", icon: Mic },
      { key: "reels", path: "/workspace/reels", icon: Film },
      { key: "messages", path: "/chat", icon: MessageCircle },
    ],
  },

  // {
  //   key: "pricing",
  //   path: "/pricing",
  //   hasDropdown: false,
  //   icon: CreditCard,
  // },
  // { key: "cart", path: "/cart", icon: ShoppingCart },
  // {
  //   key: "courses",
  //   hasDropdown: true,
  //   icon: GraduationCap,
  //   subItems: [
  //     { key: "allCourses", path: "/courses" },
  //     { key: "myCourses", path: "/my-courses" }
  //   ]
  // },
]

export const footerLinks = [
  { key: "settings", path: "/setting", icon: Settings }, // Trỏ tới trang Cài đặt tài khoản
  // { key: "help", path: "/help", icon: HelpCircle }
]
